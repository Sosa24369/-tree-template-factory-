/**
 * WORK — the client's own trimming photographs, set as a quiet editorial column.
 *
 * PHOTOGRAPHS ARE CLIENT DATA, FULL STOP. They come from photosFor(client,
 * 'trimming') and nowhere else. There is no bundled photographic artwork in this
 * template to fall back to, because falling back would mean printing one company's
 * real jobs at real addresses on another company's page. A client with no
 * photographs gets no section — not a placeholder, not a stock tree (R5).
 *
 * Videos are filtered out: the client photo sets can contain an .mp4 (the removal
 * manifest does), an <img> pointed at one renders as a broken image, and a video
 * player is the wrong element for the restrained half of this pair anyway.
 *
 * Every image is below the fold, so every image is a <DeferredImage>: not in the
 * markup at all until an IntersectionObserver says it is near. `loading="lazy"`
 * alone was measured on removal-a to let 30 images saturate a throttled connection
 * and cost 3.2s of LCP.
 *
 * The layout is CSS multi-column rather than a fixed-height grid, so each photograph
 * keeps its own proportions and the deferred boxes reserve exactly the right space —
 * no cropping decisions taken on the client's behalf, and no cumulative layout shift.
 * Capped at six: on this side of the test, six considered photographs read as a
 * portfolio and twenty read as a carousel.
 */

import type { ResolvedClient } from '../../../schema/resolve';
import { DeferredImage } from '../../../components/DeferredImage';
import { partitionMedia, photosFor } from '../../../lib/photos';
import { altFor, Eyebrow, Section, type Copy } from './shared';

const MAX_PHOTOS = 6;

export function Work({ client, copy }: { client: ResolvedClient; copy: Copy }) {
  const { stills } = partitionMedia(photosFor(client, 'trimming'));
  const shots = stills.slice(0, MAX_PHOTOS);
  if (shots.length === 0) return null;

  return (
    <Section tone="paper" className="tb-work">
      <div className="tb-head">
        <Eyebrow value={copy('work.eyebrow')} />
        {copy('work.h2').trim() && <h2 className="tb-display tb-display--sm">{copy('work.h2')}</h2>}
      </div>

      <div className="tb-work-grid">
        {shots.map((shot, i) => (
          <figure className="tb-work-fig" key={shot?.src ?? i}>
            <DeferredImage
              // A client who wrote their own alt text keeps it; one who did not gets
              // an alt composed from their name at render time, because a literal
              // here would hardcode a company into the template (R1).
              photo={shot?.alt?.trim() ? shot : { ...shot, alt: altFor(client.name, i + 1) }}
              className="tb-work-img"
              wrapperClassName="tb-work-box"
              sizes="(max-width: 639px) 92vw, (max-width: 999px) 46vw, 31vw"
            />
          </figure>
        ))}
      </div>
    </Section>
  );
}
