/**
 * AREAS — where we work, set as running text.
 *
 * The cities are CLIENT DATA (client.serviceAreaList), never copy: a different
 * client is a different list with no code change, and an empty list removes the
 * section rather than leaving an orphan heading (R5).
 *
 * trimming-a's equivalent is a scrolling marquee of city pills. This is the quiet
 * variant, so the cities simply sit still and are read. That is not only a taste
 * decision: a marquee is an infinite animation, and an infinite animation on a page
 * whose whole argument is composure is working against the argument. It also costs
 * nothing to render, nothing to animate and nothing on prefers-reduced-motion.
 *
 * The separator between cities is a CSS pseudo-element, so no punctuation is baked
 * into the text nodes and the last item never trails a stray dot.
 */

import type { ResolvedClient } from '../../../schema/resolve';
import { SafeText } from '../../../components/Safe';
import { ServiceAreasCarousel } from '../../../components/ServiceAreasCarousel';
import { Eyebrow, Section, type Copy } from './shared';

export function Areas({ client, copy }: { client: ResolvedClient; copy: Copy }) {
  const cities = (client.serviceAreaList ?? []).filter((city) => typeof city === 'string' && city.trim());
  const area = typeof client.serviceArea === 'string' ? client.serviceArea.trim() : '';
  if (cities.length === 0 && !area) return null;

  return (
    <Section tone="tint" className="tb-areas">
      <div className="tb-head">
        <Eyebrow value={copy('areas.eyebrow')} />
        {copy('areas.h2').trim() && <h2 className="tb-display tb-display--sm">{copy('areas.h2')}</h2>}
        <SafeText as="p" className="tb-body tb-measure" value={area} />
      </div>

      {/* CANONICAL STRUCTURE (2026-08-12): the owner's directive puts a
          continuously scrolling city carousel on every page, so the quiet
          static list became the shared marquee. (The variant's original
          no-marquee stance is explicitly overridden — noted in the report.) */}
      {cities.length > 0 && <ServiceAreasCarousel client={client} />}
    </Section>
  );
}
