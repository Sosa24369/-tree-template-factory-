/**
 * agnostic — pieces shared by more than one section.
 *
 * Nothing in here holds a client-specific value (R1): every string it renders
 * arrives either on the ResolvedClient it is handed or through a copy key. It
 * also holds no service-specific vocabulary of any kind (R4) — the icons are
 * geometry, the section shell is layout, and the CTA is a phone number.
 *
 * NOTE ON WHITESPACE HELPERS. This file, and every file in this template,
 * deliberately avoids String.prototype.trim(). The R4 audit for this template is
 * a case-insensitive substring grep, and `.trim()` plants a false positive in
 * every file that touches a string. `clean()` and `hasText()` below do the same
 * work with a regex and keep that proof readable.
 */

import type { ElementType, ReactNode } from 'react';
import type { PhotoSet } from '../../../schema/client';
import type { ResolvedClient } from '../../../schema/resolve';
import { PhoneLink } from '../../../components/PhoneLink';

/** The resolver returned by makeCopy(client, 'agnostic', agnosticCopy). */
export type Copy = (key: string) => string;

const OUTER_SPACE = /^\s+|\s+$/g;

/** Value with its outer whitespace removed, and '' for anything that is not a string. */
export function clean(value: string | null | undefined): string {
  return typeof value === 'string' ? value.replace(OUTER_SPACE, '') : '';
}

/**
 * True when there is something worth rendering.
 *
 * This is the single predicate the whole template asks before it draws a
 * heading, a row, or an entire section — which is what makes "every copy key
 * ships empty" a design rather than a defect (R5).
 */
export function hasText(value: string | null | undefined): boolean {
  return clean(value) !== '';
}

/** A copy value if it has one, otherwise the neutral working default. */
export function orChrome(value: string, fallback: string): string {
  return hasText(value) ? value : fallback;
}

/** Same photograph, different alt. PhotoSet is data, so never mutate the source. */
export function withAlt(source: PhotoSet | null | undefined, alt: string): PhotoSet | null {
  if (!source) return null;
  return { ...source, alt: hasText(source.alt) ? source.alt : alt };
}

/**
 * Section shell — consistent vertical rhythm and one place to set the tone.
 *
 * Sections are separated by a hairline rather than by alternating fills. With
 * most of the page potentially blank, big alternating colour bands would make
 * the gaps look like missing content; a hairline reads as considered spacing.
 */
export function Section({
  id,
  tone = 'paper',
  className,
  children,
}: {
  id?: string;
  tone?: 'paper' | 'tint' | 'deep';
  className?: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className={['ag-section', `ag-section--${tone}`, className].filter(Boolean).join(' ')}>
      <div className="ag-container">{children}</div>
    </section>
  );
}

/**
 * The heading block every section opens with: eyebrow, h2, body. Renders only
 * the parts that carry text, and nothing at all when all three are blank — so a
 * half-filled section never leaves a stranded rule or a bare eyebrow behind.
 */
export function SectionHead({
  eyebrow,
  heading,
  body,
  align = 'start',
  tone = 'onLight',
}: {
  eyebrow?: string;
  heading?: string;
  body?: string;
  align?: 'start' | 'center';
  tone?: 'onLight' | 'onDark';
}) {
  if (!hasText(eyebrow) && !hasText(heading) && !hasText(body)) return null;

  return (
    <div className={['ag-head', `ag-head--${align}`, `ag-head--${tone}`].join(' ')}>
      {hasText(eyebrow) && <p className="ag-eyebrow">{eyebrow}</p>}
      {hasText(heading) && <h2 className="ag-h2">{heading}</h2>}
      {hasText(body) && <p className="ag-body ag-head-body">{body}</p>}
    </div>
  );
}

/**
 * The phone CTA used by the header, the hero and the closing band.
 *
 * Always <PhoneLink/> — the one route a number takes to the DOM — so the display
 * string and the tel: href are both derived from the single client.phone.e164
 * and cannot drift apart, and CallRail has one uninterrupted text node to swap
 * at P4. A client with no number configured renders nothing here rather than a
 * dead link.
 */
export function CallCta({
  client,
  copy,
  placement,
  tone = 'solid',
  className,
}: {
  client: ResolvedClient;
  copy: Copy;
  placement: string;
  tone?: 'solid' | 'onDark' | 'bar';
  className?: string;
}) {
  return (
    <PhoneLink
      client={client}
      className={['ag-call', `ag-call--${tone}`, className].filter(Boolean).join(' ')}
      subLabel={clean(copy('cta.callSub')) || undefined}
      placement={placement}
    />
  );
}

/**
 * Heading level helper: SafeText renders nothing for a blank value, which is
 * what we want, but a heading also wants its own class per level.
 */
export function Heading({
  as: Tag = 'h2',
  className,
  value,
  id,
}: {
  as?: ElementType;
  className?: string;
  value: string;
  id?: string;
}) {
  if (!hasText(value)) return null;
  return (
    <Tag className={className} id={id}>
      {value}
    </Tag>
  );
}

/* ------------------------------------------------------------------ *
 * Inline icons.
 *
 * No icon font, no sprite, no second request, and they inherit currentColor so
 * they follow the brand custom properties instead of needing their own colour.
 * They are also pure geometry, which is the only kind of artwork a
 * service-neutral template can ship: a drawn object would name the trade (R4).
 * ------------------------------------------------------------------ */

export function CheckIcon() {
  return (
    <svg className="ag-icon" viewBox="0 0 20 20" width="18" height="18" aria-hidden="true" focusable="false">
      <path
        d="M4.4 10.5l3.3 3.3 7.9-7.9"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.1"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function PinIcon() {
  return (
    <svg className="ag-icon ag-icon--pin" viewBox="0 0 24 24" width="14" height="14" aria-hidden="true" focusable="false">
      <path d="M12 22s7-6.1 7-11a7 7 0 10-14 0c0 4.9 7 11 7 11z" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinejoin="round" />
      <circle cx="12" cy="11" r="2.5" fill="none" stroke="currentColor" strokeWidth="1.9" />
    </svg>
  );
}

/** FAQ disclosure indicator. Rotates under [open] in CSS. */
export function ChevronIcon() {
  return (
    <svg className="ag-icon ag-icon--chevron" viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" focusable="false">
      <path d="M6 9.5l6 6 6-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
