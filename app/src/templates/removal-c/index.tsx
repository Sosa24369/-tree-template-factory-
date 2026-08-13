/**
 * removal-c — THE HYBRID: removal-a's exact copy in removal-b's design
 * direction, executed premium (Design Elevation 2026-08-12).
 *
 * WHAT WAS TAKEN FROM EACH PARENT
 *   - COPY: removal-a's, byte-identical (copy.defaults.ts re-exports the
 *     control's object; makeCopy inherits copyOverrides['removal-a'] so the
 *     source client's source-exact strings apply here too). Every section
 *     below renders CONTROL keys only — no new marketing copy exists in this
 *     template.
 *   - DESIGN: removal-b's language — the ink-and-brand layered palette
 *     (color-mix derivations from client.brand, zero literals), the text-led
 *     gradient hero whose H1 is the mobile LCP, the desktop-only CSS photo
 *     panel, layered cards and considered depth — then elevated: a larger
 *     display scale, more whitespace, the lead form beside the H1 (dominant
 *     above the fold on mobile), a record-composed trust strip, the shared
 *     reviews slider, and a sticky mobile call bar.
 *
 * WHERE THE PARENTS DISAGREED, THE RULES DECIDED
 *   - removal-b hides the offer until mid-page; the control's H1 IS the offer.
 *     Copy wins (it must be byte-identical), so the hero leads with the $300
 *     line set in -b's display voice — that tension is the hybrid's bet.
 *   - The trust strip renders ONLY facts from the client record (service area,
 *     review count) plus the control's own licensed-and-insured line
 *     (benefits.item3, verbatim copy). No years-in-business exists on the
 *     record, so no such chip exists here.
 *
 * PERFORMANCE (the law: ≥98 / LCP ≤2.0s / CLS 0, applied throttling)
 *   - No webfont, no library, no carousel script (the slider is scroll-snap).
 *   - Mobile hero is colour + type; the only above-fold image is the header
 *     logo (preloaded by the prerender for non-photo-LCP templates).
 *   - The desktop hero photograph is a CSS custom property consumed only
 *     inside a min-width media query — phones never fetch it.
 *   - Below-fold photos are <DeferredImage> (reserved boxes, CLS 0).
 */

import { useEffect, type CSSProperties } from 'react';
import { makeCopy, type ResolvedClient } from '../../schema/resolve';
import { removalCCopy } from './copy.defaults';
import { RemovalCPage } from './page';
import './removal-c.css';

export function RemovalC({ client }: { client: ResolvedClient }) {
  const copy = makeCopy(client, 'removal-c', removalCCopy, 'removal-a');

  const title = copy('meta.title');
  const description = copy('meta.description');

  useEffect(() => {
    if (title) document.title = title;
    if (!description) return;
    let tag = document.querySelector<HTMLMetaElement>('meta[name="description"]');
    if (!tag) {
      tag = document.createElement('meta');
      tag.name = 'description';
      document.head.appendChild(tag);
    }
    tag.content = description;
  }, [title, description]);

  const brandStyle = {
    '--brand-primary': client.brand?.primaryColor ?? undefined,
    '--brand-accent': client.brand?.accentColor ?? undefined,
    '--brand-on-primary': client.brand?.onPrimaryColor ?? undefined,
  } as CSSProperties;

  return <RemovalCPage client={client} copy={copy} brandStyle={brandStyle} />;
}

export default RemovalC;
