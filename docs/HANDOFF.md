# HANDOFF — batch/four-pages, written mid-run 2026-09-16

Read this, then `docs/batch-four-pages/{four-page-spec.md, amendment.md, removal-a-scope.md,
decisions.md}`, before touching anything. The amendment (unattended run, one gate at the end)
is the operative instruction; the spec holds everything else.

## Where the run is

**Page 1 (J Valdez removal-a): COMPLETE** — evidence folder full, Lighthouse 98→99, 1.85→1.72 s,
602,973→381,865 image bytes; summary.md written; all committed.

**Page 2 (J Valdez trimming-a): EDITS COMMITTED (P1, S1, S3, decisions 16–19, before-*.png),
NOT YET BUILT OR VERIFIED.** A Lighthouse-BEFORE subagent is measuring main (3c685d1) for this
page; the build is held until it reports so its timings are clean. Pages 3–4 not started.

Section 0 (rails) complete and proven: hook in `.claude/settings.json` (committed) AND
`~/.claude/settings.json` (live this session; guarded to this repo) — both come out only when
the owner approves the batch. Branch `batch/four-pages` off main `3c685d1`; nothing pushed,
nothing published.

## What page 2 changed (committed, unbuilt)
- P1: `.ta-process + .ta-gallery` bottom pad = ½ `--ta-pad`; `.ta-gallery + .ta-benefits`
  top pad = ½ (seam was 108+108 px at 1440 live; regression from B9+B10).
- S1: `styles/reviews-slider.css` gained a block scoped to `.trimming-a, .removal-a, .storm`:
  whole cards (1 / 2 / 3 per view at <768 / 768–1023 / ≥1024), height auto, no clamp,
  `align-items: flex-start`. The per-template unclamp rules were removed from trimming-a.css
  and removal-a.css. → removal-a's `after-why-*.png` and its review measurements must be
  refreshed (decision 17); storm-a's reviews change visually too (page 4 evidences it).
- S3: `.ta-mosaic` = six uniform 4:3 cells (2 cols <980, 3 cols ≥980, no feature tile).
  Record: photos.trimming 12→15 (trimming-limbs-over-roof-img1117, trimming-lake-slope-
  pxl145030926, trimming-climber-creek-img1116; 12 new asset files); photoSlots.trimming-a:
  hero-band.2, gallery.1–5, gallery.6='' , gallery.7='' (share(15)=7), grid.1–6 (work-photo-1,
  limbs, work-photo-3, work-photo-4, lake, gallery-slide-4), longform = climber.
- Expected diff: trimming-a ×3 clients (CSS+HTML for JV), removal-a ×3 (CSS only → HTML
  unchanged), storm ×3 (CSS only), plus any JV page reading photos.trimming by position:
  trimming-b, trimming-c, agnostic, removal-b/c (cascade) — check each in prerender-diff.

## EXACT NEXT ACTION
1. When the Lighthouse-before subagent for trimming-a reports (files land in
   `docs/batch-four-pages/j-valdez-trimming-a/`): `cd app && npm run build`.
2. Verify on the build (server on 4178, tracker-blocked harness): P1 gap = one `--ta-pad`
   (54/66/108); Recent jobs band still exactly gallery-slide-1..5; hero band unchanged
   (gallery-slide-3, hero-photo-2); grid six uniform cells with the new photos; longform =
   climber; reviews: 1/2/3 whole cards per view, no partial card, no stretch; chips 10/10.
   Take after-screenshots (gallery, benefits, why, done-right), crops for grid.2, grid.5,
   longform (+ grid.1/3/4/6 for completeness), guards, criterion 8 on every changed page,
   prediff.py (add whys for trimming-b/-c, agnostic, removal-b/-c, storm ×3 if present),
   bundle.txt, compare55.py, then Lighthouse-AFTER (subagent, vite preview 4182), summary.md.
   Refresh page 1's after-why-*.png + measurements. Commit evidence.
3. Page 3 (TTT removal-a): scope T1–T5 against the spec, then build. Page 4 (TTT storm-a): T6–T7.
4. End: `docs/batch-four-pages/REPORT.md`; hold for one approval; remove hook (both
   entries) only after approval; publish only then.

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
