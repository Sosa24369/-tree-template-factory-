/**
 * Performance is a design constraint on these pages, not an afterthought.
 * The raw self-hosted control assets came to ~37MB, including a 7.6MB PNG background.
 *
 * This pass:
 *  - re-encodes raster images to WebP (q80) and caps width at 1600px
 *  - keeps the original file if it was already smaller
 *  - leaves SVG and MP4 untouched (video is flagged in the report, not transcoded)
 *  - MEASURES the real pixel dimensions of the output and records them as
 *    intrinsicWidth/intrinsicHeight
 *
 * On dimensions: `width`/`height` in the manifest stay exactly as P0 recorded them
 * (null wherever the source page never stated one — null over guess). The intrinsic*
 * fields are different in kind: they are measured from the actual file, not inferred,
 * so templates can set width/height to prevent layout shift without anyone inventing
 * a number.
 *
 * Usage: node scripts/optimize-assets.mjs
 */
import { readFileSync, writeFileSync, statSync, existsSync, unlinkSync } from 'node:fs';
import { join } from 'node:path';
import sharp from 'sharp';

const ROOT = new URL('..', import.meta.url).pathname;
const PAGES = ['removal', 'trimming', 'storm'];
const MAX_WIDTH = 1600;
const QUALITY = 80;

let before = 0, after = 0, converted = 0, kept = 0, skipped = 0;
const heavy = [];

for (const page of PAGES) {
  const manifestPath = join(ROOT, 'source', page, 'assets.manifest.json');
  if (!existsSync(manifestPath)) continue;
  const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));

  for (const entry of manifest) {
    if (!entry.src) continue;
    const abs = join(ROOT, 'app', 'public', entry.src.replace(/^\//, ''));
    if (!existsSync(abs)) continue;

    const startBytes = statSync(abs).size;
    before += startBytes;

    // Video and SVG pass through untouched.
    if (entry.kind === 'video' || abs.endsWith('.svg')) {
      after += startBytes;
      skipped++;
      if (startBytes > 1_000_000) heavy.push({ src: entry.src, mb: startBytes / 1048576, why: entry.kind === 'video' ? 'video, not transcoded' : 'large SVG' });
      continue;
    }

    try {
      const input = readFileSync(abs);
      const meta = await sharp(input).metadata();

      let pipeline = sharp(input);
      if (meta.width && meta.width > MAX_WIDTH) pipeline = pipeline.resize({ width: MAX_WIDTH, withoutEnlargement: true });
      const out = await pipeline.webp({ quality: QUALITY }).toBuffer();

      if (out.length < startBytes) {
        const webpPath = abs.replace(/\.[a-z0-9]+$/i, '.webp');
        writeFileSync(webpPath, out);
        if (webpPath !== abs) unlinkSync(abs);
        entry.src = entry.src.replace(/\.[a-z0-9]+$/i, '.webp');
        const outMeta = await sharp(out).metadata();
        entry.intrinsicWidth = outMeta.width ?? null;
        entry.intrinsicHeight = outMeta.height ?? null;
        entry.bytes = out.length;
        after += out.length;
        converted++;
      } else {
        entry.intrinsicWidth = meta.width ?? null;
        entry.intrinsicHeight = meta.height ?? null;
        after += startBytes;
        kept++;
      }
    } catch {
      after += startBytes;
      skipped++;
    }
  }

  writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), 'utf8');
}

const mb = (n) => (n / 1048576).toFixed(2) + ' MB';
console.log(`converted ${converted}, kept-original ${kept}, skipped ${skipped}`);
console.log(`total: ${mb(before)} -> ${mb(after)}  (${(100 - (after / before) * 100).toFixed(1)}% smaller)`);
if (heavy.length) {
  console.log('\nStill heavy — needs a decision, not an automatic fix:');
  for (const h of heavy.sort((a, b) => b.mb - a.mb)) console.log(`  ${h.mb.toFixed(2)} MB  ${h.src}  (${h.why})`);
}
