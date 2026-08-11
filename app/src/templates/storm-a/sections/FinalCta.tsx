/**
 * Final CTA — the closing band. One more time: what happened, and the two ways to
 * reach a crew (the assessment form, and the phone). Both derive from client data —
 * the form anchor is an in-page link, the number goes through <PhoneLink/> — so
 * neither can point at the wrong place.
 */

import type { ResolvedClient } from '../../../schema/resolve';
import { SafeText } from '../../../components/Safe';
import { CallCta, FORM_ANCHOR, Heading, Section, type Copy } from './shared';

export function FinalCta({ client, copy }: { client: ResolvedClient; copy: Copy }) {
  const primaryCta = copy('final.primaryCta');

  return (
    <Section tone="ink" className="st-final">
      <div className="st-final-inner">
        <Heading as="h2" className="st-final-h" parts={[copy('final.h2a'), copy('final.h2b')]} />
        <SafeText as="p" className="st-final-body" value={copy('final.body')} />

        <div className="st-final-actions">
          {primaryCta.trim() && (
            <a className="st-call st-call--accent st-call--lg" href={`#${FORM_ANCHOR}`}>
              <span>{primaryCta}</span>
            </a>
          )}
          <CallCta client={client} copy={copy} placement="final" prefix tone="paper" size="lg" subKey="cta.callSub" />
        </div>
      </div>
    </Section>
  );
}
