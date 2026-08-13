/**
 * trimming-b — THE QUIET VARIANT of the trimming pair.
 *
 * HYPOTHESIS
 * ----------
 * If the trimming page leads with the irreversibility of a bad cut instead of the
 * discount, states the offer once near the bottom, and puts the form last instead of
 * in the hero, then it will produce fewer but better-qualified contacts and a higher
 * booked-job rate per lead than trimming-a, because trimming is a discretionary
 * judgment purchase where the buyer's real fear is a healthy tree being butchered —
 * a fear that trust in the crew's restraint answers and a 10% saving does not.
 *
 * SAME SERVICE, SAME OFFER, SAME MONEY. 10% off trimming, roof and gutter branch
 * clearance included in the job, multiple trees priced as a bundle. This is not a
 * recolour of trimming-a and it is not a different deal — it is a different argument
 * for the same deal.
 *
 * WHAT ACTUALLY DIFFERS, AND WHY EACH DIFFERENCE IS A TESTABLE VARIABLE
 * --------------------------------------------------------------------
 *                     trimming-a (control)            trimming-b (this)
 *   hero premise      discount + same-week            a cut is permanent
 *   hero contains     the form                        one sentence and the number
 *   offer position    hero, with urgency              §7 of 11, stated once, no timer
 *   form position     first thing on the page         last thing on the page
 *   proof             five reviews together, mid      one in full early, rest late
 *   services          long list, twenty items         three clearances, four refusals
 *   emotional lever   fear of missing out             fear of an irreversible mistake
 *   motion            marquee, carousel               none
 *
 * DESIGN: the restrained half of the pair. Generous whitespace, few elements, a
 * serif display face against a system sans body, hairlines instead of cards, three
 * surfaces instead of nine, and no animation beyond a hover transition. Confidence
 * signalled by what has been left out.
 *
 * WHAT THIS FILE IS RESPONSIBLE FOR
 * ---------------------------------
 *   1. Copy resolution. Every string goes through makeCopy(client, 'trimming-b',
 *      trimmingBCopy), so a per-client override in copyOverrides['trimming-b'] wins
 *      and an unknown key resolves to '' rather than "undefined" (R5).
 *   2. Turning client.brand into CSS custom properties on ONE wrapper element.
 *      Everything below references var(--brand-primary) / var(--brand-accent) /
 *      var(--brand-on-primary) and never a brand hex literal (R1).
 *   3. Document metadata from the meta.* keys.
 *
 * WHAT IT DELIBERATELY DOES NOT HOLD: a phone number, a city, a company name, a
 * review, a logo path, a legal URL, a GHL or GTM id. Those are ClientRecord data and
 * reach the DOM only through <PhoneLink/>, <SafeLogo/>, <SafeText/> and
 * <DeferredImage/>.
 */

import { useEffect, type CSSProperties } from 'react';
import { makeCopy, type ResolvedClient } from '../../schema/resolve';
import { trimmingBCopy } from './copy.defaults';
import { PhoneLink } from '../../components/PhoneLink';

import { Header } from './sections/Header';
import { Hero } from './sections/Hero';
import { Standard } from './sections/Standard';
import { Testimony } from './sections/Testimony';
import { Restraint } from './sections/Restraint';
import { Work } from './sections/Work';
import { Offer } from './sections/Offer';
import { Reviews } from './sections/Reviews';
import { Areas } from './sections/Areas';
import { Faq } from './sections/Faq';
import { EstimatePanel } from './sections/Estimate';
import { Footer } from './sections/Footer';

import './trimming-b.css';

/**
 * Only set a custom property when the record actually carries a value, so a
 * half-filled brand falls through to the safe defaults in styles/base.css instead of
 * painting `undefined` (R5).
 *
 * --brand-on-primary is NOT defaulted to primaryColor: that would put text and its
 * background at the same colour on every solid surface. A missing on-primary falls
 * through to base.css, which is white.
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

export function TrimmingB({ client }: { client: ResolvedClient }) {
  const copy = makeCopy(client, 'trimming-b', trimmingBCopy);

  const title = copy('meta.title');
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
    <div className="trimming-b" style={brandVars(client)}>
      {/* Sticky: the number has to stay reachable, because on this side of the test
          the form is eleven sections away. */}
      <Header client={client} copy={copy} />

      <main>
        {/* CANONICAL STRUCTURE v2 (owner's directive, 2026-08-13 — supersedes
            v1): hero (+ brand lockup + bouncing call line + form panel) →
            offer band (this page's own offer, near the top per the
            badges-live-near-the-top rule) → the captioned reviews block →
            results caption over a symmetrical grid → what-is-included blurb
            with photo → areas drift → remaining sections → footer. This page
            has no process section, so v2 position 7 collapses. Copy untouched. */}

        {/* 1 — the premise, the call line, the brand lockup, the form panel */}
        <Hero client={client} copy={copy} formPanel={<EstimatePanel client={client} copy={copy} />} />
        {/* 2 — the page's own offer, relocated to the top band */}
        <Offer copy={copy} />
        {/* 3 — reviews, ONE block (its own eyebrow/heading + the slider) */}
        <Reviews client={client} copy={copy} />
        {/* 4 — results: the work heading captions one symmetrical grid */}
        <Work client={client} copy={copy} />
        {/* 5 — what every trim includes, two-column with a client photo */}
        <Standard client={client} copy={copy} />
        {/* 6 — service areas, mid-page */}
        <Areas client={client} copy={copy} />
        {/* 7 — (no process section on this page) */}
        {/* 8 — remaining sections in their existing relative order */}
        <Testimony client={client} copy={copy} />
        <Restraint copy={copy} />
        <Faq copy={copy} />
      </main>

      {/* 11 — footer */}
      <Footer client={client} copy={copy} />

      {/* Canonical: the mobile sticky call bar. Hidden on desktop; renders
          nothing for a record with no phone (R5). */}
      <div className="tb-sticky">
        <PhoneLink client={client} placement="sticky" className="tb-sticky-call" subLabel={copy('hero.callSub')}>
          {copy('estimate.callPrefix')}
          {client.phoneDisplay}
        </PhoneLink>
      </div>
    </div>
  );
}

export default TrimmingB;
