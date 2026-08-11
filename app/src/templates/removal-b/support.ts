/**
 * removal-b — non-component helpers.
 *
 * These live outside sections/shared.tsx for the same reason removal-a keeps its
 * helpers in assets.ts: a module that exports both components and plain functions
 * breaks React Fast Refresh, and the lint rule that enforces it is on.
 *
 * There is no assets.ts in this template because there is no template artwork to
 * point at. Every texture in removal-b is a gradient, a mask or an inline SVG, and
 * every PHOTOGRAPH comes from the client record through photosFor() — so there is
 * no bundled image list to keep honest.
 */

import type { PhotoSet } from '../../schema/client';

/**
 * Alt text for a client photograph that arrived without any.
 *
 * A client's own PhotoSet.alt always wins. This fallback is COMPOSED from
 * client.name at render time rather than written into the template, because a
 * literal alt string would hardcode a company and a city — which is exactly what
 * R1 forbids, and exactly what the source manifest's alt strings do.
 */
export function altFor(clientName: string, n: number): string {
  const who = (clientName || '').trim();
  return who ? `${who} tree removal job, photo ${n}` : `Tree removal job, photo ${n}`;
}

/** Same photo, different alt. PhotoSet is data — never mutate the record's copy. */
export function withAlt(source: PhotoSet, alt: string): PhotoSet {
  return { ...source, alt };
}

/**
 * url() is a CSS grammar, not a string: a quote, a bracket or a backslash inside
 * the value would close the function early. The hero hands a client photo path to
 * CSS as a custom property, so it is escaped here before it gets there.
 */
export function cssUrl(src: string): string {
  return `url("${src.replace(/["'()\\\s]/g, encodeURIComponent)}")`;
}
