# HANDOFF — batch/four-pages, written mid-run 2026-09-16

Read this, then `docs/batch-four-pages/{four-page-spec.md, amendment.md, removal-a-scope.md,
decisions.md}`, before touching anything. The amendment (unattended run, one gate at the end)
is the operative instruction; the spec holds everything else.

## Where the run is

**Amendment section 1 — the per-page loop. Page 1 of 4 (J Valdez removal-a): BUILT,
VERIFIED, EVIDENCE COMMITTED, waiting only on the Lighthouse-after subagent** (it writes
`lighthouse-after.json` + `lighthouse-after-summary.txt` into the evidence folder; after it:
write `summary.md` with before/after score, LCP, first-viewport image bytes; stop if any of
the three regressed; commit). **Page 2 (J Valdez trimming-a): draft scope committed**
(`docs/batch-four-pages/j-valdez-trimming-a/scope.md`), not measured, not built. Pages 3–4
not started.

Section 0 (rails) is complete and proven. Hook: `.claude/hooks/block-publish.py`, registered
in `.claude/settings.json` (committed) AND `~/.claude/settings.json` (the live one this
session; guarded to this repo). Both entries come out only when the owner approves the
batch. Branch `batch/four-pages` off main `3c685d1`; nothing pushed, nothing published.

## Commits on the branch (oldest first)

S0 rails · R5/S1 reviews · S2 areas · R4 cards · R3 grid+resolver · R1 preload · R1/R2/R3
record + 28 assets · R-evidence · HANDOFF · R3 image-spec key rule · S1 no-stretch · R3 set
order (1600px first) · R3/crit8 removal-c sizes · R3 grid breakpoint 768 · P-scope (page 2
draft + decision 15) · R-evidence (final build). Working tree clean.

## Page-1 results on the final build (7ca924e), all in `docs/batch-four-pages/j-valdez-removal-a/`

- Guards 12/12. Criterion 8 on the nine changed pages: clean except five PRE-EXISTING
  lines on j-valdez/removal-b and summit/removal-a (same on live; decisions 14).
- 55-page phone/GTM compare: ZERO differences (183 tel, 373 data-dni, 367 numbers, 68 GTM).
- Prerender diff: 11 of 55 pages; 3 protected (target; ttt removal-a template-wide; jv
  trimming-a = hero-photo-2's focal only). Every page explained in the file.
- Bundle +912 B gzip (JS +1111 = record data; CSS −199).
- Lighthouse before: 98 / 1.85 s / 602,973 image bytes. After: PENDING.
- Built-page measurements: hero #112d25, no plate, no photo preload; proof cells at their
  focal points; six uniform cells 170×128 / 237×178 / 353×265, no grey; cards 4:3, 0 dead
  space; 10 chips/10 unique; 0 of 9 reviews cut, cards fit their text, button 14 px under.
- Decisions 1–15 in decisions.md.

## EXACT NEXT ACTION

1. When the Lighthouse-after subagent reports: read the two files it wrote; write
   `summary.md` (before vs after: score, LCP, first-viewport image bytes; state the LCP
   element after = hero text); if score, LCP or bytes regressed and cannot be recovered,
   STOP (amendment §3). Commit `R-evidence: lighthouse after + summary`.
2. Page 2, J Valdez trimming-a: measure the ⏳ items in its scope.md on the LIVE page at
   390/820/1440 (P1 gap `.ta-gallery`→`.ta-benefits`; grid cell boxes; review track). Take
   before-screenshots of `.ta-gallery`,`.ta-benefits`,`.ta-why`,`.ta-doneright`. Ingest
   IMG_1117 (focal ≈0.30,0.30), PXL_20260407_145030926 (0.50,0.45), IMG_1116 (0.35,0.45)
   into photos.trimming with plain alts (replica ingest script pattern is in
   `$SP/…/removal-entries.json`'s producer; rewrite it for these three). Build P1, S1, S3;
   pins as needed so trimming-a's Recent jobs band and hero band do not change except where
   scoped. Same evidence set into `docs/batch-four-pages/j-valdez-trimming-a/`. One commit
   per item (P1:, S1:, S3:). Then pages 3 and 4.
3. End: `docs/batch-four-pages/REPORT.md`, then hold for one approval; remove the hook
   (both entries) only after approval; publish only then.

## Tooling (scratchpad; recreate if gone)

`SP=/tmp/claude-501/-Users-faizanumer-tree-template-factory/bb29fa72-5baf-4823-966b-81f43983f0cc/scratchpad`
- `$SP/probe/cdp.mjs` — headless Chrome harness; **blocks every tracker on every page load
  by default** (the clients' real GTM containers are in the local builds — never load a
  page unblocked). `sections.mjs`, `crit8.mjs`, `afterC.mjs`, `crops.mjs`, `serve.mjs`.
- `$SP/run-guards.mjs pre|post` — the 12 guards. `$SP/compare55.py`, `$SP/stagehunks.py`,
  `$SP/hunks.py` — per-item staging. `$SP/pages-ship/` — normalised live build (e3394aa)
  for prerender diffs; `$SP/removal-entries.json` — the ingested photo entries.
- Lighthouse method (August): `vite preview` (gzip), `--throttling-method=devtools
  --form-factor=mobile --only-categories=performance --chrome-flags="--headless=new"`,
  `--blocked-url-patterns` for googletagmanager, google-analytics, googleadservices,
  doubleclick, callrail, calltrk, leadconnectorhq, msgsndr.

## Hard constraints (unchanged)

No phone number, `data-dni`, GTM id or record phone field changes — proven by the 55-page
compare before each gate. hero-photo-2 and gallery-slide-5 stay in every slot. No review
text written or changed. Never log into the studio. Never load a client page in a browser
without the tracker block. Publish only after the owner approves the whole batch and the
hook is removed.
