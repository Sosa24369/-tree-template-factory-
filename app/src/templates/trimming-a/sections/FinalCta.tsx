/**
 * S12 — the final CTA.
 *
 * The button here is the one P0 flagged: its sub-text says "Click to call" but its
 * GHL action is scroll-to-element on the form, so it has never dialled anything. It
 * is reproduced as what it actually is — an in-page link to the form — rather than
 * "fixed" into a phone link, because turning a form CTA into a call CTA would change
 * what the control measures. The misleading sub-text is copy and ships verbatim.
 *
 * A visitor who wants to call still can: the header CTA is sticky, and the footer
 * carries the number.
 */

import { SafeText } from '../../../components/Safe';
import { FORM_ANCHOR } from '../slots';
import { FormCta, SplitHeading, type Copy } from './shared';

export function FinalCta({ copy }: { copy: Copy }) {
  return (
    <section className="ta-final">
      <div className="ta-container ta-final-inner">
        <SplitHeading
          as="h2"
          className="ta-h2 ta-h2--onDeep"
          parts={[copy('finalCta.h1a'), copy('finalCta.h1b')]}
          stacked
        />
        <SafeText as="p" className="ta-final-body" value={copy('finalCta.body')} />

        <FormCta
          href={`#${FORM_ANCHOR}`}
          label={copy('finalCta.button')}
          sub={copy('finalCta.buttonSub')}
          tone="onDeep"
        />
      </div>
    </section>
  );
}
