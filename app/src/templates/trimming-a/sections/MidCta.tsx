/**
 * S10 (part 2) — the mid-page CTA, in the two beats the source has it:
 *
 *   1. "Looking for a Tree Trimming Company Near You?" with the underlined offer
 *      line, the supporting sentence, and a button that scrolls to the form. In the
 *      source that button is a GHL scroll-to-element action, i.e. JavaScript; here
 *      it is an ordinary in-page link, so it works before hydration and survives a
 *      JS error. It does NOT dial, and neither does the source's, despite its
 *      sub-text reading "Request a call back".
 *   2. The "Ready To Get Those / Trees Trimmed?" band, with a real call CTA.
 *
 * The <u> on the offer line is the source's own markup, kept because underline is
 * how that sentence is emphasised in the control.
 */

import type { ResolvedClient } from '../../../schema/resolve';
import { SafeText } from '../../../components/Safe';
import { FORM_ANCHOR } from '../slots';
import { CallCta, FormCta, Section, SplitHeading, type Copy } from './shared';

export function MidCta({ client, copy }: { client: ResolvedClient; copy: Copy }) {
  const offer = copy('midCta.offer');

  return (
    <>
      <Section tone="paper" className="ta-midcta">
        <div className="ta-midcta-inner">
          <SafeText as="h2" className="ta-h2" value={copy('midCta.h2')} />
          {offer.trim() ? (
            <p className="ta-midcta-offer">
              <u>{offer}</u>
            </p>
          ) : null}
          <SafeText as="p" className="ta-lede" value={copy('midCta.body')} />

          <FormCta
            href={`#${FORM_ANCHOR}`}
            label={copy('midCta.button')}
            sub={copy('midCta.buttonSub')}
            tone="solid"
          />
        </div>
      </Section>

      <section className="ta-ready">
        <div className="ta-container ta-ready-inner">
          <SplitHeading
            as="h2"
            className="ta-h2 ta-h2--onDeep"
            parts={[copy('readyCta.h1a'), copy('readyCta.h1b')]}
            stacked
          />
          <CallCta client={client} copy={copy} placement="ready-band" tone="onDeep" />
        </div>
      </section>
    </>
  );
}
