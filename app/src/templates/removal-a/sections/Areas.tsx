/**
 * S7 — "Areas We Serve": the scrolling city-pill marquee.
 *
 * The cities are CLIENT DATA (client.serviceAreaList), never copy — a different
 * client is a different list with no code change, and an empty list removes the
 * whole section rather than leaving an orphan heading (R5).
 *
 * The source runs three tracks, each holding two identical groups — the standard
 * duplicate-the-track trick for a seamless loop. Same trick here, in ~20 lines of
 * CSS instead of a library, with the duplicate marked aria-hidden so a screen
 * reader hears each city once. Under prefers-reduced-motion the CSS drops the
 * animation and the clone and the pills simply wrap.
 */

import type { ResolvedClient } from '../../../schema/resolve';
import { SafeSection, SafeText } from '../../../components/Safe';
import { PinIcon, Section, SplitHeading, type Copy } from './shared';

function Track({ cities, reverse }: { cities: string[]; reverse: boolean }) {
  const group = (clone: boolean) => (
    <div className="ra-marquee-group" aria-hidden={clone ? true : undefined} data-clone={clone ? 'true' : undefined}>
      {cities.map((city, i) => (
        <span className="ra-pill" key={`${city}-${i}`}>
          <PinIcon />
          <SafeText as="span" value={city} />
        </span>
      ))}
    </div>
  );

  return (
    <div className="ra-marquee">
      <div className={['ra-marquee-track', reverse ? 'ra-marquee-track--reverse' : null].filter(Boolean).join(' ')}>
        {group(false)}
        {group(true)}
      </div>
    </div>
  );
}

export function Areas({ client, copy }: { client: ResolvedClient; copy: Copy }) {
  const cities = (client.serviceAreaList ?? []).filter((city) => typeof city === 'string' && city.trim());
  const half = Math.ceil(cities.length / 2);
  const tracks = cities.length > 6 ? [cities.slice(0, half), cities.slice(half)] : [cities];

  return (
    <SafeSection when={cities}>
      <Section tone="plate" className="ra-areas">
        <div className="ra-measure ra-measure--center">
          <SplitHeading as="h2" className="ra-h2" parts={[copy('areas.h1a'), copy('areas.h1b')]} />
          <SafeText as="p" className="ra-areas-sub" value={copy('areas.h2')} />
        </div>

        <div className="ra-marquees">
          {tracks.map((track, i) => (
            <Track key={i} cities={track} reverse={i % 2 === 1} />
          ))}
        </div>
      </Section>
    </SafeSection>
  );
}
