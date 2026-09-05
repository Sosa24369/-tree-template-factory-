/**
 * THE LIVE-CAMPAIGN GUARD.
 *
 * Four pages carry ad spend. The studio can edit any client record, and a record edit
 * is one shared build away from changing one of those four — a copy override on the
 * wrong template, a photo swapped on the wrong client, a colour change that reaches
 * further than expected. A publish is a direct upload: there is no review step between
 * the button and the live page.
 *
 * So: after the build and before wrangler is invoked, every route in
 * /protected-routes.json is compared — the HTML that is ABOUT to be uploaded against
 * the HTML that is live right now. If any of them differ, the publish stops with
 * `state: 'blocked'` and lists them. It only proceeds when the caller repeats the
 * request with an explicit confirmation naming that exact set of routes.
 *
 * Three deliberate choices:
 *
 *  1. It compares against the LIVE page, fetched over HTTPS — not against the previous
 *     build, and not against git. Live is the only thing that is actually true: it
 *     catches a change that arrived through a commit nobody in this session made.
 *
 *  2. A route that cannot be fetched BLOCKS. An unreachable page is not a page proven
 *     unchanged, and "the network was flaky" is not a reason to overwrite an ad
 *     destination.
 *
 *  3. The content-hashed bundle filenames are normalised away. They change on any
 *     shared-code edit whatsoever, so counting them would make every publish blocked
 *     and the confirmation would become a reflex click — which is the same as having
 *     no confirmation at all.
 */

import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

/** Read the route list. A missing or malformed file means NO routes are protected,
 *  which is a loud condition, so it is reported rather than silently defaulted. */
export function loadProtectedRoutes(repoDir) {
  const file = join(repoDir, 'protected-routes.json');
  if (!existsSync(file)) return { routes: [], error: 'protected-routes.json is missing — no page is protected' };
  try {
    const data = JSON.parse(readFileSync(file, 'utf8'));
    const routes = (data.routes ?? []).filter((r) => typeof r === 'string' && r.startsWith('/'));
    if (!routes.length) return { routes: [], error: 'protected-routes.json lists no routes' };
    return { routes, error: null };
  } catch (e) {
    return { routes: [], error: `protected-routes.json is not valid JSON: ${e.message}` };
  }
}

/** Bundle filenames are content-hashed; a hash change is not a content change. */
const normalise = (html) => html.replace(/index-[A-Za-z0-9_-]+\.(js|css)/g, 'index-HASH.$1');

/** Where the built HTML for a route lives inside dist. */
const distFileFor = (repoDir, route) => join(repoDir, 'app', 'dist', route.replace(/^\//, ''), 'index.html');

/**
 * A short, human summary of what changed — enough to decide, not a full diff.
 *
 * CHARACTER-level, not line-level. A prerendered page is one enormous line: the
 * whole <body> is a single string, so a line diff prints two 160-character prefixes
 * that are identical and hides the actual change ten thousand characters in. That is
 * worse than useless on the one screen where someone is deciding whether to overwrite
 * a page carrying ad spend.
 *
 * So: trim the common prefix and suffix, and show the middle that differs, with a
 * little context on each side. Tags are stripped from the excerpt because what a
 * person needs to see is the words — a changed phone number, a changed headline.
 */
function describeDiff(liveHtml, nextHtml) {
  const a = normalise(liveHtml);
  const b = normalise(nextHtml);
  if (a === b) return ['(no textual difference)'];

  let p = 0;
  const maxP = Math.min(a.length, b.length);
  while (p < maxP && a[p] === b[p]) p += 1;

  let s = 0;
  while (s < maxP - p && a[a.length - 1 - s] === b[b.length - 1 - s]) s += 1;

  const CONTEXT = 70;
  const EXCERPT = 260;
  const readable = (str) => str.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();

  const before = readable(a.slice(Math.max(0, p - CONTEXT), p));
  const after = readable(a.slice(a.length - s, Math.min(a.length, a.length - s + CONTEXT)));
  const liveMiddle = readable(a.slice(p, a.length - s));
  const nextMiddle = readable(b.slice(p, b.length - s));

  const clip = (str) => (str.length > EXCERPT ? `${str.slice(0, EXCERPT)}… (+${str.length - EXCERPT} more chars)` : str || '(nothing)');

  return [
    `context: …${before}`,
    `- live: ${clip(liveMiddle)}`,
    `+ new:  ${clip(nextMiddle)}`,
    `context: ${after}…`,
    `(${Math.abs(b.length - a.length)} char length change; first difference at offset ${p} of ${a.length})`,
  ];
}

/**
 * Compare every protected route. Returns
 *   { checked, changed: [{route, reason, diff}], unreachable: [...], error }
 * `changed` non-empty means publish must stop unless confirmed.
 */
export async function checkProtectedRoutes({ repoDir, baseUrl, fetchImpl = fetch, timeoutMs = 15000, log = () => {} }) {
  const { routes, error } = loadProtectedRoutes(repoDir);
  if (error) return { checked: 0, changed: [], unreachable: [], error };
  if (!baseUrl) {
    return {
      checked: 0,
      changed: [],
      unreachable: [],
      error: 'PUBLIC_BASE_URL is not set, so the live pages cannot be compared. Set it to the deployed origin (e.g. https://tree-template-factory.pages.dev).',
    };
  }

  const changed = [];
  const unreachable = [];

  for (const route of routes) {
    const file = distFileFor(repoDir, route);
    if (!existsSync(file)) {
      // The route is no longer being generated at all. That is the most dangerous
      // possible change to an ad destination, so it blocks like any other.
      changed.push({ route, reason: 'this route is NOT in the new build — the ad destination would 404', diff: [] });
      continue;
    }
    const next = readFileSync(file, 'utf8');

    let liveHtml = null;
    const ctrl = new AbortController();
    // Cleared in `finally`, not after the await: if fetch THROWS, a timer left
    // armed keeps the event loop alive until it fires. In the server that is
    // invisible; in the publish-gate self-test it was 15 s of dead time on every
    // publish, because one case deliberately makes fetch throw.
    const timer = setTimeout(() => ctrl.abort(), timeoutMs);
    try {
      const res = await fetchImpl(`${baseUrl.replace(/\/$/, '')}${route}/`, {
        signal: ctrl.signal,
        headers: { 'cache-control': 'no-cache' },
      });
      if (!res.ok) {
        unreachable.push({ route, reason: `live page returned HTTP ${res.status}` });
        continue;
      }
      liveHtml = await res.text();
    } catch (e) {
      unreachable.push({ route, reason: `could not fetch the live page: ${String(e?.message || e)}` });
      continue;
    } finally {
      clearTimeout(timer);
    }

    if (normalise(liveHtml) === normalise(next)) {
      log(`[protected] ${route} unchanged`);
      continue;
    }
    changed.push({ route, reason: 'the built page differs from the live page', diff: describeDiff(liveHtml, next) });
  }

  return { checked: routes.length, changed, unreachable, error: null };
}

/**
 * The confirmation token. The caller must send back the EXACT set of routes it was
 * shown, so a confirmation cannot be replayed against a later publish that touches a
 * different (or larger) set of live pages.
 */
export function confirmationTokenFor(routes) {
  return [...routes].sort().join('|');
}
