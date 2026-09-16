# Batch report — four pages, one approval

Branch `batch/four-pages`, 45 commits on top of `main` (`3c685d1`, the last deploy record),
fast-forwardable. **Built and verified. Nothing pushed, nothing published.** The publish
guard (`.claude/hooks/block-publish.py`, entries in `.claude/settings.json` and
`~/.claude/settings.json`) is still active and comes out only after this approval.

Operative documents: `four-page-spec.md` (the owner's spec), `amendment.md` (unattended run,
one gate), `removal-a-scope.md` (page 1's approved scope), `decisions.md` (28 decisions +
the hook log). One folder per page holds every piece of evidence named in the amendment.

## At a glance

| page | items | Lighthouse before → after (score / LCP / image bytes, mobile, trackers blocked) | phone/GTM compare | guards | folder |
|---|---|---|---|---|---|
| 1 · J Valdez removal-a (PROTECTED) | R1 hero, R2 proof strip, R3 grid, R4 cards, R5/S1 reviews, S2 areas | 98 / 1.85 s / 602,973 B → **99 / 1.72 s / 381,865 B** | 55 pages, zero | 12/12 | [j-valdez-removal-a/](j-valdez-removal-a/summary.md) |
| 2 · J Valdez trimming-a (PROTECTED) | P1 seam, S1 reviews, S3 grid | 98 / 1.85 s / 87,834 B → **98 / 1.85 s / 87,834 B** (unchanged) | zero | 12/12 | [j-valdez-trimming-a/](j-valdez-trimming-a/summary.md) |
| 3 · Texas Tree Tops removal-a (PROTECTED) | T1 reviews, T2 areas, T3 sixth cell, T4 (not real), T5 alts | 98 / 1.90 s / 441,941 B → **98 / 1.90 s / 386,105 B** | zero | 12/12 | [texas-tree-tops-removal-a/](texas-tree-tops-removal-a/summary.md) |
| 4 · Texas Tree Tops storm-a (PROTECTED) | T6 reviews, T7 areas (shared component) | 99 / 1.74 s / 13,990 B → **99 / 1.73 s / 13,990 B (unchanged)** | zero | 12/12 | [texas-tree-tops-storm-a/](texas-tree-tops-storm-a/summary.md) |

- **Bundle**: +1,527 B gzip across the batch (JS +1,841, CSS −314; ceiling 3,072).
- **Final compare** (`texas-tree-tops-storm-a/phone-gtm-compare.txt`): 55 pages, **zero
  differences** — 183 `tel:` hrefs, 373 `data-dni` attributes, 367 visible numbers, 68 GTM ids.
- **Prerender diff** (`texas-tree-tops-storm-a/prerender-diff.txt`, hash-normalised): 28 of
  55 pages change; every row carries its reason; the four protected pages are the targets
  of their own page.
- **Criterion 8** (declared `sizes` within 10% of the rendered box at 390/820/1440, DPR 2):
  clean on every changed page except two pre-existing misses left as found (decisions 14):
  removal-b's tiles at 390/820 (J Valdez, Summit) and Summit's removal-a rail.
- No stop condition in §3 of the amendment was met. No decision count reached five on a page
  (page 4 has four: 25–28).

## The hard constraints, proven on the final build

1. **Every phone number, `tel:` href, `data-dni` and GTM id is byte-identical** on all 55
   pages (compare above). The three client records differ from `main` only in `photos` and
   `photoSlots`; `reviews`, `phone`, `tracking`, `copyOverrides`, `name`, `serviceAreaList`
   and `reviewsSource` are identical (checked field by field from git). The (214) 230-9731
   painted on trimming-a's CTAs at runtime is Google's call-forwarding number — untouched.
2. **The truck (`hero-photo-2`) and the yard sign (`gallery-slide-5`) are in every slot they
   occupy on live**: the truck on the same seven J Valdez pages (removal-a ×3 slots — proof
   cell 1, blurb, rail; trimming-a hero band; trimming-b ×2; trimming-c ×2; agnostic;
   removal-b ×2; removal-c ×2), the sign on the same six (removal-a rail, trimming-a,
   trimming-c, agnostic, removal-b, removal-c). This was nearly lost — see decisions 28.
   The painted number in the truck photo stays; it is listed, not removed.
3. **No review text written, lengthened or paraphrased.** Layout and the Google button only.
4. **Headline and body copy unchanged.** The one new string is the button label
   `'why.reviewsLink': 'Read all our reviews on Google'`, named by R5 (page 1); the
   copy-parity guard (a → c) passes.
5. The studio was never opened; the stored credential and the Railway token were never
   used from a file. Every local page load ran with the tracker block (no GTM/CallRail
   request completed in any probe or Lighthouse run).

## Page 1 — J Valdez removal-a

Live reference e3394aa; final page-1 build `7ca924e`; evidence regenerated on the batch's
final build where the diff and compare are global.

- **R1** hero plate emptied on the record (`photoSlots.removal-a.hero-plate: ''`): solid
  `#112d25` behind the white H1 (14.73:1); the prerender preloads the logo instead of a
  photo when the LCP slot is empty (prerender.mjs `lcpImage()`).
- **R2** proof strip: cell 1 the truck framed by a focal point saved on the photograph
  (`focal {x:0.45, y:0.48}`), cell 2 the bucket-truck original IMG_1119 (the composite is gone).
- **R3** Restoration grid: one rule, six uniform 4:3 cells, 2 columns to 767 / 3 from 768,
  from the originals on this Mac — felled trunk (IMG_1122), stump cut (IMG_1120), bucket over
  water (NF4), boom over house (NF3, the 1600-wide lead), downed limbs (IMG_1124), log rounds
  (IMG_1126); ingested through the studio's own pipeline (4:3 crop on the focal point, WebP,
  400/800/1200/1600 variants). Rail, services cards and blurb pinned to what they showed
  ("grid only, rest unchanged").
- **R4** services cards 4:3, 0 dead space (was up to 362 px at 820 on page 3's twin).
- **R5/S1** review cards shown in full (0 of 9 cut, was 5), whole cards 1/2/3 per view,
  sized to their text, plus the Google reviews button from `reviewsSource.profileUrl`.
- **S2** Areas We Serve is the static wrapped list, 10 chips once.
- Lighthouse 98 → 99, LCP 1.85 → 1.72 s, image bytes 602,973 → 381,865.
- Evidence: before/after for hero, restoration, services, why, areas at 390/820/1440;
  `crops/` for every grid cell; compare, guards, criterion 8, diff, bundle, Lighthouse
  before/after JSON + summary.

## Page 2 — J Valdez trimming-a

Final build `66c3db4`.

- **P1** the ~300 px of white between the Recent jobs band and the offer cards was two
  section paddings stacking (a regression from Group B's B9/B10); now one pad, 54/66/108 px
  at 390/820/1440 — the seam rule, neither section touched.
- **S1** whole review cards at every width, no stretch (`align-items: flex-start`), sized to
  their text; the same shared rule scoped to trimming-a, removal-a and storm.
- **S3** "Done clean, done right": six uniform 4:3 cells, no feature tile; the before/after
  composite and the empty-lot shot replaced by originals — limbs lowered over a roof line
  (IMG_1117), the lakeside slope (PXL_…145030926), the creek-side climber (IMG_1116) — the
  headline's "roof & gutter branch clearance", literally. Hero band and Recent jobs band
  pinned unchanged (the truck stays in the band).
- Lighthouse unchanged: 98 / 1.85 s / 87,834 B. Criterion 8 clean on 309 boxes.
- Evidence: before/after for gallery+benefits (P1), why (S1), done-right (S3), longform;
  `crops/`; the rest of the set.

## Page 3 — Texas Tree Tops removal-a

- **T1 / T2 / R4 / R5** came with page 1's template work: 0 of 9 reviews cut (was 5),
  whole cards, the Google button; 25 chips once, no mask (was 50 behind a mask); cards 4:3.
- **T3** the grid closed at six: cell 6 = `restoration-photo-1` (a climber taking a dead
  tree down with a chainsaw — the only removal-library photographs that fill a 353 px cell
  at 2× are the five `restoration-photo-*`; decisions 22).
- **T4** measured not real: the rail's first item is reachable at 390/820/1440 on live
  (x = 20 / 41 / 174 px); no change (decisions 23).
- **T5** the three shared stock photographs describe themselves (record alts, four
  instances here, also Summit's twelve); `slotAlt()` prefers a record alt before composing;
  the Benefits artwork — Texas Tree Tops' own photograph — is described as the picture; a
  new build guard fails any `_shared/`/`_template/` entry with no alt or one naming the
  client (decisions 24).
- Lighthouse 98 / 1.90 s / 441,941 B → 98 / 1.90 s / 386,105 B (the marquee's 55.8 KB
  background art is gone with the marquee).

## Page 4 — Texas Tree Tops storm-a

- **T6** the scoped slider rule reaches `.storm`: 0 of 9 reviews cut (live: 5 of 9 and a
  card sliced at the right edge), whole cards 1/2/3, no partial card. No reviews button on
  this template — the spec's S1 here is layout.
- **T7** `components/ServiceAreasCarousel.tsx` and its stylesheet rewritten once, as ruled:
  one static wrapped `<ul>`, every city once, deduplicated, `role="group"` kept, no mask,
  no animation, no tabbable track; the chip rule untouched; class root and export names
  kept so the six importing templates need no edit. Measured live before: 50 chips for 25
  cities, 38–48 clipped at any instant, first chip never reachable. After: 25 chips once,
  none clipped, first reachable — and the same on all 21 pages the component reaches (below).
- **No S3**: the work grid's three tile shapes are by design and the grid closes cleanly;
  the 800×600 storm set on this Mac is under the 1200 minimum (decisions 26).
- Lighthouse 99 / 1.74 s / 13,990 B → 99 / 1.73 s / 13,990 B, flat (re-run on the final build after decisions 28); the LCP is the hero body text, so this page's numbers do not move
  with its images.

## Reach beyond the four pages (the other 24 rows of the 28-page diff)

| cause | pages |
|---|---|
| T7, the shared areas component (same markup change on each; measured at 390/820/1440) | Texas Tree Tops storm-b, storm-c, agnostic, removal-b, trimming-b, removal-c, trimming-c; J Valdez agnostic, removal-b, removal-c, trimming-b, trimming-c; Summit agnostic, removal-b, trimming-b, removal-c, trimming-c, storm-a, storm-b, storm-c |
| page 1's removal-a template work (grid rule, 4:3 cards, static areas, reviews button, S1) | Summit removal-a (226 lines; demo, no GTM) |
| a → c copy parity: the Google reviews button | Texas Tree Tops removal-c, J Valdez removal-c (Summit has no reviews URL, so no button) |
| the truck's focal point → `object-position` on its cells | J Valdez trimming-b, trimming-c, agnostic, removal-b, removal-c |
| T5 alt text only | Texas Tree Tops trimming-a, Summit trimming-a (6 lines each) |
| the empty hero plate → logo preload | J Valdez removal-a/thank-you (2 lines) |

CSS-only reach (HTML byte-identical, so not in the diff): the P1 seam and S3 grid rule on
trimming-a ×3; the scoped S1 slider on removal-a ×3 and storm-a ×2; the wrapped-chip rule
on the 21 T7 pages.

## Decisions taken in your place (full text in `decisions.md`)

1–5 before the first edit: publish mechanism verified (direct upload, not git-connected);
six grid cells, not five; import removal photos without touching rail/services; IMG_1119
for the proof cell; hero plate emptied on the record, not the template. 7 the hook's false
positives and the fix. 8 image-spec: the 1600 px original leads the set; keys past a fixed
slot count are accepted. 9 no-stretch on the unclamped cards. 10–11 repeats from the rail
and the double logo preload: pre-existing, left. 12 / 21 removal-c and trimming-c work
grids declare their `sizes` (criterion 8, pre-existing). 13 grid breakpoint 768 as live.
14 pre-existing criterion-8 misses outside the targets, left and listed. 15 the 10-vs-8
cities mismatch is in the record's own copy override — yours to decide. 16 P1 is a regression
from the last ship; fixed at the seam. 17 S1 is one layout on the three batch templates.
18–19 S3 placement and pins. 20 trimming-a's blurb is `grid[1]`, not the `longform` slot
(contract mismatch, pre-existing). 22 the sixth cell. 23 T4 not real. 24 T5 details.
25 T7 as a rewrite, not a CSS override. 26 storm-a keeps its grid. 27 the diff method.
**28 J Valdez agnostic, removal-b and removal-c pinned back to their live photos** — page 1's
new removal set had cascaded into them and dropped the truck and the sign from three pages;
caught at the close of page 4 by re-checking constraint 2 page by page, fixed on the record.

## Left alone, for your list (pre-existing, outside the batch)

- Texas Tree Tops removal-a: the hero plate `gallery-02` is a 680 px file painted at
  1440×1192 (4.2× at 2×); the grid's five `gallery-0x` photos are 382–680 px files (2–3×).
  Legacy imports under the guard's allowance; the fix is originals from Texas Tree Tops.
- `assets/texas-tree-tops/bg-section-*` template art (~36 KB) loads on every client's
  removal-a, J Valdez included; `_template/removal-a/benefit-strip-art` is Texas Tree Tops'
  own photograph (now with a descriptive alt).
- The logo is preloaded twice on every text-hero page (prerender + React's SSR float; one
  fetch). Photos repeat on removal-a from the rail that shows the whole library.
- J Valdez trimming-a: the body copy names 8 of the 10 chips (Forney, Lake Ray Hubbard are
  chips only) — record copy, ads tuned to it. The Longform contract mismatch (decisions 20).
  Hero band cell 1 (`gallery-slide-3`) also sits in the Recent jobs band — the repeat you
  accepted on 09-15 until real photos arrive.
- Texas Tree Tops storm-a: three tile shapes by design; no usable storm photographs on this
  Mac (800×600).
- Ingest is WebP-only (no JPEG/AVIF fallback) — the studio pipeline's own rule.
- Criterion 8: removal-b tiles at 390/820 (declares 176/246 px for 350/489 px boxes) and
  Summit's removal-a rail.

## What only you can supply

1. **Reviews**: 6–9 per profile at 150–350 characters. Today the records hold 9 each — J Valdez
   at 38–448 characters, Texas Tree Tops at 97–679 — and the layout is built around them.
2. **Texas Tree Tops removal originals** ≥ 1600 px for the removal-a hero plate and grid
   (the Mobile Makeover set is their trimming work — wrong service there).
3. **Texas Tree Tops storm originals** ≥ 1600 px (tree on a roof/fence/car, root plate,
   crews at a storm job) if storm-a's grid is ever to carry storm photographs.
4. Whether J Valdez trimming-a's body copy should name Forney and Lake Ray Hubbard.
5. Motion for Areas We Serve — the later, shared item you named.

## The publish guard: three firings, none a publish

All three were the hook's regex matching a string inside a non-publishing command: the
rails commit message, a pipe-test line, and a read-only `grep` while writing this report
(hook log at the end of `decisions.md`). No publish, deploy or push was attempted; the
dry-run push to main and a real deploy attempt in the proof run were both refused as designed.

## After your approval, in this order

1. You reply with the approval (or the changes you want first).
2. I remove the guard — the `PreToolUse` entry in `.claude/settings.json` and the mirrored
   one in `~/.claude/settings.json`, and the hook script — in one commit.
3. Fast-forward `main` to the branch and push it (`git merge --ff-only batch/four-pages`,
   45 commits; the studio on Railway pulls `main`).
4. Publish — your call between: **(a)** you click Publish in the studio; its protected-route
   check will ask you to confirm each of the four routes, which is expected (all four are the
   targets) and is the built-in second look; or **(b)** on your word I build from `main` and
   run the Pages direct upload from this Mac. (a) keeps me out of the studio, as agreed.
5. I re-run the 55-page compare against the live domain and Lighthouse on the four live URLs,
   and write the deploy record in the BUILD-LOG.

Stage 4 stays paused; the 4b prediction is not written.
