# J Valdez trimming-a — summary (page 2 of 4, batch/four-pages)

Final build: branch `batch/four-pages` at `66c3db4`. Live reference: the e3394aa build.

## Lighthouse, August method (vite preview + gzip, devtools throttling, mobile, performance only, every tracker blocked, 1 warm-up + 3 runs, median kept)

| | before (3c685d1) | after (66c3db4) | verdict |
|---|---|---|---|
| performance score | 98 · 98 · 98 | 98 · 98 · 98 | same |
| LCP | 1.85 s (1.84–1.87) | 1.85 s (1.85–1.87) | same |
| LCP element | hero body text (`p.ta-hero-body`) | hero body text | the hero is the LCP; the only image preloads are the hero band's `gallery-slide-3` (800w, the LCP-slot photo) and the logo |
| image bytes fetched during the run (mobile, no scroll) | 87,834 B (gallery-slide-3 800w + logo) | 87,834 B | same — every changed section is below the fold and lazy |
| CLS | 0 | 0 | — |
| GTM requests completed | 0 (1 attempt, blocked) | 0 | tracker block held |

No regression on score, LCP or first-viewport bytes.

## What changed on the page (measured on the build)
- **P1** — the seam between the Recent jobs band and the offer band is one section pad:
  54 / 66 / 108 px at 390 / 820 / 1440 (live: 108 + 108 at 1440). A regression from B9 + B10,
  now closed (decisions 16).
- **S1** — 1 / 2 / 3 whole review cards per view, no card sliced at the right edge, cards
  sized to their own text (heights 124–356 px), 0 of 9 cut. Same rule on removal-a.
- **S3** — six uniform 4:3 cells (171×128 / 365×274 / 352×264): work-photo-1, IMG_1116
  (climber in the canopy — also the services-blurb photo, because that section renders grid
  cell 2, decisions 20), work-photo-3, work-photo-4, PXL_20260407_145030926 (lakeside slope,
  trimmed trees), IMG_1117 (limbs lowered over a roof). Out: the before/after composite
  (work-photo-2, which also filled the 740×740 blurb slot), the trucks-beside-an-empty-lot
  shot, and gallery-slide-4's repeat from the Recent jobs band.
- **S2** — 10 chips for 10 cities; the paragraph above names 8 (record copy; decisions 15).
- Untouched, and shown unchanged in the crop sheets: the hero band (gallery-slide-3,
  hero-photo-2 with its focal point) and the five Recent jobs tiles.
- Accepted repeat (owner, 2026-09-15): gallery-slide-3 in hero band cell 1 and Recent jobs
  tile 3. The climber appears in grid cell 2 and the blurb, as the composite did before.

## Gate checks (same build)
- `guards.txt` — 12/12; criterion 8 clean on all 309 boxes across the eleven pages the
  changes reach (trimming-c's missing `sizes` fixed on the way, decisions 21).
- `phone-gtm-compare.txt` — 55 pages, ZERO differences.
- `prerender-diff.txt` — 11 of 55 pages (the same set as page 1; this page 26 lines);
  CSS-only pages listed separately.
- `bundle.txt` — batch so far +1,545 B gzip (JS +1,700 record data, CSS −155).
- `before-*.png` / `after-*.png` — gallery, benefits, why, done-right, longform.
- `crops/` — hero band ×2 (unchanged), grid ×6, longform.

## Reported, not changed
- The 8-vs-10 cities mismatch lives in the record's own trimming-a body-copy override
  (Forney, Lake Ray Hubbard are chips only); ads are tuned to that copy (decisions 15).
- Longform renders grid cell 2, not the contract's `longform` slot (decisions 20).

## The hold (owner's second instruction, 2026-09-16/17) — what changed on this page

- **Areas** — the shared alphabetical grid replaces the template's own pill list: 2 / 4 / 5
  columns at 390 / 820 / 1440 (rows 5×2 · 4/4/2 · 5/5), no lonely last row, nothing clipped.
- **Call bar** — hidden while a section call button is in view; the reserved space is a
  spacer inside the footer at the bar's real height (91 px + safe-area); after: 0 rule
  failures at 390 × 844 (`callbar-overlap.txt`; before: 6 stops stacked, text under the bar
  at scroll end).
- **Sweep** (4 rows, all fixed): the 390 grid overflow; `gallery-slide-3`'s crowns cut in the
  hero band → focal {0.5, 0.4}; `work-photo-1`'s bucket sliced in the grid → focal {0.6, 0.0};
  the Google Ads call-asset line flush at x = 0 → the footer container's measure, CSS only.
- **Lighthouse, final build**: 98 / 1.89 s / 87,834 B (runs 1.86–1.90 s) against 98 / 1.85 s /
  87,834 B before — same score, same bytes, the LCP inside the run-to-run spread.
- Guards on the final build: pre 6/6, post 7/7, rendered 2/2; compare zero; criterion 8 clean.
