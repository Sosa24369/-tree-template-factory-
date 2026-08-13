/**
 * S5 — recent removals, as a bento mosaic.
 *
 * PHOTOGRAPHS ARE CLIENT DATA. They come from photosFor(client, 'removal') and
 * nowhere else: these are pictures of real work at real addresses, and putting one
 * client's removals on another client's page misrepresents both of them. A client
 * with no photography gets no section here at all — never a stock tree, never the
 * template's own artwork.
 *
 * Every tile below the fold is a <DeferredImage>: it is not in the markup until an
 * IntersectionObserver says it is near, and the wrapper reserves the exact box from
 * the measured intrinsic dimensions so nothing shifts when the file arrives.
 * `loading="lazy"` alone was measured letting 30 images saturate a throttled
 * connection and cost 3s of LCP.
 *
 * The mosaic is CSS grid, not a carousel: no library, no JS, no layout thrash, and
 * it holds two photographs as happily as eight.
 */

import type { ResolvedClient } from '../../../schema/resolve';
import { SafeText } from '../../../components/Safe';
import { DeferredImage } from '../../../components/DeferredImage';
import { partitionMedia, photosFor } from '../../../lib/photos';
import { altFor, withAlt } from '../support';
import { Eyebrow, Heading, Section, type Copy } from './shared';

/** Enough to fill the mosaic twice over; more than this is weight, not proof. */
const MAX_TILES = 7;

/**
 * CANONICAL STRUCTURE (2026-08-12): the mosaic ships as TWO photo bands around
 * the process section. Band 1 carries the section's heading copy, the video
 * (if any) and the first half of the stills; band 2 is the rest, heading-less.
 * Either band collapses to nothing when it has no media.
 */
export function Work({ client, copy, band }: { client: ResolvedClient; copy: Copy; band?: 1 | 2 }) {
  const { videos, stills } = partitionMedia(photosFor(client, 'removal'));
  const clip = band === 2 ? null : (videos[0] ?? null);
  const all = stills.slice(0, (videos[0] ?? null) ? MAX_TILES - 1 : MAX_TILES);
  const split = Math.ceil(all.length / 2);
  const tiles = band === 1 ? all.slice(0, split) : band === 2 ? all.slice(split) : all;

  if (tiles.length === 0 && !clip) return null;

  return (
    <Section tone="tint" className="rb-work">
      {band !== 2 && (
        <div className="rb-head rb-rise">
          <Eyebrow>{copy('work.eyebrow')}</Eyebrow>
          <Heading as="h2" className="rb-h2" parts={[copy('work.h2a'), copy('work.h2b')]} />
          <SafeText as="p" className="rb-lede" value={copy('work.lede')} />
        </div>
      )}

      <ul className="rb-mosaic rb-rise">
        {clip && (
          <li className="rb-tile rb-tile--clip">
            <video
              className="rb-tile-video"
              // #t=0.1 is a media fragment, not a second file: with preload="none"
              // and no captured poster frame it is what makes the browser paint a
              // first frame instead of a black box.
              src={`${clip.src}#t=0.1`}
              {...(clip.width != null ? { width: clip.width } : {})}
              {...(clip.height != null ? { height: clip.height } : {})}
              controls
              muted
              loop
              playsInline
              preload="none"
            />
          </li>
        )}

        {tiles.map((shot, i) => (
          <li className="rb-tile" key={shot?.src ?? i}>
            <DeferredImage
              photo={shot?.alt ? shot : withAlt(shot, altFor(client.name, i + 1))}
              className="rb-tile-img"
              wrapperClassName="rb-tile-box"
              sizes="(max-width: 767px) 92vw, 40vw"
            />
          </li>
        ))}
      </ul>
    </Section>
  );
}
