/**
 * S3 — four-item benefit strip, then the first big call CTA.
 *
 * The source renders the CTA twice (desktop "Call (682) 365-7478" → tel:+1682…,
 * mobile "682-452-0735" → tel:682-452-0735, a different line AND a non-E.164 href).
 * One CTA is rendered here, through <PhoneLink/>, so there is exactly one number
 * and one href on the page. The desktop "Call " prefix is kept.
 */

import type { ResolvedClient } from '../../../schema/resolve';
import { SafeImage, SafeText } from '../../../components/Safe';
import { altFor, benefitArt, benefitIcons, withAlt } from '../assets';
import { CallCta, Section, type Copy } from './shared';

export function Benefits({ client, copy }: { client: ResolvedClient; copy: Copy }) {
  const items = [1, 2, 3, 4].map((n) => copy(`benefits.item${n}`));
  const hasItems = items.some((text) => text.trim());

  return (
    <Section tone="light" className="ra-benefits">
      <div className="ra-split">
        <div className="ra-split-media">
          <SafeImage photo={withAlt(benefitArt, altFor(client.name, 1))} className="ra-media-img" />
        </div>

        <div className="ra-split-body">
          {hasItems && (
            <ul className="ra-benefit-list">
              {items.map((text, i) =>
                text.trim() ? (
                  <li className="ra-benefit" key={i}>
                    {/* Manifest SVGs: no measured intrinsic size, so the CSS gives
                        the icon a fixed box rather than letting it shift layout. */}
                    <SafeImage photo={benefitIcons[i]} className="ra-benefit-icon" />
                    <SafeText as="span" className="ra-benefit-text" value={text} />
                  </li>
                ) : null,
              )}
            </ul>
          )}

          <CallCta client={client} copy={copy} placement="benefits" prefix tone="solid" />
        </div>
      </div>
    </Section>
  );
}
