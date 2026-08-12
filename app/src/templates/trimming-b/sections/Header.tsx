/**
 * Header — logo, and the number.
 *
 * Sticky, because the whole page is built around calling rather than filling in a
 * form in the hero, and the number therefore has to stay reachable through a long
 * scroll. Quiet, because this is the restrained side of the pair: a hairline rule
 * and a text-set number, no coloured bar and no button.
 *
 * A client with no logo file renders their name as a wordmark, never a broken image
 * (R5). A client with no phone number renders no phone element at all rather than a
 * dead tel: link — <PhoneLink/> handles that itself.
 */

import type { ResolvedClient } from '../../../schema/resolve';
import { SafeLogo } from '../../../components/Safe';
import { CallLine, type Copy } from './shared';

export function Header({ client, copy }: { client: ResolvedClient; copy: Copy }) {
  return (
    <header className="tb-header">
      <div className="tb-container tb-header-inner">
        <SafeLogo
          logoUrl={client.brand?.logoUrl}
          clientName={client.name}
          className="tb-logo"
          srcset={client.brand?.logoSrcset}
          width={client.brand?.logoWidth}
          height={client.brand?.logoHeight}
          sizes="(min-width: 768px) 88px, 60px"
          priority
        />
        <CallLine client={client} copy={copy} placement="header" subKey="header.callSub" className="tb-call--bar" />
      </div>
    </header>
  );
}
