/**
 * DEMO ISOLATION — everything that keeps the sales demo from behaving like a
 * paying client, asserted against the built output rather than trusted.
 *
 * The demo account exists to be shown to prospects. That makes it the one client
 * record that is deliberately fake, and the one whose pages must never (a) rank,
 * (b) send a lead anywhere, or (c) be reachable at a live-client address. Each of
 * those is enforced somewhere different — the prerenderer, the headers file, the
 * lead Function's generated registry — so this script checks them together, which
 * is the only place the whole property is visible at once.
 *
 * Checks:
 *   D1  record shape: isDemo, no GHL location, no GTM, no Google Ads call asset,
 *       no reviews, no street address
 *   D2  every demo page is under /demo/<slug>/ and NO demo page is under /p/
 *   D3  no live client has a page under /demo/
 *   D4  every demo page carries <meta name="robots" content="noindex, nofollow">
 *   D5  the built _headers file carries an X-Robots-Tag noindex rule for /demo/*
 *   D6  no sitemap ships; if one ever does, it must not list a demo URL
 *   D7  nothing links into /demo/ from a live or neutral page
 *   D8  no demo page carries a GTM container
 *   D9  the lead Function's generated registry marks the demo slug isDemo
 *   D10 no CSS rule can paint a live client's photography onto a demo page
 *
 * D10 is the one that is not obvious from reading the HTML. removal-a paints five
 * decorative section backgrounds from the CONTROL CLIENT's own photograph files,
 * because the extracted source page paints them there. The stylesheet is shared by
 * every page, so those URLs are reachable from a demo page even though the demo's
 * HTML never names them — exactly the kind of leak R4's HTML grep cannot see. It was
 * found by reading the demo page's network log, not its markup.
 *
 * Each such URL is now the FALLBACK of a `var(--slot, url(...))`, and a client paints
 * its own by setting that custom property inline on the template root
 * (templates/sectionArt.ts). So the check is two-part, and both halves matter:
 *   a) a live client's asset URL that is NOT behind a var() is unconditional — every
 *      page paints it, and nothing can override it. Straight failure.
 *   b) a URL that IS behind `var(--X, …)` is only safe for a demo page that actually
 *      DEFINES --X inline. This reads the built HTML, so it cannot be fooled by a
 *      record that looks right but does not render.
 *
 * Usage: node scripts/verify-demo-isolation.mjs   (run AFTER a build; exit 1 on failure)
 */
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, relative } from 'node:path';

const ROOT = new URL('..', import.meta.url).pathname;
const DIST = join(ROOT, 'app', 'dist');
const CLIENTS_DIR = join(ROOT, 'clients');
const REGISTRY = join(ROOT, 'app', 'functions', 'api', 'client-crm.generated.json');

if (!existsSync(DIST)) {
  console.error('demo isolation: app/dist does not exist — build first (cd app && npm run build)');
  process.exit(1);
}

const violations = [];
const pass = [];

const clients = readdirSync(CLIENTS_DIR)
  .filter((f) => f.endsWith('.json'))
  .map((f) => ({ file: f, data: JSON.parse(readFileSync(join(CLIENTS_DIR, f), 'utf8')) }));

const demoSlugs = new Set(clients.filter((c) => c.data.isDemo === true).map((c) => c.data.slug));
const liveSlugs = new Set(
  clients.filter((c) => c.data.isDemo !== true && c.data.isFixture !== true).map((c) => c.data.slug)
);

/* ---------------- D1 record shape ---------------- */
for (const { file, data } of clients) {
  if (data.isDemo !== true) continue;
  const problems = [];
  if (data.crm?.ghlLocationId) problems.push('crm.ghlLocationId is set — a demo lead must have nowhere to go');
  if (data.tracking?.gtmContainerId) problems.push('tracking.gtmContainerId is set — a demo must not fire conversions');
  if (data.phone?.googleAdsCallAsset) problems.push('phone.googleAdsCallAsset is set — a demo runs no ads');
  if ((data.reviews ?? []).length) problems.push('reviews is non-empty — a demo may not carry reviews');
  for (const [templateId, over] of Object.entries(data.copyOverrides ?? {})) {
    if (over?.['footer.address']?.trim()) problems.push(`copyOverrides.${templateId}['footer.address'] is set — a demo has no address`);
  }
  if (problems.length) violations.push(`D1  clients/${file}  ${problems.join('; ')}`);
}
if (!violations.length) {
  pass.push(
    `D1  ${demoSlugs.size} demo record(s) carry no GHL location, no GTM container, no call asset, no reviews and no address`
  );
}

/* ---------------- walk the built pages ---------------- */
function* walk(dir) {
  for (const e of readdirSync(dir)) {
    const p = join(dir, e);
    if (statSync(p).isDirectory()) yield* walk(p);
    else if (p.endsWith('.html')) yield p;
  }
}

const demoPages = [];
const livePages = [];
const neutralPages = [];
for (const file of walk(DIST)) {
  const rel = relative(DIST, file);
  const m = rel.match(/^(p|demo)\/([^/]+)\//);
  if (!m) neutralPages.push(rel);
  else if (m[1] === 'demo') demoPages.push({ rel, slug: m[2], html: readFileSync(file, 'utf8') });
  else livePages.push({ rel, slug: m[2], html: readFileSync(file, 'utf8') });
}

/* ---------------- D2 / D3 prefix confinement ---------------- */
{
  const demoUnderP = livePages.filter((p) => demoSlugs.has(p.slug));
  const liveUnderDemo = demoPages.filter((p) => liveSlugs.has(p.slug));
  const unknownDemo = demoPages.filter((p) => !demoSlugs.has(p.slug));
  if (demoUnderP.length) violations.push(`D2  ${demoUnderP.length} demo page(s) built under /p/: ${demoUnderP.slice(0, 3).map((p) => p.rel).join(', ')}`);
  else pass.push(`D2  no demo page exists under /p/ (${demoPages.length} demo page(s), all under /demo/)`);
  if (liveUnderDemo.length) violations.push(`D3  ${liveUnderDemo.length} live client page(s) built under /demo/: ${liveUnderDemo.slice(0, 3).map((p) => p.rel).join(', ')}`);
  else if (unknownDemo.length) violations.push(`D3  /demo/ contains page(s) for a slug that is not a demo record: ${unknownDemo.slice(0, 3).map((p) => p.rel).join(', ')}`);
  else pass.push(`D3  no live client page exists under /demo/ (${livePages.length} live page(s), all under /p/)`);
}

/* ---------------- D4 robots meta ---------------- */
{
  const bad = demoPages.filter((p) => !/<meta name="robots" content="noindex, nofollow">/.test(p.html));
  if (bad.length) violations.push(`D4  ${bad.length} demo page(s) missing the noindex, nofollow robots meta: ${bad.slice(0, 3).map((p) => p.rel).join(', ')}`);
  else pass.push(`D4  all ${demoPages.length} demo pages carry <meta name="robots" content="noindex, nofollow">`);
}

/* ---------------- D5 headers rule ---------------- */
{
  const headersFile = join(DIST, '_headers');
  if (!existsSync(headersFile)) {
    violations.push('D5  no _headers file in the build — /demo/* would ship with no X-Robots-Tag');
  } else {
    const lines = readFileSync(headersFile, 'utf8').split('\n').map((l) => l.replace(/#.*$/, ''));
    let inDemoBlock = false;
    let found = null;
    for (const line of lines) {
      if (/^\S/.test(line)) inDemoBlock = /^\/demo\/\*\s*$/.test(line.trim());
      else if (inDemoBlock && /^\s*X-Robots-Tag\s*:/i.test(line)) found = line.trim();
    }
    if (!found) violations.push('D5  _headers has no X-Robots-Tag under a /demo/* rule');
    else if (!/noindex/i.test(found)) violations.push(`D5  the /demo/* X-Robots-Tag does not say noindex: "${found}"`);
    else pass.push(`D5  _headers ships with /demo/* -> ${found}`);
  }
}

/* ---------------- D6 sitemaps ---------------- */
{
  const sitemaps = [];
  const stack = [DIST];
  while (stack.length) {
    const dir = stack.pop();
    for (const e of readdirSync(dir)) {
      const p = join(dir, e);
      if (statSync(p).isDirectory()) stack.push(p);
      else if (/sitemap.*\.(xml|txt)$/i.test(e) || /^robots\.txt$/i.test(e)) sitemaps.push(p);
    }
  }
  if (!sitemaps.length) {
    pass.push('D6  the build ships no sitemap and no robots.txt, so no demo URL can be listed in one');
  } else {
    const listing = sitemaps.filter((p) => /\/demo\//.test(readFileSync(p, 'utf8')));
    if (listing.length) violations.push(`D6  a sitemap lists demo URLs: ${listing.map((p) => relative(DIST, p)).join(', ')}`);
    else pass.push(`D6  ${sitemaps.length} sitemap/robots file(s) present, none listing a /demo/ URL`);
  }
}

/* ---------------- D7 no inbound links ---------------- */
{
  const leaking = [...livePages, ...neutralPages.map((rel) => ({ rel, html: readFileSync(join(DIST, rel), 'utf8') }))].filter(
    (p) => /href="\/demo\//.test(p.html)
  );
  if (leaking.length) violations.push(`D7  ${leaking.length} live/neutral page(s) link into /demo/: ${leaking.slice(0, 3).map((p) => p.rel).join(', ')}`);
  else pass.push(`D7  no live or neutral page links into /demo/ (${livePages.length + neutralPages.length} pages checked)`);
}

/* ---------------- D8 no GTM on demo pages ---------------- */
{
  const tagged = demoPages.filter((p) => /GTM-[A-Z0-9]{4,10}/.test(p.html));
  if (tagged.length) violations.push(`D8  ${tagged.length} demo page(s) carry a GTM container: ${tagged.slice(0, 3).map((p) => p.rel).join(', ')}`);
  else pass.push(`D8  no demo page carries a GTM container`);
}

/* ---------------- D9 lead registry ---------------- */
{
  if (!existsSync(REGISTRY)) {
    violations.push('D9  the generated lead registry is missing — run scripts/generate-lead-registry.mjs');
  } else {
    const reg = JSON.parse(readFileSync(REGISTRY, 'utf8'));
    const wrong = [...demoSlugs].filter((s) => reg.clients?.[s]?.isDemo !== true);
    const overreach = Object.entries(reg.clients ?? {}).filter(([s, c]) => c.isDemo === true && !demoSlugs.has(s));
    if (wrong.length) violations.push(`D9  the lead Function would NOT refuse these demo slugs: ${wrong.join(', ')}`);
    else if (overreach.length) violations.push(`D9  the lead registry marks non-demo slug(s) as demo: ${overreach.map(([s]) => s).join(', ')}`);
    else pass.push(`D9  the lead registry marks exactly the demo slug(s) as isDemo: ${[...demoSlugs].join(', ') || '(none)'}`);
  }
}

/* ---------------- D10 CSS-painted photography ---------------- */
{
  const cssDir = join(DIST, 'assets');
  const cssFiles = existsSync(cssDir) ? readdirSync(cssDir).filter((f) => f.endsWith('.css')) : [];
  const esc = (x) => x.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const liveSlugAlt = [...liveSlugs].map(esc).join('|');
  const liveAssetRe = new RegExp(`/assets/(?:${liveSlugAlt})/`);
  const guardedRe = new RegExp(`var\\(\\s*(--[A-Za-z0-9_-]+)\\s*,\\s*url\\(['"]?/assets/(?:${liveSlugAlt})/`);

  /** Rules that paint a live client's asset: { selector, cssVar|null, classes }. */
  const painting = [];
  for (const file of cssFiles) {
    const css = readFileSync(join(cssDir, file), 'utf8');
    for (const m of css.matchAll(/([^{}@]+)\{([^{}]*)\}/g)) {
      const [, selector, body] = m;
      if (!liveAssetRe.test(body)) continue;
      const guard = body.match(guardedRe);
      painting.push({
        file,
        selector: selector.replace(/\s+/g, ' ').trim(),
        cssVar: guard ? guard[1] : null,
        // Every class the selector mentions; a page carrying any of them is subject
        // to this rule. Coarse on purpose — it over-includes rather than missing one.
        classes: [...selector.matchAll(/\.([A-Za-z0-9_-]+)/g)].map((c) => c[1]),
      });
    }
  }

  const unguarded = painting.filter((r) => !r.cssVar);
  const missing = [];
  for (const rule of painting.filter((r) => r.cssVar)) {
    for (const page of demoPages) {
      // Does this page actually carry the element the rule paints?
      const carries = rule.classes.some((c) => page.html.includes(`class="${c}`) || page.html.includes(` ${c}"`) || page.html.includes(` ${c} `));
      if (!carries) continue;
      if (!page.html.includes(`${rule.cssVar}:`)) missing.push(`${page.rel} carries ${rule.selector} but does not set ${rule.cssVar}`);
    }
  }

  if (!cssFiles.length) {
    violations.push('D10  no CSS found in the build — cannot check what a demo page would paint');
  } else if (unguarded.length) {
    violations.push(
      `D10  ${unguarded.length} CSS rule(s) paint a live client's asset unconditionally (no var() a client can override): ` +
        unguarded.slice(0, 4).map((r) => `${r.file} ${r.selector}`).join(' | ')
    );
  } else if (!painting.length) {
    pass.push("D10  no CSS rule references a live client's asset folder");
  } else if (missing.length) {
    violations.push(`D10  ${missing.length} demo page/slot pair(s) fall back to a live client's photograph: ${missing.slice(0, 4).join('; ')}`);
  } else {
    const vars = new Set(painting.map((r) => r.cssVar));
    const carrying = demoPages.filter((p) => painting.some((r) => r.classes.some((c) => p.html.includes(`class="${c}`)))).length;
    pass.push(
      `D10  ${painting.length} CSS rule(s) fall back to a live client's asset, all behind ${vars.size} overridable slot(s); ` +
        `each of the ${carrying} demo page(s) that carries them overrides every slot inline`
    );
  }
}

for (const p of pass) console.log(`PASS  ${p}`);
if (violations.length) {
  console.log('');
  for (const v of violations) console.log(`FAIL  ${v}`);
  console.log(`\n${violations.length} demo-isolation violation(s).`);
  process.exit(1);
}
console.log('\nDemo isolation holds.');
