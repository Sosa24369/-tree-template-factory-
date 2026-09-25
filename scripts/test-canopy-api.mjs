#!/usr/bin/env node
/**
 * test-canopy-api — the Canopy API on the REAL server wiring, offline.
 *
 *     node scripts/test-canopy-api.mjs
 *
 * Boots `server/index.mjs` against a throwaway clone whose origin is a local
 * bare repository (so boot's `git pull` and a save's `git push` never leave the
 * machine), then drives it over HTTP:
 *
 *   1. the token opens the six routes and nothing else; the session cookie does
 *      not open them; no token configured → 503;
 *   2. allowed templates: real clients get only the templates they run;
 *   3. a real client's record cannot be changed through the API;
 *   4. dry runs write nothing; a real write commits to the (throwaway) origin;
 *   5. a studio whose site build lacks location pages refuses to write one;
 *   6. copy keys must exist in the template; page slugs never collide with a
 *      template.
 *
 * NOT one of the studio's publish guards: those run inside the studio's clone
 * of main, where this file does not exist until the branch is merged.
 */
import { spawn, execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { randomBytes, scryptSync } from 'node:crypto';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
let CHECKS = 0;
const FAILS = [];
const check = (label, ok, detail = '') => {
  CHECKS += 1;
  console.log(`  ${ok ? 'PASS' : 'FAIL'}  ${label}${detail ? `  (${detail})` : ''}`);
  if (!ok) FAILS.push(label);
};
const git = (cwd, ...args) => execFileSync('git', ['-c', 'user.name=t', '-c', 'user.email=t@t', ...args], { cwd, encoding: 'utf8' });

const TMP = mkdtempSync(join(tmpdir(), 'canopy-api-'));
const ORIGIN = join(TMP, 'origin.git');
const REPO = join(TMP, 'repo');
const head = git(ROOT, 'rev-parse', 'HEAD').trim();
git(TMP, 'clone', '--bare', '--quiet', ROOT, ORIGIN);
git(ORIGIN, 'update-ref', 'refs/heads/main', head);
git(TMP, 'clone', '--quiet', '--branch', 'main', ORIGIN, REPO);

const TOKEN = randomBytes(24).toString('hex');
const PASSWORD = randomBytes(12).toString('hex');
const salt = randomBytes(16);
const HASH = `scrypt$${salt.toString('base64')}$${scryptSync(PASSWORD, salt, 64, { N: 2 ** 15, r: 8, p: 1, maxmem: 64 * 1024 * 1024 }).toString('base64')}`;

function boot(port, { token = TOKEN } = {}) {
  const env = { ...process.env, PORT: String(port), REPO_DIR: REPO, DASHBOARD_PASSWORD_HASH: HASH, SESSION_SECRET: randomBytes(24).toString('hex'),
    DASHBOARD_INSECURE_COOKIE: '1', GITHUB_TOKEN: '', CLOUDFLARE_API_TOKEN: '', CLOUDFLARE_ACCOUNT_ID: '' };
  if (token) env.STUDIO_API_TOKEN = token; else delete env.STUDIO_API_TOKEN;
  // The clone's origin is local, so boot's pull stays on this machine.
  git(REPO, 'remote', 'set-url', 'origin', ORIGIN);
  const child = spawn(process.execPath, [join(ROOT, 'server/index.mjs')], { env, stdio: ['ignore', 'pipe', 'pipe'] });
  child.stdout.on('data', () => {});
  child.stderr.on('data', () => {});
  return child;
}
async function waitUp(base) {
  for (let i = 0; i < 100; i += 1) {
    try { if ((await fetch(`${base}/healthz`)).ok) return true; } catch { /* booting */ }
    await new Promise((r) => setTimeout(r, 200));
  }
  return false;
}
const H = (extra = {}) => ({ 'content-type': 'application/json', ...extra });
const bearer = (t = TOKEN) => ({ authorization: `Bearer ${t}` });
async function call(base, method, path, { headers = {}, body } = {}) {
  const r = await fetch(base + path, { method, headers: H(headers), body: body === undefined ? undefined : JSON.stringify(body), redirect: 'manual' });
  let json = null;
  try { json = await r.json(); } catch { /* not json */ }
  return { status: r.status, json, headers: r.headers };
}
const originHead = () => git(ORIGIN, 'rev-parse', 'refs/heads/main').trim();

// The studio's own guard gets confused by the gitsync of a path origin (it pulls
// `origin main`); the git sync in makeGit uses GitHub's URL only for a fresh clone.
// Boot therefore needs GITHUB_REPO irrelevant and REPO already cloned: done above.

async function main() {
  const port = 40000 + Math.floor(Math.random() * 20000);
  const base = `http://127.0.0.1:${port}`;
  let srv = boot(port);
  try {
    check('the studio boots against the throwaway clone', await waitUp(base));

    console.log('\n1. the token opens the six routes, and nothing else');
    check('no token → 401', (await call(base, 'GET', '/api/canopy/v1/templates')).status === 401);
    check('a wrong token → 401', (await call(base, 'GET', '/api/canopy/v1/templates', { headers: bearer('nope') })).status === 401);
    const t = await call(base, 'GET', '/api/canopy/v1/templates', { headers: bearer() });
    check('the token → the ten templates', t.status === 200 && t.json.templates.length === 10, String(t.json?.templates?.length));
    check('the token does not open the dashboard API', (await call(base, 'GET', '/api/dash/clients', { headers: bearer() })).status === 401);
    check('the token does not open publish', (await call(base, 'POST', '/api/publish', { headers: bearer(), body: {} })).status === 401);
    const root = await call(base, 'GET', '/', { headers: bearer() });
    check('the token does not open the studio UI (redirect to login)', root.status === 302 && (root.headers.get('location') || '').includes('/login'));
    check('an unknown path under the prefix is the API’s 404, not the gate', (await call(base, 'GET', '/api/canopy/v1/secrets', { headers: bearer() })).status === 404);
    const login = await fetch(`${base}/login`, { method: 'POST', body: new URLSearchParams({ password: PASSWORD }), redirect: 'manual' });
    const cookie = (login.headers.get('set-cookie') || '').split(';')[0];
    check('a person can still log in', login.status === 303 && cookie.startsWith('dash_session='));
    check('the session cookie does not open the Canopy API', (await call(base, 'GET', '/api/canopy/v1/templates', { headers: { cookie } })).status === 401);
    check('...and still opens the dashboard API', (await call(base, 'GET', '/api/dash/clients', { headers: { cookie } })).status === 200);

    console.log('\n2. templates a client may use');
    const ttt = await call(base, 'GET', '/api/canopy/v1/clients/texas-tree-tops', { headers: bearer() });
    check('Texas Tree Tops: only the templates it runs, and their -c twins',
      JSON.stringify(ttt.json?.allowedTemplates) === '["removal-a","removal-c","storm-a","storm-c"]', JSON.stringify(ttt.json?.allowedTemplates));
    check('...its live pages are marked protected', ttt.json.pages.filter((p) => p.protected).map((p) => p.templateId).sort().join(',') === 'removal-a,storm-a');
    check('...the live URL is the canonical host', ttt.json.pages.some((p) => p.url === 'https://tree-template-factory.pages.dev/p/texas-tree-tops/removal-a/'));
    const jv = await call(base, 'GET', '/api/canopy/v1/clients/j-valdez', { headers: bearer() });
    check('J Valdez: removal and trimming only', JSON.stringify(jv.json?.allowedTemplates) === '["removal-a","removal-c","trimming-a","trimming-c"]', JSON.stringify(jv.json?.allowedTemplates));
    const st = await call(base, 'GET', '/api/canopy/v1/clients/summit-tree', { headers: bearer() });
    check('Summit Tree (demo): all ten', st.json?.allowedTemplates?.length === 10 && st.json.isDemo === true);
    check('a bad slug is refused', (await call(base, 'GET', '/api/canopy/v1/clients/..%2Fsecrets', { headers: bearer() })).status >= 400);

    console.log('\n3. a real client cannot be changed through the API');
    const before = originHead();
    const ro = await call(base, 'PUT', '/api/canopy/v1/clients/texas-tree-tops', { headers: bearer(), body: { name: 'Changed' } });
    check('PUT on a real client → 409 real_client_readonly', ro.status === 409 && ro.json.error === 'real_client_readonly');
    check('...and nothing was committed', originHead() === before);

    console.log('\n4. dry runs write nothing; a real write commits');
    const dry = await call(base, 'PUT', '/api/canopy/v1/clients/summit-tree', { headers: bearer(), body: { serviceArea: 'Fort Worth, TX', dryRun: true } });
    check('a dry-run update returns the record it would write', dry.status === 200 && dry.json.dryRun && dry.json.record.serviceArea === 'Fort Worth, TX');
    const newDry = await call(base, 'PUT', '/api/canopy/v1/clients/canopy-test-co', { headers: bearer(), body: { name: 'Canopy Test Co', dryRun: true } });
    check('a dry-run create returns the plan', newDry.status === 200 && newDry.json.created === true && newDry.json.plan.slug === 'canopy-test-co');
    const page = await call(base, 'POST', '/api/canopy/v1/clients/summit-tree/pages', { headers: bearer(), body: { templateId: 'removal-a', service: 'Tree Removal', location: 'Fort Worth', copy: { 'hero.h1a': 'Tree Removal in Fort Worth' }, dryRun: true } });
    check('a dry-run page returns its route and URL', page.status === 200 && page.json.route === '/demo/summit-tree/tree-removal-fort-worth' && page.json.url.endsWith('/demo/summit-tree/tree-removal-fort-worth/'), JSON.stringify(page.json).slice(0, 120));
    check('...and the build supports location pages on this branch', page.json.supportsLocationPages === true);
    check('nothing was committed by any dry run', originHead() === before);
    const bad1 = await call(base, 'POST', '/api/canopy/v1/clients/texas-tree-tops/pages', { headers: bearer(), body: { templateId: 'trimming-a', service: 'Trimming', location: 'Keller', dryRun: true } });
    check('a template the client does not run → 422', bad1.status === 422 && bad1.json.error === 'template_not_allowed');
    const bad2 = await call(base, 'POST', '/api/canopy/v1/clients/summit-tree/pages', { headers: bearer(), body: { templateId: 'removal-a', service: 'x', location: 'y', copy: { 'made.up': 'z' }, dryRun: true } });
    check('a copy key the template does not have → 422', bad2.status === 422 && bad2.json.unknown?.[0] === 'made.up');
    const bad3 = await call(base, 'POST', '/api/canopy/v1/clients/summit-tree/pages', { headers: bearer(), body: { templateId: 'removal-a', service: 'removal', location: 'a', dryRun: true } });
    check('a page slug that is a template name → 422', bad3.status === 422 && bad3.json.error === 'bad_page_slug');
    const c3 = await call(base, 'POST', '/api/canopy/v1/clients/summit-tree/pages', { headers: bearer(), body: { templateId: 'removal-c', service: 'Tree Removal', location: 'Keller', copy: { 'hero.h1a': 'x' }, dryRun: true } });
    check('a -c template accepts its -a copy keys', c3.status === 200, JSON.stringify(c3.json).slice(0, 80));

    const real = await call(base, 'POST', '/api/canopy/v1/clients/summit-tree/pages', { headers: bearer(), body: { templateId: 'removal-a', service: 'Tree Removal', location: 'Fort Worth', copy: { 'hero.h1a': 'Tree Removal in Fort Worth' } } });
    check('a real page write commits (to the throwaway origin)', real.status === 200 && real.json.commit && originHead() !== before, JSON.stringify(real.json).slice(0, 160));
    const rec = JSON.parse(git(ORIGIN, 'show', 'refs/heads/main:clients/summit-tree.json'));
    check('...the record carries the page', rec.pages?.[0]?.slug === 'tree-removal-fort-worth' && rec.pages[0].location === 'Fort Worth');
    check('...the commit is the studio’s, saying what it did', git(ORIGIN, 'log', '-1', '--format=%an|%s', 'refs/heads/main').trim() === 'Template Studio|canopy: page summit-tree/tree-removal-fort-worth');
    const listed = await call(base, 'GET', '/api/canopy/v1/clients/summit-tree', { headers: bearer() });
    check('...and the client now lists it as a location page', listed.json.pages.some((p) => p.kind === 'location' && p.route === '/demo/summit-tree/tree-removal-fort-worth'));
    const clash = await call(base, 'POST', '/api/canopy/v1/clients/summit-tree/pages', { headers: bearer(), body: { templateId: 'removal-b', service: 'Tree Removal', location: 'Fort Worth' } });
    check('the same slug on another template → 409', clash.status === 409 && clash.json.error === 'page_slug_taken');

    console.log('\n5. a studio whose build lacks location pages refuses to write one');
    const schema = join(REPO, 'app/src/schema/client.ts');
    const original = readFileSync(schema, 'utf8');
    writeFileSync(schema, original.replaceAll('canopy-pages: v1', 'no-pages'));
    const h2 = originHead();
    const old = await call(base, 'POST', '/api/canopy/v1/clients/summit-tree/pages', { headers: bearer(), body: { templateId: 'removal-a', service: 'Stump Grinding', location: 'Keller' } });
    check('→ 409 studio_needs_update, nothing written', old.status === 409 && old.json.error === 'studio_needs_update' && originHead() === h2);
    writeFileSync(schema, original);

    console.log('\n6. publish status is readable; the POST never confirms protected pages');
    const pub = await call(base, 'GET', '/api/canopy/v1/publish', { headers: bearer() });
    check('publish status is readable with the token', pub.status === 200 && 'state' in pub.json);
    // Behaviour, not a source grep: a fake publisher records what it was asked to run.
    const { makeCanopyApi } = await import(join(ROOT, 'server/canopy-api.mjs'));
    const calls = [];
    const fakePublisher = { status: { state: 'blocked', confirmToken: '/p/texas-tree-tops/removal-a' }, baseUrl: 'https://x', run(arg) { calls.push(arg); } };
    const unit = makeCanopyApi({ repoDir: REPO, core: async () => false, publisher: fakePublisher, token: () => TOKEN });
    const r = await unit.request('/publish', { method: 'POST', headers: { ...bearer(), 'content-type': 'application/json' },
      body: JSON.stringify({ confirmProtected: '/p/texas-tree-tops/removal-a' }) });
    check('publish from Canopy never confirms the protected pages, even when asked',
      r.status === 202 && calls.length === 1 && calls[0] && !('confirmProtected' in calls[0]), JSON.stringify(calls));
  } finally {
    srv.kill();
  }

  console.log('\n7. no token configured → 503');
  srv = boot(port + 1, { token: '' });
  try {
    await waitUp(`http://127.0.0.1:${port + 1}`);
    const r = await call(`http://127.0.0.1:${port + 1}`, 'GET', '/api/canopy/v1/templates', { headers: bearer() });
    check('the door is closed, never open', r.status === 503 && r.json.error === 'not_configured');
  } finally {
    srv.kill();
    rmSync(TMP, { recursive: true, force: true });
  }

  console.log(`\n${'='.repeat(60)}`);
  if (FAILS.length) {
    console.log(`${FAILS.length} of ${CHECKS} checks FAILED:`);
    for (const f of FAILS) console.log(`  - ${f}`);
    process.exit(1);
  }
  console.log(`all ${CHECKS} checks passed`);
}
main().catch((e) => { console.log(`  FAIL  ran to completion (${e?.stack?.split('\n').slice(0, 2).join(' | ')})`); process.exit(1); });
