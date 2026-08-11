/**
 * Reviews — the client's own quotations.
 *
 * Content is client data (client.reviews[]), never copy. A client with no
 * reviews gets no section, heading included, so there is never an orphan
 * "What our customers say" over an empty row (R5).
 *
 * NO STAR RATINGS. The schema carries an author, a meta line and a body, and no
 * score — so painting five stars on every card would be inventing a rating that
 * nobody supplied and that nothing can verify. The quotation carries itself.
 * The opening quote glyph is a CSS ::before, so the cards cost no requests.
 */

import type { ResolvedClient } from '../../../schema/resolve';
import { SafeText } from '../../../components/Safe';
import { Section, SectionHead } from './shared';
import { hasText, type Copy } from '../text';

export function Reviews({ client, copy }: { client: ResolvedClient; copy: Copy }) {
  const reviews = (client.reviews ?? []).filter((review) => hasText(review?.body) || hasText(review?.author));
  if (reviews.length === 0) return null;

  return (
    <Section tone="paper" className="ag-reviews">
      <SectionHead eyebrow={copy('reviews.eyebrow')} heading={copy('reviews.h2')} />

      <ul className="ag-review-grid" data-count={reviews.length}>
        {reviews.map((review, i) => (
          <li className="ag-review" key={i}>
            <SafeText as="blockquote" className="ag-review-body" value={review?.body} />
            <div className="ag-review-who">
              <SafeText as="span" className="ag-review-author" value={review?.author} />
              <SafeText as="span" className="ag-review-meta" value={review?.meta} />
            </div>
          </li>
        ))}
      </ul>
    </Section>
  );
}
