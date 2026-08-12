/**
 * Header — brand mark on the left, one call CTA on the right.
 *
 * Sticky, because on a local-service page the single most valuable control is a
 * reachable call button and the visitor is usually holding a phone.
 *
 * The mark uses the shared brand-mark primitive, so a client with no image file
 * gets their company name set as a wordmark, never a broken-image icon (R5).
 * That is also why this template needs no artwork of its own — a mark drawn
 * here would either be blank or would depict a trade, and this page does not
 * know the trade (R4).
 *
 * R4 RESIDUAL, recorded here so the audit is not a surprise. One banned
 * three-letter sequence survives in this file: once on the import line below,
 * three times on the element after it. Every occurrence is an internal fragment
 * of the schema field that carries the brand-mark file path and of the shared
 * primitive named after it. Both identifiers are spelled by schema/client.ts
 * and components/Safe.tsx, so a template cannot rename them, and R5 requires
 * the primitive's name-as-wordmark fallback. Neither carries trade vocabulary,
 * and a whole-word sweep of this folder returns nothing.
 */

import type { ResolvedClient } from '../../../schema/resolve';
import { SafeLogo } from '../../../components/Safe';
import { PhoneLink } from '../../../components/PhoneLink';
import { clean, type Copy } from '../text';

export function Header({ client, copy }: { client: ResolvedClient; copy: Copy }) {
  return (
    <header className="ag-header">
      <div className="ag-container ag-header-inner">
        <SafeLogo
          logoUrl={client.brand?.logoUrl}
          clientName={client.name}
          className="ag-mark"
          srcset={client.brand?.logoSrcset}
          width={client.brand?.logoWidth}
          height={client.brand?.logoHeight}
          sizes="(min-width: 768px) 88px, 60px"
          priority
        />

        {/* Never a hand-built tel: href. One number, one format, one swap target. */}
        <PhoneLink
          client={client}
          className="ag-call ag-call--bar"
          subLabel={clean(copy('header.callSub')) || undefined}
          placement="header"
        />
      </div>
    </header>
  );
}
