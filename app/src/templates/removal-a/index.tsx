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
        {/* CANONICAL STRUCTURE v2 (owner's directive, 2026-08-13 — supersedes
            v1): hero (+ brand lockup + bouncing call CTA) → offer band → the
            captioned reviews block → results caption over a symmetrical grid
            → services blurb with photo → areas drift (mid-page, OUT of the
            footer zone) → process → remaining sections → footer. Copy
            untouched; captions are each section's own existing lines. */}

        {/* 1 — hero: brand lockup, badge, $300 headline, form + call */}
        <Hero client={client} copy={copy} />
        {/* 2 — offer band: the page's existing offer + trust badges */}
        <Benefits client={client} copy={copy} />
        {/* 3 — reviews, ONE block captioned by the page's own "Why … Choose …"
            trust line (heading + prose + slider + CTA live in WhyChoose) */}
        <WhyChoose client={client} copy={copy} />
        {/* 4 — results: "Restoration Results Guaranteed" captions its grid */}
        <Restoration client={client} copy={copy} />
        {/* 5 — services blurb, two-column with a client photo on the right */}
        <Longform client={client} copy={copy} />
        {/* 6 — areas we serve, mid-page between the photo work and process */}
        <Areas client={client} copy={copy} />
        {/* 7 — how it works, four steps (captioned by its own heading) */}
        <Process copy={copy} />
        {/* 8 — remaining sections in their existing relative order */}
        <Gallery client={client} />
        <Services client={client} copy={copy} />
        <MidCta client={client} copy={copy} />
        <Faq copy={copy} />
        <FinalCta client={client} copy={copy} />
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
