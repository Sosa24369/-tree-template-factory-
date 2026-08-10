/**
 * removal-a — pieces shared by more than one section.
 *
 * Nothing in here holds a client-specific literal (R1); everything renders from
 * the ResolvedClient it is handed or from a copy key.
 */

import type { ElementType, ReactNode } from 'react';
import type { ResolvedClient } from '../../../schema/resolve';
import { PhoneLink } from '../../../components/PhoneLink';

/** The resolver returned by makeCopy(client, 'removal-a', removalACopy). */
export type Copy = (key: string) => string;

/**
 * The source splits most headings across two or three nodes so it can style them
 * differently, and the word gap lives inside one of the parts. Concatenating the
 * parts in order is therefore mandatory, and trimming any of them fuses two words.
 * This renders each part in its own <span> so the leading/trailing spaces survive.
 *
 * `stacked` is for the two headings whose parts carry NO gap between them —
 * why.h1a + why.h1b and process.h1a + process.h1b — where the source relies on the
 * parts being separate lines. Inline them and you get "HomeownersChoose".
 */
export function SplitHeading({
  as: Tag = 'h2',
  className,
  parts,
  accent = 1,
  stacked = false,
  id,
}: {
  as?: ElementType;
  className?: string;
  parts: string[];
  /** Index of the part painted in the accent colour. -1 for none. */
  accent?: number;
  stacked?: boolean;
  id?: string;
}) {
  const joined = parts.join('');
  if (!joined.trim()) return null; // R5 — no empty heading with margins

  return (
    <Tag className={[className, stacked ? 'ra-heading--stacked' : null].filter(Boolean).join(' ')} id={id}>
      {parts.map((part, i) => (
        <span key={i} className={i === accent ? 'ra-accent' : undefined}>
          {part}
        </span>
      ))}
    </Tag>
  );
}

/**
 * The call CTA shared by S3, S4, S5, S6 and S9.
 *
 * Rendered through <PhoneLink/> — the only route a number takes to the DOM — so the
 * display string and the tel: href are both derived from the one client.phone.e164
 * and cannot diverge the way the source's did.
 *
 * `prefix` reproduces the S3 desktop treatment, "Call " + the number. It is passed
 * as ONE interpolated string so the number stays a single uninterrupted text node,
 * which is what CallRail's DOM scan needs (P4).
 */
export function CallCta({
  client,
  copy,
  placement,
  tone = 'solid',
  prefix = false,
  className,
}: {
  client: ResolvedClient;
  copy: Copy;
  placement: string;
  tone?: 'solid' | 'outline' | 'onDark';
  prefix?: boolean;
  className?: string;
}) {
  const label = prefix ? `${copy('cta.callLabelPrefix')}${client.phoneDisplay}` : undefined;

  return (
    <PhoneLink
      client={client}
      className={['ra-call', `ra-call--${tone}`, className].filter(Boolean).join(' ')}
      subLabel={copy('cta.callSubLabel')}
      placement={placement}
    >
      {label}
    </PhoneLink>
  );
}

/** Section shell: consistent vertical rhythm and one place to set the tone. */
export function Section({
  id,
  tone = 'light',
  className,
  children,
}: {
  id?: string;
  tone?: 'light' | 'tint' | 'dark' | 'plate';
  className?: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className={['ra-section', `ra-section--${tone}`, className].filter(Boolean).join(' ')}>
      <div className="ra-container">{children}</div>
    </section>
  );
}

/* ------------------------------------------------------------------ *
 * Inline icons. No icon font, no sprite, no request — and they inherit
 * currentColor, so they follow the brand custom properties.
 * ------------------------------------------------------------------ */

export function CheckIcon() {
  return (
    <svg className="ra-icon" viewBox="0 0 20 20" width="20" height="20" aria-hidden="true" focusable="false">
      <path
        d="M4.5 10.6l3.2 3.2 7.8-7.8"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** The city-pill map pin. The source inlines this same glyph 50 times. */
export function PinIcon() {
  return (
    <svg className="ra-icon ra-icon--pin" viewBox="0 0 24 24" width="15" height="15" aria-hidden="true" focusable="false">
      <path
        d="M12 22s7-6.1 7-11a7 7 0 10-14 0c0 4.9 7 11 7 11z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.9"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="11" r="2.6" fill="none" stroke="currentColor" strokeWidth="1.9" />
    </svg>
  );
}

/** FAQ disclosure indicator. Rotates with [open] in CSS. */
export function ChevronIcon() {
  return (
    <svg className="ra-icon ra-icon--chevron" viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" focusable="false">
      <path d="M6 9.5l6 6 6-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
