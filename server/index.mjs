/**
 * The content editor server — Hono on Node. A SEPARATE Railway service; it never enters
 * the landing-page bundle.
 *
 * Routes
 *   GET  /healthz            200 "ok" — the only unauthenticated read
 *   GET  /login  POST /login the gate (rate-limited)
 *   POST /logout
 *   everything else          401 (JSON) / redirect to /login (HTML) unless a valid
 *                            session cookie is present
 *   /api/dash/*              dashboard-core (shared with the Vite dev plugin)
 *   POST /api/publish        start a publish; GET /api/publish returns the state.
 *                            A publish runs the full guard suite and refuses to
 *                            deploy if any guard fails, and stops at `blocked` if the
 *                            build would change a live campaign page until the caller
 *                            confirms that exact set of routes.
 *   /assets/*                the clone's app/public/assets (photos for the preview)
 *   /*                       the built dashboard UI (app/dist-dashboard)
 *
 * Env (names in /.env.example; values never in the repo):
 *   DASHBOARD_PASSWORD_HASH SESSION_SECRET GITHUB_TOKEN GITHUB_REPO REPO_DIR
 *   CLOUDFLARE_API_TOKEN CLOUDFLARE_ACCOUNT_ID CF_PAGES_PROJECT PUBLIC_BASE_URL PORT
 */

import { Hono } from 'hono';
import { serve } from '@hono/node-server';
import { serveStatic } from '@hono/node-server/serve-static';
import { existsSync, readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { dashboardCore } from '../app/dashboard-core.mjs';
import { verifyPassword, makeSessionCookie, clearSessionCookie, readSession, makeLimiter, loginPage } from './auth.mjs';
import { makeGit } from './gitsync.mjs';
import { makePublisher } from './publish.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const env = (k, d) => (process.env[k] ?? d);

const PORT = Number(env('PORT', 8787));
const PASSWORD_HASH = env('DASHBOARD_PASSWORD_HASH', '');
const SESSION_SECRET = env('SESSION_SECRET', '');
const GITHUB_REPO = env('GITHUB_REPO', 'Sosa24369/-tree-template-factory-');
const GITHUB_TOKEN = env('GITHUB_TOKEN', '');
const REPO_DIR = env('REPO_DIR', '/data/repo');
const INSECURE_COOKIE = env('DASHBOARD_INSECURE_COOKIE', '') === '1';

for (const [k, v] of [['DASHBOARD_PASSWORD_HASH', PASSWORD_HASH], ['SESSION_SECRET', SESSION_SECRET]]) {
  if (!v) { console.error(`FATAL: ${k} is not set. Refusing to start an unauthenticated editor.`); process.exit(1); }
}

/* ---- git-backed persistence: clone or pull on boot ---- */
const git = makeGit({ repoDir: REPO_DIR, repo: GITHUB_REPO, token: GITHUB_TOKEN });
try { console.log('[git] ' + git.sync()); } catch (e) { console.error('[git] sync failed:', String(e.stderr || e.message || e)); process.exit(1); }

const core = dashboardCore({
  repoRoot: REPO_DIR,
  afterCommit: async () => { git.push(); }, // throws push_failed -> 502 below
});
const CF_PROJECT = env('CF_PAGES_PROJECT', 'tree-template-factory');
const publisher = makePublisher({
  repoDir: REPO_DIR, git,
  cfToken: env('CLOUDFLARE_API_TOKEN', ''), cfAccountId: env('CLOUDFLARE_ACCOUNT_ID', ''), cfProject: CF_PROJECT,
  // The origin the live campaign pages are compared against before a deploy.
  // Defaults to the project's pages.dev; set PUBLIC_BASE_URL if a custom domain is
  // the real one, because that is the URL the ads actually point at.
  baseUrl: env('PUBLIC_BASE_URL', `https://${CF_PROJECT}.pages.dev`),
});
const limiter = makeLimiter();
// The dashboard UI is served from THIS service's own checkout, built at deploy time
// (railway.json build command). Only photos come from the volume clone, because that
// is where uploads land. Locally the two paths are the same repo.
const UI_DIR = join(HERE, '..', 'app', 'dist-dashboard');
const ASSETS_DIR = join(REPO_DIR, 'app', 'public');

const app = new Hono();
// Client IP for rate limiting. Behind ONE trusted proxy (Railway) the real client is
// the RIGHTMOST x-forwarded-for entry — the proxy appends it. The leftmost entry is
// whatever the client claimed, so using it would let a client bypass the limiter by
// sending a fresh fake IP with every attempt.
const ip = (c) => {
  const xff = c.req.header('x-forwarded-for');
  if (xff) { const parts = xff.split(',').map((s) => s.trim()).filter(Boolean); if (parts.length) return parts[parts.length - 1]; }
  return c.env?.incoming?.socket?.remoteAddress || 'unknown';
};
const authed = (c) => readSession(c.req.header('cookie'), SESSION_SECRET);

/* ---- open routes ---- */
app.get('/healthz', (c) => c.text('ok'));
app.get('/login', (c) => c.html(loginPage({ error: c.req.query('e') === '1' ? 'Wrong password.' : c.req.query('e') === '2' ? 'Too many attempts — wait 15 minutes.' : '' })));
app.post('/login', async (c) => {
  const who = ip(c);
  if (!limiter.check(who)) return c.text('Too many attempts', 429, { 'Retry-After': String(limiter.retryAfterSeconds(who)) });
  const form = await c.req.parseBody();
  if (!verifyPassword(form.password, PASSWORD_HASH)) { limiter.hit(who); return c.redirect('/login?e=1', 303); }
  limiter.reset(who);
  // Hono's c.redirect() takes no headers argument — set the cookie on the context first.
  c.header('Set-Cookie', makeSessionCookie(SESSION_SECRET, { insecure: INSECURE_COOKIE }));
  return c.redirect('/', 303);
});
app.post('/logout', (c) => { c.header('Set-Cookie', clearSessionCookie()); return c.redirect('/login', 303); });

/* ---- the gate: everything below requires a session ---- */
app.use('*', async (c, next) => {
  if (authed(c)) return next();
  if (c.req.path.startsWith('/api/')) return c.json({ error: 'unauthorized' }, 401);
  return c.redirect('/login', 302);
});

/* ---- dashboard API (shared core) ---- */
app.all('/api/dash/*', async (c) => {
  const req = c.env.incoming, res = c.env.outgoing;
  try {
    await core(req, res);
  } catch (e) {
    if (e?.message === 'push_failed') { res.statusCode = 502; res.setHeader('content-type', 'application/json'); res.end(JSON.stringify({ error: 'push_failed', detail: e.detail })); }
    else { res.statusCode = 500; res.setHeader('content-type', 'application/json'); res.end(JSON.stringify({ error: String(e?.message || e) })); }
  }
  return RESPONSE_ALREADY_SENT;
});

/* ---- publish ---- */
app.get('/api/publish', (c) => c.json({ ...publisher.status, suite: publisher.guards }));
app.post('/api/publish', async (c) => {
  const st = publisher.status;
  // 'blocked' is a finished state, not a running one — it must be re-startable with
  // a confirmation. So are 'live' and 'failed'.
  if (st.state !== 'idle' && !['live', 'failed', 'blocked'].includes(st.state)) return c.json({ ...st, suite: publisher.guards }, 202);
  // The confirmation names the exact set of live campaign pages the caller was shown.
  // A token for a different set (or no token) leaves the publish blocked.
  const body = await c.req.json().catch(() => ({}));
  publisher.run({ confirmProtected: typeof body?.confirmProtected === 'string' ? body.confirmProtected : undefined });
  await new Promise((r) => setTimeout(r, 50));
  return c.json({ ...publisher.status, suite: publisher.guards }, 202);
});

/* ---- static: photos for the preview, then the built UI ---- */
app.use('/assets/*', serveStatic({ root: ASSETS_DIR }));
app.use('/*', serveStatic({ root: UI_DIR }));
app.get('/', (c) => existsSync(join(UI_DIR, 'dashboard.html')) ? c.html(readFileSync(join(UI_DIR, 'dashboard.html'), 'utf8')) : c.text('Dashboard UI not built. Run `npm run build:dashboard` in app/ (Railway does this in its build command).', 503));

// Hono's node adapter: returning this constant tells it the Node res was written directly.
import { RESPONSE_ALREADY_SENT } from '@hono/node-server/utils/response';

serve({ fetch: app.fetch, port: PORT }, (info) => {
  console.log(`[editor] listening on :${info.port}  repo=${REPO_DIR}@${git.head()}  ui=${existsSync(UI_DIR) ? 'built' : 'MISSING'}`);
});
