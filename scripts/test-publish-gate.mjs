/**
 * The studio's publish gate, tested without publishing anything.
 *
 * Two mechanisms stand between the studio's Publish button and a live advertising
 * page, and both are the kind of thing that is only ever exercised when it matters:
 *
 *   server/guards.mjs     — the full guard suite; ANY failure must stop the publish
 *   server/protected.mjs  — the four ad-carrying pages must be proven unchanged, or
 *                           the publish stops at `blocked` until confirmed
 *   server/receipt.mjs    — what `live` reports: which pages changed (proven against
 *                           the live site, since wrangler prints only a count), each
 *                           at its production address, and the deployment id
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
import { listBuiltPages, productionUrl, diffPagesAgainstLive, parseWranglerOutput, buildReceipt } from '../server/receipt.mjs';

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

/* ------------------------------------------------------------------ *
 * The receipt
 * ------------------------------------------------------------------ */
console.log('\nreceipt — built pages map to production addresses');
{
  const dir = mkdtempSync(join(tmpdir(), 'receipt-'));
  try {
    for (const rel of ['', 'p/acme/removal-a', 'demo/summit/storm-b']) {
      mkdirSync(join(dir, 'app', 'dist', rel), { recursive: true });
      writeFileSync(join(dir, 'app', 'dist', rel, 'index.html'), PAGE);
    }
    writeFileSync(join(dir, 'app', 'dist', '404.html'), '<h1>404</h1>');
    const routes = listBuiltPages(dir);
    ok('every index.html is a route; 404.html is not', JSON.stringify(routes) === JSON.stringify(['/', '/demo/summit/storm-b', '/p/acme/removal-a']), JSON.stringify(routes));
    ok('a real client resolves under /p/', productionUrl('https://x.test', '/p/acme/removal-a') === 'https://x.test/p/acme/removal-a/');
    ok('a demo client resolves under /demo/', productionUrl('https://x.test/', '/demo/summit/storm-b') === 'https://x.test/demo/summit/storm-b/');
    ok('the root route resolves to the origin', productionUrl('https://x.test', '/') === 'https://x.test/');
  } finally { rmSync(dir, { recursive: true, force: true }); }
}

console.log('\nreceipt — changed pages are the ones that differ from LIVE');
{
  const dir = mkdtempSync(join(tmpdir(), 'receipt-'));
  try {
    const put = (rel, html) => { mkdirSync(join(dir, 'app', 'dist', rel), { recursive: true }); writeFileSync(join(dir, 'app', 'dist', rel, 'index.html'), html); };
    put('p/acme/removal-a', PAGE);                                                    // identical to live
    put('p/acme/storm-a', PAGE.replace('index-AAAA1111.js', 'index-CCCC3333.js'));   // bundle hash only
    put('demo/summit/removal-a', PAGE.replace('452-0735', '555-0100'));               // a real change
    put('demo/summit/agnostic', PAGE);                                                // live 404 -> new
    put('p/acme/trimming-a', PAGE);                                                   // live 500 -> unreachable
    const live = {
      'https://x.test/p/acme/removal-a/': [200, PAGE],
      'https://x.test/p/acme/storm-a/': [200, PAGE],
      'https://x.test/demo/summit/removal-a/': [200, PAGE],
      'https://x.test/demo/summit/agnostic/': [404, 'nope'],
      'https://x.test/p/acme/trimming-a/': [500, ''],
    };
    const fetchImpl = async (url) => { const [status, html] = live[url] ?? [404, '']; return { ok: status < 300, status, text: async () => html }; };
    const r = await diffPagesAgainstLive({ repoDir: dir, baseUrl: 'https://x.test', fetchImpl });
    ok('all five pages were compared', r.checked === 5, String(r.checked));
    ok('an identical page is not changed', !r.changed.some((c) => c.route === '/p/acme/removal-a'));
    ok('a bundle-hash-only difference is not changed', !r.changed.some((c) => c.route === '/p/acme/storm-a'));
    ok('a real content change is listed, with its production URL', r.changed.some((c) => c.route === '/demo/summit/removal-a' && c.url === 'https://x.test/demo/summit/removal-a/' && c.reason === 'changed'), JSON.stringify(r.changed));
    ok('a page the live site 404s on is listed as new', r.changed.some((c) => c.route === '/demo/summit/agnostic' && c.reason === 'new'));
    ok('an unreachable page is reported, not declared changed or unchanged', r.unreachable.length === 1 && r.unreachable[0].route === '/p/acme/trimming-a' && !r.changed.some((c) => c.route === '/p/acme/trimming-a'), JSON.stringify(r.unreachable));
  } finally { rmSync(dir, { recursive: true, force: true }); }
}

console.log('\nreceipt — wrangler output');
{
  const real = ['✨ Success! Uploaded 0 files (212 already uploaded) (0.36 sec)', '', '🌎 Uploading Functions bundle', '✨ Deployment complete! Take a peek over at https://6d174f7b.tree-template-factory.pages.dev'];
  const w = parseWranglerOutput(real);
  ok('count parsed from the real Phase 0 output', w.uploaded === 0 && w.alreadyUploaded === 212, JSON.stringify(w));
  ok('deployment id is the hash label of the URL', w.deploymentId === '6d174f7b' && w.url === 'https://6d174f7b.tree-template-factory.pages.dev', JSON.stringify(w));
  const two = parseWranglerOutput(['✨ Success! Uploaded 2 files (210 already uploaded) (0.41 sec)']);
  ok('"2 files" parses', two.uploaded === 2 && two.alreadyUploaded === 210);
  const one = parseWranglerOutput(['✨ Success! Uploaded 1 file (211 already uploaded) (0.2 sec)']);
  ok('"1 file" (singular) parses', one.uploaded === 1);
  const none = parseWranglerOutput(['✘ Authentication error [code: 10000]']);
  ok('no upload line -> nulls, not zeros', none.uploaded === null && none.deploymentId === null, JSON.stringify(none));
  const alias = parseWranglerOutput(['✨ Deployment complete! Take a peek over at https://main.tree-template-factory.pages.dev', 'https://6d174f7b.tree-template-factory.pages.dev']);
  ok('a branch alias URL is not mistaken for the deployment id', alias.deploymentId === '6d174f7b', JSON.stringify(alias));
}

console.log('\nreceipt — assembled');
{
  const base = { baseUrl: 'https://x.test', startedAt: '2026-09-05T08:56:00.000Z', finishedAt: '2026-09-05T08:56:09.100Z', routes: ['/', '/p/acme/removal-a'] };
  const w = parseWranglerOutput(['✨ Success! Uploaded 0 files (212 already uploaded) (0.36 sec)', '✨ Deployment complete! Take a peek over at https://6d174f7b.x.pages.dev']);
  const nothing = buildReceipt({ ...base, pages: { checked: 2, changed: [], unreachable: [] }, wrangler: w, previous: { routes: base.routes } });
  ok('zero changed + zero uploaded -> nothingChanged', nothing.nothingChanged === true, JSON.stringify(nothing));
  ok('duration is measured from the timestamps', nothing.ms === 9100, String(nothing.ms));
  const changed = buildReceipt({ ...base, pages: { checked: 2, changed: [{ route: '/p/acme/removal-a', url: 'https://x.test/p/acme/removal-a/', reason: 'changed' }], unreachable: [] }, wrangler: parseWranglerOutput(['Uploaded 1 file (211 already uploaded)']), previous: { routes: base.routes } });
  ok('a changed page is on the receipt with its URL', changed.changed.length === 1 && changed.changed[0].url === 'https://x.test/p/acme/removal-a/' && changed.nothingChanged === false);
  ok('a wrangler count that matches does not disagree', changed.countDisagrees === false);
  const dis = buildReceipt({ ...base, pages: { checked: 2, changed: [{ route: '/p/acme/removal-a', url: 'u', reason: 'changed' }], unreachable: [] }, wrangler: parseWranglerOutput(['Uploaded 0 files (212 already uploaded)']), previous: { routes: base.routes } });
  ok('wrangler uploading FEWER files than pages changed is flagged', dis.countDisagrees === true);
  const removed = buildReceipt({ ...base, pages: { checked: 2, changed: [], unreachable: [] }, wrangler: w, previous: { routes: [...base.routes, '/p/acme/storm-a'] } });
  ok('a route in the last deploy but not this build is listed as removed', removed.removed.length === 1 && removed.removed[0].route === '/p/acme/storm-a' && removed.nothingChanged === false, JSON.stringify(removed.removed));
  const first = buildReceipt({ ...base, pages: { checked: 2, changed: [], unreachable: [] }, wrangler: w, previous: null });
  ok('with no previous deploy on record, removals are unknown rather than empty-and-certain', first.removalsKnown === false && first.removed.length === 0);
}

console.log(`\n${pass} passed, ${fails.length} failed`);
if (fails.length) {
  for (const f of fails) console.log(`  FAIL  ${f}`);
  process.exit(1);
}
console.log('publish gate holds.');
