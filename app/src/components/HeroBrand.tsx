/**
 * HeroBrand — the client's logo + company name, larger and centered inside
 * the hero (Premium Reorder v2, owner's directive 2026-08-13).
 *
 * Pure record data: the logo through <SafeLogo/> (which falls back to a name
 * wordmark when the record has no logo — the agnostic/blank-co path), the
 * name as text. Never invents either. The logo file is the same one the
 * header already preloads, so this costs zero extra requests; intrinsic
 * width/height keep CLS at 0.
 */

import type { ResolvedClient } from '../schema/resolve';
import { SafeLogo } from './Safe';

export function HeroBrand({ client, className }: { client: ResolvedClient; className?: string }) {
  const name = (client.name ?? '').trim();
  if (!client.brand?.logoUrl && !name) return null;

  return (
    <div className={['hbrand', className].filter(Boolean).join(' ')}>
      <SafeLogo
        logoUrl={client.brand?.logoUrl}
        clientName={client.name}
        className="hbrand-logo"
        srcset={client.brand?.logoSrcset}
        sizes="(min-width: 768px) 120px, 96px"
        width={client.brand?.logoWidth}
        height={client.brand?.logoHeight}
      />
      {name && <p className="hbrand-name">{name}</p>}
    </div>
  );
}

export default HeroBrand;
