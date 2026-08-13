/**
 * ReviewsSlider — the ONE review treatment every template renders
 * (Design Elevation 2026-08-12, Task 3).
 *
 * Applied identically across controls, variants and hybrids: an identical
 * change on both sides of a pair preserves the A/B — the logo-enlargement
 * precedent. Templates wrap it in their own section (background, heading,
 * spacing); everything inside the slider is shared and byte-identical.
 *
 * - Content is client data (client.reviews[]), transcribed VERBATIM from the
 *   client's own Google Business Profile — client.reviewsSource is the audit
 *   trail. R5: a client with no reviews renders nothing at all.
 * - CSS scroll-snap does the sliding. The track is a native scroller, so the
 *   slider is fully functional in the prerendered HTML before any JS arrives;
 *   the arrow buttons are an enhancement layered on top after hydration.
 *   The track is keyboard-focusable and native arrow-key scrolling applies.
 * - Stars render ONLY from review.rating. A review without a rating gets no
 *   star row — painting five stars nobody supplied would be fabricating a
 *   rating (the agnostic template's long-standing doctrine, now schema-wide).
 * - Zero CLS: every card is the same fixed height and the body is line-clamped,
 *   so the scroller's height is known before content, fonts, or JS arrive.
 * - No avatar images (Google 403s them — settled), no autoplay, no library.
 */

import { useEffect, useRef, useState } from 'react';
import type { ResolvedClient } from '../schema/resolve';
import '../styles/reviews-slider.css';

/** Google's four-colour "G", inline — the attribution mark, zero requests. */
function GoogleG() {
  return (
    <svg className="rvs-g" viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" focusable="false">
      <path fill="#4285F4" d="M23.5 12.27c0-.85-.08-1.66-.22-2.45H12v4.64h6.45a5.52 5.52 0 0 1-2.39 3.62v3h3.87c2.26-2.09 3.57-5.16 3.57-8.81Z" />
      <path fill="#34A853" d="M12 24c3.24 0 5.96-1.07 7.93-2.91l-3.87-3c-1.07.72-2.44 1.14-4.06 1.14-3.12 0-5.77-2.11-6.71-4.95H1.29v3.1A12 12 0 0 0 12 24Z" />
      <path fill="#FBBC04" d="M5.29 14.28A7.2 7.2 0 0 1 4.91 12c0-.79.14-1.56.38-2.28v-3.1H1.29a12 12 0 0 0 0 10.76l4-3.1Z" />
      <path fill="#EA4335" d="M12 4.77c1.76 0 3.34.61 4.58 1.8l3.44-3.44A11.96 11.96 0 0 0 12 0 12 12 0 0 0 1.29 6.62l4 3.1C6.23 6.88 8.88 4.77 12 4.77Z" />
    </svg>
  );
}

function ArrowIcon({ flip }: { flip?: boolean }) {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" focusable="false" style={flip ? { transform: 'scaleX(-1)' } : undefined}>
      <path d="M9 5l7 7-7 7" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function ReviewsSlider({ client }: { client: ResolvedClient }) {
  const reviews = (client.reviews ?? []).filter((r) => typeof r?.body === 'string' && r.body.trim());
  const trackRef = useRef<HTMLUListElement | null>(null);
  // Premium Reorder v2: slow auto-advance (~7s/card), paused while the visitor
  // hovers, touches, or focuses the slider. Hydration-only (the prerendered
  // slider is a plain scroller until JS lands) and disabled entirely under
  // prefers-reduced-motion. Scrolling never changes the track's height: CLS 0.
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (reviews.length < 2) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const id = window.setInterval(() => {
      if (paused) return;
      // Hidden tabs suspend rAF (smooth scrolling does nothing there) — skip
      // the tick rather than queue jumps for when the tab comes back.
      if (document.visibilityState === 'hidden') return;
      const track = trackRef.current;
      if (!track) return;
      const card = track.querySelector<HTMLElement>('.rvs-card');
      const step = card ? card.offsetWidth + 16 : track.clientWidth;
      const atEnd = track.scrollLeft + track.clientWidth >= track.scrollWidth - step / 2;
      if (atEnd) track.scrollTo({ left: 0, behavior: 'smooth' });
      else track.scrollBy({ left: step, behavior: 'smooth' });
    }, 7000);
    return () => window.clearInterval(id);
  }, [paused, reviews.length]);

  if (reviews.length === 0) return null;

  const nudge = (dir: -1 | 1) => {
    const track = trackRef.current;
    if (!track) return;
    const card = track.querySelector<HTMLElement>('.rvs-card');
    const step = card ? card.offsetWidth + 16 : track.clientWidth;
    track.scrollBy({ left: dir * step, behavior: 'smooth' });
  };

  return (
    <div
      className="rvs"
      role="group"
      aria-roledescription="carousel"
      aria-label="Customer reviews from Google"
      onPointerEnter={() => setPaused(true)}
      onPointerLeave={() => setPaused(false)}
      onTouchStart={() => setPaused(true)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      {/* eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex -- the
          scroller itself is the keyboard-operable control: focus it and the
          browser's native arrow-key scrolling pages through the cards. */}
      <ul className="rvs-track" ref={trackRef} tabIndex={0}>
        {reviews.map((review, i) => (
          <li className="rvs-card" key={i} aria-label={`Review ${i + 1} of ${reviews.length}`}>
            {typeof review.rating === 'number' && review.rating > 0 && (
              <span className="rvs-stars" role="img" aria-label={`Rated ${review.rating} out of 5 stars`}>
                {'★★★★★'.slice(0, Math.max(1, Math.min(5, Math.round(review.rating))))}
              </span>
            )}
            <p className="rvs-body">{review.body}</p>
            <span className="rvs-who">
              <span className="rvs-author">{review.author}</span>
              <span className="rvs-source">
                <GoogleG />
                Google
              </span>
            </span>
          </li>
        ))}
      </ul>

      {reviews.length > 1 && (
        <div className="rvs-nav" aria-hidden={false}>
          <button type="button" className="rvs-btn" aria-label="Previous review" onClick={() => nudge(-1)}>
            <ArrowIcon flip />
          </button>
          <button type="button" className="rvs-btn" aria-label="Next review" onClick={() => nudge(1)}>
            <ArrowIcon />
          </button>
        </div>
      )}
    </div>
  );
}

export default ReviewsSlider;
