/**
 * S7 — "Areas We Serve": the shared static city grid (components/ServiceAreasCarousel).
 *
 * The cities are CLIENT DATA (client.serviceAreaList), never copy — a different
 * client is a different list with no code change, and an empty list removes the
 * whole section rather than leaving an orphan heading (R5). The list itself is the shared
 * component so every template lays the cities out the same way (alphabetical grid, last
 * row never one city); the dedupe below only decides whether the section renders.
 *
 * This was a marquee: two tracks, each rendering its half of the list TWICE (the
 * second copy aria-hidden) and translating -50% for a seamless loop, under an edge
 * mask. Every city showed twice on screen (20 pills for J Valdez's 10 cities, 50 for
 * Texas Tree Tops' 25 — the records are clean), and the mask faded whichever pill was
 * at an edge. Same diagnosis and same fix as trimming-a (B8). Restoring the motion is
 * a later item, done once for every template; until then the readable list is the
 * whole of it. Repeats in the record are dropped case-insensitively, first spelling
 * wins, order preserved.
 */

import type { ResolvedClient } from '../../../schema/resolve';
import { SafeSection, SafeText } from '../../../components/Safe';
import { ServiceAreasCarousel } from '../../../components/ServiceAreasCarousel';
import { Section, SplitHeading, type Copy } from './shared';

export function Areas({ client, copy }: { client: ResolvedClient; copy: Copy }) {
  const seen = new Set<string>();
  const cities = (client.serviceAreaList ?? []).filter((city): city is string => {
    if (typeof city !== 'string' || !city.trim()) return false;
    const key = city.trim().toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  return (
    <SafeSection when={cities}>
      <Section tone="plate" className="ra-areas">
        <div className="ra-measure ra-measure--center">
          <SplitHeading as="h2" className="ra-h2" parts={[copy('areas.h1a'), copy('areas.h1b')]} />
          <SafeText as="p" className="ra-areas-sub" value={copy('areas.h2')} />
        </div>

        <ServiceAreasCarousel client={client} />
      </Section>
    </SafeSection>
  );
}
