/**
 * Image boxes — every photo box in the BUILT output holds a photo, and the photo exists.
 *
 * History: the four-page batch's evidence said "dead space 0" on a services card whose
 * photo box was an empty grey block. The probe measured the wrapper against itself when
 * no <img> was inside, so an empty box scored perfect. This guard is the static half of
 * the replacement (the rendered half, which needs a browser, is scripts/verify-rendered.mjs
 * in the `rendered` phase): it runs anywhere node runs, the studio's publish included.
 *
 * For every page under app/dist:
 *   1. every <img src> and every srcset candidate names a file that exists in app/dist
 *      (a photo box that resolves to a missing file paints as an empty box);
 *   2. every DeferredImage wrapper — a box with an inline `aspect-ratio`, i.e. a slot the
 *      template decided to render — contains an image fallback (<noscript><img …>) with a
 *      src, so a box is never reserved for nothing;
 *   3. every cell of a photo grid (a <video src> counts as filled — a gallery may lead with a clip) (<li> inside a *-mosaic / *-grid-mosaic list, or a
 *      *-tile / *-tile-box / *-frame / *-shot / *-box element) contains an <img> or the
 *      fallback — an empty cell is a slot the resolver left unfilled.
 *
 * Exit 1 on any hit, listing page · box · reason. Reads only app/dist.
 */
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, relative } from 'node:path';

const ROOT = new URL('..', import.meta.url).pathname;
const DIST = process.env.IMAGE_BOXES_DIST || join(ROOT, 'app/dist'); // env override: the same check on another build's pages
const ASSETS = process.env.IMAGE_BOXES_ASSETS || DIST; // where /assets/... resolve (a saved copy of live pages has none of its own)

function pages(dir, out = []) {
  for (const f of readdirSync(dir)) {
    const p = join(dir, f);
    if (statSync(p).isDirectory()) pages(p, out);
    else if (f === 'index.html' && p !== join(DIST, 'index.html') && !p.includes('/dashboard/')) out.push(p);
  }
  return out;
}

/** Minimal tag walker over React's well-formed SSR output: returns elements with their inner HTML. */
function elements(html) {
  const out = [];
  const stack = [];
  const re = /<(\/?)([a-zA-Z][\w-]*)([^>]*?)(\/?)>/g;
  const VOID = new Set(['img', 'br', 'hr', 'input', 'meta', 'link', 'source', 'path', 'circle', 'rect', 'line', 'polyline', 'polygon', 'use', 'stop']);
  let m;
  while ((m = re.exec(html))) {
    const [, close, tag, attrs, self] = m;
    const t = tag.toLowerCase();
    if (close) {
      for (let i = stack.length - 1; i >= 0; i--) {
        if (stack[i].tag === t) {
          const el = stack.splice(i)[0];
          el.inner = html.slice(el.innerStart, m.index);
          out.push(el);
          break;
        }
      }
      continue;
    }
    const cls = / class="([^"]*)"/.exec(attrs)?.[1] ?? '';
    const style = / style="([^"]*)"/.exec(attrs)?.[1] ?? '';
    const el = { tag: t, cls, style, attrs, start: m.index, innerStart: m.index + m[0].length, inner: '' };
    if (self || VOID.has(t)) { out.push(el); continue; }
    stack.push(el);
  }
  return out;
}

const hits = [];
const files = pages(DIST);
let imgs = 0, wrappers = 0, cells = 0;
for (const file of files) {
  const page = relative(DIST, file).replace(/\/index\.html$/, '');
  const html = readFileSync(file, 'utf8');
  // 1. every image file exists
  for (const m of html.matchAll(/<img\b[^>]*>/g)) {
    imgs++;
    const src = / src="([^"]*)"/.exec(m[0])?.[1];
    const srcset = / srcset="([^"]*)"/.exec(m[0])?.[1];
    const urls = [src, ...(srcset ? srcset.split(',').map((s) => s.trim().split(/\s+/)[0]) : [])].filter(Boolean);
    if (!src) hits.push(`${page} · <img> with no src · ${m[0].slice(0, 80)}`);
    for (const u of urls) {
      if (/^(https?:|data:)/.test(u)) continue;
      if (!existsSync(join(ASSETS, decodeURIComponent(u.split('?')[0])))) hits.push(`${page} · missing file · ${u}`);
    }
  }
  for (const m of html.matchAll(/<video\b[^>]*>/g)) {
    const src = / src="([^"#]+)/.exec(m[0])?.[1]; const poster = / poster="([^"]+)"/.exec(m[0])?.[1];
    if (src && !existsSync(join(ASSETS, decodeURIComponent(src)))) hits.push(`${page} · missing file · ${src}`);
    // A clip with preload="none" and no poster paints as a black box until someone presses play.
    if (!poster) hits.push(`${page} · <video> with no poster · ${src ?? m[0].slice(0, 60)}`);
    else if (!existsSync(join(ASSETS, decodeURIComponent(poster)))) hits.push(`${page} · missing file · ${poster}`);
  }
  const els = elements(html);
  for (const el of els) {
    const isWrapper = /aspect-ratio:/.test(el.style);
    const isCell = (el.tag === 'li' && /-mosaic\b|-grid-mosaic\b/.test(el.parentCls ?? '')) || /(^|\s)\S+-(tile|tile-box|frame|shot|shot-box|work-box|proof-cell|band-cell)(\s|$)/.test(el.cls);
    if (!isWrapper && !isCell) continue;
    if (el.cls.includes('sac') || el.tag === 'a' || el.tag === 'button') continue;
    if (isWrapper) wrappers++; else cells++;
    const hasImg = /<(img|video)\b[^>]*\ssrc="[^"]+"/.test(el.inner);
    if (!hasImg) hits.push(`${page} · ${el.tag}.${el.cls.split(' ')[0]} · ${isWrapper ? 'a reserved photo box with no image inside' : 'a photo cell with no image inside'}`);
  }
  // grid <li> cells: find mosaic lists and check each li
  for (const el of els) {
    if (el.tag !== 'ul' || !/-mosaic\b/.test(el.cls)) continue;
    for (const li of elements(el.inner).filter((e) => e.tag === 'li')) {
      cells++;
      if (!/<(img|video)\b[^>]*\ssrc="[^"]+"/.test(li.inner)) hits.push(`${page} · li in .${el.cls.split(' ')[0]} · a grid cell with no image inside`);
    }
  }
}
console.log(`image-boxes: ${files.length} pages, ${imgs} <img>, ${wrappers} reserved boxes, ${cells} grid/tile cells checked`);
if (hits.length) {
  for (const h of hits) console.log(`  FAIL ${h}`);
  console.log(`image-boxes: ${hits.length} hit(s)`);
  process.exit(1);
}
console.log('image-boxes: PASS — every box holds an image and every image file exists');
