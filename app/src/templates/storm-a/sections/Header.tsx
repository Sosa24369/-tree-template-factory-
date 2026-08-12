/**
 * Header — logo, a licence chip, and one phone CTA. Sticky, because on a storm page
 * the most valuable thing on the screen is a reachable call button. The chip is
 * desktop-only; on a phone the bar holds the number and nothing else.
 */

import type { ResolvedClient } from '../../../schema/resolve';
import { SafeLogo, SafeText } from '../../../components/Safe';
import { PhoneLink } from '../../../components/PhoneLink';
import { ShieldIcon, type Copy } from './shared';

export function Header({ client, copy }: { client: ResolvedClient; copy: Copy }) {
  const badge = copy('header.badge');

  return (
    <header className="st-header">
      <div className="st-container st-header-inner">
        {/* No logo file renders the client's name as a wordmark, never a broken image (R5). */}
        <SafeLogo
          logoUrl={client.brand?.logoUrl}
          clientName={client.name}
          className="st-logo"
          srcset={client.brand?.logoSrcset}
          width={client.brand?.logoWidth}
          height={client.brand?.logoHeight}
          sizes="(min-width: 768px) 88px, 60px"
          priority
        />

        <div className="st-header-right">
          {badge.trim() && (
            <span className="st-header-badge">
              <ShieldIcon />
              <SafeText as="span" value={badge} />
            </span>
          )}
          <PhoneLink client={client} className="st-call st-call--bar" subLabel={copy('header.callSub')} placement="header" />
        </div>
      </div>
    </header>
  );
}
