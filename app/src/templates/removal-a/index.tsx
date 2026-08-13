/**
 * removal-a — THE CONTROL.
 *
 * A redesign of the live Texas Tree Tops "Routine Removal" landing page with the
 * copy and the images held constant. Section ORDER matches source/removal/structure.md
 * one for one (S1 … S13); everything about how those sections look is new.
 *
 * What this file is responsible for:
 *   1. Resolving copy — every string goes through makeCopy(client, 'removal-a',
 *      removalACopy), so a per-client override in client.copyOverrides['removal-a']
 *      always wins and an unknown key resolves to '' instead of "undefined" (R5).
 *   2. Turning client.brand into CSS custom properties on ONE wrapper element.
 *      Components below reference var(--brand-primary) / var(--brand-accent) /
 *      var(--brand-on-primary) and never a hex literal (R1), so a client's colours
 *      are a JSON edit, not a code change.
 *   3. Document metadata from the meta.* copy keys.
 *
 * What it deliberately does NOT do: hold a phone number, a city, a client name, a
 * review, or a logo path. Those live in the ClientRecord and reach the DOM through
 * <PhoneLink/>, <SafeLogo/>, <SafeText/> and <SafeImage/>.
 *
 * DUPLICATION REMOVED. The source renders desktop and mobile copies of the header,
 * the form heading, the S3 CTA, the four process steps and the footer legal links
 * into the same DOM and hides one with CSS. Every one of those is rendered ONCE here
 * and made responsive with CSS — a design change, which R2 permits. It also
 * eliminates the source's worst defect for free: the mobile header displayed one
 * number while dialling a different client's line.
 */

import { useEffect, type CSSProperties } from 'react';
import { makeCopy, type ResolvedClient } from '../../schema/resolve';
import { removalACopy } from './copy.defaults';
import { ReviewsSlider } from '../../components/ReviewsSlider';
import { PhoneLink } from '../../components/PhoneLink';

import { Header } from './sections/Header';
import { Hero } from './sections/Hero';
import { Gallery } from './sections/Gallery';
import { Benefits } from './sections/Benefits';
import { WhyChoose } from './sections/WhyChoose';
import { Restoration } from './sections/Restoration';
import { Services } from './sections/Services';
import { Areas } from './sections/Areas';
import { Longform } from './sections/Longform';
import { MidCta } from './sections/MidCta';
import { Process } from './sections/Process';
import { Faq } from './sections/Faq';
import { FinalCta } from './sections/FinalCta';
import { Footer } from './sections/Footer';

import './removal-a.css';

/**
 * Only set a custom property when the record actually carries a value, so a
 * half-filled brand falls through to the safe defaults in styles/base.css instead
 * of painting `undefined` (R5).
 *
 * --brand-on-primary is NOT defaulted to primaryColor here: that would put the
 * text and its background at the same colour on every solid button. A missing
 * on-primary falls through to base.css, which is white.
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

export function RemovalA({ client }: { client: ResolvedClient }) {
  const copy = makeCopy(client, 'removal-a', removalACopy);

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
    <div className="removal-a" style={brandVars(client)}>
      {/* S1 — header bar */}
      <Header client={client} copy={copy} />

      <main>
        {/* CANONICAL STRUCTURE (owner's directive, 2026-08-12): hero with both
            capture paths → reviews slider → photo band 1 → process → photo
            band 2 → the rest in their existing relative order → the areas
            marquee last before the footer. Copy untouched; sections moved. */}

        {/* 1 — rating badge, hero headline, lead form + click-to-call */}
        <Hero client={client} copy={copy} />
        {/* 2 — Google reviews slider (nothing without reviews on the record, R5) */}
        {(client.reviews ?? []).some((r) => (r?.body ?? '').trim()) && (
          <section className="ra-reviews-band">
            <ReviewsSlider client={client} />
          </section>
        )}
        {/* 3 — photo band 1: recent jobs, first half (+ the client video) */}
        <Gallery client={client} band={1} />
        {/* 4 — how it works, four steps */}
        <Process copy={copy} />
        {/* 5 — photo band 2: the rest of the recent jobs */}
        <Gallery client={client} band={2} />
        {/* 6 — the rest, existing relative order */}
        <Benefits client={client} copy={copy} />
        <WhyChoose client={client} copy={copy} />
        <Restoration client={client} copy={copy} />
        <Services client={client} copy={copy} />
        <Longform copy={copy} />
        <MidCta client={client} copy={copy} />
        <Faq copy={copy} />
        <FinalCta client={client} copy={copy} />
        {/* 7 — areas we serve marquee, last before the footer */}
        <Areas client={client} copy={copy} />
      </main>

      {/* S13 — footer */}
      <Footer client={client} copy={copy} />

      {/* Canonical: the mobile sticky call bar (both capture paths always a
          thumb away). Hidden on desktop by CSS; PhoneLink renders nothing
          for a record with no phone (R5). */}
      <div className="ra-sticky">
        <PhoneLink client={client} placement="sticky" className="ra-sticky-call" subLabel={copy('header.tapToCallMobile')}>
          {copy('cta.callLabelPrefix')}
          {client.phoneDisplay}
        </PhoneLink>
      </div>
    </div>
  );
}

export default RemovalA;
