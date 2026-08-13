/**
 * Header — logo, a credential chip, and one phone CTA.
 *
 * Sticky, because on a phone the most valuable thing on the page is a reachable
 * call button. The credential chip is the variant's tell: removal-a's bar carries
 * the offer, this one carries the licence, because this page argues from trust
 * rather than from price.
 *
 * The chip is desktop-only — on a phone the bar has room for the number and
 * nothing else, and the same claim reappears immediately in the hero chip row.
 */

import type { ResolvedClient } from '../../../schema/resolve';
import { SafeText } from '../../../components/Safe';
import { HeaderBrand } from '../../../components/HeaderBrand';
import { PhoneLink } from '../../../components/PhoneLink';
import { ShieldIcon, type Copy } from './shared';

export function Header({ client, copy }: { client: ResolvedClient; copy: Copy }) {
  const badge = copy('header.badge');

  return (
    <header className="rb-header">
      <div className="rb-container rb-header-inner">
        {/* The prominent brand lockup: logo + name. No logo file on the record
            renders the name alone as a wordmark, never a broken image (R5). */}
        <HeaderBrand client={client} />

        <div className="rb-header-right">
          {badge.trim() && (
            <span className="rb-header-badge">
              <ShieldIcon />
              <SafeText as="span" value={badge} />
            </span>
          )}

          <PhoneLink client={client} className="rb-call rb-call--bar" subLabel={copy('header.callSub')} placement="header" />
        </div>
      </div>
    </header>
  );
}
