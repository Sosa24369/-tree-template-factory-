/**
 * IMAGE-SPEC GUARD — every referenced image exists, meets its slot's minimum, and
 * every photo that lands in a cover slot on a real (non-demo) client has a focal point.
 *
 * Two tiers, stated here rather than hidden in the code:
 *
 *   STRICT for anything the studio's v2 pipeline produced (PhotoSet.pipeline.version
 *   >= 2, written on upload): under-minimum → FAIL, cover slot without a focal point
 *   on a non-demo client → FAIL.
 *
 *   REPORTED for legacy photos (no pipeline marker — everything imported before the
 *   contract existed, i.e. all of Texas Tree Tops' and J Valdez's photography today):
 *   the same checks print as WARN with counts and never fail the publish. Making them
 *   fail today would block every publish for both live clients until 36 photographs
 *   were replaced, including publishes that only touch the demo. Run with --strict to
 *   see what a strict run would do; flip STRICT_LEGACY below to make it so.
 *
 *   ALWAYS FAIL: a referenced file that does not exist — that is a broken image on a
 *   live page whatever its provenance.
 *
 * Usage: node scripts/verify-image-spec.mjs [--strict]   (exit 1 on any failure)
 */
import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import sharp from 'sharp';
import { IMAGE_SLOTS, MASTERS, slotById, stillCount, stillIndex } from '../app/src/templates/imageSlots.mjs';
import { slotsForPosition } from '../app/src/lib/placement.mjs';

const ROOT = new URL('..', import.meta.url).pathname;
const PUB = join(ROOT, 'app', 'public');
const STRICT_LEGACY = process.argv.includes('--strict');

const fails = [];
const warns = [];
let checked = 0;

const fileFor = (src) => join(PUB, String(src).replace(/^\//, ''));
async function dims(src) {
  try { const m = await sharp(fileFor(src)).metadata(); return { w: m.width ?? 0, h: m.height ?? 0 }; } catch { return null; }
}

for (const file of readdirSync(join(ROOT, 'clients')).filter((f) => f.endsWith('.json'))) {
  const record = JSON.parse(readFileSync(join(ROOT, 'clients', file), 'utf8'));
  if (record.isFixture) continue;
  const slug = record.slug || file.replace(/\.json$/, '');
  const demo = record.isDemo === true;
  const excluded = new Set(record.excludedTemplates ?? []);

  /* ---- logo ---- */
  if (record.brand?.logoUrl) {
    checked++;
    if (!existsSync(fileFor(record.brand.logoUrl))) fails.push(`${slug}: logo ${record.brand.logoUrl} does not exist`);
    else {
      const d = await dims(record.brand.logoUrl);
      if (d && Math.max(d.w, d.h) < MASTERS.logo.min) (STRICT_LEGACY ? fails : warns).push(`${slug}: logo is ${Math.max(d.w, d.h)} px on its longest edge, the header needs ${MASTERS.logo.min}`);
    }
  }

  /* ---- photo sets ---- */
  for (const [set, list] of Object.entries(record.photos ?? {})) {
    const photos = Array.isArray(list) ? list : [];
    for (let i = 0; i < photos.length; i++) {
      const p = photos[i];
      if (!p?.src || p.kind === 'video') continue;
      checked++;
      if (!existsSync(fileFor(p.src))) { fails.push(`${slug}: photos.${set}[${i}] ${p.src} does not exist`); continue; }
      for (const cand of String(p.srcset ?? '').split(',').map((s) => s.trim().split(/\s+/)[0]).filter(Boolean)) {
        if (!existsSync(fileFor(cand))) fails.push(`${slug}: photos.${set}[${i}] srcset candidate ${cand} does not exist`);
      }
      const legacy = !(p.pipeline && Number(p.pipeline.version) >= 2);
      const strict = STRICT_LEGACY || !legacy;
      const sink = strict ? fails : warns;
      const tag = legacy ? 'legacy' : 'studio';

      // Which slots this photo lands in, on the templates this client actually builds.
      const slots = slotsForPosition(set, stillIndex(photos, i), stillCount(photos))
        .map((l) => slotById(l.templateId, l.slotId)).filter((s) => s && !excluded.has(s.template));
      const d = await dims(p.src);
      if (!d) { fails.push(`${slug}: photos.${set}[${i}] ${p.src} cannot be read as an image`); continue; }

      // Minimum: the largest floor among the slots it feeds (the hero plate wants 1600).
      let need = MASTERS.photo.min;
      let needWhy = 'a 4:3 tile';
      for (const s of slots) if (MASTERS[s.master].min[0] > need[0]) { need = MASTERS[s.master].min; needWhy = `${s.template} ${s.id}`; }
      if (d.w < need[0]) sink.push(`${slug}: photos.${set}[${i}] (${tag}) is ${d.w} px wide, ${needWhy} needs ${need[0]}`);

      // Focal point: required wherever the photo is cover-cropped, on a real client.
      const coverSlots = slots.filter((s) => s.policy === 'cover' && s.focal === 'required');
      if (coverSlots.length && !p.focal && !demo) sink.push(`${slug}: photos.${set}[${i}] (${tag}) has no focal point but is cover-cropped by ${coverSlots.map((s) => `${s.template}/${s.id}`).join(', ')}`);
      if (coverSlots.length && !p.focal && demo) warns.push(`${slug} (demo): photos.${set}[${i}] has no focal point (${coverSlots.length} cover slot${coverSlots.length === 1 ? '' : 's'})`);
    }
  }

  /* ---- section art plates ---- */
  for (const [tpl, slots] of Object.entries(record.sectionArt ?? {})) {
    for (const [slotId, art] of Object.entries(slots ?? {})) {
      if (!art?.src) continue;
      checked++;
      if (!existsSync(fileFor(art.src))) { fails.push(`${slug}: sectionArt.${tpl}.${slotId} ${art.src} does not exist`); continue; }
      const d = await dims(art.src);
      if (d && d.w < MASTERS.art.min[0]) warns.push(`${slug}: sectionArt.${tpl}.${slotId} is ${d.w} px wide, a plate wants ${MASTERS.art.min[0]}`);
    }
  }
}

const cover = IMAGE_SLOTS.filter((s) => s.policy === 'cover').length;
console.log(`image-spec: ${checked} image reference(s) checked against ${IMAGE_SLOTS.length} slots (${cover} cover)${STRICT_LEGACY ? ' — STRICT (legacy photos held to the contract)' : ''}`);
for (const w of warns) console.log(`  WARN  ${w}`);
if (warns.length) console.log(`  ${warns.length} warning(s) on legacy imagery — reported, not blocking. See the header of this script.`);
for (const f of fails) console.log(`  FAIL  ${f}`);
if (fails.length) { console.log(`${fails.length} violation(s).`); process.exit(1); }
console.log('PASS  image-spec: every referenced image exists; studio-uploaded photos meet their slot minimums and carry focal points where they are cover-cropped.');
