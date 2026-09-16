/**
 * PHOTO PLACEMENT — the one place that decides which photograph lands in which slot.
 *
 * Before this file the rule lived in three places that disagreed: each template's own
 * array slicing, the English `source.pick` strings in templates/imageSlots.mjs, and
 * slotsForPhoto()'s regexes over those strings. Stage 1 found four discrepancies between
 * them, including a contract that told clients storm "never falls back to trimming" when
 * it does, and a studio that hid the hero plate of a live ad page (docs/BUILD-LOG.md,
 * Phase 1b).
 *
 * DEPENDENCY DIRECTION, on purpose: this module is small and imported BY
 * templates/imageSlots.mjs, never the other way round. The contract adds prose, measured
 * boxes and client-facing instructions on top of these facts; none of that may reach the
 * public bundle. Templates import only this.
 *
 * Placement resolves at prerender. Nothing here is a runtime decision.
 */

/** @typedef {import('../schema/client').PhotoSet} PhotoSet */
/** @typedef {import('../schema/resolve').ResolvedClient} ResolvedClient */
/** @typedef {import('./photos').ServiceKey} ServiceKey */
import { partitionMedia, photosFor } from './photos.mjs';

/** A photo's stable identity. Every src already carries a content hash, so no migration. */
export const photoId = (p) => p.id ?? p.src;

/**
 * How a slot chooses from its set.
 *  first        the first still
 *  nth(n)       the nth still, 0-based, falling back to the first
 *  range(a,b)   stills a..b-1
 *  firstN(n)    the first n stills
 *  lastN(n)     the last n — NOTE: over the RAW list, videos included, because that is
 *               what Services.tsx does today and changing it would move a live page.
 *  all          every still
 *  middleShare  trimming-a's gallery: after the hero takes 2, the first half of the rest
 *  theRest      trimming-a's grid: the second half, only when the rest is 6 or more
 *  lastStill    storm's side photo: the LAST still. The contract's prose said
 *               "the photo after the tiles (7th), or the last"; the template has always
 *               said all[all.length - 1]. The code is the truth.
 *  nthStrict    the nth still and nothing if it is missing (the hybrids)
 *  firstNLessVideo  n stills, one fewer when the set carries a video (removal-b)
 */


/**
 * Every slot that draws a client PHOTOGRAPH, per template. Logos, section-art plates and
 * the desktop hero washes are not here: they are not fed from a photo set by position.
 */
export const PLACEMENT = {
  'removal-a': [
    { id: 'hero-plate', set: 'removal', pick: { kind: 'first' }, cells: 1,
      sizes: '100vw', defaultPosition: '50% 35%' },
    { id: 'hero-proof', set: 'removal', pick: { kind: 'range', from: 1, to: 3 }, cells: 2,
      sizes: '(max-width: 767px) 90vw, (max-width: 1023px) 45vw, 38vw' },
    { id: 'mosaic', set: 'generic', pick: { kind: 'firstN', n: 5 }, mode: 'direct-then-cascade', cells: 5,
      sizes: '(max-width: 767px) 90vw, (max-width: 1023px) 60vw, 76vw' },
    { id: 'longform', set: 'removal', pick: { kind: 'nth', n: 1 }, cells: 1,
      sizes: '(max-width: 1023px) 90vw, 31vw' },
    { id: 'rail', set: 'removal', pick: { kind: 'all' }, cells: 'all',
      sizes: '(max-width: 767px) 65vw, (max-width: 1023px) 70vw, 40vw' },
    { id: 'service-photo', set: 'removal', pick: { kind: 'lastN', n: 3 }, cells: 3,
      sizes: '(max-width: 1023px) 90vw, 24vw' },
    // The Benefits side photo. It shipped as TEMPLATE ARTWORK on every client's removal-a,
    // but the "artwork" is a re-encode of a Texas Tree Tops job photograph (the removal
    // source manifest attributes it to /assets/texas-tree-tops/benefit-strip-art-…); it
    // was filed under _template/ so the R4 guard, which checks paths, would pass. On
    // J Valdez's live page it presented TTT's crew as J Valdez's. `template-default` keeps
    // the artwork where nothing is assigned — so no page moves that was not asked to —
    // and lets a client's own photograph replace it by explicit assignment.
    { id: 'benefits', set: 'removal', pick: { kind: 'none' }, mode: 'template-default', cells: 1,
      sizes: '(max-width: 1023px) 90vw, 34vw' },
  ],
  'removal-b': [
    { id: 'hero-wash', set: 'removal', pick: { kind: 'first' }, cells: 1, sizes: '100vw' },
    { id: 'tile', set: 'removal', pick: { kind: 'firstNLessVideo', n: 7 }, cells: 7,
      sizes: '(max-width: 767px) 45vw, (max-width: 1023px) 30vw, 76vw' },
    { id: 'scope', set: 'removal', pick: { kind: 'nth', n: 1 }, cells: 1,
      sizes: '(max-width: 1023px) 90vw, 32vw' },
  ],
  'removal-c': [
    { id: 'hero-wash', set: 'removal', pick: { kind: 'first' }, cells: 1, sizes: '100vw' },
    { id: 'work', set: 'removal', pick: { kind: 'firstN', n: 9 }, cells: 9,
      sizes: '(max-width: 767px) 45vw, (max-width: 1023px) 45vw, 26vw' },
    { id: 'longform', set: 'removal', pick: { kind: 'nthStrict', n: 1 }, cells: 1,
      sizes: '(max-width: 1023px) 90vw, 32vw' },
  ],
  'trimming-a': [
    { id: 'hero-band', set: 'trimming', pick: { kind: 'firstN', n: 2 }, cells: 2,
      sizes: '(max-width: 767px) 90vw, (max-width: 1023px) 44vw, 37vw' },
    // gallery = the "Recent jobs" square strip (Gallery.tsx); grid = the "Done clean,
    // done right" bento (DoneRight.tsx). Stage 3 had these two `sizes` swapped and
    // compensated by swapping the component calls — the numbers landed on the right
    // boxes, so the page was right, but the studio previewed each slot in the other's
    // box. Measured after the B6 bento rebuild: grid 350/740/716. The gallery became the
    // photo band under "How it works" (B9, option B): with five photos its lead cell is
    // 350 / 365 / 208, so the phone and tablet values rose from 78vw / 39vw.
    { id: 'gallery', set: 'trimming', pick: { kind: 'middleShare' }, cells: 'all',
      sizes: '(max-width: 767px) 90vw, (max-width: 979px) 45vw, 19vw' },
    { id: 'grid', set: 'trimming', pick: { kind: 'theRest' }, cells: 'all',
      sizes: '(max-width: 979px) 91vw, 50vw' },
    { id: 'longform', set: 'trimming', pick: { kind: 'nth', n: 1 }, cells: 1,
      sizes: '(max-width: 1023px) 90vw, 31vw' },
  ],
  'trimming-b': [
    { id: 'work', set: 'trimming', pick: { kind: 'firstN', n: 6 }, cells: 6,
      sizes: '(max-width: 767px) 43vw, (max-width: 1023px) 29vw, 22vw' },
    { id: 'standard', set: 'trimming', pick: { kind: 'nth', n: 1 }, cells: 1,
      sizes: '(max-width: 1023px) 90vw, 28vw' },
  ],
  'trimming-c': [
    { id: 'work', set: 'trimming', pick: { kind: 'firstN', n: 8 }, cells: 8,
      sizes: '(max-width: 767px) 44vw, (max-width: 1023px) 45vw, 19vw' },
    { id: 'longform', set: 'trimming', pick: { kind: 'nthStrict', n: 1 }, cells: 1,
      sizes: '(max-width: 1023px) 90vw, 31vw' },
  ],
  'storm-a': [
    { id: 'hero-wash', set: 'storm', cascade: ['storm', 'removal'], pick: { kind: 'first' }, cells: 1, sizes: '100vw' },
    { id: 'tile', set: 'storm', cascade: ['storm', 'removal'], pick: { kind: 'firstN', n: 6 }, cells: 6,
      sizes: '(max-width: 767px) 44vw, (max-width: 1023px) 30vw, 24vw' },
    { id: 'handle', set: 'storm', cascade: ['storm', 'removal'], pick: { kind: 'lastStill' }, cells: 1,
      sizes: '(max-width: 1023px) 90vw, 28vw' },
  ],
  agnostic: [
    { id: 'shot', set: 'generic', pick: { kind: 'all' }, cells: 'all',
      sizes: '(max-width: 767px) 44vw, (max-width: 1023px) 30vw, 24vw' },
  ],
};
PLACEMENT['storm-b'] = PLACEMENT['storm-a'];
PLACEMENT['storm-c'] = PLACEMENT['storm-a'];

/**
 * Templates whose sections actually READ this resolver. Auto-fill matches what every
 * template renders today, so the studio can show the slot list for all of them — but an
 * EXPLICIT assignment only reaches the page for a template in this set. Until a template
 * is wired, the studio says so and disables the controls rather than letting someone
 * assign a photo, save, publish, and see nothing change.
 *
 * All ten are wired as of Phase 1b Stage 3. The set is kept — and derived from PLACEMENT
 * rather than hardcoded — so a template added later is read-only until it is wired.
 */
export const RESOLVES_FROM_MAP = new Set(Object.keys(PLACEMENT));

/** trimming-a's gallery/grid split: after the hero takes 2, halve the rest — but only
 *  when the rest is 6 or more, otherwise the gallery takes everything and the grid is
 *  empty and self-hides (R5). */
const share = (count) => {
  const rest = count - 2;
  return rest >= 6 ? Math.ceil(rest / 2) : rest;
};

function applyPick(pick, stills, raw) {
  switch (pick.kind) {
    case 'first': return stills.slice(0, 1);
    case 'nth': return (stills[pick.n] ?? stills[0]) ? [stills[pick.n] ?? stills[0]] : [];
    // No fall back to the first: the hybrids render `gallery[1] && ...`, so a client with
    // a single photograph gets nothing here rather than the same photo twice.
    case 'nthStrict': return stills[pick.n] ? [stills[pick.n]] : [];
    case 'none': return [];
    case 'lastStill': return stills.length ? [stills[stills.length - 1]] : [];
    // removal-b's masonry gives the video a cell of its own, so the stills get one fewer.
    case 'firstNLessVideo': return stills.slice(0, raw.some((p) => p && p.kind === 'video') ? pick.n - 1 : pick.n);
    case 'range': return stills.slice(pick.from, pick.to);
    case 'firstN': return stills.slice(0, pick.n);
    // Deliberately the RAW list: Services.tsx slices photosFor() without partitioning.
    case 'lastN': return raw.slice(-pick.n);
    case 'all': return stills;
    case 'middleShare': return stills.slice(2, 2 + share(stills.length));
    case 'theRest': return stills.length - 2 >= 6 ? stills.slice(2 + share(stills.length)) : [];
  }
}


/**
 * Resolve one template's photo slots for one client.
 *
 * Auto-fill must reproduce what the templates did before this module existed, byte for
 * byte, so that records without `photoSlots` render unchanged. An explicit assignment in
 * `client.photoSlots[templateId]` overrides a single cell, keyed `slotId` for a one-cell
 * slot and `slotId.N` (1-based) otherwise.
 */
/**
 * The photographs a slot picks FROM, before the pick narrows them — the client's stills
 * for that slot's set, through whichever cascade the slot uses. Exposed because alt text
 * is composed from a photo's ordinal within that list ("photo 6 of the storm set"), and
 * recomputing the cascade at the call site is how it drifted in the first place.
 */
export function slotSource(client, templateId, slotId) {
  const slot = (PLACEMENT[templateId] ?? []).find((s) => s.id === slotId);
  if (!slot) return [];
  if (slot.mode === 'template-default') return [];
  if (slot.mode === 'direct-then-cascade') {
    const direct = partitionMedia(client.photos?.[slot.set] ?? []).stills;
    if (direct.length) return direct;
    return partitionMedia(photosFor(client, slot.set)).stills;
  }
  if (slot.cascade) {
    for (const key of slot.cascade) {
      const list = client.photos?.[key];
      if (list && list.length) {
        const s = partitionMedia(list).stills;
        if (s.length) return s;
      }
    }
    return [];
  }
  return partitionMedia(photosFor(client, slot.set)).stills;
}

export function resolvePlacement(client, templateId) {
  const slots = PLACEMENT[templateId] ?? [];
  const assigned = client.photoSlots?.[templateId] ?? {};
  const byId = new Map();
  for (const list of Object.values(client.photos ?? {})) for (const p of list ?? []) byId.set(photoId(p), p);

  const out = new Map();
  for (const slot of slots) {
    let auto;
    if (slot.mode === 'template-default') {
      auto = [];
    } else if (slot.mode === 'direct-then-cascade') {
      // The mosaic's quirk, reproduced: the direct read is NOT sliced by the pick.
      const direct = partitionMedia(client.photos?.[slot.set] ?? []).stills;
      const raw = photosFor(client, slot.set);
      auto = direct.length > 0 ? direct : applyPick(slot.pick, partitionMedia(raw).stills, raw);
    } else if (slot.cascade) {
      // A slot with its own cascade. Storm is the only one: storm -> removal, and NEVER
      // generic or trimming — a neatly-pruned trimming photo is off-message on a storm
      // page. It also SKIPS a set that holds only videos rather than rendering nothing,
      // which the general photosFor() does not do. Both behaviours are reproduced here
      // exactly; storm-a is a live ad page.
      let stills = [];
      for (const key of slot.cascade) {
        const list = client.photos?.[key];
        if (list && list.length) {
          const s = partitionMedia(list).stills;
          if (s.length) { stills = s; break; }
        }
      }
      auto = applyPick(slot.pick, stills, stills);
    } else {
      const raw = photosFor(client, slot.set);
      auto = applyPick(slot.pick, partitionMedia(raw).stills, raw);
    }

    // `cells` is the assignable key space, i.e. a MINIMUM — never a truncation. The
    // mosaic's direct read is deliberately unsliced, so a generic set of 23 must still
    // render 23 cells even though only 5 of them can carry an explicit assignment.
    // An explicit assignment past the end of a slot ADDS a cell: "put this photograph
    // in the sixth cell of the grid" has to be something a person can say, or a grid
    // with a hole in it can only be fixed by editing the template. True for an 'all'
    // slot and for a fixed-count one alike (removal-a's mosaic declares 5 and J Valdez's
    // Restoration grid closes at 6). Cells in between that nobody assigned stay empty,
    // and templates drop empty cells. No record without such a key changes.
    let explicitMax = 0;
    for (const key of Object.keys(assigned)) {
      const m = /^(.+)\.(\d+)$/.exec(key);
      if (m && m[1] === slot.id && assigned[key] !== '') explicitMax = Math.max(explicitMax, Number(m[2]));
    }
    const n = Math.max(slot.cells === 'all' ? auto.length : Math.max(slot.cells, auto.length), explicitMax);
    const photos = [];
    const source = [];
    for (let i = 0; i < n; i++) {
      const key = cellKey(slot, i);
      const explicit = assigned[key];
      // An assignment of '' means DELIBERATELY EMPTY — "remove from slot" in the studio.
      // Without it, clearing an assignment would just let auto-fill put the same photo
      // straight back, and the slot could never be emptied.
      if (explicit === '') { photos.push(null); source.push('explicit'); continue; }
      const hit = explicit ? byId.get(explicit) : undefined;
      photos.push(hit ?? auto[i] ?? null);
      source.push(hit ? 'explicit' : 'auto');
    }
    out.set(slot.id, { id: slot.id, photos, source });
  }
  return out;
}

/** The assignment key for one cell: `slotId` when the slot has one, else `slotId.N`. */
export function cellKey(slot, i) {
  return slot.cells === 1 ? slot.id : `${slot.id}.${i + 1}`;
}


/**
 * Every cell on one template, flattened into PAGE ORDER — which is the order the studio
 * shows them in, and the order "move up" and "move down" walk. Slots that consume the
 * whole set take no assignment keys: their order is the library's, reordered in place.
 */
export function templateCells(client, templateId) {
  const resolved = resolvePlacement(client, templateId);
  const out = [];
  for (const slot of PLACEMENT[templateId] ?? []) {
    const r = resolved.get(slot.id);
    if (!r) continue;
    r.photos.forEach((photo, index) => {
      out.push({
        slotId: slot.id,
        index,
        key: cellKey(slot, index),
        photo,
        source: r.source[index],
      });
    });
  }
  return out;
}

/** Convenience for a template that wants one slot's list without the map. */
export function slotPhotos(client, templateId, slotId) {
  return resolvePlacement(client, templateId).get(slotId)?.photos ?? [];
}

/** The `sizes` attribute for a slot. One source of truth; templates carry no literals. */
export function slotSizes(templateId, slotId) {
  return PLACEMENT[templateId]?.find((s) => s.id === slotId)?.sizes;
}

/**
 * Where an unframed photo sits in this slot — the template CSS's own default, declared so
 * the studio can preview exactly what the page renders. A photo WITH a focal point still
 * wins; this is only the fallback.
 */
export function slotPosition(templateId, slotId) {
  return PLACEMENT[templateId]?.find((s) => s.id === slotId)?.defaultPosition;
}

/**
 * PROSPECTIVE: which slots would a photograph at `index` of `set` feed, if the set had
 * `count` stills? Used at UPLOAD time, where there is no record entry yet — the pipeline
 * needs the slot minimum before it will accept the file.
 *
 * This replaces imageSlots.mjs's slotsForPhoto(), which re-parsed the contract's English
 * `pick` strings with regexes. One pick implementation now, queried two ways.
 */
export function slotsForPosition(set, index, count) {
  if (index < 0) return [];
  const fake = Array.from({ length: Math.max(count, index + 1) }, (_, i) => ({ src: `#${i}` }));
  const out = [];
  for (const [templateId, slots] of Object.entries(PLACEMENT)) {
    for (const slot of slots) {
      if (slot.source ? slot.source !== set : slot.set !== set) continue;
      const picked = applyPick(slot.pick, fake, fake);
      const at = picked.findIndex((p) => p && p.src === `#${index}`);
      if (at >= 0) out.push({ templateId, slotId: slot.id, index: at });
    }
  }
  return out;
}

/**
 * RETROSPECTIVE: every slot this photograph actually occupies on this client, following
 * the cascade and honouring explicit assignments.
 *
 * The positional query cannot answer this. It matched a slot only when the slot's declared
 * set equalled the photo's set, so on J Valdez — whose photographs live only in
 * photos.trimming — it reported the trimming slots and silently omitted removal-a's hero
 * plate, the photograph behind the headline on a LIVE ad page (docs/BUILD-LOG.md, 1b/1a).
 */
export function landingsFor(client, id, excluded) {
  const out = [];
  for (const templateId of Object.keys(PLACEMENT)) {
    if (excluded && excluded.has(templateId)) continue;
    for (const cell of templateCells(client, templateId)) {
      if (cell.photo && photoId(cell.photo) === id) {
        out.push({ templateId, slotId: cell.slotId, index: cell.index });
      }
    }
  }
  return out;
}
