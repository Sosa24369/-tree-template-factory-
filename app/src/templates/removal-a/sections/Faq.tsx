/**
 * S11 — the 10-pair FAQ.
 *
 * Native <details>/<summary>: it opens without JavaScript, it is keyboard-operable
 * and announced correctly for free, and it costs no accordion library. The source's
 * indicator glyph is replaced by an inline chevron that inherits currentColor, so it
 * follows the brand instead of shipping a second request for a 146-byte SVG.
 */

import { SafeText } from '../../../components/Safe';
import { ChevronIcon, Section, SplitHeading, type Copy } from './shared';

export function Faq({ copy }: { copy: Copy }) {
  const pairs: Array<{ q: string; a: string }> = [];
  for (let n = 1; n <= 10; n += 1) {
    const q = copy(`faq.q${n}`);
    const a = copy(`faq.a${n}`);
    if (q.trim() || a.trim()) pairs.push({ q, a });
  }

  return (
    <Section tone="light" className="ra-faq">
      <div className="ra-measure ra-measure--center">
        <SplitHeading as="h2" className="ra-h2" parts={[copy('faq.h1a'), copy('faq.h1b'), copy('faq.h1c')]} />
      </div>

      {pairs.length > 0 && (
        <div className="ra-faq-list">
          {pairs.map((pair, i) =>
            pair.q.trim() ? (
              <details className="ra-faq-item" key={i}>
                <summary className="ra-faq-q">
                  <span>{pair.q}</span>
                  <ChevronIcon />
                </summary>
                <SafeText as="p" className="ra-faq-a" value={pair.a} />
              </details>
            ) : (
              // R5: a surviving answer with no question renders as plain text, never
              // as a focusable <summary> with no accessible name.
              <div className="ra-faq-item ra-faq-item--orphan" key={i}>
                <SafeText as="p" className="ra-faq-a" value={pair.a} />
              </div>
            )
          )}
        </div>
      )}
    </Section>
  );
}
