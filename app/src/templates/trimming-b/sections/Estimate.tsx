/**
 * ESTIMATE — the form, and the last thing on the page.
 *
 * THE STRUCTURAL HALF OF THE TEST. trimming-a puts the form in the hero, above the
 * fold, before a single claim has been made: it is optimised for the visitor who
 * already decided on the ad. This side asks for the number only after the standard,
 * the refusals, the work and the offer have all been read, and gives the visitor who
 * is ready early two ways past the argument — the number in the sticky header, and
 * the in-page link in the hero that lands here.
 *
 * The form itself is the shared <LeadForm/>: it already carries the A2P consent
 * opt-in with the client's Privacy/Terms links, the hidden ad-click-id fields, the
 * honeypot, the double-submit guard and the guarded thank-you destination. It is
 * never rebuilt per template — a template that hand-rolls a form is a template that
 * quietly drops one of those four P0 fixes.
 *
 * The alternative call sits under it for the visitor who would rather talk than
 * type, through <PhoneLink/> like every other number on the page. The prefix is a
 * separate text node from the number, so the number itself stays one uninterrupted
 * string for CallRail's DOM scan at P4.
 */

import type { ResolvedClient } from '../../../schema/resolve';
import { SafeText } from '../../../components/Safe';
import { LeadForm } from '../../../components/LeadForm';
import { PhoneLink } from '../../../components/PhoneLink';
import { Display, Eyebrow, FORM_ANCHOR, type Copy } from './shared';

/**
 * CANONICAL STRUCTURE (owner's directive, 2026-08-12): the closing form moved
 * INTO the hero — the owner's structure puts the form and the call path in
 * the hero on every page. Every estimate.* copy line renders word-for-word;
 * only the position moved. The panel keeps its deep-ink surface, so the
 * onInk copy classes still read correctly inside the paper hero.
 */
export function EstimatePanel({ client, copy }: { client: ResolvedClient; copy: Copy }) {
  const callPrefix = copy('estimate.callPrefix');

  return (
    <div className="tb-hero-form" id={FORM_ANCHOR}>
      <div className="tb-estimate-grid tb-estimate-grid--hero">
        <div className="tb-estimate-copy">
          <Eyebrow value={copy('estimate.eyebrow')} />
          <Display as="h2" lines={[copy('estimate.h2a'), copy('estimate.h2b')]} />
          <SafeText as="p" className="tb-lede tb-lede--onInk" value={copy('estimate.body')} />

          {/* Rendered only when there is a number to render: <PhoneLink/> returns
              null with no phone on the record, and the bare prefix on its own would
              be a dangling "Or call " (R5). */}
          {client.phoneHref && (
            <p className="tb-estimate-call">
              <SafeText as="span" value={callPrefix} />
              <PhoneLink client={client} className="tb-estimate-phone" placement="form-alternative" />
            </p>
          )}
        </div>

        <div className="tb-form-card">
          <LeadForm
            client={client}
            className="tb-form"
            labels={{
              firstName: copy('form.label.firstName'),
              lastName: copy('form.label.lastName'),
              phone: copy('form.label.phone'),
              email: copy('form.label.email'),
              submit: copy('form.submit'),
            }}
          />
        </div>
      </div>
    </div>
  );
}
