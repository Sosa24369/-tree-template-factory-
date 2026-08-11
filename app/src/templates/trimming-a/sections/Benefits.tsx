/**
 * S4 — the four benefit cards, then the first big call CTA.
 *
 * The source renders that CTA twice: a desktop column dialling (214) 985-7697 and a
 * mobile column dialling (469) 402-1196, same sub-text, different number. One CTA is
 * rendered here through <PhoneLink/>, so there is exactly one number and one href on
 * the page whatever the width.
 *
 * Card 1 ends mid-parenthesis — "(Multi-Tree Bundle Pricing" — and card 3 is
 * followed by an empty <p> in the source. Both are the control. The parenthesis is
 * copy and ships; the empty paragraph contributed nothing and is simply not built.
 */

import type { ResolvedClient } from '../../../schema/resolve';
import { SafeText } from '../../../components/Safe';
import { CallRow, CheckIcon, Rule, Section, type Copy } from './shared';

const CARDS = [1, 2, 3, 4];

export function Benefits({ client, copy }: { client: ResolvedClient; copy: Copy }) {
  const items = CARDS.map((n) => copy(`benefits.item${n}`)).filter((text) => text.trim());

  return (
    <Section tone="paper" className="ta-benefits">
      {items.length > 0 && (
        <ul className="ta-benefit-grid">
          {items.map((text, i) => (
            <li className="ta-benefit" key={i}>
              <span className="ta-benefit-mark" aria-hidden="true">
                <CheckIcon />
              </span>
              <SafeText as="p" className="ta-benefit-text" value={text} />
              <Rule />
            </li>
          ))}
        </ul>
      )}

      <CallRow client={client} copy={copy} placement="benefits" tone="solid" />
    </Section>
  );
}
