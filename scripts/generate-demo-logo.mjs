/**
 * Generates the DEMO account's header logo.
 *
 * The demo client must not reuse any paying client's photography or brand marks,
 * and there is no real company behind it to supply a logo — so its mark is
 * generated here from geometry only: a rounded tile, a canopy, a trunk. No
 * lettering, no phone number, nothing that could be mistaken for a real business
 * identity. The colours come from the demo record's own palette.
 *
 * Same output contract as scripts/generate-logo-variants.mjs: ONE 192px webp
 * (see that file for why there is no srcset), written to /assets/<slug>/ and
 * recorded on the client record as logoUrl + logoWidth/logoHeight.
 *
 * Usage: node scripts/generate-demo-logo.mjs
 * Idempotent: re-running produces the same bytes and the same content hash.
 */
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { createHash } from 'node:crypto';
import sharp from 'sharp';

const ROOT = new URL('..', import.meta.url).pathname;
const PUB = join(ROOT, 'app', 'public');
const CLIENTS = join(ROOT, 'clients');
const LOGO_PX = 192;

const SLUG = 'summit-tree';

const file = join(CLIENTS, `${SLUG}.json`);
if (!existsSync(file)) {
  console.error(`no clients/${SLUG}.json — create the demo record first`);
  process.exit(1);
}
const record = JSON.parse(readFileSync(file, 'utf8'));
if (record.isDemo !== true) {
  console.error(`clients/${SLUG}.json is not a demo record (isDemo !== true) — refusing to write a generated mark onto a real client`);
  process.exit(1);
}

const primary = record.brand.primaryColor;
const accent = record.brand.accentColor;
const onPrimary = record.brand.onPrimaryColor ?? '#ffffff';

// Geometry only. Three stacked canopy tiers over a trunk, inside a rounded tile.
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="0 0 256 256">
  <rect width="256" height="256" rx="56" fill="${primary}"/>
  <rect x="118" y="150" width="20" height="72" rx="5" fill="${onPrimary}"/>
  <path d="M128 38 L174 100 L82 100 Z" fill="${onPrimary}"/>
  <path d="M128 78 L186 148 L70 148 Z" fill="${onPrimary}"/>
  <path d="M128 118 L198 196 L58 196 Z" fill="${accent}"/>
</svg>`;

const base = await sharp(Buffer.from(svg), { density: 384 })
  .resize({ width: LOGO_PX, height: LOGO_PX, fit: 'contain', background: primary })
  .toBuffer();
const buf = await sharp(base).webp({ quality: 90 }).toBuffer();
const hash = createHash('sha1').update(buf).digest('hex').slice(0, 8);
const name = `logo-header-${hash}.webp`;

mkdirSync(join(PUB, 'assets', SLUG), { recursive: true });
writeFileSync(join(PUB, 'assets', SLUG, name), buf);

record.brand.logoUrl = `/assets/${SLUG}/${name}`;
record.brand.logoWidth = LOGO_PX;
record.brand.logoHeight = LOGO_PX;
delete record.brand.logoSrcset;
writeFileSync(file, JSON.stringify(record, null, 2) + '\n', 'utf8');

console.log(`${SLUG}: ${record.brand.logoUrl} (${LOGO_PX}x${LOGO_PX}, ${buf.length} bytes)`);
