/**
 * ServiceAreas — every city once, as a wrapped list of chips.
 *
 * Until 2026-09-16 this was a drifting marquee: the list rendered twice (the second copy
 * aria-hidden) inside a track animated -50% for a seamless loop, under an edge mask, and
 * user-scrollable. On the live pages every city showed twice (50 chips for Texas Tree
 * Tops' 25), the mask faded whichever chip sat at an edge, and the first chip could not be
 * scrolled to. The owner's ruling for the four-page batch: the readable list is one copy
 * of each city, static, nothing faded or clipped; restoring motion is a later, shared item.
 *
 * The cities are CLIENT DATA (client.serviceAreaList), never copy. Repeats in a record are
 * dropped case-insensitively, first spelling wins, order preserved. The component keeps
 * its name and its class root (`sac`) so nothing that imports or styles it has to change.
 */

import type { ResolvedClient } from '../schema/resolve';
import '../styles/service-areas-carousel.css';

export function ServiceAreasCarousel({ client }: { client: ResolvedClient }) {
  const seen = new Set<string>();
  const cities = (client.serviceAreaList ?? []).filter((c): c is string => {
    if (typeof c !== 'string' || !c.trim()) return false;
    const key = c.trim().toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  if (cities.length === 0) return null;

  return (
    <div className="sac" role="group" aria-label="Service areas">
      <ul className="sac-row">
        {cities.map((city) => (
          <li className="sac-city" key={city}>
            {city.trim()}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default ServiceAreasCarousel;
