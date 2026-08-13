/**
 * Header — brand mark on the left, one call CTA on the right.
 *
 * Sticky, because on a local-service page the single most valuable control is a
 * reachable call button and the visitor is usually holding a phone.
 *
 * The mark uses the shared header-brand lockup, so a client with no image file
 * gets their company name set as a wordmark, never a broken-image icon (R5) —
 * the banner treatment, now in the header. That is also why this template
 * needs no artwork of its own — a mark drawn here would either be blank or
 * would depict a trade, and this page does not know the trade (R4). The
 * previous R4 residual (internal fragments of the brand-mark schema field
 * spelled on this file's primitive props) is gone with the lockup extraction:
 * those identifiers now live only inside the shared component.
 */

import type { ResolvedClient } from '../../../schema/resolve';
import { HeaderBrand } from '../../../components/HeaderBrand';
import { PhoneLink } from '../../../components/PhoneLink';
import { clean, type Copy } from '../text';

export function Header({ client, copy }: { client: ResolvedClient; copy: Copy }) {
  return (
    <header className="ag-header">
      <div className="ag-container ag-header-inner">
        <HeaderBrand client={client} />

        {/* Never a hand-built tel: href. One number, one format, one swap target. */}
        <PhoneLink
          client={client}
          className="ag-call ag-call--bar"
          subLabel={clean(copy('header.callSub')) || undefined}
          placement="header"
        />
      </div>
    </header>
  );
}
