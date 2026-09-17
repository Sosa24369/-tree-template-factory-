# Texas Tree Tops removal-a — summary (page 3 of 4, batch/four-pages)

PROTECTED page. Final build: branch `batch/four-pages` at `f07ebc9` state (record + template
commits up to `5347450`). Live reference: the e3394aa build.

## Lighthouse, August method (vite preview + gzip, devtools throttling, mobile, performance only, every tracker blocked, 1 warm-up + 3 runs, median kept)

| | before (3c685d1) | after | verdict |
|---|---|---|---|
| performance score | 98 · 98 · 98 | 98 · 98 · 98 | same |
| LCP | 1.90 s (1.90–1.91) | 1.90 s (1.89–1.91) | same |
| LCP element | hero body text (`p.ra-hero-body`) | hero body text | the hero is the LCP |
| image bytes fetched during the run (mobile, no scroll) | 441,941 B | 386,105 B | −55,836 B: the areas marquee's background art (`bg-row-sreex03pnx`, 55.8 KB) is gone with the marquee |
| CLS | 0 | 0 | — |
| GTM requests completed | 0 (1 attempt, blocked) | 0 | tracker block held |

No regression on score, LCP or first-viewport bytes.

## What changed on the page (measured on the build)
- **T1 / S1** — 0 of 9 reviews cut (live: 5 of 9); whole cards 1 / 2 / 3 per view, sized to
  their text (170–519 px); the Google reviews button under the slider (from page 1's R5;
  the record has `reviewsSource.profileUrl`).
- **T2 / S2** — 25 chips for 25 cities, once, no mask, none clipped (live: 50 chips, masked).
- **T3 / S3** — six uniform cells (170×128 / 237×178 / 353×265), no grey bands (live at 1440:
  two 1092×819 cells with 439 px of grey each); cell 6 = `restoration-photo-1`, a climber
  taking a dead tree down with a chainsaw (decisions 22).
- **R4** — services cards 4:3 with 0 dead space (live: up to 362 px at 820).
- **T5** — the three shared stock photographs are described as what they show (record alts,
  four instances on this page); the Benefits artwork — Texas Tree Tops' own photograph — is
  described as the picture rather than composed as "…tree removal job"; a build guard now
  fails any `_shared/`/`_template/` entry with no alt or one naming the client. Summit's
  stock alts corrected; J Valdez's removal-a proof cells carry their record alts (page 1's
  diff and compare re-run, zero differences).
- **T4** — measured NOT real: the 24-item rail's first item is reachable at 390 / 820 / 1440
  on the live page (x = 20 / 41 / 174 px inside a left-aligned rail). No change (decisions 23).
- Hero unchanged: plate gallery-02, proof gallery-03 / gallery-04.

## Gate checks (same build)
- `guards.txt` — 12/12 including the new stock-alt guard; criterion 8 clean on 300 boxes
  except the pre-existing Summit rail lines (decisions 14).
- `phone-gtm-compare.txt` — 55 pages, ZERO differences.
- `prerender-diff.txt` — 22 of 55 pages; this page 407 lines; the 11 pages new since page 2
  are alt-text-only and labelled; every page explained.
- `bundle.txt` — batch so far +1,597 B gzip.
- `before-*.png` / `after-*.png` — why, areas, restoration, gallery, services. `crops/` — the six grid cells.

## Left alone on this page, for the report
- The hero plate is `gallery-02`, a 680 px file rendered at 1440×1192 (4.2× at 2×), and the
  grid's five gallery-0x photos are 382–680 px files (2–3× upscaled): legacy imports under the
  guard's allowance. The fix is originals from Texas Tree Tops (≥1600 px); the Mobile Makeover
  set is their trimming work, wrong service here.
- `bg-section-*` template art and the logo preloaded twice: template items (page 1 summary).
- `_template/removal-a/benefit-strip-art` stays: it is Texas Tree Tops' own photograph, now with
  a descriptive alt.

## The hold (owner's second instruction, 2026-09-16/17) — what changed on this page

- **Areas** — the alphabetical grid, 2 (+ tail of three) / 5 / 5 columns, nothing clipped.
- **Call bar** — hidden while a section call button is in view, the space inside the footer
  (91 px + safe-area); after: 0 rule failures (before: 5 stops stacked, text under the bar).
- **Sweep** (9 rows, all fixed): the grid overflow; the clip's black tile → a poster frame
  (`PhotoSet.poster`); `gallery-04` (equipment only) out of the proof strip, the grid and the
  rail; card 3's helmet crop → the rigging crew; the stock pruning photo out of the rail; the
  rail curated to nine client photographs + the clip (the spec's no-photo-twice rule);
  `gallery-05`'s roof worker whole (focal y = 0.75). Then, by Lighthouse weight: proof cell 2
  = the aerial lift (`restoration-grid-2`, 51 KB), the grinder in the deferred grid.
- **Lighthouse, final build**: 97 / 2.00 s / 405,003 B (runs 97/98/97, 1.98–2.01 s) against
  98 / 1.90 s / 441,941 B before and 98 / 1.90 s / 386,105 B at the gate — 37 KB under the
  baseline, one point and ~100 ms behind it; the remaining difference is the poster's
  15.7 KB, which a `<video poster>` loads eagerly. The owner's call (REPORT, "the one open
  trade-off"): accept, a lazy poster (~150 B of the 152 B bundle headroom), or no clip.
- Guards on the final build: pre 6/6, post 7/7, rendered 2/2; compare zero; criterion 8 clean.
