/**
 * S4 — "Why … Homeowners Choose …", the prose service-area paragraph, the Google
 * review cards, then a call CTA. Painted over the section's background plate.
 *
 * The heading's two parts carry NO gap between them in the source, so they must be
 * separate lines — hence `stacked`.
 *
 * Review CONTENT is client data (client.reviews[]), never copy: a client with no
 * reviews simply has no review row, with no orphan heading left behind (R5).
 */

import type { ResolvedClient } from '../../../schema/resolve';
import { SafeText } from '../../../components/Safe';
import { ReviewsSlider } from '../../../components/ReviewsSlider';
import { CallCta, Section, SplitHeading, type Copy } from './shared';

export function WhyChoose({ client, copy }: { client: ResolvedClient; copy: Copy }) {
  return (
    <Section tone="plate" className="ra-why">
      <div className="ra-measure">
        <SplitHeading
          as="h2"
          className="ra-h2"
          parts={[copy('why.h1a'), copy('why.h1b')]}
          stacked
        />
        <SafeText as="p" className="ra-body ra-lede" value={copy('why.body')} />
      </div>

      {/* Design Elevation 2026-08-12: static review cards -> the shared slider,
          identical on every template (the logo precedent preserves the A/B).
          Renders nothing for a client with no reviews (R5). */}
      <ReviewsSlider client={client} />

      <div className="ra-cta-row">
        <CallCta client={client} copy={copy} placement="reviews" tone="solid" />
      </div>
    </Section>
  );
}
