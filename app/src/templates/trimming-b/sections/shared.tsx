/**
 * trimming-b — pieces shared by more than one section.
 *
 * Nothing here holds a client-specific literal (R1). Every string is either a copy
 * key or comes off the ResolvedClient it is handed.
 */

import type { ElementType, ReactNode } from 'react';
import type { ResolvedClient } from '../../../schema/resolve';
import { PhoneLink } from '../../../components/PhoneLink';

/** The resolver returned by makeCopy(client, 'trimming-b', trimmingBCopy). */
export type Copy = (key: string) => string;

/**
 * The form lives at the BOTTOM of this template, so several sections above it need
 * to link down to it. The id is declared here rather than in the form's own module
 * so that Hero → Estimate never becomes an import cycle.
 */
export const FORM_ANCHOR = 'tb-walkthrough';

/**
 * Section shell. One vertical rhythm for the whole page and one place to change the
 * ground colour. `tone` is deliberately a two-value set — the calm of this design
 * comes from the page having three surfaces in total (paper, tint, and the single
 * ink ground the closing form sits on), not nine.
 */
export function Section({
  id,
  tone = 'paper',
  className,
  children,
}: {
  id?: string;
  tone?: 'paper' | 'tint';
  className?: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className={['tb-section', `tb-section--${tone}`, className].filter(Boolean).join(' ')}>
      <div className="tb-container">{children}</div>
    </section>
  );
}

/**
 * Small letter-spaced label above a heading. Renders nothing when the key is empty,
 * so an override that blanks it leaves no floating margin behind (R5).
 */
export function Eyebrow({ value }: { value: string | null | undefined }) {
  const text = typeof value === 'string' ? value.trim() : '';
  if (!text) return null;
  return <p className="tb-eyebrow">{text}</p>;
}

/**
 * A two-line display heading.
 *
 * Unlike removal-a's SplitHeading — which reassembles headings the source builder
 * had chopped in half, spaces and all — these halves are a deliberate typographic
 * break: each renders as its own line, and the second line takes the brand colour.
 * Because the break is structural, neither half needs a load-bearing space, and
 * either half may be empty (a client override that supplies one line gets one line).
 */
export function Display({
  as: Tag = 'h2',
  className,
  lines,
  id,
}: {
  as?: ElementType;
  className?: string;
  lines: Array<string | null | undefined>;
  id?: string;
}) {
  const parts = lines.map((line) => (typeof line === 'string' ? line.trim() : '')).filter(Boolean);
  if (parts.length === 0) return null; // R5 — never an empty heading with margins

  return (
    <Tag className={['tb-display', className].filter(Boolean).join(' ')} id={id}>
      {parts.map((part, i) => (
        <span key={i} className={i === 1 ? 'tb-display-line tb-display-line--accent' : 'tb-display-line'}>
          {part}
        </span>
      ))}
    </Tag>
  );
}

/**
 * The page's phone treatment: the number set large in the display face, with a quiet
 * sub-label under it. No pill, no arrow, no shadow — on this side of the test the
 * call CTA is a sentence, not a button.
 *
 * It goes through <PhoneLink/> like every other phone touchpoint in the factory, so
 * the display string and the tel: href both derive from the one client.phone.e164
 * and the number reaches the DOM as a single uninterrupted text node for CallRail.
 */
export function CallLine({
  client,
  copy,
  placement,
  subKey = 'header.callSub',
  className,
}: {
  client: ResolvedClient;
  copy: Copy;
  placement: string;
  subKey?: string;
  className?: string;
}) {
  return (
    <PhoneLink
      client={client}
      className={['tb-call', className].filter(Boolean).join(' ')}
      subLabel={copy(subKey)}
      placement={placement}
    />
  );
}

/* ------------------------------------------------------------------ *
 * Proof ordering
 * ------------------------------------------------------------------ */

export type Review = ResolvedClient['reviews'][number];

/**
 * This template splits the client's reviews across two places on the page: the
 * strongest one is set as a full-width pull quote early (Testimony), and whatever is
 * left is demoted to a quiet ledger near the bottom (Reviews). That split is the
 * proof-ordering half of the A/B — trimming-a shows all of them together, mid-page.
 *
 * Both sections derive their content from THIS function so the featured review can
 * never also appear in the ledger. Reviews with no body are dropped: an attributed
 * card with no quotation in it is worse than one fewer card (R5).
 */
export function splitReviews(client: ResolvedClient): { featured: Review | null; rest: Review[] } {
  const usable = (client.reviews ?? []).filter((r) => typeof r?.body === 'string' && r.body.trim());
  if (usable.length === 0) return { featured: null, rest: [] };
  return { featured: usable[0], rest: usable.slice(1) };
}

/* ------------------------------------------------------------------ *
 * Icons — inline SVG, currentColor, zero requests. There are two on the
 * whole page on purpose.
 * ------------------------------------------------------------------ */

/** Sits after the in-page link down to the form. */
export function ArrowDownIcon() {
  return (
    <svg className="tb-icon tb-icon--arrow" viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" focusable="false">
      <path d="M12 4.5v15M6 13.5l6 6 6-6" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** FAQ disclosure indicator. Rotates on [open] in CSS. */
export function PlusIcon() {
  return (
    <svg className="tb-icon tb-icon--plus" viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" focusable="false">
      <path d="M12 5v14M5 12h14" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

/**
 * Alt text for a client photograph that arrived without any.
 *
 * Composed from client.name at render time rather than written into the template,
 * because a literal alt string would hardcode a company name (R1). A client who
 * supplies proper alt text with their photos keeps it — see Work.tsx.
 */
export function altFor(clientName: string, n: number): string {
  const who = (clientName || '').trim();
  return who ? `${who} tree trimming job, photo ${n}` : `Tree trimming job, photo ${n}`;
}
