/**
 * S11 — the closing band.
 *
 * P0 flagged the control's version of this placement: its button dials the number
 * but its visible text is "Get my free estimate", with no digits in it at all, so a
 * CallRail rule that swaps the number as TEXT silently misses it and the call goes
 * unattributed.
 *
 * This variant does not reproduce that. The button's visible label IS the number,
 * rendered through <PhoneLink/> as one uninterrupted text node in the same
 * canonical format as every other placement on the page — so the P4 DNI swap has a
 * text target here as well as the data-dni attribute, and nothing depends on
 * remembering the exception.
 */

import type { ResolvedClient } from '../../../schema/resolve';
import { SafeText } from '../../../components/Safe';
import { CallCta, FORM_ANCHOR, Heading, type Copy } from './shared';

export function FinalCta({ client, copy }: { client: ResolvedClient; copy: Copy }) {
  const formLink = copy('finalCta.formLink');

  return (
    <section className="rb-final">
      <div className="rb-container rb-final-inner">
        <Heading as="h2" className="rb-h2 rb-h2--onInk" parts={[copy('finalCta.h2a'), copy('finalCta.h2b')]} />
        <SafeText as="p" className="rb-final-body" value={copy('finalCta.body')} />

        <CallCta
          client={client}
          copy={copy}
          placement="final-cta"
          prefix
          tone="paper"
          size="lg"
          subKey="finalCta.callSub"
        />

        {formLink.trim() && (
          <a className="rb-final-alt" href={`#${FORM_ANCHOR}`}>
            {formLink}
          </a>
        )}
      </div>
    </section>
  );
}
