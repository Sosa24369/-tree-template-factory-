/**
 * StormPage — the section tree shared by BOTH storm variants.
 *
 * storm-a and storm-b are a copy + palette A/B of one page. Rather than duplicate
 * thirteen sections and risk them drifting apart, both variants render this one
 * component; the only things that differ are the `copy` resolver each passes (its own
 * copy.defaults + per-client overrides) and the `variant` class, which selects the
 * palette. Keeping the structure identical is what makes the test attributable: a
 * difference in booked jobs is a difference in message and colour, not in layout.
 *
 * Section ORDER follows the approved storm copy (docs/storm-copy-draft.md): the
 * emergency hero, then the assessment form HIGH on the page, then trust, what-we-
 * handle, process, recent work, insurance documentation, service area, FAQ and the
 * closing CTA. A mobile call bar rides along the bottom.
 */

import type { CSSProperties } from 'react';
import type { ResolvedClient } from '../../schema/resolve';
import type { Copy } from './sections/shared';

import { ReviewsSlider } from '../../components/ReviewsSlider';
import { Header } from './sections/Header';
import { Hero } from './sections/Hero';
import { Estimate } from './sections/Estimate';
import { Trust } from './sections/Trust';
import { Handle } from './sections/Handle';
import { Process } from './sections/Process';
import { Work } from './sections/Work';
import { Insurance } from './sections/Insurance';
import { Areas } from './sections/Areas';
import { Faq } from './sections/Faq';
import { FinalCta } from './sections/FinalCta';
import { Footer } from './sections/Footer';
import { StickyBar } from './sections/StickyBar';

export function StormPage({
  client,
  copy,
  variant,
  brandStyle,
}: {
  client: ResolvedClient;
  copy: Copy;
  variant: 'storm-a' | 'storm-b';
  brandStyle: CSSProperties;
}) {
  return (
    <div className={`storm ${variant}`} style={brandStyle}>
      <Header client={client} copy={copy} />

      <main>
        {/* 1 — emergency premise, 911 safety line, CTAs */}
        <Hero client={client} copy={copy} />
        {/* 2 — the assessment form, high on the page */}
        <Estimate client={client} copy={copy} />
        {/* 3 — four trust points */}
        <Trust copy={copy} />
        {/* 4 — Trees / Fences / Cleanup */}
        <Handle copy={copy} />
        {/* 5 — how storm response works */}
        <Process copy={copy} />
        {/* 6 — recent storm work (client photographs only; hides when none) */}
        <Work client={client} copy={copy} />
        {/* 6b — Google reviews (Design Elevation 2026-08-12). Storm shipped
            without a review block; the shared slider is added to BOTH variants
            through this one shared tree, so the pair stays identical by
            construction (the logo precedent). Deliberately heading-less: the
            slider is self-labelling ("reviews from Google") and inventing a
            storm-voice heading would be writing copy, which this session may
            not do. Renders nothing for a client with no reviews (R5). */}
        {(client.reviews ?? []).some((r) => (r?.body ?? '').trim()) && (
          <section className="st-section st-section--tint st-reviews">
            <div className="st-container">
              <ReviewsSlider client={client} />
            </div>
          </section>
        )}
        {/* 7 — documentation your insurer will ask for */}
        <Insurance copy={copy} />
        {/* 8 — service-area grid */}
        <Areas client={client} copy={copy} />
        {/* 9 — eight storm questions */}
        <Faq copy={copy} />
        {/* 10 — closing call band */}
        <FinalCta client={client} copy={copy} />
      </main>

      <Footer client={client} copy={copy} />

      {/* Phones only — both conversion paths one tap away at every scroll position. */}
      <StickyBar client={client} copy={copy} />
    </div>
  );
}
