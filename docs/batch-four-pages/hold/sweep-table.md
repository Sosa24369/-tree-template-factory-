# The sweep — one subagent per page, looking at the rendered build (fixes 1–3 applied), 390 / 820 / 1440

Each row is the subagent's finding, verbatim in substance; the last column is what it got.
"fixed" = a commit on batch/four-pages (named); "needs-photo" = the slot and the photograph
it needs, in decisions.md 44 / 38; "fixed (partly)" says which part. 2026-09-17: cards 2 and 3
filled under the owner's per-photo exception (decisions 49) — 24 fixed, 3 needs-photo.

| page | width | section | defect | outcome |
|---|---|---|---|---|
| texas-tree-tops/storm-a | 390 | st-areas | the sixty-track grid's column gaps (59 × 10 px) exceed the column; tracks collapse, twelve pills clipped off the right edge, page pans 220 px | fixed db5e4ab — gap moved to the cells (decisions 35) |
| texas-tree-tops/storm-a | 390 · 820 · 1440 | st-work | ragged tile rows: gallery-15 (portrait) and restoration-grid-2 (square) at native shape among 4:3 tiles; empty paper under the shorter photos (199 px at 1440) | fixed 9cc5798 — DeferredImage's inline ratio outranked the template's uniform rule; `!important` (decisions 36) |
| texas-tree-tops/storm-a | 390 · 820 · 1440 | st-work | tile 5 hero-photo-2: an equipment shot, bucket cut by the top edge, no storm damage; shown uncropped | needs-photo — `photoSlots.storm-a.tile.5`, storm damage ≥ 800 px wide (decisions 38) |
| texas-tree-tops/storm-a | 1440 | st-handle | three cards in a two-column sub-grid: the Cleanup card orphaned beside an empty slot; the square photo top-aligned over ~320 px of paper | fixed 4611c45 — one column of panels, the photo a full-height panel; 4:3 below 980 (decisions 37) |
| j-valdez/trimming-a | 390 | ta-areas | the same sixty-track overflow: five of ten pills clipped at the right edge | fixed db5e4ab — as above (35) |
| j-valdez/trimming-a | 390 · 1440 | ta-hero | gallery-slide-3 (square) in a 348 × 148 band: tree crowns cut at the top edge (57 % of the height cropped) | fixed d62a1a4 — focal {0.5, 0.4} on the photograph (decisions 39) |
| j-valdez/trimming-a | 390 · 820 · 1440 | ta-doneright | work-photo-1: the bucket at the top of the boom sliced by the top edge of the 4:3 tile | fixed d668763 — focal {0.6, 0.0} on the photograph (decisions 40) |
| j-valdez/trimming-a | 390 · 820 · 1440 | ta-footer | the Google Ads call-asset line "(214) 544-9487" flush at x = 0 outside the gutter | fixed 23244a2 — the line takes the footer container's measure, CSS only; HTML byte-identical (decisions 41) |
| j-valdez/removal-a | 390 | ra-areas | the same sixty-track overflow: the right column clipped | fixed db5e4ab — as above (35) |
| j-valdez/removal-a | 390 · 820 · 1440 | ra-hero | proof cell 2, IMG_1119: the bucket cut at the top edge and the cab at the bottom (350 × 160 box at 390) | fixed 5d6ac06 — focal {0.6, 0.05}: the bucket and the boom stay whole, the cab goes (a 2.2:1 box cannot hold both) |
| j-valdez/removal-a | 390 · 820 · 1440 | ra-benefits | work-photo-3: the roof eave dominates the top-left corner of a near-square box (~120 × 140 px of 488 × 520 at 1440) | needs-photo — `photoSlots.removal-a.benefits` (decisions 44) |
| j-valdez/removal-a | 390 · 820 · 1440 | ra-restoration | IMG_1122: a black pole and a hooded figure cut off along the whole left edge | fixed 6e1483f — re-ingested with the left 12 % trimmed before the band (decisions 42) |
| j-valdez/removal-a | 390 · 820 · 1440 | ra-restoration | IMG_1126: both crew members' heads cut at the top edge; the hand-truck frame fills the left third | fixed (partly) 6e1483f — re-ingested with the band higher, heads in; the hand truck is the job's tool and stays (42) |
| j-valdez/removal-a | 390 · 820 · 1440 | ra-gallery | four of twelve rail tiles are composites: hero-photo-1 (two stacked), gallery-slide-1/-2 (before/after), work-photo-2 (side-by-side); two are trimming before-afters on a removal page | fixed 4a692fc — the four dropped from the rail; eight single photographs remain (decisions 43) |
| j-valdez/removal-a | 390 · 820 · 1440 | ra-services | card 1 work-photo-3: the eave's sliver in the top-left corner (~45 × 25 px of 343 × 257 at 1440) | needs-photo — `service-photo.1` (44); the focal of decisions 34 is the most the photograph allows |
| j-valdez/removal-a | 390 · 820 · 1440 | ra-services | card 2 work-photo-4: pole-saw pruning (trimming) under "Tree Removal Services We Offer" | fixed ee1b2f1 — 16.png (chainsaw at the stump base) from the retouched set, 1080 px under the owner's per-photo exception, focal on the cut (decisions 49) |
| j-valdez/removal-a | 390 · 820 · 1440 | ra-services | card 3 work-photo-5: five trucks and a chipper by an empty field, no job | fixed ee1b2f1 — 18.png (felled trunk with crew) from the retouched set, the same exception, focal on the cut (49) |
| j-valdez/removal-a | 390 · 820 · 1440 | ra-footer | the call-asset line flush left at x = 0, 0 px gutter | fixed 23244a2 — as above (41) |
| texas-tree-tops/removal-a | 390 | ra-areas | the same sixty-track overflow: twelve right-column chips unreachable | fixed db5e4ab — as above (35) |
| texas-tree-tops/removal-a | 390 · 820 · 1440 | ra-gallery | the lead tile is the clip gallery-01.mp4 with no poster: a black box with native controls (302 × 190 / 302 × 320) | fixed — a poster frame captured from the clip; `PhotoSet.poster`, four templates, guard (decisions 47) |
| texas-tree-tops/removal-a | 390 · 820 · 1440 | ra-services | card 3 restoration-grid-5: a foreground worker's red helmet dominates the bottom-right and is cut by the edge; the job pushed to the background | fixed — the helmet is in the frame itself (4:3 file, 4:3 card); the card takes restoration-grid-2, an aerial lift taking a dead tree down (45) |
| texas-tree-tops/removal-a | 820 · 1440 | ra-gallery | the same restoration-grid-5 crop in its rail tile | fixed — the tile is out of the curated rail (46) |
| texas-tree-tops/removal-a | 390 · 820 · 1440 | ra-hero | proof cell 2 gallery-04: the branded box truck and chipper, no tree or work | fixed — restoration-photo-5, a stump grinder at work, focal y = 0.55 (45) |
| texas-tree-tops/removal-a | 390 · 820 · 1440 | ra-restoration | grid slot 3 gallery-04: the same equipment shot under "Restoration Results Guaranteed" | fixed — restoration-photo-3, two crew rigging a rope from a large oak (45) |
| texas-tree-tops/removal-a | 390 · 820 · 1440 | ra-gallery | rail tile gallery-04: the same equipment shot | fixed — out of the curated rail (46) |
| texas-tree-tops/removal-a | 820 · 1440 | ra-gallery | rail tile services-card-photo-1: a stock pruning photograph — trimming on a removal page | fixed — out of the curated rail (46) |
| texas-tree-tops/removal-a | 390 · 820 · 1440 | ra-restoration | grid slot 4 gallery-05: the worker on the trailer roof cut at the waist by the bottom edge; a pole in the top-left corner | fixed — focal {0.5, 0.75} on the photograph (45) |

Off the four pages, found by the rendered guard on every page (decisions 48): removal-c's
and trimming-c's work grids were ragged (pre-existing on live) — fixed, cells uniform 3:4;
trimming-a's horizontal band exposed a blind spot in the guard's settle pass — fixed.
