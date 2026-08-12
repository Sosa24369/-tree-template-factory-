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

## Task 2 — conversion tracking · ✅ done · commit follows T1's

- **Lead conversion**: the existing `generate_lead` push (fires only on
  `/api/lead` success — never click, never request-start, no thank-you-URL
  trigger anywhere) now carries `transaction_id`: a non-PII submission id
  minted inside the submit handler (StrictMode cannot double-mint) and kept in
  sessionStorage per (client, template, session), so refresh / retry /
  back-nav / remount all reuse it and Ads counts one conversion. Deliberate
  consequence written into the code: a second genuine lead from the same
  visitor+template+session shares the id — one conversion, honestly counted.
- **GTM**: injected at prerender from `tracking.gtmContainerId` per client —
  never hardcoded in components (a verify check greps for that), shape-checked
  before injection, absent from the neutral root/404. A `page_context` push
  precedes gtm.js so tags can key on client/template.
- **CallRail**: primary for calls; loads once per document from per-client
  `callRailSwapScriptUrl` (currently null for every client — a console task),
  re-swaps on every route change including thank-you. Phone clicks remain
  `click_to_call` engagement events; nothing wires them to a conversion.
- **Attribution end-to-end**: all four click ids + five UTMs now flow into
  the GHL payload wherever `crm.attributionFieldIds` maps a real field id,
  and into `droppedFields` (value preserved, reason stated) where it doesn't.
  No invented IDs anywhere: every console-minted value is an exact click-path
  instruction in `docs/TRACKING_MANUAL_LIST.md` (Ads conversion action + GTM
  tag/trigger/variables + Conversion Linker per container, CallRail swap URL,
  optional GHL custom fields).
- **Verified**: `scripts/verify-tracking.mjs` — 81 checks (per-page GTM
  isolation incl. no-cross-client-container, dropped-field preservation,
  source rules); `test-lead-function.mjs` still 24/24; `tsc` clean; a
  wrangler-dev dry-run POST produced the `[GHL_DRY_RUN]` record with
  submissionId + attribution. Nothing was sent to GHL.

## Task 3 — adversarial review of the lead path · ✅ done · commit after T2

Ran an independent attack pass alongside my own. **No cross-client write is
reachable** — both the GHL location id and the token env-key are derived from
the same request slug, never from the body — and the GHL payload is
`JSON.stringify`'d, so there is no value-injection sink. Real issues found and
**fixed** (all low-risk, committed):

- **templateId tag injection.** It was validated only against the exclusion
  list, so any `templateId` was reflected into a GHL tag `lp-<anything>`. Now
  validated against the canonical template set (unknown → `lp-unknown`;
  non-string → 400, which also closes an array-coercion bypass of the
  exclusion check).
- **Prototype-key slugs.** `clientSlug:"__proto__"` (or `constructor`,
  `toString`) resolved to `Object.prototype` and slipped past the "unknown
  client" guard (dead-ended at the token step, but the invariant was false).
  Now an `Object.hasOwn` lookup → 400.
- **Unbounded fields.** firstName/lastName/email were forwarded to GHL
  verbatim with no cap; now length-capped with control chars collapsed.
- **envKey collision.** Registry generation now asserts no two slugs collapse
  to the same `GHL_PIT_*` secret — a future client file cannot silently pair
  one client's location with another's token.
- **Client double-submit race.** The `status`-state guard let two rapid
  clicks both POST; added a `useRef` latch (released on error, held through
  success navigation).

Registry reshaped to `{ knownTemplates, clients }`. Tests: `test-lead-
function.mjs` 34/34 (10 new adversarial cases), `verify-tracking` 82, tsc
clean. **Two judgment calls sent to OVERNIGHT_QUESTIONS.md** rather than
guessed: (Q1) `/api/lead` is an open unauthenticated endpoint — bot/abuse
control is a design+cost decision; (Q2) server-side replay enforcement vs.
relying on GHL's phone-upsert. Lower-severity items left as-is with reasons:
client enumeration via error differential (slugs are already public in URLs).

*(Report continues below as tasks complete.)*
