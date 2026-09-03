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
import { renderSections } from '../../lib/renderSections';
import { brandAttrs } from '../../lib/brandAttrs';

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
    <div className={`storm ${variant}`} style={brandStyle} {...brandAttrs(client)}>
      <Header client={client} copy={copy} />

      <main>

        {renderSections(client, 'storm-a', {
          hero: () => <Hero client={client} copy={copy} formPanel={<EstimatePanel client={client} copy={copy} />} />,
          trust: () => <Trust copy={copy} />,
          reviews: () => (
            (client.reviews ?? []).some((r) => (r?.body ?? '').trim()) && (
              <section className="st-section st-section--tint st-reviews">
                <div className="st-container">
                  <SafeText as="h2" className="st-h2 st-reviews-h" value={copy('reviews.h2')} />
                  <ReviewsSlider client={client} />
                </div>
              </section>
            )
          ),
          work: () => <Work client={client} copy={copy} />,
          handle: () => <Handle client={client} copy={copy} />,
          areas: () => <Areas client={client} copy={copy} />,
          process: () => <Process copy={copy} />,
          insurance: () => <Insurance copy={copy} />,
          faq: () => <Faq copy={copy} />,
          'final-cta': () => <FinalCta client={client} copy={copy} />,

        })}
      </main>

      <Footer client={client} copy={copy} />

      {/* Phones only — both conversion paths one tap away at every scroll position. */}
      <StickyBar client={client} copy={copy} />
    </div>
  );
}
