/**
 * S6 — the offer, and the form.
 *
 * THIS IS WHERE THE $300 IS NAMED FOR THE FIRST TIME, roughly two thirds down the
 * page. removal-a puts the same number in the H1 and the same form in the hero.
 * Both pages sell the same job at the same price; they disagree about when a
 * homeowner should be told about the discount, and that disagreement is the test.
 *
 * The offer copy is deliberately unhyped — it says the quote is priced the same
 * either way and that the crew will say so if the tree does not qualify. A
 * discount-led control has to shout; a proof-led variant that starts shouting here
 * throws away everything the previous two sections just bought.
 *
 * The form itself is the shared <LeadForm/>: it already carries the A2P consent
 * opt-in, the hidden ad-click-id fields and the guarded thank-you destination, and
 * it is never rebuilt per template.
 */

import type { ResolvedClient } from '../../../schema/resolve';
import { SafeText } from '../../../components/Safe';
import { LeadForm } from '../../../components/LeadForm';
import { CallCta, CheckIcon, FORM_ANCHOR, Heading, Section, type Copy } from './shared';

const REASSURANCES = [1, 2, 3];

export function Estimate({ client, copy }: { client: ResolvedClient; copy: Copy }) {
  const ribbon = copy('estimate.ribbon');
  const reassurances = REASSURANCES.map((n) => copy(`estimate.reassure${n}`)).filter((text) => text.trim());
  const orCall = copy('estimate.orCall');

  return (
    <Section id={FORM_ANCHOR} tone="paper" className="rb-estimate">
      <div className="rb-estimate-grid">
        <div className="rb-offer rb-rise">
          {ribbon.trim() && (
            <p className="rb-ribbon">
              <span className="rb-ribbon-spark" aria-hidden="true" />
              {ribbon}
            </p>
          )}

          <Heading as="h2" className="rb-h2" parts={[copy('estimate.h2a'), copy('estimate.h2b')]} />
          <SafeText as="p" className="rb-lede" value={copy('estimate.lede')} />

          {reassurances.length > 0 && (
            <ul className="rb-reassure">
              {reassurances.map((text, i) => (
                <li key={i}>
                  <span className="rb-reassure-check" aria-hidden="true">
                    <CheckIcon />
                  </span>
                  <SafeText as="span" value={text} />
                </li>
              ))}
            </ul>
          )}

          <div className="rb-offer-call">
            <SafeText as="p" className="rb-offer-call-label" value={orCall} />
            <CallCta client={client} copy={copy} placement="estimate" prefix tone="outline" size="sm" />
          </div>
        </div>

        <div className="rb-form-card rb-rise">
          <SafeText as="h3" className="rb-form-h" value={copy('estimate.formHeading')} />
          <SafeText as="p" className="rb-form-sub" value={copy('estimate.formSub')} />

          <LeadForm
            client={client}
            className="rb-form"
            labels={{
              firstName: copy('estimate.label.firstName'),
              lastName: copy('estimate.label.lastName'),
              phone: copy('estimate.label.phone'),
              email: copy('estimate.label.email'),
              submit: copy('estimate.submit'),
            }}
          />

          <SafeText as="p" className="rb-form-foot" value={copy('estimate.formFootnote')} />
        </div>
      </div>
    </Section>
  );
}
