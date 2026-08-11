/**
 * Trust row — four points a homeowner needs before letting a crew onto storm-hit
 * property: it's free to assess, it's fast, it's insured, and the damage gets
 * documented. Sits directly under the assessment form. Each item hides itself when
 * blank, and the whole band disappears when all four are empty (R5).
 */

import { SafeText } from '../../../components/Safe';
import { CheckIcon, type Copy } from './shared';

const ITEMS = [1, 2, 3, 4];

export function Trust({ copy }: { copy: Copy }) {
  const items = ITEMS.map((n) => copy(`trust.item${n}`)).filter((text) => text.trim());
  if (items.length === 0) return null;

  return (
    <div className="st-trust">
      <div className="st-container">
        <ul className="st-trust-list">
          {items.map((text, i) => (
            <li className="st-trust-item" key={i}>
              <span className="st-trust-check" aria-hidden="true">
                <CheckIcon />
              </span>
              <SafeText as="span" value={text} />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
