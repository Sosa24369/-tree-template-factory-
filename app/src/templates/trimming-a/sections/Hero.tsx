/**
 * S2 — rating badge, the 10%-off headline, and the single lead-capture form.
 *
 * NO PHOTOGRAPH IN THE HERO, AT ANY WIDTH. That is a performance decision taken as
 * a design decision, which is the only way it survives: the mobile hero carries the
 * headline AND the whole form, so a photographic plate behind it becomes a very
 * large LCP element that decodes late. The brand colour leads instead, the headline
 * is the LCP element (it paints with the first stylesheet, no second round trip),
 * and the photographs start immediately below in the S3 slider where they are
 * deferred. Desktop gets the same treatment for consistency.
 *
 * The two hero shots the source parks in `col-BmNtA1vlYU` are kept, as a two-up band
 * closing the hero — below the fold on a phone, so <DeferredImage/> rather than
 * <SafeImage/>: measured on removal-a, loading="lazy" alone still let 30 images
 * saturate a throttled connection and cost 3s of LCP.
 *
 * THE TWO FORM HEADINGS ARE NOT A RESPONSIVE DUPLICATE. structure.md §2.2: the
 * desktop element says "Get Your Free Trimming Estimate" and the mobile element says
 * "Get Your Free Tree Trimming Estimate  East Dallas & Nearby". Different copy, one
 * per breakpoint. Everything else the source duplicates across breakpoints is
 * rendered once here; these two both ship, because dropping either would delete
 * source copy from the control.
 */

import type { ResolvedClient } from '../../../schema/resolve';
import { SafeText } from '../../../components/Safe';
import { DeferredImage } from '../../../components/DeferredImage';
import { LeadForm } from '../../../components/LeadForm';
import { FORM_ANCHOR, altFor, photoSlots, withAlt } from '../slots';
import { SplitHeading, type Copy } from './shared';

export function Hero({ client, copy }: { client: ResolvedClient; copy: Copy }) {
  const { hero } = photoSlots(client);
  const ratingLetters = [...copy('ratingBadge.logoText')];
  const hasBadge = ratingLetters.length > 0 || copy('ratingBadge.rating').trim();

  return (
    <section className="ta-hero">
      <div className="ta-container ta-hero-grid">
        <div className="ta-hero-copy">
          {hasBadge ? (
            <div className="ta-rating">
              <span className="ta-rating-logo">
                {ratingLetters.map((letter, i) => (
                  <span key={i} className="ta-rating-letter">
                    {letter}
                  </span>
                ))}
              </span>
              <span className="ta-rating-score">
                <span className="ta-rating-stars" aria-hidden="true">
                  {copy('ratingBadge.stars')}
                </span>
                <strong className="ta-rating-number">{copy('ratingBadge.rating')}</strong>
              </span>
              <SafeText as="span" className="ta-rating-caption" value={copy('ratingBadge.caption')} />
            </div>
          ) : null}

          <SplitHeading as="h1" className="ta-h1" parts={[copy('hero.h1a'), copy('hero.h1b')]} />
          <SafeText as="p" className="ta-hero-sub" value={copy('hero.h2')} />
          <SafeText as="p" className="ta-hero-body" value={copy('hero.body')} />
        </div>

        {/* The form owns the anchor both scroll-to-form CTAs target. */}
        <div className="ta-form-card" id={FORM_ANCHOR}>
          <SplitHeading
            as="h2"
            className="ta-form-heading ta-at-desktop"
            parts={[copy('form.headingA'), copy('form.headingB')]}
          />
          <SplitHeading
            as="h2"
            className="ta-form-heading ta-at-mobile"
            parts={[copy('form.headingMobileA'), copy('form.headingMobileB')]}
          />
          <SafeText as="p" className="ta-form-subline" value={copy('form.subline')} />

          {/* The shared form. It already carries the A2P consent opt-in, the hidden
              ad-click-id fields and the guarded thank-you destination — never rebuilt
              per template. The Phone label is reassembled from the source's three
              separate nodes ("Phone", the space, the "*" span) so all three stay
              byte-exact and the rendered label is still "Phone *". */}
          <LeadForm
            client={client}
            className="ta-form"
            labels={{
              firstName: copy('form.label.firstName'),
              lastName: copy('form.label.lastName'),
              phone: copy('form.label.phone') + copy('form.label.requiredGap') + copy('form.label.requiredMarker'),
              email: copy('form.label.email'),
              submit: copy('form.submit'),
            }}
          />
        </div>
      </div>

      {hero.length > 0 && (
        <div className="ta-container">
          <ul className="ta-hero-proof">
            {hero.map((shot, i) => (
              <li key={shot?.src ?? i}>
                <DeferredImage
                  photo={withAlt(shot, altFor(client.name, i + 1))}
                  className="ta-shot-img"
                  wrapperClassName="ta-shot"
                  sizes="(max-width: 767px) 92vw, 44vw"
                />
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
