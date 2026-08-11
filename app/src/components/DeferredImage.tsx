/**
 * Below-the-fold imagery that genuinely does not download until it is approached.
 *
 * `loading="lazy"` is not enough: on a throttled connection Chrome widens its lazy
 * threshold and fetches nearly everything anyway. Measured on removal-a with applied
 * throttling — 30 images, ~1MB, and the LCP hero image spent 3.2s downloading purely
 * because it was sharing the pipe with all of them.
 *
 * So these images are not in the markup at all until an IntersectionObserver says
 * they are near. The wrapper reserves the exact box from the measured intrinsic
 * dimensions, so nothing shifts when the real image arrives — CLS stays 0.
 *
 * Degrades honestly: no IntersectionObserver (or no JS, e.g. the prerendered HTML
 * before hydration) means the <noscript> copy renders and the image simply loads.
 */

import { useEffect, useRef, useState } from 'react';
import type { PhotoSet } from '../schema/client';

interface Props {
  photo: PhotoSet | null | undefined;
  className?: string;
  wrapperClassName?: string;
  sizes?: string;
  /** How far ahead of the viewport to start loading. */
  rootMargin?: string;
}

export function DeferredImage({
  photo,
  className,
  wrapperClassName,
  sizes = '(max-width: 767px) 45vw, 22vw',
  rootMargin = '300px',
}: Props) {
  const ref = useRef<HTMLSpanElement | null>(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (show) return;
    const node = ref.current;
    if (!node) return;
    if (typeof IntersectionObserver === 'undefined') {
      setShow(true); // no observer support — just load it
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setShow(true);
          io.disconnect();
        }
      },
      { rootMargin }
    );
    io.observe(node);
    return () => io.disconnect();
  }, [show, rootMargin]);

  if (!photo?.src) return null;

  // Reserve the box from the measured dimensions so the swap-in shifts nothing.
  const ratio = photo.width && photo.height ? `${photo.width} / ${photo.height}` : undefined;

  return (
    <span
      ref={ref}
      className={wrapperClassName}
      style={{ display: 'block', aspectRatio: ratio, backgroundColor: 'var(--ra-placeholder, #e9edf0)' }}
    >
      {show && (
        <img
          src={photo.src}
          {...(photo.srcset ? { srcSet: photo.srcset, sizes } : {})}
          alt={photo.alt ?? ''}
          className={className}
          decoding="async"
          {...(photo.width != null ? { width: photo.width } : {})}
          {...(photo.height != null ? { height: photo.height } : {})}
        />
      )}
      <noscript>
        <img src={photo.src} alt={photo.alt ?? ''} className={className} loading="lazy" />
      </noscript>
    </span>
  );
}
