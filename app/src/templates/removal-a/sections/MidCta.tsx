/**
 * S9 — the mid-page CTA, in two beats exactly as the source has it:
 *   1. "Looking for a Tree Removal Company Near You?" + a button that scrolls to
 *      the form. In the source that button is a GHL `scroll-to-element` action, i.e.
 *      JavaScript. Here it is an ordinary in-page link to the form's id, so it works
 *      before hydration, survives a JS error, and can be opened in a new tab.
 *   2. The "Ready To Get / That Tree Handled?" band over its background plate, with
 *      a call CTA.
 */

import type { ResolvedClient } from '../../../schema/resolve';
import { SafeText } from '../../../components/Safe';
import { CallCta, Section, SplitHeading, type Copy } from './shared';
import { FORM_ANCHOR } from './Hero';

export function MidCta({ client, copy }: { client: ResolvedClient; copy: Copy }) {
  const buttonLabel = copy('nearYou.button');

  return (
    <>
      <Section tone="light" className="ra-nearyou">
        <div className="ra-measure ra-measure--center">
          <SafeText as="h2" className="ra-h2" value={copy('nearYou.h2')} />
          <SafeText as="p" className="ra-body ra-lede" value={copy('nearYou.body')} />

          {buttonLabel.trim() && (
            <a className="ra-btn ra-btn--primary ra-btn--stack" href={`#${FORM_ANCHOR}`}>
              <span className="ra-btn-label">{buttonLabel}</span>
              <SafeText as="span" className="ra-btn-sub" value={copy('nearYou.buttonSub')} />
            </a>
          )}
        </div>
      </Section>

      <section className="ra-ready">
        <div className="ra-container ra-ready-inner">
          <SplitHeading as="h2" className="ra-h2 ra-h2--onDark" parts={[copy('readyCta.h1a'), copy('readyCta.h1b')]} />
          <CallCta client={client} copy={copy} placement="mid-page" tone="onDark" />
        </div>
      </section>
    </>
  );
}
