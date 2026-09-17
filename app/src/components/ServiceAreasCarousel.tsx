/**
 * ServiceAreas — every city in the record, once, alphabetical, all visible at once.
 *
 * A grid, not a wrapped row of pills: the reader (and the Ads reviewer looking for the
 * geo list) scans a column-aligned list faster than a ragged flow, and a grid lets the
 * column count be chosen so the LAST ROW IS NEVER ONE LONELY CITY. The column count per
 * breakpoint is computed here from the city count and emitted as custom properties, so
 * the stylesheet stays static and the same markup serves every client:
 *
 *   <768   two columns (three only if two would strand one city and three would not);
 *          when neither avoids a stranded city — 25 is 5 × 5 — the last THREE cities
 *          share the last row instead (a 60-track grid: cells span 30, the tail spans 20).
 *   ≥768   four / three / five columns, the first that leaves the last row ≥ 2.
 *   ≥1024  five / six / four / three, likewise.
 *
 * History: a drifting marquee until 2026-09-16 (two copies of the list, a mask, a first
 * chip nobody could reach), then a wrapped static row. The owner's ruling: static stays.
 * The cities are CLIENT DATA (client.serviceAreaList), never copy. Repeats in a record
 * are dropped case-insensitively, first spelling wins. Component name, export and the
 * `sac` class root are unchanged so nothing that imports or styles it has to change.
 */

import type { CSSProperties } from 'react';
import type { ResolvedClient } from '../schema/resolve';
import '../styles/service-areas-carousel.css';

const TRACKS = 60; // divisible by every column count in play (2–6); a fractional span is invalid CSS and collapses the grid

/** First column count whose last row holds ≥ 2 cities; null if none in the list does. */
function pick(n: number, candidates: number[]): number | null {
  for (const c of candidates) if (n <= c || n % c !== 1) return c;
  return null;
}

export function areaColumns(n: number) {
  const s = pick(n, [2, 3]);
  const m = pick(n, [4, 3, 5]) ?? 4;
  const l = pick(n, [5, 6, 4, 3]) ?? 5;
  // No small column count works: use two, and let the last three cities share the last row.
  const tail = s === null ? 3 : 0;
  return { s: s ?? 2, m, l, tail };
}

export function ServiceAreasCarousel({ client }: { client: ResolvedClient }) {
  const seen = new Set<string>();
  const cities = (client.serviceAreaList ?? [])
    .filter((c): c is string => {
      if (typeof c !== 'string' || !c.trim()) return false;
      const key = c.trim().toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .map((c) => c.trim())
    .sort((a, b) => a.localeCompare(b, 'en', { sensitivity: 'base' }));

  if (cities.length === 0) return null;

  const cols = areaColumns(cities.length);
  const style = {
    '--sac-span-s': TRACKS / cols.s,
    '--sac-span-m': TRACKS / cols.m,
    '--sac-span-l': TRACKS / cols.l,
    '--sac-span-tail': cols.tail ? TRACKS / cols.tail : TRACKS / cols.s,
  } as CSSProperties;

  return (
    <div className="sac" role="group" aria-label="Service areas">
      <ul className="sac-row" style={style} data-cities={cities.length}>
        {cities.map((city, i) => (
          <li className={'sac-city' + (cols.tail && i >= cities.length - cols.tail ? ' sac-city--tail' : '')} key={city}>
            {city}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default ServiceAreasCarousel;
