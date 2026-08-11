/**
 * The mobile action bar.
 *
 * This variant moves the form off the first screen, which is only defensible if the
 * two ways to convert are never more than one tap away. So the phone gets a fixed
 * bottom bar: the number on the left, an anchor to the estimate form on the right.
 * Phones only — above 768px the sticky header already carries the call CTA and a
 * second fixed bar would just eat viewport.
 *
 * It is an ordinary <a href="#…">, not a scripted scroll, so it works before
 * hydration and survives a JS error. The page reserves room for it with
 * padding-bottom, so it never covers the footer's legal links — which A2P
 * registration requires to be reachable.
 */

import type { ResolvedClient } from '../../../schema/resolve';
import { PhoneLink } from '../../../components/PhoneLink';
import { FORM_ANCHOR, type Copy } from './shared';

export function StickyBar({ client, copy }: { client: ResolvedClient; copy: Copy }) {
  const formLabel = copy('sticky.formLabel');

  return (
    <div className="rb-sticky" role="complementary">
      <PhoneLink client={client} className="rb-sticky-call" subLabel={copy('sticky.callSub')} placement="sticky-bar" />

      {formLabel.trim() && (
        <a className="rb-sticky-form" href={`#${FORM_ANCHOR}`}>
          {formLabel}
        </a>
      )}
    </div>
  );
}
