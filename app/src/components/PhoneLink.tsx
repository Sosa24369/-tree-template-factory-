/**
 * FIX 3 — the ONLY way a phone number reaches the DOM anywhere in the factory.
 *
 * The source pages diverged: the mobile header displayed 682-452-0735 while its href
 * dialled +14694021196 (which turned out to be a different client's tracking number).
 * Here the display string and the href are both derived from one `phone.e164`, so
 * they cannot drift apart.
 *
 * CallRail DNI readiness (installed at P4, not now):
 *  - The number is rendered as a single plain text node — never split across spans,
 *    never an image, never CSS `content` — so CallRail's DOM scan can find it.
 *  - One canonical display format across the whole site, so one swap target matches
 *    every instance.
 *  - `data-dni="phone"` gives a stable hook if a text-match rule proves unreliable.
 *  - If the DNI script fails to load, this renders the client's real number and
 *    dials it. Degrading to a working phone call is the whole point.
 */

import type { ReactNode } from 'react';
import type { ResolvedClient } from '../schema/resolve';

interface PhoneLinkProps {
  client: ResolvedClient;
  className?: string;
  /** Optional text shown INSTEAD of the number (e.g. "Tap to call"). The number still dials. */
  children?: ReactNode;
  /** Extra label rendered after the number, e.g. "Call Now For A Free Estimate Today". */
  subLabel?: string;
  /** Where this instance sits, for analytics + QA. */
  placement?: string;
  onClick?: () => void;
}

export function PhoneLink({ client, className, children, subLabel, placement, onClick }: PhoneLinkProps) {
  // R5: no number configured — render nothing rather than a dead "tel:" or "undefined".
  if (!client.phoneHref) return null;

  return (
    <a
      href={client.phoneHref}
      className={className}
      data-dni="phone"
      data-placement={placement}
      onClick={() => {
        // Harmless before GTM exists (P3 consumes it).
        window.dataLayer?.push({ event: 'click_to_call', placement: placement ?? 'unknown' });
        onClick?.();
      }}
    >
      {/* The number is one uninterrupted text node. Do not wrap parts of it. */}
      <span data-dni-text>{children ?? client.phoneDisplay}</span>
      {subLabel ? <span className="phone-sub">{subLabel}</span> : null}
    </a>
  );
}

/**
 * Convenience for CTAs whose visible text is NOT the number ("Click to call").
 * P0 found one of these in the source; a CallRail text-replacement rule would
 * silently miss it, so it is tagged the same way and flagged for P4.
 */
export function PhoneCta({ client, label, className, placement }: {
  client: ResolvedClient;
  label: string;
  className?: string;
  placement?: string;
}) {
  return (
    <PhoneLink client={client} className={className} placement={placement}>
      {label}
    </PhoneLink>
  );
}

declare global {
  interface Window {
    dataLayer?: Array<Record<string, unknown>>;
  }
}
