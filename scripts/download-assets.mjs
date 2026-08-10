/**
 * DECISION 5 — self-host the control images.
 *
 * Reads source/<page>/images.json, downloads each logical image's highest-resolution
 * variant, and writes it into app/public/assets/<client-slug>/. Produces a manifest
 * the client records reference, so no template ever points at
 * images.leadconnectorhq.com or assets.cdn.filesafe.space at runtime.
 *
 * Usage: node scripts/download-assets.mjs [page ...]      (default: all three)
 *
 * Rules kept from P0:
 *  - width/height stay null wherever the source did not state them. Null over guess.
 *  - data: URIs are decoded and written as real files rather than inlined.
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync, statSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { extname, join } from 'node:path';

const ROOT = new URL('..', import.meta.url).pathname;
const PAGE_TO_CLIENT = {
  removal: 'texas-tree-tops',
  storm: 'texas-tree-tops',
  trimming: 'j-valdez',
};

const pages = process.argv.slice(2).length ? process.argv.slice(2) : Object.keys(PAGE_TO_CLIENT);

const EXT_BY_MIME = {
  'image/jpeg': '.jpg', 'image/png': '.png', 'image/webp': '.webp',
  'image/svg+xml': '.svg', 'image/gif': '.gif', 'image/avif': '.avif',
};

/**
 * Sniff the real type from magic bytes FIRST. GHL serves several assets whose URL
 * says .png but whose bytes are an MP4 — the removal page's "gallery slides" are
 * video, not stills. Trusting the URL wrote them out as unusable .bin files.
 */
function sniffExt(buf) {
  const b = buf.subarray(0, 16);
  const ascii = b.toString('latin1');
  if (ascii.startsWith('\x89PNG')) return '.png';
  if (ascii.startsWith('GIF8')) return '.gif';
  if (b[0] === 0xff && b[1] === 0xd8) return '.jpg';
  if (ascii.startsWith('RIFF') && buf.subarray(8, 12).toString('latin1') === 'WEBP') return '.webp';
  if (ascii.slice(4, 8) === 'ftyp') {
    const brand = buf.subarray(8, 12).toString('latin1');
    if (brand === 'avif' || brand === 'avis') return '.avif';
    return '.mp4'; // mp42 / isom / M4V — video
  }
  if (/^\s*<(\?xml|svg)/i.test(ascii)) return '.svg';
  return null;
}

function guessExt(url, contentType, buf) {
  const sniffed = buf ? sniffExt(buf) : null;
  if (sniffed) return sniffed;
  if (contentType && EXT_BY_MIME[contentType.split(';')[0].trim()]) return EXT_BY_MIME[contentType.split(';')[0].trim()];
  // GHL wraps the real asset URL after `u_`; the extension lives at the end of it.
  const m = String(url).match(/\.(jpe?g|png|webp|svg|gif|avif)(?:\+xml)?(?:$|[?#])/i);
  if (m) return m[1].toLowerCase() === 'jpeg' ? '.jpg' : `.${m[1].toLowerCase()}`;
  return '.bin';
}

function localName(entry, url, ext) {
  const base = String(entry.id || entry.role || 'asset')
    .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 48) || 'asset';
  const hash = createHash('sha1').update(String(url)).digest('hex').slice(0, 8);
  return `${base}-${hash}${ext}`;
}

async function fetchAsset(url) {
  if (String(url).startsWith('data:')) {
    const m = String(url).match(/^data:([^;,]+)(;base64)?,(.*)$/s);
    if (!m) throw new Error('unparseable data URI');
    const [, mime, isB64, payload] = m;
    const buf = isB64 ? Buffer.from(payload, 'base64') : Buffer.from(decodeURIComponent(payload), 'utf8');
    return { buf, contentType: mime };
  }
  const res = await fetch(url, { redirect: 'follow' });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return { buf: Buffer.from(await res.arrayBuffer()), contentType: res.headers.get('content-type') || '' };
}

for (const page of pages) {
  const client = PAGE_TO_CLIENT[page];
  if (!client) { console.error(`unknown page "${page}"`); process.exitCode = 1; continue; }

  const imagesPath = join(ROOT, 'source', page, 'images.json');
  if (!existsSync(imagesPath)) { console.error(`missing ${imagesPath}`); process.exitCode = 1; continue; }

  const parsed = JSON.parse(readFileSync(imagesPath, 'utf8'));
  const entries = Array.isArray(parsed) ? parsed : (parsed.images || Object.values(parsed).find(Array.isArray) || []);

  const outDir = join(ROOT, 'app', 'public', 'assets', client);
  mkdirSync(outDir, { recursive: true });

  const manifest = [];
  let ok = 0, skipped = 0, failed = 0;

  for (const entry of entries) {
    const url = entry.src;
    if (!url || url === 'data-uri' || typeof url !== 'string') { skipped++; continue; }

    try {
      const { buf, contentType } = await fetchAsset(url);
      const ext = guessExt(url, contentType, buf);
      const file = localName(entry, url, ext);
      const dest = join(outDir, file);
      if (!existsSync(dest) || statSync(dest).size !== buf.length) writeFileSync(dest, buf);
      manifest.push({
        id: entry.id ?? null,
        role: entry.role ?? 'other',
        section: entry.section ?? null,
        src: `/assets/${client}/${file}`,
        alt: entry.alt ?? '',
        // Null over guess — preserved exactly as P0 recorded it.
        width: entry.width ?? null,
        height: entry.height ?? null,
        kind: ['.mp4'].includes(ext) ? 'video' : 'image',
        bytes: buf.length,
        sourceUrl: url,
      });
      ok++;
    } catch (err) {
      failed++;
      manifest.push({ id: entry.id ?? null, role: entry.role ?? 'other', src: null, alt: entry.alt ?? '', width: null, height: null, error: String(err.message || err), sourceUrl: url });
    }
  }

  const manifestPath = join(ROOT, 'source', page, 'assets.manifest.json');
  writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), 'utf8');
  console.log(`${page.padEnd(9)} -> ${client.padEnd(16)} downloaded ${ok}, skipped ${skipped}, failed ${failed}  (${manifestPath.replace(ROOT, '')})`);
}
