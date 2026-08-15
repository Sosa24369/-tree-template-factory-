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
 * For every client X and every built page under /p/<other-client>/:
 *   - X's slug must not appear
 *   - X's asset folder (/assets/<x-slug>/) must not appear
 *   - X's display name (and its distinctive stem, e.g. "J Valdez" for
 *     "J Valdez Tree Services") must not appear
 *   - X's phone digits must not appear in any format
 *   - X's footer.address copyOverride (if any) must not appear
 * And the NEUTRAL pages (dist/index.html, dist/404.html) must contain none of
 * ANY client's needles.
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
let pagesChecked = 0;

for (const file of walk(DIST)) {
  const rel = relative(DIST, file);
  const html = readFileSync(file, 'utf8');
  const m = rel.match(/^p\/([^/]+)\//);
  const ownerSlug = m ? m[1] : null; // null → a neutral page: no client may appear at all
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
console.log(`R4 PASS — ${pagesChecked} built pages: no client's slug, assets, display name, phone, address, or GTM container on another client's (or a neutral) page.`);
