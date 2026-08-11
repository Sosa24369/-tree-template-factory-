/**
 * Service area — the prose area line plus the individual areas as pills.
 *
 * Both are CLIENT DATA (client.serviceArea, client.serviceAreaList), never copy,
 * so moving this template to a business in another county is a JSON edit.
 *
 * The section is gated on that data rather than on its own heading: a heading
 * over no areas is an orphan, so if the record names no area the whole block —
 * eyebrow, heading and intro included — is absent (R5).
 *
 * The pills WRAP; they do not scroll and they do not animate. A moving strip on
 * a page that may be almost entirely empty draws the eye to the one thing that
 * happens to be filled in, and it costs motion on a page whose whole argument
 * is that it is quiet.
 */

import type { ResolvedClient } from '../../../schema/resolve';
import { SafeText } from '../../../components/Safe';
import { PinIcon, Section, SectionHead } from './shared';
import { hasText, type Copy } from '../text';

export function Areas({ client, copy }: { client: ResolvedClient; copy: Copy }) {
  const areas = (client.serviceAreaList ?? []).filter(hasText);
  const area = client.serviceArea;

  if (areas.length === 0 && !hasText(area)) return null;

  return (
    <Section tone="tint" className="ag-areas">
      <SectionHead
        eyebrow={copy('areas.eyebrow')}
        heading={copy('areas.h2')}
        body={copy('areas.body')}
        align="center"
      />

      <SafeText as="p" className="ag-area-line" value={area} />

      {areas.length > 0 && (
        <ul className="ag-area-list">
          {areas.map((name, i) => (
            <li className="ag-area" key={`${name}-${i}`}>
              <PinIcon />
              <span>{name}</span>
            </li>
          ))}
        </ul>
      )}
    </Section>
  );
}
