/**
 * removal-a — TEMPLATE ARTWORK.
 *
 * Every path here is a SELF-HOSTED file under /public/assets, transcribed from
 * source/removal/assets.manifest.json. Nothing in this template ever points at
 * images.leadconnectorhq.com or assets.cdn.filesafe.space — the whole reason the
 * assets were pulled down and hashed in P1.
 *
 * WHY THESE LITERALS LIVE HERE AND NOT IN A COMPONENT (R1)
 * -------------------------------------------------------
 * R1 bans client-specific values *inside components*: phone numbers, city names,
 * client names, colours, logo paths, review text. None of those are here. What IS
 * here is the control's locked artwork — the images are part of the A/B control
 * exactly the way the copy is (R2: copy and images locked, design free). They are
 * the template's DEFAULT art, and they are the fallback, not the mandate:
 *
 *   - the S2 gallery uses `client.photos.removal` when the client record has any,
 *     and only falls back to `galleryDefaults` when it does not;
 *   - the S5 grid uses `client.photos.generic` the same way;
 *   - the logo is NEVER taken from here. It is always `client.brand.logoUrl`
 *     through <SafeLogo/>, so the manifest's two logo entries are deliberately
 *     unused.
 *
 * DIMENSIONS
 * ----------
 * Every width/height below is the MEASURED intrinsicWidth/intrinsicHeight from the
 * manifest, never a guess. They become real width/height attributes via <SafeImage/>,
 * which is what keeps CLS at zero. Where the manifest measured nothing (the SVG
 * icons), the value stays null and the CSS gives the element a fixed box instead —
 * P0 found 33 fabricated dimension pairs in the source and we do not reintroduce them.
 *
 * MANIFEST ENTRIES DELIBERATELY NOT USED
 * --------------------------------------
 *   hdr-logo-desktop, logo-mobile-and-footer  → logo comes from client.brand.logoUrl
 *   hdr-badge-desktop                         → the manifest files this under role
 *                                               "other", but open it and it is the
 *                                               control client's circular LOGO badge
 *                                               with a THIRD phone number, (817)
 *                                               607-3485, baked into the artwork.
 *                                               Logos come from client.brand.logoUrl
 *                                               (R1), and a number inside a JPEG can
 *                                               never be swapped by CallRail and can
 *                                               never be attributed. Not rendered.
 *   gallery-06                                → src is null (HTTP 403 at capture time)
 *   form-email-envelope-icon, city-pill-map-pin → inline SVG in the source; inlined here
 *   cta-arrow-glyph, faq-accordion-indicator  → decorative glyphs, inlined as CSS masks
 *                                               and inline SVG so they take the brand
 *                                               colour and cost zero requests
 *   process-art (312×3832)                    → a vertical connector graphic that only
 *                                               makes sense in the source's stacked
 *                                               layout; this template draws the step
 *                                               connector in CSS
 *   DEAD-leaf-left / DEAD-leaf-right          → section: null in the manifest. Dead in
 *                                               the source, dead here.
 */

import type { PhotoSet } from '../../schema/client';

/** Manifest row → PhotoSet. Alt is filled in at render time (see altFor). */
function photo(src: string, width: number | null, height: number | null): PhotoSet {
  return { src, alt: '', width, height };
}

/** The one manifest entry whose kind is "video" (S2, gallery-01). */
export interface TemplateVideo {
  src: string;
  /** No poster frame was captured for this clip; the field exists so one can be added. */
  poster: string | null;
  width: number;
  height: number;
}

/* ------------------------------------------------------------------ *
 * S1 — Header + Hero + Lead Form
 * ------------------------------------------------------------------ */

/** LCP element. Rendered eager + fetchPriority="high". */

/** The band that closes the hero. Lazy — it sits below the fold on a phone. */

/* ------------------------------------------------------------------ *
 * S2 — Recent jobs
 * ------------------------------------------------------------------ */

/* ------------------------------------------------------------------ *
 * S3 — Benefit strip
 * ------------------------------------------------------------------ */

export const benefitArt = photo('/assets/_template/removal-a/benefit-strip-art-0ec53c98.webp', 1200, 1200);

/** SVGs — the manifest measured no intrinsic size, so the CSS fixes the box.
 *  These are brand-neutral template glyphs and live in the shared template-assets
 *  folder, NOT in any client's folder — so removal-a does not depend on a particular
 *  client's directory and no client's page references another client's path (R4). */
export const benefitIcons: PhotoSet[] = [
  photo('/assets/_shared/benefit-icon-1-dbb86f4d.svg', null, null),
  photo('/assets/_shared/benefit-icon-2-6710e15b.svg', null, null),
  photo('/assets/_shared/benefit-icon-3-8423c543.svg', null, null),
  photo('/assets/_shared/benefit-icon-4-2b31db6c.svg', null, null),
];

/* ------------------------------------------------------------------ *
 * S4 — Why choose us + reviews
 * ------------------------------------------------------------------ */

export const reviewStars = photo('/assets/_shared/review-stars-d682e417.svg', null, null);
export const reviewGoogle = photo('/assets/_shared/review-google-glyph-9b63bd0b.svg', null, null);

/* ------------------------------------------------------------------ *
 * S5 — Restoration results
 * ------------------------------------------------------------------ */

/* ------------------------------------------------------------------ *
 * S6 — Services we offer
 * ------------------------------------------------------------------ */

/* ------------------------------------------------------------------ *
 * The five CSS background photographs (S4, S6, S7, S9, S12) are painted from
 * removal-a.css, exactly as the source paints them — see the "background plates"
 * block in that file for the same five local paths.
 * ------------------------------------------------------------------ */

/**
 * Alt text for the template's own artwork.
 *
 * The manifest's alt strings name the control client and a city ("Texas Tree Tops
 * tree removal in Fort Worth"), so copying them into the template would hardcode a
 * client name and a city — exactly what R1 forbids. Instead the alt is composed
 * from client data at render time, and a client that supplies its own photos
 * supplies its own alt with them (PhotoSet.alt).
 */
export function altFor(clientName: string, n: number): string {
  const who = (clientName || '').trim();
  return who ? `${who} tree removal job, photo ${n}` : `Tree removal job, photo ${n}`;
}

/** Same photo, different alt — PhotoSet is data, so never mutate the module copy. */
export function withAlt(source: PhotoSet, alt: string): PhotoSet {
  return { ...source, alt };
}
