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
        {/* CANONICAL STRUCTURE (owner's directive, 2026-08-12) — hero carries
            the H1 block AND the assessment form AND the call CTA; then the
            slider; then photo band 1; then process; then photo band 2; then
            this page's remaining sections in their existing relative order;
            then the service-areas carousel; then the footer. Copy untouched. */}

        {/* 1 — hero: emergency premise, 911 line, call CTA + the form panel */}
        <Hero client={client} copy={copy} formPanel={<EstimatePanel client={client} copy={copy} />} />

        {/* 2 — Google reviews slider (heading-less: no storm review-heading
            copy exists and none gets written). Nothing renders without
            reviews on the record (R5). */}
        {(client.reviews ?? []).some((r) => (r?.body ?? '').trim()) && (
          <section className="st-section st-section--tint st-reviews">
            <div className="st-container">
              <ReviewsSlider client={client} />
            </div>
          </section>
        )}

        {/* 3 — photo band 1: the client's own storm shots + the section's
            heading copy (hides entirely when the client has none) */}
        <Work client={client} copy={copy} band={1} />

        {/* 4 — how storm response works */}
        <Process copy={copy} />

        {/* 5 — photo band 2: the rest of the set, heading-less */}
        <Work client={client} copy={copy} band={2} />

        {/* 6 — the rest, in their existing relative order */}
        <Trust copy={copy} />
        <Handle copy={copy} />
        <Insurance copy={copy} />
        <Faq copy={copy} />
        <FinalCta client={client} copy={copy} />

        {/* 7 — service-areas carousel, last before the footer */}
        <Areas client={client} copy={copy} />
      </main>

      <Footer client={client} copy={copy} />

      {/* Phones only — both conversion paths one tap away at every scroll position. */}
      <StickyBar client={client} copy={copy} />
    </div>
  );
}
