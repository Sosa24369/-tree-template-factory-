/**
 * Header — logo, a licence chip, and one phone CTA. Sticky, because on a storm page
 * the most valuable thing on the screen is a reachable call button. The chip is
 * desktop-only; on a phone the bar holds the number and nothing else.
 */

import type { ResolvedClient } from '../../../schema/resolve';
import { SafeText } from '../../../components/Safe';
import { HeaderBrand } from '../../../components/HeaderBrand';
import { PhoneLink } from '../../../components/PhoneLink';
import { ShieldIcon, type Copy } from './shared';

export function Header({ client, copy }: { client: ResolvedClient; copy: Copy }) {
  const badge = copy('header.badge');

  return (
    <header className="st-header">
      <div className="st-container st-header-inner">
        {/* The prominent brand lockup: logo + name (name in the on-ink colour —
            this header is dark). No logo file renders the name alone (R5). */}
        <HeaderBrand client={client} />

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
