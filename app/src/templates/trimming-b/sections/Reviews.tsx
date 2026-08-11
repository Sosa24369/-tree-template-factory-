/**
 * REVIEWS — everything the pull quote did not use, as a quiet ledger.
 *
 * The second half of the proof inversion. trimming-a puts five review cards in a row
 * mid-page, where they are scanned as a texture. Here one review was read in full,
 * early (Testimony), and these sit low on the page as corroboration: hairline rules,
 * no cards, no shadows, no star graphics, no Google glyph.
 *
 * Everything rendered is client data. No reviews on the record means no section, and
 * nothing is ever borrowed from another client (R5).
 */

import type { ResolvedClient } from '../../../schema/resolve';
import { SafeText } from '../../../components/Safe';
import { Eyebrow, Section, splitReviews, type Copy } from './shared';

export function Reviews({ client, copy }: { client: ResolvedClient; copy: Copy }) {
  const { rest } = splitReviews(client);
  if (rest.length === 0) return null;

  return (
    <Section tone="paper" className="tb-reviews">
      <div className="tb-head">
        <Eyebrow value={copy('reviews.eyebrow')} />
        {copy('reviews.h2').trim() && <h2 className="tb-display tb-display--sm">{copy('reviews.h2')}</h2>}
      </div>

      <ul className="tb-review-list">
        {rest.map((review, i) => (
          <li className="tb-review" key={i}>
            <SafeText as="p" className="tb-review-body" value={review?.body} />
            <p className="tb-review-who">
              <SafeText as="span" className="tb-review-author" value={review?.author} />
              <SafeText as="span" className="tb-review-meta" value={review?.meta} />
            </p>
          </li>
        ))}
      </ul>
    </Section>
  );
}
