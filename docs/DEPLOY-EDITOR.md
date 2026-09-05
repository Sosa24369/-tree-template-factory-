# Deploying the content editor to Railway

The editor (`server/`) is a **separate Railway service** from the landing pages. It
never enters the landing-page bundle; it edits the client records, commits them to
GitHub, and publishes the pages to Cloudflare with wrangler.

## Two secrets only the owner can mint

The service cannot start without the first and cannot publish without the second.
Nothing in this repo can create them.

| Var | Where to mint it | Scope |
|---|---|---|
| `GITHUB_TOKEN` | GitHub → Settings → Developer settings → Fine-grained tokens | Repository access: **only** `Sosa24369/-tree-template-factory-` · Permissions: **Contents: Read and write** (that is all clone/pull/push needs). 1-year expiry; put the renewal date in your calendar. |
| `CLOUDFLARE_API_TOKEN` | Cloudflare → My Profile → API Tokens → Create Token → "Edit Cloudflare Workers" template, or custom | Permissions: **Account · Cloudflare Pages · Edit** on account `ef07a2f57e930a4d6499a45560b78d9f`. Nothing else. |

Do not use a personal classic PAT or a Global API Key — both grant far more than this
service needs.

## Everything else is already generated

`~/.tree-template-factory/railway-editor-secrets.txt` (mode 600, outside the repo)
holds `DASHBOARD_PASSWORD` (what you type at the login page), its
`DASHBOARD_PASSWORD_HASH`, and `SESSION_SECRET`. Keep the password in your password
manager; the file can be deleted once the vars are set.

## Env vars, by name

```
DASHBOARD_PASSWORD_HASH   from the secrets file
SESSION_SECRET            from the secrets file
GITHUB_TOKEN              minted above
GITHUB_REPO               Sosa24369/-tree-template-factory-
REPO_DIR                  /data/repo
CLOUDFLARE_API_TOKEN      minted above
CLOUDFLARE_ACCOUNT_ID     ef07a2f57e930a4d6499a45560b78d9f
CF_PAGES_PROJECT          tree-template-factory
PUBLIC_BASE_URL           https://tree-template-factory.pages.dev
```

`PUBLIC_BASE_URL` is the origin the ads actually point at. Before every deploy the
studio fetches the routes in `/protected-routes.json` from there and compares them
against the build, and it REFUSES to deploy if it cannot reach them — so if a custom
domain becomes the real destination, change this at the same time. Unset, it falls
back to `https://<CF_PAGES_PROJECT>.pages.dev`.

`PORT` is set by Railway. Never set `DASHBOARD_INSECURE_COOKIE` on Railway.

## Deploy

From the repo root, linked to the `tree-template-editor` project:

```bash
railway variables set DASHBOARD_PASSWORD_HASH='…' SESSION_SECRET='…' GITHUB_TOKEN='…' \
  GITHUB_REPO='Sosa24369/-tree-template-factory-' REPO_DIR='/data/repo' \
  CLOUDFLARE_API_TOKEN='…' CLOUDFLARE_ACCOUNT_ID='ef07a2f57e930a4d6499a45560b78d9f' \
  CF_PAGES_PROJECT='tree-template-factory' \
  PUBLIC_BASE_URL='https://tree-template-factory.pages.dev'
railway volume add --mount-path /data      # ⚠️ verify flag names against `railway volume add --help`
railway up --detach
railway domain                              # prints the public URL
```

`railway.json` carries the build command (installs root + app + server deps and builds
the dashboard UI) and the start command (`node server/index.mjs`) with `/healthz` as
the health check. Railway has deprecated `railway.json` in favour of
`.railway/railway.ts`; it keeps working until 2026-12-01 — migrate with
`railway config migrate` before then.

## What "working" looks like

1. `https://<railway-url>/` redirects to `/login`; `/healthz` says `ok`;
   `/api/dash/clients` is 401 until you sign in.
2. Sign in → the dashboard. Pick a client, change one thing, **Review & save** →
   the commit appears on GitHub within seconds (the service pushes).
3. **Publish** → the panel walks `pulling → building → deploying → live` and shows the
   `pages.dev` URL. The first publish on a fresh volume runs `npm ci` in the clone and
   takes a few minutes; later ones are ~1 minute.
4. If publish shows `failed`, the panel shows the stage and the last 40 lines. A
   missing Cloudflare token fails at `deploying` before wrangler runs.

## Boot-time behaviour worth knowing

- On first boot the service clones the repo into `/data/repo`; on later boots it
  fast-forwards. If someone force-pushes `main`, the pull fails and the service exits
  with the git error in the log — fix the branch, redeploy.
- The login limiter is in-memory: 5 wrong attempts per IP per 15 minutes, reset on
  restart.

## One trap worth knowing

`DASHBOARD_PASSWORD_HASH` contains two literal `$` characters (`scrypt$<salt>$<key>`).
Railway stores it verbatim and this is a non-issue there — but a **shell will eat it**.
Sourcing a local `.env` with `set -a; . .env` expands `$<salt>` to nothing, and you get
a silent "Wrong password." against a hash that still looks correct in the file. Quote it
in any local env file:

```
DASHBOARD_PASSWORD_HASH='scrypt$…$…'
```

(Cost an attempt of the 5-per-15-minutes login limiter to find, which is its own hint:
if the password is right and you are still rejected, check the quoting before you
assume the hash is wrong.)
