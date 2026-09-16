# J Valdez removal-a — summary (page 1 of 4, batch/four-pages)

Final build: branch `batch/four-pages` at `7ca924e`. Live reference: the e3394aa build.

## Lighthouse, August method (vite preview + gzip, devtools throttling, mobile, performance only, every tracker blocked, 1 warm-up + 3 runs, median kept)

| | before (3c685d1) | after (7ca924e) | verdict |
|---|---|---|---|
| performance score | 98 · 98 · 98 | 99 · 99 · 99 | +1 |
| LCP | 1.85 s (1.84–1.85) | 1.72 s (1.72–1.74) | −0.13 s |
| LCP element | hero body text (`p.ra-hero-body`) | hero body text — the solid-green hero is the LCP, and the only preloaded image is the logo | as the spec requires |
| image bytes fetched during the run (mobile, no scroll — the first-viewport figure) | 602,973 B (16 images, incl. hero-photo-1 twice: 800w + full) | 381,865 B (13 images) | −221,108 B (−37%) |
| CLS | 0 | 0 | — |
| GTM requests completed | 0 (1 attempt, blocked) | 0 (1 attempt, blocked) | tracker block held |

No regression on score, LCP or first-viewport bytes. Files: `lighthouse-before.json`,
`lighthouse-after.json`, and the per-run `lighthouse-*-summary.txt`.

## The other gate checks (same build)
- `guards.txt` — 12/12; criterion 8 on the nine changed pages, clean except five pre-existing
  lines on j-valdez/removal-b and summit/removal-a (present on live; decisions.md 14).
- `phone-gtm-compare.txt` — 55 pages, ZERO differences.
- `prerender-diff.txt` — 11 of 55 pages change; 3 protected; every page explained.
- `bundle.txt` — +912 B gzip (JS +1,111 = the record's new data; CSS −199).
- `before-*.png` / `after-*.png` — hero, why, restoration, services, areas at 390/820/1440.
- `crops/<slot>.png` — the 11 changed cells: source, master with focal point, cell at all three widths.

## Left alone on this page, for the report
- Still-loaded Texas Tree Tops background art on a J Valdez page: `assets/texas-tree-tops/bg-section-*.webp`
  (~36 KB) are removal-a's default `--ra-art-*` section backgrounds. The marquee's copy is gone with
  the marquee; the section ones remain. Pre-existing; a template item for the report.
- Logo preloaded twice (prerender + React's SSR float), same file, one fetch. Pre-existing on every
  text-hero page (decisions 11).
- Photos repeated on the page from the rail showing the whole library (decisions 10).
