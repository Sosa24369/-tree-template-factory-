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

## Photo placement (Phase 1b)

A page has slots; slots hold photographs. `lib/placement.mjs` is the one place that decides
which photograph lands in which slot — the templates, the studio, the upload pipeline and
the image-spec guard all ask it, and nothing re-implements the rule. A record may carry an
optional `photoSlots` map, per template, naming a photograph for a slot; anything it does
not name is auto-filled by position exactly as before, so a record without the key renders
byte-identically. The studio writes the key for one template the first time an assignment
on that template changes. Nothing migrates a record wholesale.

The owner-facing guide is **`docs/PHOTOS.md`**. The slot contract — labels, measured boxes,
minimums, what to ask a client for — stays in `templates/imageSlots.mjs` and the generated
`docs/IMAGE-SPEC.md`.

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
| Photos per service — multi-file upload, reorder, **Frame** (focal point + a crop preview per slot), alt | Photos |
| **Every photo slot on the selected page**, in page order, with the real crop, auto/explicit, a status pill, and place / swap / upload-into-slot controls | Photos on this page |
| **Photo status** — OK / under spec / replace per client, and which slots a Replace photo fills | Readiness |
| **Section background plates** — upload, replace, crop preset, clear | Section backgrounds |
| SMS consent copy, Privacy / Terms URLs | Consent & legal |
| GHL location, ad-click field, tags, source, GTM, CallRail | CRM & tracking |
| **Every text field on every template** | Copy panel |
| Section order, visibility and size | Layout panel |
| Any record field with no schema entry yet | "Unlabelled fields" |

**The Copy panel** lists every copy key a template ships (132 on `removal-a`), in page
order, grouped by namespace, each beside its shipped default. **Find a field**, the
labelled search at the top of the panel, matches the key (`hero.h1a`) or the words on
the page; it stays pinned while the list scrolls, and the pill row under the client name
(Readiness · Layout · Business & contact · Backgrounds · Copy) jumps straight to the
panel. Editing writes an override; typing the default back in removes it, so a record
only carries what actually differs. It flags two things rather than hiding them: a `{{token}}` default
composes from the client record and replacing it with literal text stops that, and
editing a control also changes its `-c` hybrid — which is the constant the A/B test
holds fixed.

### Images — the contract

Every place a client image renders is declared once, in
`app/src/templates/imageSlots.mjs`: 35 slots across the ten templates plus the two
shared logo slots, each with its **measured** render box at 390 / 820 / 1440 CSS px
(headless Chrome over the DevTools protocol against the built pages), the policy it
crops by, which set position feeds it, and the master minimum. `docs/IMAGE-SPEC.md` is
generated from it (`node scripts/generate-image-spec.mjs`) — hand that to a client.

Four policies, because the templates crop four ways: **cover** (a fixed box crops the
photo; the focal point drives `object-position`, so it needs one), **frame** (the box
takes the photo's own shape and shows all of it, so grids are only even when every
master is 4:3), **contain** (logos) and **plate** (decorative, under a tint).

Photos are uploaded as **sets** per service and templates take them **by position**
among the stills (the first removal photo is removal-a's hero plate; the last three are
its service strip). The upload pipeline auto-rotates from EXIF, drops metadata, refuses
iPhone HEIC with export instructions (never converts), crops to 4:3 around the clicked
focal point, refuses anything under the minimum for the slots that position feeds —
with the number: "1080 px wide, a 4:3 tile needs 1200" — and emits WebP at
400/800/1200/1600. The original is never written. No JPEG fallback is emitted: the
frozen templates render `<img srcset>` with no `<picture>`, and every browser the
pages are sold into has decoded WebP since 2020.

**Frame** on any photo shows the real crops at mobile, tablet and desktop for the cover
slots that position feeds, around the focal point, before saving. The removal set's lead
photo can **measure the headline contrast** on removal-a (tablet and desktop; mobile
paints no plate) with the template's scrim composited over the pixels behind the
headline block, and apply the extra darkening that lifts it to 4.5:1 — rendered as
`--ra-hero-scrim`, transparent when unset (pixel-diff verified). The Logo field trims
transparent padding, detects a baked-in background box, and reports the share of the
mark that clears 3:1 against the light headers and storm's dark one. Text in the logo
that is not the company name is **not** checked — there is no OCR on the studio server.

The `image-spec` guard (pre phase) fails a publish on a referenced file that does not
exist, and on any studio-uploaded photo under its slot minimum or cover-cropped on a
real client without a focal point. **Legacy imports** — every photo on Texas Tree Tops
and J Valdez today — are reported with counts and do not fail: failing them would block
every publish for both live clients until 36 photographs were replaced. That is a
deliberate, visible decision (the script header says so; `--strict` previews the other
choice).

**Section background plates** are not photos and the panel says so. They are painted as
`background-image` behind a ~90% tint scrim and are announced to nobody, so they carry
no alt text. Unset means the template's built-in file, which was extracted from one
particular client's page — the panel states that instead of leaving it implicit.

### Editing several templates on one client

One client is one file, `clients/<slug>.json`. Everything template-specific — copy
overrides, layout, section backgrounds — is keyed by template id **inside that one
record**. So the workflow is:

1. Pick the template in the preview dropdown (the Copy panel's own picker is the same
   selection).
2. Edit. Switching to another template does **not** discard the edits; they accumulate
   in the record on screen. The filename in the header shows `•` while anything is
   unsaved.
3. Repeat for as many templates as needed.
4. **Review & save** once. The diff shows every template's changes together, as one
   commit.
5. **Publish** once. A publish does not know which template was touched: it rebuilds all
   56 pages for every client from the **committed** records and uploads whatever differs
   from the live site. That includes changes saved earlier and never published. The
   receipt lists every page that changed, across every template and every client.

Two things to know. Editing a control's copy (`removal-a`) also changes its hybrid
(`removal-c`), which renders the control's copy byte for byte — the panel says so and
the receipt shows both pages. And switching **client** replaces the record on screen, so
the studio asks before discarding unsaved edits.

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

**The guard suite is the gate.** Twelve guards; a failure at either phase ends the publish
with `failedGuards` naming which, and the UI shows the guard's label, a plain sentence
about what it means, and its own output. **There is no override.** `allPassed` is
fail-closed: an empty result set is not a pass, and a guard that cannot run (missing
script, crashed node) counts as failed.

| phase | guards |
|---|---|
| pre (source only) | `tsc` · factory rules (R1/R3/R5/schema/CRM) · layout lock · studio save · image spec · publish-gate self-test |
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

### The receipt

A successful publish ends with a receipt, not a link to the deployment root (which is
the neutral gate page and reads as "nothing to see here"):

- **one row per page that changed**, each linking to its production address —
  `/demo/<slug>/<template>/` for a demo client, `/p/<slug>/<template>/` for a real one —
  marked `changed` or `new page`; pages that were in the last deploy but not this build
  are listed as `removed — now 404`;
- the **deployment id** (`deployment 6d174f7b`) linking to that deployment's own
  hash-specific address;
- "**Nothing changed — the live site already matched**" when no page differed and
  wrangler uploaded nothing;
- the guard checklist collapsed to one row — `✓ 11/11 guards · 4/4 gate unchanged ·
  9.1 s` — with the per-guard breakdown behind a disclosure, and wrangler's output behind
  another.

Where "which pages changed" comes from: **wrangler does not say.** Its `pages deploy`
prints only a count (`Uploaded 2 files (210 already uploaded)`); the per-file list is
computed from the API's check-missing response and never logged, at any log level
(checked in 4.121.0). So `server/receipt.mjs` compares every built page against the
page that is live right now — the same comparison the live-campaign gate makes for the
four ad pages — in the window between the gate and wrangler. Fifty-five fetches, eight
at a time, about a second. A page that differs is a page this deployment changes; a page
the live site 404s on is new. wrangler's count is printed beside the list and, if it is
ever *lower* than the number of pages that differ, the receipt says the two disagree
rather than picking one. Removed pages come from the route list of the last successful
deploy, kept at `<volume>/studio-last-deploy.json`; the first receipt after this shipped
had no such list and said nothing about removals.

While a publish runs, and when it fails, the checklist is fully expanded and **the
failure is the first thing in the panel**: the verdict line sits under the header and the
failing guards sort to the top of the list with their own output. The panel's height is
capped and it scrolls internally. A session that expires mid-edit shows "Signed out —
sign in again" with a link that opens the login in a new tab; the unsaved edits stay on
screen and the banner clears itself once a request succeeds.

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
| `server/receipt.mjs` | the receipt: every built page against the live site, wrangler's count, the last-deploy route list |
| `app/dashboard-core.mjs` | record API, validation, the image pipeline, R4 write confinement, R2 layout lock — shared by the service and the Vite dev plugin |
| `app/image-checks.mjs` | cover-crop geometry, WCAG contrast, the removal-a hero legibility composite, the logo checks |
| `app/src/templates/imageSlots.mjs` | the image contract: every slot, measured; `docs/IMAGE-SPEC.md` is generated from it |
| `scripts/verify-image-spec.mjs` | the `image-spec` guard |
| `app/dashboard-server.mjs` | the dev-only Vite adapter |
| `app/src/dashboard/` | the UI |
| `protected-routes.json` | the pages a publish will not change without confirmation |
| `scripts/test-publish-gate.mjs` | 62 assertions over the gate and the receipt, no network, no build |
