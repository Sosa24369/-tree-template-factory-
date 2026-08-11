/**
 * removal-b — THE VARIANT.
 *
 * Same service, same offer, same audience as removal-a. A different argument for
 * all three.
 *
 *   HYPOTHESIS
 *   If the page leads with the risk of leaving the tree standing and puts reviews
 *   and insurance ABOVE the $300 offer — with a call as the hero's ask and the form
 *   moved to a mid-page section — then booked jobs per click will rise even if raw
 *   form-fill rate falls, because a homeowner deciding to drop a large tree next to
 *   their house is buying a crew they can trust with the liability, and a
 *   discount-first headline recruits price-shoppers who never book.
 *
 *   WHAT CHANGED, AND WHY EACH CHANGE IS MEASURABLE
 *   ┌ removal-a (control) ──────────────┬ removal-b (this) ─────────────────────┐
 *   │ H1 is the discount                │ H1 is the consequence of waiting      │
 *   │ hero contains the form            │ hero asks for a call; form is S6      │
 *   │ proof (reviews) after the offer   │ proof before the offer, and says so   │
 *   │ benefit strip = what WE do        │ diagnostic = how to read YOUR tree    │
 *   │ long-form SEO block + 10 FAQs     │ no SEO block, 6 objection-led FAQs    │
 *   │ 20 services in 3 photo columns    │ 2 groups: takedown / ground afterwards│
 *   │ animated city marquee             │ static, scannable service-area grid   │
 *   │ quiet: flat sections, one accent  │ rich: layered light, texture, motion  │
 *   └───────────────────────────────────┴───────────────────────────────────────┘
 *
 *   If this variant wins, we learn the segment buys safety, not savings. If the
 *   control wins, we learn the discount is doing the work and every future page
 *   should put the number in the H1. Either result changes what we build next,
 *   which is the only reason to run the test.
 *
 * WHAT THIS FILE IS RESPONSIBLE FOR
 *   1. Copy resolution — every string goes through makeCopy(client, 'removal-b',
 *      removalBCopy), so client.copyOverrides['removal-b'] always wins and an
 *      unknown key resolves to '' rather than "undefined" (R5).
 *   2. Turning client.brand into CSS custom properties on ONE wrapper element. Every
 *      rule in removal-b.css reads var(--brand-primary) / var(--brand-accent) /
 *      var(--brand-on-primary) and never a brand hex literal (R1), so a client's
 *      colours are a JSON edit rather than a code change.
 *   3. Document metadata, with the company name composed from client.name.
 *
 * WHAT IT DELIBERATELY DOES NOT HOLD: a phone number, a city, a company name, a
 * review, a legal URL or a logo path. Those live in the ClientRecord and reach the
 * DOM through <PhoneLink/>, <SafeLogo/>, <SafeText/> and <DeferredImage/>.
 */

import { useEffect, type CSSProperties } from 'react';
import { makeCopy, type ResolvedClient } from '../../schema/resolve';
import { removalBCopy } from './copy.defaults';

import { Header } from './sections/Header';
import { Hero } from './sections/Hero';
import { TrustBar } from './sections/TrustBar';
import { Signals } from './sections/Signals';
import { Proof } from './sections/Proof';
import { Work } from './sections/Work';
import { Estimate } from './sections/Estimate';
import { Process } from './sections/Process';
import { Scope } from './sections/Scope';
import { Areas } from './sections/Areas';
import { Faq } from './sections/Faq';
import { FinalCta } from './sections/FinalCta';
import { Footer } from './sections/Footer';
import { StickyBar } from './sections/StickyBar';

import './removal-b.css';

/**
 * Only set a custom property when the record actually carries a value, so a
 * half-filled brand falls through to the safe defaults in styles/base.css instead
 * of painting `undefined` (R5).
 *
 * --brand-on-primary is NOT defaulted to primaryColor: that would put a button's
 * text and its background at the same colour. A missing on-primary falls through to
 * base.css, which is white.
 */
function brandVars(client: ResolvedClient): CSSProperties {
  const primary = client.brand?.primaryColor?.trim();
  const accent = client.brand?.accentColor?.trim();
  const onPrimary = client.brand?.onPrimaryColor?.trim();

  return {
    ...(primary ? { '--brand-primary': primary } : {}),
    ...(accent ? { '--brand-accent': accent } : {}),
    ...(onPrimary ? { '--brand-on-primary': onPrimary } : {}),
  } as CSSProperties;
}

export function RemovalB({ client }: { client: ResolvedClient }) {
  const copy = makeCopy(client, 'removal-b', removalBCopy);

  // The company name is DATA, so it is appended here rather than baked into the
  // copy default — which is why this template needs no per-client meta override.
  const base = copy('meta.title');
  const name = (client.name ?? '').trim();
  const title = base && name ? `${base} | ${name}` : base || name;
  const description = copy('meta.description');

  useEffect(() => {
    if (title) document.title = title;
    if (!description) return;
    let tag = document.querySelector<HTMLMetaElement>('meta[name="description"]');
    if (!tag) {
      tag = document.createElement('meta');
      tag.name = 'description';
      document.head.appendChild(tag);
    }
    tag.content = description;
  }, [title, description]);

  return (
    <div className="removal-b" style={brandVars(client)}>
      <Header client={client} copy={copy} />

      <main>
        {/* S1 — risk-led hero, call-first, no offer */}
        <Hero client={client} copy={copy} />
        {/* S2 — credential ticker */}
        <TrustBar copy={copy} />
        {/* S3 — five signals: how to read your own tree */}
        <Signals copy={copy} />
        {/* S4 — proof BEFORE the offer: stats + verified reviews */}
        <Proof client={client} copy={copy} />
        {/* S5 — recent removals mosaic (client photographs only) */}
        <Work client={client} copy={copy} />
        {/* S6 — the offer is named here for the first time, with the form */}
        <Estimate client={client} copy={copy} />
        {/* S7 — four steps on one timeline */}
        <Process copy={copy} />
        {/* S8 — the takedown, and the ground afterwards */}
        <Scope copy={copy} />
        {/* S9 — service-area grid */}
        <Areas client={client} copy={copy} />
        {/* S10 — six objection-led questions */}
        <Faq copy={copy} />
        {/* S11 — closing call band */}
        <FinalCta client={client} copy={copy} />
      </main>

      {/* S12 */}
      <Footer client={client} copy={copy} />

      {/* Phones only — the form is off the first screen, so both conversion paths
          stay one tap away at every scroll position. */}
      <StickyBar client={client} copy={copy} />
    </div>
  );
}

export default RemovalB;
