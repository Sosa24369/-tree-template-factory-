/**
 * The studio's SAVE, tested the way it actually failed.
 *
 * The first real save from Railway died with
 *   fatal: unable to auto-detect email address (got 'root@<container>.(none)')
 * because the container has no git identity and the commit path did not supply one.
 * Worse, the record had already been written and staged, so the clone was left holding
 * an uncommitted edit that a later publish would have built and shipped.
 *
 * So this test runs the real dashboard-core save handler against a real git repo in
 * an environment scrubbed of every git identity source, and asserts:
 *
 *   1. that environment really is identity-less (a plain `git commit` fails there);
 *   2. a save commits anyway, authored "Template Studio <studio@leedscompany.local>",
 *      with the operator's message and NO trailer;
 *   3. a save whose commit fails (forced with a pre-commit hook) returns 500
 *      commit_failed, and leaves the file on disk byte-identical to the last commit
 *      and the tree clean — nothing half-written;
 *   4. a save with no net change is a 200 with commit:null, not an error;
 *   5. a save whose PUSH fails keeps the commit, keeps the file, and answers 502
 *      push_failed with git's detail.
 *
 * Usage: node scripts/test-studio-save.mjs   (exit 1 on any failed assertion)
 */
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, rmSync, chmodSync, existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { dashboardCore, STUDIO_IDENTITY } from '../app/dashboard-core.mjs';

let pass = 0;
const fails = [];
const ok = (name, cond, extra = '') => (cond ? (pass++, console.log(`  ok  ${name}`)) : fails.push(`${name} ${extra}`));

/* ------------------------------------------------------------------ *
 * An identity-less environment, like a fresh Railway container.
 * ------------------------------------------------------------------ */
const scratch = mkdtempSync(join(tmpdir(), 'studio-save-'));
const emptyHome = join(scratch, 'home');
mkdirSync(emptyHome);
for (const k of ['GIT_AUTHOR_NAME', 'GIT_AUTHOR_EMAIL', 'GIT_COMMITTER_NAME', 'GIT_COMMITTER_EMAIL', 'EMAIL']) delete process.env[k];
process.env.HOME = emptyHome;
process.env.GIT_CONFIG_GLOBAL = join(emptyHome, 'no-such-gitconfig');
process.env.GIT_CONFIG_NOSYSTEM = '1';

const repo = join(scratch, 'repo');
mkdirSync(join(repo, 'clients'), { recursive: true });
mkdirSync(join(repo, 'app', 'public', 'assets', 'acme'), { recursive: true });
const g = (args, opts = {}) => execFileSync('git', args, { cwd: repo, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], ...opts });
g(['init', '-q', '-b', 'main']);

const RECORD = {
  slug: 'acme', name: 'Acme Test Co', serviceArea: '', serviceAreaList: [],
  brand: { logoUrl: null, primaryColor: '#111111', accentColor: '#222222', onPrimaryColor: '#ffffff' },
  phone: { e164: '+15550001111', kind: 'direct', displayOverride: null, googleAdsCallAsset: null },
  leadDestination: { thankYouUrl: '/thank-you', isExternalAllowed: false },
  consent: { smsCopy: 'consent copy', required: false, privacyPolicyUrl: '', termsOfServiceUrl: '' },
  crm: { ghlLocationId: '', adClickIdFieldId: null, attributionFieldIds: {}, leadTags: [], leadSource: '' },
  tracking: { gtmContainerId: null, callRailSwapScriptUrl: null },
  photos: {}, reviews: [], copyOverrides: {}, excludedTemplates: [],
};
const file = join(repo, 'clients', 'acme.json');
writeFileSync(file, JSON.stringify(RECORD, null, 2) + '\n');
writeFileSync(join(repo, 'app', 'public', 'assets', 'acme', '.gitkeep'), '');
// Seed commit with an EXPLICIT identity — the point is that the core must not rely on one.
g(['-c', 'user.name=seed', '-c', 'user.email=seed@example.invalid', 'add', '-A']);
g(['-c', 'user.name=seed', '-c', 'user.email=seed@example.invalid', 'commit', '-q', '-m', 'seed']);
const seedHead = g(['rev-parse', 'HEAD']).trim();

console.log('1. the environment is genuinely identity-less');
{
  writeFileSync(join(repo, 'probe.txt'), 'x');
  g(['add', 'probe.txt']);
  let err = '';
  try { g(['commit', '-q', '-m', 'should fail']); } catch (e) { err = String(e.stderr || e.message); }
  ok('a plain `git commit` fails for want of an identity', /unable to auto-detect email|Please tell me who you are|empty ident/i.test(err), err.slice(0, 120));
  g(['reset', '-q', '--', 'probe.txt']); rmSync(join(repo, 'probe.txt'));
}

/* ------------------------------------------------------------------ *
 * Drive the real handler with a minimal Node req/res.
 * ------------------------------------------------------------------ */
function call(handle, body) {
  const json = JSON.stringify(body);
  const req = {
    url: '/api/dash/save', method: 'POST',
    on(ev, cb) { if (ev === 'data') setImmediate(() => cb(Buffer.from(json))); if (ev === 'end') setImmediate(() => cb()); },
  };
  return new Promise((resolve) => {
    const res = { statusCode: 200, setHeader() {}, end(b) { resolve({ status: res.statusCode, json: JSON.parse(String(b)) }); } };
    handle(req, res);
  });
}
const withOverride = (h1) => ({ ...RECORD, copyOverrides: { 'removal-a': { 'hero.h1a': h1 } } });

console.log('\n2. a save commits with the studio identity and no trailer');
{
  const handle = dashboardCore({ repoRoot: repo });
  const r = await call(handle, { slug: 'acme', record: withOverride('Probe One'), message: 'studio: probe one' });
  ok('save -> 200', r.status === 200, JSON.stringify(r.json));
  ok('save -> a commit sha', typeof r.json.commit === 'string' && r.json.commit.length >= 7, JSON.stringify(r.json));
  const [author, ...bodyLines] = g(['log', '-1', '--format=%an <%ae>%n%B']).trim().split('\n');
  const message = bodyLines.join('\n').trim();
  ok(`author is "${STUDIO_IDENTITY.name} <${STUDIO_IDENTITY.email}>"`, author === `${STUDIO_IDENTITY.name} <${STUDIO_IDENTITY.email}>`, author);
  ok('message is the operator\'s, verbatim', message === 'studio: probe one', JSON.stringify(message));
  ok('message carries NO Co-Authored-By trailer', !/Co-Authored-By/i.test(message));
  ok('tree is clean after the save', g(['status', '--porcelain']).trim() === '');
  ok('the record on disk is the committed content', JSON.parse(readFileSync(file, 'utf8')).copyOverrides['removal-a']['hero.h1a'] === 'Probe One');
}

console.log('\n3. a save whose commit fails rolls the record back — nothing half-written');
{
  const before = readFileSync(file, 'utf8');
  const beforeHead = g(['rev-parse', 'HEAD']).trim();
  const hook = join(repo, '.git', 'hooks', 'pre-commit');
  writeFileSync(hook, '#!/bin/sh\necho "pre-commit: refusing, on purpose" >&2\nexit 1\n');
  chmodSync(hook, 0o755);
  try {
    const handle = dashboardCore({ repoRoot: repo });
    const r = await call(handle, { slug: 'acme', record: withOverride('Probe Two — must not persist'), message: 'studio: probe two' });
    ok('failed commit -> 500', r.status === 500, JSON.stringify(r.json));
    ok('failed commit -> error commit_failed', r.json.error === 'commit_failed', JSON.stringify(r.json));
    ok('failed commit -> rolledBack:true', r.json.rolledBack === true);
    ok('failed commit -> git\'s stderr is in detail', /refusing, on purpose/.test(r.json.detail || ''), JSON.stringify(r.json.detail));
    ok('record on disk is BYTE-IDENTICAL to before the attempt', readFileSync(file, 'utf8') === before);
    ok('nothing is staged, tree clean', g(['status', '--porcelain']).trim() === '', g(['status', '--porcelain']));
    ok('HEAD did not move', g(['rev-parse', 'HEAD']).trim() === beforeHead);
  } finally {
    rmSync(hook, { force: true });
  }
}

console.log('\n4. a save with no net change is not an error');
{
  const handle = dashboardCore({ repoRoot: repo });
  const beforeHead = g(['rev-parse', 'HEAD']).trim();
  const r = await call(handle, { slug: 'acme', record: withOverride('Probe One'), message: 'studio: no-op' });
  ok('no-op save -> 200', r.status === 200, JSON.stringify(r.json));
  ok('no-op save -> commit:null', r.json.commit === null, JSON.stringify(r.json));
  ok('no-op save -> HEAD unchanged', g(['rev-parse', 'HEAD']).trim() === beforeHead);
  ok('no-op save -> tree clean', g(['status', '--porcelain']).trim() === '');
}

console.log('\n5. a save whose push fails keeps the commit and says so');
{
  const handle = dashboardCore({
    repoRoot: repo,
    afterCommit: async () => { const e = new Error('push_failed'); e.detail = 'remote: simulated rejection'; throw e; },
  });
  const beforeHead = g(['rev-parse', 'HEAD']).trim();
  const r = await call(handle, { slug: 'acme', record: withOverride('Probe Three'), message: 'studio: probe three' });
  ok('push failure -> 502', r.status === 502, JSON.stringify(r.json));
  ok('push failure -> error push_failed with detail', r.json.error === 'push_failed' && /simulated rejection/.test(r.json.detail), JSON.stringify(r.json));
  ok('push failure -> the commit EXISTS (HEAD moved)', g(['rev-parse', 'HEAD']).trim() !== beforeHead);
  ok('push failure -> response names the commit', typeof r.json.commit === 'string');
  ok('push failure -> record on disk is the committed content (not rolled back)', JSON.parse(readFileSync(file, 'utf8')).copyOverrides['removal-a']['hero.h1a'] === 'Probe Three');
  ok('push failure -> tree clean', g(['status', '--porcelain']).trim() === '');
}

ok('seed commit is still the root of history', g(['rev-list', '--max-parents=0', 'HEAD']).trim() === seedHead);

rmSync(scratch, { recursive: true, force: true });
console.log(`\n${pass} passed, ${fails.length} failed`);
if (fails.length) {
  for (const f of fails) console.log(`  FAIL  ${f}`);
  process.exit(1);
}
console.log('studio save contract holds.');
