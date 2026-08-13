/**
 * trimming-a — THE CONTROL.
 *
 * A redesign of the live J Valdez Tree Services "Tree Trimming" landing page with
 * the copy held constant. Section ORDER matches source/trimming/structure.md one for
 * one (S1 … S13); everything about how those sections look is new.
 *
 * What this file is responsible for:
 *   1. Resolving copy — every string goes through makeCopy(client, 'trimming-a',
 *      trimmingACopy), so a per-client override in client.copyOverrides['trimming-a']
 *      always wins and an unknown key resolves to '' instead of "undefined" (R5).
 *   2. Turning client.brand into CSS custom properties on ONE wrapper element.
 *      Everything below references var(--brand-primary) / var(--brand-accent) /
 *      var(--brand-on-primary) and never a hex literal for brand (R1), so a client's
 *      colours are a JSON edit, not a code change.
 *   3. Document metadata from the meta.* copy keys — which the control leaves EMPTY,
 *      because the source page renders no <title> and no <meta name="description">
 *      at all. Blank values are skipped rather than written as empty tags.
 *
 * What it deliberately does NOT do: hold a phone number, a city, a client name, a
 * review, an address or a logo path. Those live in the ClientRecord or in
 * copy.defaults.ts and reach the DOM through <PhoneLink/>, <SafeLogo/>, <SafeText/>
 * and <DeferredImage/>.
 *
 * RESPONSIVE DUPLICATION REMOVED. The source renders desktop and mobile copies of
 * the header, the S4 CTA, the four process steps, the hero form sub-paragraph and
 * the footer legal links into the same DOM and hides one with CSS. Every one of those
 * is rendered ONCE here and made responsive with CSS, which also fixes the source's
 * worst structural defect for free: the header dialled two different numbers
 * depending on the visitor's screen width.
 *
 * THE ONE EXCEPTION is the lead-form heading. Its desktop and mobile elements are
 * genuinely DIFFERENT COPY, not a duplicate (structure.md §2.2), so both ship — see
 * sections/Hero.tsx.
 */

import { useEffect, type CSSProperties } from 'react';
import { makeCopy, type ResolvedClient } from '../../schema/resolve';
import { trimmingACopy } from './copy.defaults';
import { PhoneLink } from '../../components/PhoneLink';

import { Header } from './sections/Header';
import { Hero } from './sections/Hero';
import { Gallery } from './sections/Gallery';
import { Benefits } from './sections/Benefits';
import { WhyChoose } from './sections/WhyChoose';
import { DoneRight } from './sections/DoneRight';
import { Services } from './sections/Services';
import { Areas } from './sections/Areas';
import { Process } from './sections/Process';
import { Longform } from './sections/Longform';
import { MidCta } from './sections/MidCta';
import { Faq } from './sections/Faq';
import { FinalCta } from './sections/FinalCta';
import { Footer } from './sections/Footer';

import './trimming-a.css';

/**
 * Only set a custom property when the record actually carries a value, so a
 * half-filled brand falls through to the safe defaults in styles/base.css instead of
 * painting `undefined` (R5).
 *
 * --brand-on-primary is NOT defaulted to primaryColor here: that would put the text
 * and its background at the same colour on every solid button. A missing on-primary
 * falls through to base.css, which is white.
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

export function TrimmingA({ client }: { client: ResolvedClient }) {
  const copy = makeCopy(client, 'trimming-a', trimmingACopy);

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
    <div className="trimming-a" style={brandVars(client)}>
      {/* S1 — header bar */}
      <Header client={client} copy={copy} />

      <main>
        {/* CANONICAL STRUCTURE v2 (owner's directive, 2026-08-13 — supersedes
            v1): hero (+ brand lockup + bouncing call CTA) → offer band → the
            captioned reviews block → results caption over a symmetrical grid
            → services blurb with photo → areas drift (mid-page) → process →
            remaining sections → footer. Copy untouched. */}

        {/* 1 — hero: brand lockup, badge, 10%-off headline, form + call */}
        <Hero client={client} copy={copy} />
        {/* 2 — offer band: the page's existing offer + trust badges */}
        <Benefits client={client} copy={copy} />
        {/* 3 — reviews, ONE block captioned by the page's own trust line */}
        <WhyChoose client={client} copy={copy} />
        {/* 4 — results: "Done Clean, Done Right" captions its grid */}
        <DoneRight client={client} copy={copy} />
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
        <FinalCta copy={copy} />
      </main>

      {/* S13 — footer */}
      <Footer client={client} copy={copy} />

      {/* Canonical: the mobile sticky call bar. Hidden on desktop; renders
          nothing for a record with no phone (R5). */}
      <div className="ta-sticky">
        <PhoneLink client={client} placement="sticky" className="ta-sticky-call" subLabel={copy('header.tapToCall')}>
          {copy('header.callPrefix')}
          {client.phoneDisplay}
        </PhoneLink>
      </div>
    </div>
  );
}

export default TrimmingA;
