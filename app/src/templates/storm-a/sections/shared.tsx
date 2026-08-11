/**
 * storm — pieces shared by more than one section, and by BOTH storm variants.
 *
 * storm-a and storm-b are a copy + palette A/B of ONE page: they render the same
 * section components (storm-b imports them from here) so the only attributable
 * differences are the hero message and the colour scheme. That is why the scope
 * class is `.storm` (shared) rather than a per-variant prefix — the structural CSS
 * is written once and both wrappers wear it, while the palette rides in on the
 * --brand-* custom properties each variant sets.
 *
 * R1: nothing here holds a client-specific literal. Everything renders from the
 * ResolvedClient it is handed or from a copy key. Icons are inline SVG — no icon
 * font, no sprite, no extra request — and inherit currentColor so they follow the
 * brand.
 */

import type { ElementType, ReactNode } from 'react';
import type { ResolvedClient } from '../../../schema/resolve';
import { PhoneLink } from '../../../components/PhoneLink';

/** The resolver returned by makeCopy(client, 'storm-a'|'storm-b', defaults). */
export type Copy = (key: string) => string;

/**
 * The id of the assessment form. It lives here rather than in the section that owns
 * it because the header, the hero, the sticky bar and the final CTA all link to it,
 * and importing the section from each would create a cycle. Every one of those is an
 * ordinary in-page anchor, so it works before hydration and survives a JS failure.
 */
export const FORM_ANCHOR = 'st-assessment';

/**
 * Two-part heading. The second part is painted in the accent colour; the word gap
 * lives in the trailing space of the first part, so the parts are separate spans and
 * never trimmed. Renders nothing when both parts are empty (R5).
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
  return (
    <Tag className={className} id={id}>
      {parts.map((part, i) =>
        typeof part === 'string' && part.length > 0 ? (
          <span key={i} className={i === 0 ? undefined : 'st-accent'}>
            {part}
          </span>
        ) : null,
      )}
    </Tag>
  );
}

/** Section shell. `tone` picks the surface. */
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
    <section id={id} className={['st-section', `st-section--${tone}`, className].filter(Boolean).join(' ')}>
      <div className="st-container">{children}</div>
    </section>
  );
}

/** Small uppercase kicker above a heading. Hidden entirely when empty (R5). */
export function Eyebrow({ children }: { children: string }) {
  if (!children.trim()) return null;
  return (
    <p className="st-eyebrow">
      <span className="st-eyebrow-dot" aria-hidden="true" />
      {children}
    </p>
  );
}

/**
 * The call CTA. Rendered through <PhoneLink/> — the only route a number takes to the
 * DOM — so the display string and the tel: href both derive from the single
 * client.phone.e164 and cannot diverge. `prefix` renders "Call " + the number as ONE
 * interpolated string, so the number stays a single uninterrupted text node for
 * CallRail's DOM scan (P4).
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
      className={['st-call', `st-call--${tone}`, `st-call--${size}`, className].filter(Boolean).join(' ')}
      subLabel={copy(subKey)}
      placement={placement}
    >
      {label}
    </PhoneLink>
  );
}

/* ------------------------------------------------------------------ *
 * Inline icons — all inherit currentColor.
 * ------------------------------------------------------------------ */

export function CheckIcon() {
  return (
    <svg className="st-icon" viewBox="0 0 20 20" width="20" height="20" aria-hidden="true" focusable="false">
      <path d="M4.5 10.6l3.2 3.2 7.8-7.8" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function ShieldIcon() {
  return (
    <svg className="st-icon" viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" focusable="false">
      <path d="M12 3l7 2.6v5.2c0 4.6-3 8.2-7 10.2-4-2-7-5.6-7-10.2V5.6L12 3z" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
      <path d="M8.8 12.1l2.2 2.2 4.2-4.4" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function StarIcon() {
  return (
    <svg className="st-icon" viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" focusable="false">
      <path d="M12 3.6l2.5 5.3 5.6.8-4.1 4 1 5.7-5-2.7-5 2.7 1-5.7-4.1-4 5.6-.8L12 3.6z" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
    </svg>
  );
}

/** Speed / urgency marker. */
export function BoltIcon() {
  return (
    <svg className="st-icon" viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" focusable="false">
      <path d="M13.2 3L6 13.4h4.6L10 21l7.4-10.6h-4.8L13.2 3z" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
    </svg>
  );
}

/** Cleanup / haul-away. */
export function BroomIcon() {
  return (
    <svg className="st-icon" viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" focusable="false">
      <path d="M14.6 3.6l5.8 5.8" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      <path d="M17.5 6.5l-6.6 6.6 3.5 3.5L21 10" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
      <path d="M10.9 13.1L4.2 19.8 8.5 21l5.9-4.4" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
    </svg>
  );
}

/** A downed / cracked tree — the "Trees" service group marker. */
export function TreeIcon() {
  return (
    <svg className="st-icon" viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" focusable="false">
      <path d="M12 3c3.3 0 5.5 2.4 5.5 5.2 0 .9-.2 1.7-.6 2.4 1 .7 1.6 1.9 1.6 3.2 0 2.3-1.9 4-4.4 4H9.4C6.9 17.8 5 16.1 5 13.8c0-1.3.6-2.5 1.6-3.2-.4-.7-.6-1.5-.6-2.4C6 5.4 8.7 3 12 3z" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M12 17.8V22" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}

/** A fence line — the "Fences" service group marker. */
export function FenceIcon() {
  return (
    <svg className="st-icon" viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" focusable="false">
      <path d="M6 9l1.6-2.4L9.2 9v9H6V9zM14.8 9l1.6-2.4L18 9v9h-3.2V9z" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M3.5 11.5h17M3.5 15h17" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

/** Insurance documentation marker. */
export function DocIcon() {
  return (
    <svg className="st-icon" viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" focusable="false">
      <path d="M7 3h6.5L18 7.5V21H7a1 1 0 01-1-1V4a1 1 0 011-1z" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M13 3v5h5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M9 12.5h6M9 15.5h6M9 18h4" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

/** The safety / hazard marker used on the 911 line. */
export function AlertIcon() {
  return (
    <svg className="st-icon" viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" focusable="false">
      <path d="M12 4.2l8.4 14.6H3.6L12 4.2z" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
      <path d="M12 10v3.6" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" />
      <circle cx="12" cy="16.4" r="1.05" fill="currentColor" />
    </svg>
  );
}

export function PinIcon() {
  return (
    <svg className="st-icon st-icon--pin" viewBox="0 0 24 24" width="15" height="15" aria-hidden="true" focusable="false">
      <path d="M12 22s7-6.1 7-11a7 7 0 10-14 0c0 4.9 7 11 7 11z" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinejoin="round" />
      <circle cx="12" cy="11" r="2.6" fill="none" stroke="currentColor" strokeWidth="1.9" />
    </svg>
  );
}

/** FAQ disclosure indicator. Becomes a minus with [open] in CSS. */
export function PlusIcon() {
  return (
    <svg className="st-icon st-icon--plus" viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" focusable="false">
      <path className="st-plus-bar" d="M5 12h14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path className="st-plus-bar st-plus-bar--v" d="M12 5v14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
