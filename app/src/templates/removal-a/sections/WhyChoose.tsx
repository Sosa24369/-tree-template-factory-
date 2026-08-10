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
import { SafeImage, SafeSection, SafeText } from '../../../components/Safe';
import { reviewGoogle, reviewStars, withAlt } from '../assets';
import { CallCta, Section, SplitHeading, type Copy } from './shared';

export function WhyChoose({ client, copy }: { client: ResolvedClient; copy: Copy }) {
  const reviews = client.reviews ?? [];

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

      <SafeSection when={reviews}>
        <ul className="ra-reviews">
          {reviews.map((review, i) => (
            <li className="ra-review" key={i}>
              <div className="ra-review-top">
                <SafeImage photo={withAlt(reviewStars, copy('reviews.altStars'))} className="ra-review-stars" />
                <SafeImage photo={withAlt(reviewGoogle, copy('reviews.altGoogle'))} className="ra-review-google" />
              </div>
              <SafeText as="p" className="ra-review-body" value={review?.body} />
              <div className="ra-review-who">
                <SafeText as="span" className="ra-review-author" value={review?.author} />
                <SafeText as="span" className="ra-review-meta" value={review?.meta} />
              </div>
            </li>
          ))}
        </ul>
      </SafeSection>

      <div className="ra-cta-row">
        <CallCta client={client} copy={copy} placement="reviews" tone="solid" />
      </div>
    </Section>
  );
}
