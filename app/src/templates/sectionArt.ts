/**
 * SECTION BACKGROUND PLATES — the decorative photographs a template paints in CSS.
 *
 * These are not content images. They sit behind a heavy tint scrim (88–94% on the
 * light sections, 84–92% on the dark ones), they carry no information, and they are
 * painted as `background-image`, not `<img>` — so they have no alt text and are not
 * announced. That is correct: an alt on a decorative plate is noise in a screen
 * reader. The editor says so rather than offering an alt field that would do nothing.
 *
 * WHY THIS EXISTS. removal-a's five plates were hard-coded to the CONTROL CLIENT's
 * own photograph files, because the extracted source page paints them there. The
 * stylesheet is shared by every page, so every removal-a page has painted that
 * client's photographs since P1 — including other paying clients' pages. R4 cannot
 * see it: the URLs are in the bundled CSS, not in any page's HTML.
 *
 * The fix is for the plate to be DATA, like every other per-client image. Each slot
 * is a CSS custom property with the historical file as its fallback, so:
 *   - a client who sets nothing renders byte-identically to before (verified by
 *     comparing computed styles, not by assertion), and
 *   - a client who sets one gets their own photograph.
 *
 * A client record supplies these as `sectionArt[templateId][slot]`.
 */

import type { PhotoSet, TemplateId } from '../schema/client';

export interface ArtSlot {
  /** Stable key in the client record. */
  id: string;
  /** What a person calls this band of the page. */
  label: string;
  /** The CSS custom property the template emits for it. */
  cssVar: string;
  /** How heavily it is veiled, so the editor can say a busy photo is fine here. */
  note: string;
}

export const SECTION_ART: Partial<Record<TemplateId, ArtSlot[]>> = {
  'removal-a': [
    { id: 'why', label: 'Why choose us — band behind the text', cssVar: '--ra-art-why', note: 'Veiled at ~90% by a light scrim. Almost any photo works; texture reads, detail does not.' },
    { id: 'services', label: 'Services list — band behind the cards', cssVar: '--ra-art-services', note: 'Veiled at ~92% by a light scrim.' },
    { id: 'marquee', label: 'Service-area marquee strip', cssVar: '--ra-art-marquee', note: 'A thin strip, unveiled and edge-masked. The only slot where the photo is really visible — keep it low-contrast or the city names get lost.' },
    { id: 'ready', label: 'Mid-page CTA band', cssVar: '--ra-art-ready', note: 'Veiled at ~87% by a dark scrim; white text sits on top.' },
    { id: 'final', label: 'Final CTA band', cssVar: '--ra-art-final', note: 'Veiled at ~89% by a dark scrim; white text sits on top.' },
  ],
};

/**
 * The inline CSS custom properties for one client × one template.
 * Emits ONLY the slots the client has actually set, so a record with no `sectionArt`
 * produces no style properties at all and the stylesheet's own fallback applies.
 */
export function sectionArtVars(
  client: { sectionArt?: Partial<Record<TemplateId, Record<string, PhotoSet>>> },
  templateId: TemplateId
): Record<string, string> {
  const slots = SECTION_ART[templateId];
  if (!slots) return {};
  const set = client.sectionArt?.[templateId];
  if (!set) return {};
  const out: Record<string, string> = {};
  for (const slot of slots) {
    const src = set[slot.id]?.src?.trim();
    // A url() token, not a bare path: the CSS declaration is `background-image:
    // …, var(--ra-art-why, url('…'))`, so the value substituted has to be a
    // complete image. Quoted so a filename with an odd character cannot break out.
    if (src) out[slot.cssVar] = `url("${src.replace(/"/g, '%22')}")`;
  }
  return out;
}
