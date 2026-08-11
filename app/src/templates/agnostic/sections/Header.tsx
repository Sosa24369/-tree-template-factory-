/**
 * Header — brand mark on the left, one call CTA on the right.
 *
 * Sticky, because on a local-service page the single most valuable control is a
 * reachable call button and the visitor is usually holding a phone.
 *
 * The mark is <SafeLogo/>: a client with no image file gets their company name
 * set as a wordmark, never a broken-image icon (R5). That is also why this
 * template needs no artwork of its own — a mark drawn here would either be
 * blank or would depict a trade, and this page does not know the trade (R4).
 */

import type { ResolvedClient } from '../../../schema/resolve';
import { SafeLogo } from '../../../components/Safe';
import { PhoneLink } from '../../../components/PhoneLink';
import { clean, type Copy } from './shared';

export function Header({ client, copy }: { client: ResolvedClient; copy: Copy }) {
  return (
    <header className="ag-header">
      <div className="ag-container ag-header-inner">
        <SafeLogo logoUrl={client.brand?.logoUrl} clientName={client.name} className="ag-mark" />

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
