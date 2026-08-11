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
import { Estimate } from './sections/Estimate';
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
        {/* 1 — the premise: a cut is permanent. No form, no photo, no discount. */}
        <Hero client={client} copy={copy} />
        {/* 2 — the three clearances every trim includes (roof, gutter, deadwood). */}
        <Standard copy={copy} />
        {/* 3 — one review, full width, read rather than scanned. */}
        <Testimony client={client} copy={copy} />
        {/* 4 — the four refusals. The trust lever this variant is built on. */}
        <Restraint copy={copy} />
        {/* 5 — the client's own trimming photographs, deferred, or nothing at all. */}
        <Work client={client} copy={copy} />
        {/* 6 — the offer. Stated once, here, with no countdown. */}
        <Offer copy={copy} />
        {/* 7 — the remaining reviews, demoted to a quiet ledger. */}
        <Reviews client={client} copy={copy} />
        {/* 8 — service area as running text, not a marquee. */}
        <Areas client={client} copy={copy} />
        {/* 9 — six questions, answered at length. */}
        <Faq copy={copy} />
        {/* 10 — the form, last. */}
        <Estimate client={client} copy={copy} />
      </main>

      {/* 11 — footer */}
      <Footer client={client} copy={copy} />
    </div>
  );
}

export default TrimmingB;
