/**
 * S8 — "Areas We Serve": the scrolling service-area marquee.
 *
 * The cities are CLIENT DATA (client.serviceAreaList), never copy — a different
 * client is a different list with no code change, and an empty list removes the
 * whole section rather than leaving an orphan heading (R5).
 *
 * The source emits three marquee tracks x two duplicate groups = 54 pills in the DOM
 * for nine unique names, in two different orderings (structure.md §2.8). Two tracks
 * are enough for the effect: each holds the list twice and translates -50%, which is
 * what makes the loop seamless, and the duplicate is aria-hidden so a screen reader
 * hears each city once. The second track runs in reverse, which is where the source's
 * "order B" visual came from. Under prefers-reduced-motion the CSS drops the
 * animation and the clone entirely and the tags simply wrap.
 *
 * Note the accent: Section 8 is the one heading where the source colours the FIRST
 * part ("Areas ") and leaves the second plain.
 */

import type { ResolvedClient } from '../../../schema/resolve';
import { SafeSection, SafeText } from '../../../components/Safe';
import { PinIcon, Rule, Section, SplitHeading, type Copy } from './shared';

function Track({ cities, reverse }: { cities: string[]; reverse: boolean }) {
  const group = (clone: boolean) => (
    <div className="ta-marquee-group" aria-hidden={clone ? true : undefined} data-clone={clone ? 'true' : undefined}>
      {cities.map((city, i) => (
        <span className="ta-tag" key={`${city}-${i}`}>
          <PinIcon />
          <SafeText as="span" value={city} />
        </span>
      ))}
    </div>
  );

  return (
    <div className="ta-marquee">
      <div className={['ta-marquee-track', reverse ? 'ta-marquee-track--reverse' : null].filter(Boolean).join(' ')}>
        {group(false)}
        {group(true)}
      </div>
    </div>
  );
}

export function Areas({ client, copy }: { client: ResolvedClient; copy: Copy }) {
  const cities = (client.serviceAreaList ?? []).filter((city) => typeof city === 'string' && city.trim());
  const half = Math.ceil(cities.length / 2);
  const tracks = cities.length > 5 ? [cities.slice(0, half), cities.slice(half)] : [cities];

  return (
    <SafeSection when={cities}>
      <Section tone="tint" className="ta-areas">
        <div className="ta-head">
          <Rule />
          <SplitHeading as="h2" className="ta-h2" parts={[copy('areas.h1a'), copy('areas.h1b')]} accent={0} />
          <SafeText as="p" className="ta-areas-sub" value={copy('areas.h2')} />
        </div>

        <div className="ta-marquees">
          {tracks.map((track, i) => (
            <Track key={i} cities={track} reverse={i % 2 === 1} />
          ))}
        </div>
      </Section>
    </SafeSection>
  );
}
