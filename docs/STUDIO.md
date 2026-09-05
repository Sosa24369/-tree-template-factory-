# Template Studio

A private, single-user web app for creating clients, editing their content, previewing
every template, and publishing the landing pages to Cloudflare — from any machine.

It lives in **`server/`** (a Hono service) plus **`app/src/dashboard/`** (its UI), and
deploys to Railway as a service separate from the landing pages.

---

## The two things it will not do

**1. It never serves a public client page.** It renders previews for a logged-in user
only, inside an iframe, from the record being edited. Cloudflare Pages remains the only
place a real page is published. Verified against a running server, authenticated:

| path | studio |
|---|---|
| `/` · `/dashboard.html` · `/dashboard-preview.html` | 200 (the studio UI) |
| `/api/dash/*` | 200 (the record API) |
| `/assets/<slug>/…` | 200 (photos, for the preview) |
| `/p/texas-tree-tops/removal-a/` | **404** |
| `/demo/summit-tree/removal-a/` | **404** |
| `/clients/texas-tree-tops.json` | **404** |
| `/api/lead` | **404** |

Unauthenticated, every one of those is a 401 (API) or a redirect to `/login` (HTML).
`/healthz` is the only open read.

**2. It never holds a GHL token.** Each client's Private Integration Token is a
Cloudflare Pages environment secret (`GHL_PIT_<SLUG>`) read only inside the lead
Function's server context. The studio cannot read or write it, and the readiness
checklist lists creating it as a manual step with the exact variable name. A token the
studio could write is a token the studio could leak.

---

## Persistence: git, via a working clone

**Decision: the `clients/*.json` records stay the single source of truth, and the
studio writes to them through git.**

On boot the service clones the repo to `REPO_DIR` (a Railway volume) or
`git pull --ff-only`s it. A save writes the JSON, `git add`s it and the client's asset
folder, commits, and **pushes**. A failed push returns `502 push_failed` with git's own
stderr, and the UI says "saved locally, not pushed" — never a silent success.

Why a clone and not the GitHub Contents API: the studio has to run `sharp` over an
upload, produce responsive variants, and then commit the JSON **and** several binaries
as one change. That is a working tree, not a series of single-file API calls, and a
half-applied set of those calls is exactly the state you do not want in a records repo.
The clone also gives `npm run build` and `wrangler pages deploy` something real to run
in, which is what publishing needs anyway.

Why not a database: the records would stop being the source of truth. Every guard in
this repo — R4 leakage, R5 degradation, the CRM-identifier check — reads
`clients/*.json` from disk. Moving them into a database means either those guards read
the database (and CI cannot run them) or the two copies drift.

`GITHUB_TOKEN` never touches disk in plain form: it is injected into the fetch/push
command's lifetime via `-c http.extraheader`, so `git remote -v` in the clone shows a
clean URL.

---

## Auth

One password. `scrypt` (Node built-in — nothing to compile on Railway), stored as a
hash in `DASHBOARD_PASSWORD_HASH`, constant-time compared. A signed session cookie:
`HttpOnly`, `SameSite=Lax`, 12 hours, `Secure` unless `DASHBOARD_INSECURE_COOKIE=1`
(local http only). Login is rate-limited to 5 attempts per IP per 15 minutes.

The rate-limit IP is the **rightmost** `x-forwarded-for` entry. The leftmost is
client-controlled, so using it would let anyone reset the limiter by sending a fresh
fake IP with every attempt.

**The service refuses to start** without `DASHBOARD_PASSWORD_HASH` and
`SESSION_SECRET`. There is no signup, no password reset, and no second account.

> `DASHBOARD_PASSWORD_HASH` contains two literal `$` (`scrypt$<salt>$<key>`). Railway
> takes it verbatim, but a **shell will eat it**: `set -a; . .env` expands `$<salt>` to
> nothing and you get a silent "Wrong password." against a hash that still looks
> correct. Quote it in any local env file.

---

## What the editor exposes

| | where |
|---|---|
| Company name, colours, typography, spacing | Business identity |
| **Logo — upload / replace / remove** | Business identity |
| Phone (E.164) · number type · display override | Contact |
| **Google Ads call-asset number** | Contact |
| Thank-you destination + the off-domain guard | Contact |
| Service area + suburb list | Service area |
| **Which templates this client gets** (`excludedTemplates`) | Templates |
| **Demo account switch** (`isDemo`) | Templates |
| Reviews (author, attribution, body) | Reviews |
| Photos per service — upload, reorder, focal point, crop preset, alt | Photos |
| **Section background plates** — upload, replace, crop preset, clear | Section backgrounds |
| SMS consent copy, Privacy / Terms URLs | Consent & legal |
| GHL location, ad-click field, tags, source, GTM, CallRail | CRM & tracking |
| **Every text field on every template** | Copy panel |
| Section order, visibility and size | Layout panel |
| Any record field with no schema entry yet | "Unlabelled fields" |

**The Copy panel** lists every copy key a template ships (132 on `removal-a`), in page
order, grouped by namespace, searchable, each beside its shipped default. Editing writes
an override; typing the default back in removes it, so a record only carries what
actually differs. It flags two things rather than hiding them: a `{{token}}` default
composes from the client record and replacing it with literal text stops that, and
editing a control also changes its `-c` hybrid — which is the constant the A/B test
holds fixed.

**Section background plates** are not photos and the panel says so. They are painted as
`background-image` behind a ~90% tint scrim and are announced to nobody, so they carry
no alt text. Unset means the template's built-in file, which was extracted from one
particular client's page — the panel states that instead of leaving it implicit.

### Deliberately not built

Free-form drag-and-drop positioning, new section types, arbitrary CSS editing. The
canonical v2 section list is fixed; the Layout panel reorders, hides and resizes within
it, and pins the required sections. Controls (`-a`) render the panel read-only, and the
server refuses a `-a` layout write independently (`422 layout_locked`) — the UI is a
courtesy, not the guard.

---

## New client

Name → slug (auto, until you edit it) → phone → service area and suburbs → colours and
typography → which templates → demo or not. Writes `clients/<slug>.json` and an empty
asset folder, then opens the client with its readiness checklist.

**CRM and tracking start empty.** This flow used to duplicate an existing client, which
carried that client's `crm.ghlLocationId` and `tracking.gtmContainerId` into the new
record — leads into the wrong GHL sub-account, conversions into the wrong ad account,
and an SMS consent line naming the wrong company. No guard caught it, because the
location id never reaches any HTML and R4 greps built pages. `verify-factory-rules.mjs`
now refuses a build where two records share either identifier.

**GHL wiring stays manual.** The readiness checklist says what is missing, in order,
with the exact `GHL_PIT_<SLUG>` name to create in Cloudflare. It does not attempt it.

---

## Publish

```
pulling → checking (pre) → building → checking (post) → protected
                                                            ↓
                                      blocked ← ── ── ── ── ─┘
                                          ↓ explicit confirmation
                                      deploying → live | failed
```

**The guard suite is the gate.** Ten guards; a failure at either phase ends the publish
with `failedGuards` naming which, and the UI shows the guard's label, a plain sentence
about what it means, and its own output. **There is no override.** `allPassed` is
fail-closed: an empty result set is not a pass, and a guard that cannot run (missing
script, crashed node) counts as failed.

| phase | guards |
|---|---|
| pre (source only) | `tsc` · factory rules (R1/R3/R5/schema/CRM) · layout lock · publish-gate self-test |
| post (reads `app/dist`) | R4 leakage · a→c copy parity · demo isolation (D1–D10) · tracking · lead Function · FAQ a11y |

Measured on this repo: pre ≈ 3.3 s (`tsc` is nearly all of it), post ≈ 0.4 s.

**The four live campaign pages are fenced.** After the build and before wrangler, every
route in [`/protected-routes.json`](../protected-routes.json) is compared against the
page that is **live right now**, fetched from `PUBLIC_BASE_URL`. Any difference stops
the publish at `blocked` with the route and a readable diff; nothing is uploaded. It
proceeds only when the request is repeated with a token naming that exact route set, so
a stale confirmation cannot wave through a publish touching different pages.

Three deliberate calls:

- **An unreachable live page blocks.** "The network was flaky" is not a reason to
  overwrite an ad destination.
- **A route missing from the new build blocks**, because that is a 404 on an ad
  destination.
- **The content-hashed bundle filename is normalised away.** It changes on any shared
  code edit, so counting it would block every publish and turn the confirmation into a
  reflex click.

To change which pages are protected, edit `protected-routes.json` in a commit. It is
deliberately not editable from the studio.

---

## Running it locally

```bash
cd server && npm ci
cd ../app && npm ci && npm run build:dashboard     # the studio UI
```

Two ways:

**A. Vite dev plugin — no auth, this checkout, fastest loop.**

```bash
cd app && npm run dev      # http://localhost:5173/dashboard.html
```

`app/dashboard-server.mjs` is `apply: 'serve'`, so it cannot exist in a build — the
unauthenticated dashboard is local by construction. It writes and commits to **this**
working tree and has no `/api/publish`.

**B. The real service — auth, git sync, publish.**

```bash
cd server && node hash-password.mjs 'your password'   # copy the scrypt$…$… value
```

```bash
cat > .env.studio <<'EOF'
DASHBOARD_PASSWORD_HASH='scrypt$…$…'
SESSION_SECRET='…'
REPO_DIR='/absolute/path/to/a/working/clone'
CF_PAGES_PROJECT='tree-template-factory'
PUBLIC_BASE_URL='https://tree-template-factory.pages.dev'
DASHBOARD_INSECURE_COOKIE='1'
PORT='8787'
EOF
set -a; . ./.env.studio; set +a
node server/index.mjs
```

Point `REPO_DIR` at a clone, not at your working tree — a publish runs `git pull
--ff-only` in it and a build over it. Symlink `node_modules`, `app/node_modules` and
`server/node_modules` into the clone to skip the first-run `npm ci`.

Without `CLOUDFLARE_API_TOKEN` everything works up to the deploy, which fails loudly at
`deploying` with `CLOUDFLARE_API_TOKEN is not set — wrangler was not invoked.` That is
the intended local state, and it exercises every guard and the live-page gate for real.

---

## Deploying to Railway

Project `tree-template-editor`, service `editor`, volume mounted at `/data` (the clone
lives at `/data/repo`). `railway.json` carries the build command (root + app + server
installs, then `npm run build:dashboard`) and the start command
(`node server/index.mjs`) with `/healthz` as the health check. `nixpacks.toml` adds git
and the toolchain `sharp` needs.

Full runbook, including the two tokens only the account owner can mint:
[`docs/DEPLOY-EDITOR.md`](./DEPLOY-EDITOR.md).

```bash
railway variables set \
  DASHBOARD_PASSWORD_HASH='…' SESSION_SECRET='…' GITHUB_TOKEN='…' \
  GITHUB_REPO='Sosa24369/-tree-template-factory-' REPO_DIR='/data/repo' \
  CLOUDFLARE_API_TOKEN='…' CLOUDFLARE_ACCOUNT_ID='…' \
  CF_PAGES_PROJECT='tree-template-factory' \
  PUBLIC_BASE_URL='https://tree-template-factory.pages.dev'
railway up --detach
railway domain
```

### Env vars

| var | required | what it does |
|---|---|---|
| `DASHBOARD_PASSWORD_HASH` | yes — refuses to start | the one admin password, scrypt-hashed |
| `SESSION_SECRET` | yes — refuses to start | signs the session cookie |
| `GITHUB_TOKEN` | to clone a private repo | fine-grained PAT, Contents: read+write, this repo only |
| `GITHUB_REPO` | | `owner/name` to clone and push |
| `REPO_DIR` | | working clone (`/data/repo` on the volume) |
| `CLOUDFLARE_API_TOKEN` | to publish | Pages: Edit. Publish fails loudly at `deploying` without it |
| `CLOUDFLARE_ACCOUNT_ID` | | the account owning the Pages project |
| `CF_PAGES_PROJECT` | | `wrangler pages deploy --project-name` |
| `PUBLIC_BASE_URL` | to publish | the origin the ads point at; the live-page comparison target |
| `PORT` | | set by Railway |
| `DASHBOARD_INSECURE_COOKIE` | local only | drops the cookie's `Secure` flag. **Never set on Railway** |

---

## Files

| | |
|---|---|
| `server/index.mjs` | routes, the auth gate, static serving |
| `server/auth.mjs` | scrypt hashing, session cookie, rate limiter, login page |
| `server/gitsync.mjs` | clone / pull / push against the volume clone |
| `server/guards.mjs` | the guard suite and its fail-closed runner |
| `server/protected.mjs` | the live-campaign comparison and its confirmation token |
| `server/publish.mjs` | the publish state machine |
| `app/dashboard-core.mjs` | record API, validation, sharp pipelines, R4 write confinement, R2 layout lock — shared by the service and the Vite dev plugin |
| `app/dashboard-server.mjs` | the dev-only Vite adapter |
| `app/src/dashboard/` | the UI |
| `protected-routes.json` | the pages a publish will not change without confirmation |
| `scripts/test-publish-gate.mjs` | 31 assertions over the gate, no network, no build |
