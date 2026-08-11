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
import { photosFor } from '../../../lib/photos';
import { CallCta, Section, SplitHeading, type Copy } from './shared';

export function Restoration({ client, copy }: { client: ResolvedClient; copy: Copy }) {
  const supplied = client.photos?.generic ?? [];
  // Client photographs only — see lib/photos.ts.
  const shots = supplied.length > 0 ? supplied : photosFor(client, 'removal', 5);
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
