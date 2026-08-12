/**
 * Generates ONE right-sized header-logo webp per client and writes it + its intrinsic
 * dimensions onto the brand record.
 *
 * WHY ONE FILE, NOT A SRCSET: the owner enlarged the header logo across every template,
 * which makes it the mobile LCP on the text-hero pages. The instinct is a responsive
 * srcset — but the prerender renders the React tree with renderToString, and React 19's
 * float runtime hoists a <link rel=preload> for the fallback `src` of ANY <img srcSet>.
 * That preloaded src NEVER matches the srcset candidate the browser then picks, so every
 * logo would double-download on the LCP path (measured: storm 99 -> 96). The perf budget
 * wins (rule 4). A single file, sized for the largest the header ever shows (~88px at
 * ~2x = 176px, so 192px), is small AND crisp at every display size AND floats nothing.
 * The prerender preloads that exact file by href, in sync by construction.
 *
 * NEVER UPSCALES (rule 2): TTT's source is 480x480 and J Valdez's SVG wraps a 1200px
 * PNG — 192px is a downscale of both, so the badge stays sharp.
 *
 * The (817) number baked into the TTT badge is NOT removed — it sits inside the
 * circular mark, so no crop takes it without cutting the mark (owner-accepted; flagged).
 *
 * Usage: node scripts/generate-logo-variants.mjs
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { createHash } from 'node:crypto';
import sharp from 'sharp';

const ROOT = new URL('..', import.meta.url).pathname;
const PUB = join(ROOT, 'app', 'public');
const CLIENTS = join(ROOT, 'clients');

// One file, sized for the largest the header ever renders (~88px desktop) at high DPI.
const LOGO_PX = 192;

async function writeLogo(slug, baseBuf) {
  const buf = await sharp(baseBuf).webp({ quality: 90 }).toBuffer();
  const hash = createHash('sha1').update(buf).digest('hex').slice(0, 8);
  const name = `logo-header-${hash}.webp`;
  writeFileSync(join(PUB, 'assets', slug, name), buf);
  return { src: `/assets/${slug}/${name}`, width: LOGO_PX, height: LOGO_PX };
}

async function run() {
  const out = [];

  // ── Texas Tree Tops — 480x480 opaque webp badge (keeps the baked-in number). ──
  {
    const src480 = join(PUB, 'assets', 'texas-tree-tops', 'logo-mobile-and-footer-28a2c9eb.webp');
    const base = await sharp(readFileSync(src480)).resize({ width: LOGO_PX, height: LOGO_PX, fit: 'contain', background: '#ffffff' }).toBuffer();
    out.push({ slug: 'texas-tree-tops', ...(await writeLogo('texas-tree-tops', base)) });
  }

  // ── J Valdez — rasterize the SVG (wraps a 1200px PNG) at high density → crisp. ──
  {
    const svg = readFileSync(join(PUB, 'assets', 'j-valdez', 'logo-circle-badge-cea46949.svg'));
    const base = await sharp(svg, { density: 384 }).resize({ width: LOGO_PX, height: LOGO_PX, fit: 'contain', background: '#ffffff' }).toBuffer();
    out.push({ slug: 'j-valdez', ...(await writeLogo('j-valdez', base)) });
  }

  // ── Write logoUrl + intrinsic dims onto each record (no srcset — see header note). ──
  for (const { slug, src, width, height } of out) {
    const file = join(CLIENTS, `${slug}.json`);
    if (!existsSync(file)) continue;
    const d = JSON.parse(readFileSync(file, 'utf8'));
    d.brand.logoUrl = src;
    d.brand.logoWidth = width;
    d.brand.logoHeight = height;
    delete d.brand.logoSrcset; // single-file logo; no srcset (would trip React SSR float)
    writeFileSync(file, JSON.stringify(d, null, 2) + '\n', 'utf8');
    console.log(`${slug}: ${src} (${width}x${height})`);
  }
}

run();
