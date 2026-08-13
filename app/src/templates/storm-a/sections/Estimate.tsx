/**
 * Assessment form — high on the page, because emergency intent wants to act now.
 *
 * The form itself is the shared <LeadForm/>: it already carries the A2P consent
 * opt-in, the hidden ad-click-id fields (gclid/gbraid/wbraid/fbclid) and the guarded
 * thank-you destination, and it is never rebuilt per template — a template that
 * hand-rolls a form is one that quietly drops a P0 fix.
 *
 * A call alternative sits beside it for the visitor who would rather talk than type,
 * through <PhoneLink/> like every other number on the page.
 */

import type { ResolvedClient } from '../../../schema/resolve';
import { SafeText } from '../../../components/Safe';
import { LeadForm } from '../../../components/LeadForm';
import { CallCta, Eyebrow, FORM_ANCHOR, Heading, type Copy } from './shared';

/**
 * CANONICAL STRUCTURE (owner's directive, 2026-08-12): the form lives IN THE
 * HERO now — this panel is rendered inside <Hero/>'s grid, not as its own
 * section. Every estimate.* copy key renders here word-for-word exactly as it
 * did when this was a standalone section; only the position moved.
 */
export function EstimatePanel({ client, copy }: { client: ResolvedClient; copy: Copy }) {
  const orCall = copy('estimate.orCall');

  return (
    <div className="st-hero-form" id={FORM_ANCHOR}>
      <div className="st-hero-form-copy">
        <Eyebrow>{copy('estimate.eyebrow')}</Eyebrow>
        <Heading as="h2" className="st-h3 st-hero-form-h2" parts={[copy('estimate.h2a'), copy('estimate.h2b')]} />
        <SafeText as="p" className="st-hero-form-lede" value={copy('estimate.lede')} />
      </div>

      <div className="st-form-card">
        <SafeText as="h3" className="st-form-h" value={copy('estimate.formHeading')} />
        <SafeText as="p" className="st-form-sub" value={copy('estimate.formSub')} />

        <LeadForm
          client={client}
          className="st-form"
          labels={{
            firstName: copy('estimate.label.firstName'),
            lastName: copy('estimate.label.lastName'),
            phone: copy('estimate.label.phone'),
            email: copy('estimate.label.email'),
            submit: copy('estimate.submit'),
          }}
        />

        <SafeText as="p" className="st-form-foot" value={copy('estimate.formFootnote')} />

        {/* Rendered only when there is a number: <PhoneLink/> returns null with no
            phone on the record, and the bare label alone would dangle (R5). */}
        {client.phoneHref && (
          <div className="st-estimate-call">
            <SafeText as="p" className="st-estimate-call-label" value={orCall} />
            <CallCta client={client} copy={copy} placement="estimate" prefix tone="outline" size="sm" />
          </div>
        )}
      </div>
    </div>
  );
}
