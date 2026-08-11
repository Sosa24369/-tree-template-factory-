/**
 * FAQ — eight storm questions.
 *
 * Native <details>/<summary>: opens with no JavaScript, keyboard-operable and
 * announced correctly for free, and costs no accordion library. The indicator is an
 * inline plus that becomes a minus on [open] via CSS.
 *
 * R5: a pair is collected when EITHER half is filled, so an operator mid-edit sees
 * their work appear. But a blank question with a surviving answer renders as a plain
 * paragraph — NEVER an empty <summary>, which would be a focusable control with no
 * accessible name. The whole section disappears when all eight pairs are blank.
 */

import { SafeText } from '../../../components/Safe';
import { Eyebrow, Heading, PlusIcon, Section, type Copy } from './shared';

const PAIRS = 8;

export function Faq({ copy }: { copy: Copy }) {
  const pairs: Array<{ q: string; a: string }> = [];
  for (let n = 1; n <= PAIRS; n += 1) {
    const q = copy(`faq.q${n}`);
    const a = copy(`faq.a${n}`);
    if (q.trim() || a.trim()) pairs.push({ q, a });
  }

  if (pairs.length === 0) return null;

  return (
    <Section tone="paper" className="st-faq">
      <div className="st-head">
        <Eyebrow>{copy('faq.eyebrow')}</Eyebrow>
        <Heading as="h2" className="st-h2" parts={[copy('faq.h2a'), copy('faq.h2b')]} />
      </div>

      <div className="st-faq-list">
        {pairs.map((pair, i) =>
          pair.q.trim() ? (
            <details className="st-faq-item" key={i}>
              <summary className="st-faq-q">
                <span>{pair.q}</span>
                <PlusIcon />
              </summary>
              <SafeText as="p" className="st-faq-a" value={pair.a} />
            </details>
          ) : (
            // R5: a surviving answer with no question renders as plain text, never as
            // a focusable <summary> with no accessible name.
            <div className="st-faq-item st-faq-item--orphan" key={i}>
              <SafeText as="p" className="st-faq-a" value={pair.a} />
            </div>
          )
        )}
      </div>
    </Section>
  );
}
