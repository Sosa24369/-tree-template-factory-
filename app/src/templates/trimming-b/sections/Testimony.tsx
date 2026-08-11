/**
 * TESTIMONY — one review, given a whole screen, high on the page.
 *
 * PROOF ORDERING IS THE OTHER HALF OF THE TEST. trimming-a stacks five review cards
 * in a row mid-page. This side splits them: the single strongest review is set as a
 * full-width pull quote right after the standard, where it lands as a person
 * agreeing with the claim just made, and the remainder are demoted to a quiet ledger
 * near the bottom (see Reviews.tsx). Five cards in a grid are scanned as a texture;
 * one quotation at this size is read.
 *
 * The quotation, the name and the meta line are all client data — a client with no
 * reviews gets no section, never a placeholder quotation and never someone else's
 * (R5).
 */

import type { ResolvedClient } from '../../../schema/resolve';
import { SafeText } from '../../../components/Safe';
import { Eyebrow, Section, splitReviews, type Copy } from './shared';

export function Testimony({ client, copy }: { client: ResolvedClient; copy: Copy }) {
  // splitReviews is the single source of the featured/rest division, so this
  // quotation can never also turn up in the ledger at the bottom of the page.
  const { featured: review } = splitReviews(client);
  if (!review) return null;

  return (
    <Section tone="tint" className="tb-testimony">
      <figure className="tb-quote">
        <Eyebrow value={copy('testimony.eyebrow')} />

        <blockquote className="tb-quote-body">
          <SafeText as="p" value={review.body} />
        </blockquote>

        <figcaption className="tb-quote-who">
          <SafeText as="span" className="tb-quote-author" value={review.author} />
          <SafeText as="span" className="tb-quote-meta" value={review.meta} />
        </figcaption>
      </figure>
    </Section>
  );
}
