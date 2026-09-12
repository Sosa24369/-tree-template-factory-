/**
 * S6 — "Tree Removal Services We Offer": 20 items in three image-headed columns,
 * then a call CTA. Painted over the section's background plate.
 *
 * The COLUMN COUNT is a design choice and collapses to one column on a phone; the
 * ITEM ORDER is not, so the ranges below reproduce the source's grouping exactly:
 * 1-7, 8-14, 15-20.
 */

import type { ResolvedClient } from '../../../schema/resolve';
import { SafeText } from '../../../components/Safe';
import { DeferredImage } from '../../../components/DeferredImage';
import { altFor, withAlt } from '../assets';
import { slotPhotos } from '../../../lib/placement';
import { CallCta, CheckIcon, Section, SplitHeading, type Copy } from './shared';

const COLUMNS: Array<[number, number]> = [
  [1, 7],
  [8, 14],
  [15, 20],
];

export function Services({ client, copy }: { client: ResolvedClient; copy: Copy }) {
  // The last three of the set, one per column. Deliberately over the RAW list, videos
  // included — that is what this slot did before lib/placement.ts, and the declared
  // `lastN` pick reproduces it rather than quietly changing a live page.
  const strip = slotPhotos(client, 'removal-a', 'service-photo');
  const columns = COLUMNS.map(([from, to]) => {
    const items: string[] = [];
    for (let n = from; n <= to; n += 1) {
      const text = copy(`services.item${n}`);
      if (text.trim()) items.push(text);
    }
    return items;
  });

  return (
    <Section tone="plate" className="ra-services">
      <div className="ra-measure ra-measure--center">
        <SplitHeading as="h2" className="ra-h2" parts={[copy('services.h1a'), copy('services.h1b')]} />
        <SafeText as="p" className="ra-body ra-lede" value={copy('services.body')} />
      </div>

      <div className="ra-service-cols">
        {columns.map((items, col) =>
          items.length > 0 ? (
            <div className="ra-service-col" key={col}>
              <DeferredImage
                photo={strip[col] ? withAlt(strip[col], altFor(client.name, col + 1)) : null}
                className="ra-service-photo"
              />
              <ul className="ra-service-list">
                {items.map((text, i) => (
                  <li key={i}>
                    <span className="ra-service-check" aria-hidden="true">
                      <CheckIcon />
                    </span>
                    <SafeText as="span" value={text} />
                  </li>
                ))}
              </ul>
            </div>
          ) : null,
        )}
      </div>

      <div className="ra-cta-row">
        <CallCta client={client} copy={copy} placement="services" tone="solid" />
      </div>
    </Section>
  );
}
