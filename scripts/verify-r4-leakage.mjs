/**
 * R4 — cross-client leakage check over the BUILT output (app/dist).
 *
 * History: R4 used to be an ad-hoc grep for slugs/asset paths, which is why a
 * worse leak survived every pass — the extracted controls hardcoded their source
 * client's DISPLAY NAME, street address and geography in copy.defaults.ts, so
 * Texas Tree Tops' live trimming-a page said "Choose J Valdez" (found 2026-08-12,
 * Design Elevation session). This script makes the check permanent and widens it
 * to display names, phone digits and any per-client street address.
 *
 * For every client X and every built page that is not X's own:
 *   - X's slug must not appear
 *   - X's asset folder (/assets/<x-slug>/) must not appear
 *   - X's display name (and its distinctive stem, e.g. "J Valdez" for
 *     "J Valdez Tree Services") must not appear
 *   - X's phone digits must not appear in any format
 *   - X's footer.address copyOverride (if any) must not appear
 * And the NEUTRAL pages (dist/index.html, dist/404.html) must contain none of
 * ANY client's needles.
 *
 * THE DEMO ACCOUNT counts in both directions (added with the demo build).
 * A page's owner is now read from /p/<slug>/ AND /demo/<slug>/, so:
 *   - a real client's name, phone, slug or assets on a demo page fails, and
 *   - the demo's name, phone, slug, assets or COPY on a real client's page fails.
 * The copy half is the one the generic needles would miss: the demo carries
 * bespoke copyOverrides (a rewritten offer, no rating claim, no dollar figure on
 * the insurance line), and one of those strings turning up on a paying client's
 * page would mean the demo record had been used as a template for a real one.
 * Only overrides of >= MIN_COPY_NEEDLE characters are used, because a short
 * string ("Free", "Insured") is a word, not a fingerprint.
 *
 * Exit 1 on any hit. Run after every build, before every commit (factory rule).
 */
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, relative } from 'node:path';

const ROOT = new URL('..', import.meta.url).pathname;
const DIST = join(ROOT, 'app/dist');
const CLIENTS_DIR = join(ROOT, 'clients');

if (!existsSync(DIST)) {
  console.error('R4: app/dist does not exist — build first (cd app && npm run build)');
  process.exit(1);
}

const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** Below this length a copy string is a common phrase, not an identifying one. */
const MIN_COPY_NEEDLE = 24;

/** Trailing generic words that don't identify a business on their own. */
const GENERIC_TAIL = new Set(['llc', 'llc.', 'co', 'co.', 'inc', 'inc.', 'company', 'services', 'service', 'tree']);

function distinctiveStem(name) {
  const words = name.trim().split(/\s+/);
  while (words.length > 1 && GENERIC_TAIL.has(words[words.length - 1].toLowerCase())) words.pop();
  const stem = words.join(' ');
  // A one-word or very short stem is too generic to grep for safely.
  return stem !== name && (words.length >= 2 || stem.length >= 6) ? stem : null;
}

const clients = readdirSync(CLIENTS_DIR)
  .filter((f) => f.endsWith('.json'))
  .map((f) => JSON.parse(readFileSync(join(CLIENTS_DIR, f), 'utf8')));

const needlesBySlug = new Map();
for (const c of clients) {
  const needles = [];
  needles.push({ what: `slug "${c.slug}"`, re: new RegExp(`\\b${escapeRe(c.slug)}\\b`, 'i') });
  needles.push({ what: `asset folder /assets/${c.slug}/`, re: new RegExp(escapeRe(`/assets/${c.slug}/`), 'i') });
  if (c.name) {
    needles.push({ what: `client name "${c.name}"`, re: new RegExp(escapeRe(c.name), 'i') });
    const stem = distinctiveStem(c.name);
    if (stem) needles.push({ what: `client name stem "${stem}"`, re: new RegExp(escapeRe(stem), 'i') });
  }
  if (c.phone?.e164) {
    const digits = c.phone.e164.replace(/\D/g, '').slice(-10);
    needles.push({
      what: `phone ${c.phone.e164}`,
      re: new RegExp(digits.replace(/(\d{3})(\d{3})(\d{4})/, '\\(?$1\\)?[-. ]?$2[-. ]?$3')),
    });
  }
  for (const perTemplate of Object.values(c.copyOverrides ?? {})) {
    const addr = perTemplate?.['footer.address'];
    if (addr && addr.trim()) needles.push({ what: `street address "${addr}"`, re: new RegExp(escapeRe(addr.trim()), 'i') });
  }
  if (c.isDemo) {
    // Demo COPY is a needle in both directions. These strings exist only in the
    // demo record, so any of them on a /p/ page means demo content reached a
    // paying client (and the reverse is already covered by the needles above).
    const seen = new Set();
    for (const perTemplate of Object.values(c.copyOverrides ?? {})) {
      for (const [key, value] of Object.entries(perTemplate ?? {})) {
        const text = String(value ?? '').trim();
        if (text.length < MIN_COPY_NEEDLE || seen.has(text)) continue;
        seen.add(text);
        needles.push({ what: `demo copy ${key} "${text.slice(0, 48)}…"`, re: new RegExp(escapeRe(text), 'i') });
      }
    }
  }
  if (c.tracking?.gtmContainerId) {
    // A page carrying another client's GTM container would fire conversions
    // into the wrong ad account — same severity as a wrong phone number.
    needles.push({
      what: `GTM container ${c.tracking.gtmContainerId}`,
      re: new RegExp(escapeRe(c.tracking.gtmContainerId)),
    });
  }
  needlesBySlug.set(c.slug, needles);
}

function* walk(dir) {
  for (const e of readdirSync(dir)) {
    const p = join(dir, e);
    if (statSync(p).isDirectory()) yield* walk(p);
    else if (p.endsWith('.html')) yield p;
  }
}

const violations = [];
const livePages = new Set();
const demoPages = new Set();
let pagesChecked = 0;

for (const file of walk(DIST)) {
  const rel = relative(DIST, file);
  const html = readFileSync(file, 'utf8');
  // /p/<slug>/… is a live client page, /demo/<slug>/… is a demo page. Both have
  // an owner; anything else (index.html, 404.html) is neutral and may name nobody.
  const m = rel.match(/^(p|demo)\/([^/]+)\//);
  const ownerSlug = m ? m[2] : null; // null → a neutral page: no client may appear at all
  if (m) (m[1] === 'demo' ? demoPages : livePages).add(rel);
  pagesChecked++;

  for (const [slug, needles] of needlesBySlug) {
    if (ownerSlug && slug === ownerSlug) continue;
    for (const n of needles) {
      if (n.re.test(html)) {
        const where = ownerSlug ? `page of "${ownerSlug}"` : 'NEUTRAL page';
        violations.push(`R4  ${rel} (${where}) contains ${where === 'NEUTRAL page' ? '' : 'OTHER client '}${n.what}`);
      }
    }
  }
}

if (violations.length) {
  console.error(`R4 FAIL — ${violations.length} cross-client leak(s) across ${pagesChecked} pages:\n`);
  for (const v of violations) console.error('  ' + v);
  process.exit(1);
}
const demoSlugs = clients.filter((c) => c.isDemo).map((c) => c.slug);
const demoNeedles = demoSlugs.reduce((n, slug) => n + (needlesBySlug.get(slug)?.length ?? 0), 0);
console.log(
  `R4 PASS — ${pagesChecked} built pages (${livePages.size} live /p/, ${demoPages.size} demo /demo/, ` +
    `${pagesChecked - livePages.size - demoPages.size} neutral): no client's slug, assets, display name, ` +
    `phone, address, GTM container or demo copy on another client's (or a neutral) page.`
);
if (demoSlugs.length) {
  console.log(`     demo account(s) checked in both directions: ${demoSlugs.join(', ')} (${demoNeedles} needles)`);
}
