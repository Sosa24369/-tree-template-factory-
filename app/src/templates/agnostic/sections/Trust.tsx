/**
 * Trust row — up to four very short credibility items under the hero.
 *
 * Licensed, insured, years in business, warranty, response time: whatever this
 * particular business actually has. The template supplies four slots and no
 * suggestions, because a suggestion would be a claim we made up on the client's
 * behalf, and several of the obvious ones are regulated statements.
 *
 * The strip renders only the slots that are filled, and disappears entirely
 * when none are — no empty rule across the page (R5).
 */

import { hasText, type Copy } from './shared';

export function Trust({ copy }: { copy: Copy }) {
  const items = [1, 2, 3, 4].map((n) => copy(`trust.item${n}`)).filter(hasText);
  if (items.length === 0) return null;

  return (
    <section className="ag-trust" data-count={items.length}>
      <div className="ag-container">
        <ul className="ag-trust-list">
          {items.map((item, i) => (
            <li key={i} className="ag-trust-item">
              {item}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
