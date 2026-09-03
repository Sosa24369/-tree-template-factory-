/**
 * Layout resolution — pure logic, no imports, plain JS on purpose.
 *
 * This file is imported by BOTH the TypeScript app (via layout.d.mts) and the Node
 * verifier scripts/verify-layout-lock.mjs, so there is exactly one implementation of
 * the rule that keeps the A/B controls intact. If it lived in .ts the verifier could
 * not run it without a build step, and two copies would drift.
 *
 * Resolution order (the contract, from docs/prompts/visual-editor-build.md §1):
 *   1. start from the manifest order;
 *   2. reorder by the client's `sections` array, ignoring ids not in the manifest;
 *   3. append any manifest ids the client omitted, in manifest order;
 *   4. force hidden:false on required sections;
 *   5. drop `sizes` keys that are not manifest ids or not a SizeToken.
 * A missing, empty or malformed layout resolves to the manifest defaults and reports a
 * warning — never an error, never a crash (R5).
 */

export const SIZE_TOKENS = Object.freeze(['S', 'M', 'L', 'full']);

/** @param {unknown} v */
const isSizeToken = (v) => typeof v === 'string' && SIZE_TOKENS.includes(v);

/**
 * @param {ReadonlyArray<{id:string,label:string,required:boolean,defaultSize:string}>} manifest
 * @param {unknown} clientLayout   raw value of client.layout[templateId], may be anything
 * @param {{ locked?: boolean }} [opts]  locked = this is a control (-a) template
 * @returns {{ sections: Array<{id:string,hidden:boolean,size:string,required:boolean}>, warnings: string[] }}
 */
export function resolveLayout(manifest, clientLayout, opts = {}) {
  const warnings = [];
  const byId = new Map(manifest.map((s) => [s.id, s]));

  const defaults = () =>
    manifest.map((s) => ({ id: s.id, hidden: false, size: s.defaultSize, required: !!s.required }));

  // Controls: the layout is ignored wholesale so the A/B test stays valid (R2).
  if (opts.locked) {
    if (clientLayout != null) {
      warnings.push('layout is ignored on a control (-a) template so the A/B test stays valid');
    }
    return { sections: defaults(), warnings };
  }

  if (clientLayout == null) return { sections: defaults(), warnings };

  if (typeof clientLayout !== 'object' || Array.isArray(clientLayout)) {
    warnings.push('layout is not an object — using template defaults');
    return { sections: defaults(), warnings };
  }

  const rawSections = Array.isArray(clientLayout.sections) ? clientLayout.sections : null;
  const rawSizes =
    clientLayout.sizes && typeof clientLayout.sizes === 'object' && !Array.isArray(clientLayout.sizes)
      ? clientLayout.sizes
      : {};

  if (rawSections === null && clientLayout.sections !== undefined) {
    warnings.push('layout.sections is not an array — using template order');
  }

  // 2 + 3: client order first, unknown ids dropped, omitted ids appended.
  const seen = new Set();
  const ordered = [];
  let unknown = 0;
  for (const entry of rawSections ?? []) {
    const id = entry && typeof entry === 'object' ? entry.id : entry;
    if (typeof id !== 'string' || !byId.has(id)) { unknown++; continue; }
    if (seen.has(id)) continue;
    seen.add(id);
    const hidden = entry && typeof entry === 'object' ? entry.hidden === true : false;
    ordered.push({ id, hidden });
  }
  if (unknown) warnings.push(`layout.sections had ${unknown} id(s) not in this template's manifest — ignored`);

  for (const s of manifest) {
    if (!seen.has(s.id)) ordered.push({ id: s.id, hidden: false });
  }

  // 4 + 5
  let forced = 0;
  let badSizes = 0;
  const sections = ordered.map(({ id, hidden }) => {
    const def = byId.get(id);
    const required = !!def.required;
    if (required && hidden) { forced++; hidden = false; }
    const size = isSizeToken(rawSizes[id]) ? rawSizes[id] : def.defaultSize;
    return { id, hidden, size, required };
  });
  for (const [k, v] of Object.entries(rawSizes)) {
    if (!byId.has(k) || !isSizeToken(v)) badSizes++;
  }
  if (forced) warnings.push(`${forced} required section(s) were marked hidden — ignored`);
  if (badSizes) warnings.push(`${badSizes} layout.sizes entr${badSizes === 1 ? 'y' : 'ies'} ignored (unknown id or not S/M/L/full)`);

  return { sections, warnings };
}

/** True if this template id is an A/B control whose layout must never change. */
export function isControlTemplate(templateId) {
  return typeof templateId === 'string' && /-a$/.test(templateId);
}
