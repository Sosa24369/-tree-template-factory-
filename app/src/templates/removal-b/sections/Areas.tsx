/**
 * S9 — where the crews are working.
 *
 * The cities are CLIENT DATA (client.serviceAreaList), never copy: a different
 * client is a different list with no code change, and an empty list removes the
 * whole section rather than leaving an orphan heading (R5).
 *
 * removal-a scrolls these past on two animated marquee tracks. This variant lays
 * them out as a static, readable grid, because a homeowner checking whether their
 * own suburb is on the list needs to be able to scan it — and because the page
 * already spends its motion budget on the hero and the credential ticker. Deciding
 * where NOT to move things is part of the rich variant, not an exception to it.
 */

import type { ResolvedClient } from '../../../schema/resolve';
import { SafeSection, SafeText } from '../../../components/Safe';
import { Eyebrow, Heading, PinIcon, Section, type Copy } from './shared';

export function Areas({ client, copy }: { client: ResolvedClient; copy: Copy }) {
  const cities = (client.serviceAreaList ?? []).filter((city) => typeof city === 'string' && city.trim());

  return (
    <SafeSection when={cities}>
      <Section tone="paper" className="rb-areas">
        <div className="rb-head rb-rise">
          <Eyebrow>{copy('areas.eyebrow')}</Eyebrow>
          <Heading as="h2" className="rb-h2" parts={[copy('areas.h2a'), copy('areas.h2b')]} />
          <SafeText as="p" className="rb-lede" value={copy('areas.lede')} />
        </div>

        <ul className="rb-area-grid rb-rise">
          {cities.map((city, i) => (
            <li className="rb-area" key={`${city}-${i}`}>
              <PinIcon />
              <SafeText as="span" value={city} />
            </li>
          ))}
        </ul>
      </Section>
    </SafeSection>
  );
}
