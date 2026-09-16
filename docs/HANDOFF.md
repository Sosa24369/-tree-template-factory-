# HANDOFF — batch/four-pages, written mid-run 2026-09-16

Read this, then `docs/batch-four-pages/{four-page-spec.md, amendment.md, removal-a-scope.md,
decisions.md}`, before touching anything. The amendment (unattended run, one gate at the end)
is the operative instruction; the spec holds everything else.

## Where the run is

**Pages 1 and 2 (J Valdez removal-a, trimming-a): COMPLETE**, all evidence committed
(page 1: 98→99 / 1.85→1.72 s / 602,973→381,865 B; page 2: 98→98 / 1.85→1.85 s / 87,834 B
unchanged). **Page 3 (Texas Tree Tops removal-a, PROTECTED): EDITS COMMITTED (T3 sixth cell,
T5 alt text, decisions 22–24, before-*.png), NOT YET BUILT OR VERIFIED.** A Lighthouse-BEFORE
subagent is measuring main (3c685d1) for this page; the build is held until it reports.
**Page 4 (TTT storm-a): not started.**

Rails complete and proven (hook in `.claude/settings.json` AND `~/.claude/settings.json`;
both entries out only after the owner approves). Branch `batch/four-pages` off `3c685d1`;
nothing pushed, nothing published. Working tree clean.

## What page 3 changed (committed, unbuilt)
- T3: `photoSlots.removal-a.mosaic.6 = restoration-photo-1` on the TTT record (decision 22).
- T5: three stock alts on the TTT record; Summit's stock alts corrected (12 entries);
  `slotAlt()` prefers a record alt (also changes JV removal-a's hero-proof.2 alt →
  re-run page 1's diff/compare); Benefits template art gets a neutral alt
  (`BENEFIT_ART_ALT`); guard in `scripts/verify-image-spec.mjs` (decision 24).
- Already applied by pages 1–2 and only needing evidence here: T1 (S1 slider), T2 (S2
  static chips), R4 cards, R5 button, one-rule grid. T4 measured NOT REAL (decision 23).
- Live measurements are in the chat only: reviews 5/9 cut; 50/25 chips masked; grid two
  439 px grey bands at 1440; services dead space up to 362 px at 820; rail first item
  reachable at all widths; hero plate = gallery-02, a 680 px file at 1440×1192 (report only).

## EXACT NEXT ACTION
1. When the TTT removal-a Lighthouse-before subagent reports: `cd app && npm run build`.
2. Verify on the build (server 4178, tracker-blocked harness): 0/9 reviews cut, whole
   cards; 25 chips once, no mask; six uniform grid cells, no grey, cell 6 =
   restoration-photo-1; services dead space 0, 4:3; button present; hero unchanged.
   After-screens (why, areas, restoration, gallery, services); crops for mosaic.6; guards
   12/12 (the new stock-alt guard included); criterion 8 on every page the diff names;
   prediff.py with whys for: TTT removal-a (target), JV removal-a (hero-proof.2 alt),
   Summit removal-a/-b/-c/agnostic/storm-*/trimming-* (stock alts), TTT trimming-a and
   agnostic (stock alts), TTT removal-c (parity/sizes, already); bundle.txt; compare55.py;
   Lighthouse-AFTER (subagent, vite preview 4182); summary.md; commit `T-evidence`.
   Re-run page 1's `prerender-diff.txt` and `phone-gtm-compare.txt` (slotAlt changed its
   HTML by one alt) and commit.
3. Page 4, TTT storm-a (PROTECTED): T6 (S1 via `.storm` scope — evidence), T7
   (`components/ServiceAreasCarousel.tsx` → static list, 50→25 chips, first item
   reachable), no S3. Scope, before-screens, build, verify, evidence, Lighthouse
   before/after, commits (T6:, T7:).
4. End: `docs/batch-four-pages/REPORT.md`; hold for one approval; remove the hook (both
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
