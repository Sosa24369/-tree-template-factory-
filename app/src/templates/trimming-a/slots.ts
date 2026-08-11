/**
 * trimming-a — photo slots and the one in-page anchor.
 *
 * PHOTOGRAPHS ONLY EVER COME FROM THE CLIENT. `photosFor(client, 'trimming')` is
 * the single door, and it never falls back to another client's imagery or to
 * bundled photographic artwork — a client with no photographs gets no gallery and
 * no photo grid, and those sections say so by rendering nothing (R5).
 *
 * The source fills three photographic slots: two hero shots, a five-slide
 * before/after slider, and a five-photo "Done Clean, Done Right" grid. This module
 * hands each slot a DISJOINT slice, so nothing repeats when a client has enough
 * photographs, and every slot degrades to fewer (or none) when they do not:
 *
 *   12 photos → hero 2 · gallery 5 · grid 5     (the control client's set)
 *    7 photos → hero 2 · gallery 3 · grid 2
 *    5 photos → hero 2 · gallery 3 · grid 0     (grid section keeps copy + CTA)
 *    2 photos → hero 2 · gallery 0 · grid 0     (gallery section disappears)
 *    0 photos → every photographic slot empty
 *
 * The split point is proportional rather than fixed at five so a client with three
 * spare photographs does not get a one-slide "slider".
 */

import type { PhotoSet } from '../../schema/client';
import type { ResolvedClient } from '../../schema/resolve';
import { partitionMedia, photosFor } from '../../lib/photos';

/** The lead form's id. Both scroll-to-form CTAs link to it; the form owns it. */
export const FORM_ANCHOR = 'ta-estimate-form';

/** How many photographs the hero band takes before the rest are shared out. */
const HERO_SLOTS = 2;

/** Below this, the leftovers all go to the gallery and the grid stays empty. */
const MIN_TO_SPLIT = 6;

export interface PhotoSlots {
  hero: PhotoSet[];
  gallery: PhotoSet[];
  grid: PhotoSet[];
  /** A client photo set may contain an .mp4; an <img> pointed at one is a broken image. */
  video: PhotoSet | null;
}

export function photoSlots(client: ResolvedClient): PhotoSlots {
  const { videos, stills } = partitionMedia(photosFor(client, 'trimming'));
  const hero = stills.slice(0, HERO_SLOTS);
  const rest = stills.slice(HERO_SLOTS);
  const video = videos[0] ?? null;

  if (rest.length >= MIN_TO_SPLIT) {
    const half = Math.ceil(rest.length / 2);
    return { hero, gallery: rest.slice(0, half), grid: rest.slice(half), video };
  }
  return { hero, gallery: rest, grid: [], video };
}

/**
 * Alt text for a client photograph that arrived without any.
 *
 * It is composed from client.name at render time rather than written here, because
 * a literal company name or city in a template file is exactly what R1 forbids. A
 * client that supplies its own alt keeps it — see `withAlt`.
 */
export function altFor(clientName: string, n: number): string {
  const who = (clientName || '').trim();
  return who ? `${who} tree trimming job, photo ${n}` : `Tree trimming job, photo ${n}`;
}

/** Never mutate the record's PhotoSet; return a copy only when there is nothing to keep. */
export function withAlt(photo: PhotoSet | null | undefined, alt: string): PhotoSet | null {
  if (!photo) return null;
  return photo.alt?.trim() ? photo : { ...photo, alt };
}
