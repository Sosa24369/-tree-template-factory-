/**
 * Wires the self-hosted assets into the CLIENT RECORDS, which is where per-client
 * imagery belongs. Without this, a template falls back to its own default artwork
 * and swapping the client record would not swap the photographs — which would break
 * the one property the whole factory exists for.
 *
 * Three jobs:
 *  1. Assets referenced by more than one client (shared agency icons, review glyphs)
 *     move to /assets/_shared/ so no client's directory is served on another
 *     client's page. Deduplication saved bytes but coupled the clients; this
 *     decouples them again without re-adding the bytes.
 *  2. Each client's brand.logoUrl is pointed at a logo file that actually exists.
 *  3. Each client's photos[service] is populated from the page manifests, carrying
 *     the MEASURED intrinsic dimensions (never a guess) and the source alt text.
 *
 * Usage: node scripts/sync-client-assets.mjs
 */
import { readFileSync, writeFileSync, existsSync, mkdirSync, renameSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = new URL('..', import.meta.url).pathname;
const PUB = join(ROOT, 'app', 'public');
const PAGE_TO_CLIENT = { removal: 'texas-tree-tops', storm: 'texas-tree-tops', trimming: 'j-valdez' };
const PAGE_TO_SERVICE = { removal: 'removal', storm: 'storm', trimming: 'trimming' };

const manifests = Object.fromEntries(
  Object.keys(PAGE_TO_CLIENT).map((page) => [page, JSON.parse(readFileSync(join(ROOT, 'source', page, 'assets.manifest.json'), 'utf8'))])
);

/* ---- 1. de-couple shared assets ---------------------------------------- */

const owners = new Map(); // src -> Set(clientSlug)
for (const [page, manifest] of Object.entries(manifests)) {
  for (const e of manifest) {
    if (!e.src) continue;
    if (!owners.has(e.src)) owners.set(e.src, new Set());
    owners.get(e.src).add(PAGE_TO_CLIENT[page]);
  }
}

const shared = [...owners.entries()].filter(([, set]) => set.size > 1).map(([src]) => src);
const remap = new Map();
if (shared.length) mkdirSync(join(PUB, 'assets', '_shared'), { recursive: true });

for (const src of shared) {
  const file = src.split('/').pop();
  const from = join(PUB, src.replace(/^\//, ''));
  const to = join(PUB, 'assets', '_shared', file);
  if (existsSync(from) && !existsSync(to)) renameSync(from, to);
  remap.set(src, `/assets/_shared/${file}`);
}

for (const manifest of Object.values(manifests)) {
  for (const e of manifest) if (e.src && remap.has(e.src)) e.src = remap.get(e.src);
}

/* ---- 2 + 3. write logo + photos into the client records ----------------- */

const perClient = new Map(); // slug -> { logo, photos: {service: []} }

for (const [page, manifest] of Object.entries(manifests)) {
  const slug = PAGE_TO_CLIENT[page];
  const service = PAGE_TO_SERVICE[page];
  const bucket = perClient.get(slug) ?? { logo: null, photos: {} };

  // Logo: prefer a client-owned (non-shared) asset whose id names a logo.
  const logo = manifest.find(
    (e) => e.src && /logo/i.test(String(e.id)) && !e.src.startsWith('/assets/_shared/')
  );
  if (logo && !bucket.logo) bucket.logo = logo.src;

  // Photos: real photography only — gallery and hero. Icons, backgrounds and
  // decorative glyphs stay with the template as its artwork.
  bucket.photos[service] = manifest
    .filter((e) => e.src && (e.role === 'gallery' || e.role === 'hero') && e.rendered !== false)
    .map((e) => ({
      src: e.src,
      alt: e.alt ?? '',
      // Measured from the actual file. Null stays null.
      width: e.intrinsicWidth ?? null,
      height: e.intrinsicHeight ?? null,
      ...(e.kind === 'video' ? { kind: 'video' } : {}),
    }));

  perClient.set(slug, bucket);
}

let logosFixed = 0, photoCount = 0;
for (const [slug, bucket] of perClient) {
  const file = join(ROOT, 'clients', `${slug}.json`);
  if (!existsSync(file)) continue;
  const record = JSON.parse(readFileSync(file, 'utf8'));

  if (bucket.logo && record.brand.logoUrl !== bucket.logo) {
    record.brand.logoUrl = bucket.logo;
    logosFixed++;
  }
  record.photos = { ...record.photos, ...bucket.photos };
  for (const list of Object.values(bucket.photos)) photoCount += list.length;

  writeFileSync(file, JSON.stringify(record, null, 2) + '\n', 'utf8');
}

for (const [page, manifest] of Object.entries(manifests)) {
  writeFileSync(join(ROOT, 'source', page, 'assets.manifest.json'), JSON.stringify(manifest, null, 2), 'utf8');
}

console.log(`shared assets moved to /assets/_shared: ${shared.length}`);
console.log(`client logos repointed: ${logosFixed}`);
console.log(`photos written into client records: ${photoCount}`);

// Fail loudly if any referenced file is missing — a broken image must not ship.
let missing = 0;
for (const [slug] of perClient) {
  const record = JSON.parse(readFileSync(join(ROOT, 'clients', `${slug}.json`), 'utf8'));
  const check = [record.brand.logoUrl, ...Object.values(record.photos ?? {}).flat().map((p) => p.src)].filter(Boolean);
  for (const src of check) {
    if (!existsSync(join(PUB, src.replace(/^\//, '')))) { console.error(`MISSING FILE  ${slug}  ${src}`); missing++; }
  }
}
if (missing) { console.error(`\n${missing} referenced asset(s) do not exist on disk.`); process.exit(1); }
console.log('every referenced asset exists on disk.');
