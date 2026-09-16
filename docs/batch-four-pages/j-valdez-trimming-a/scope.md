# J Valdez trimming-a — page 2 scope (against docs/batch-four-pages/four-page-spec.md)

Status: DRAFT written before measurement. Items marked ⏳ get their numbers from the live
page at 390/820/1440 before anything is built; nothing here is changed yet.

## Regression check first (spec: diff against a49d1a7..e3394aa)

Commits in that range that touched this page: B1 hero rhythm, B2 hero band cell 1 =
gallery-slide-3, B3/B7 centred CTAs, B4/B5 reviews unclamped + Google button, B6 one-rule
bento, B8 static areas list, B9 steps across + five-photo band, B10 offer band after
"How it works", the alt-text pass, and the placement rule for `grid.6`.

| finding | regression from that ship, or pre-existing? |
|---|---|
| P1 — ~300 px of white between the proof rail (Recent jobs band) and the four offer cards | ⏳ measure; hypothesis: B10 moved the offer band to follow the Recent jobs band, and B9 gave that band `padding-block: … var(--ta-pad)` on top of the offer section's own `--ta-pad`, so two section paddings stack |
| S1 — one-line cards stretched to the tallest; a fourth card sliced by the right edge | stretch: introduced by B4's unclamp (flex row `align-items` default); the sliced fourth card is the scroll-snap rail showing a partial next card — pre-existing behaviour of the shared slider |
| S2 — chips 10, paragraph 8 | pre-existing: the record's `copyOverrides.trimming-a["why.body"]` names 8 of the 10 cities (Forney, Lake Ray Hubbard missing). Reported, not edited (decisions.md 15) |
| S3 — mosaic's tall left cell, composite top-right, empty-field and parked-trucks shots | the tall cell is B6's bento feature (2×2 at desktop) — the new spec's "one aspect ratio and one size" rules it out; the composite (work-photo-2), the empty lot (work-photo-5) and the trucks (work-photo-1's bucket truck / hero-photo-2 stays by rule) are pre-existing library choices |

## Items

**P1.** ⏳ Measure the gap between `.ta-gallery` (band) bottom and `.ta-benefits` top at
390/820/1440 and against the section padding scale (`--ta-pad`). Fix by collapsing the
doubled padding, not by touching either section's content. Pages: trimming-a ×3 clients
(JV PROTECTED).

**S1.** `.trimming-a .rvs-track { align-items: flex-start }` (the removal-a rule, decisions
9). The partial fourth card is the rail's affordance for "more"; keep unless measurement
shows a card cut at 390 with no way to reach it. Pages: trimming-a ×3, no HTML change.

**S2.** Already the static list. The 8-vs-10 mismatch goes to the owner (decisions 15).
Check the chip list against the campaign geo is the owner's, not measurable here.

**S3 — "Done clean, done right" grid.** Six uniform 4:3 cells (3×2 from 768, 2×3 below),
no feature cell. Photos, service-matched to trimming and no repeats on the page:
- keep: work-photo-3 (climber in canopy), work-photo-4 (pole-saw pruning)
- replace work-photo-2 (before/after composite) → **IMG_1117** original: crew lowering limbs
  over a roof line — the headline's "roof & gutter branch clearance", literally
- replace work-photo-5 (trucks beside an empty lot, equipment only) → **PXL_20260407_145030926**:
  lakeside slope, trimmed trees, cleared ground
- work-photo-1 (bucket truck in a large tree) — ⏳ trimming or removal? It is IMG_1119, now
  also removal-a's proof cell; on a trimming page it reads as canopy work. Keep unless the
  owner's service-match test fails it; alternative **IMG_1116** (climber in a creek-side tree)
- gallery-slide-4 (walkway) — already in the Recent jobs band on this page → replace with
  **IMG_1116** to end the repeat
Every original is ≥1320 px, so the 4:3 cells (max box ⏳) fill at 2× without upscaling.
Pages: JV trimming-a only (record) + trimming-a ×3 for the CSS (JV PROTECTED).

**Hero band cell 1 (gallery-slide-3)** also appears in the Recent jobs band — repeat the owner
accepted on 2026-09-15 "until real photos arrive". The 2048 px original
(PXL_20260407_165516723) is the same picture; swapping in the original ends the 1.07×
upscale but not the repeat. ⏳ decide with the measurements.

## Evidence to produce
before/after for `.ta-gallery`+`.ta-benefits` (P1), `.ta-why` (S1), `.ta-doneright` (S3);
crops for every grid cell that changes; the usual compare / guards / criterion 8 /
Lighthouse / diff / bundle files in this folder.
