/**
 * Reviews — the client's own quotations.
 *
 * Content is client data (client.reviews[]), never copy. A client with no
 * reviews gets no section, heading included, so there is never an orphan
 * "What our customers say" over an empty row (R5).
 *
 * STAR RATINGS come only from review.rating — the schema now carries the star
 * count each reviewer actually gave (transcribed with the review). The shared
 * slider renders stars ONLY when that field is present, so this template's
 * original doctrine — never paint a rating nobody supplied — still holds.
 */

import type { ResolvedClient } from '../../../schema/resolve';
import { ReviewsSlider } from '../../../components/ReviewsSlider';
import { Section, SectionHead } from './shared';
import { hasText, type Copy } from '../text';

export function Reviews({ client, copy }: { client: ResolvedClient; copy: Copy }) {
  const reviews = (client.reviews ?? []).filter((review) => hasText(review?.body));
  if (reviews.length === 0) return null;

  return (
    <Section tone="paper" className="ag-reviews">
      <SectionHead eyebrow={copy('reviews.eyebrow')} heading={copy('reviews.h2')} />

      {/* Design Elevation 2026-08-12: static grid -> the shared slider,
          identical on every template. */}
      <ReviewsSlider client={client} />
    </Section>
  );
}
