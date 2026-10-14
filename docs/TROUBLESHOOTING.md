# Template Studio — troubleshooting

The failures this studio has actually had, and the fix for each. Check the **Deploy
health** card at the top of the dashboard first (or `npm run studio:health`): it reads
`/api/health` and names the broken item in plain English.

| Symptom | Cause | Fix |
|---|---|---|
| Publish fails at `deploying` with Cloudflare **error 9109** ("token not recognized") | The API token is IP-filtered or was minted for the wrong account; Railway's egress IPs are not fixed. | Mint a new token: Cloudflare → My Profile → API Tokens → Custom, **Account · Cloudflare Pages · Edit**, **no IP filter**. Set it over stdin (never on the command line): `pbpaste \| railway variable set CLOUDFLARE_API_TOKEN --stdin -s editor`. |
| "Wrong password." with the right password, locally | `DASHBOARD_PASSWORD_HASH` is `scrypt$<salt>$<key>`; `set -a; . .env` lets the shell expand the `$` parts to nothing. | Quote the value in the env file (`'scrypt$…$…'`) or set it over stdin: `railway variable set DASHBOARD_PASSWORD_HASH --stdin -s editor`. Five wrong tries lock the IP for 15 minutes. |
| Boot log: `Author identity unknown` / `Please tell me who you are`, saves fail | The container has no git identity; the clone's config does not survive a fresh volume. | The server passes its identity per command (`STUDIO_IDENTITY`). If you overrode it, set both `STUDIO_GIT_NAME` and `STUDIO_GIT_EMAIL`, not one. Health card row: "Saves can be signed". |
| Publish refuses at `pulling`: "working clone has uncommitted changes" | A failed save or build left tracked files modified in `/data/repo`; publish refuses a dirty clone on purpose. `*.generated.json` residue is discarded automatically; records and hand-written files are not. | Open the client and **Review & save** (commits them). Otherwise, in the service shell: `cd /data/repo && git status --porcelain --untracked-files=no`, then `git checkout -- <file>` for build residue only. Never discard a `clients/*.json` without reading the diff. |
| Pushed to GitHub but the studio did not change | GitHub is the records store, not the studio's deploy trigger. The editor service deploys from `railway up`. | `npm run studio:deploy` (guards → build → `railway up` → waits for `/api/health` green). Needs the CLI linked to `tree-template-editor` in the workspace that owns it; if it is not, the script prints the exact `railway link` command. |
| New deployment dies at its healthcheck while the old one keeps serving | Boot's `git pull --ff-only` fails: dirty clone (above) or someone force-pushed `main`. | `railway logs -s editor` shows the git error. Fix the branch or the clone, redeploy. |
| Lighthouse scores far lower than production | Pages served with `python3 -m http.server`: no compression, no cache headers, wrong MIME for `.webp`/`.woff2`. | Serve the build with `cd app && npx vite preview` (or test the `pages.dev` URL). |
| Dashboard answers `503 Dashboard UI not built` | The platform's own detection built only `server/`. | The build must run `npm --prefix app run build:dashboard`; it is in `.railway/railway.ts`. `railway.json` and `nixpacks.toml` are ignored. |
| Boot: `spawnSync git ENOENT` | Railpack's runtime image has no git. | `RAILPACK_DEPLOY_APT_PACKAGES=git` on the service (already in `.railway/railway.ts`). |
