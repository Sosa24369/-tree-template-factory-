/**
 * S10 — six questions.
 *
 * removal-a runs ten, weighted towards SEO coverage. This runs six, every one of
 * them a real objection a homeowner raises on the phone: how fast, how much, is it
 * safe next to my house, are you insured, does the stump go, what is left in the
 * yard. Fewer questions is a position, not a shortcut — a proof-led page loses if
 * the reader stops reading before the offer.
 *
 * Native <details>/<summary>: opens without JavaScript, keyboard-operable and
 * announced correctly for free, and costs no accordion library. The indicator is an
 * inline plus that becomes a minus with [open] in CSS.
 */

import { SafeText } from '../../../components/Safe';
import { Eyebrow, Heading, PlusIcon, Section, type Copy } from './shared';

const COUNT = 6;

export function Faq({ copy }: { copy: Copy }) {
  const pairs: Array<{ q: string; a: string }> = [];
  for (let n = 1; n <= COUNT; n += 1) {
    const q = copy(`faq.q${n}`);
    const a = copy(`faq.a${n}`);
    if (q.trim() || a.trim()) pairs.push({ q, a });
  }

  if (pairs.length === 0) return null;

  return (
    <Section tone="paper" className="rb-faq">
      <div className="rb-head rb-rise">
        <Eyebrow>{copy('faq.eyebrow')}</Eyebrow>
        <Heading as="h2" className="rb-h2" parts={[copy('faq.h2a'), copy('faq.h2b')]} />
      </div>

      <div className="rb-faq-list rb-rise">
        {pairs.map((pair, i) =>
          pair.q.trim() ? (
            <details className="rb-faq-item" key={i}>
              <summary className="rb-faq-q">
                <span>{pair.q}</span>
                <PlusIcon />
              </summary>
              <SafeText as="p" className="rb-faq-a" value={pair.a} />
            </details>
          ) : (
            // R5: a surviving answer with no question renders as plain text, never
            // as a focusable <summary> with no accessible name.
            <div className="rb-faq-item rb-faq-item--orphan" key={i}>
              <SafeText as="p" className="rb-faq-a" value={pair.a} />
            </div>
          )
        )}
      </div>
    </Section>
  );
}
