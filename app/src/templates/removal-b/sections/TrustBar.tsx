/**
 * S2 — the credential ticker.
 *
 * A thin band of everything that makes this crew safe to let onto the property,
 * moving slowly across the seam between the hero and the page. It is the first
 * thing under the fold on a phone, which on this variant is deliberate: the control
 * puts photographs there, this puts credentials there.
 *
 * Mechanics: two identical groups per track translated -50%, which is what makes
 * the loop seamless — the second group takes over exactly where the first began.
 * The clone is aria-hidden so a screen reader hears each claim once. One keyframe,
 * transform only, no library. Under prefers-reduced-motion the CSS drops the
 * animation and the clone and the items simply wrap.
 */

import { SafeText } from '../../../components/Safe';
import { CheckIcon, type Copy } from './shared';

export function TrustBar({ copy }: { copy: Copy }) {
  const items: string[] = [];
  for (let n = 1; n <= 7; n += 1) {
    const text = copy(`trust.item${n}`);
    if (text.trim()) items.push(text);
  }
  if (items.length === 0) return null; // R5 — no empty band

  const group = (clone: boolean) => (
    <div className="rb-ticker-group" aria-hidden={clone ? true : undefined} data-clone={clone ? 'true' : undefined}>
      {items.map((text, i) => (
        <span className="rb-ticker-item" key={`${i}-${clone}`}>
          <span className="rb-ticker-check" aria-hidden="true">
            <CheckIcon />
          </span>
          <SafeText as="span" value={text} />
        </span>
      ))}
    </div>
  );

  return (
    <div className="rb-ticker">
      <div className="rb-ticker-track">
        {group(false)}
        {group(true)}
      </div>
    </div>
  );
}
