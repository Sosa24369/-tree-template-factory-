/**
 * Publish — a state machine the UI displays live.
 *
 *   idle → pulling → checking(pre) → building → checking(post) → protected
 *                                                       ↓            ↓
 *                                                    blocked ← ── ── ┘
 *                                                       ↓ (explicit confirmation)
 *                                                   deploying → live | failed
 *
 * pulling    `git pull --ff-only` in REPO_DIR.
 * checking   THE GUARD SUITE (server/guards.mjs). Source-only guards run before the
 *            build so a type error does not cost two minutes; the rest run against
 *            app/dist afterwards. ANY failure ends the publish at `failed` with
 *            `failedGuards` naming which — nothing deploys. There is no override.
 * building   `npm run build` in REPO_DIR/app with INCLUDE_FIXTURES unset (fixtures
 *            never ship). Installs dependencies first on a fresh volume.
 * protected  Every route in /protected-routes.json is compared against the LIVE page
 *            (server/protected.mjs). Any difference → `blocked`, and the publish only
 *            proceeds when the caller repeats the request confirming that exact set.
 * deploying  `wrangler pages deploy dist --project-name=$CF_PAGES_PROJECT`.
 *
 * Any stage failure → { state:'failed', stage, exitCode, tail } where tail is the last
 * 40 lines of output, shown verbatim. A missing CLOUDFLARE_API_TOKEN fails at
 * `deploying` BEFORE wrangler is invoked. `live` is set only when wrangler exited 0.
 * One publish at a time; a second request while one runs returns the current state.
 */

import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { runGuards, allPassed, failedIds, GUARDS } from './guards.mjs';
import { checkProtectedRoutes, confirmationTokenFor } from './protected.mjs';

const IDLE = {
  state: 'idle',
  stage: null,
  startedAt: null,
  finishedAt: null,
  exitCode: null,
  tail: [],
  url: null,
  commit: null,
  guards: [],
  runningGuard: null,
  failedGuards: [],
  protectedRoutes: null,
  confirmToken: null,
};

export function makePublisher({ repoDir, git, cfToken, cfAccountId, cfProject, baseUrl, log = console.log }) {
  let status = { ...IDLE };
  let running = false;

  const tailOf = (lines) => lines.slice(-40);

  function runStep(stage, cmd, args, opts) {
    return new Promise((resolve) => {
      status = { ...status, state: stage, stage, tail: [] };
      const lines = [];
      const env = { ...process.env, ...(opts.env || {}) };
      delete env.INCLUDE_FIXTURES; // fixtures never ship
      const child = spawn(cmd, args, { cwd: opts.cwd, env, stdio: ['ignore', 'pipe', 'pipe'] });
      const onData = (buf) => { for (const l of buf.toString().split('\n')) if (l.trim()) { lines.push(l); status.tail = tailOf(lines); log(`[publish:${stage}] ${l}`); } };
      child.stdout.on('data', onData); child.stderr.on('data', onData);
      child.on('error', (e) => { lines.push(String(e)); resolve({ code: -1, lines }); });
      child.on('close', (code) => resolve({ code: code ?? -1, lines }));
    });
  }

  /**
   * @param {{ confirmProtected?: string }} req  confirmProtected is the token the UI
   *   was shown for a `blocked` result. It names the exact route set, so a stale
   *   confirmation cannot wave through a publish that touches different live pages.
   */
  async function run(req = {}) {
    if (running) return status;
    running = true;
    status = { ...IDLE, state: 'pulling', stage: 'pulling', startedAt: new Date().toISOString() };

    const fail = (stage, exitCode, lines, extra = {}) => {
      status = { ...status, state: 'failed', stage, exitCode, tail: tailOf(lines), finishedAt: new Date().toISOString(), ...extra };
      running = false; return status;
    };

    const runPhase = async (phase) => {
      status = { ...status, state: 'checking', stage: `checking (${phase})` };
      const results = await runGuards(phase, {
        repoDir,
        log,
        onProgress: ({ running: id }) => { status = { ...status, runningGuard: id, guards: [...status.guards] }; },
      });
      status = { ...status, runningGuard: null, guards: [...status.guards, ...results] };
      return results;
    };

    try {
      /* ---- pulling ---- */
      // A publish ships COMMITTED records only. Uncommitted tracked changes in the clone
      // are the residue of a failed save (the record was written, the commit died); a
      // build would include them with nothing in history to show for it. Refuse, and
      // name the files — the fix is to re-save that client, which overwrites and
      // commits the same file.
      {
        const dirty = git.dirtyTracked();
        if (dirty.length) {
          return fail('pulling', 1, [
            `The working clone has ${dirty.length} uncommitted change(s) — a publish only ships committed records:`,
            ...dirty.map((d) => `  ${d}`),
            'Open that client in the studio and save it again; a successful save commits the file. Nothing has been deployed.',
          ]);
        }
      }
      try { const line = git.sync(); status.tail = [line]; status.commit = git.head(); }
      catch (e) { return fail('pulling', 1, [String(e.stderr || e.message || e)]); }

      /* ---- dependencies (first run on a fresh volume) ---- */
      const appDir = join(repoDir, 'app');
      if (!existsSync(join(repoDir, 'node_modules'))) {
        const r = await runStep('building', 'npm', ['ci', '--no-audit', '--no-fund'], { cwd: repoDir });
        if (r.code !== 0) return fail('building', r.code, ['(root npm ci)', ...r.lines]);
      }
      if (!existsSync(join(appDir, 'node_modules'))) {
        const r = await runStep('building', 'npm', ['ci', '--no-audit', '--no-fund'], { cwd: appDir });
        if (r.code !== 0) return fail('building', r.code, ['(app npm ci)', ...r.lines]);
      }

      /* ---- guards, phase 1 (source only) ---- */
      const pre = await runPhase('pre');
      if (!allPassed(pre)) {
        return fail('checking (pre)', 1, guardTail(pre), { failedGuards: failedIds(pre) });
      }

      /* ---- building ---- */
      const b = await runStep('building', 'npm', ['run', 'build'], { cwd: appDir });
      if (b.code !== 0) return fail('building', b.code, b.lines);

      /* ---- guards, phase 2 (built output) ---- */
      const post = await runPhase('post');
      if (!allPassed(post)) {
        return fail('checking (post)', 1, guardTail(post), { failedGuards: failedIds(post) });
      }

      /* ---- the live-campaign pages ---- */
      status = { ...status, state: 'protected', stage: 'protected', tail: [] };
      const prot = await checkProtectedRoutes({ repoDir, baseUrl, log });
      status = { ...status, protectedRoutes: prot };
      if (prot.error) {
        return fail('protected', 1, [prot.error, 'Refusing to deploy without being able to prove the live campaign pages are unchanged.']);
      }
      const blocking = [...prot.changed.map((c) => c.route), ...prot.unreachable.map((u) => u.route)];
      if (blocking.length) {
        const token = confirmationTokenFor(blocking);
        if (req.confirmProtected !== token) {
          status = {
            ...status,
            state: 'blocked',
            stage: 'protected',
            confirmToken: token,
            finishedAt: new Date().toISOString(),
            tail: [
              `${blocking.length} live campaign page(s) would change or could not be verified:`,
              ...prot.changed.flatMap((c) => [`  CHANGED  ${c.route} — ${c.reason}`, ...c.diff.map((d) => `           ${d}`)]),
              ...prot.unreachable.map((u) => `  UNVERIFIED  ${u.route} — ${u.reason}`),
              'Nothing has been deployed. Confirm explicitly to proceed.',
            ],
          };
          running = false;
          return status;
        }
        log(`[publish] protected routes confirmed by the caller: ${blocking.join(', ')}`);
      }

      /* ---- deploying ---- */
      status = { ...status, state: 'deploying', stage: 'deploying', tail: [] };
      if (!cfToken) return fail('deploying', 2, ['CLOUDFLARE_API_TOKEN is not set — wrangler was not invoked.']);
      if (!cfProject) return fail('deploying', 2, ['CF_PAGES_PROJECT is not set — wrangler was not invoked.']);
      const d = await runStep('deploying', 'npx', ['wrangler', 'pages', 'deploy', 'dist', `--project-name=${cfProject}`, '--commit-dirty=true'], {
        cwd: appDir, env: { CLOUDFLARE_API_TOKEN: cfToken, ...(cfAccountId ? { CLOUDFLARE_ACCOUNT_ID: cfAccountId } : {}) },
      });
      if (d.code !== 0) return fail('deploying', d.code, d.lines);
      const urlLine = d.lines.find((l) => /https:\/\/\S+\.pages\.dev/.test(l));
      const url = urlLine ? urlLine.match(/https:\/\/\S+\.pages\.dev/)[0] : null;
      status = { ...status, state: 'live', stage: 'live', exitCode: 0, tail: tailOf(d.lines), url, finishedAt: new Date().toISOString() };
      return status;
    } finally {
      running = false;
    }
  }

  return {
    run,
    get status() { return status; },
    /** The suite, so the UI can list what a publish will check before starting one. */
    guards: GUARDS.map(({ id, label, phase, why }) => ({ id, label, phase, why })),
  };
}

/** Failure output for the tail: the failing guards' own last lines, attributed. */
function guardTail(results) {
  return results
    .filter((r) => !r.ok)
    .flatMap((r) => [`✗ ${r.label} (exit ${r.exitCode})`, `  ${r.why}`, ...r.tail.map((l) => `  ${l}`)]);
}
