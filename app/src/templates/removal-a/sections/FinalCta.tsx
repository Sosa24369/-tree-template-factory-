/**
 * S12 — the final CTA over its background plate.
 *
 * This is the placement P0 flagged: the source's button dials the number but its
 * visible text is "Get my free estimate" / "Click to call" and contains no digits at
 * all, so a CallRail rule that swaps the number as TEXT silently misses it. Rendering
 * it through <PhoneLink/> with children keeps it swap-tagged anyway — same
 * data-dni="phone" hook, same single text node, same href derived from the same
 * client.phone.e164 — so P4 can target it by attribute instead of by text.
 */

import type { ResolvedClient } from '../../../schema/resolve';
import { SafeText } from '../../../components/Safe';
import { PhoneLink } from '../../../components/PhoneLink';
import { SplitHeading, type Copy } from './shared';

export function FinalCta({ client, copy }: { client: ResolvedClient; copy: Copy }) {
  // Empty children would render an anchor with no visible label; undefined falls
  // back to the number, which is always something a visitor can act on (R5).
  const label = copy('finalCta.linkLabel');

  return (
    <section className="ra-final">
      <div className="ra-container ra-final-inner">
        <SplitHeading
          as="h2"
          className="ra-h2 ra-h2--onDark"
          parts={[copy('finalCta.h1a'), copy('finalCta.h1b')]}
        />
        <SafeText as="p" className="ra-final-body" value={copy('finalCta.body')} />

        <PhoneLink
          client={client}
          className="ra-call ra-call--onDark"
          subLabel={copy('finalCta.linkSub')}
          placement="final-cta"
        >
          {label.trim() ? label : undefined}
        </PhoneLink>
      </div>
    </section>
  );
}
