/**
 * Hero — the emergency premise. This is where the storm page makes its case.
 *
 * PERFORMANCE — why there is no photograph here on a phone:
 *   The mobile LCP element is the H1, which is text and paints as soon as the CSS
 *   lands. The hero photograph is DESKTOP-ONLY, and it is NOT an <img> that a phone
 *   would download and then hide: the file path is handed to CSS as the custom
 *   property --st-art, and the only rule that consumes it lives inside the
 *   (min-width: 980px) query. A non-matching media query never fetches its
 *   backgrounds, so on a phone the image is not merely hidden — it is never
 *   requested. Everything else in the hero is gradient, type and inline SVG. This is
 *   the same pattern removal-b measured at mobile LCP 2.0s under applied throttling.
 *
 * GEOGRAPHY IS CLIENT DATA. The headline is composed here: with a service area it
 * reads "Storm Damage in {area}? We're Already Moving."; with none it falls back to
 * hero.h1NoArea, so it is never "Storm Damage in ? …" (R5). The area itself is
 * client.serviceArea, never a hardcoded city.
 *
 * The photograph is the CLIENT's own storm/removal work (stormStills), never bundled
 * artwork and never another client's job. A client with no such photography gets a
 * hero with no art panel and a wider copy column, which is a perfectly good hero.
 */

import type { CSSProperties } from 'react';
import type { ResolvedClient } from '../../../schema/resolve';
import { SafeText } from '../../../components/Safe';
import { stormStills, cssUrl } from '../support';
import { AlertIcon, CallCta, FORM_ANCHOR, type Copy } from './shared';

export function Hero({ client, copy }: { client: ResolvedClient; copy: Copy }) {
  const art = stormStills(client, 1)[0] ?? null;
  const artStyle = art?.src ? ({ '--st-art': cssUrl(art.src) } as CSSProperties) : undefined;

  const area = (client.serviceArea ?? '').trim();
  const firstLine = area ? `${copy('hero.h1InPrefix')}${area}?` : copy('hero.h1NoArea');
  const secondLine = copy('hero.h1b');

  const primaryCta = copy('hero.primaryCta');
  const safety = copy('hero.safety');

  return (
    <section className={['st-hero', art?.src ? null : 'st-hero--noart'].filter(Boolean).join(' ')}>
      <div className="st-container st-hero-inner">
        <div className="st-hero-copy">
          <p className="st-eyebrow st-eyebrow--onInk">
            <span className="st-eyebrow-dot" aria-hidden="true" />
            {copy('hero.eyebrow')}
          </p>

          {/* Composed headline. The accent falls on the second line. */}
          {(firstLine.trim() || secondLine.trim()) && (
            <h1 className="st-h1">
              {firstLine.trim() && <span>{firstLine}</span>}
              {secondLine.trim() && <span className="st-accent"> {secondLine}</span>}
            </h1>
          )}

          <SafeText as="p" className="st-hero-sub" value={copy('hero.sub')} />
          <SafeText as="p" className="st-hero-body" value={copy('hero.body')} />

          {/* The 911 line — rendered prominently, never as fine print (R5-safe: if
              the copy is blanked the whole callout disappears). */}
          {safety.trim() && (
            <p className="st-safety" role="note">
              <span className="st-safety-mark" aria-hidden="true">
                <AlertIcon />
              </span>
              <span>{safety}</span>
            </p>
          )}

          <div className="st-hero-actions">
            {primaryCta.trim() && (
              <a className="st-call st-call--accent st-call--lg st-hero-primary" href={`#${FORM_ANCHOR}`}>
                <span>{primaryCta}</span>
              </a>
            )}
            <CallCta client={client} copy={copy} placement="hero" prefix tone="outline" size="lg" subKey="cta.callSub" />
          </div>
        </div>

        {/* Decorative. The same photographs appear properly, with real alt text, in
            the recent-storm-work section below. Desktop-only via CSS (see the
            performance note above). */}
        {art?.src && (
          <div className="st-hero-art" aria-hidden="true">
            <div className="st-hero-frame" style={artStyle} />
            <div className="st-hero-badge">
              <span className="st-hero-badge-stars">{copy('hero.artBadgeStars')}</span>
              <strong className="st-hero-badge-value">{copy('hero.artBadgeValue')}</strong>
              <span className="st-hero-badge-label">{copy('hero.artBadgeLabel')}</span>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
