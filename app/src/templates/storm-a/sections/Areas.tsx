/**
 * Service area — a static, scannable city grid. The cities are CLIENT DATA
 * (client.serviceAreaList), never copy: a different client is a different list with
 * no code change, and an empty list removes the whole section rather than leaving an
 * orphan heading (R5). A homeowner checking whether their own suburb is covered needs
 * to scan it, so it does not scroll.
 */

import type { ResolvedClient } from '../../../schema/resolve';
import { SafeSection, SafeText } from '../../../components/Safe';
import { Eyebrow, Heading, PinIcon, Section, type Copy } from './shared';

export function Areas({ client, copy }: { client: ResolvedClient; copy: Copy }) {
  const cities = (client.serviceAreaList ?? []).filter((city) => typeof city === 'string' && city.trim());

  return (
    <SafeSection when={cities}>
      <Section tone="paper" className="st-areas">
        <div className="st-head">
          <Eyebrow>{copy('areas.eyebrow')}</Eyebrow>
          <Heading as="h2" className="st-h2" parts={[copy('areas.h2a'), copy('areas.h2b')]} />
          <SafeText as="p" className="st-lede" value={copy('areas.lede')} />
        </div>

        <ul className="st-area-grid">
          {cities.map((city, i) => (
            <li className="st-area" key={`${city}-${i}`}>
              <PinIcon />
              <SafeText as="span" value={city} />
            </li>
          ))}
        </ul>
      </Section>
    </SafeSection>
  );
}
