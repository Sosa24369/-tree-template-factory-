/**
 * FAQ — eight question/answer slots.
 *
 * Native <details>/<summary>: it opens with no JavaScript, it is keyboard
 * operable and announced correctly for free, and it costs no accordion library.
 * The indicator is an inline chevron that inherits currentColor, so it follows
 * the brand instead of shipping a second request for a small SVG.
 *
 * A pair renders when EITHER half is filled, so an operator mid-way through
 * writing sees their question appear rather than losing it. The section — its
 * heading included — disappears when all eight pairs are blank (R5).
 */

import { SafeText } from '../../../components/Safe';
import { ChevronIcon, Section, SectionHead } from './shared';
import { hasText, type Copy } from '../text';

const PAIRS = 8;

export function Faq({ copy }: { copy: Copy }) {
  const pairs: Array<{ q: string; a: string }> = [];
  for (let n = 1; n <= PAIRS; n += 1) {
    const q = copy(`faq.q${n}`);
    const a = copy(`faq.a${n}`);
    if (hasText(q) || hasText(a)) pairs.push({ q, a });
  }

  if (pairs.length === 0) return null;

  return (
    <Section tone="paper" className="ag-faq">
      <SectionHead eyebrow={copy('faq.eyebrow')} heading={copy('faq.h2')} align="center" />

      <div className="ag-faq-list">
        {pairs.map((pair, i) => (
          <details className="ag-faq-item" key={i}>
            <summary className="ag-faq-q">
              {/* A question that is blank while its answer is filled still needs
                  a usable target, so the summary always carries a row. */}
              <span className="ag-faq-q-text">{pair.q}</span>
              <ChevronIcon />
            </summary>
            <SafeText as="p" className="ag-faq-a" value={pair.a} />
          </details>
        ))}
      </div>
    </Section>
  );
}
