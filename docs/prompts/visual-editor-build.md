# Claude Code Prompt — Constrained Visual Editor + Railway Deploy

> Paste below the line into Claude Code inside `~/tree-template-factory`.

---

You are continuing work in the **tree-template-factory** repo. Read the last three
sections of `docs/BUILD-LOG.md` before writing anything — they are the current state.

## What exists

- 10 React templates (`removal/trimming/storm` × `a/b/c`, plus `agnostic`) render from
  per-client JSON in `/clients`, prerender to static HTML (`app/scripts/prerender.mjs`),
  and deploy by direct upload (`wrangler pages deploy dist`) to
  `tree-template-factory.pages.dev`.
- A local, dev-only dashboard: `app/src/dashboard/` (React) + `app/dashboard-server.mjs`
  (a Vite plugin, `apply: 'serve'`, so it cannot exist in a build). Schema-driven form
  over the client JSON, live preview in an iframe via `postMessage`, photo upload
  through the sharp pipeline, diff-before-save that writes the file and `git commit`s.
  It has no auth.
- Section order inside each template is hardcoded JSX in `app/src/templates/<id>/index.tsx`
  (or `page.tsx` for the `-c` templates, or `storm-a/StormPage.tsx` shared by all storm
  templates). There is no layout data anywhere.
- Verifiers in `scripts/`: `verify-factory-rules.mjs`, `verify-r4-leakage.mjs`,
  `test-lead-function.mjs`, `verify-faq-a11y.mjs`, `verify-source-fidelity.mjs`,
  `verify-tracking.mjs`. All pass at HEAD.

## What you are building

A constrained visual editor, deployed to Railway behind a login, that lets a non-engineer
shape a client's pages while the templates keep owning layout — so nothing a user does
can break responsive rendering at 375px, the Lighthouse numbers, or the A/B controls.

Real dragging where it is safe (section order, photo order, a photo's focal point).
Tokens where free-form would break (`S/M/L/full` sizes, a fixed font list, a spacing
scale). This is deliberately not a drag-anything builder: free-form placement and
reliable responsive design are in direct tension, and this project chose responsive.

## Locked decisions — document them, do not re-litigate

1. **Layout is data.** Add to `app/src/schema/client.ts`:

   ```ts
   export type SizeToken = 'S' | 'M' | 'L' | 'full';
   export interface SectionLayout { id: string; hidden: boolean }
   export interface TemplateLayout {
     sections: SectionLayout[];              // full order; ids from the template's manifest
     sizes: Record<string, SizeToken>;       // sectionId -> token; absent = defaultSize
   }
   // on ClientRecord:
   layout?: Partial<Record<TemplateId, TemplateLayout>>;
   ```

   Every template exports a manifest from its own directory:

   ```ts
   export interface SectionDef { id: string; label: string; required: boolean; defaultSize: SizeToken }
   export const SECTIONS: readonly SectionDef[];   // in document order
   ```

   The template's render walks `SECTIONS`, applies the client's `layout[templateId]`,
   and passes `size` to each section component. `resolveClient` produces
   `resolvedLayout[templateId]` by this rule, in this order: start from the manifest
   order; reorder by the client's `sections` array, ignoring ids not in the manifest;
   append any manifest ids the client omitted, in manifest order; force `hidden: false`
   on `required` sections; drop `sizes` keys that are not manifest ids or not a
   `SizeToken`. A missing, empty, or malformed `layout` resolves to the manifest defaults
   and raises a `warning`-level issue, never an error.

2. **Header, Footer and the sticky call bar are `required`** on every template — never
   hidden, never moved.

3. **Controls stay controls (R2).** For every `-a` template, `resolveClient` ignores
   `layout[templateId]` entirely and raises a warning if one is present. The server
   refuses a write that sets `layout` on a `-a` template with `422 {"error":"layout_locked",
   "templateId":"<id>"}`. The editor renders the layout panel read-only for `-a` with the
   text "Control template — layout is locked so the A/B test stays valid."

4. **Photos.** Add to `PhotoSet`: `focal?: { x: number; y: number }` (each 0–1). Rendered
   as `object-position: ${x*100}% ${y*100}%`. The editor supports drag-to-reorder within a
   service's list, drag-the-focal-point on a crop preview, swap from the client's own
   asset folder, and upload through the existing sharp pipeline. There is no pixel resize.

5. **Sizes are tokens.** A section component receives `size: SizeToken` and maps it to
   its own CSS (a class such as `size-L`). Templates own what each token means.

6. **Style tokens on `ClientBrand`:**
   `fontPairing: 'system' | 'editorial' | 'grotesk'` (three pairings shipped as
   self-hosted woff2 under `app/public/fonts/`, subset to Latin, `font-display: swap`;
   `system` loads no font file) and `spacingScale: 'compact' | 'default' | 'roomy'`.
   Absent values mean `system` and `default`.

7. **Inline copy editing.** Sections render each copy string inside an element carrying
   `data-copy-key="<key>"`. In the preview iframe, clicking such an element opens an
   inline editor; the change is posted to the parent and lands in
   `copyOverrides[templateId][key]`. On a `-a` template this is permitted (copy overrides
   already exist there) and the editor shows "This is a control — copy changes affect the
   A/B test" above the field.

8. **Server: Hono on Node, in `server/` at the repo root.** Auth is a single admin
   password: `DASHBOARD_PASSWORD_HASH` (bcrypt, cost ≥ 10) compared in constant time;
   on success an httpOnly, `Secure`, `SameSite=Lax` session cookie signed with
   `SESSION_SECRET`, 12-hour expiry; login limited to 5 attempts per IP per 15 minutes,
   returning `429` beyond that; every route except `POST /login` and `GET /healthz`
   returns `401` to an unauthenticated request. `/healthz` returns the body `ok` and
   nothing else.

9. **Persistence keeps git as the source of truth.** The service holds a clone at
   `REPO_DIR` (default `/data/repo`, a Railway volume). On boot: clone with
   `GITHUB_TOKEN` if absent, otherwise `git pull --ff-only`. A save writes the client
   JSON, `git commit`s with the message the user approved in the diff view, and `git push`es.
   A push that fails leaves the commit local and returns `502 {"error":"push_failed",
   "detail":"<git stderr>"}`; the UI shows it as "Saved locally, not pushed."

10. **Publish** is a state machine the UI displays live:
    `idle → pulling → building → deploying → live | failed`. `building` runs
    `npm run build` in `REPO_DIR/app` with `INCLUDE_FIXTURES` unset; `deploying` runs
    `wrangler pages deploy dist --project-name=$CF_PAGES_PROJECT`. Any stage failure sets
    `failed` with `{ stage, exitCode, tail: <last 40 lines> }` and the UI shows that
    verbatim. Missing `CLOUDFLARE_API_TOKEN` fails at `deploying` before invoking
    wrangler. A publish never reports `live` unless wrangler exited 0.

11. **The editor is a separate Railway service.** The landing-page bundle keeps zero
    editor code: `app/dashboard-server.mjs` keeps `apply: 'serve'`; `server/` is new
    code with its own `package.json`. Env var names live in `.env.example`; values never
    enter the repo.

## Hard rules — all still enforced by the existing verifiers, plus one new one

R1 no client value hardcoded · R2 controls locked · R3 no secrets in the repo · R4 the
agnostic template has no tree language · R5 every template renders with missing data,
now including missing or malformed `layout`.

Add `scripts/verify-layout-lock.mjs`: it loads every client record, sets a reordered
`layout` on every `-a` template in memory, runs `resolveClient`, and passes only if the
resolved order is unchanged for every `-a` and a warning was raised. It is part of the
verifier set from P0 onward.

Keep `phone.googleAdsCallAsset` for Texas Tree Tops at `null`; that value comes from the
owner's tracking specialist. Change landing-page copy, phone routing, or the deployed
landing pages only through the editor's own publish path, and only in P2 and P3.

## Phases — each has a mechanical DoD; show the commands and their output

### P0 — Layout becomes data. No UI.

Deliver: manifests on all 10 templates; the schema additions in decision 1, 4 and 6;
`resolveClient` layout resolution and the `-a` lock; `verify-layout-lock.mjs`; four
fixture records under `clients/_fixtures/` (gitignored from deploy, included in tests):
`layout-missing.json`, `layout-empty.json`, `layout-unknown-ids.json`,
`layout-hides-required.json`.

DoD — all of these, with output shown:

```
# 1. Byte-identical output. Build at the parent commit into /tmp/before, build at HEAD
#    into /tmp/after. Expected: no output from diff, exit 0.
diff -r /tmp/before /tmp/after && echo IDENTICAL

# 2. Every verifier, expected last line as noted.
node scripts/verify-factory-rules.mjs        # "All factory rules pass."
node scripts/verify-r4-leakage.mjs           # "R4 PASS"
node scripts/test-lead-function.mjs          # "0 failed"
node scripts/verify-faq-a11y.mjs             # "PASS"
node scripts/verify-source-fidelity.mjs      # "0 not found"
node scripts/verify-tracking.mjs             # "all ... checks passed"
node scripts/verify-layout-lock.mjs          # "LAYOUT LOCK PASS: <n> -a templates unchanged"

# 3. R5 with the four fixtures: each resolves, raises exactly one warning naming
#    `layout`, and renders every template with no "undefined" in the HTML.
INCLUDE_FIXTURES=1 npm run build             # then grep -c undefined dist/p/layout-*/**/index.html -> 0

# 4. tsc --noEmit exits 0.
```

Stop here. Report. If the byte-identical diff is not empty, do not continue — a
manifest refactor that changes output has changed a control.

### P1 — The editor, running locally against the Vite dev plugin.

Deliver: layout panel (drag reorder, hide toggle, size token per section), photo panel
(drag reorder, focal-point drag on a crop preview, swap, upload), style panel (brand
colors, `fontPairing`, `spacingScale`), inline copy editing in the preview, and the
existing diff-before-save.

DoD:

```
# 1. Round-trip: for each panel, make one change, save, reload, read the JSON back.
#    Show the JSON diff for: a reorder, a hide, a size, a focal point, a font, a
#    spacing scale, and one copy override.

# 2. Lock. On removal-a: the layout panel renders read-only (show the DOM). Then forge
#    the request the UI would send:
curl -s -X POST localhost:5273/api/dashboard/save -H 'content-type: application/json' \
  -d '{"slug":"j-valdez","patch":{"layout":{"removal-a":{"sections":[...]}}}}'
#    Expected: HTTP 422 and {"error":"layout_locked","templateId":"removal-a"}.

# 3. Preview updates on every change without a save (show the postMessage log).

# 4. Performance holds. Lighthouse mobile, applied throttling, on
#    p/j-valdez/trimming-b before and after a reorder + size change:
#    Performance within 2 points, LCP within 0.2s, CLS still 0. Show both runs.

# 5. All verifiers from P0, same expected lines. tsc clean.
```

Stop here. Report.

### P2 — The server, running locally.

Deliver: `server/` (Hono), auth per decision 8, git persistence per decision 9, publish
per decision 10, `.env.example` listing `DASHBOARD_PASSWORD_HASH`, `SESSION_SECRET`,
`GITHUB_TOKEN`, `GITHUB_REPO`, `REPO_DIR`, `CLOUDFLARE_API_TOKEN`,
`CLOUDFLARE_ACCOUNT_ID`, `CF_PAGES_PROJECT` with a one-line purpose each and no values.

DoD:

```
# 1. Gate. Unauthenticated:
curl -si localhost:8787/                     # 401 (or a redirect to /login), body has no client data
curl -si localhost:8787/api/clients          # 401
curl -si localhost:8787/healthz              # 200, body exactly "ok"

# 2. Login. Wrong password 6 times -> the 6th is 429. Right password -> Set-Cookie
#    with HttpOnly; Secure; SameSite=Lax. Show headers.

# 3. Save produces a real commit. After a save through the server:
git -C $REPO_DIR log -1 --format=%H          # matches
gh api repos/$GITHUB_REPO/commits/<sha>      # 200

# 4. Publish. Run one real publish through the server.
#    STOP before this step and confirm with the owner: it changes the live site.
#    Expected: state reaches "live"; then
curl -sL https://tree-template-factory.pages.dev/p/j-valdez/trimming-a | grep -c '<the changed string>'   # 1

# 5. Publish failure is loud. Unset CLOUDFLARE_API_TOKEN, publish again:
#    state is "failed", stage "deploying", and the UI shows the tail. Show it.

# 6. R3: node scripts/verify-factory-rules.mjs still passes with server/ in scope.
```

Stop here. Report.

### P3 — Railway.

Deliver: the service, its volume at `/data`, env vars set from the names in
`.env.example` (never echo values), `railway.json` or the equivalent config committed.
Mark any Railway CLI flag you did not verify against `railway --help` with `⚠️ verify`.

Before deploying, confirm all three, with output: P2 DoD item 1 passes locally at the
built server; `verify-factory-rules.mjs` passes; `grep -rn dashboard app/dist` returns
nothing. If any fails, fix it first. Stop and confirm with the owner before the first
`railway up`.

DoD:

```
# 1. The Railway URL gates: same three curls as P2 item 1 against the live URL.
# 2. Full loop from the Railway URL: log in, change one copy string, save (show the
#    commit on GitHub), publish (show the state reach "live"), then
curl -sL https://tree-template-factory.pages.dev/<that page> | grep -c '<the string>'   # 1
# 3. The landing-page bundle has no editor code:
grep -rn "dashboard\|/login\|hono" app/dist | wc -l    # 0
# 4. Every verifier passes at the deployed commit.
```

## Verify, don't assume

Show every command and its output; a claim without output does not count. Diff files,
do not eyeball them. Exercise each refusal path on purpose: the forged `-a` reorder, an
unknown section id, a hidden required section, a missing Cloudflare token, an
unauthenticated fetch. When a check fails, fix the code, not the check, then rerun it.

## Report format

At each DoD: what now works; files changed; each DoD item with its command and output;
decisions the brief did not cover; real remaining limitations; what the next phase adds.
Append the same to `docs/BUILD-LOG.md`. End with
"Waiting for your approval before starting P<next>."
