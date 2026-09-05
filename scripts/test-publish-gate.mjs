/**
 * The studio's publish gate, tested without publishing anything.
 *
 * Two mechanisms stand between the studio's Publish button and a live advertising
 * page, and both are the kind of thing that is only ever exercised when it matters:
 *
 *   server/guards.mjs     — the full guard suite; ANY failure must stop the publish
 *   server/protected.mjs  — the four ad-carrying pages must be proven unchanged, or
 *                           the publish stops at `blocked` until confirmed
 *
 * This exercises both against real files and a mocked network, so the failure paths
 * are proven on every run rather than the first time something goes wrong.
 *
 * Usage: node scripts/test-publish-gate.mjs   (exit 1 on any failed assertion)
 */
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { GUARDS, allPassed, failedIds, runGuards } from '../server/guards.mjs';
import { checkProtectedRoutes, confirmationTokenFor, loadProtectedRoutes } from '../server/protected.mjs';
import { makePublisher } from '../server/publish.mjs';

let pass = 0;
const fails = [];
const ok = (name, cond, extra = '') => (cond ? (pass++, console.log(`  ok  ${name}`)) : fails.push(`${name} ${extra}`));

const ROOT = new URL('..', import.meta.url).pathname;

/* ------------------------------------------------------------------ *
 * The suite itself
 * ------------------------------------------------------------------ */
console.log('guard suite — shape');
{
  ok('every guard has an id, label, phase and a why', GUARDS.every((g) => g.id && g.label && g.why && ['pre', 'post'].includes(g.phase)));
  ok('guard ids are unique', new Set(GUARDS.map((g) => g.id)).size === GUARDS.length);
  const ids = new Set(GUARDS.map((g) => g.id));
  // The five the brief names by hand must all be in there. R5 lives inside
  // verify-factory-rules.mjs, which is why it is not its own id.
  for (const id of ['r4-leakage', 'factory-rules', 'copy-parity', 'tsc', 'tracking']) {
    ok(`suite includes ${id}`, ids.has(id));
  }
  ok('both phases are populated', GUARDS.some((g) => g.phase === 'pre') && GUARDS.some((g) => g.phase === 'post'));
}

console.log('\nguard suite — allPassed is fail-closed');
{
  ok('an empty result set is NOT a pass', allPassed([]) === false);
  ok('all ok -> pass', allPassed([{ ok: true }, { ok: true }]) === true);
  ok('one failure -> not a pass', allPassed([{ ok: true }, { ok: false }]) === false);
  ok('failedIds names the failures', JSON.stringify(failedIds([{ ok: true, id: 'a' }, { ok: false, id: 'b' }])) === '["b"]');
}

console.log('\nguard suite — a guard that cannot run counts as FAILED');
{
  // A repo dir with no scripts/ at all: every guard should report not-ok rather
  // than being skipped. Proves "a guard that cannot run has not cleared anything".
  const empty = mkdtempSync(join(tmpdir(), 'guard-empty-'));
  try {
    const results = await runGuards('post', { repoDir: empty, log: () => {} });
    ok('missing scripts -> every post guard fails', results.length > 0 && results.every((r) => !r.ok), JSON.stringify(results.map((r) => [r.id, r.ok])));
    ok('missing scripts -> allPassed false', allPassed(results) === false);
  } finally {
    rmSync(empty, { recursive: true, force: true });
  }
}

/* ------------------------------------------------------------------ *
 * The live-campaign guard
 * ------------------------------------------------------------------ */
console.log('\nprotected routes — the list is real');
{
  const { routes, error } = loadProtectedRoutes(ROOT);
  ok('protected-routes.json parses', error === null, String(error));
  ok('it lists at least one route', routes.length > 0);
  ok('every route is an absolute path', routes.every((r) => r.startsWith('/')));
  ok('the four ad-carrying pages are all listed', ['/p/texas-tree-tops/removal-a', '/p/texas-tree-tops/storm-a', '/p/j-valdez/removal-a', '/p/j-valdez/trimming-a'].every((r) => routes.includes(r)), JSON.stringify(routes));
}

/** A scratch repo with one protected route and a built page for it. */
function fixture(builtHtml, routes = ['/p/acme/removal-a']) {
  const dir = mkdtempSync(join(tmpdir(), 'prot-'));
  writeFileSync(join(dir, 'protected-routes.json'), JSON.stringify({ routes }));
  if (builtHtml !== null) {
    const out = join(dir, 'app', 'dist', 'p', 'acme', 'removal-a');
    mkdirSync(out, { recursive: true });
    writeFileSync(join(out, 'index.html'), builtHtml);
  }
  return dir;
}
const serving = (html, status = 200) => async () => ({ ok: status >= 200 && status < 300, status, text: async () => html });

const PAGE = '<html>\n<head><script src="/assets/index-AAAA1111.js"></script></head>\n<body><p>Call (682) 452-0735</p></body>\n</html>';

console.log('\nprotected routes — unchanged page does not block');
{
  const dir = fixture(PAGE);
  try {
    const r = await checkProtectedRoutes({ repoDir: dir, baseUrl: 'https://x.test', fetchImpl: serving(PAGE) });
    ok('identical live page -> not changed', r.changed.length === 0 && r.unreachable.length === 0, JSON.stringify(r));
  } finally { rmSync(dir, { recursive: true, force: true }); }
}

console.log('\nprotected routes — a bundle-hash-only difference does not block');
{
  const dir = fixture(PAGE.replace('index-AAAA1111.js', 'index-BBBB2222.js'));
  try {
    const r = await checkProtectedRoutes({ repoDir: dir, baseUrl: 'https://x.test', fetchImpl: serving(PAGE) });
    ok('only the content hash differs -> not changed', r.changed.length === 0, JSON.stringify(r.changed));
  } finally { rmSync(dir, { recursive: true, force: true }); }
}

console.log('\nprotected routes — a real content change BLOCKS');
{
  // The exact disaster this exists for: the phone number on an ad page changes.
  const dir = fixture(PAGE.replace('(682) 452-0735', '(555) 555-0100'));
  try {
    const r = await checkProtectedRoutes({ repoDir: dir, baseUrl: 'https://x.test', fetchImpl: serving(PAGE) });
    ok('a changed phone number is flagged', r.changed.length === 1 && r.changed[0].route === '/p/acme/removal-a', JSON.stringify(r.changed));
    ok('the diff shows both sides', r.changed[0].diff.some((d) => d.includes('452-0735')) && r.changed[0].diff.some((d) => d.includes('555-0100')), JSON.stringify(r.changed[0].diff));
  } finally { rmSync(dir, { recursive: true, force: true }); }
}

console.log('\nprotected routes — unverifiable is treated as unsafe');
{
  {
    const dir = fixture(PAGE);
    try {
      const r = await checkProtectedRoutes({ repoDir: dir, baseUrl: 'https://x.test', fetchImpl: serving('', 500) });
      ok('live page 500 -> unreachable, not "unchanged"', r.unreachable.length === 1 && r.changed.length === 0, JSON.stringify(r));
    } finally { rmSync(dir, { recursive: true, force: true }); }
  }
  {
    const dir = fixture(PAGE);
    try {
      const r = await checkProtectedRoutes({ repoDir: dir, baseUrl: 'https://x.test', fetchImpl: async () => { throw new Error('ENOTFOUND'); } });
      ok('network failure -> unreachable, not "unchanged"', r.unreachable.length === 1, JSON.stringify(r));
    } finally { rmSync(dir, { recursive: true, force: true }); }
  }
  {
    // The route stops being generated at all — the ad destination would 404.
    const dir = fixture(null);
    try {
      const r = await checkProtectedRoutes({ repoDir: dir, baseUrl: 'https://x.test', fetchImpl: serving(PAGE) });
      ok('route missing from the build -> changed (would 404)', r.changed.length === 1 && /404/.test(r.changed[0].reason), JSON.stringify(r.changed));
    } finally { rmSync(dir, { recursive: true, force: true }); }
  }
  {
    const dir = fixture(PAGE);
    try {
      const r = await checkProtectedRoutes({ repoDir: dir, baseUrl: '', fetchImpl: serving(PAGE) });
      ok('no base URL -> hard error, nothing declared safe', Boolean(r.error) && r.changed.length === 0, JSON.stringify(r));
    } finally { rmSync(dir, { recursive: true, force: true }); }
  }
  {
    const dir = mkdtempSync(join(tmpdir(), 'prot-none-'));
    try {
      const r = await checkProtectedRoutes({ repoDir: dir, baseUrl: 'https://x.test', fetchImpl: serving(PAGE) });
      ok('missing protected-routes.json -> hard error, not a silent pass', Boolean(r.error), JSON.stringify(r));
    } finally { rmSync(dir, { recursive: true, force: true }); }
  }
}

console.log('\nprotected routes — the confirmation names the exact set');
{
  const a = confirmationTokenFor(['/p/a/x', '/p/b/y']);
  ok('token is order-independent', a === confirmationTokenFor(['/p/b/y', '/p/a/x']));
  ok('a token for a SMALLER set does not match', confirmationTokenFor(['/p/a/x']) !== a);
  ok('a token for a LARGER set does not match', confirmationTokenFor(['/p/a/x', '/p/b/y', '/p/c/z']) !== a);
  ok('a token for a DIFFERENT set does not match', confirmationTokenFor(['/p/a/x', '/p/b/z']) !== a);
}

console.log('\npublish refuses a clone with uncommitted tracked changes');
{
  // The residue of a failed save is a written-but-uncommitted record. A publish must
  // stop at `pulling`, name the file, and never reach sync/guards/build/wrangler.
  const calls = [];
  const git = {
    dirtyTracked: () => ['M  clients/acme.json'],
    sync: () => { calls.push('sync'); return 'pulled'; },
    head: () => { calls.push('head'); return 'abc1234'; },
  };
  const pub = makePublisher({ repoDir: '/nonexistent-on-purpose', git, cfToken: 'x', cfAccountId: 'x', cfProject: 'x', baseUrl: 'https://x.test', log: () => {} });
  const st = await pub.run();
  ok('dirty clone -> state failed', st.state === 'failed', st.state);
  ok('dirty clone -> stage pulling', st.stage === 'pulling', st.stage);
  ok('dirty clone -> names the file', st.tail.some((l) => l.includes('clients/acme.json')), JSON.stringify(st.tail));
  ok('dirty clone -> says nothing was deployed', st.tail.some((l) => /Nothing has been deployed/.test(l)));
  ok('dirty clone -> git.sync() was never called', !calls.includes('sync'), JSON.stringify(calls));
  ok('dirty clone -> no guard ran', (st.guards ?? []).length === 0);
}
{
  // And a CLEAN clone gets past that check (it then fails on the fake repoDir, which
  // is fine — the point is that the refusal is specific to dirtiness).
  const git = { dirtyTracked: () => [], sync: () => 'pulled', head: () => 'abc1234' };
  const pub = makePublisher({ repoDir: '/nonexistent-on-purpose', git, cfToken: 'x', cfAccountId: 'x', cfProject: 'x', baseUrl: 'https://x.test', log: () => {} });
  const st = await pub.run();
  ok('clean clone -> gets past pulling', !(st.stage === 'pulling' && st.tail.some((l) => /uncommitted/.test(l))), `${st.stage}: ${st.tail[0]}`);
}

console.log(`\n${pass} passed, ${fails.length} failed`);
if (fails.length) {
  for (const f of fails) console.log(`  FAIL  ${f}`);
  process.exit(1);
}
console.log('publish gate holds.');
