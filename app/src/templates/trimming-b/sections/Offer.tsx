/**
 * THE OFFER — the same money as trimming-a, stated once, late, without a countdown.
 *
 * OFFER PLACEMENT IS THE INDEPENDENT VARIABLE OF THIS TEST. trimming-a leads with
 * "10% off" in the hero and pairs it with same-week availability, so the discount is
 * the reason to act and the timer is the pressure. Here the reader arrives at the
 * discount having already been told exactly how the crew cuts and what it refuses to
 * do, so it reads as the last piece of a decision rather than the first.
 *
 * All three terms are the real offer:
 *   10% off the trimming work · roof and gutter branch clearance included in the job
 *   rather than billed separately · multiple trees priced as one bundle.
 * Nothing is inflated and nothing expires on a date this file would have to keep in
 * sync with reality — "this season" is honest at launch and honest in ten weeks.
 *
 * The section is a definition list because that is what it is: three terms and what
 * each one means.
 */

import { SafeText } from '../../../components/Safe';
import { Display, Eyebrow, Section, type Copy } from './shared';

export function Offer({ copy }: { copy: Copy }) {
  const terms = [1, 2, 3]
    .map((n) => ({ h: copy(`offer.term${n}.h`), body: copy(`offer.term${n}.body`) }))
    .filter((term) => term.h.trim() || term.body.trim());

  const heading = `${copy('offer.h2a')}${copy('offer.h2b')}`.trim();
  if (!heading && terms.length === 0) return null;

  return (
    <Section tone="tint" className="tb-offer">
      <div className="tb-offer-grid">
        <div className="tb-head tb-head--flush">
          <Eyebrow value={copy('offer.eyebrow')} />
          <Display lines={[copy('offer.h2a'), copy('offer.h2b')]} />
          <SafeText as="p" className="tb-body" value={copy('offer.body')} />
        </div>

        {terms.length > 0 && (
          <dl className="tb-terms">
            {terms.map((term, i) => (
              <div className="tb-term" key={i}>
                <SafeText as="dt" className="tb-term-h" value={term.h} />
                <SafeText as="dd" className="tb-term-body" value={term.body} />
              </div>
            ))}
          </dl>
        )}
      </div>

      <SafeText as="p" className="tb-note tb-measure" value={copy('offer.note')} />
    </Section>
  );
}
