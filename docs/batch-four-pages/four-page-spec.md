# Four live ad pages — photos, layout, speed, conversion. Scope, then build, one gate per page.

(Owner's message of 2026-09-16, saved verbatim. The later amendment — amendment.md —
replaces its section E / gating: all four pages run unattended with one gate at the end.)

Review every page as three people at once: a front-end engineer who
owns Core Web Vitals, a designer who owns crops and spacing, and a
Google Ads landing-page reviewer who owns what happens above the fold.
Where those three disagree, say so and pick the option that converts.

Pages, in this order. Hold at the live-campaign gate after each one;
I approve one diff before you start the next. Never batch all four
into one publish.

1. https://tree-template-factory.pages.dev/p/j-valdez/trimming-a
2. https://tree-template-factory.pages.dev/p/j-valdez/removal-a
3. https://tree-template-factory.pages.dev/p/texas-tree-tops/removal-a
4. https://tree-template-factory.pages.dev/p/texas-tree-tops/storm-a

Stage 4 stays paused; don't write the 4b prediction yet.

## Constraints that hold for the whole task

**Every phone number stays byte-identical** — every `tel:` href,
visible number, `data-dni` attribute and GTM id, in the records and in
the rendered HTML. Conversion tracking is set up correctly and this
task doesn't touch it. Prove it with the 55-page compare at zero
differences before each gate. The **(214) 230-9731** painted on the
trimming-a CTAs right now is Google's call-forwarding number swapping
in at runtime, not a defect — leave it.

Keep `hero-photo-2` and `gallery-slide-5` (the truck and the yard sign)
in every slot they occupy. Painted phone numbers inside photographs are
not a defect for this task; list them, don't remove the photos.

Never write, lengthen or paraphrase a review. Review text is only ever
the client's actual Google reviews, pasted by me, verbatim, with the
real first name. Until I paste them, leave the current text in place
and build the layout around it.

Headline and body copy stay as they are unless an item below names the
copy. The ads are tuned to it.

## Photo sources — the folder on this Mac

Everything is under `~/Desktop/valdez tree trimming /` (the folder
name ends in a space). I've attached my four screenshots of
trimming-a; treat them as the defect reference, not the design target.

| Folder | Files | Client / service | Verdict |
| :-- | :-- | :-- | :-- |
| `IMG_1116.jpg` … `IMG_1126.jpg` (root) | 11 JPG, 1320 × 1682–1984 | J Valdez, originals off the phone | **Use — passes the 1200 minimum** |
| `PXL_*.JPG` (root) and `Retouching…/untouched triming/PXL_*.jpg` | 4 distinct JPG, 2048 × 1542 | J Valdez trimming originals (Pixel) | **Use** |
| `Picture uploaded/New Folder With Items/` 3–7.jpg, `Company Picture J valdez 2.jpg`, root `Company Picture Trucks.jpg` | 7 JPG, 1204–1920 wide | J Valdez originals | **Use** (7.jpg is 1204 wide — narrow slots only) |
| `*COLLAGE*.JPG` (root, `Picture uploaded/`, `untouched triming/`) | 8 JPG, 2047 × 1538 | Samsung multi-photo collages | Composites — narrow cells only, never a hero, strip or tall cell |
| `Retouching…/Company Removal pics /` + loose `8.png 9.png 17.png` + `Professional Retouch 23 Photo Enhancements/` | 26 PNG, 1080 × 1080 | J Valdez removal, retouched squares | Fallback only — each is a downsized crop of an original above; prefer the original |
| `Retouching…/Mobile Google Ad Makeover/` (and `…Makeover 2/`, byte-identical — import once) | 14 PNG, 1200 × 1200 (1.png is 1200 × 1000) | Texas Tree Tops trimming | **Use** — passes the minimum; square, so wide slots crop to ≤1200 × 675 |
| `Retouching…/Untitled (1000 x 600 px) (800 x 600 px)/` | 26 JPG, 800 × 600 | Texas Tree Tops storm | Under minimum. Cells ≤ 800 wide only; `26.jpg` is blank, `4.jpg` is a gates/metalwork marketing graphic — exclude both |
| `Retouching…/Strom Removal - PNG Tiny Compessed/` | same 26 at 60–140 KB | Texas Tree Tops storm | Don't import — heavier-compressed copies of the set above |
| `IMG_1105.PNG` (root) | 1320 × 2868, 13 MB | probably a phone screenshot | Exclude unless it's a photograph |

Rules for the import:

- Import the originals as they are. Don't convert anything to PNG or
  resize before import: a 1200-px PNG in this folder is 3 MB, the same
  photo as a JPEG original is 300 KB, and the pipeline makes its own
  derivatives either way. In Phase 1 confirm what the pipeline emits
  today (formats, widths, `sizes`) and, if it isn't AVIF or WebP with
  a JPEG fallback, scope that as its own item with the byte saving.
- Service match is a hard rule. Trimming pages get trimming: pruning
  cuts, crew in the canopy, the shaped tree, cleanup. Removal pages
  get removal: felled trunk, log sections, stump, bucket or crane
  taking a tree down. Storm gets storm: tree on a roof, fence or car,
  uprooted, emergency crews. Test: if the subject wouldn't make sense
  under the section heading, it doesn't go there. Equipment-only shots
  (parked trucks, a chipper on a trailer) are a last resort.
- One focal point per photograph, saved on the photo, not the slot.
  Faces, the cut, and the tree stay inside the cell at 390, 820 and
  1440 — show me a crop sheet per slot proving it.
- Painted numbers I know about: J Valdez removal squares 3, 7 and 16
  (hoodie and truck), Texas Tree Tops storm 6 (truck) and the Mobile
  Makeover set wherever the truck appears. List any others you find.
- The same photo doesn't appear twice on one page.

## Standards every page meets before its gate

Speed. LCP ≤ 2.5 s on the August method (devtools throttling, GTM
blocked). The hero (or its solid-colour replacement) is the LCP
element and the only preloaded image. Below-fold images lazy-load.
`sizes` is accurate enough that no image is decoded above 1.25× its
rendered box at any breakpoint — criterion 8, on every box. Report
total image bytes for the first viewport at 390 and for the whole
page, before and after.

Layout. One spacing scale; no gap between sections larger than the
section padding itself. Grid cells in a section share one aspect ratio
and one size; no empty cells; nothing stretches to match a neighbour
(review cards included). Every chip, card and rail item is fully
visible at 390 — nothing clipped or faded at an edge. CTAs sit on the
section's centre axis. Text over a photo only with a measured overlay
and ≥ 4.5:1 contrast.

Conversion. The first viewport at 390 shows the H1 with service and
city, the phone CTA, and one trust line — with no scrolling. A
tap-to-call bar stays visible while scrolling on mobile; if the
template lacks one, scope it as a template item. Every CTA is the same
tracked number (already true; keep it). No outbound links above the
fold except `tel:`. Reviews carry the reviewer's name and the Google
mark. The areas list matches the campaign geo exactly. Nothing
autoplays above the fold on mobile.

## Shared-template defects — diagnose once, verify on all four pages

**S1. Review cards.** On trimming-a two of three cards hold one line
of text but stretch to the tallest card's height, and a fourth card is
sliced by the right edge. On removal-a and storm-a, 5 of 9 reviews cut
off mid-sentence. Propose a layout that fits its content, shows whole
cards at every width, and reads well whether a review is one line or
ten. Tell me exactly what you need from each Google Business Profile —
how many reviews, what length — so I collect both clients' in one pass.

**S2. Areas We Serve.** The dedupe shipped on trimming-a stopped the
marquee; the row is static now. A looping marquee needs a duplicate
track, so restore the motion with an `aria-hidden` clone and keep the
readable list at one copy of each city. No city clipped or faded at
either edge, the first item reachable at every width, the chip list
matching the record. On trimming-a the chips show 10 cities and the
paragraph above names 8 — report which the record supports and flag
the same mismatch wherever it appears. Texas Tree Tops shows 50 chips
for 25 cities in a masked ticker whose first item can't be reached;
the same fix covers it.

**S3. Photo grid / mosaic.** Cells at different sizes, empty grey
blocks, a composite in a large cell, off-service photos. Propose
uniform cells, no empties, no composite above narrow-cell size, and a
photo per cell you can justify against the service-match rule.

## Per-page items

### 1. J Valdez trimming-a (shipped once — check for regressions first)

- **P1.** About 300 px of empty white between the before/after proof
  rail and the four offer cards. Diagnose whether the B10 move of the
  10%-off block left the hole, then close it.
- **P2.** S1, S2, S3 as they land here. The mosaic's tall left cell,
  the composite in the top-right cell, and the empty-field and
  parked-trucks shots are the specific problems. Replace from the
  J Valdez originals — the untouched trimming set first.
- Diff what you find against `a49d1a7..e3394aa` and say whether each
  is a regression from that ship or pre-existing.

### 2. J Valdez removal-a

- **R1.** Hero background: solid dark green, no photo, using the brand
  green already in the record. Report the H1 contrast ratio against it
  and the LCP effect. This retires the composite hero plate — the worst
  upscale on any live page.
- **R2.** Both hero proof-strip cells cropped wrong. Per cell: a crop
  that can be fixed, or a composite no wide slot can hold plus the
  single-subject original you'd use instead.
- **R3.** "Restoration Results Guaranteed" grid — S3, plus trimming
  photos in a removal section and the one-cell hole. Fill from the
  removal originals.
- **R4.** "Tree Removal Services We Offer" cards — photos cropped
  wrong, dead white space between each photo and its checkmark list.
- **R5.** S1 and S2.
- Everything else below the fold stays.

### 3. Texas Tree Tops removal-a

- **T1.** S1 — 5 of 9 reviews cut off.
- **T2.** S2 — 50 chips for 25 cities behind the fading mask.
- **T3.** S3 — 5 photos leaving one empty cell at every width. The
  existing library has 24 removal photos; pick from those first, the
  Mobile Makeover set second.
- **T4.** The 24-item rail: first item reachable at every width, as
  fixed on trimming-a.
- **T5.** The open alt-text item in `docs/ALT-TEXT-ITEM.md`: 10
  instances of "Texas Tree Tops tree removal job" on shared stock
  photos, 4 on this page. Record edits where possible; the one
  template change (removal-a's services strip preferring the record's
  alt, as the rail already does); the build guard the write-up
  proposes; Summit's 2 inaccurate alts.
- CTAs are already centred here — no CTA work.

### 4. Texas Tree Tops storm-a

- **T6.** S1 — 5 of 9 reviews cut off.
- **T7.** S2 — 50 chips, masked ticker, first item unreachable.
- The photo grid closes cleanly — no S3 work. The storm set is
  800 × 600; if any storm photo is worth swapping in, it goes only in a
  cell ≤ 800 wide, and you name the cell. Otherwise tell me what to ask
  Texas Tree Tops for.

## Phase 1 — scope. Read-only. Stop at the end.

Change nothing. Report:

- Per page, one table: item · what changes · real rendered box at
  390/820/1440 where a photo is involved · proven on trimming-a or new
  work · every other page the fix touches, protected ones marked.
- The photo manifest: every file in the folder above, viewed, with
  service, quality (sharp / soft / upscaled), composite yes/no, painted
  number yes/no, and the slots it can fill on which page with no
  upscale. Group by client. Name the originals behind the retouched
  squares where you can match them.
- Per page, the speed baseline: Lighthouse mobile score, the LCP
  element and its time, first-viewport image bytes at 390, total image
  bytes, and the derivative formats the pipeline emits.
- Per page, the above-the-fold conversion check at 390 against the
  standards above — pass or fail per line.
- The S1 review request — counts and lengths per client.
- Anything on my list that measurement says isn't real, and anything
  real that I missed.

Then stop and wait for "go".

## Phase 2 — build. Starts only on my "go".

One page at a time, in order. Before you hold at each gate:

- Screenshot pairs of every changed section at 390/820/1440.
- Crop sheets for every slot whose photo changes: the original, the
  focal point, the cell at all three widths.
- The 55-page phone/GTM compare: zero differences.
- Guards 12/12; criterion 8 on every image box.
- Lighthouse on the August method, before and after: score, LCP,
  first-viewport image bytes. No regression on any of the three.
- Prerender diff naming every page that changes, protected ones
  marked, one line on why each page outside the current target is in it.
- Bundle delta in gzip bytes, JS and CSS. Anything above zero waits
  for my approval.

Then hold. I approve that page before you start the next.

---

The owner's covering note for removal-a (2026-09-16): keep the removal-a scope, don't
redo it; build removal-a first under that scope plus the four answers (B4 grid now from the
Mac originals; B2 work-photo-1 + hero-photo-2 focal; B5 4:3; reviews stubbed); Stage 4 stays
paused.
