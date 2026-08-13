/**
 * removal-c page — every section renders removal-a COPY KEYS ONLY (the hybrid's
 * copy constant), laid out in removal-b's design direction, elevated.
 *
 * Section order keeps the control's information architecture (its copy fills
 * exactly these slots) inside -b's visual system: text-led hero with the form
 * beside it (stacked directly under the H1 block on mobile — dominant above the
 * fold), record-composed trust strip, benefits, work mosaic, reviews slider,
 * restoration band, services, areas, long-form, mid CTA, process, FAQ, final
 * CTA, footer, sticky mobile call bar.
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

const FORM_ANCHOR = 'rc-form';

/** url() is CSS grammar — escape before handing a client path to a custom property. */
function cssUrl(src: string): string {
  return `url("${src.replace(/["'()\\\s]/g, encodeURIComponent)}")`;
}

function stills(client: ResolvedClient, limit?: number): PhotoSet[] {
  const list = photosFor(client, 'removal');
  const { stills: onlyStills } = partitionMedia(list);
  return typeof limit === 'number' ? onlyStills.slice(0, limit) : onlyStills;
}

/** Two-part heading whose word gap is carried by the copy's own spaces. */
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
    <Tag className={[className, stacked ? 'rc-stacked' : null].filter(Boolean).join(' ')}>
      {a.trim() && <span>{a}</span>}
      {b.trim() && <span className="rc-accent">{b}</span>}
      {c && c.trim() && <span>{c}</span>}
    </Tag>
  );
}

function RatingBadge({ copy }: { copy: Copy }) {
  const word = copy('ratingBadge.logoText');
  const stars = copy('ratingBadge.stars');
  const rating = copy('ratingBadge.rating');
  const caption = copy('ratingBadge.caption');
  if (!(word.trim() || stars.trim())) return null;
  return (
    <p className="rc-badge">
      {word.trim() && (
        <span className="rc-badge-word" aria-label={word}>
          {[...word].map((letter, i) => (
            <span key={i} aria-hidden="true" className="rc-badge-letter">
              {letter}
            </span>
          ))}
        </span>
      )}
      {stars.trim() && (
        <span className="rc-badge-stars" aria-hidden="true">
          {stars}
        </span>
      )}
      <SafeText as="strong" className="rc-badge-rating" value={rating} />
      <SafeText as="span" className="rc-badge-caption" value={caption} />
    </p>
  );
}

/** The one call CTA treatment, reused at each of the control's call placements. */
function CallCta({
  client,
  copy,
  placement,
  tone,
}: {
  client: ResolvedClient;
  copy: Copy;
  placement: string;
  tone?: 'onInk' | 'solid';
}) {
  return (
    <PhoneLink
      client={client}
      placement={placement}
      className={['rc-call', tone === 'onInk' ? 'rc-call--onink' : 'rc-call--solid'].join(' ')}
      subLabel={copy('cta.callSubLabel')}
    >
      {copy('cta.callLabelPrefix')}
      {client.phoneDisplay}
    </PhoneLink>
  );
}

export function RemovalCPage({
  client,
  copy,
  brandStyle,
}: {
  client: ResolvedClient;
  copy: Copy;
  brandStyle: CSSProperties;
}) {
  const art = stills(client, 1)[0] ?? null;
  const heroStyle: CSSProperties = {
    ...brandStyle,
    ...(art?.src ? ({ '--rc-art': cssUrl(art.src) } as CSSProperties) : null),
  };
  const gallery = stills(client, 9);
  const reviewCount = (client.reviews ?? []).filter((r) => (r?.body ?? '').trim()).length;
  const services = Array.from({ length: 20 }, (_, i) => copy(`services.item${i + 1}`)).filter((s) => s.trim());
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

  return (
    <div className="removal-c" style={brandStyle}>
      {/* ---- header ---- */}
      <header className="rc-header">
        <div className="rc-container rc-header-inner">
          <SafeLogo
            logoUrl={client.brand?.logoUrl}
            clientName={client.name}
            className="rc-logo"
            srcset={client.brand?.logoSrcset}
            sizes="(min-width: 768px) 88px, 60px"
            width={client.brand?.logoWidth}
            height={client.brand?.logoHeight}
          />
          <PhoneLink client={client} placement="header" className="rc-call rc-call--header" subLabel={copy('header.tapToCall')}>
            {copy('cta.callLabelPrefix')}
            {client.phoneDisplay}
          </PhoneLink>
        </div>
      </header>

      <main>
        {/* ---- hero: the control's offer H1 in the variant's ink voice ---- */}
        <section className="rc-hero" style={heroStyle}>
          <div className="rc-container">
            {/* Premium Reorder v2: the client's logo + name, larger and
                centered in the hero. */}
            <HeroBrand client={client} className="rc-hbrand" />
          </div>
          <div className="rc-container rc-hero-grid">
            <div className="rc-hero-copy">
              <RatingBadge copy={copy} />
              <Split as="h1" className="rc-h1" a={copy('hero.h1a')} b={copy('hero.h1b')} />
              <SafeText as="p" className="rc-hero-sub" value={copy('hero.h2')} />
              <SafeText as="p" className="rc-hero-body" value={copy('hero.body')} />
              <div className="rc-hero-ctas">
                {/* v2: gentle periodic bounce on the primary tap-to-call. */}
                <span className="cta-bounce rc-bounce">
                  <CallCta client={client} copy={copy} placement="hero" tone="onInk" />
                </span>
                <a className="rc-jump" href={`#${FORM_ANCHOR}`}>
                  <SafeText as="span" value={copy('form.headingA')} />
                  <SafeText as="span" value={copy('form.headingB')} />
                </a>
              </div>

              {/* Trust strip — record facts + one verbatim control line. */}
              <ul className="rc-trust">
                {client.serviceArea?.trim() && <li className="rc-trust-chip">{client.serviceArea}</li>}
                {reviewCount > 0 && (
                  <li className="rc-trust-chip">
                    <span className="rc-trust-stars" aria-hidden="true">
                      ★★★★★
                    </span>
                    {reviewCount} Google reviews
                  </li>
                )}
                {copy('benefits.item3').trim() && <li className="rc-trust-chip">{copy('benefits.item3')}</li>}
              </ul>
            </div>

            {/* The form card — beside the H1 on desktop, directly under it on
                mobile: dominant above the fold, per the brief. */}
            <div className="rc-form-card" id={FORM_ANCHOR}>
              <Split as="h2" className="rc-form-h" a={copy('form.headingA')} b={copy('form.headingB')} />
              <SafeText as="p" className="rc-form-sub" value={copy('form.subline')} />
              <LeadForm
                client={client}
                className="rc-leadform"
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
        <section className="rc-section rc-benefits">
          <div className="rc-container">
            <ul className="rc-benefit-grid">
              {[1, 2, 3, 4]
                .map((n) => copy(`benefits.item${n}`))
                .filter((b) => b.trim())
                .map((b, i) => (
                  <li className="rc-benefit" key={i}>
                    {b}
                  </li>
                ))}
            </ul>
          </div>
        </section>

        {/* 3 — reviews, ONE block captioned by the control's own trust line */}
        <section className="rc-section rc-section--deep rc-why">
          <div className="rc-container">
            <Split as="h2" className="rc-h2" a={copy('why.h1a')} b={copy('why.h1b')} stacked />
            <SafeText as="p" className="rc-lede" value={copy('why.body')} />
            <ReviewsSlider client={client} />
            <div className="rc-cta-row">
              <CallCta client={client} copy={copy} placement="reviews" tone="onInk" />
            </div>
          </div>
        </section>

        {/* 4 — results: "Restoration Results Guaranteed" captions ONE
            symmetrical grid of the client's own work */}
        <section className="rc-section rc-restoration">
          <div className="rc-container rc-measure">
            <Split as="h2" className="rc-h2" a={copy('restoration.h1a')} b={copy('restoration.h1b')} />
            <SafeText as="p" className="rc-body" value={copy('restoration.body')} />
          </div>
          {gallery.length > 0 && (
            <div className="rc-container">
              <ul className="rc-work-grid">
                {gallery.map((photo, i) => (
                  <li key={i} className="rc-work-cell">
                    <DeferredImage photo={photo} wrapperClassName="rc-work-frame" className="rc-work-img" />
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>

        {/* 5 — services blurb, two-column with a client photo on the right */}
        <section className="rc-section rc-section--tint rc-longform">
          <div className="rc-container rc-longform-grid">
            <div className="rc-longform-main rc-measure">
              <SafeText as="p" className="rc-ribbon" value={copy('longform.badge')} />
              <Split as="h2" className="rc-h2" a={copy('longform.h2a')} b={copy('longform.h2b')} />
              <SafeText as="p" className="rc-lede" value={copy('longform.lede')} />
              <SafeText as="p" className="rc-body" value={copy('longform.p1')} />
              <SafeText as="p" className="rc-body" value={copy('longform.p2')} />
              <Split as="h2" className="rc-h3" a={copy('longform.requestsH2a')} b={copy('longform.requestsH2b')} />
              {requests.length > 0 && (
                <ul className="rc-request-list">
                  {requests.map((r, i) => (
                    <li key={i}>{r}</li>
                  ))}
                </ul>
              )}
            </div>
            {gallery[1] && (
              <div className="rc-longform-photo">
                <DeferredImage
                  photo={gallery[1]}
                  wrapperClassName="rc-longform-photo-box"
                  className="rc-longform-photo-img"
                  sizes="(max-width: 979px) 92vw, 38vw"
                />
              </div>
            )}
          </div>
        </section>

        {/* 6 — service areas, mid-page between the photo work and process */}
        {cities.length > 0 && (
          <section className="rc-section rc-areas">
            <div className="rc-container">
              <Split as="h2" className="rc-h2" a={copy('areas.h1a')} b={copy('areas.h1b')} />
              <SafeText as="p" className="rc-lede" value={copy('areas.h2')} />
            </div>
            <ServiceAreasCarousel client={client} />
          </section>
        )}

        {/* 7 — process (captioned by its own heading) */}
        <section className="rc-section rc-process">
          <div className="rc-container">
            <Split as="h2" className="rc-h2" a={copy('process.h1a')} b={copy('process.h1b')} stacked />
            {steps.length > 0 && (
              <ol className="rc-steps">
                {steps.map((step, i) => (
                  <li className="rc-step" key={i}>
                    <SafeText as="span" className="rc-step-label" value={step.label} />
                    <SafeText as="h3" className="rc-step-h" value={step.h} />
                    <SafeText as="p" className="rc-step-body" value={step.body} />
                  </li>
                ))}
              </ol>
            )}
          </div>
        </section>

        {/* 8 — remaining sections, existing relative order */}
        <section className="rc-section rc-section--tint rc-services">
          <div className="rc-container">
            <Split as="h2" className="rc-h2" a={copy('services.h1a')} b={copy('services.h1b')} />
            <SafeText as="p" className="rc-lede rc-measure" value={copy('services.body')} />
            {services.length > 0 && (
              <ul className="rc-service-grid">
                {services.map((s, i) => (
                  <li className="rc-service" key={i}>
                    {s}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>

        {/* ---- mid CTA (scroll to form, as in the control) ---- */}
        <section className="rc-section rc-near">
          <div className="rc-container rc-measure">
            <SafeText as="h2" className="rc-h2" value={copy('nearYou.h2')} />
            <SafeText as="p" className="rc-body" value={copy('nearYou.body')} />
            <a className="rc-jump rc-jump--solid" href={`#${FORM_ANCHOR}`}>
              <SafeText as="span" className="rc-jump-main" value={copy('nearYou.button')} />
              <SafeText as="span" className="rc-jump-sub" value={copy('nearYou.buttonSub')} />
            </a>
          </div>
        </section>

        {/* ---- ready band ---- */}
        <section className="rc-section rc-section--deep rc-ready">
          <div className="rc-container">
            <Split as="h2" className="rc-h2" a={copy('readyCta.h1a')} b={copy('readyCta.h1b')} />
            <div className="rc-cta-row">
              <CallCta client={client} copy={copy} placement="ready" tone="onInk" />
            </div>
          </div>
        </section>

        {/* ---- FAQ ---- */}
        {faqs.length > 0 && (
          <section className="rc-section rc-section--tint rc-faq">
            <div className="rc-container rc-measure">
              <Split as="h2" className="rc-h2" a={copy('faq.h1a')} b={copy('faq.h1b')} c={copy('faq.h1c')} />
              <div className="rc-faq-list">
                {faqs.map((f, i) =>
                  f.q.trim() ? (
                    <details className="rc-faq-item" key={i}>
                      <summary className="rc-faq-q">
                        <span>{f.q}</span>
                        <span className="rc-faq-mark" aria-hidden="true" />
                      </summary>
                      <SafeText as="p" className="rc-faq-a" value={f.a} />
                    </details>
                  ) : (
                    /* Answer-only pair (an operator mid-edit): plain block, never a
                       focusable <summary> with no accessible name (the R5/a11y fix). */
                    <div className="rc-faq-item rc-faq-item--orphan" key={i}>
                      <SafeText as="p" className="rc-faq-a" value={f.a} />
                    </div>
                  )
                )}
              </div>
            </div>
          </section>
        )}

        {/* ---- final CTA (the control's digit-less call link) ---- */}
        <section className="rc-section rc-section--deep rc-final">
          <div className="rc-container">
            <Split as="h2" className="rc-h2" a={copy('finalCta.h1a')} b={copy('finalCta.h1b')} />
            <SafeText as="p" className="rc-lede rc-measure" value={copy('finalCta.body')} />
            <PhoneLink client={client} placement="final" className="rc-call rc-call--onink" subLabel={copy('finalCta.linkSub')}>
              {copy('finalCta.linkLabel')}
            </PhoneLink>
          </div>
        </section>

      </main>

      {/* ---- footer ---- */}
      <footer className="rc-footer">
        <div className="rc-container rc-footer-inner">
          <SafeText as="p" className="rc-footer-name" value={copy('footer.companyName')} />
          <SafeText as="p" className="rc-footer-copyright" value={copy('footer.copyright')} />
          {(privacyUrl || termsUrl) && (
            <p className="rc-footer-legal">
              {privacyUrl && (
                <a href={privacyUrl} className="rc-footer-link">
                  {copy('footer.privacyLabel')}
                </a>
              )}
              {termsUrl && (
                <a href={termsUrl} className="rc-footer-link">
                  {copy('footer.termsLabel')}
                </a>
              )}
            </p>
          )}
        </div>
      </footer>

      {/* ---- sticky mobile call bar ---- */}
      <div className="rc-sticky">
        <PhoneLink client={client} placement="sticky" className="rc-call rc-call--solid rc-sticky-call" subLabel={copy('header.tapToCallMobile')}>
          {copy('cta.callLabelPrefix')}
          {client.phoneDisplay}
        </PhoneLink>
      </div>
    </div>
  );
}
