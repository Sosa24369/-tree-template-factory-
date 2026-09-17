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

## The hold (owner's second instruction, 2026-09-16/17) — what changed on this page

- **The check that lied** — "dead space 0" measured the wrapper, not the photo; the replacement
  fails the screenshot's condition on cards 2–3 (`348×261: NO IMG`) and passes settled: the
  slots were filled, the images deferred (`hold/step1-check.txt`). Card 1's focal point set on
  the photograph {0.55, 1.0} — the eave leaves all but a corner sliver.
- **Call bar** — hidden while a section call button is in view; the space inside the footer at
  the bar's height (91 px + safe-area); after: 0 rule failures (before: 5 stops stacked, text
  under the bar at scroll end).
- **Areas** — the shared alphabetical grid, 2 / 4 / 5 columns, no lonely last row.
- **Sweep** (10 rows): the grid overflow; proof cell 2's bucket/cab → focal {0.6, 0.05};
  IMG_1122 re-ingested with 120 px trimmed (the pole gone; the slot's 1200 px minimum caps the
  trim); IMG_1126 re-ingested with the band higher (heads in); four composites out of the rail
  (eight single photographs); the call-asset line in the footer's measure; **cards 2 and 3
  filled on 2026-09-17** from the retouched removal set (16.png, 18.png at 1080 px under the
  owner's per-photo exception, focal on the cut; `crops/card-2-*.png`, `crops/card-3-*.png`).
  Needs-photo: card 1 (`service-photo.1`) and benefits (`benefits`) — decisions 44.
- **Lighthouse, final build**: 99 / 1.70 s / 381,865 B against 98 / 1.85 s / 602,973 B before
  (the cards are deferred; the run fetches the same thirteen images as at the gate).
- Guards on the final build: pre 6/6 (image-spec PASS, the two waivers reported), post 7/7,
  rendered 2/2; compare zero; criterion 8 clean; bundle +2,920 B of 3,072 for the batch.
