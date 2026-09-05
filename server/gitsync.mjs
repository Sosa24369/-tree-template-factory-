/**
 * Git-backed persistence — git stays the source of truth.
 *
 * The service holds a working clone at REPO_DIR (a Railway volume). On boot: clone if
 * absent, otherwise `git pull --ff-only`. Saves commit through dashboard-core and then
 * push here. A failed push leaves the commit local and reports 502 push_failed; the UI
 * shows "Saved locally, not pushed." — never a silent success.
 *
 * GITHUB_TOKEN never touches disk in plain form: it is injected into the remote URL
 * only for the fetch/push command's lifetime via an -c http.extraheader, so
 * `git remote -v` in the clone shows a clean URL.
 */

import { existsSync, mkdirSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { dirname } from 'node:path';

export function makeGit({ repoDir, repo, token, branch = 'main', identity = { name: 'Template Studio', email: 'studio@leedscompany.local' } }) {
  const authHeader = token ? `AUTHORIZATION: basic ${Buffer.from(`x-access-token:${token}`).toString('base64')}` : null;
  // One identity, shared with dashboard-core's commits (server/index.mjs passes the
  // same object to both), so pull/push and commit never disagree about who the studio is.
  const base = ['-c', `user.name=${identity.name}`, '-c', `user.email=${identity.email}`];
  const authed = authHeader ? ['-c', `http.extraheader=${authHeader}`] : [];
  const run = (args, opts = {}) => execFileSync('git', [...base, ...args], { cwd: repoDir, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], ...opts });
  const url = `https://github.com/${repo}.git`;

  return {
    /** Clone or fast-forward. Returns a short status line for the boot log. */
    sync() {
      if (!existsSync(repoDir)) {
        mkdirSync(dirname(repoDir), { recursive: true });
        execFileSync('git', [...base, ...authed, 'clone', '--branch', branch, '--single-branch', url, repoDir], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
        return `cloned ${repo}@${branch} into ${repoDir}`;
      }
      run([...authed, 'pull', '--ff-only', 'origin', branch]);
      return `pulled ${repo}@${branch} (ff-only)`;
    },
    head() { return run(['rev-parse', '--short', 'HEAD']).trim(); },
    /** Push HEAD. Throws with stderr on failure so the caller can report 502. */
    push() {
      try {
        run([...authed, 'push', 'origin', `HEAD:${branch}`]);
      } catch (e) {
        const detail = (e.stderr || e.stdout || String(e)).toString().trim().split('\n').slice(-6).join('\n');
        const err = new Error('push_failed'); err.detail = detail; throw err;
      }
    },
    dirty() { return run(['status', '--porcelain']).trim().length > 0; },
    /**
     * TRACKED files with uncommitted changes — the ones that would change a build.
     * Untracked files are excluded on purpose: a photo uploaded but not yet saved is
     * untracked, referenced by no committed record, and must not block a publish.
     */
    dirtyTracked() {
      return run(['status', '--porcelain', '--untracked-files=no']).split('\n').map((l) => l.trim()).filter(Boolean);
    },
  };
}
