/**
 * THE PUBLISH RECEIPT.
 *
 * "Publish: live" used to link to the deployment root — the deliberately neutral gate
 * page — so a successful publish read as "nothing to see here". What the operator needs
 * after a publish is: which pages changed, each linking to its PRODUCTION address, and
 * the deployment id in case something has to be traced back.
 *
 * Where the "which pages" comes from, and why it is not wrangler's own list:
 * wrangler 4.121.0's `pages deploy` computes the set of files to upload from the API's
 * check-missing response and never prints it — at any log level, only the count
 * ("✨ Success! Uploaded 2 files (210 already uploaded)"). So the receipt names the
 * changed pages the same way the live-campaign gate proves the four ad pages unchanged:
 * every built page is compared against the page that is live right now, before wrangler
 * runs. A page that differs is a page this deployment changes; a page the live site
 * 404s on is new. wrangler's count is shown beside the list, and when the two disagree
 * the receipt says so instead of choosing one.
 *
 * Removed pages (a template switched off for a client) cannot be seen this way — there
 * is no built file to compare. They come from the route list of the LAST successful
 * deploy, kept next to the clone on the volume. The first receipt after this ships has
 * no such list and says nothing about removals rather than guessing.
 */

import { readFileSync, readdirSync, statSync, existsSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { normalise } from './protected.mjs';

/** Every prerendered page in app/dist, as a route. `404.html` is not a page. */
export function listBuiltPages(repoDir) {
  const dist = join(repoDir, 'app', 'dist');
  if (!existsSync(dist)) return [];
  const routes = [];
  const walk = (dir, rel) => {
    for (const name of readdirSync(dir)) {
      const full = join(dir, name);
      if (statSync(full).isDirectory()) walk(full, `${rel}/${name}`);
      else if (name === 'index.html') routes.push(rel || '/');
    }
  };
  walk(dist, '');
  return routes.sort();
}

/**
 * The production address of a route. Demo clients are built at /demo/<slug>/<template>
 * and real ones at /p/<slug>/<template>; the route already carries that prefix, so the
 * mapping is the origin plus the route plus the trailing slash Cloudflare serves it at.
 */
export function productionUrl(baseUrl, route) {
  const origin = String(baseUrl || '').replace(/\/$/, '');
  return route === '/' ? `${origin}/` : `${origin}${route}/`;
}

/** The built HTML for a route. */
const distFileFor = (repoDir, route) => join(repoDir, 'app', 'dist', route === '/' ? '' : route.replace(/^\//, ''), 'index.html');

/**
 * Compare every built page against the live site.
 *   { checked, changed: [{ route, url, reason }], unreachable: [{ route, reason }], error }
 * `reason` is 'changed' or 'new'. An unreachable page is reported, not guessed at, and
 * — unlike the four protected routes — does not stop the publish: the gate is the gate,
 * this is the receipt.
 */
export async function diffPagesAgainstLive({ repoDir, baseUrl, fetchImpl = fetch, concurrency = 8, timeoutMs = 15000, log = () => {} }) {
  if (!baseUrl) return { checked: 0, changed: [], unreachable: [], error: 'PUBLIC_BASE_URL is not set' };
  const routes = listBuiltPages(repoDir);
  const changed = [];
  const unreachable = [];

  const one = async (route) => {
    const next = readFileSync(distFileFor(repoDir, route), 'utf8');
    const url = productionUrl(baseUrl, route);
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), timeoutMs);
    try {
      const res = await fetchImpl(url, { signal: ctrl.signal, headers: { 'cache-control': 'no-cache' } });
      if (res.status === 404) { changed.push({ route, url, reason: 'new' }); return; }
      if (!res.ok) { unreachable.push({ route, reason: `live page returned HTTP ${res.status}` }); return; }
      const live = await res.text();
      if (normalise(live) !== normalise(next)) changed.push({ route, url, reason: 'changed' });
    } catch (e) {
      unreachable.push({ route, reason: `could not fetch the live page: ${String(e?.message || e)}` });
    } finally {
      clearTimeout(timer);
    }
  };

  const queue = [...routes];
  const workers = Array.from({ length: Math.min(concurrency, queue.length) }, async () => {
    while (queue.length) await one(queue.shift());
  });
  await Promise.all(workers);
  changed.sort((a, b) => a.route.localeCompare(b.route));
  unreachable.sort((a, b) => a.route.localeCompare(b.route));
  log(`[receipt] compared ${routes.length} page(s) against ${baseUrl}: ${changed.length} changed, ${unreachable.length} unreachable`);
  return { checked: routes.length, changed, unreachable, error: null };
}

/**
 * What wrangler said. Only the count and the deployment URL are printed; the id is the
 * first label of the hash-specific hostname (`https://6d174f7b.<project>.pages.dev`).
 */
export function parseWranglerOutput(lines) {
  const text = (lines || []).join('\n');
  const up = text.match(/Uploaded (\d+) files?(?: \((\d+) already uploaded\))?/);
  // A deployment id is 8 hex characters; a branch alias (https://main.<project>…) is
  // not, and wrangler can print both. Prefer the id, fall back to whatever it printed.
  const byId = text.match(/https:\/\/([0-9a-f]{8})\.[a-z0-9-]+\.pages\.dev/i);
  const any = text.match(/https:\/\/[a-z0-9-]+\.[a-z0-9-]+\.pages\.dev/i);
  return {
    uploaded: up ? Number(up[1]) : null,
    alreadyUploaded: up && up[2] != null ? Number(up[2]) : up ? 0 : null,
    url: byId ? byId[0] : any ? any[0] : null,
    deploymentId: byId ? byId[1] : null,
  };
}

/* ---- the route list of the last successful deploy, for spotting removals ---- */

const manifestPath = (repoDir) => join(dirname(repoDir), 'studio-last-deploy.json');

export function readLastDeploy(repoDir) {
  const file = manifestPath(repoDir);
  if (!existsSync(file)) return null;
  try { return JSON.parse(readFileSync(file, 'utf8')); } catch { return null; }
}

export function writeLastDeploy(repoDir, { deploymentId, url, routes }) {
  const file = manifestPath(repoDir);
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, JSON.stringify({ deploymentId, url, at: new Date().toISOString(), routes }, null, 2));
}

/**
 * Assemble the receipt the UI renders.
 *   pages     result of diffPagesAgainstLive
 *   wrangler  result of parseWranglerOutput
 *   previous  readLastDeploy() from BEFORE this deploy, or null
 *   routes    listBuiltPages() for this deploy
 */
export function buildReceipt({ pages, wrangler, previous, routes, baseUrl, startedAt, finishedAt }) {
  const removed = previous?.routes
    ? previous.routes.filter((r) => !routes.includes(r)).map((route) => ({ route, url: productionUrl(baseUrl, route) }))
    : [];
  const changed = pages?.changed ?? [];
  const unreachable = pages?.unreachable ?? [];
  const uploaded = wrangler?.uploaded;
  // Every changed page is one uploaded file, so wrangler's count can never be BELOW
  // the number of changed pages. Above it is normal (a new photo's variants, the
  // Functions bundle) — but a count below means the comparison and wrangler disagree
  // about what changed, and the receipt says so rather than picking a side.
  const countDisagrees = uploaded != null && uploaded < changed.length;
  const nothingChanged = changed.length === 0 && removed.length === 0 && (uploaded === 0 || uploaded == null) && unreachable.length === 0;
  const ms = startedAt && finishedAt ? Math.max(0, new Date(finishedAt) - new Date(startedAt)) : null;
  return {
    deploymentId: wrangler?.deploymentId ?? null,
    deploymentUrl: wrangler?.url ?? null,
    uploaded: uploaded ?? null,
    alreadyUploaded: wrangler?.alreadyUploaded ?? null,
    checked: pages?.checked ?? 0,
    changed,
    removed,
    unreachable,
    removalsKnown: Boolean(previous?.routes),
    countDisagrees,
    nothingChanged,
    ms,
  };
}
