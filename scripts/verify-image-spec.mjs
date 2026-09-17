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
import { PLACEMENT, cellKey, landingsFor, photoId, slotsForPosition, templateCells } from '../app/src/lib/placement.mjs';
import { photoStatus } from '../app/src/lib/photoStatus.mjs';

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
      if (d.w < need[0]) {
        // A per-photo exception the OWNER granted (2026-09-17): a 1080 px file may sit in a slot
        // whose rendered box is ≤ 1080 CSS px at every breakpoint. Not a lower minimum: the
        // waiver names its slots, records the measured box, and holds only while the photo
        // feeds nothing else and still covers that box. Anything outside it fails as before.
        // Judged on the cells the photo ACTUALLY fills (landingsFor is pin-aware), not on the
        // positional auto-fill map: a pinned card photo does not feed the rail it would auto-fill.
        const w = p.minimumException;
        const landed = w ? landingsFor(record, photoId(p), excluded).map((l) => `${l.templateId}:${l.slotId}`) : [];
        const waived = w && Array.isArray(w.slots) && landed.length > 0
          && landed.every((k) => w.slots.includes(k))
          && Number(w.measuredBox) <= Number(w.maxBox) && d.w >= Number(w.measuredBox);
        const msg = `${slug}: photos.${set}[${i}] (${tag}) is ${d.w} px wide, ${needWhy} needs ${need[0]}`;
        if (waived) warns.push(`${msg} — waived by ${w.by} on ${w.on}: box ${w.measuredBox} px ≤ ${w.maxBox} px in ${w.slots.join(', ')}`);
        else sink.push(msg);
      }

      // Focal point: required wherever the photo is cover-cropped, on a real client.
      const coverSlots = slots.filter((s) => s.policy === 'cover' && s.focal === 'required');
      if (coverSlots.length && !p.focal && !demo) sink.push(`${slug}: photos.${set}[${i}] (${tag}) has no focal point but is cover-cropped by ${coverSlots.map((s) => `${s.template}/${s.id}`).join(', ')}`);
      if (coverSlots.length && !p.focal && demo) warns.push(`${slug} (demo): photos.${set}[${i}] has no focal point (${coverSlots.length} cover slot${coverSlots.length === 1 ? '' : 's'})`);
    }
  }

  /* ---- shared and template stock is never the client's work (2026-09-16) ---- */
  // R4 checks paths, so a stock photograph under /assets/_shared/ or /assets/_template/
  // passed it while the templates composed "<client> tree removal job, photo N" for it —
  // a claim the picture cannot back, read by screen readers and search engines
  // (docs/ALT-TEXT-ITEM.md). Every such entry must carry its own alt, and that alt must
  // not name the client. Demo records are held to it too: the demo is the sales copy.
  {
    const who = String(record.name ?? '').trim().toLowerCase();
    for (const [set, list] of Object.entries(record.photos ?? {})) {
      (list ?? []).forEach((ph, i) => {
        if (!/\/assets\/_(shared|template)\//.test(String(ph?.src ?? ''))) return;
        const alt = String(ph?.alt ?? '').trim();
        if (!alt) fails.push(`${slug}: photos.${set}[${i}] is shared stock (${ph.src.split('/').pop()}) with no alt — the templates would compose one naming the client`);
        else if (who && alt.toLowerCase().includes(who)) fails.push(`${slug}: photos.${set}[${i}] is shared stock but its alt names the client: "${alt}"`);
      });
    }
  }

  /* ---- explicit slot assignments (Phase 1b) ---- */
  // Three things a record with `photoSlots` can get wrong that nothing else would catch:
  // an assignment naming a photograph that is not in the library, a wired template whose
  // slot resolves to nothing at all, and a live client with a Replace-grade photograph in
  // a slot. The first is a broken record; the second hides a section; the third is what
  // the audit exists to stop shipping.
  const library = new Set();
  for (const list of Object.values(record.photos ?? {})) for (const ph of list ?? []) if (ph?.src) library.add(photoId(ph));

  for (const [tpl, map] of Object.entries(record.photoSlots ?? {})) {
    if (excluded.has(tpl)) continue;
    if (!PLACEMENT[tpl]) { fails.push(`${slug}: photoSlots.${tpl} is not a template that takes photographs`); continue; }
    const keys = new Set();
    const openEnded = new Set();
    for (const slot of PLACEMENT[tpl]) {
      // An 'all' slot has as many cells as the set has photographs, so its key space is
      // data-dependent: `rail.4` is legal on a client with four, illegal on one with two,
      // and the count changes as photographs are added. Accept any positive index and let
      // the resolver ignore one past the end, rather than failing a publish on arithmetic.
      // A fixed-count slot with more than one cell is open-ended too: the resolver lets an
      // explicit key past `cells` ADD a cell (removal-a's five-cell mosaic closes at six on
      // J Valdez), so `mosaic.6` is a real assignment, not a typo. Single-cell slots keep
      // their one bare key.
      if (slot.cells === 'all' || slot.cells > 1) { openEnded.add(slot.id); continue; }
      for (let i = 0; i < slot.cells; i++) keys.add(cellKey(slot, i));
    }
    for (const [key, id] of Object.entries(map ?? {})) {
      const m = /^(.+)\.(\d+)$/.exec(key);
      const open = m && openEnded.has(m[1]) && Number(m[2]) >= 1;
      if (!keys.has(key) && !open) { fails.push(`${slug}: photoSlots.${tpl}.${key} is not a slot on ${tpl}`); continue; }
      // '' is DELIBERATELY EMPTY — the studio's "Remove from slot". Not a dangling id.
      if (id !== '' && !library.has(id)) fails.push(`${slug}: photoSlots.${tpl}.${key} points at ${id}, which is not in this client's photographs`);
    }
  }

  /* ---- what every wired template actually resolves to ---- */
  for (const tpl of Object.keys(PLACEMENT)) {
    if (excluded.has(tpl)) continue;
    for (const cell of templateCells(record, tpl)) {
      if (!cell.photo) continue;
      const slot = PLACEMENT[tpl].find((s) => s.id === cell.slotId);
      const meta = slotById(tpl, cell.slotId);
      if (!meta) continue;
      const need = MASTERS[meta.master].min[0];
      const st = photoStatus(cell.photo, need);
      if (st && st.kind === 'replace') {
        const where = `${tpl}/${cell.slotId}${slot && slot.cells !== 1 ? ` cell ${cell.index + 1}` : ''}`;
        const legacyHere = !(cell.photo.pipeline && Number(cell.photo.pipeline.version) >= 2);
        const msg = `${slug}: ${where} resolves to a Replace photo — ${st.reason}`;
        // The existing legacy allowance holds: every photograph on both live clients
        // predates the contract, and failing them would block every publish.
        if (demo || (legacyHere && !STRICT_LEGACY)) warns.push(msg);
        else fails.push(msg);
      }
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
