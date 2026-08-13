/**
 * ServiceAreasCarousel — canonical section 7 on EVERY landing page
 * (owner's directive, Design Elevation 2026-08-12): a continuously scrolling
 * marquee of the cities this client serves, last section before the footer.
 *
 * - Cities come from client.serviceAreaList ONLY — never typed into a
 *   template (R1/R4). A record with no cities renders NOTHING (blank-co, R5);
 *   the omission is flagged in the session report, never papered over with
 *   invented geography.
 * - CSS-only animation: the track is rendered twice (second copy aria-hidden)
 *   and translated -50%, so the loop is seamless with zero JS on any path.
 *   Pauses on hover and on keyboard focus; under prefers-reduced-motion the
 *   animation is off and the single row becomes a plain scrollable strip.
 * - Zero CLS: the strip is one fixed-height row at every width; nothing about
 *   it depends on fonts, JS, or image arrival.
 *
 * Templates wrap this in their own section shell and render their OWN
 * existing areas heading copy above it — heading words are template copy,
 * the city list is client data, and this component only owns the strip.
 */

import { useState } from 'react';
import type { ResolvedClient } from '../schema/resolve';
import '../styles/service-areas-carousel.css';

export function ServiceAreasCarousel({ client }: { client: ResolvedClient }) {
  const cities = (client.serviceAreaList ?? [])
    .filter((c) => typeof c === 'string' && c.trim())
    .map((c) => c.trim());

  // Premium Reorder v2: touch pauses the drift (CSS handles hover/focus; touch
  // has no hover, so a tiny bit of state does it post-hydration). The strip is
  // also user-scrollable — overflow-x auto in the stylesheet.
  const [touchPaused, setTouchPaused] = useState(false);

  if (cities.length === 0) return null;

  // The animation moves the track exactly -50%, so the visible strip must be
  // one full copy of the list; duration scales with list length so long lists
  // do not blur past and short lists do not crawl. v2 slowed the drift from
  // 3s to 6s per city — a gentle drift, not a ticker.
  const duration = Math.max(36, cities.length * 6);

  const row = (hidden: boolean) => (
    <ul className="sac-row" aria-hidden={hidden || undefined}>
      {cities.map((city, i) => (
        <li className="sac-city" key={i}>
          {city}
        </li>
      ))}
    </ul>
  );

  return (
    <div
      className="sac"
      role="group"
      aria-label="Service areas"
      onTouchStart={() => setTouchPaused(true)}
      onTouchEnd={() => window.setTimeout(() => setTouchPaused(false), 4000)}
    >
      <div
        className="sac-track"
        style={{ animationDuration: `${duration}s`, animationPlayState: touchPaused ? 'paused' : undefined }}
        tabIndex={0}
      >
        {row(false)}
        {row(true)}
      </div>
    </div>
  );
}

export default ServiceAreasCarousel;
