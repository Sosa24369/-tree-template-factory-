/**
 * S5 — "Restoration Results Guaranteed": one paragraph, the 2+3 photo grid, a CTA.
 *
 * A client that supplies generic photos gets theirs; otherwise the control's five.
 * Either way the grid holds whatever it is given — three photos, or none, and the
 * section still reads (R5).
 */

import type { ResolvedClient } from '../../../schema/resolve';
import { SafeSection, SafeText } from '../../../components/Safe';
import { DeferredImage } from '../../../components/DeferredImage';
import { altFor, withAlt } from '../assets';
import { slotPhotos, slotSizes } from '../../../lib/placement.mjs';
import { CallCta, Section, SplitHeading, type Copy } from './shared';

export function Restoration({ client, copy }: { client: ResolvedClient; copy: Copy }) {
  // Client photographs only. The mosaic's direct-then-cascade read — and the fact that a
  // supplied generic set is NOT sliced to five — lives in lib/placement.ts, declared.
  const shots = slotPhotos(client, 'removal-a', 'mosaic').filter((p) => p !== null);
  if (shots.length === 0) return null;

  return (
    <Section tone="light" className="ra-restoration">
      <div className="ra-measure ra-measure--center">
        <SplitHeading as="h2" className="ra-h2" parts={[copy('restoration.h1a'), copy('restoration.h1b')]} />
        <SafeText as="p" className="ra-body ra-lede" value={copy('restoration.body')} />
      </div>

      <SafeSection when={shots}>
        <ul className="ra-grid-mosaic">
          {shots.map((shot, i) => (
            <li key={shot?.src ?? i}>
              <DeferredImage
                photo={shot?.alt ? shot : withAlt(shot, altFor(client.name, i + 1))}
                className="ra-mosaic-img"
                sizes={slotSizes('removal-a', 'mosaic')}
              />
            </li>
          ))}
        </ul>
      </SafeSection>

      <div className="ra-cta-row">
        <CallCta client={client} copy={copy} placement="restoration" tone="solid" />
      </div>
    </Section>
  );
}
