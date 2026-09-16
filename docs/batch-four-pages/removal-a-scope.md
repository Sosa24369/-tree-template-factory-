# J Valdez removal-a — the approved scope (as sent to the owner, 2026-09-16)

Measured on the live page at 390/820/1440 at retina density. Merged with the owner's
B1–B7 list. Nothing here is the design target; it is what was measured and what changes.

**Correction carried in:** the earlier "one-cell hole at every width" claim was wrong (a crude
column heuristic). Measured properly the grid closes; the visible "empty grey blocks" are the
first two cells at 1440 being 1092×819 boxes holding a 1092×380 photo — a 439 px grey band.

## B1 / R1. Hero background: solid brand green, no photo
Empty the hero plate for this client (record-level Remove-from-slot) and let the band's
existing green show: the hero already computes to #112d25 = `--ra-deep` = 86% of the
record's `brand.primaryColor` #14342b. Drop the LCP preload for this page.
Contrast: white headline on #112d25 = 14.73:1 (AAA); accent #e0913a = 5.81:1 (AA);
near-white body 12.51:1 (AAA). Today the headline sits on a photograph.
LCP today: at 820 and 1440 the LCP element IS the hero photo (hero-photo-1). At 390 the
plate is 0×0 yet the page downloads hero-photo-1-800w.webp, 80.5 KB wasted per phone visit.
Boxes: 0×0 / 820×1656 / 1440×1192 → gone at all three. Removes the 2.88× upscale.
New work. Pages: JV removal-a (PROTECTED) + its thank-you preload line.

## B2 / R2. Hero proof-strip crops
Boxes 350×160 (2.19:1) / 361×262 (1.38:1) / 537×280 (1.92:1), both cells, no focal point.
Square masters → 46% / 73% / 52% of the photo visible, a middle slice.
Cell 2 = gallery-slide-1, a stacked before/after composite: a 2:1 slice cuts across the seam.
Structural → replace with work-photo-1 (owner: yes). Cell 1 = hero-photo-2 (truck with the
painted number): stays; focal point may centre it (owner: yes, number stays in frame).
Proven machinery. Pages: JV removal-a (PROTECTED), record-level.

## B3 / R5. Reviews in full + listing button
Identical to trimming-a: unclamp on removal-a; "Read all our reviews on Google" outline
button 14 px under the slider. Text stays stubbed. 2 of 9 cut off today; card 294 px at 390
(≈32 chars/line), 340 px at 820/1440 (≈38).
Proven. Pages: removal-a ×3 clients + removal-c ×2 (copy parity) → JV and TTT removal-a
(PROTECTED), Summit removal-a, two removal-c pages.

## B4 / R3. "Restoration Results Guaranteed" grid
Root cause: two `.ra-grid-mosaic` blocks fight (per-cell heights vs a later `li {
aspect-ratio: 4/3 }`). One rule replaces both, as B6 did on trimming-a.
Boxes now: 390 → four 170×128 + one 350×263; 820 → four 239×179 + one 489×366; 1440 →
two 1092×819 cells with 1092×380 photos (439 px grey each) + three 725×543.
After: uniform 4:3 cells at every width, no grey. Photos: removal originals from the
Desktop folder (owner), six cells.
Proven technique; new photo selection. Pages: removal-a ×3 for CSS (JV, TTT PROTECTED),
JV only for photos.

## B5 / R4. "Tree Removal Services We Offer" cards
Root cause: the deferred-image wrapper reserves a square box from the record while the
photo renders as a 150–190 px strip; removal-a never neutralises the inline ratio.
Dead space measured: 198 px at 390, 546 px at 820, 153 px at 1440. Crop: 2.3:1 letterbox
from a square master. Owner: go 4:3, take the taller cards.
Proven (wrapper fix); new ratio. Pages: removal-a ×3 (JV, TTT PROTECTED), Summit.

## B6 / S2. Areas chips — fix once
Records are clean (J Valdez 10 unique, Texas Tree Tops 25, Summit 12). The marquee renders
the list twice for the loop. Fix in two components: removal-a/sections/Areas.tsx and the
shared components/ServiceAreasCarousel.tsx. Owner: static wrapped list now, motion later.
Proven (trimming-a B8). Pages: 24 — every page except the two trimming-a. PROTECTED among
them: JV removal-a, TTT removal-a, TTT storm-a.

## B7. Everything else stays
No reordering. CTA rows already centred at all three widths. Alt text already fixed. The
rail (12 items, 320 px cells) is healthy and its first item reachable.

## Slot measurements (live, DPR 2)
| slot | 390 | 820 | 1440 | verdict |
|---|---|---|---|---|
| hero plate | 0×0 | 820×1656 | 1440×1192 | 2.88× at 1440, 1.64× at 820 |
| hero proof (2) | 350×160 | 361×262 | 537×280 | 1.07× at 1440 |
| Benefits | 350×240 | 738×426 | 488×520 | 1.48× at 820 |
| Restoration grid (5) | 350×263 + 170×128 | 489×366 + 239×179 | 1092×380 + 725×543 | 2.18× at 1440 + grey |
| longform | 350×350 | 738×738 | 445×445 | 1.48× at 820 |
| rail (12) | 190×190 | 320×320 | 320×320 | fine |
| service cards (3) | 348×150 | 736×190 | 343×190 | 1.47× at 820; 2:1 crop of squares |

Every master is 1000 px; upscaling is a source-file problem. The record claims 1080×1080
for every J Valdez photo; the files are 1000×1000.
