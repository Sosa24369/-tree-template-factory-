/**
 * FAQ — six questions, answered at length.
 *
 * Native <details>/<summary>: it opens with no JavaScript, it is keyboard-operable
 * and announced correctly for free, and it costs no accordion library. The indicator
 * is an inline plus that rotates into a minus on [open] and inherits currentColor,
 * so it follows the brand with zero requests.
 *
 * The first item is open by default. On a page whose form is at the very bottom,
 * a closed wall of six summaries reads as a wall; one open answer shows the reader
 * what the rest of them contain.
 *
 * Pairs are collected defensively: a client override that blanks a question simply
 * yields fewer items, and blanking all of them leaves the heading with no empty list
 * underneath it (R5).
 */

import { SafeText } from '../../../components/Safe';
import { Display, PlusIcon, Section, type Copy } from './shared';

export function Faq({ copy }: { copy: Copy }) {
  const pairs: Array<{ q: string; a: string }> = [];
  for (let n = 1; n <= 6; n += 1) {
    const q = copy(`faq.q${n}`);
    const a = copy(`faq.a${n}`);
    if (q.trim() || a.trim()) pairs.push({ q, a });
  }

  const heading = `${copy('faq.h2a')}${copy('faq.h2b')}`.trim();
  if (!heading && pairs.length === 0) return null;

  return (
    <Section tone="paper" className="tb-faq">
      <div className="tb-faq-grid">
        <div className="tb-head tb-head--flush">
          <Display lines={[copy('faq.h2a'), copy('faq.h2b')]} className="tb-display--sm" />
        </div>

        {pairs.length > 0 && (
          <div className="tb-faq-list">
            {pairs.map((pair, i) =>
              pair.q.trim() ? (
                <details className="tb-faq-item" key={i} open={i === 0}>
                  <summary className="tb-faq-q">
                    <span>{pair.q}</span>
                    <PlusIcon />
                  </summary>
                  <SafeText as="p" className="tb-faq-a" value={pair.a} />
                </details>
              ) : (
                // R5: a surviving answer with no question renders as plain text, never
                // as a focusable <summary> with no accessible name.
                <div className="tb-faq-item tb-faq-item--orphan" key={i}>
                  <SafeText as="p" className="tb-faq-a" value={pair.a} />
                </div>
              )
            )}
          </div>
        )}
      </div>
    </Section>
  );
}
