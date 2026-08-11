/**
 * S7 — "Tree Trimming Services We Offer": 17 items in three bullet columns, then a
 * call CTA.
 *
 * The COLUMN COUNT is a design choice and collapses on a phone; the ITEM ORDER and
 * the grouping are not, so the ranges below reproduce the source's three bullet
 * lists exactly — 6 items, 6 items, 5 items. Column 3 really is one shorter, and
 * item 10 really does read "Mutli-Tree Pricing".
 */

import type { ResolvedClient } from '../../../schema/resolve';
import { SafeText } from '../../../components/Safe';
import { CallRow, CheckIcon, Rule, Section, SplitHeading, type Copy } from './shared';

/** [first, last] copy-key index per source column: bulletList 1, 2 and 3. */
const COLUMNS: Array<[number, number]> = [
  [1, 6],
  [7, 12],
  [13, 17],
];

export function Services({ client, copy }: { client: ResolvedClient; copy: Copy }) {
  const columns = COLUMNS.map(([from, to]) => {
    const items: string[] = [];
    for (let n = from; n <= to; n += 1) {
      const text = copy(`services.item${n}`);
      if (text.trim()) items.push(text);
    }
    return items;
  });

  return (
    <Section tone="canvas" className="ta-services">
      <div className="ta-head">
        <Rule />
        <SplitHeading as="h2" className="ta-h2" parts={[copy('services.h1a'), copy('services.h1b')]} />
        <SafeText as="p" className="ta-lede" value={copy('services.body')} />
      </div>

      <div className="ta-service-cols">
        {columns.map((items, col) =>
          items.length > 0 ? (
            <ul className="ta-service-list" key={col}>
              {items.map((text, i) => (
                <li key={i}>
                  <span className="ta-service-check" aria-hidden="true">
                    <CheckIcon />
                  </span>
                  <SafeText as="span" value={text} />
                </li>
              ))}
            </ul>
          ) : null,
        )}
      </div>

      <CallRow client={client} copy={copy} placement="services" tone="solid" />
    </Section>
  );
}
