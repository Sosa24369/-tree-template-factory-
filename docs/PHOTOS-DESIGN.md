# Photo control — slot-first design (Studio v3, Phase 1b)

**Design only. Nothing here is built.** It answers the two complaints diagnosed in Stage 1:
photos cannot be put where they belong, and what ships does not look like what the studio
showed. Evidence for every claim is in `docs/BUILD-LOG.md` (Phase 1b).

## The model: slots hold photos

A page has slots. Slots hold photos. Today placement is *array position* — the only lever
is reordering, and the studio's own list of "where this lands" ignores the fallback
cascade, so on J Valdez it hides the hero plate of a live ad page. The record gains an
explicit map, per template:

```jsonc
"photoSlots": {
  "removal-a": { "hero-plate": "<photoId>", "mosaic.1": "<photoId>", "hero-proof.2": "<photoId>" },
  "trimming-a": { "hero-band.1": "<photoId>" }
}
```

Optional, sparse, and per template. A slot absent from the map is **auto-filled**.

**Photo ids need no migration.** Every `src` already carries a content hash
(`hero-photo-1-223e4399.webp`), so the id is `photo.id ?? photo.src`. New uploads get an
explicit `id`. No script rewrites any record.

**Sets become tags.** `photos.removal / .trimming / .storm / .generic` stay exactly as they
are on disk — they are now read as *tags on one client library*, not as containers a
template indexes. Array order remains the auto-fill order, so reordering still works and
still means something.

**Bounded slots get keys; unbounded ones do not.** The contract gains `cells: <n> | 'all'`.
A slot with a fixed cell count (`hero-proof` = 2, `mosaic` = 5, `service-photo` = 3) gets
keys `slotId.1 … slotId.n`. A slot that consumes everything (`rail`, `agnostic/shot`) has
no explicit keys — its list *is* the library order, reordered in place. This keeps the UI
finite instead of inventing an unbounded key space.

## Auto-fill: reproduce today exactly, then get out of the way

One resolver, `resolvePlacement(client, templateId)`, returns every slot with its photo and
the reason (`explicit` | `auto`). It is the only place placement is decided. Today there
are three disagreeing implementations — each template's slicing, the contract's English
`pick` strings, and `slotsForPhoto()`'s regexes over those strings. All three collapse into
this one, and `pick` becomes machine-readable rather than prose a regex re-parses.

The auto-fill rule, which must reproduce current output **byte for byte**:

1. Take the slot's declared set. Apply the cascade in `lib/photos.ts` unchanged:
   `removal → generic → storm → trimming`, `trimming → generic → removal → storm`,
   `storm → generic → removal → trimming`, `generic → removal → trimming → storm`.
2. Drop video entries (`partitionMedia`) **before** slicing, never after.
3. Slice by the slot's declared rule (`first`, `2nd`, `first n`, `last 3`, `middle share`,
   `the rest`, `all`).
4. **The mosaic keeps its quirk, in the resolver.** `removal-a/mosaic` reads
   `photos.generic` *directly* — bypassing the cascade, and unsliced, so a generic set of
   23 renders 23 cells — and only falls back to `partitionMedia(photosFor(removal)).stills
   .slice(0, 5)`. This is not tidy, and tidying it would change a live page, so it is
   declared in the contract as `source.mode: 'direct-then-cascade'` and reproduced. It is
   the one slot whose behaviour is a documented exception rather than a rule.

An explicit assignment overrides steps 1–4 for that slot only. Auto-filled slots are
labelled **auto** in the studio; assigning a photo turns the label **explicit**.

> Depends on `78860a5` (the `.mp4`-in-`<img>` fix). "Today's output" means the output with
> that commit in, since it changes `removal-a/mosaic` on Texas Tree Tops. If that commit is
> rejected, the resolver must reproduce the video-in-a-cell behaviour instead.

## One focal point per photo

H1 was **refuted** in Stage 1: the pipeline already remaps the focal into master
coordinates after its 4:3 crop (`((fx·iw) − left) / cw`, verified against the BUILD-LOG
case). There is no double crop and no re-architecture needed. So:

**Derivatives stay uncropped resizes of one 4:3 master, and every slot crops in CSS via
`object-position`.** The alternative — cutting per-slot derivatives server-side — would
multiply 37 slots by 4 widths per photo, and would have to re-cut on every reorder. Keeping
one master means Frame's preview and the page run *the same* CSS primitive on the *same*
file, which is the property that makes the preview trustworthy. The 4:3 master crop stays:
it is what keeps `frame` grids even.

**The resolver always emits `object-position` explicitly** — from the focal point when set,
otherwise from a `defaultPosition` the slot declares in the contract. This is what kills
H2. Today the removal-a hero plate falls back to a CSS rule (`object-position: center 35%`)
that Frame does not know about; Frame previews `50% 50%`, a **37 CSS px** error on J
Valdez's desktop hero. When the number always comes from the contract, page and preview
cannot disagree, because there is one number.

Frame shows the crop for **every slot the photo currently feeds** — following the cascade,
named, at all three breakpoints, with no `slice(0, 4)` truncation and no filter to `cover`
policy only.

## `sizes` belongs to the slot contract

Stage 1's H4 was **confirmed** and is the biggest cause of "the size looks wrong": `sizes`
is hand-written in each template and understates the real box by up to **4.8×** (the hero
plate declares `55vw`; it renders at `100vw`), so the browser fetches a candidate a quarter
the width it needs.

`sizes` is a fact about the slot's box, and the contract already holds measured box widths
at 390 / 820 / 1440. So the contract gains a `sizes` field:

- **Derived by default** from `renders`:
  `(max-width: 767px) <mobile>px, (max-width: 1023px) <tablet>px, <desktop>px`.
- **Overridable** where a viewport expression is exact rather than approximate — the hero
  plate is genuinely `100vw`, so it declares that.
- **Guarded**: a new assertion renders each slot at the three breakpoints and fails if the
  declared `sizes` evaluates more than 10% below the measured box. That is the check that
  would have caught this.

Templates stop carrying `sizes` literals; they read the slot's.

## Upload: file → optimised → placed

No mandatory modal.

1. Drop or choose **one or many** files, on the library or directly on a slot.
2. The pipeline runs as built: auto-rotate, strip metadata, 4:3 master, 400/800/1200/1600
   WebP, refuse under-minimum and HEIC with the number.
3. **Default focal point: centre.** The installed sharp (0.35.3) *does* expose
   `attentionX` / `attentionY` on the output `info` — but a controlled probe (a white patch
   at a known position on a dark 1200 × 900 field) showed two problems: they are
   `undefined` whenever the requested resize needs no crop, and where they were reported
   the values reconciled with neither the source nor the scaled coordinate space
   (`attentionX: 574` against a 400 px-wide scaled image; true normalised centre 0.75).
   The space is undocumented. So attention is **not** wired in on this pass: default to
   centre, say so on the tile, and keep it as a later enhancement behind a spike that
   establishes the coordinate space against real photographs.
4. The photo lands in the target slot, or the first empty auto slot, showing its **real
   crop thumbnail** and a status pill.
5. **Frame is a button on the tile.** Refinement, never a gate.

## Placement controls

In the slot list for the selected template, in page order: **move up**, **move down**,
**swap with…**, **remove from slot** (the photo stays in the library), **choose from
library**. Drag reorder is allowed *in addition* — the arrows are the fallback, and the
drag primitive now works (`0e2f9f2`: the handle keeps pointer capture and hit-tests with
`elementFromPoint`, because capture suppresses `pointerenter` on the other cards and on
touch capture is implicit and cannot be declined).

## Status, computed once at upload and stored

| Status | Meaning |
|---|---|
| **OK** | meets the slot minimum in 4:3 |
| **Under spec** | renders, will look soft — with the reason and the number ("800 px wide, needs 1200 — 1.5× upscaled on retina") |
| **Replace** | a composite, a video in a photo set, or below the hard minimum — with the reason |

The `image-spec` guard reads the stored status rather than recomputing it.

## Guard

`image-spec` additionally asserts: every explicit assignment points at a photo that exists
in the library; every slot resolves to something or is legitimately empty; and no slot on a
non-demo client resolves to a **Replace** photo, outside the existing legacy allowance
(legacy imports stay *reported*, not failed — 85 warnings today; failing them would block
every publish until 36 photographs were replaced).

## Migration

None. No script rewrites records. Old records render through auto-fill, byte-identically.
The first time an assignment is changed, the studio writes `photoSlots` for **that template
only**.

## Acceptance criteria

1. New photo to placed on a page: **≤ 3 clicks**.
2. Every slot for the selected template visible in **one list, in page order**; each
   thumbnail equals the shipped crop within a few pixels at 390, 820 and 1440.
3. Moving a photo to another slot: **one action**.
4. **No mandatory modal** anywhere in the upload path.
5. The four live pages — `/p/texas-tree-tops/removal-a`, `/p/texas-tree-tops/storm-a`,
   `/p/j-valdez/removal-a`, `/p/j-valdez/trimming-a` — **may change bytes only through the
   live-campaign gate**, and only when a headless screenshot diff at 390, 820 and 1440
   shows:
   - **layout pixel-identical** — every image box and section box in the same place at the
     same size; any geometry change is a stop; and
   - **image content differing only where a larger srcset candidate was selected**, with
     the gate naming those slots and showing before/after.

   Any other pixel difference is a stop. See the note below on why the second clause
   exists.
6. Public JS and CSS do not grow: placement resolves at prerender.
7. Frame's preview and the built page report the same `object-position` for every slot,
   focal set or not.
8. Declared `sizes` is within 10% of the measured box at all three breakpoints, every slot.

### Why criterion 5 carves out the srcset candidate

The instruction was "byte-identical", then "pixel-identical at 390, 820 and 1440". Measured
against the current live records, **pixel-identical alone would block the H4 fix on the
slots where it works.** Correcting `sizes` changes which file the browser downloads:

| slot | today's `sizes` | file today | file with correct `sizes` | |
|---|---|---|---|---|
| removal-a hero plate, J Valdez @1440 | `55vw` | `hero-photo-1.webp` | `hero-photo-1.webp` | same |
| removal-a hero plate, Texas Tree Tops @1440 | `55vw` | `gallery-02.webp` | `gallery-02.webp` | same |
| removal-a service strip, J Valdez @820 | `22vw` | `work-photo-3-400w.webp` | `work-photo-3.webp` | **changes** |
| removal-a mosaic cell 1, J Valdez @1440 | `22vw` | `hero-photo-1-800w.webp` | `hero-photo-1.webp` | **changes** |

The hero plate is unaffected only because the masters are too small to offer a bigger
candidate — the largest is already being chosen. Where a bigger candidate *does* exist, the
browser fetches it and the photograph renders **sharper**. That is not a regression to be
blocked; it is the entire point of the fix, and it will differ under any pixel diff.

So the gate distinguishes the two kinds of difference. **Geometry is the invariant** — no
box may move or resize, which is what "the page did not change" actually means for an ad
landing page. Sharpness from a correctly-sized candidate is shown and approved, per slot,
rather than forbidden. If the owner prefers the strict reading, H4 cannot ship on live
clients and criterion 8 has to be scoped to demo records only.
