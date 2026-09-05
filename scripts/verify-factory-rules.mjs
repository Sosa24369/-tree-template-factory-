/**
 * Mechanical enforcement of the factory's hard rules. Run in CI and before every phase report.
 *
 *   R1  no client-specific value hardcoded in a template or shared component
 *   R3  nothing secret in the repo
 *   R5  every client record resolves; the R5 fixture stays deliberately empty
 *   FIX 1  no external redirect destination anywhere in app source
 *
 * Usage: node scripts/verify-factory-rules.mjs
 * Exit 1 on any violation.
 */
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, relative } from 'node:path';

const ROOT = new URL('..', import.meta.url).pathname;
const APP_SRC = join(ROOT, 'app', 'src');
const CLIENTS_DIR = join(ROOT, 'clients');

const violations = [];
const pass = [];

/**
 * Comments may legitimately NAME a forbidden host or number in order to document
 * why it is forbidden. Blank out comment bodies (preserving line numbers) so the
 * checks only ever see executable code and real CSS declarations.
 */
function stripComments(text) {
  return text
    .replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, ' '))
    .replace(/(^|[^:])\/\/[^\n]*/g, (m, p1) => p1 + ' '.repeat(m.length - p1.length));
}

function walk(dir, filter = () => true) {
  if (!existsSync(dir)) return [];
  return readdirSync(dir).flatMap((name) => {
    const p = join(dir, name);
    return statSync(p).isDirectory() ? walk(p, filter) : filter(p) ? [p] : [];
  });
}

const clients = readdirSync(CLIENTS_DIR)
  .filter((f) => f.endsWith('.json'))
  .map((f) => ({ file: f, data: JSON.parse(readFileSync(join(CLIENTS_DIR, f), 'utf8')) }));

// Source files subject to R1. Two exemptions:
//  - copy.defaults.ts: geo-bound marketing copy legitimately lives there as an
//    overridable per-client default.
//  - src/dashboard/*: the LOCAL, DEV-ONLY admin tool. It never ships to a client
//    page (it is not a template or shared component), and it legitimately holds
//    client-shaped placeholders and a guard against the leaked redirect domain —
//    the same way this script and schema/resolve.ts name that domain to guard it.
const sourceFiles = walk(
  APP_SRC,
  (p) => /\.(tsx?|css)$/.test(p) && !/copy\.defaults\.ts$/.test(p) && !/\/dashboard\//.test(p),
);

/* ---------------- R1: no hardcoded client values ---------------- */
{
  const needles = [];
  for (const { data } of clients) {
    if (data.name) needles.push({ what: `client name "${data.name}"`, re: new RegExp(escape(data.name), 'i') });
    if (data.phone?.e164) {
      const digits = data.phone.e164.replace(/\D/g, '').slice(-10);
      needles.push({ what: `phone ${data.phone.e164}`, re: new RegExp(digits.replace(/(\d{3})(\d{3})(\d{4})/, '\\(?$1\\)?[-. ]?$2[-. ]?$3')) });
    }
    for (const city of data.serviceAreaList ?? []) {
      if (city.length > 5) needles.push({ what: `service area "${city}"`, re: new RegExp(`\\b${escape(city)}\\b`) });
    }
    for (const url of [data.consent?.privacyPolicyUrl, data.consent?.termsOfServiceUrl]) {
      if (url) needles.push({ what: `legal URL ${url}`, re: new RegExp(escape(url)) });
    }
    if (data.crm?.ghlLocationId) needles.push({ what: `GHL location ${data.crm.ghlLocationId}`, re: new RegExp(escape(data.crm.ghlLocationId)) });
    if (data.tracking?.gtmContainerId) needles.push({ what: `GTM ${data.tracking.gtmContainerId}`, re: new RegExp(escape(data.tracking.gtmContainerId)) });
  }

  let hits = 0;
  for (const file of sourceFiles) {
    const lines = stripComments(readFileSync(file, "utf8")).split("\n");
    lines.forEach((line, i) => {
      if (/^\s*(\/\/|\*|\/\*)/.test(line)) return; // comments may name things for explanation
      for (const n of needles) {
        if (n.re.test(line)) {
          violations.push(`R1  ${relative(ROOT, file)}:${i + 1}  hardcoded ${n.what}\n      ${line.trim().slice(0, 120)}`);
          hits++;
        }
      }
    });
  }
  if (!hits) pass.push(`R1  no client-specific value hardcoded across ${sourceFiles.length} source files (${needles.length} needles from ${clients.length} client records)`);
}

/* ---------------- Assets must be self-hosted (decision 5) ---------------- */
{
  const cdnRe = /(images\.leadconnectorhq\.com|assets\.cdn\.filesafe\.space|msgsndr)/;
  let hits = 0;
  for (const file of sourceFiles) {
    stripComments(readFileSync(file, "utf8")).split("\n").forEach((line, i) => {
      if (cdnRe.test(line) && !/^\s*(\/\/|\*|\/\*)/.test(line)) {
        violations.push(`ASSETS  ${relative(ROOT, file)}:${i + 1}  references a GHL CDN host instead of a self-hosted /assets path`);
        hits++;
      }
    });
  }
  if (!hits) pass.push('ASSETS  no GHL CDN references in app source; all assets self-hosted');
}

/* ---------------- FIX 1: no external redirect in app source ---------------- */
{
  let hits = 0;
  for (const file of sourceFiles) {
    stripComments(readFileSync(file, "utf8")).split("\n").forEach((line, i) => {
      // A comment naming the domain is documentation of the guard, not a redirect.
      // Only flag it in executable code.
      const isComment = /^\s*(\/\/|\*|\/\*)/.test(line);
      if (/titantreeservicetx\.com/.test(line) && !isComment) {
        violations.push(`FIX1  ${relative(ROOT, file)}:${i + 1}  the leaked external redirect domain appears in executable app source\n      ${line.trim().slice(0, 120)}`);
        hits++;
      }
    });
  }
  if (!hits) pass.push('FIX1  titantreeservicetx.com appears in no template or component');
}

/* ---------------- R3: nothing secret committed ---------------- */
{
  const secretRe = /(pit-[a-z0-9-]{20,}|Bearer\s+ey[A-Za-z0-9._-]{20,}|["'](?:sk|api|token)[_-]?(?:key|secret)?["']\s*[:=]\s*["'][A-Za-z0-9_-]{24,}["'])/i;
  const scan = walk(join(ROOT, 'app', 'src'))
    .concat(walk(CLIENTS_DIR))
    .concat(walk(join(ROOT, 'scripts')))
    .concat(walk(join(ROOT, 'app', 'functions'))) // the lead Function must be secret-free too
    .concat(walk(join(ROOT, 'server'), (p) => !/node_modules/.test(p))) // the editor service too
    .concat([join(ROOT, 'app', 'dashboard-core.mjs'), join(ROOT, 'app', 'dashboard-server.mjs')].filter(existsSync));
  let hits = 0;
  for (const file of scan) {
    const text = readFileSync(file, 'utf8');
    if (secretRe.test(text)) { violations.push(`R3  ${relative(ROOT, file)}  looks like it contains a credential`); hits++; }
  }
  if (!hits) pass.push(`R3  no credential-shaped strings in ${scan.length} scanned files`);
}

/* ---------------- R5 fixture integrity ---------------- */
{
  const blank = clients.find((c) => c.file === 'blank-co.json');
  if (!blank) {
    violations.push('R5  clients/blank-co.json is missing — the missing-data fixture must exist');
  } else {
    const d = blank.data;
    const problems = [];
    if (d.brand?.logoUrl !== null) problems.push('brand.logoUrl should be null');
    if (Object.keys(d.photos ?? {}).length) problems.push('photos should be empty');
    if ((d.reviews ?? []).length) problems.push('reviews should be empty');
    if ((d.serviceAreaList ?? []).length) problems.push('serviceAreaList should be empty');
    if (d.leadDestination?.isExternalAllowed !== false) problems.push('isExternalAllowed must stay false so the external-redirect guard is exercised');
    if (problems.length) violations.push(`R5  clients/blank-co.json has been filled in and no longer tests degradation: ${problems.join('; ')}`);
    else pass.push('R5  blank-co fixture intact (no logo, no photos, no reviews, no areas, external redirect refused)');
  }
}

/* ---------------- CRM/tracking identifiers are never shared ---------------- *
 * Two clients sharing a GHL location id means one client's leads land in the other's
 * sub-account. Two sharing a GTM container means one client's conversions are counted
 * in the other's ad account. Neither identifier ever reaches a built page — the
 * location id is read server-side only — so R4, which greps built HTML, is
 * structurally unable to see this. It is caught here, in the records.
 *
 * The way it actually happens is not malice: it is duplicating an existing client
 * record to start a new one. The studio's "new client" flow used to do exactly that.
 * ------------------------------------------------------------------ */
{
  const SHARED = [
    { field: 'crm.ghlLocationId', get: (d) => d.crm?.ghlLocationId, what: "one client's leads would land in another's GHL sub-account" },
    { field: 'tracking.gtmContainerId', get: (d) => d.tracking?.gtmContainerId, what: "one client's conversions would be counted in another's ad account" },
  ];
  let hits = 0;
  for (const { field, get, what } of SHARED) {
    const byValue = new Map();
    for (const { file, data } of clients) {
      const value = (get(data) ?? '').toString().trim();
      if (!value) continue; // blank is the correct state for a demo or an unwired client
      if (!byValue.has(value)) byValue.set(value, []);
      byValue.get(value).push(file);
    }
    for (const [value, files] of byValue) {
      if (files.length > 1) {
        violations.push(`CRM  ${field} "${value}" is shared by ${files.join(' and ')} — ${what}`);
        hits++;
      }
    }
  }
  if (!hits) pass.push(`CRM  no two client records share a GHL location id or a GTM container`);
}

/* ---------------- client records parse and carry required fields ---------------- */
{
  for (const { file, data } of clients) {
    if (file === 'blank-co.json') continue;
    const missing = [];
    if (!data.phone?.e164) missing.push('phone.e164');
    if (!/^\+\d{10,15}$/.test(data.phone?.e164 ?? '')) missing.push('phone.e164 not E.164');
    if (!data.leadDestination?.thankYouUrl) missing.push('leadDestination.thankYouUrl');
    if (!data.consent?.smsCopy) missing.push('consent.smsCopy');
    if (missing.length) violations.push(`SCHEMA  clients/${file}  ${missing.join(', ')}`);
  }
  if (!violations.some((v) => v.startsWith('SCHEMA'))) pass.push(`SCHEMA  ${clients.length - 1} live client records carry phone, destination and consent`);
}

function escape(s) { return String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }

for (const p of pass) console.log(`PASS  ${p}`);
if (violations.length) {
  console.log('');
  for (const v of violations) console.log(`FAIL  ${v}`);
  console.log(`\n${violations.length} violation(s).`);
  process.exit(1);
}
console.log(`\nAll factory rules pass.`);
