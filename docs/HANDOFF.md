# HANDOFF — batch/four-pages, the hold is DONE bar the last numbers (2026-09-17)

Read `docs/batch-four-pages/REPORT.md` (the gate section, then "The hold" below its rule)
and `hold/sweep-table.md`. All five parts of the owner's second instruction are complete:

1. Check fixed, red then green; guards `image-boxes` (post) + `rendered`/`call-bar` (rendered
   phase, this machine). 2. Call bar: observer + footer spacer + full-ink sub-label; 27/27
   pages clean. 3. Areas: alphabetical grid, computed columns, no lonely last row; both
   templates' own lists replaced by the shared component. 4. Sweep: 27 rows, 22 fixed (one
   partly), 5 needs-photo; one commit per row (`git log --oneline | grep 'Sweep'`); two
   off-page grids and a guard blind spot fixed (decisions 48). 5. Evidence pack re-run on the
   final build: compare zero; pre 6/6, post 7/7, rendered 2/2; criterion 8 clean; diff 28
   pages labelled; bundle +2,732 B of 3,072. Committed (d8a8066).

STILL OPEN at the moment of writing: the Lighthouse ×4 subagent on the final build (writes
`<folder>/lighthouse-after.json` + `-summary.txt`); then replace `@@LH@@` in REPORT.md with the
four before→after rows, add a "hold" addendum to each `<folder>/summary.md`, commit
"Hold evidence: Lighthouse after ×4 + summaries", refresh this file, and HOLD for the owner.

Guard stays on until the owner has read the REPORT. Nothing pushed, nothing published.
Decisions 29–48 in decisions.md.

DO NOT BUILD while a background run is reading app/dist. Guard stays on; nothing pushed.


Read `docs/batch-four-pages/REPORT.md` first; it is the deliverable and links every folder.
Then `amendment.md` (operative), `four-page-spec.md`, `removal-a-scope.md`, `decisions.md`.

## Where the run is

**All four pages COMPLETE and verified on the final build; the batch is HELD for the owner's
one approval.** Branch `batch/four-pages` at `0607178`, 45 commits on `main` (`3c685d1`),
fast-forwardable. Working tree clean. Nothing pushed, nothing published. The publish guard
is active in `.claude/settings.json` and `~/.claude/settings.json` (script
`.claude/hooks/block-publish.py`).

## Final-build numbers (see REPORT.md)
- Compare: 55 pages, zero differences. Guards 12/12. Diff 28 of 55 pages, every row labelled.
  Bundle +1,527 B gzip of 3,072. Lighthouse: p1 98→99 / 1.85→1.72 s; p2 unchanged;
  p3 98→98 / 1.90→1.90 s, image bytes −55,836; p4 99→99 / 1.74→1.73 s.
- Decisions 1–28 in decisions.md (+ the hook log: three false positives, no publish attempted).
- Decision 28 (late find): page 1's removal set had cascaded into J Valdez agnostic /
  removal-b / removal-c and dropped the truck and the yard sign from three pages; pinned
  back to live on the record, re-verified, page 1's diff and compare refreshed.

## EXACT NEXT ACTION
1. **Wait for the owner.** Do not publish, push, merge or remove the hook without the
   approval in the owner's own words. If they ask for changes, make them on this branch,
   re-run the set (compare, guards, criterion 8, diff, bundle, Lighthouse on the touched
   page), update the page folder, decisions.md and REPORT.md, and hold again.
2. On approval, in order (REPORT.md "After your approval"): remove the guard (both settings
   entries + the script) in one commit → `git checkout main && git merge --ff-only
   batch/four-pages && git push origin main` → publish by the owner's choice (studio
   Publish click with its four protected-route confirmations, or the Pages direct upload
   from a main build on their word) → re-run the 55-page compare against live and
   Lighthouse on the four live URLs → deploy record in the BUILD-LOG.
3. Stage 4 stays paused; do not write the 4b prediction.

## Tooling (scratchpad; recreate if gone)
`SP=/tmp/claude-501/-Users-faizanumer-tree-template-factory/bb29fa72-5baf-4823-966b-81f43983f0cc/scratchpad`
- `$SP/probe/cdp.mjs` — headless Chrome harness; **blocks every tracker on every load**
  (the clients' real GTM containers are in the local builds — never load a page unblocked).
  `sections.mjs` (screens), `crit8live.mjs` (criterion 8, BASE env), `sacAll.mjs` (areas
  list on routes), `scopeStorm.mjs`, `serve.mjs <dir> <port>`.
- `$SP/run-guards.mjs pre|post` — the 12 guards. `$SP/compare55.py /tmp/live55 app/dist <out>`.
- Diff: `zsh $SP/pagediff.sh $SP/pages-now` (hash-normalised snapshot) then
  `python3 $SP/prediff.py $SP/pages-ship $SP/pages-now <out>` (labels live in the script).
  Running prediff on `app/dist` directly lists every page (bundle hashes) — don't.
- Lighthouse (August method): `vite preview` (gzip), `--throttling-method=devtools
  --form-factor=mobile --only-categories=performance --chrome-flags="--headless=new"`,
  `--blocked-url-patterns` for googletagmanager, google-analytics, googleadservices,
  doubleclick, callrail, calltrk, leadconnectorhq, msgsndr; 1 warm-up + 3 runs, median.
- The hook matches its regex anywhere in a Bash command except heredoc bodies: don't put
  the deploy command's name in grep patterns or commit messages outside a heredoc.

## Hard constraints (unchanged)
No phone number, `data-dni`, GTM id or record phone field changes — proven by the 55-page
compare. hero-photo-2 and gallery-slide-5 stay in every slot they occupy (now checked page
by page against live, not only on the target page). No review text written or changed.
Never log into the studio. Never load a client page without the tracker block. Publish only
after the owner approves the whole batch and the hook is removed.
