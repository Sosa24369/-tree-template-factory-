/**
 * removal-b — pieces shared by more than one section.
 *
 * R1: nothing in here holds a client-specific literal. Everything renders from the
 * ResolvedClient it is handed or from a copy key.
 *
 * Icons are inline SVG. No icon font, no sprite, no extra request, and they inherit
 * currentColor so they follow the brand custom properties set on the wrapper.
 */

import type { ElementType, ReactNode } from 'react';
import type { ResolvedClient } from '../../../schema/resolve';
import { PhoneLink } from '../../../components/PhoneLink';

/** The resolver returned by makeCopy(client, 'removal-b', removalBCopy). */
export type Copy = (key: string) => string;

/**
 * The id of the estimate form.
 *
 * It lives here rather than in the section that owns it because FOUR places link to
 * it — the hero's secondary CTA, the mobile action bar, the final CTA and the
 * header — and importing the section from each of them would create a cycle. Every
 * one of those is an ordinary in-page anchor, not a scripted scroll, so it works
 * before hydration and survives a JS failure.
 */
export const FORM_ANCHOR = 'rb-estimate';

/**
 * Two-part heading. The second part is painted in the accent colour, and the word
 * gap lives in the trailing space of the first part — so the parts are rendered as
 * separate spans and never trimmed.
 *
 * Renders nothing at all when both parts are empty, rather than an empty heading
 * that still occupies its margins (R5).
 */
export function Heading({
  as: Tag = 'h2',
  className,
  parts,
  id,
}: {
  as?: ElementType;
  className?: string;
  parts: string[];
  id?: string;
}) {
  if (!parts.join('').trim()) return null;

  // The accent follows the part's ORIGINAL position, not its position after empty
  // parts are dropped — so an override that blanks the first half still paints the
  // second half in the accent colour instead of silently promoting it.
  return (
    <Tag className={className} id={id}>
      {parts.map((part, i) =>
        typeof part === 'string' && part.length > 0 ? (
          <span key={i} className={i === 0 ? undefined : 'rb-accent'}>
            {part}
          </span>
        ) : null,
      )}
    </Tag>
  );
}

/**
 * Section shell. `tone` picks the surface; `reveal` opts the block into the
 * scroll-linked entrance animation, which is pure CSS (view() timeline) and is
 * simply absent in browsers that do not support it — the content is visible by
 * default and the animation only ever adds to it.
 */
export function Section({
  id,
  tone = 'paper',
  className,
  children,
}: {
  id?: string;
  tone?: 'paper' | 'tint' | 'ink';
  className?: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className={['rb-section', `rb-section--${tone}`, className].filter(Boolean).join(' ')}>
      <div className="rb-container">{children}</div>
    </section>
  );
}

/** Small uppercase kicker above a heading. Hidden entirely when empty (R5). */
export function Eyebrow({ children }: { children: string }) {
  if (!children.trim()) return null;
  return (
    <p className="rb-eyebrow">
      <span className="rb-eyebrow-dot" aria-hidden="true" />
      {children}
    </p>
  );
}

/**
 * The call CTA. Rendered through <PhoneLink/> — the only route a number takes to
 * the DOM — so the display string and the tel: href both derive from the single
 * client.phone.e164 and cannot diverge.
 *
 * `prefix` renders "Call " + the number as ONE interpolated string, so the number
 * stays a single uninterrupted text node for CallRail's DOM scan (P4).
 */
export function CallCta({
  client,
  copy,
  placement,
  tone = 'accent',
  size = 'lg',
  prefix = false,
  subKey = 'cta.callSub',
  className,
}: {
  client: ResolvedClient;
  copy: Copy;
  placement: string;
  tone?: 'accent' | 'paper' | 'outline';
  size?: 'lg' | 'sm';
  prefix?: boolean;
  subKey?: string;
  className?: string;
}) {
  const label = prefix ? `${copy('cta.callPrefix')}${client.phoneDisplay}` : undefined;

  return (
    <PhoneLink
      client={client}
      className={['rb-call', `rb-call--${tone}`, `rb-call--${size}`, className].filter(Boolean).join(' ')}
      subLabel={copy(subKey)}
      placement={placement}
    >
      {label}
    </PhoneLink>
  );
}

/* ------------------------------------------------------------------ *
 * Inline icons
 * ------------------------------------------------------------------ */

export function CheckIcon() {
  return (
    <svg className="rb-icon" viewBox="0 0 20 20" width="20" height="20" aria-hidden="true" focusable="false">
      <path d="M4.5 10.6l3.2 3.2 7.8-7.8" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function ShieldIcon() {
  return (
    <svg className="rb-icon" viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" focusable="false">
      <path d="M12 3l7 2.6v5.2c0 4.6-3 8.2-7 10.2-4-2-7-5.6-7-10.2V5.6L12 3z" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
      <path d="M8.8 12.1l2.2 2.2 4.2-4.4" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function StarIcon() {
  return (
    <svg className="rb-icon" viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" focusable="false">
      <path d="M12 3.6l2.5 5.3 5.6.8-4.1 4 1 5.7-5-2.7-5 2.7 1-5.7-4.1-4 5.6-.8L12 3.6z" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
    </svg>
  );
}

export function BoltIcon() {
  return (
    <svg className="rb-icon" viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" focusable="false">
      <path d="M13.2 3L6 13.4h4.6L10 21l7.4-10.6h-4.8L13.2 3z" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
    </svg>
  );
}

export function BroomIcon() {
  return (
    <svg className="rb-icon" viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" focusable="false">
      <path d="M14.6 3.6l5.8 5.8" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      <path d="M17.5 6.5l-6.6 6.6 3.5 3.5L21 10" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
      <path d="M10.9 13.1L4.2 19.8 8.5 21l5.9-4.4" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
    </svg>
  );
}

/** The risk marker used by the diagnostic section. */
export function AlertIcon() {
  return (
    <svg className="rb-icon" viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" focusable="false">
      <path d="M12 4.2l8.4 14.6H3.6L12 4.2z" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
      <path d="M12 10v3.6" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" />
      <circle cx="12" cy="16.4" r="1.05" fill="currentColor" />
    </svg>
  );
}

export function PinIcon() {
  return (
    <svg className="rb-icon rb-icon--pin" viewBox="0 0 24 24" width="15" height="15" aria-hidden="true" focusable="false">
      <path d="M12 22s7-6.1 7-11a7 7 0 10-14 0c0 4.9 7 11 7 11z" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinejoin="round" />
      <circle cx="12" cy="11" r="2.6" fill="none" stroke="currentColor" strokeWidth="1.9" />
    </svg>
  );
}

/** FAQ disclosure indicator. Becomes a minus with [open] in CSS. */
export function PlusIcon() {
  return (
    <svg className="rb-icon rb-icon--plus" viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" focusable="false">
      <path className="rb-plus-bar" d="M5 12h14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path className="rb-plus-bar rb-plus-bar--v" d="M12 5v14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

/** Quotation mark drawn as type-scale artwork behind a review card. */
export function QuoteMark() {
  return (
    <svg className="rb-quote-mark" viewBox="0 0 48 36" width="48" height="36" aria-hidden="true" focusable="false">
      <path
        d="M20 36V19.2C20 8.9 26 2 36.4 0L38 4.6c-5.6 1.6-8.6 5-8.9 10.2H36V36H20zM0 36V19.2C0 8.9 6 2 16.4 0L18 4.6c-5.6 1.6-8.6 5-8.9 10.2H16V36H0z"
        fill="currentColor"
      />
    </svg>
  );
}
