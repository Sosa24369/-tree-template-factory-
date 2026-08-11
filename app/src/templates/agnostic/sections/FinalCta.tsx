/**
 * Closing CTA — the second and last brand-coloured band on the page.
 *
 * It bookends the hero, so a page whose middle sections have all removed
 * themselves still reads as a composition with a top and a bottom rather than a
 * form that ran out.
 *
 * Two actions, both optional and both degrading cleanly:
 *   - the phone CTA renders through <PhoneLink/> and disappears with the number;
 *   - the in-page link back to the request card renders only when the operator
 *     has written a label for it. An unlabelled link is not worth rendering.
 *
 * The band itself is skipped when the heading, the body and the number are all
 * absent — an empty coloured stripe above the footer is worse than no stripe.
 */

import type { ResolvedClient } from '../../../schema/resolve';
import { SafeText } from '../../../components/Safe';
import { CallCta, Section } from './shared';
import { hasText, type Copy } from '../text';
import { FORM_ANCHOR } from './Hero';

export function FinalCta({ client, copy }: { client: ResolvedClient; copy: Copy }) {
  const heading = copy('finalCta.h2');
  const body = copy('finalCta.body');
  const formLinkLabel = copy('finalCta.formLinkLabel');
  const hasPhone = Boolean(client.phoneHref);

  if (!hasText(heading) && !hasText(body) && !hasPhone) return null;

  return (
    <Section tone="deep" className="ag-final">
      <div className="ag-final-inner">
        <SafeText as="h2" className="ag-h2 ag-h2--onDark" value={heading} />
        <SafeText as="p" className="ag-final-body" value={body} />

        <div className="ag-final-actions">
          <CallCta client={client} copy={copy} placement="final-cta" tone="onDark" />
          {hasText(formLinkLabel) && (
            <a className="ag-final-link" href={`#${FORM_ANCHOR}`}>
              {formLinkLabel}
            </a>
          )}
        </div>
      </div>
    </Section>
  );
}
