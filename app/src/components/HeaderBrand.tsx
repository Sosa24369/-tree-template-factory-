/**
 * HeaderBrand — the client's logo + company name as ONE prominent lockup in the
 * header (owner's directive 2026-08-13: the large brand treatment lives in the
 * header, and the mid-hero lockup is gone — exactly one logo at the top of the
 * page).
 *
 * Pure record data: the logo through <SafeLogo/> when the record has one, the
 * name as text. A client with no logo file (blank-co, the agnostic banner path)
 * renders the name alone as the wordmark — never a broken image (R5). The logo
 * file is the same one the prerender preloads, so this costs zero new requests;
 * the fixed CSS box + intrinsic width/height keep CLS at 0.
 *
 * READABILITY CONTRACT: `.hdbrand-name` colours itself from
 * `--hdbrand-name-color`, defaulting to var(--brand-primary) — a dark brand
 * green/charcoal on every client record, legible on the light header papers.
 * Dark headers (storm) override the property to their on-ink colour. The name
 * is NEVER left white-on-white.
 */

import type { ResolvedClient } from '../schema/resolve';
import { SafeLogo } from './Safe';

export function HeaderBrand({ client, className }: { client: ResolvedClient; className?: string }) {
  const name = (client.name ?? '').trim();
  if (!client.brand?.logoUrl && !name) return null;

  return (
    <div className={['hdbrand', className].filter(Boolean).join(' ')}>
      {client.brand?.logoUrl && (
        <SafeLogo
          logoUrl={client.brand.logoUrl}
          clientName={client.name}
          className="hdbrand-logo"
          srcset={client.brand?.logoSrcset}
          sizes="(min-width: 768px) 96px, 64px"
          width={client.brand?.logoWidth}
          height={client.brand?.logoHeight}
          priority
        />
      )}
      {name && <span className="hdbrand-name">{name}</span>}
    </div>
  );
}

export default HeaderBrand;
