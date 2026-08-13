/**
 * S1 (part 2) — rating badge, the $300 headline, and the single lead-capture form.
 *
 * Layout: one column on a phone (badge → headline → offer copy → form), two on a
 * desktop with the form parked in the right rail. The source renders the heading
 * block twice (desktop `sub-heading-TVyXLNMxiV` + mobile `col-vk8rBPkJ5b`) with
 * identical strings; this renders it once.
 *
 * form.subline is present in the source DOM but carries BOTH .desktop-only and
 * .mobile-only, so the control never shows it at any width. It is real source copy,
 * and whether it is visible is a design decision — this template shows it.
 */

import type { ResolvedClient } from '../../../schema/resolve';
import { SafeImage, SafeText } from '../../../components/Safe';
import { LeadForm } from '../../../components/LeadForm';
import { altFor, withAlt } from '../assets';
import { partitionMedia, photosFor } from '../../../lib/photos';
import { preloadLcpImage } from '../../../lib/preloadLcp';
import { CallCta, SplitHeading, type Copy } from './shared';

export const FORM_ANCHOR = 'ra-estimate-form';

export function Hero({ client, copy }: { client: ResolvedClient; copy: Copy }) {
  // Stills only — the client's photo set can include an .mp4 (the source gallery
  // does), and an <img> pointed at a video renders as a broken image.
  const { stills: heroStills } = partitionMedia(photosFor(client, 'removal'));
  // The hero plate is the LCP element; get the request in flight during render.
  preloadLcpImage(heroStills[0]?.src);
  const ratingLetters = [...copy('ratingBadge.logoText')];

  return (
    <section className="ra-hero">
      {/* LCP element: eager + fetchPriority high, with its measured dimensions on
          the tag. It is absolutely positioned, so it can never shift the layout. */}
      <div className="ra-hero-plate" aria-hidden="true">
        <SafeImage photo={heroStills[0] ?? null} className="ra-hero-plate-img" loading="eager" fetchPriority="high" sizes="(max-width: 767px) 100vw, 55vw" />
      </div>

      <div className="ra-container ra-hero-grid">
        <div className="ra-hero-copy">
          {(ratingLetters.length > 0 || copy('ratingBadge.rating')) && (
            <div className="ra-rating">
              <span className="ra-rating-logo">
                {ratingLetters.map((letter, i) => (
                  <span key={i} className="ra-rating-letter">
                    {letter}
                  </span>
                ))}
              </span>
              <span className="ra-rating-score">
                <span className="ra-rating-stars" aria-hidden="true">
                  {copy('ratingBadge.stars')}
                </span>
                <strong className="ra-rating-number">{copy('ratingBadge.rating')}</strong>
              </span>
              <SafeText as="span" className="ra-rating-caption" value={copy('ratingBadge.caption')} />
            </div>
          )}

          <SplitHeading as="h1" className="ra-h1" parts={[copy('hero.h1a'), copy('hero.h1b')]} />
          <SafeText as="p" className="ra-hero-sub" value={copy('hero.h2')} />
          <SafeText as="p" className="ra-body ra-hero-body" value={copy('hero.body')} />

          {/* CANONICAL STRUCTURE (2026-08-12): both capture paths in the hero —
              the form card is beside/below; this is the prominent click-to-call,
              built from the page's existing shared-CTA copy keys. */}
          <div className="ra-hero-call">
            {/* v2: gentle periodic bounce on the primary tap-to-call. */}
            <span className="cta-bounce ra-bounce">
              <CallCta client={client} copy={copy} placement="hero" tone="solid" />
            </span>
          </div>
        </div>

        <div className="ra-form-card" id={FORM_ANCHOR}>
          <SplitHeading as="h2" className="ra-form-heading" parts={[copy('form.headingA'), copy('form.headingB')]} />
          <SafeText as="p" className="ra-form-subline" value={copy('form.subline')} />

          {/* The shared form. It already carries the A2P consent opt-in, the hidden
              ad-click-id fields and the off-domain redirect guard — never rebuilt
              per template. The Phone label keeps the source's separate "*" node by
              concatenation, so both strings stay byte-exact. */}
          <LeadForm
            client={client}
            className="ra-form"
            labels={{
              firstName: copy('form.label.firstName'),
              lastName: copy('form.label.lastName'),
              phone: copy('form.label.phone') + copy('form.label.requiredMarker'),
              email: copy('form.label.email'),
              submit: copy('form.submit'),
            }}
          />
        </div>
      </div>

      <div className="ra-container">
        <ul className="ra-hero-proof">
          {heroStills.slice(1, 3).map((shot, i) => (
            <li key={shot.src}>
              <SafeImage photo={withAlt(shot, altFor(client.name, i + 1))} className="ra-hero-proof-img" />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
