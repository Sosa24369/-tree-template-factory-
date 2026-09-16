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
  // R5 — the client's own Google reviews listing, straight under the reviews (as on
  // trimming-a). The URL is client data (reviewsSource.profileUrl); with no URL, or
  // anything but https, there is no button rather than an invented one.
  const profileUrl = client.reviewsSource?.profileUrl;
  const reviewsUrl = typeof profileUrl === 'string' && /^https:\/\//.test(profileUrl) ? profileUrl : null;

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

      {/* Premium Reorder v2 (2026-08-13): the section's own trust line — the
          "Why … Homeowners Choose …" heading and prose above — is the CAPTION
          of the reviews; heading, prose, slider and CTA are ONE block. */}
      <ReviewsSlider client={client} />
      {reviewsUrl && (
        <a className="ra-reviews-link" href={reviewsUrl} target="_blank" rel="noopener noreferrer">
          {copy('why.reviewsLink')}
          <span aria-hidden="true"> →</span>
        </a>
      )}

      <div className="ra-cta-row">
        <CallCta client={client} copy={copy} placement="reviews" tone="solid" />
      </div>
    </Section>
  );
}
