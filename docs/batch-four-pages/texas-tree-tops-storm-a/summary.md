# Texas Tree Tops storm-a — summary (page 4 of 4, batch/four-pages)

PROTECTED page, the only one that has carried spend (storm campaign, paused). Final build:
the batch head (`cdbffed`: T7 at `81ca6b7`, the J Valdez pins of decisions 28). Live
reference: the e3394aa build.

## Lighthouse, August method (vite preview + gzip, devtools throttling, mobile, performance only, every tracker blocked, 1 warm-up + 3 runs, median kept)

| | before (3c685d1) | after (final build) | verdict |
|---|---|---|---|
| performance score | 99 · 99 · 99 | 99 · 99 · 99 | same |
| LCP | 1.74 s (1.73–1.74) | 1.73 s (1.73–1.75) | same, within noise |
| LCP element | hero body text (`p.st-hero-body`) | hero body text | text hero; images do not move this page |
| image bytes fetched during the run (mobile, no scroll) | 13,990 B (the header logo) | 13,990 B | same |
| CLS / TBT | 0 / 0 ms | 0 / 0 ms | — |
| GTM requests completed | 0 (1 attempt, blocked) | 0 | tracker block held |
| main bundles (gzip transfer) | — | JS 132,323 B · CSS 27,729 B | recorded for the batch's bundle line |

No regression on score, LCP or first-viewport bytes. (An earlier after-run on the pre-pin
build — 99 / 1.74 s / 13,990 B — was replaced by this one so the evidence is on the final build.)

## What changed on the page (measured on the build, 390 / 820 / 1440)
- **T6 / S1** — reviews: live 5 of 9 cut, one card sliced at the right edge at every width;
  build 0 of 9 cut, whole cards 1 / 2 / 3 per view, no partial card, cards sized to their
  text (170–519 px). The scoped slider rule (`.storm`) from page 2; no button on this template.
- **T7 / S2** — areas: live 50 chips for 25 cities, masked, animated (150 s loop), 48 / 44 /
  38 chips clipped at the instant of measurement, first chip unreachable; build 25 chips
  once, no mask, no animation, first chip reachable, 0 clipped, no horizontal overflow.
  The component is shared: the same result on all 21 pages it reaches (`guards.txt`).
- Work grid tiles unchanged (171×128 / 171×228 / 171×171 at 390 … 340×255 / 340×454 /
  340×340 at 1440); no photo changes on this page, so no crops.
- Hero, trust, handle, process, insurance, FAQ, final CTA: untouched.

## Gate checks (final build)
- `guards.txt` — 12/12; criterion 8 on 354 boxes across the 21 T7 routes, only the
  pre-existing removal-b tile misses (decisions 14); the areas-list check on every route.
- `phone-gtm-compare.txt` — 55 pages, ZERO differences (183 tel, 373 data-dni, 367 visible, 68 GTM ids).
- `prerender-diff.txt` — 28 of 55 pages, hash-normalised, every row labelled; this page 54 lines (T7 markup).
- `bundle.txt` — batch +1,527 B gzip of 3,072.
- `before-*.png` / `after-*.png` — reviews and areas sections at the three widths.

## Left alone on this page, for the report
- The grid's three tile shapes are by design; the grid closes cleanly (decisions 26).
- The storm photo set on this Mac is 800×600 — under the 1200 minimum and short of the tall
  tile's 680×908 at 2× — so no storm photograph goes in. Ask Texas Tree Tops for originals
  ≥ 1600 px (tree on a roof/fence/car, root plate, crews at a storm job).
