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
import { resolvePlacement } from '../../lib/placement';

/** The lead form's id. Both scroll-to-form CTAs link to it; the form owns it. */
export const FORM_ANCHOR = 'ta-estimate-form';

export interface PhotoSlots {
  hero: PhotoSet[];
  gallery: PhotoSet[];
  grid: PhotoSet[];
  /** A client photo set may contain an .mp4; an <img> pointed at one is a broken image. */
  video: PhotoSet | null;
}

export function photoSlots(client: ResolvedClient): PhotoSlots {
  // Which photographs, and in what order, is placement (lib/placement.ts) — the hero band
  // takes two, the gallery the first half of the rest, the grid the second half, and the
  // grid stays empty below MIN_TO_SPLIT. The video is not placed by position.
  const p = resolvePlacement(client, 'trimming-a');
  const keep = (id: string) => (p.get(id)?.photos ?? []).filter((x): x is PhotoSet => x !== null);
  return {
    hero: keep('hero-band'),
    gallery: keep('gallery'),
    grid: keep('grid'),
    video: partitionMedia(photosFor(client, 'trimming')).videos[0] ?? null,
  };
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
