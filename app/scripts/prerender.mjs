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
 * Storm templates have a TEXT mobile LCP: the hero is a brand-colour gradient and the
 * H1 paints from CSS, while the only photograph is a desktop-only CSS background
 * (consumed inside a min-width query, so a phone never fetches it). Preloading a hero
 * image here would do two wrong things at once — pull bytes onto the mobile critical
 * path for an element that is never shown, and preload a DIFFERENT file than the
 * desktop background (a double-download the brief explicitly forbids). So storm gets
 * no image preload; every other template keeps its existing behaviour byte-for-byte.
 */
function templateHasTextLcp(template) {
  return template.service === 'storm';
}

function pageHead(client, template) {
  const title = `${template.label} — ${client.name}`;
  const bits = [
    `<title>${escapeHtml(title)}</title>`,
    `<meta name="description" content="${escapeHtml(`${template.label} in ${client.serviceArea || 'your area'} from ${client.name}.`)}">`,
    `<meta name="robots" content="noindex">`,
  ];
  const lcp = templateHasTextLcp(template) ? null : lcpImage(client);
  if (lcp) {
    // The preload MUST advertise the same candidate set as the <img>, otherwise the
    // browser preloads the full-size file and then downloads a smaller one anyway.
    const responsive = lcp.srcset
      ? ` imagesrcset="${escapeHtml(lcp.srcset)}" imagesizes="(max-width: 767px) 100vw, 55vw"`
      : '';
    bits.push(`<link rel="preload" as="image" href="${escapeHtml(lcp.src)}"${responsive} fetchpriority="high">`);
  }
  return bits.join('\n    ');
}

const routes = [];
for (const { client } of listClients()) {
  for (const template of TEMPLATE_META) {
    if (!template.built) continue;
    routes.push({ url: `/p/${client.slug}/${template.id}`, client, template });
    routes.push({ url: `/p/${client.slug}/${template.id}/thank-you`, client, template, isThankYou: true });
  }
}
routes.push({ url: '/', client: null, template: null });

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
    }

    const out = join(DIST, route.url === '/' ? 'index.html' : `${route.url.replace(/^\//, '')}/index.html`);
    mkdirSync(dirname(out), { recursive: true });
    writeFileSync(out, page, 'utf8');
    written++;
  } catch (err) {
    failures.push(`${route.url} — ${err?.message ?? err}`);
  }
}

console.log(`prerendered ${written} page(s)`);
if (failures.length) {
  console.error(`\n${failures.length} route(s) failed:`);
  for (const f of failures) console.error(`  ${f}`);
  process.exit(1);
}
