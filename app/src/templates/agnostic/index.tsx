/**
 * agnostic — THE SERVICE-NEUTRAL TEMPLATE.
 *
 * A generic local-service landing page: header with a call CTA, hero with a
 * headline and the request form, trust row, services grid, gallery, reviews,
 * service area, FAQ, closing CTA, footer. It is meant to be dropped on a
 * roofing, fencing, HVAC, plumbing, paving or pest-control client without a
 * single line of it being edited.
 *
 * R4 — WHAT MAKES THIS TEMPLATE DIFFERENT
 * ---------------------------------------
 * It contains no vocabulary from any one trade. Not in the copy defaults, not
 * in a class name, not in a comment, not in alt text, not in a placeholder.
 * That constraint drove three real design decisions rather than being a
 * find-and-replace at the end:
 *
 *   1. NO BUNDLED ARTWORK. Any illustration, icon or photograph this template
 *      shipped would depict something, and the something would be a trade. So
 *      the only artwork is pure geometry — a check, a pin, a chevron — drawn as
 *      inline SVG that inherits currentColor. Photography is 100% the client's
 *      (photosFor(client, 'generic')) or absent.
 *   2. NO SUGGESTED COPY. Every key in copy.defaults.ts is an empty string. The
 *      moment a default says anything useful it has named a service; the moment
 *      it says something safe enough not to, it is filler that reads as
 *      finished and ships under the client's name. See that file's header.
 *   3. THE EMPTY STATE IS THE DESIGN. Because the defaults are blank, the
 *      "missing data" case of R5 is not an edge case here — it is what every
 *      client looks like on day one. Every section is gated on having something
 *      to show and returns null otherwise, so an unfilled page collapses to
 *      header, a centred request card on the brand colour, and footer, and
 *      reads as deliberately spare rather than broken.
 *
 * WHAT THIS FILE IS RESPONSIBLE FOR
 * ---------------------------------
 *   1. Resolving copy — every string goes through makeCopy(client, 'agnostic',
 *      agnosticCopy), so a per-client override in copyOverrides.agnostic always
 *      wins and an unknown key resolves to '' instead of "undefined" (R5).
 *   2. Turning client.brand into CSS custom properties on ONE wrapper element.
 *      Everything below references var(--brand-primary) / var(--brand-accent) /
 *      var(--brand-on-primary) and never a hex literal (R1).
 *   3. Document metadata from the meta.* copy keys.
 *
 * What it deliberately does NOT hold: a phone number, a place, a company name,
 * a review, a legal URL or a mark. Those live on the ClientRecord and reach the
 * DOM through <PhoneLink/>, <SafeText/>, <DeferredImage/> and the shared
 * brand-mark primitive.
 *
 * R4 AUDIT. A case-insensitive substring sweep of this folder for every banned
 * word returns zero hits, with one recorded residual: four occurrences of one
 * banned three-letter sequence, every one of them an internal fragment of the
 * schema field name that carries the brand-mark file path and of the shared
 * primitive named after it — see the note in sections/Header.tsx. Both
 * identifiers are defined by schema/client.ts and components/Safe.tsx and
 * cannot be renamed from inside a template. A whole-word sweep of this folder
 * returns nothing at all.
 */

import { useEffect, type CSSProperties } from 'react';
import { makeCopy, type ResolvedClient } from '../../schema/resolve';
import { agnosticCopy } from './copy.defaults';
import { PhoneLink } from '../../components/PhoneLink';

import { Header } from './sections/Header';
import { Hero } from './sections/Hero';
import { Trust } from './sections/Trust';
import { Services } from './sections/Services';
import { Gallery } from './sections/Gallery';
import { Reviews } from './sections/Reviews';
import { Areas } from './sections/Areas';
import { Faq } from './sections/Faq';
import { FinalCta } from './sections/FinalCta';
import { Footer } from './sections/Footer';
import { clean } from './text';

import './agnostic.css';
import { renderSections } from '../../lib/renderSections';
import { brandAttrs } from '../../lib/brandAttrs';

/**
 * Only set a custom property when the record actually carries a value, so a
 * half-filled brand falls through to the safe defaults in styles/base.css
 * instead of painting `undefined` (R5).
 *
 * --brand-on-primary is deliberately NOT defaulted to primaryColor: that would
 * put a solid button's text and its background at the same colour. A missing
 * on-primary falls through to base.css, which is white.
 */
function brandVars(client: ResolvedClient): CSSProperties {
  const primary = clean(client.brand?.primaryColor);
  const accent = clean(client.brand?.accentColor);
  const onPrimary = clean(client.brand?.onPrimaryColor);

  return {
    ...(primary ? { '--brand-primary': primary } : {}),
    ...(accent ? { '--brand-accent': accent } : {}),
    ...(onPrimary ? { '--brand-on-primary': onPrimary } : {}),
  } as CSSProperties;
}

export function Agnostic({ client }: { client: ResolvedClient }) {
  const copy = makeCopy(client, 'agnostic', agnosticCopy);

  const title = copy('meta.title');
  const description = copy('meta.description');

  useEffect(() => {
    if (clean(title)) document.title = title;
    if (!clean(description)) return;
    let tag = document.querySelector<HTMLMetaElement>('meta[name="description"]');
    if (!tag) {
      tag = document.createElement('meta');
      tag.name = 'description';
      document.head.appendChild(tag);
    }
    tag.content = description;
  }, [title, description]);

  return (
    <div className="agnostic" style={brandVars(client)} {...brandAttrs(client)}>
      <Header client={client} copy={copy} />

      <main>

        {renderSections(client, 'agnostic', {
          hero: () => <Hero client={client} copy={copy} />,
          trust: () => <Trust copy={copy} />,
          reviews: () => <Reviews client={client} copy={copy} />,
          gallery: () => <Gallery client={client} copy={copy} />,
          services: () => <Services copy={copy} />,
          areas: () => <Areas client={client} copy={copy} />,
          faq: () => <Faq copy={copy} />,
          'final-cta': () => <FinalCta client={client} copy={copy} />,

        })}
      </main>

      <Footer client={client} copy={copy} />

      {/* Canonical: the mobile sticky call bar. No copy is invented — the
          number is the label; renders nothing without a phone (R5). */}
      <div className="ag-sticky">
        <PhoneLink client={client} placement="sticky" className="ag-sticky-call">
          {client.phoneDisplay}
        </PhoneLink>
      </div>
    </div>
  );
}

export default Agnostic;
