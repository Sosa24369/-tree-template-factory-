/**
 * Hero — headline, subhead, up to three proof points, and the request form.
 *
 * NO PHOTOGRAPH, AT ANY WIDTH. That is a performance decision taken at design
 * time, not a cleanup pass afterwards:
 *
 *   - removal-a measured a photographic mobile hero at ~2.6s of render delay on
 *     a throttled connection, which is the whole 2.5s LCP budget spent on one
 *     decode, and dropped to the brand colour on mobile for exactly that reason.
 *   - This template goes one step further and keeps the band flat at every
 *     width, so the LCP element is TEXT. Text needs no network round trip after
 *     the CSS, which is the cheapest LCP that exists.
 *   - It is also the only honest option here. A service-neutral template cannot
 *     ship its own hero artwork — any photograph it bundled would depict some
 *     specific trade, and a client's own photographs must never be swapped for
 *     another client's. So the client's real work opens the gallery below,
 *     deferred, where it costs nothing above the fold.
 *
 * LAYOUT WHEN THE COPY IS BLANK. With every copy key empty the left column has
 * nothing in it, so it is not rendered at all and the form centres itself in a
 * single narrow column. The result reads as a deliberately spare request page
 * rather than a two-column grid with a hole in it (R5).
 */

import type { ResolvedClient } from '../../../schema/resolve';
import { SafeText } from '../../../components/Safe';
import { LeadForm } from '../../../components/LeadForm';
import { PhoneLink } from '../../../components/PhoneLink';
import { agnosticChrome } from '../copy.defaults';
import { CheckIcon } from './shared';
import { hasText, orChrome, type Copy } from '../text';

/** The in-page target the closing CTA links back to. */
export const FORM_ANCHOR = 'ag-request';

export function Hero({ client, copy }: { client: ResolvedClient; copy: Copy }) {
  const eyebrow = copy('hero.eyebrow');
  const headline = copy('hero.h1');
  const sub = copy('hero.sub');

  const points = [1, 2, 3].map((n) => copy(`hero.point${n}`)).filter(hasText);

  const hasCopy = hasText(eyebrow) || hasText(headline) || hasText(sub) || points.length > 0;

  return (
    <section className={['ag-hero', hasCopy ? null : 'ag-hero--solo'].filter(Boolean).join(' ')}>
      <div className="ag-container ag-hero-grid">
        {hasCopy && (
          <div className="ag-hero-copy">
            <SafeText as="p" className="ag-eyebrow" value={eyebrow} />
            <SafeText as="h1" className="ag-h1" value={headline} />
            <SafeText as="p" className="ag-hero-sub" value={sub} />

            {points.length > 0 && (
              <ul className="ag-hero-points">
                {points.map((point, i) => (
                  <li key={i}>
                    <CheckIcon />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            )}

            {/* CANONICAL STRUCTURE (2026-08-12): both capture paths in the
                hero. The number itself is the label — no copy is invented for
                a template whose every string may legitimately be blank; the
                link renders nothing at all without a phone on the record (R5). */}
            <span className="cta-bounce ag-bounce">
              <PhoneLink client={client} placement="hero" className="ag-hero-call">
                {client.phoneDisplay}
              </PhoneLink>
            </span>
          </div>
        )}

        {/* With every hero copy key blank the copy column above does not render
            (R5's spare request page) — the call path still belongs in the hero,
            so it rides with the form card instead in that state. */}
        {!hasCopy && (
          <span className="cta-bounce ag-bounce ag-bounce--solo">
            <PhoneLink client={client} placement="hero" className="ag-hero-call ag-hero-call--solo">
              {client.phoneDisplay}
            </PhoneLink>
          </span>
        )}

        <div className="ag-form-card" id={FORM_ANCHOR}>
          <SafeText as="h2" className="ag-form-heading" value={copy('form.heading')} />
          <SafeText as="p" className="ag-form-subline" value={copy('form.subline')} />

          {/* The shared form: it already carries the SMS consent opt-in, the
              hidden ad-click-id fields and the guarded thank-you destination, so
              none of that is ever rebuilt per template.

              Field labels fall back to the neutral working defaults in
              copy.defaults.ts. Everything else on this page may legitimately be
              blank; an unlabelled input may not. */}
          <LeadForm
            client={client}
            className="ag-form"
            labels={{
              firstName: orChrome(copy('form.label.firstName'), agnosticChrome.firstName),
              lastName: orChrome(copy('form.label.lastName'), agnosticChrome.lastName),
              phone: orChrome(copy('form.label.phone'), agnosticChrome.phone),
              email: orChrome(copy('form.label.email'), agnosticChrome.email),
              submit: orChrome(copy('form.submit'), agnosticChrome.submit),
            }}
          />

          <SafeText as="p" className="ag-form-footnote" value={copy('form.footnote')} />
        </div>
      </div>
    </section>
  );
}
