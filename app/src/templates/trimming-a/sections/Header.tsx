/**
 * S1 — the header bar: logo + one phone CTA.
 *
 * The source ships TWO header rows, a desktop copy and a mobile copy, hidden from
 * each other with .desktop-only/.mobile-only — and they dial DIFFERENT numbers:
 * (214) 985-7697 on desktop, (469) 402-1196 on mobile. Splitting the business's
 * reachable number by breakpoint is a GHL builder artifact, not copy, so this
 * renders ONE bar through <PhoneLink/>, where the label and the tel: href are both
 * derived from client.phone.e164 and cannot diverge.
 *
 * Both source strings survive: the desktop label wrapper ("Call ") and the mobile
 * sub-text ("Tap To Call") ship together on the one control.
 *
 * The bar is sticky. On a phone the most valuable thing on this page is a reachable
 * call button, and structure.md §3 records that the source has no sticky or floating
 * call control at all — the header scrolls away and the next one is in the footer.
 */

import type { ResolvedClient } from '../../../schema/resolve';
import { HeaderBrand } from '../../../components/HeaderBrand';
import { PhoneLink } from '../../../components/PhoneLink';
import type { Copy } from './shared';

export function Header({ client, copy }: { client: ResolvedClient; copy: Copy }) {
  const label = `${copy('header.callPrefix')}${client.phoneDisplay}`;

  return (
    <header className="ta-header">
      <div className="ta-container ta-header-inner">
        {/* The prominent brand lockup: logo + name. No logo file on the record
            renders the name alone as a wordmark, never a broken image (R5). */}
        <HeaderBrand client={client} />

        <PhoneLink
          client={client}
          className="ta-call ta-call--bar"
          subLabel={copy('header.tapToCall')}
          placement="header"
        >
          {label}
        </PhoneLink>
      </div>
    </header>
  );
}
