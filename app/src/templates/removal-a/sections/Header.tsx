/**
 * S1 (part 1) — the header bar: logo + one phone CTA.
 *
 * The source ships TWO header rows, a desktop copy and a mobile copy, hidden from
 * each other with .desktop-only/.mobile-only — and they show different numbers
 * dialling different lines. That duplication is a GHL builder artifact, not copy, so
 * this renders ONE header and makes it responsive with CSS (R2 permits the design
 * change; the strings are untouched).
 *
 * The bar is sticky: on a phone, the single most valuable thing on the page is a
 * reachable call button, and the source has no sticky or floating bar at all.
 */

import type { ResolvedClient } from '../../../schema/resolve';
import { HeaderBrand } from '../../../components/HeaderBrand';
import { PhoneLink } from '../../../components/PhoneLink';
import type { Copy } from './shared';

export function Header({ client, copy }: { client: ResolvedClient; copy: Copy }) {
  return (
    <header className="ra-header">
      <div className="ra-container ra-header-inner">
        {/* The prominent brand lockup: logo + name. No logo file on the record
            renders the name alone as a wordmark, never a broken image (R5). */}
        <HeaderBrand client={client} />

        <PhoneLink
          client={client}
          className="ra-call ra-call--bar"
          subLabel={copy('header.tapToCall')}
          placement="header"
        />
      </div>
    </header>
  );
}
