/**
 * Gallery — the client's own completed work.
 *
 * PHOTOGRAPHS COME FROM photosFor(client, 'generic') AND NOWHERE ELSE. There is
 * no bundled fallback artwork and there is no cascade into another client's
 * folder. These are photographs of real jobs at real addresses; showing one
 * company's work on another company's page misrepresents both of them. A client
 * with no photographs gets no gallery, and the page reads perfectly well
 * without one.
 *
 * Every image is <DeferredImage>, not <SafeImage>: this sits below the fold,
 * and `loading="lazy"` alone is not enough — on a throttled connection the
 * browser widens its lazy threshold and fetches nearly the whole set anyway,
 * which is what cost removal-a 3s of LCP before the observer went in. The
 * wrapper reserves the box from the measured intrinsic size, so CLS stays at 0.
 *
 * A client's photo set may legally contain an .mp4. An <img> pointed at a video
 * renders as a broken image, so any clip is split out and given a real <video>
 * with preload="none" — a few KB until somebody presses play.
 */

import type { ResolvedClient } from '../../../schema/resolve';
import { DeferredImage } from '../../../components/DeferredImage';
import { partitionMedia, photosFor } from '../../../lib/photos';
import { galleryAlt } from '../copy.defaults';
import { Section, SectionHead } from './shared';
import { withAlt, type Copy } from '../text';

const SIZES = '(max-width: 639px) 47vw, (max-width: 1023px) 31vw, 260px';

export function Gallery({ client, copy }: { client: ResolvedClient; copy: Copy }) {
  const { videos, stills } = partitionMedia(photosFor(client, 'generic'));
  const clip = videos[0] ?? null;

  if (stills.length === 0 && !clip) return null;

  return (
    <Section tone="tint" className="ag-gallery">
      <SectionHead eyebrow={copy('gallery.eyebrow')} heading={copy('gallery.h2')} body={copy('gallery.body')} />

      <ul className="ag-shots">
        {clip && (
          <li className="ag-shot ag-shot--clip">
            <video
              className="ag-shot-video"
              // #t=0.1 is a media fragment, not another file: with preload="none"
              // and no captured poster frame it is what makes the browser paint a
              // first frame instead of an empty black box.
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

        {stills.map((shot, i) => (
          <li className="ag-shot" key={shot?.src ?? i}>
            <DeferredImage
              photo={withAlt(shot, galleryAlt(client.name, i + 1))}
              className="ag-shot-img"
              wrapperClassName="ag-shot-box"
              sizes={SIZES}
            />
          </li>
        ))}
      </ul>
    </Section>
  );
}
