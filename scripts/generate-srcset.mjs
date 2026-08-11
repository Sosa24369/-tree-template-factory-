/**
 * Generates responsive variants for every photograph in every client record and
 * writes a `srcset` onto each PhotoSet.
 *
 * Why: Lighthouse mobile measured 30 image requests totalling ~1.07MB on the
 * removal-a page. Marking them `loading="lazy"` does not help — Chrome widens the
 * lazy threshold on slow connections and fetches them anyway — so the LCP image
 * ends up queued behind a megabyte of siblings. Serving a 400px-wide file to a
 * 412px-wide viewport is the actual fix.
 *
 * Dimensions stay honest: every width here is produced by an actual resize, and
 * `width`/`height` on the record remain the measured intrinsic size of `src`.
 *
 * Usage: node scripts/generate-srcset.mjs
 */
import { readFileSync, writeFileSync, existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import sharp from 'sharp';

const ROOT = new URL('..', import.meta.url).pathname;
const PUB = join(ROOT, 'app', 'public');
const WIDTHS = [400, 800, 1200];

let generated = 0, reused = 0, photos = 0, saved = 0;

async function variantsFor(src) {
  const abs = join(PUB, src.replace(/^\//, ''));
  if (!existsSync(abs) || /\.(svg|mp4)$/i.test(src)) return null;

  const meta = await sharp(abs).metadata();
  const intrinsic = meta.width ?? 0;
  if (!intrinsic) return null;

  const parts = [];
  for (const w of WIDTHS) {
    if (w >= intrinsic) continue; // never upscale
    const out = src.replace(/(\.[a-z0-9]+)$/i, `-${w}w$1`);
    const outAbs = join(PUB, out.replace(/^\//, ''));
    if (existsSync(outAbs)) {
      reused++;
    } else {
      const buf = await sharp(abs).resize({ width: w, withoutEnlargement: true }).webp({ quality: 78 }).toBuffer();
      writeFileSync(outAbs, buf);
      generated++;
      saved += buf.length;
    }
    parts.push(`${out} ${w}w`);
  }
  if (!parts.length) return null;
  parts.push(`${src} ${intrinsic}w`);
  return parts.join(', ');
}

for (const file of readdirSync(join(ROOT, 'clients')).filter((f) => f.endsWith('.json'))) {
  const path = join(ROOT, 'clients', file);
  const record = JSON.parse(readFileSync(path, 'utf8'));
  let touched = false;

  for (const list of Object.values(record.photos ?? {})) {
    for (const photo of list ?? []) {
      if (!photo?.src || photo.kind === 'video') continue;
      photos++;
      const srcset = await variantsFor(photo.src);
      if (srcset && photo.srcset !== srcset) { photo.srcset = srcset; touched = true; }
    }
  }

  if (touched) writeFileSync(path, JSON.stringify(record, null, 2) + '\n', 'utf8');
}

console.log(`photos processed ${photos}; variants generated ${generated}, reused ${reused}`);
