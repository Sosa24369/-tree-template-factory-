# HANDOFF — batch/four-pages, written mid-run 2026-09-16

Read this, then `docs/batch-four-pages/{four-page-spec.md, amendment.md, removal-a-scope.md,
decisions.md}`, before touching anything. The amendment (unattended run, one gate at the end)
is the operative instruction; the spec holds everything else.

## Where the run is

**Amendment section 1 — the per-page loop. Page 1 of 4: J Valdez removal-a. Build done,
verification mostly done, two fixes outstanding, then evidence completion, then page 2.**
Pages 2–4 (JV trimming-a, TTT removal-a, TTT storm-a) are not started and not yet scoped
against the spec.

Section 0 (rails) is complete and proven:
- Hook: `.claude/hooks/block-publish.py` registered in `.claude/settings.json` (committed)
  AND in `~/.claude/settings.json` (the live one this session; guarded to this repo). Proven:
  `git push origin main --dry-run` and one real `wrangler pages deploy …` attempt were both
  refused in-session (verbatim in the chat and decisions.md 7). Remove BOTH entries only when
  the owner approves the batch. Cloudflare Pages is direct-upload (not git-connected).
- Branch `batch/four-pages`, off main at `3c685d1`. Nothing pushed. Nothing published.
- Durable copies + `decisions.md` (11 entries so far) in `docs/batch-four-pages/`.

## Files changed — all COMMITTED on batch/four-pages unless marked

One commit per item (`git log --oneline main..HEAD`): S0 rails · R5/S1 reviews · S2 areas ·
R4 services · R3 grid + resolver · R1 preload · R1/R2/R3 record + 28 asset files
(`app/public/assets/j-valdez/removal-*.webp`) · R-evidence.

| file | item |
|---|---|
| `app/src/templates/removal-a/removal-a.css` | R3 one grid rule; R4 4:3 cards; R5 reviews CSS + button; S2 static areas |
| `app/src/templates/removal-a/sections/Areas.tsx` | S2 static list, dedupe |
| `app/src/templates/removal-a/sections/Services.tsx` | R4 wrapperClassName |
| `app/src/templates/removal-a/sections/WhyChoose.tsx`, `copy.defaults.ts` | R5 button + `why.reviewsLink` |
| `app/src/templates/removal-c/page.tsx`, `removal-c.css` | copy-parity link |
| `app/src/lib/placement.mjs` | explicit key past a fixed-count slot adds a cell |
| `app/scripts/prerender.mjs` | empty LCP slot → logo preload, no first-still fallback |
| `clients/j-valdez.json` | photos.removal (7), hero-photo-2 focal, 26 photoSlots.removal-a keys |
| `docs/batch-four-pages/**` | spec, amendment, scope, decisions, evidence |
| `.claude/settings.json`, `.claude/hooks/block-publish.py` | rails |

Uncommitted: nothing intended. `~/.claude/settings.json` (outside the repo) carries the
live hook entry.

## Suites run on the current build (working tree = HEAD of the branch)

- **Guards: 11/12.** `image-spec` FAILS with exactly two violations (decisions.md 8):
  (a) `photos.removal[0] is 1320 px wide, removal-a hero-plate needs 1600`; (b)
  `photoSlots.removal-a.mosaic.6 is not a slot on removal-a`. Other 11 pass.
- **Criterion 8:** 153 image boxes on the three changed live-template pages, all within
  10% — but the check script only covers jv/trimming-a, jv/removal-a, ttt/trimming-a; extend
  it to ttt/removal-a and summit/removal-a (both change) before calling it done.
- **55-page phone/GTM compare:** ZERO differences (evidence file written).
- **Prerender diff:** 11 of 55 pages change; 3 protected (jv removal-a = target, ttt
  removal-a = template-wide CSS/button, jv trimming-a = hero-photo-2's focal point only).
  The three "?? not anticipated" lines in `prerender-diff.txt` (jv trimming-a/-b/-c) are
  the focal point's `object-position` on hero-photo-2 — rewrite those lines to say so.
- **Bundle:** JS +1095 B, CSS −204 B = +891 B gzip vs live (ceiling 3 KB/batch). The JS
  growth is the record data (7 photo entries with pipeline blocks + 26 pins) bundled in.
- **Lighthouse before:** 98 / LCP 1.85 s / first-viewport image bytes 602,973 (baseline
  files in the evidence folder). **Lighthouse after: NOT RUN YET.**
- **After-measurements (built page, DPR 2):** hero #112d25, no plate, no photo preload;
  proof cells at focal 45%/48% and 60%/50%; six uniform grid cells (170×128 / 362×272 /
  353×265), no grey; cards 4:3, dead space 0; 10 chips / 10 unique, none clipped; 0 of 9
  reviews cut, button 14 px under; no horizontal overflow.

## Decisions taken in the owner's place — all in `docs/batch-four-pages/decisions.md`

Entries 1–11. The ones that shape the next steps: 8 (guard fixes), 9 (S1 no-stretch), 3
(pins keep the rail/services unchanged), 4 (IMG_1119 original instead of work-photo-1).

## EXACT NEXT ACTION (in order)

1. In `clients/j-valdez.json`, move the `removal-boom-over-house-nf3-*` entry (1600×1200)
   to index 0 of `photos.removal`. Grid cells are explicit (`mosaic.1–6`) so the grid does
   not change; jv removal-b/-c/agnostic will re-order (they read the set by position) —
   note it in prerender-diff.txt.
2. In the image-spec guard (find the `is not a slot on` message under `server/` or
   `app/image-checks.mjs`), accept a numeric key past a fixed `cells` count, mirroring
   `placement.mjs` (`explicitMax`). Commit as `R3: image-spec accepts a key past a fixed-count slot`.
3. Add `.removal-a .rvs-track { align-items: flex-start; }` to removal-a.css next to the
   R5 block (decision 9). Commit `S1: removal-a review cards fit their own text`.
4. `cd app && npm run build`; re-run the guards script (`$SP/run-guards.mjs pre` and `post`
   — scratchpad tools listed below) → overwrite `guards.txt`; re-run criterion 8 with
   ttt/removal-a and summit/removal-a added; re-run the after-measurement probe and the
   after-screenshots (reviews section changes); regenerate `prerender-diff.txt`.
5. Lighthouse AFTER in a subagent (same method as the baseline; serve `app/dist` via
   `npx vite preview --port 4182 --strictPort` from app/; 1 warm-up + 3 runs; median →
   `lighthouse-after.json`; write `summary.md` with before/after score, LCP, first-viewport
   image bytes; no regression on any of the three or STOP).
6. Re-run the 55-page compare (subagent, `compare55.py`) — zero differences or STOP.
7. Commit updated evidence. Page 1 done. Then page 2: JV trimming-a — scope it against the
   spec (P1 gap after the proof rail, S1/S2/S3 there, the 10-vs-8 cities mismatch), build,
   same evidence set into `docs/batch-four-pages/j-valdez-trimming-a/`.

Stop conditions (amendment §3) still apply throughout. Reviews stay stubbed.

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
