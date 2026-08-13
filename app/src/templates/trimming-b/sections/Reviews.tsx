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
import { ReviewsSlider } from '../../../components/ReviewsSlider';
import { Eyebrow, Section, type Copy } from './shared';

export function Reviews({ client, copy }: { client: ResolvedClient; copy: Copy }) {
  const usable = (client.reviews ?? []).filter((r) => typeof r?.body === 'string' && r.body.trim());
  if (usable.length === 0) return null;

  return (
    <Section tone="paper" className="tb-reviews">
      <div className="tb-head">
        <Eyebrow value={copy('reviews.eyebrow')} />
        {copy('reviews.h2').trim() && <h2 className="tb-display tb-display--sm">{copy('reviews.h2')}</h2>}
      </div>

      {/* Design Elevation 2026-08-12: the quiet ledger -> the shared slider,
          identical on every template, showing ALL reviews. The Testimony pull
          quote stays untouched above — the proof-ordering variable this variant
          tests is WHERE the featured quote sits, and it still sits there. */}
      <ReviewsSlider client={client} />
    </Section>
  );
}
