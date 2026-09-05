/**
 * THE GUARD SUITE, as the publish gate.
 *
 * Every rule this factory has is already a script in /scripts (plus `tsc -b`). Until
 * now they were run by hand before a deploy, which means a deploy from the studio —
 * from a phone, from another machine, by someone who has not read the build log —
 * could ship a cross-client leak. This module runs all of them in the working clone
 * and reports each one individually, so `publish` can refuse and say WHICH guard
 * failed rather than "something went wrong".
 *
 * Two phases, because half the guards read the BUILT output:
 *
 *   pre   runs before `npm run build`  — source-only rules. A failure here saves the
 *         two minutes a build costs.
 *   post  runs after `npm run build`   — everything that reads app/dist.
 *
 * Nothing here is advisory. `allPassed` is the only thing publish.mjs consults, and a
 * guard that errors (missing script, crashed node) counts as FAILED, never as passed —
 * a guard that cannot run has not cleared anything.
 */

import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { join } from 'node:path';

/**
 * The suite. `label` is what the studio shows; `why` is what it means when it fails,
 * written for someone who is about to decide whether to override it (they cannot).
 */
export const GUARDS = [
  {
    id: 'tsc',
    label: 'TypeScript',
    phase: 'pre',
    why: 'The app does not type-check. The build would fail anyway.',
    cwd: 'app',
    cmd: 'npx',
    args: ['tsc', '-b'],
  },
  {
    id: 'factory-rules',
    label: 'Factory rules (R1 · R3 · R5 · schema)',
    phase: 'pre',
    why: 'A client-specific value is hardcoded in a template, a credential-shaped string is committed, the R5 blank-co fixture has been filled in, or a client record is missing a required field.',
    cmd: 'node',
    args: ['scripts/verify-factory-rules.mjs'],
  },
  {
    id: 'layout-lock',
    label: 'Layout lock (R2 — controls)',
    phase: 'pre',
    why: 'A control (-a) template would render a client-supplied layout, which invalidates the A/B test.',
    cmd: 'node',
    args: ['scripts/verify-layout-lock.mjs'],
  },
  {
    id: 'r4-leakage',
    label: 'R4 cross-client leakage',
    phase: 'post',
    why: "One client's slug, assets, name, phone, address, GTM container or demo copy appears on another client's page. This is the one that ships a wrong phone number to a paying advertiser.",
    cmd: 'node',
    args: ['scripts/verify-r4-leakage.mjs'],
  },
  {
    id: 'copy-parity',
    label: 'a → c copy parity',
    phase: 'post',
    why: 'A -c hybrid no longer renders its control\'s exact copy, so the A/B test is measuring copy as well as design.',
    cmd: 'node',
    args: ['scripts/verify-copy-parity.mjs'],
  },
  {
    id: 'demo-isolation',
    label: 'Demo isolation (D1–D10)',
    phase: 'post',
    why: 'The demo account is indexable, reachable at a live address, wired to a CRM, or painting a paying client\'s photography.',
    cmd: 'node',
    args: ['scripts/verify-demo-isolation.mjs'],
  },
  {
    id: 'tracking',
    label: 'Conversion tracking',
    phase: 'post',
    why: 'A page carries the wrong GTM container, or the conversion event no longer fires only on genuine submit success.',
    cmd: 'node',
    args: ['scripts/verify-tracking.mjs'],
  },
  {
    id: 'lead-function',
    label: 'Lead Function contract',
    phase: 'post',
    why: 'The endpoint between a form and GHL no longer behaves as tested — slug routing, template exclusion, demo refusal or consent handling has regressed.',
    cmd: 'node',
    args: ['scripts/test-lead-function.mjs'],
  },
  {
    id: 'publish-gate',
    label: 'Publish gate self-test',
    phase: 'pre',
    // The gate checking itself is not circular: this exercises the modules with
    // fixtures and a mocked network, and it runs in the `pre` phase, so a broken
    // gate stops the publish before anything is built or compared.
    why: 'The publish gate itself is broken — the guard runner or the live-campaign check no longer behaves as tested. Nothing may deploy while the thing that decides what may deploy is untrustworthy.',
    cmd: 'node',
    args: ['scripts/test-publish-gate.mjs'],
  },
  {
    id: 'faq-a11y',
    label: 'FAQ accessibility',
    phase: 'post',
    why: 'A <summary> ships with no accessible name — a screen-reader user tabs onto a control that announces nothing.',
    cmd: 'node',
    args: ['scripts/verify-faq-a11y.mjs'],
  },
];

const TAIL = 30;

function runOne(guard, repoDir, log) {
  return new Promise((resolve) => {
    const cwd = guard.cwd ? join(repoDir, guard.cwd) : repoDir;
    const started = Date.now();
    if (!existsSync(cwd)) {
      return resolve({ ...summary(guard), ok: false, exitCode: -1, ms: 0, tail: [`${cwd} does not exist`] });
    }
    const env = { ...process.env };
    delete env.INCLUDE_FIXTURES; // a guard must see exactly what deploys
    const child = spawn(guard.cmd, guard.args, { cwd, env, stdio: ['ignore', 'pipe', 'pipe'] });
    const lines = [];
    const onData = (buf) => {
      for (const l of buf.toString().split('\n')) {
        if (!l.trim()) continue;
        lines.push(l);
        log(`[guard:${guard.id}] ${l}`);
      }
    };
    child.stdout.on('data', onData);
    child.stderr.on('data', onData);
    child.on('error', (e) => resolve({ ...summary(guard), ok: false, exitCode: -1, ms: Date.now() - started, tail: [String(e)] }));
    child.on('close', (code) =>
      resolve({
        ...summary(guard),
        ok: code === 0,
        exitCode: code ?? -1,
        ms: Date.now() - started,
        // On success keep only the last couple of lines (the PASS summary); on
        // failure keep enough to act on.
        tail: code === 0 ? lines.slice(-2) : lines.slice(-TAIL),
      })
    );
  });
}

const summary = (g) => ({ id: g.id, label: g.label, phase: g.phase, why: g.why });

/**
 * Run one phase. Every guard runs even after one fails — the point is to show the
 * whole picture, not to stop at the first red light.
 */
export async function runGuards(phase, { repoDir, log = console.log, onProgress = () => {} }) {
  const results = [];
  for (const guard of GUARDS.filter((g) => g.phase === phase)) {
    onProgress({ running: guard.id, done: results });
    results.push(await runOne(guard, repoDir, log));
  }
  return results;
}

/** True only if every guard in the list actually exited 0. */
export const allPassed = (results) => results.length > 0 && results.every((r) => r.ok);

/** The ids that failed, for a one-line refusal message. */
export const failedIds = (results) => results.filter((r) => !r.ok).map((r) => r.id);
