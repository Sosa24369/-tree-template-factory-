/**
 * LAYOUT LOCK — the rule that keeps the A/B controls intact, enforced by a script,
 * not a sentence.
 *
 * For every client record and every -a template: set a deliberately reordered layout
 * in memory, resolve it, and assert the resolved order is STILL the manifest order
 * and that a warning was raised. Also asserts the four R5 layout fixtures resolve to
 * exactly the behaviour the schema promises.
 *
 * Runs the SAME resolveLayout the app uses (src/schema/layout.mjs) — one implementation.
 *
 * Usage: node scripts/verify-layout-lock.mjs      (exit 1 on any failure)
 */
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { resolveLayout, isControlTemplate } from '../app/src/schema/layout.mjs';
import { MANIFESTS } from '../app/src/templates/manifests.mjs';

const ROOT = new URL('..', import.meta.url).pathname;
const CLIENTS = join(ROOT, 'clients');
const failures = [];
const passes = [];

const controls = Object.keys(MANIFESTS).filter(isControlTemplate);
const clients = readdirSync(CLIENTS).filter((f) => f.endsWith('.json'))
  .map((f) => ({ file: f, data: JSON.parse(readFileSync(join(CLIENTS, f), 'utf8')) }));

/* ---- 1. Every -a template ignores any layout, for every client ---- */
let checked = 0;
for (const { file } of clients) {
  for (const id of controls) {
    const manifest = MANIFESTS[id];
    const reversed = { sections: [...manifest].reverse().map((s) => ({ id: s.id, hidden: !s.required })), sizes: Object.fromEntries(manifest.map((s) => [s.id, 'full'])) };
    const { sections, warnings } = resolveLayout(manifest, reversed, { locked: true });
    const same = sections.map((s) => s.id).join(',') === manifest.map((s) => s.id).join(',');
    const untouched = sections.every((s, i) => !s.hidden && s.size === manifest[i].defaultSize);
    if (!same || !untouched) failures.push(`LOCK  ${file} ${id}: a client layout changed a control's order/visibility/size`);
    else if (!warnings.some((w) => /control/.test(w))) failures.push(`LOCK  ${file} ${id}: layout was ignored but no warning was raised`);
    checked++;
  }
}
if (!failures.length) passes.push(`LAYOUT LOCK PASS: ${controls.length} -a templates unchanged across ${clients.length} client records (${checked} checks)`);

/* ---- 2. Non-controls DO honour a layout ---- */
{
  const m = MANIFESTS['trimming-b'];
  const ids = m.filter((s) => !s.required).map((s) => s.id);
  const swapped = { sections: [{ id: ids[1] }, { id: ids[0], hidden: true }], sizes: { [ids[2]]: 'full' } };
  const { sections } = resolveLayout(m, swapped, { locked: false });
  const nonReq = sections.filter((s) => !s.required);
  const ok = nonReq[0].id === ids[1] && nonReq[1].id === ids[0] && nonReq[1].hidden && sections.find((s) => s.id === ids[2]).size === 'full';
  ok ? passes.push('UNLOCKED  trimming-b honours reorder, hide and size') : failures.push('UNLOCKED  trimming-b did not honour a valid layout');
}

/* ---- 3. The four R5 fixtures ---- */
const fx = (name) => JSON.parse(readFileSync(join(CLIENTS, '_fixtures', `${name}.json`), 'utf8'));
const expect = (cond, msg) => (cond ? passes.push(`FIXTURE  ${msg}`) : failures.push(`FIXTURE  ${msg}`));
const TB = MANIFESTS['trimming-b'];
{ const r = resolveLayout(TB, fx('layout-missing').layout?.['trimming-b']);
  expect(r.warnings.length === 0 && r.sections.map((s) => s.id).join() === TB.map((s) => s.id).join(), 'layout-missing -> manifest defaults, no warning'); }
{ const r = resolveLayout(TB, fx('layout-empty').layout['trimming-b']);
  expect(r.sections.length === TB.length && r.sections.every((s) => !s.hidden), 'layout-empty -> manifest defaults'); }
{ const r = resolveLayout(TB, fx('layout-unknown-ids').layout['trimming-b']);
  const ids = r.sections.map((s) => s.id);
  expect(!ids.includes('not-a-real-section') && ids[0] === 'faq' && ids[1] === 'hero', 'layout-unknown-ids -> unknown id dropped, known order kept');
  expect(r.sections.find((s) => s.id === 'faq').hidden === true, 'layout-unknown-ids -> faq hidden as requested');
  expect(r.sections.find((s) => s.id === 'faq').size === TB.find((s) => s.id === 'faq').defaultSize, 'layout-unknown-ids -> size "XL" rejected, default kept');
  expect(r.sections.find((s) => s.id === 'work').size === 'L', 'layout-unknown-ids -> valid size "L" applied');
  expect(r.warnings.some((w) => /not in this template/.test(w)) && r.warnings.some((w) => /sizes/.test(w)), 'layout-unknown-ids -> warnings raised for ids and sizes'); }
{ const r = resolveLayout(TB, fx('layout-hides-required').layout['trimming-b']);
  const req = r.sections.filter((s) => s.required);
  expect(req.length === 3 && req.every((s) => !s.hidden), 'layout-hides-required -> header/footer/sticky forced visible');
  expect(r.sections.find((s) => s.id === 'reviews').hidden === true, 'layout-hides-required -> non-required "reviews" still hidden');
  expect(r.warnings.some((w) => /required/.test(w)), 'layout-hides-required -> warning raised');
  const rc = resolveLayout(MANIFESTS['removal-a'], fx('layout-hides-required').layout['removal-a'], { locked: true });
  expect(rc.sections[1].id === 'hero' && !rc.sections[1].hidden, 'layout-hides-required -> removal-a layout ignored (control lock)'); }

for (const p of passes) console.log('PASS  ' + p);
for (const f of failures) console.error('FAIL  ' + f);
console.log(failures.length ? `\n${failures.length} failure(s).` : `\nAll layout checks pass.`);
process.exit(failures.length ? 1 : 0);
