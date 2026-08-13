/**
 * S5 — "Why … Homeowners / Choose … for Tree Trimming", the service-area sentence,
 * the five Google reviews, then a call CTA.
 *
 * The heading's two parts are two separate <h1> elements in the source with no gap
 * between them, so they only make sense as separate lines — hence `stacked`.
 *
 * REVIEW CONTENT IS CLIENT DATA (client.reviews[]), never copy. It is five real
 * customers' words, including one review that reads "they high quality equipment";
 * that stays as written because rewriting a customer's review is not a copy edit.
 * A client with no reviews gets no review rail and no orphan heading (R5).
 *
 * The source's per-review star strip and Google glyph were two hot-linked images per
 * card, ten requests for two distinct files. The stars are drawn from the same
 * ratingBadge.stars string the hero badge uses, and the wordmark from
 * ratingBadge.logoText, so the cards cost nothing and stay on brand.
 */

import type { ResolvedClient } from '../../../schema/resolve';
import { SafeText } from '../../../components/Safe';
import { CallRow, Rule, Section, SplitHeading, type Copy } from './shared';

export function WhyChoose({ client, copy }: { client: ResolvedClient; copy: Copy }) {
  return (
    <Section tone="deep" className="ta-why">
      <div className="ta-why-head">
        <Rule />
        <SplitHeading as="h2" className="ta-h2" parts={[copy('why.h1a'), copy('why.h1b')]} stacked accent={1} />
        <SafeText as="p" className="ta-why-body" value={copy('why.body')} />
      </div>

      {/* CANONICAL STRUCTURE (2026-08-12): the reviews slider moved to
          position 2, directly under the hero (see index.tsx). This section
          keeps its heading, service-area prose and call CTA. */}
      <CallRow client={client} copy={copy} placement="reviews" tone="onDeep" />
    </Section>
  );
}
