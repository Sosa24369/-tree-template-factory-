/**
 * Photograph selection — one rule for every template.
 *
 * A template must NEVER render one client's real job photographs on another
 * client's page. That is not a styling nit: those are photographs of actual work
 * at actual addresses, and putting Texas Tree Tops' removals on J Valdez's page
 * misrepresents both of them.
 *
 * So the cascade never falls back to the template's own default artwork for
 * PHOTOGRAPHIC content. It falls back within the client, and then to nothing —
 * and a section with nothing to show hides itself (R5).
 *
 * Template artwork (icons, glyphs, background plates, decorative textures) is a
 * different category and stays in the template: it is brand-neutral and is part
 * of the control's locked design.
 */

/** @typedef {import('../schema/client').PhotoSet} PhotoSet */
/** @typedef {import('../schema/resolve').ResolvedClient} ResolvedClient */
/** @typedef {'removal'|'trimming'|'storm'|'generic'} ServiceKey */

/**
 * Order to try when the requested service has no photos for this client.
 * EXPORTED since Phase 1b: lib/placement.mjs resolves slot placement on top of it, and
 * the studio and the image-spec guard must read the same cascade the page does.
 */
export const CASCADE = {
  removal: ['removal', 'generic', 'storm', 'trimming'],
  trimming: ['trimming', 'generic', 'removal', 'storm'],
  storm: ['storm', 'generic', 'removal', 'trimming'],
  generic: ['generic', 'removal', 'trimming', 'storm'],
};

/**
 * Photographs for this client and service, in preference order.
 * Returns [] when the client has none — callers must handle that by hiding the
 * section, not by substituting someone else's imagery.
 */
export function photosFor(client, service, limit) {
  for (const key of CASCADE[service]) {
    const list = client.photos?.[key];
    if (list && list.length) return typeof limit === 'number' ? list.slice(0, limit) : list;
  }
  return [];
}

/** True when this client has any photography at all. */
export function hasPhotos(client) {
  return Object.values(client.photos ?? {}).some((list) => (list?.length ?? 0) > 0);
}

/** Split out the video entries (the source "gallery" includes MP4s). */
export function partitionMedia(photos) {
  const videos = photos.filter((p) => p.kind === 'video');
  const stills = photos.filter((p) => p.kind !== 'video');
  return { videos, stills };
}
