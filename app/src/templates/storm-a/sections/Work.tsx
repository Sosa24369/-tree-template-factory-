/**
 * Recent storm work — a photo mosaic.
 *
 * PHOTOGRAPHS ARE CLIENT DATA. They come from stormStills(client) — the client's own
 * storm (then removal) set — and nowhere else. A client with no such photography
 * gets no section here at all: never a stock tree, never the template's own artwork,
 * and never another client's job (R4). That is why this section can vanish entirely
 * on a client like j-valdez, and that is correct.
 *
 * Every tile is a <DeferredImage>: it is not in the markup until an
 * IntersectionObserver says it is near, and the wrapper reserves the exact box from
 * the measured intrinsic dimensions so nothing shifts when the file arrives (CLS 0).
 * `loading="lazy"` alone was measured letting ~30 images saturate a throttled
 * connection and cost seconds of LCP.
 */

import type { ResolvedClient } from '../../../schema/resolve';
import { SafeText } from '../../../components/Safe';
import { DeferredImage } from '../../../components/DeferredImage';
import { altFor, stormStills, withAlt } from '../support';
import { Eyebrow, Heading, Section, type Copy } from './shared';

/** Enough to fill the mosaic; more than this is weight, not proof. */
const MAX_TILES = 6;

export function Work({ client, copy }: { client: ResolvedClient; copy: Copy }) {
  const tiles = stormStills(client, MAX_TILES);
  if (tiles.length === 0) return null;

  return (
    <Section tone="paper" className="st-work">
      <div className="st-head">
        <Eyebrow>{copy('work.eyebrow')}</Eyebrow>
        <Heading as="h2" className="st-h2" parts={[copy('work.h2a'), copy('work.h2b')]} />
        <SafeText as="p" className="st-lede" value={copy('work.lede')} />
      </div>

      <ul className="st-mosaic">
        {tiles.map((shot, i) => (
          <li className="st-tile" key={shot?.src ?? i}>
            <DeferredImage
              photo={shot?.alt ? shot : withAlt(shot, altFor(client.name, i + 1))}
              className="st-tile-img"
              wrapperClassName="st-tile-box"
              sizes="(max-width: 767px) 92vw, 32vw"
            />
          </li>
        ))}
      </ul>
    </Section>
  );
}
