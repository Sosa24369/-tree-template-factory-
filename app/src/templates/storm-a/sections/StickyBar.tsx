/**
 * The mobile action bar — phones only. The number on the left, an anchor to the
 * assessment form on the right, so both ways to convert are always one tap away
 * however far down the page the reader is. An ordinary <a href="#…">, so it works
 * before hydration and survives a JS error. The page reserves room with
 * padding-bottom so it never covers the footer's legal links (A2P needs them
 * reachable).
 */

import type { ResolvedClient } from '../../../schema/resolve';
import { PhoneLink } from '../../../components/PhoneLink';
import { FORM_ANCHOR, type Copy } from './shared';

export function StickyBar({ client, copy }: { client: ResolvedClient; copy: Copy }) {
  const formLabel = copy('sticky.formLabel');

  return (
    <div className="st-sticky" role="complementary">
      <PhoneLink client={client} className="st-sticky-call" subLabel={copy('sticky.callSub')} placement="sticky-bar" />

      {formLabel.trim() && (
        <a className="st-sticky-form" href={`#${FORM_ANCHOR}`}>
          {formLabel}
        </a>
      )}
    </div>
  );
}
