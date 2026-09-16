# HANDOFF — batch/four-pages, written mid-run 2026-09-16

Read this, then `docs/batch-four-pages/{four-page-spec.md, amendment.md, removal-a-scope.md,
decisions.md}`, before touching anything. The amendment (unattended run, one gate at the end)
is the operative instruction; the spec holds everything else.

## Where the run is

**Pages 1–2: COMPLETE.** **Page 3 (Texas Tree Tops removal-a): BUILT AND VERIFIED, waiting
only on its Lighthouse-after subagent** (before: 98 / 1.90 s / 441,941 B). Evidence committed
except lighthouse-after.json, lighthouse-after-summary.txt, summary.md. **Page 4 (TTT storm-a):
scope.md committed; nothing built.** Working tree clean.

Rails complete and proven (hook in `.claude/settings.json` AND `~/.claude/settings.json`;
both entries out only after the owner approves). Branch `batch/four-pages` off `3c685d1`;
nothing pushed, nothing published.

## Page-3 results on the build (f07ebc9 state)
- 0/9 reviews cut, whole cards 1/2/3, button present; 25 chips once, no mask, none clipped;
  six uniform cells (170×128 / 237×178 / 353×265), no grey, cell 6 = restoration-photo-1;
  cards 4:3, dead space 0; hero unchanged (gallery-02 plate, gallery-03/04 proof); stock
  photos and the Benefits artwork now carry descriptive alts; JV removal-a's proof cells carry
  their record alts.
- Guards 12/12 (new stock-alt guard included); criterion 8 clean on 300 boxes except the
  pre-existing Summit rail lines; compare zero on 55; diff 22 pages (11 alt-only, labelled);
  bundle +1,597 B for the batch. Decisions 22–24.

## EXACT NEXT ACTION
1. When the TTT removal-a Lighthouse-after subagent reports: write
   `docs/batch-four-pages/texas-tree-tops-removal-a/summary.md` (before/after; LCP element =
   hero text; note "left alone": gallery-02 hero plate is a 680 px file at 1440×1192, the
   grid's five gallery-0x photos are 382–680 px files, TTT bg-* section art; T4 not real);
   stop if score/LCP/bytes regressed unrecoverably; commit `T-evidence: lighthouse after + summary`.
2. Page 4, TTT storm-a (PROTECTED): live measurements + before-screens (reviews section,
   `.st-areas`) at 390/820/1440; T7: rewrite `components/ServiceAreasCarousel.tsx` as one
   static wrapped `<ul>` (dedupe case-insensitively, keep `role="group"`/aria-label), and
   `styles/service-areas-carousel.css` as a wrapped chip list (no mask, no animation, no
   negative margin, keep chip look); this reaches storm-a/-b/-c, agnostic, removal-b,
   trimming-b, removal-c, trimming-c for all clients — explain each in the diff. T6 is
   already applied (`.storm` scope). Build, verify (0 cut, whole cards; 25 chips once, none
   clipped, first reachable), evidence set, Lighthouse before (subagent, main 3c685d1) and
   after, commits `T7:`, `T-evidence`.
3. End: `docs/batch-four-pages/REPORT.md` (one section per page linking its folder, the
   decision log, the left-alone list); hold for one approval; remove the hook (both entries)
   only after approval; publish only then.

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
