/**
 * trimming-a — pieces shared by more than one section.
 *
 * Nothing in here holds a client-specific literal (R1); everything renders from the
 * ResolvedClient it is handed or from a copy key. No icon library, no carousel, no
 * animation library — the icons below are inline SVG that inherit currentColor, so
 * they follow the brand custom properties and cost zero network requests.
 */

import type { ElementType, ReactNode } from 'react';
import type { ResolvedClient } from '../../../schema/resolve';
import { PhoneLink } from '../../../components/PhoneLink';

/** The resolver returned by makeCopy(client, 'trimming-a', trimmingACopy). */
export type Copy = (key: string) => string;

/**
 * The source splits nearly every heading across two or three nodes so it can style
 * them differently, and the word gap lives inside one of the parts:
 *
 *   'Tree Trimming ' + 'Done Clean, Done Right'
 *   'Top 10 ' + 'Frequently Asked Question' + ' About Tree Trimming'
 *
 * So the parts are concatenated in order and each keeps its own <span>, which is
 * what preserves the leading/trailing space through HTML whitespace collapsing.
 * Trim any part and two words fuse.
 *
 * `stacked` is for the headings whose parts carry NO gap at all because the source
 * authored them as two separate <h1> elements — why, process, readyCta, finalCta.
 * Inline them and you get "HomeownersChoose".
 *
 * `accent` is which part takes the brand accent colour. It is not always the second
 * one: Section 8 colours 'Areas ' and leaves 'We Serve' plain.
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
  if (!joined.trim()) return null; // R5 — never an empty heading with margins

  return (
    <Tag className={[className, stacked ? 'ta-heading--stacked' : null].filter(Boolean).join(' ')} id={id}>
      {parts.map((part, i) => (
        <span key={i} className={i === accent ? 'ta-accent' : undefined}>
          {part}
        </span>
      ))}
    </Tag>
  );
}

/** A short brand rule that sits above a section heading. Purely decorative. */
export function Rule() {
  return <span className="ta-rule" aria-hidden="true" />;
}

/**
 * The call CTA shared by S4, S5, S6, S7 and the S10 "Ready" band — five of the six
 * placements the source gives it.
 *
 * Rendered through <PhoneLink/>, the only route a number takes to the DOM, so the
 * display string and the tel: href are both derived from the one client.phone.e164.
 * The source needs that: it carries TWO different numbers split by breakpoint, and
 * five different display strings across nine anchors, which is why structure.md
 * warns that a CallRail rule keyed on visible text will miss at least one control.
 *
 * `prefix` reproduces the source's "Call " + number label. It is passed as ONE
 * interpolated string so the number stays a single uninterrupted text node — that
 * is what CallRail's DOM scan needs at P4.
 */
export function CallCta({
  client,
  copy,
  placement,
  tone = 'solid',
  prefix = true,
  className,
}: {
  client: ResolvedClient;
  copy: Copy;
  placement: string;
  tone?: 'solid' | 'ghost' | 'onDeep';
  prefix?: boolean;
  className?: string;
}) {
  const label = prefix ? `${copy('cta.callLabelPrefix')}${client.phoneDisplay}` : undefined;

  return (
    <PhoneLink
      client={client}
      className={['ta-call', `ta-call--${tone}`, className].filter(Boolean).join(' ')}
      subLabel={copy('cta.callSubLabel')}
      placement={placement}
    >
      {label}
    </PhoneLink>
  );
}

/**
 * The CTA and the band of space around it, together — so a record with no phone
 * number leaves NO empty padded row behind (R5). <PhoneLink/> already returns null
 * without a number; this stops the wrapper outliving it.
 */
export function CallRow({
  client,
  copy,
  placement,
  tone = 'solid',
}: {
  client: ResolvedClient;
  copy: Copy;
  placement: string;
  tone?: 'solid' | 'ghost' | 'onDeep';
}) {
  if (!client.phoneHref) return null;
  return (
    <div className="ta-cta-row">
      <CallCta client={client} copy={copy} placement={placement} tone={tone} />
    </div>
  );
}

/**
 * The two scroll-to-form buttons (S10 mid-page, S12 final).
 *
 * In the source both are GHL `scroll-to-element` actions, i.e. JavaScript. Here each
 * is an ordinary in-page link to the form's id, so it works before hydration,
 * survives a JS error and can be opened in a new tab. Neither dials — the source's
 * do not either, despite sub-texts reading "Request a call back" and "Click to call".
 */
export function FormCta({
  href,
  label,
  sub,
  tone = 'solid',
}: {
  href: string;
  label: string;
  sub: string;
  tone?: 'solid' | 'onDeep';
}) {
  if (!label.trim()) return null;
  return (
    <a className={['ta-btn', `ta-btn--${tone}`].filter(Boolean).join(' ')} href={href}>
      <span className="ta-btn-label">{label}</span>
      {sub.trim() ? <span className="ta-btn-sub">{sub}</span> : null}
      <ArrowIcon />
    </a>
  );
}

/** Section shell: one place for vertical rhythm and surface tone. */
export function Section({
  id,
  tone = 'paper',
  className,
  children,
}: {
  id?: string;
  tone?: 'paper' | 'canvas' | 'tint' | 'deep';
  className?: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className={['ta-section', `ta-section--${tone}`, className].filter(Boolean).join(' ')}>
      <div className="ta-container">{children}</div>
    </section>
  );
}

/* ------------------------------------------------------------------ *
 * Inline icons. No icon font, no sprite, no request — and they inherit
 * currentColor, so they follow the brand custom properties.
 * ------------------------------------------------------------------ */

export function ArrowIcon() {
  return (
    <svg className="ta-icon ta-icon--arrow" viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" focusable="false">
      <path d="M4 12h15M13 6l6 6-6 6" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** The bullet marker for the benefit cards, the service columns and the requests. */
export function CheckIcon() {
  return (
    <svg className="ta-icon ta-icon--check" viewBox="0 0 20 20" width="18" height="18" aria-hidden="true" focusable="false">
      <path d="M4.2 10.4l3.4 3.4 8.2-8.2" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** Service-area tag marker, and the footer address marker. */
export function PinIcon() {
  return (
    <svg className="ta-icon ta-icon--pin" viewBox="0 0 24 24" width="15" height="15" aria-hidden="true" focusable="false">
      <path d="M12 22s7-6.1 7-11a7 7 0 10-14 0c0 4.9 7 11 7 11z" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinejoin="round" />
      <circle cx="12" cy="11" r="2.6" fill="none" stroke="currentColor" strokeWidth="1.9" />
    </svg>
  );
}

/** Footer contact box. Replaces the source's two 32x32 <img> icons. */
export function HandsetIcon() {
  return (
    <svg className="ta-icon ta-icon--handset" viewBox="0 0 24 24" width="15" height="15" aria-hidden="true" focusable="false">
      <path
        d="M6.5 3h2.2l1.6 4-1.9 1.4a12.5 12.5 0 006.2 6.2L16 12.7l4 1.6v2.2A2.5 2.5 0 0117.4 19 14.4 14.4 0 015 6.6 2.5 2.5 0 016.5 3z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  );
}
