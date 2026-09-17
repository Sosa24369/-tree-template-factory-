/**
 * Rendered pages — the checks that only a browser can make, on every built page at
 * 390 / 820 / 1440 (DPR 2), after the page has been scrolled top to bottom, every horizontal
 * rail scrolled to its end and back, and every image has finished loading (the state a
 * reader who scrolls through the page sees):
 *
 *   image boxes   every photo box holds a LOADED <img> (or a <video>) whose box fills it
 *                 within 1.5 px. History: the four-page batch's probe measured an empty
 *                 box against itself and reported "dead space 0" — see verify-image-boxes.mjs
 *                 for the static half that runs on any host.
 *   areas         the shared city grid: chip count equals the record's (deduplicated) city
 *                 count, every chip's box is inside its section's box and inside the
 *                 viewport, no chip's text overflows its box, the last row holds at least
 *                 two chips, nothing is masked or animated.
 *
 * Needs Chrome (scripts/lib/cdp.mjs; CHROME env overrides the path). The studio host has
 * no browser, so this is the `rendered` phase: run from the release machine before a
 * publish, never skipped-as-passed — with no browser it exits 2.
 *
 * Serves app/dist itself on an ephemeral port with every tracker blocked (the built pages
 * carry the clients' real GTM containers). Exit 1 on any hit.
 */
import { createServer } from 'node:http';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, extname, relative } from 'node:path';
import { launch, sleep, hasBrowser } from './lib/cdp.mjs';

const ROOT = new URL('..', import.meta.url).pathname;
const DIST = join(ROOT, 'app/dist');
const VIEWPORTS = [390, 820, 1440];
const ROUTES_ARG = process.argv.slice(2).filter((a) => a.startsWith('/'));

if (!hasBrowser()) { console.log('rendered: no browser on this host (set CHROME) — the rendered phase runs from the release machine'); process.exit(2); }

const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.webp': 'image/webp', '.svg': 'image/svg+xml', '.json': 'application/json', '.woff2': 'font/woff2', '.mp4': 'video/mp4', '.png': 'image/png', '.jpg': 'image/jpeg' };
const server = createServer((req, res) => {
  let p = join(DIST, decodeURIComponent(req.url.split('?')[0]));
  try { if (statSync(p).isDirectory()) p = join(p, 'index.html'); const b = readFileSync(p); res.writeHead(200, { 'content-type': TYPES[extname(p)] || 'application/octet-stream' }); res.end(b); }
  catch { res.writeHead(404); res.end(); }
});
await new Promise((r) => server.listen(0, '127.0.0.1', r));
const base = `http://127.0.0.1:${server.address().port}`;

function routes(dir, out = []) {
  for (const f of readdirSync(dir)) { const p = join(dir, f); if (statSync(p).isDirectory()) routes(p, out); else if (f === 'index.html' && p !== join(DIST, 'index.html') && !p.includes('/dashboard/')) out.push('/' + relative(DIST, dir) + '/'); }
  return out.sort();
}
const all = ROUTES_ARG.length ? ROUTES_ARG : routes(DIST);
const record = (route) => { const m = /^\/(?:p|demo)\/([^/]+)\//.exec(route); return m ? JSON.parse(readFileSync(join(ROOT, 'clients', m[1] + '.json'), 'utf8')) : null; };
const cityCount = (rec) => { const seen = new Set(); for (const c of rec?.serviceAreaList ?? []) if (typeof c === 'string' && c.trim()) seen.add(c.trim().toLowerCase()); return seen.size; };

const BOX_SEL = '[style*="aspect-ratio"], [class*="-shot"], [class*="-frame"], [class*="-tile"], [class*="-cell"], [class*="-mosaic"] > li';
const SETTLE = `const H=document.documentElement.scrollHeight;for(let y=0;y<H+innerHeight;y+=Math.round(innerHeight*0.5)){scrollTo(0,y);await new Promise(r=>setTimeout(r,220));}
  /* horizontal scrollers (rails, bands): a deferred cell off to the right never meets the viewport on a vertical pass — scroll each to its end and back, as a reader would */
  for (const el of document.querySelectorAll('*')) { const cs = getComputedStyle(el); if (!/auto|scroll/.test(cs.overflowX) || el.scrollWidth <= el.clientWidth + 5) continue; el.scrollIntoView({ block: 'center' }); await new Promise(r=>setTimeout(r,150)); for (let x = 0; x <= el.scrollWidth; x += Math.max(120, Math.round(el.clientWidth * 0.6))) { el.scrollLeft = x; await new Promise(r=>setTimeout(r,180)); } await new Promise(r=>setTimeout(r,400)); el.scrollLeft = 0; }
  await new Promise(r=>setTimeout(r,1200)); await Promise.all([...document.images].map(i=>i.complete?1:new Promise(r=>{i.onload=i.onerror=r;}))); await new Promise(r=>setTimeout(r,400)); scrollTo(0,0); return 1;`;
const CHECK = `
  const out = { boxes: [], areas: null }; const seen = new Set();
  for (const w of document.querySelectorAll(${JSON.stringify(BOX_SEL)})) {
    if (seen.has(w) || w.closest('noscript') || w.closest('.sac') || ['A','BUTTON','IMG','VIDEO','SOURCE','PICTURE'].includes(w.tagName)) continue; seen.add(w);
    const wb = w.getBoundingClientRect(); if (wb.width < 40 || wb.height < 40) continue;
    if (w.querySelector(${JSON.stringify(BOX_SEL)}) && !w.matches('li')) continue;
    const media = w.querySelector('img, video'); if (!media) { out.boxes.push({ cls: w.className.split(' ')[0], box: Math.round(wb.width)+'x'+Math.round(wb.height), bad: 'NO IMAGE' }); continue; }
    const ib = media.getBoundingClientRect();
    const loaded = media.tagName === 'VIDEO' ? true : (media.complete && media.naturalWidth > 0);
    const fills = Math.abs(ib.width - wb.width) <= 1.5 && Math.abs(ib.height - wb.height) <= 1.5;
    if (!loaded || !fills) out.boxes.push({ cls: w.className.split(' ')[0], box: Math.round(wb.width)+'x'+Math.round(wb.height), bad: !loaded ? 'IMAGE NOT LOADED' : 'IMAGE ' + Math.round(ib.width)+'x'+Math.round(ib.height)+' DOES NOT FILL', src: (media.currentSrc||media.src||'').split('/').pop().slice(0,32) });
  }
  const sac = document.querySelector('.sac');
  if (sac) {
    const chips = [...sac.querySelectorAll('.sac-city')]; const sec = sac.closest('section') || sac.parentElement; const sb = sec.getBoundingClientRect();
    const rows = new Map(); for (const c of chips) { const t = Math.round(c.getBoundingClientRect().top); rows.set(t, (rows.get(t) || 0) + 1); }
    const rowCounts = [...rows.entries()].sort((a, b) => a[0] - b[0]).map(([, n]) => n);
    out.areas = { chips: chips.length, unique: new Set(chips.map(c => c.textContent.trim().toLowerCase())).size,
      outsideSection: chips.filter(c => { const r = c.getBoundingClientRect(); return r.left < sb.left - 0.5 || r.right > sb.right + 0.5 || r.top < sb.top - 0.5 || r.bottom > sb.bottom + 0.5; }).length,
      outsideViewport: chips.filter(c => { const r = c.getBoundingClientRect(); return r.left < 0 || r.right > innerWidth; }).length,
      overflowing: chips.filter(c => c.scrollWidth > c.clientWidth + 1 || c.scrollHeight > c.clientHeight + 1).length,
      rows: rowCounts, lastRow: rowCounts[rowCounts.length - 1] || 0,
      masked: getComputedStyle(sac).maskImage !== 'none' || getComputedStyle(sac).webkitMaskImage !== 'none', animated: [...sac.querySelectorAll('*'), sac].some(e => getComputedStyle(e).animationName !== 'none'),
      alphabetical: chips.map(c => c.textContent.trim()).every((t, i, a) => i === 0 || a[i-1].localeCompare(t, 'en', { sensitivity: 'base' }) <= 0) };
  }
  return out;`;

const browser = await launch({ width: 1440, height: 1000, port: 9340 + Math.floor(Math.random() * 50) });
const page = await browser.newPage('about:blank');
const hits = []; let boxes = 0, pagesChecked = 0;
for (const route of all) {
  const rec = record(route); const cities = cityCount(rec);
  for (const vp of VIEWPORTS) {
    await page.setViewport(vp, 1000, 2); await page.goto(base + route + '?cb=' + Date.now()); await sleep(900);
    await page.eval(`document.documentElement.style.scrollBehavior = 'auto'; document.body.style.scrollBehavior = 'auto'; return 1;`); // the pages scroll smoothly; measure at rest
    await page.eval(SETTLE);
    const r = await page.eval(CHECK);
    for (const b of r.boxes) hits.push(`${route} @${vp} · ${b.cls} ${b.box} · ${b.bad}${b.src ? ' · ' + b.src : ''}`);
    if (r.areas) {
      const a = r.areas;
      if (a.chips !== cities) hits.push(`${route} @${vp} · areas · ${a.chips} chips for ${cities} cities in the record`);
      if (a.unique !== a.chips) hits.push(`${route} @${vp} · areas · a city repeats`);
      if (a.outsideSection) hits.push(`${route} @${vp} · areas · ${a.outsideSection} chip(s) outside the section box`);
      if (a.outsideViewport) hits.push(`${route} @${vp} · areas · ${a.outsideViewport} chip(s) outside the viewport`);
      if (a.overflowing) hits.push(`${route} @${vp} · areas · ${a.overflowing} chip(s) with overflowing text`);
      if (a.chips > 1 && a.lastRow < 2) hits.push(`${route} @${vp} · areas · last row holds ${a.lastRow} chip (rows ${a.rows.join('/')})`);
      if (a.masked || a.animated) hits.push(`${route} @${vp} · areas · ${a.masked ? 'masked' : ''}${a.animated ? ' animated' : ''}`);
      if (!a.alphabetical) hits.push(`${route} @${vp} · areas · not alphabetical`);
      if (process.env.VERBOSE) console.log(`  ${route} @${vp} areas ${a.chips}/${cities} rows ${a.rows.join('/')}`);
    }
    boxes += r.boxes.length; // failing boxes only; total is not returned to keep the payload small
  }
  pagesChecked++;
  if (process.env.VERBOSE) console.log(`  ${route} done`);
}
browser.close(); server.close();
console.log(`rendered: ${pagesChecked} pages × ${VIEWPORTS.join('/')}, settled; ${hits.length} hit(s)`);
for (const h of hits) console.log(`  FAIL ${h}`);
console.log(hits.length ? `rendered: FAIL` : 'rendered: PASS — every photo box holds its loaded image; the city grid is complete, inside its section, alphabetical, no lonely last row');
process.exit(hits.length ? 1 : 0);
