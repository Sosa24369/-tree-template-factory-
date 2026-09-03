/**
 * Publish — a state machine the UI displays live.
 *
 *   idle → pulling → building → deploying → live | failed
 *
 * building: `npm run build` in REPO_DIR/app with INCLUDE_FIXTURES unset (fixtures never
 *           ship). Installs dependencies first if node_modules is missing (first run on
 *           a fresh volume).
 * deploying: `wrangler pages deploy dist --project-name=$CF_PAGES_PROJECT`.
 *
 * Any stage failure → { state:'failed', stage, exitCode, tail } where tail is the last
 * 40 lines of output, shown verbatim. A missing CLOUDFLARE_API_TOKEN fails at
 * `deploying` BEFORE wrangler is invoked. `live` is set only when wrangler exited 0.
 * One publish at a time; a second request while one runs returns the current state.
 */

import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { join } from 'node:path';

export function makePublisher({ repoDir, git, cfToken, cfAccountId, cfProject, log = console.log }) {
  let status = { state: 'idle', stage: null, startedAt: null, finishedAt: null, exitCode: null, tail: [], url: null, commit: null };
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

  async function run() {
    if (running) return status;
    running = true;
    status = { state: 'pulling', stage: 'pulling', startedAt: new Date().toISOString(), finishedAt: null, exitCode: null, tail: [], url: null, commit: null };
    const fail = (stage, exitCode, lines) => {
      status = { ...status, state: 'failed', stage, exitCode, tail: tailOf(lines), finishedAt: new Date().toISOString() };
      running = false; return status;
    };
    try {
      // pulling
      try { const line = git.sync(); status.tail = [line]; status.commit = git.head(); }
      catch (e) { return fail('pulling', 1, [String(e.stderr || e.message || e)]); }

      // building
      const appDir = join(repoDir, 'app');
      if (!existsSync(join(repoDir, 'node_modules')) ) {
        const r = await runStep('building', 'npm', ['ci', '--no-audit', '--no-fund'], { cwd: repoDir });
        if (r.code !== 0) return fail('building', r.code, ['(root npm ci)', ...r.lines]);
      }
      if (!existsSync(join(appDir, 'node_modules'))) {
        const r = await runStep('building', 'npm', ['ci', '--no-audit', '--no-fund'], { cwd: appDir });
        if (r.code !== 0) return fail('building', r.code, ['(app npm ci)', ...r.lines]);
      }
      const b = await runStep('building', 'npm', ['run', 'build'], { cwd: appDir });
      if (b.code !== 0) return fail('building', b.code, b.lines);

      // deploying
      status = { ...status, state: 'deploying', stage: 'deploying' };
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

  return { run, get status() { return status; } };
}
