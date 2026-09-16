# HANDOFF — batch/four-pages, written mid-run 2026-09-16

Read this, then `docs/batch-four-pages/{four-page-spec.md, amendment.md, removal-a-scope.md,
decisions.md}`, before touching anything. The amendment (unattended run, one gate at the end)
is the operative instruction; the spec holds everything else.

## Where the run is

**Page 1 (J Valdez removal-a): COMPLETE.** Lighthouse 98→99, 1.85→1.72 s, 602,973→381,865 B.
**Page 2 (J Valdez trimming-a): BUILT AND VERIFIED, waiting only on its Lighthouse-after
subagent** (before: 98 / 1.85 s / 87,834 B). Evidence committed except lighthouse-after.json,
lighthouse-after-summary.txt and summary.md. **Page 3 (TTT removal-a) and 4 (TTT storm-a): not
started** — page 3 prep (library listing, T5 specifics) was being read when this was written.

Rails complete and proven (hook in `.claude/settings.json` AND `~/.claude/settings.json`;
both entries out only after the owner approves). Branch `batch/four-pages` off `3c685d1`;
nothing pushed, nothing published. Working tree clean at `341f13b`.

## Page-2 results on the final build (66c3db4)
- P1 seam = one `--ta-pad` (54/66/108 px; was 108+108 at 1440). S3: six uniform cells
  (171×128 / 365×274 / 352×264): work-photo-1, IMG_1116 climber (also the blurb photo —
  Longform renders grid[1], decision 20), work-photo-3, work-photo-4, PXL lake slope,
  IMG_1117 limbs over roof. Band and hero band unchanged. S1: 1/2/3 whole cards, no partial,
  no stretch, 0 cut — on trimming-a AND removal-a (scoped shared rule; removal-a's
  after-why-*.png refreshed). Chips 10/10.
- Guards 12/12; criterion 8 clean on 309 boxes (trimming-c's missing sizes fixed, decision
  21); compare zero on 55; diff 11 pages (same set as page 1; JV trimming-a 26 lines);
  bundle +1,545 B for the batch so far.
- Decisions 16–21 logged.

## EXACT NEXT ACTION
1. When the trimming-a Lighthouse-after subagent reports: write
   `docs/batch-four-pages/j-valdez-trimming-a/summary.md` (before/after score, LCP, image
   bytes; LCP element = hero text; note the accepted repeat gallery-slide-3 in hero band +
   band); stop if score/LCP/bytes regressed unrecoverably; commit `P-evidence: lighthouse after + summary`.
2. Page 3, TTT removal-a (PROTECTED): write scope.md against the spec's T1–T5. Already
   applied by the shared/template work and needing only evidence: T1 (S1 slider), T2 (S2
   static list: 25 chips once), R3-CSS grid (five cells → needs a sixth: `photoSlots.removal-a
   .mosaic.6` from the 24-photo removal library first — pick a removal-class, non-composite,
   ≥706 px-wide file; the library listing was being read), R4 cards, R5 button. T4: measure
   the 24-item rail's first-item reachability at 390/820/1440 live (earlier probe: reachable).
   T5: record alts for `_shared/services-card-photo-1/2/3` (plain descriptions from
   docs/ALT-TEXT-ITEM.md), `slotAlt()` to prefer a record alt before composing (this also
   changes JV removal-a's hero-proof.2 alt → re-run page 1's diff/compare), a guard in
   scripts/verify-image-spec.mjs failing any `_shared/`/`_template/` photo whose alt names
   the client, Summit's two inaccurate alts. Before-screenshots live (why, areas,
   restoration, services, rail), build, verify, evidence, Lighthouse before/after
   (subagents), commit per item (T1:, T2:, T3:, T4:, T5:).
3. Page 4, TTT storm-a (PROTECTED): T6 (S1 — already applied via `.storm` scope, evidence),
   T7 (S2 — `components/ServiceAreasCarousel.tsx` static list, 50→25 chips, first item
   reachable), no S3. Same evidence set.
4. End: REPORT.md; hold; remove hook (both entries) only after approval; publish only then.

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
