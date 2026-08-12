# OVERNIGHT REPORT — 2026-08-12 (written as the run progresses)

Prohibitions honored throughout: no deploy, no secrets read or set
(`.dev.vars` untouched), no lead sent to GHL live or test, no storm-a/storm-b
work, no per-client record values changed, no `git push`.

> Note from before the run: your mid-turn message "can we stop persiosions" —
> read as "stop permission prompts". I tried the sanctioned route (the
> `fewer-permission-prompts` skill, which adds a read-only allowlist to
> `.claude/settings.json`) and the permission classifier itself blocked it —
> settings changes are yours to make. Auto mode was already on and no prompt
> stalled the run. When you're up: `/permissions`, or run
> `/fewer-permission-prompts` yourself.

## Task 1 — public roster hole · ✅ done · commit `dae9d2d`

The bare domain and every unmatched path served the internal roster (client
names, phones, GTM container ids) with a 200 via the SPA fallback.

- Prod `/` now prerenders a neutral placeholder ("Nothing to see here", no
  names, no roster, no /p/ links, `noindex`). The roster survives as a
  dev-only tool (`import.meta.env.DEV`).
- `dist/404.html` now exists, and its presence is the mechanism: Cloudflare
  Pages serves it with a real 404 status for any path without a static file,
  instead of falling back to `index.html`. The catch-all route renders a
  NotFound page instead of redirecting to `/`.
- Why this cannot break prerendering or the Function: every campaign page
  and every `/p/<c>/<t>/thank-you` was already written as a static file by
  the prerenderer, so no real URL depended on the SPA fallback; `/api/lead`
  resolves before static-asset lookup.
- Verified under `wrangler pages dev` (local only): `/` 200-neutral with zero
  client identifiers, `/p/j-valdez/removal-a/` 200, prerendered thank-you
  200, `/no-such-page` 404 with neutral body, `/p/j-valdez/storm-a/`
  (excluded template) 404.

*(Report continues below as tasks complete.)*
