/**
 * S3 — the before/after slider. The source has ZERO copy here: five 1080x1080
 * photographs in a Swiper carousel, and the only text on the whole section is the
 * alt attributes.
 *
 * Here it is a CSS scroll-snap rail: no carousel library, no JS, keyboard- and
 * touch-scrollable, and each slide keeps its measured width/height so the rail never
 * reflows as images arrive.
 *
 * The photographs are the CLIENT'S. There is no template fallback artwork, because
 * these are photographs of real work at real addresses and putting one company's
 * jobs on another's page misrepresents both. A client with no photographs gets no
 * slider at all — the section returns null rather than leaving an empty rail (R5).
 */

import type { ResolvedClient } from '../../../schema/resolve';
import { DeferredImage } from '../../../components/DeferredImage';
import { altFor, photoSlots, withAlt } from '../slots';

/**
 * CANONICAL STRUCTURE (2026-08-12): the rail ships as TWO photo bands around
 * the process section. Band 1 = the video (if any) + the first half; band 2 =
 * the rest; either collapses to nothing when empty.
 */
export function Gallery({ client, band }: { client: ResolvedClient; band?: 1 | 2 }) {
  const { gallery: all, video: clientVideo } = photoSlots(client);
  const split = Math.ceil(all.length / 2);
  const gallery = band === 1 ? all.slice(0, split) : band === 2 ? all.slice(split) : all;
  const video = band === 2 ? null : clientVideo;
  if (gallery.length === 0 && !video) return null;

  return (
    <section className="ta-gallery">
      <ul className="ta-rail">
        {video && (
          <li className="ta-rail-item ta-rail-item--video">
            <video
              className="ta-rail-video"
              // #t=0.1 is a media fragment, not a different file: with preload="none"
              // and no captured poster frame it is what makes the browser paint the
              // first frame instead of an empty black box.
              src={`${video.src}#t=0.1`}
              {...(video.width != null ? { width: video.width } : {})}
              {...(video.height != null ? { height: video.height } : {})}
              controls
              muted
              loop
              playsInline
              preload="none"
            />
          </li>
        )}

        {gallery.map((shot, i) => (
          <li className="ta-rail-item" key={shot?.src ?? i}>
            <DeferredImage
              photo={withAlt(shot, altFor(client.name, i + 1))}
              className="ta-shot-img"
              wrapperClassName="ta-shot"
              sizes="(max-width: 767px) 78vw, 30vw"
            />
          </li>
        ))}
      </ul>
    </section>
  );
}
