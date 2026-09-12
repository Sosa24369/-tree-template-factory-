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

import type { PhotoSet } from '../schema/client';
import type { ResolvedClient } from '../schema/resolve';
import { partitionMedia, photosFor, type ServiceKey } from './photos';

/** A photo's stable identity. Every src already carries a content hash, so no migration. */
export const photoId = (p: PhotoSet): string => p.id ?? p.src;

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
 *  afterTiles   storm's side photo: index 6, or the last still if there are fewer
 */
export type Pick =
  | { kind: 'first' }
  | { kind: 'nth'; n: number }
  | { kind: 'range'; from: number; to: number }
  | { kind: 'firstN'; n: number }
  | { kind: 'lastN'; n: number }
  | { kind: 'all' }
  | { kind: 'middleShare' }
  | { kind: 'theRest' }
  | { kind: 'afterTiles' };

export interface PlacementSlot {
  /** Stable within a template. Matches templates/imageSlots.mjs. */
  id: string;
  set: ServiceKey;
  pick: Pick;
  /**
   * `direct-then-cascade` reproduces removal-a's results mosaic exactly: it reads
   * client.photos.generic DIRECTLY — bypassing the cascade, and unsliced, so a generic
   * set of 23 renders 23 cells — and only falls back to the cascade with the pick applied.
   * Declared rather than tidied: tidying it would change a live page.
   */
  mode?: 'direct-then-cascade';
  /** How many cells the slot has, for explicit assignment keys. 'all' gets none. */
  cells: number | 'all';
  /**
   * The `sizes` attribute for this slot, so the browser picks a candidate that fits the
   * box it will actually be painted into. Stage 1 found these hand-written per template
   * and understating the real box by up to 4.82x — the hero plate declared 55vw and
   * renders at 100vw, so the browser fetched a quarter of the width it needed
   * (docs/BUILD-LOG.md, Phase 1b, H4). Derived from the measured boxes in
   * templates/imageSlots.mjs and rounded UP: overstating costs a slightly larger file,
   * understating costs a soft photograph, and only one of those is visible.
   */
  sizes: string;
  /**
   * `object-position` when the photo has no focal point. Declared ONLY where the
   * template's CSS differs from the 50% 50% initial value, so the studio's Frame preview
   * and the page cannot disagree about where an unframed photo sits — Stage 1's H2, a
   * 37 CSS px error on removal-a's desktop hero.
   */
  defaultPosition?: string;
}

/**
 * Every slot that draws a client PHOTOGRAPH, per template. Logos, section-art plates and
 * the desktop hero washes are not here: they are not fed from a photo set by position.
 */
export const PLACEMENT: Record<string, PlacementSlot[]> = {
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
  ],
  'removal-b': [
    { id: 'hero-wash', set: 'removal', pick: { kind: 'first' }, cells: 1, sizes: '100vw' },
    { id: 'tile', set: 'removal', pick: { kind: 'firstN', n: 6 }, cells: 6,
      sizes: '(max-width: 767px) 45vw, (max-width: 1023px) 30vw, 76vw' },
    { id: 'scope', set: 'removal', pick: { kind: 'nth', n: 1 }, cells: 1,
      sizes: '(max-width: 1023px) 90vw, 32vw' },
  ],
  'removal-c': [
    { id: 'hero-wash', set: 'removal', pick: { kind: 'first' }, cells: 1, sizes: '100vw' },
    { id: 'work', set: 'removal', pick: { kind: 'firstN', n: 9 }, cells: 9,
      sizes: '(max-width: 767px) 45vw, (max-width: 1023px) 45vw, 26vw' },
    { id: 'longform', set: 'removal', pick: { kind: 'nth', n: 1 }, cells: 1,
      sizes: '(max-width: 1023px) 90vw, 32vw' },
  ],
  'trimming-a': [
    { id: 'hero-band', set: 'trimming', pick: { kind: 'firstN', n: 2 }, cells: 2,
      sizes: '(max-width: 767px) 90vw, (max-width: 1023px) 44vw, 37vw' },
    { id: 'gallery', set: 'trimming', pick: { kind: 'middleShare' }, cells: 'all',
      sizes: '(max-width: 767px) 90vw, (max-width: 1023px) 60vw, 50vw' },
    { id: 'grid', set: 'trimming', pick: { kind: 'theRest' }, cells: 'all',
      sizes: '(max-width: 767px) 78vw, (max-width: 1023px) 39vw, 19vw' },
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
    { id: 'longform', set: 'trimming', pick: { kind: 'nth', n: 1 }, cells: 1,
      sizes: '(max-width: 1023px) 90vw, 31vw' },
  ],
  'storm-a': [
    { id: 'hero-wash', set: 'storm', pick: { kind: 'first' }, cells: 1, sizes: '100vw' },
    { id: 'tile', set: 'storm', pick: { kind: 'firstN', n: 6 }, cells: 6,
      sizes: '(max-width: 767px) 44vw, (max-width: 1023px) 30vw, 24vw' },
    { id: 'handle', set: 'storm', pick: { kind: 'afterTiles' }, cells: 1,
      sizes: '(max-width: 1023px) 90vw, 28vw' },
  ],
  agnostic: [
    { id: 'shot', set: 'generic', pick: { kind: 'all' }, cells: 'all',
      sizes: '(max-width: 767px) 44vw, (max-width: 1023px) 30vw, 24vw' },
  ],
};
PLACEMENT['storm-b'] = PLACEMENT['storm-a'];
PLACEMENT['storm-c'] = PLACEMENT['storm-a'];

/** trimming-a's gallery/grid split: after the hero takes 2, halve the rest — but only
 *  when the rest is 6 or more, otherwise the gallery takes everything and the grid is
 *  empty and self-hides (R5). */
const share = (count: number) => {
  const rest = count - 2;
  return rest >= 6 ? Math.ceil(rest / 2) : rest;
};

function applyPick(pick: Pick, stills: PhotoSet[], raw: PhotoSet[]): PhotoSet[] {
  switch (pick.kind) {
    case 'first': return stills.slice(0, 1);
    case 'nth': return (stills[pick.n] ?? stills[0]) ? [stills[pick.n] ?? stills[0]] : [];
    case 'range': return stills.slice(pick.from, pick.to);
    case 'firstN': return stills.slice(0, pick.n);
    // Deliberately the RAW list: Services.tsx slices photosFor() without partitioning.
    case 'lastN': return raw.slice(-pick.n);
    case 'all': return stills;
    case 'middleShare': return stills.slice(2, 2 + share(stills.length));
    case 'theRest': return stills.length - 2 >= 6 ? stills.slice(2 + share(stills.length)) : [];
    case 'afterTiles': {
      const p = stills[Math.min(6, stills.length - 1)];
      return p ? [p] : [];
    }
  }
}

export interface ResolvedSlot {
  id: string;
  /** One entry per cell, in page order. A hole is null — the section self-hides (R5). */
  photos: (PhotoSet | null)[];
  /** Per cell: was this an explicit assignment or auto-fill? */
  source: ('explicit' | 'auto')[];
}

/**
 * Resolve one template's photo slots for one client.
 *
 * Auto-fill must reproduce what the templates did before this module existed, byte for
 * byte, so that records without `photoSlots` render unchanged. An explicit assignment in
 * `client.photoSlots[templateId]` overrides a single cell, keyed `slotId` for a one-cell
 * slot and `slotId.N` (1-based) otherwise.
 */
export function resolvePlacement(client: ResolvedClient, templateId: string): Map<string, ResolvedSlot> {
  const slots = PLACEMENT[templateId] ?? [];
  const assigned = client.photoSlots?.[templateId] ?? {};
  const byId = new Map<string, PhotoSet>();
  for (const list of Object.values(client.photos ?? {})) for (const p of list ?? []) byId.set(photoId(p), p);

  const out = new Map<string, ResolvedSlot>();
  for (const slot of slots) {
    let auto: PhotoSet[];
    if (slot.mode === 'direct-then-cascade') {
      // The mosaic's quirk, reproduced: the direct read is NOT sliced by the pick.
      const direct = partitionMedia(client.photos?.[slot.set] ?? []).stills;
      const raw = photosFor(client, slot.set);
      auto = direct.length > 0 ? direct : applyPick(slot.pick, partitionMedia(raw).stills, raw);
    } else {
      const raw = photosFor(client, slot.set);
      auto = applyPick(slot.pick, partitionMedia(raw).stills, raw);
    }

    // `cells` is the assignable key space, i.e. a MINIMUM — never a truncation. The
    // mosaic's direct read is deliberately unsliced, so a generic set of 23 must still
    // render 23 cells even though only 5 of them can carry an explicit assignment.
    const n = slot.cells === 'all' ? auto.length : Math.max(slot.cells, auto.length);
    const photos: (PhotoSet | null)[] = [];
    const source: ('explicit' | 'auto')[] = [];
    for (let i = 0; i < n; i++) {
      const key = slot.cells === 1 ? slot.id : `${slot.id}.${i + 1}`;
      const explicit = slot.cells === 'all' ? undefined : assigned[key];
      const hit = explicit ? byId.get(explicit) : undefined;
      photos.push(hit ?? auto[i] ?? null);
      source.push(hit ? 'explicit' : 'auto');
    }
    out.set(slot.id, { id: slot.id, photos, source });
  }
  return out;
}

/** Convenience for a template that wants one slot's list without the map. */
export function slotPhotos(client: ResolvedClient, templateId: string, slotId: string): (PhotoSet | null)[] {
  return resolvePlacement(client, templateId).get(slotId)?.photos ?? [];
}

/** The `sizes` attribute for a slot. One source of truth; templates carry no literals. */
export function slotSizes(templateId: string, slotId: string): string | undefined {
  return PLACEMENT[templateId]?.find((s) => s.id === slotId)?.sizes;
}

/**
 * Where an unframed photo sits in this slot — the template CSS's own default, declared so
 * the studio can preview exactly what the page renders. A photo WITH a focal point still
 * wins; this is only the fallback.
 */
export function slotPosition(templateId: string, slotId: string): string | undefined {
  return PLACEMENT[templateId]?.find((s) => s.id === slotId)?.defaultPosition;
}
