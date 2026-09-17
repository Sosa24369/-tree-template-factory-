/**
 * The mobile call bar, measured at 390 × 844 on every built page that has one.
 *
 * Rules (owner, 2026-09-16, "The call bar"):
 *   1. the page reserves bottom padding at least the bar's height, so nothing hides under
 *      it at scroll end;
 *   2. the bar is never directly above a section's own call button — while a section
 *      tel: link is in view, the bar is hidden;
 *   3. the bar's label and sub-label contrast ≥ 4.5:1 against the bar's own background.
 *
 * And the record the owner asked for: scrolling in one-viewport steps from the top to the
 * very bottom, at every stop, which text elements the bar's box intersects. With
 * `--write <dir>` each page's listing goes to <dir>/<route-slug>/callbar-overlap.txt.
 *
 * Needs Chrome (scripts/lib/cdp.mjs). Serves app/dist itself, trackers blocked. Exit 1 on
 * any rule failing; the intersection listing is reported, and fails only under --strict.
 */
import { createServer } from 'node:http';
import { readFileSync, readdirSync, statSync, mkdirSync, writeFileSync } from 'node:fs';
import { join, extname, relative } from 'node:path';
import { launch, sleep, hasBrowser } from './lib/cdp.mjs';

const ROOT = new URL('..', import.meta.url).pathname;
const DIST = join(ROOT, 'app/dist');
const args = process.argv.slice(2);
const WRITE = args.includes('--write') ? args[args.indexOf('--write') + 1] : null;
const STRICT = args.includes('--strict');
const ROUTES_ARG = args.filter((a) => a.startsWith('/'));
if (!hasBrowser()) { console.log('call-bar: no browser on this host (set CHROME)'); process.exit(2); }

const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.webp': 'image/webp', '.svg': 'image/svg+xml', '.json': 'application/json', '.woff2': 'font/woff2', '.mp4': 'video/mp4' };
const server = createServer((req, res) => { let p = join(DIST, decodeURIComponent(req.url.split('?')[0])); try { if (statSync(p).isDirectory()) p = join(p, 'index.html'); const b = readFileSync(p); res.writeHead(200, { 'content-type': TYPES[extname(p)] || 'application/octet-stream' }); res.end(b); } catch { res.writeHead(404); res.end(); } });
await new Promise((r) => server.listen(0, '127.0.0.1', r));
const base = `http://127.0.0.1:${server.address().port}`;
function routes(dir, out = []) { for (const f of readdirSync(dir)) { const p = join(dir, f); if (statSync(p).isDirectory()) routes(p, out); else if (f === 'index.html' && p !== join(DIST, 'index.html') && !p.includes('/dashboard/') && !p.includes('/thank-you/')) out.push('/' + relative(DIST, dir) + '/'); } return out.sort(); }
const all = ROUTES_ARG.length ? ROUTES_ARG : routes(DIST);

const PROBE = `
  const bar = [...document.querySelectorAll('[class*="sticky"]')].find(e => { const cs = getComputedStyle(e); return cs.position === 'fixed' && cs.display !== 'none' && e.getBoundingClientRect().height > 20; });
  if (!bar) return { none: true };
  const parse = (c) => { const m = (c.match(/[\\d.]+/g) || []).map(Number); return { rgb: m.slice(0, 3), a: m.length > 3 ? m[3] : 1 }; };
  const lum = ({ rgb }) => { const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }; return 0.2126 * f(rgb[0]) + 0.7152 * f(rgb[1]) + 0.0722 * f(rgb[2]); };
  const over = (fg, bg) => ({ rgb: fg.rgb.map((v, i) => Math.round(fg.a * v + (1 - fg.a) * bg.rgb[i])), a: 1 });
  const ratio = (fgC, bgC, opacity = 1) => { let fg = parse(fgC); fg.a *= opacity; const bg = parse(bgC); const f2 = fg.a < 1 ? over(fg, bg) : fg; const [hi, lo] = lum(f2) > lum(bg) ? [lum(f2), lum(bg)] : [lum(bg), lum(f2)]; return +((hi + 0.05) / (lo + 0.05)).toFixed(2); };
  const link = bar.querySelector('a'); const lcs = getComputedStyle(link); const bcs = getComputedStyle(bar);
  const linkBg = /rgba\\(0, 0, 0, 0\\)/.test(lcs.backgroundColor) ? bcs.backgroundColor : lcs.backgroundColor;
  const sub = link.querySelector('.phone-sub'); const scs = sub ? getComputedStyle(sub) : null;
  const meta = { barClass: bar.className, barHeight: Math.round(bar.getBoundingClientRect().height), viewport: innerWidth + 'x' + innerHeight,
    reserved: Math.max(parseFloat(getComputedStyle(document.querySelector('main') || document.body).paddingBottom) || 0, parseFloat(getComputedStyle(document.body).paddingBottom) || 0),
    linkColor: lcs.color, linkBg, linkContrast: ratio(lcs.color, linkBg), linkFont: lcs.fontSize,
    subColor: scs ? scs.color : null, subOpacity: scs ? +scs.opacity : null, subContrast: scs ? ratio(scs.color, linkBg, +scs.opacity) : null, subFont: scs ? scs.fontSize : null, barBg: bcs.backgroundColor };
  const TEXT = new Set(['P','H1','H2','H3','H4','LI','A','SPAN','BUTTON','STRONG','EM','DT','DD','SUMMARY','LABEL','TD','TH','FIGCAPTION','SMALL','B','I','DIV','BLOCKQUOTE','CITE','TIME']);
  const textEls = () => [...document.querySelectorAll('body *')].filter(e => { if (bar.contains(e) || e.closest('noscript, script, style')) return false; if (!TEXT.has(e.tagName)) return false; if (![...e.childNodes].some(n => n.nodeType === 3 && n.textContent.trim())) return false; const cs = getComputedStyle(e); if (cs.visibility === 'hidden' || cs.display === 'none') return false; const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0; });
  const barShown = () => { const cs = getComputedStyle(bar); const bb = bar.getBoundingClientRect(); return cs.display !== 'none' && cs.visibility !== 'hidden' && !bar.hasAttribute('hidden') && bb.height > 0 && bb.top < innerHeight && +cs.opacity > 0.05; };
  const stops = []; const H = innerHeight; const max = Math.max(0, document.documentElement.scrollHeight - H); let y = 0; let k = 0;
  while (true) {
    scrollTo(0, y); await new Promise(r => setTimeout(r, 260));
    const shown = barShown(); const bb = bar.getBoundingClientRect();
    const hits = shown ? textEls().filter(e => { const r = e.getBoundingClientRect(); return r.bottom > bb.top + 0.5 && r.top < bb.bottom - 0.5 && r.right > bb.left && r.left < bb.right; }).map(e => e.tagName.toLowerCase() + (typeof e.className === 'string' && e.className ? '.' + e.className.split(' ')[0] : '') + ' "' + [...e.childNodes].filter(n => n.nodeType === 3).map(n => n.textContent.trim()).join(' ').slice(0, 36) + '"') : [];
    const ctas = [...document.querySelectorAll('a[href^="tel:"]')].filter(a => !bar.contains(a)).map(a => a.getBoundingClientRect()).filter(r => r.height > 0 && r.bottom > 0 && r.top < innerHeight);
    stops.push({ k, y: Math.round(scrollY), shown, hits, ctaInView: ctas.length, ctaGap: ctas.length ? Math.min(...ctas.map(r => Math.round(bb.top - r.bottom))) : null });
    if (y >= max) break; y = Math.min(y + H, max); k++;
  }
  scrollTo(0, max); await new Promise(r => setTimeout(r, 260));
  const bottom = bar.getBoundingClientRect(); const lastText = textEls().filter(e => { const r = e.getBoundingClientRect(); return r.bottom > bottom.top + 0.5 && r.top < bottom.bottom; }).length;
  return { meta, stops, scrollHeight: document.documentElement.scrollHeight, hiddenAtEnd: lastText };`;

const browser = await launch({ width: 1440, height: 1000, port: 9400 + Math.floor(Math.random() * 50) });
const page = await browser.newPage('about:blank');
const fails = []; let checked = 0;
for (const route of all) {
  await page.setViewport(390, 844, 2); await page.goto(base + route + '?cb=' + Date.now()); await sleep(1200);
  await page.eval(`const H=document.documentElement.scrollHeight;for(let y=0;y<H+innerHeight;y+=Math.round(innerHeight*0.5)){scrollTo(0,y);await new Promise(r=>setTimeout(r,120));} await new Promise(r=>setTimeout(r,700)); scrollTo(0,0); return 1;`);
  const r = await page.eval(PROBE);
  if (r.none) continue;
  checked++;
  const m = r.meta; const total = r.stops.reduce((n, s) => n + s.hits.length, 0); const stacked = r.stops.filter((s) => s.shown && s.ctaInView > 0);
  const lines = [`${route} at 390×844 — bar .${m.barClass.split(' ')[0]} ${m.barHeight}px tall; reserved bottom padding ${m.reserved}px; page ${r.scrollHeight}px, ${r.stops.length} stops`,
    `contrast — label ${m.linkColor} on ${m.linkBg}: ${m.linkContrast}:1 at ${m.linkFont}; sub-label ${m.subColor} at opacity ${m.subOpacity}: ${m.subContrast}:1 at ${m.subFont}`,
    `text under the bar at scroll end: ${r.hiddenAtEnd}; stops with a section call button in view while the bar shows: ${stacked.length}; text intersections across all stops: ${total}`];
  for (const s of r.stops) lines.push(`  stop ${String(s.k).padStart(2)}  y=${String(s.y).padStart(5)}  bar ${s.shown ? 'shown ' : 'hidden'}  intersects ${s.hits.length}${s.hits.length ? ': ' + s.hits.slice(0, 3).join(' | ') : ''}${s.ctaInView ? `  · section call button in view (gap to bar ${s.ctaGap}px)` : ''}`);
  if (m.reserved < m.barHeight) fails.push(`${route} · reserved bottom padding ${m.reserved}px < bar ${m.barHeight}px`);
  if (r.hiddenAtEnd) fails.push(`${route} · ${r.hiddenAtEnd} text element(s) under the bar at scroll end`);
  if (m.linkContrast < 4.5) fails.push(`${route} · label contrast ${m.linkContrast}:1`);
  if (m.subContrast != null && m.subContrast < 4.5) fails.push(`${route} · sub-label contrast ${m.subContrast}:1`);
  if (stacked.length) fails.push(`${route} · bar shown while a section call button is in view at ${stacked.length} stop(s)`);
  if (STRICT && total) fails.push(`${route} · ${total} text intersection(s) across stops`);
  if (WRITE) { const dir = join(WRITE, route.replace(/^\//, '').replace(/\/$/, '').replace(/\//g, '_')); mkdirSync(dir, { recursive: true }); writeFileSync(join(dir, 'callbar-overlap.txt'), lines.join('\n') + '\n'); }
  if (process.env.VERBOSE || !WRITE) console.log(lines.slice(0, 3).join('\n'));
}
browser.close(); server.close();
console.log(`call-bar: ${checked} page(s) with a bar at 390; ${fails.length} rule failure(s)`);
for (const f of fails) console.log(`  FAIL ${f}`);
process.exit(fails.length ? 1 : 0);
