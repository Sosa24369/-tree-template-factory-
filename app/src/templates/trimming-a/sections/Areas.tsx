/**
 * S8 — "Areas We Serve": every city once, as a wrapped list of chips.
 *
 * The cities are CLIENT DATA (client.serviceAreaList), never copy — a different
 * client is a different list with no code change, and an empty list removes the
 * whole section rather than leaving an orphan heading (R5).
 *
 * This used to be a scrolling marquee: two tracks, each rendering its half of the
 * list TWICE and translating -50% so the loop was seamless, under an edge-fade mask,
 * pulled out past the content column by a negative margin. Every one of those
 * choices produced what the owner reported on J Valdez's live page:
 *   - "Sunnyvale, East Dallas and Lake Ray Hubbard each appear twice" — the loop
 *     clone. The record itself has ten unique cities; nothing needed deduping in data.
 *   - "the first chip on each row renders faded and clipped" — the mask, on a chip
 *     half outside the column, on a strip that is always mid-scroll.
 * A moving ticker ALWAYS has chips entering and leaving its edges, so "every chip
 * fully visible, always" is not something a marquee can do. The static list is: one
 * group, no clone, no mask, no animation — which also removes the duplicate DOM and
 * a running animation, so it costs nothing in page speed. It is the layout the old
 * CSS already fell back to under prefers-reduced-motion.
 *
 * Note the accent: Section 8 is the one heading where the source colours the FIRST
 * part ("Areas ") and leaves the second plain.
 */

import type { ResolvedClient } from '../../../schema/resolve';
import { SafeSection, SafeText } from '../../../components/Safe';
import { ServiceAreasCarousel } from '../../../components/ServiceAreasCarousel';
import { Rule, Section, SplitHeading, type Copy } from './shared';

export function Areas({ client, copy }: { client: ResolvedClient; copy: Copy }) {
  // Each city once, whatever the record holds: a list typed twice in the studio should
  // not render twice on the page either. First spelling wins; order is preserved.
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
      <Section tone="tint" className="ta-areas">
        <div className="ta-head">
          <Rule />
          <SplitHeading as="h2" className="ta-h2" parts={[copy('areas.h1a'), copy('areas.h1b')]} accent={0} />
          <SafeText as="p" className="ta-areas-sub" value={copy('areas.h2')} />
        </div>

        <ServiceAreasCarousel client={client} />
      </Section>
    </SafeSection>
  );
}
