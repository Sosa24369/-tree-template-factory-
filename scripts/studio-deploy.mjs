/**
 * Deploy the Template Studio (the editor service) to Railway in one command:
 *
 *   npm run studio:deploy            guards → build the studio UI → railway up → wait for green
 *   npm run studio:health            only poll /api/health on the deployed studio
 *
 * Env: STUDIO_URL (default https://editor-production-3bee.up.railway.app),
 *      RAILWAY_SERVICE (default editor).
 *
 * The CLI must be linked to the tree-template-editor project IN THE WORKSPACE THAT
 * OWNS IT — a different Railway account sees "No linked project" or "Workspace not
 * found". In that case this script prints the exact link command and exits 1; it
 * never fails silently. Pushing to GitHub does NOT redeploy the studio: `railway up`
 * is the deploy.
 */
import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';

const ROOT = new URL('..', import.meta.url).pathname;
const URL_ = (process.env.STUDIO_URL || 'https://editor-production-3bee.up.railway.app').replace(/\/$/, '');
const SERVICE = process.env.RAILWAY_SERVICE || 'editor';
const healthOnly = process.argv.includes('--health-only');

const sh = (cmd, args, opts = {}) => spawnSync(cmd, args, { cwd: ROOT, encoding: 'utf8', stdio: opts.quiet ? 'pipe' : 'inherit', ...opts });
const step = (n) => console.log(`\n▶ ${n}`);
const die = (msg) => { console.error(`\n✖ ${msg}`); process.exit(1); };

async function health() {
  const r = await fetch(`${URL_}/api/health`, { signal: AbortSignal.timeout(8000) });
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  return r.json();
}
const describe = (h) => Object.entries(h.checks).map(([k, v]) => `${v ? '✓' : '✗'} ${k}`).join('  ');

async function waitGreen({ since }) {
  step(`Waiting for ${URL_}/api/health to come back green on the NEW deployment`);
  const deadline = Date.now() + 8 * 60_000;
  let last = null;
  while (Date.now() < deadline) {
    try {
      const h = await health();
      // A restart shows as uptime dropping below the reading we took before `railway up`.
      const restarted = since == null || h.uptimeSeconds < since;
      if (h.ok && restarted) { console.log(`✓ green  ${describe(h)}  uptime=${h.uptimeSeconds}s`); return h; }
      last = `${h.ok ? 'green but still the OLD container' : 'red: ' + describe(h)} (uptime ${h.uptimeSeconds}s)`;
    } catch (e) { last = `unreachable: ${e.message}`; }
    process.stdout.write(`  … ${last}\r`);
    await new Promise((r) => setTimeout(r, 5000));
  }
  die(`Not green after 8 minutes. Last: ${last}\n  Check: railway logs -s ${SERVICE}   and   curl ${URL_}/api/health`);
}

if (healthOnly) {
  try { const h = await health(); console.log(JSON.stringify(h, null, 2)); process.exit(h.ok ? 0 : 1); } catch (e) { die(`${URL_}/api/health unreachable: ${e.message}`); }
}

step('Guard suite (pre)');
if (sh('node', ['scripts/run-guards.mjs', 'pre']).status !== 0) die('Guards failed — nothing deployed. Fix the failing guard above and run again.');

step('Building the studio UI (app/dist-dashboard)');
if (sh('npm', ['--prefix', 'app', 'run', 'build:dashboard']).status !== 0) die('Dashboard build failed — nothing deployed.');
if (!existsSync(`${ROOT}app/dist-dashboard/dashboard.html`)) die('app/dist-dashboard/dashboard.html missing after build.');

step('Checking the Railway link');
const who = sh('railway', ['whoami'], { quiet: true });
if (who.status !== 0) die('Railway CLI is not logged in. Run:\n\n    railway login\n\nthen `npm run studio:deploy` again.');
const st = sh('railway', ['status', '--json'], { quiet: true });
const linked = st.status === 0 && /tree-template-editor/.test(st.stdout || '');
if (!linked) {
  const pushed = sh('git', ['status', '-sb'], { quiet: true }).stdout.split('\n')[0];
  die([
    'This directory is not linked to the tree-template-editor project (or this Railway account cannot see its workspace).',
    'Nothing was deployed. From a shell logged into the account that OWNS the editor project, run:',
    '',
    `    railway link -p tree-template-editor -s ${SERVICE} -e production`,
    '    npm run studio:deploy',
    '',
    `Pushing to GitHub does not redeploy the studio. (${pushed})`,
  ].join('\n'));
}

let before = null;
try { before = (await health()).uptimeSeconds; } catch { /* old deployment may predate /api/health */ }

step(`railway up --detach -s ${SERVICE}`);
if (sh('railway', ['up', '--detach', '-s', SERVICE]).status !== 0) die('`railway up` failed — see the output above.');

const h = await waitGreen({ since: before });
console.log(`\n✓ Studio is live: ${URL_}/   (last publish: ${h.lastPublishAt ?? 'none recorded'})`);
