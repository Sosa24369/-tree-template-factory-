/**
 * S11 — the FAQ. "Top 10 Frequently Asked Question About Tree Trimming", singular,
 * and there really are ten pairs.
 *
 * Native <details>/<summary>: it opens without JavaScript, it is keyboard-operable
 * and announced correctly for free, and it costs no accordion library. The source's
 * indicator was a hot-linked 30x25 SVG repeated on all ten rows; here it is two CSS
 * bars that cross into a minus when the row opens, so it inherits the brand colour
 * and costs nothing.
 *
 * Two source defects ride through untouched: faq.q8 begins with a space, and faq.a3
 * is a verbatim copy of faq.a2 that does not answer its own question.
 */

import { SafeText } from '../../../components/Safe';
import { Rule, Section, SplitHeading, type Copy } from './shared';

export function Faq({ copy }: { copy: Copy }) {
  const pairs: Array<{ q: string; a: string }> = [];
  for (let n = 1; n <= 10; n += 1) {
    const q = copy(`faq.q${n}`);
    const a = copy(`faq.a${n}`);
    if (q.trim() || a.trim()) pairs.push({ q, a });
  }

  return (
    <Section tone="paper" className="ta-faq">
      <div className="ta-head">
        <Rule />
        <SplitHeading as="h2" className="ta-h2" parts={[copy('faq.h1a'), copy('faq.h1b'), copy('faq.h1c')]} />
      </div>

      {pairs.length > 0 && (
        <div className="ta-faq-list">
          {pairs.map((pair, i) => (
            <details className="ta-faq-item" key={i}>
              <summary className="ta-faq-q">
                <span className="ta-faq-q-text">{pair.q}</span>
                <span className="ta-faq-mark" aria-hidden="true" />
              </summary>
              <SafeText as="p" className="ta-faq-a" value={pair.a} />
            </details>
          ))}
        </div>
      )}
    </Section>
  );
}
