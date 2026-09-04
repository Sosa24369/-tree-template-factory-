/**
 * Static prerender of every client × template page.
 *
 * Runs after `vite build` (client) and `vite build --ssr` (server bundle). For each
 * route it renders the real React tree to HTML, injects it into the built shell, and
 * writes dist/<route>/index.html. The client bundle then hydrates that markup.
 *
 * Two things this buys, both measured in P1 as the actual cause of a 5.2s mobile LCP:
 *   - the hero image is in the HTML, so the browser's preload scanner requests it
 *     immediately instead of after ~90KB of JS parses and executes;
 *   - the page paints without waiting for React at all.
 *
 * It also injects a per-page <title>, meta description and an explicit
 * <link rel="preload"> for that page's LCP image — all of which are client-specific
 * and therefore cannot live in a static index.html.
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';

const APP = new URL('..', import.meta.url).pathname;
const DIST = join(APP, 'dist');
const SSR = join(APP, 'dist-ssr', 'entry-server.js');

if (!existsSync(SSR)) {
  console.error('missing dist-ssr/entry-server.js — run `vite build --ssr src/entry-server.tsx` first');
  process.exit(1);
}

const shell = readFileSync(join(DIST, 'index.html'), 'utf8');
const { render, listClients, TEMPLATE_META } = await import(SSR);

const escapeHtml = (s) =>
  String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

/** The LCP element on every template is the first still in the client's photo set. */
function lcpImage(client) {
  for (const key of ['removal', 'trimming', 'storm', 'generic']) {
    const list = client.photos?.[key];
    const still = list?.find((p) => p.kind !== 'video' && p.src);
    if (still) return still;
  }
  return null;
}

/**
 * Which element is the MOBILE LCP, per template — so exactly one correct preload ships.
 *
 * The owner enlarged the header logo across every template. On templates that render a
 * real above-the-fold photograph on a phone the photo is still the LCP (removal-a's
 * hero plate, trimming-a's hero still); on the text-hero templates (storm's gradient
 * hero, removal-b/trimming-b/agnostic) there is no mobile photo, so the enlarged LOGO
 * is the LCP. Storm additionally has only a desktop-only CSS-background photo, so
 * preloading a photo there would double-download a file the phone never shows.
 *
 * The logo preload is emitted here (lowercase imagesrcset) rather than left to React's
 * SSR float, which serialises a malformed camelCase link under renderToString. It
 * advertises the SAME srcset the <img> carries (client.brand.logoSrcset) so the two
 * stay in exact sync and the browser fetches one small variant.
 */
const PHOTO_LCP_TEMPLATES = new Set(['removal-a', 'trimming-a']);
// Must match the sizes the <HeaderBrand/> lockup passes to its <img> (the header
// logo displays at 64px mobile / 96px desktop since the logo swap of 2026-08-13).
const LOGO_SIZES = '(min-width: 768px) 96px, 64px';

function logoPreload(client) {
  const b = client?.brand;
  if (!b?.logoUrl) return ''; // no logo (e.g. blank-co) → the name wordmark is the LCP
  const responsive = b.logoSrcset
    ? ` imagesrcset="${escapeHtml(b.logoSrcset)}" imagesizes="${LOGO_SIZES}"`
    : '';
  return `<link rel="preload" as="image" href="${escapeHtml(b.logoUrl)}"${responsive} fetchpriority="high">`;
}

/**
 * Per-client GTM, injected at prerender time — components never carry a
 * container id (factory rule: per-client values live in client records).
 * The id is shape-checked before it is ever written into HTML: a malformed
 * value in a client record becomes a build warning, not an injected string.
 * The neutral root and 404 get no GTM at all — there is nothing to measure
 * on a page that names nobody.
 */
const GTM_ID_SHAPE = /^GTM-[A-Z0-9]{4,10}$/;

function gtmHead(client, template) {
  const id = client?.tracking?.gtmContainerId;
  if (!id) return '';
  if (!GTM_ID_SHAPE.test(id)) {
    console.warn(`  ! ${client.slug}: gtmContainerId ${JSON.stringify(id)} is not GTM-shaped — skipping injection`);
    return '';
  }
  // page_context is pushed BEFORE gtm.js starts, so tags can read client and
  // template as dataLayer variables from the very first event.
  return (
    `<script>window.dataLayer=window.dataLayer||[];` +
    `window.dataLayer.push({event:'page_context',client:'${escapeHtml(client.slug)}',template:'${escapeHtml(template?.id ?? '')}'});` +
    `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});` +
    `var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;` +
    `j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})` +
    `(window,document,'script','dataLayer','${id}');</script>`
  );
}

function gtmNoscript(client) {
  const id = client?.tracking?.gtmContainerId;
  if (!id || !GTM_ID_SHAPE.test(id)) return '';
  return (
    `<noscript><iframe src="https://www.googletagmanager.com/ns.html?id=${id}" ` +
    `height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>`
  );
}

function pageHead(client, template) {
  const title = `${template.label} — ${client.name}`;
  const bits = [
    `<title>${escapeHtml(title)}</title>`,
    `<meta name="description" content="${escapeHtml(`${template.label} in ${client.serviceArea || 'your area'} from ${client.name}.`)}">`,
    // A demo page echoes real-client copy shapes, so it must not compete with
    // them in search: nofollow as well as noindex, matched by the X-Robots-Tag
    // header in app/public/_headers so the rule survives a stripped <head>.
    `<meta name="robots" content="${client.isDemo ? 'noindex, nofollow' : 'noindex'}">`,
  ];
  if (PHOTO_LCP_TEMPLATES.has(template.id)) {
    const lcp = lcpImage(client);
    if (lcp) {
      // The preload MUST advertise the same candidate set as the <img>, otherwise the
      // browser preloads the full-size file and then downloads a smaller one anyway.
      const responsive = lcp.srcset
        ? ` imagesrcset="${escapeHtml(lcp.srcset)}" imagesizes="(max-width: 767px) 100vw, 55vw"`
        : '';
      bits.push(`<link rel="preload" as="image" href="${escapeHtml(lcp.src)}"${responsive} fetchpriority="high">`);
    }
  } else {
    // Text-hero template: the enlarged logo is the LCP.
    const lp = logoPreload(client);
    if (lp) bits.push(lp);
  }
  return bits.join('\n    ');
}

/**
 * Test fixtures never ship.
 *
 * `blank-co` exists to prove R5 — that every template degrades gracefully with no
 * logo, no photos, no reviews and no legal URLs. It is a test artefact, not a
 * client, and it has no business being reachable on a public advertising domain.
 *
 * R5 does not need it deployed. The rule check in scripts/verify-factory-rules.mjs
 * reads the fixture straight off disk, and rendering it in a browser is a LOCAL
 * activity. So the default build — and therefore every deploy — omits it, and you
 * opt back in explicitly when you want the pages to click through:
 *
 *     INCLUDE_FIXTURES=1 npm run build     (or: npm run build:fixtures)
 *
 * Default-excluded rather than pruned-after-the-fact on purpose: a fixture that is
 * never generated cannot be forgotten and uploaded, whereas a cleanup step can be
 * skipped.
 */
const INCLUDE_FIXTURES = process.env.INCLUDE_FIXTURES === '1';
const skippedFixtures = [];

const routes = [];
for (const { client } of listClients()) {
  if (client.isFixture && !INCLUDE_FIXTURES) {
    skippedFixtures.push(client.slug);
    continue;
  }
  for (const template of TEMPLATE_META) {
    if (!template.built) continue;
    // A client opts out of templates for services it does not sell — never generate
    // a page that implies a service the client does not offer (would also be photo-less).
    if ((client.excludedTemplates ?? []).includes(template.id)) continue;
    // Demo clients live under /demo/, real clients under /p/. One prefix per
    // client, decided by the record — which is what lets app/public/_headers
    // put X-Robots-Tag on the whole showcase with a single /demo/* rule, and
    // what stops a demo page from ever existing at a /p/ address.
    const base = client.isDemo ? '/demo' : '/p';
    routes.push({ url: `${base}/${client.slug}/${template.id}`, client, template });
    routes.push({ url: `${base}/${client.slug}/${template.id}/thank-you`, client, template, isThankYou: true });
  }
}
// The bare root prerenders PublicRoot (the roster is dev-only — see App.tsx):
// a neutral placeholder with no client names, no roster, no /p/ links.
routes.push({ url: '/', client: null, template: null, title: 'Landing pages' });

// A real 404 page. Its PRESENCE is the mechanism: Cloudflare Pages serves
// 404.html with an actual 404 status for any path with no static file, INSTEAD
// of falling back to index.html with a 200. Without this file, every
// unmatched route served the roster. The URL below matches no route, so the
// render produces the NotFound tree; if a visitor lands on 404.html the
// hydrating router renders the same thing for whatever bad URL they hit.
//
// Prerendering survives this because every real page — including every
// /p/<client>/<template>/thank-you — is written as a static file above, so
// nothing a campaign links to depends on the SPA fallback. The lead Function
// at /api/lead runs before static-asset lookup and is unaffected.
routes.push({ url: '/__no_such_page__', out: '404.html', client: null, template: null, title: 'Page not found' });

let written = 0;
const failures = [];

for (const route of routes) {
  try {
    const html = render(route.url);
    let page = shell.replace('<div id="root"></div>', `<div id="root">${html}</div>`);

    if (route.client && route.template) {
      const head = pageHead(route.client, route.template);
      // Drop the shell's placeholder <title> so the page has exactly one.
      page = page.replace(/<title>[\s\S]*?<\/title>\s*/i, '');
      page = page.replace('</head>', `  ${head}\n  </head>`);
      const gtm = gtmHead(route.client, route.template);
      if (gtm) {
        page = page.replace('</head>', `  ${gtm}\n  </head>`);
        page = page.replace(/<body([^>]*)>/i, (m) => `${m}\n    ${gtmNoscript(route.client)}`);
      }
    } else if (route.title) {
      // Root and 404 carry a neutral title and stay out of search indexes.
      page = page.replace(/<title>[\s\S]*?<\/title>\s*/i, '');
      page = page.replace(
        '</head>',
        `  <title>${escapeHtml(route.title)}</title>\n    <meta name="robots" content="noindex">\n  </head>`
      );
    }

    const out = join(
      DIST,
      route.out ?? (route.url === '/' ? 'index.html' : `${route.url.replace(/^\//, '')}/index.html`)
    );
    mkdirSync(dirname(out), { recursive: true });
    writeFileSync(out, page, 'utf8');
    written++;
  } catch (err) {
    failures.push(`${route.url} — ${err?.message ?? err}`);
  }
}

console.log(`prerendered ${written} page(s)`);
if (skippedFixtures.length) {
  console.log(
    `  fixtures EXCLUDED from this build (never deployed): ${skippedFixtures.join(', ')}` +
      `\n  to render them locally: INCLUDE_FIXTURES=1 npm run build`
  );
}
if (failures.length) {
  console.error(`\n${failures.length} route(s) failed:`);
  for (const f of failures) console.error(`  ${f}`);
  process.exit(1);
}
