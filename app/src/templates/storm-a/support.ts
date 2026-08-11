/**
 * storm — non-component helpers (kept out of sections/shared.tsx so React Fast
 * Refresh stays happy: a module that exports both components and plain functions
 * trips the lint rule that enforces the split).
 *
 * There is no bundled template artwork to point at — every texture in storm is a
 * gradient, a mask or an inline SVG, and every PHOTOGRAPH comes from the client
 * record — so there is no image list to keep honest here.
 */

import type { PhotoSet } from '../../schema/client';
import type { ResolvedClient } from '../../schema/resolve';
import { partitionMedia } from '../../lib/photos';

/**
 * Storm imagery for this client, stills only, in record order.
 *
 * DELIBERATELY NARROWER than lib/photos' cascade. The general cascade would fall
 * back storm -> generic -> removal -> trimming; on a storm page a neatly-pruned
 * trimming photo is off-message, so this prefers the client's storm set and then
 * their removal set (storm work and removals read the same visually) and otherwise
 * returns nothing. A client with no storm/removal photography gets an art-free hero
 * and no gallery — never another service's imagery, and never another client's.
 */
export function stormStills(client: ResolvedClient, limit?: number): PhotoSet[] {
  for (const key of ['storm', 'removal'] as const) {
    const list = client.photos?.[key];
    if (list && list.length) {
      const { stills } = partitionMedia(list);
      if (stills.length) return typeof limit === 'number' ? stills.slice(0, limit) : stills;
    }
  }
  return [];
}

/**
 * Alt text for a client photograph that arrived without any. The client's own
 * PhotoSet.alt always wins; this fallback is COMPOSED from client.name at render
 * time rather than written into the template, because a literal alt string would
 * hardcode a company — exactly what R1 forbids.
 */
export function altFor(clientName: string, n: number): string {
  const who = (clientName || '').trim();
  return who ? `${who} storm damage cleanup, photo ${n}` : `Storm damage cleanup, photo ${n}`;
}

/** Same photo, different alt. PhotoSet is data — never mutate the record's copy. */
export function withAlt(source: PhotoSet, alt: string): PhotoSet {
  return { ...source, alt };
}

/**
 * url() is a CSS grammar, not a string: a quote, bracket or backslash in the value
 * would close the function early. The hero hands a client photo path to CSS as a
 * custom property, so it is escaped here before it gets there.
 */
export function cssUrl(src: string): string {
  return `url("${src.replace(/["'()\\\s]/g, encodeURIComponent)}")`;
}
