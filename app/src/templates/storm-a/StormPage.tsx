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
import { SafeText } from '../../components/Safe';
import { Header } from './sections/Header';
import { Hero } from './sections/Hero';
import { EstimatePanel } from './sections/Estimate';
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
  variant: 'storm-a' | 'storm-b' | 'storm-c';
  brandStyle: CSSProperties;
}) {
  return (
    <div className={`storm ${variant}`} style={brandStyle}>
      <Header client={client} copy={copy} />

      <main>
        {/* CANONICAL STRUCTURE v2 (owner's directive, 2026-08-13 — supersedes
            v1): hero (form + call + brand lockup + bouncing call CTA) →
            trust/offer band → captioned reviews block → results caption over a
            symmetrical photo grid → what-we-handle blurb with a photo → the
            service-areas drift → process → remaining sections → footer.
            Copy untouched; sections moved; captions promoted from each
            section's own existing copy. */}

        {/* 1 — hero: brand lockup, emergency premise, 911 line, call + form */}
        <Hero client={client} copy={copy} formPanel={<EstimatePanel client={client} copy={copy} />} />

        {/* 2 — trust band, directly under the hero (storm's badges; the storm
            offer is the free assessment, already in the hero copy) */}
        <Trust copy={copy} />

        {/* 3 — reviews, ONE captioned block (plain descriptive header — storm
            has no trust-line copy and none gets invented). R5: no reviews,
            no block. */}
        {(client.reviews ?? []).some((r) => (r?.body ?? '').trim()) && (
          <section className="st-section st-section--tint st-reviews">
            <div className="st-container">
              <SafeText as="h2" className="st-h2 st-reviews-h" value={copy('reviews.h2')} />
              <ReviewsSlider client={client} />
            </div>
          </section>
        )}

        {/* 4 — results: the section's own heading captions ONE symmetrical
            grid of the client's storm shots (hides when none) */}
        <Work client={client} copy={copy} />

        {/* 5 — what we handle, two-column with a client photo on the right */}
        <Handle client={client} copy={copy} />

        {/* 6 — service areas, mid-page between the photo work and process */}
        <Areas client={client} copy={copy} />

        {/* 7 — how storm response works (captioned by its own heading) */}
        <Process copy={copy} />

        {/* 8 — the rest, in their existing relative order */}
        <Insurance copy={copy} />
        <Faq copy={copy} />
        <FinalCta client={client} copy={copy} />
      </main>

      <Footer client={client} copy={copy} />

      {/* Phones only — both conversion paths one tap away at every scroll position. */}
      <StickyBar client={client} copy={copy} />
    </div>
  );
}
