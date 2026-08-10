/**
 * S2 — recent jobs. No text at all in the source; it is a 15-slide Swiper carousel
 * of hot-linked Google photos.
 *
 * Here it is a CSS scroll-snap rail: no carousel library, no JS, no layout thrash,
 * keyboard- and touch-scrollable, and every slide keeps its measured width/height so
 * the rail never reflows as images arrive.
 *
 * One manifest entry (gallery-01) is an .mp4, not a photo, so it renders as <video>
 * — muted, playsInline, looping, preload="metadata" so it costs a few KB until
 * someone actually presses play. No poster frame was captured, so none is set.
 */

import type { ResolvedClient } from '../../../schema/resolve';
import { SafeImage, SafeSection } from '../../../components/Safe';
import { altFor, withAlt } from '../assets';
import { partitionMedia, photosFor } from '../../../lib/photos';

export function Gallery({ client }: { client: ResolvedClient }) {
  // Photographs come from the CLIENT, never from the template's default artwork:
  // the control's slides are Texas Tree Tops' real job photos and must not appear
  // on another client's page. A client with no photography gets no gallery.
  const { videos, stills } = partitionMedia(photosFor(client, 'removal'));
  const clientVideo = videos[0] ?? null;
  if (stills.length === 0 && !clientVideo) return null;

  return (
    <SafeSection when={stills.length > 0 || clientVideo}>
      <section className="ra-gallery">
        <ul className="ra-rail">
          {clientVideo && (
            <li className="ra-rail-item ra-rail-item--video">
              <video
                className="ra-rail-video"
                // #t=0.1 is a media fragment, not a different file: with
                // preload="metadata" and no captured poster frame, it is what makes
                // the browser paint the first frame instead of an empty box.
                src={`${clientVideo.src}#t=0.1`}
                {...(clientVideo.width != null ? { width: clientVideo.width } : {})}
                {...(clientVideo.height != null ? { height: clientVideo.height } : {})}
                controls
                muted
                loop
                playsInline
                preload="metadata"
              />
            </li>
          )}

          {stills.map((shot, i) => (
            <li className="ra-rail-item" key={shot?.src ?? i}>
              <SafeImage
                photo={shot?.alt ? shot : withAlt(shot, altFor(client.name, i + 1))}
                className="ra-rail-img"
              />
            </li>
          ))}
        </ul>
      </section>
    </SafeSection>
  );
}
