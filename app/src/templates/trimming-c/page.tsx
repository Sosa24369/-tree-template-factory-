/**
 * trimming-c page — every section renders trimming-a COPY KEYS ONLY, laid out
 * in trimming-b's quiet editorial system, elevated.
 *
 * Order keeps the control's information architecture inside the variant's
 * calm: serif display hero with the form beside it (under it on mobile),
 * record-composed trust strip, benefits as a hairline ledger, before/after
 * proof, why + reviews slider, done-right band, services, areas, process,
 * long-form, mid CTA, ready band, FAQ, final CTA, footer, sticky call bar.
 */

import type { CSSProperties } from 'react';
import type { ResolvedClient } from '../../schema/resolve';
import type { PhotoSet } from '../../schema/client';
import { SafeLogo, SafeText } from '../../components/Safe';
import { HeroBrand } from '../../components/HeroBrand';
import { PhoneLink } from '../../components/PhoneLink';
import { LeadForm } from '../../components/LeadForm';
import { DeferredImage } from '../../components/DeferredImage';
import { ReviewsSlider } from '../../components/ReviewsSlider';
import { ServiceAreasCarousel } from '../../components/ServiceAreasCarousel';
import { photosFor, partitionMedia } from '../../lib/photos';

type Copy = (key: string) => string;

const FORM_ANCHOR = 'tc-form';

function stills(client: ResolvedClient, limit?: number): PhotoSet[] {
  const { stills: onlyStills } = partitionMedia(photosFor(client, 'trimming'));
  return typeof limit === 'number' ? onlyStills.slice(0, limit) : onlyStills;
}

function Split({
  as: Tag = 'h2',
  a,
  b,
  c,
  className,
  stacked,
}: {
  as?: 'h1' | 'h2';
  a: string;
  b: string;
  c?: string;
  className?: string;
  stacked?: boolean;
}) {
  if (!(a.trim() || b.trim() || (c ?? '').trim())) return null;
  return (
    <Tag className={[className, stacked ? 'tc-stacked' : null].filter(Boolean).join(' ')}>
      {a.trim() && <span>{a}</span>}
      {b.trim() && <span className="tc-accent">{b}</span>}
      {c && c.trim() && <span>{c}</span>}
    </Tag>
  );
}

export function TrimmingCPage({
  client,
  copy,
  brandStyle,
}: {
  client: ResolvedClient;
  copy: Copy;
  brandStyle: CSSProperties;
}) {
  const gallery = stills(client, 8);
  const reviewCount = (client.reviews ?? []).filter((r) => (r?.body ?? '').trim()).length;
  const services = Array.from({ length: 17 }, (_, i) => copy(`services.item${i + 1}`)).filter((s) => s.trim());
  const requests = Array.from({ length: 7 }, (_, i) => copy(`longform.request${i + 1}`)).filter((s) => s.trim());
  const steps = [1, 2, 3, 4]
    .map((n) => ({
      label: copy(`process.step${n}.label`),
      h: copy(`process.step${n}.h2`),
      body: copy(`process.step${n}.body`),
    }))
    .filter((s) => s.h.trim() || s.body.trim());
  const faqs = Array.from({ length: 10 }, (_, i) => ({
    q: copy(`faq.q${i + 1}`),
    a: copy(`faq.a${i + 1}`),
  })).filter((f) => f.q.trim() || f.a.trim());
  const cities = (client.serviceAreaList ?? []).filter((c) => typeof c === 'string' && c.trim());
  const privacyUrl = (client.consent?.privacyPolicyUrl ?? '').trim();
  const termsUrl = (client.consent?.termsOfServiceUrl ?? '').trim();
  const ratingWord = copy('ratingBadge.logoText');

  return (
    <div className="trimming-c" style={brandStyle}>
      {/* ---- header: hairline, quiet ---- */}
      <header className="tc-header">
        <div className="tc-container tc-header-inner">
          <SafeLogo
            logoUrl={client.brand?.logoUrl}
            clientName={client.name}
            className="tc-logo"
            srcset={client.brand?.logoSrcset}
            sizes="(min-width: 768px) 88px, 60px"
            width={client.brand?.logoWidth}
            height={client.brand?.logoHeight}
          />
          <PhoneLink client={client} placement="header" className="tc-call tc-call--header" subLabel={copy('header.tapToCall')}>
            {copy('header.callPrefix')}
            {client.phoneDisplay}
          </PhoneLink>
        </div>
      </header>

      <main>
        {/* ---- hero: the control's offer H1 in the variant's serif calm ---- */}
        <section className="tc-hero">
          <div className="tc-container">
            {/* Premium Reorder v2: the client's logo + name, larger and
                centered in the hero. */}
            <HeroBrand client={client} className="tc-hbrand" />
          </div>
          <div className="tc-container tc-hero-grid">
            <div className="tc-hero-copy">
              <p className="tc-badge">
                {ratingWord.trim() && (
                  <span className="tc-badge-word" aria-label={ratingWord}>
                    {[...ratingWord].map((letter, i) => (
                      <span key={i} aria-hidden="true" className="tc-badge-letter">
                        {letter}
                      </span>
                    ))}
                  </span>
                )}
                <SafeText as="span" className="tc-badge-stars" value={copy('ratingBadge.stars')} />
                <SafeText as="strong" className="tc-badge-rating" value={copy('ratingBadge.rating')} />
                <SafeText as="span" className="tc-badge-caption" value={copy('ratingBadge.caption')} />
              </p>

              <Split as="h1" className="tc-display" a={copy('hero.h1a')} b={copy('hero.h1b')} />
              <SafeText as="p" className="tc-hero-sub" value={copy('hero.h2')} />
              <SafeText as="p" className="tc-hero-body" value={copy('hero.body')} />

              <div className="tc-hero-ctas">
                {/* v2: gentle periodic bounce on the primary tap-to-call. */}
                <span className="cta-bounce tc-bounce">
                  <PhoneLink client={client} placement="hero" className="tc-call tc-call--solid" subLabel={copy('cta.callSubLabel')}>
                    {copy('cta.callLabelPrefix')}
                    {client.phoneDisplay}
                  </PhoneLink>
                </span>
              </div>

              {/* Trust strip — record facts + one verbatim control line. */}
              <ul className="tc-trust">
                {client.serviceArea?.trim() && <li className="tc-trust-chip">{client.serviceArea}</li>}
                {reviewCount > 0 && (
                  <li className="tc-trust-chip">
                    <span className="tc-trust-stars" aria-hidden="true">
                      ★★★★★
                    </span>
                    {reviewCount} Google reviews
                  </li>
                )}
                {copy('benefits.item3').trim() && <li className="tc-trust-chip">{copy('benefits.item3')}</li>}
              </ul>
            </div>

            {/* Form card — beside the display block on desktop, directly under
                it on mobile (dominant above the fold). Mobile shows the
                control's MOBILE form heading, desktop its desktop heading —
                both are real control copy, at their own breakpoints, exactly
                as the control ships them. */}
            <div className="tc-form-card" id={FORM_ANCHOR}>
              <Split as="h2" className="tc-form-h tc-form-h--desktop" a={copy('form.headingA')} b={copy('form.headingB')} />
              <Split as="h2" className="tc-form-h tc-form-h--mobile" a={copy('form.headingMobileA')} b={copy('form.headingMobileB')} />
              <SafeText as="p" className="tc-form-sub" value={copy('form.subline')} />
              <LeadForm
                client={client}
                className="tc-leadform"
                labels={{
                  firstName: copy('form.label.firstName'),
                  lastName: copy('form.label.lastName'),
                  phone: copy('form.label.phone'),
                  email: copy('form.label.email'),
                  submit: copy('form.submit'),
                }}
              />
            </div>
          </div>
        </section>

        {/* CANONICAL STRUCTURE v2 (owner's directive, 2026-08-13 — supersedes
            v1): offer band → captioned reviews block → results caption over
            one symmetrical grid → services blurb with photo → areas drift →
            process → remaining → footer. Copy untouched. */}

        {/* 2 — offer band: the control's own offer + trust badges */}
        <section className="tc-section tc-benefits">
          <div className="tc-container">
            <ul className="tc-benefit-ledger">
              {[1, 2, 3, 4]
                .map((n) => copy(`benefits.item${n}`))
                .filter((b) => b.trim())
                .map((b, i) => (
                  <li className="tc-benefit" key={i}>
                    {b}
                  </li>
                ))}
            </ul>
          </div>
        </section>

        {/* 3 — reviews, ONE block captioned by the control's own trust line */}
        <section className="tc-section tc-section--deep tc-why">
          <div className="tc-container">
            <Split as="h2" className="tc-h2" a={copy('why.h1a')} b={copy('why.h1b')} stacked />
            <SafeText as="p" className="tc-lede tc-lede--onink" value={copy('why.body')} />
            <ReviewsSlider client={client} />
            <div className="tc-cta-row">
              <PhoneLink client={client} placement="reviews" className="tc-call tc-call--onink" subLabel={copy('cta.callSubLabel')}>
                {copy('cta.callLabelPrefix')}
                {client.phoneDisplay}
              </PhoneLink>
            </div>
          </div>
        </section>

        {/* 4 — results: "Done Clean, Done Right" captions ONE symmetrical
            grid of the client's own trimming work */}
        <section className="tc-section tc-doneright">
          <div className="tc-container tc-measure">
            <Split as="h2" className="tc-h2" a={copy('doneRight.h1a')} b={copy('doneRight.h1b')} />
            <SafeText as="p" className="tc-body" value={copy('doneRight.body')} />
          </div>
          {gallery.length > 0 && (
            <div className="tc-container">
              <ul className="tc-work-grid">
                {gallery.map((photo, i) => (
                  <li key={i} className="tc-work-cell">
                    <DeferredImage photo={photo} wrapperClassName="tc-work-frame" className="tc-work-img" />
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>

        {/* 5 — services blurb, two-column with a client photo on the right */}
        <section className="tc-section tc-longform">
          <div className="tc-container tc-longform-grid">
            <div className="tc-longform-main tc-measure">
              <SafeText as="p" className="tc-ribbon" value={copy('longform.badge')} />
              <Split as="h2" className="tc-h2" a={copy('longform.h1a')} b={copy('longform.h1b')} />
              <SafeText as="p" className="tc-lede" value={copy('longform.lede')} />
              <SafeText as="p" className="tc-body" value={copy('longform.p1')} />
              <SafeText as="p" className="tc-body" value={copy('longform.p2')} />
              <Split as="h2" className="tc-h3" a={copy('longform.requestsH1a')} b={copy('longform.requestsH1b')} />
              {requests.length > 0 && (
                <ul className="tc-request-list">
                  {requests.map((r, i) => (
                    <li key={i}>{r}</li>
                  ))}
                </ul>
              )}
            </div>
            {gallery[1] && (
              <div className="tc-longform-photo">
                <DeferredImage
                  photo={gallery[1]}
                  wrapperClassName="tc-longform-photo-box"
                  className="tc-longform-photo-img"
                  sizes="(max-width: 979px) 92vw, 38vw"
                />
              </div>
            )}
          </div>
        </section>

        {/* 6 — service areas, mid-page between the photo work and process */}
        {cities.length > 0 && (
          <section className="tc-section tc-areas">
            <div className="tc-container">
              <Split as="h2" className="tc-h2" a={copy('areas.h1a')} b={copy('areas.h1b')} />
              <SafeText as="p" className="tc-lede" value={copy('areas.h2')} />
            </div>
            <ServiceAreasCarousel client={client} />
          </section>
        )}

        {/* 7 — process (captioned by its own heading) */}
        <section className="tc-section tc-section--tint tc-process">
          <div className="tc-container">
            <Split as="h2" className="tc-h2" a={copy('process.h1a')} b={copy('process.h1b')} stacked />
            {steps.length > 0 && (
              <ol className="tc-steps">
                {steps.map((step, i) => (
                  <li className="tc-step" key={i}>
                    <SafeText as="span" className="tc-step-label" value={step.label} />
                    <SafeText as="h3" className="tc-step-h" value={step.h} />
                    <SafeText as="p" className="tc-step-body" value={step.body} />
                  </li>
                ))}
              </ol>
            )}
          </div>
        </section>

        {/* 8 — remaining sections, existing relative order */}
        <section className="tc-section tc-section--tint tc-services">
          <div className="tc-container">
            <Split as="h2" className="tc-h2" a={copy('services.h1a')} b={copy('services.h1b')} />
            <SafeText as="p" className="tc-lede tc-measure" value={copy('services.body')} />
            {services.length > 0 && (
              <ul className="tc-service-grid">
                {services.map((s, i) => (
                  <li className="tc-service" key={i}>
                    {s}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>

        {/* ---- mid CTA (scroll to form, as in the control) ---- */}
        <section className="tc-section tc-section--tint tc-mid">
          <div className="tc-container tc-measure">
            <SafeText as="h2" className="tc-h2" value={copy('midCta.h2')} />
            <SafeText as="p" className="tc-offer" value={copy('midCta.offer')} />
            <SafeText as="p" className="tc-body" value={copy('midCta.body')} />
            <a className="tc-jump" href={`#${FORM_ANCHOR}`}>
              <SafeText as="span" className="tc-jump-main" value={copy('midCta.button')} />
              <SafeText as="span" className="tc-jump-sub" value={copy('midCta.buttonSub')} />
            </a>
          </div>
        </section>

        {/* ---- ready band ---- */}
        <section className="tc-section tc-section--deep tc-ready">
          <div className="tc-container">
            <Split as="h2" className="tc-h2" a={copy('readyCta.h1a')} b={copy('readyCta.h1b')} />
            <div className="tc-cta-row">
              <PhoneLink client={client} placement="ready" className="tc-call tc-call--onink" subLabel={copy('cta.callSubLabel')}>
                {copy('cta.callLabelPrefix')}
                {client.phoneDisplay}
              </PhoneLink>
            </div>
          </div>
        </section>

        {/* ---- FAQ ---- */}
        {faqs.length > 0 && (
          <section className="tc-section tc-faq">
            <div className="tc-container tc-measure">
              <Split as="h2" className="tc-h2" a={copy('faq.h1a')} b={copy('faq.h1b')} c={copy('faq.h1c')} />
              <div className="tc-faq-list">
                {faqs.map((f, i) =>
                  f.q.trim() ? (
                    <details className="tc-faq-item" key={i}>
                      <summary className="tc-faq-q">
                        <span>{f.q}</span>
                        <span className="tc-faq-mark" aria-hidden="true" />
                      </summary>
                      <SafeText as="p" className="tc-faq-a" value={f.a} />
                    </details>
                  ) : (
                    <div className="tc-faq-item tc-faq-item--orphan" key={i}>
                      <SafeText as="p" className="tc-faq-a" value={f.a} />
                    </div>
                  )
                )}
              </div>
            </div>
          </section>
        )}

        {/* ---- final CTA — a scroll-to-form action in the control, kept ---- */}
        <section className="tc-section tc-section--tint tc-final">
          <div className="tc-container tc-measure">
            <Split as="h2" className="tc-h2" a={copy('finalCta.h1a')} b={copy('finalCta.h1b')} />
            <SafeText as="p" className="tc-body" value={copy('finalCta.body')} />
            <a className="tc-jump" href={`#${FORM_ANCHOR}`}>
              <SafeText as="span" className="tc-jump-main" value={copy('finalCta.button')} />
              <SafeText as="span" className="tc-jump-sub" value={copy('finalCta.buttonSub')} />
            </a>
          </div>
        </section>

      </main>

      {/* ---- footer ---- */}
      <footer className="tc-footer">
        <div className="tc-container tc-footer-inner">
          <SafeText as="p" className="tc-footer-name" value={copy('footer.companyName')} />
          <SafeText as="p" className="tc-footer-address" value={copy('footer.address')} />
          <SafeText as="p" className="tc-footer-copyright" value={copy('footer.copyright')} />
          {(privacyUrl || termsUrl) && (
            <p className="tc-footer-legal">
              {privacyUrl && (
                <a href={privacyUrl} className="tc-footer-link">
                  {copy('footer.privacyLabel')}
                </a>
              )}
              {termsUrl && (
                <a href={termsUrl} className="tc-footer-link">
                  {copy('footer.termsLabel')}
                </a>
              )}
            </p>
          )}
        </div>
      </footer>

      {/* ---- sticky mobile call bar ---- */}
      <div className="tc-sticky">
        <PhoneLink client={client} placement="sticky" className="tc-call tc-call--solid tc-sticky-call" subLabel={copy('header.tapToCall')}>
          {copy('header.callPrefix')}
          {client.phoneDisplay}
        </PhoneLink>
      </div>
    </div>
  );
}
