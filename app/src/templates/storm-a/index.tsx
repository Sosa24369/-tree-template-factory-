/**
 * storm-a — THE STORM CONTROL.
 *
 * An emergency storm-damage page: tree removal, fence repair and cleanup, with
 * written insurance documentation. Copy is the approved draft (docs/storm-copy-
 * draft.md) with three decisions locked — see copy.defaults.ts. Its A/B partner
 * storm-b changes ONE primary variable (the hero message) and the palette.
 *
 * WHAT THIS FILE IS RESPONSIBLE FOR
 *   1. Copy resolution — every string goes through makeCopy(client, 'storm-a',
 *      stormACopy), so client.copyOverrides['storm-a'] always wins and an unknown key
 *      resolves to '' rather than "undefined" (R5).
 *   2. Turning client.brand into CSS custom properties on ONE wrapper element. Every
 *      rule in storm.css reads var(--brand-primary) / var(--brand-accent) /
 *      var(--brand-on-primary) and never a brand hex literal (R1), so a client's
 *      colours are a JSON edit rather than a code change. (storm-b overrides these
 *      with a fixed earth-tone palette — that is the only palette difference.)
 *   3. Document metadata, with the company name composed from client.name.
 *
 * WHAT IT DELIBERATELY DOES NOT HOLD: a phone number, a city, a company name, a
 * review, a legal URL or a logo path. Those live in the ClientRecord and reach the
 * DOM through <PhoneLink/>, <SafeLogo/>, <SafeText/> and <DeferredImage/>.
 */

import { useEffect, type CSSProperties } from 'react';
import { makeCopy, type ResolvedClient } from '../../schema/resolve';
import { stormACopy } from './copy.defaults';
import { StormPage } from './StormPage';

import './storm.css';

/**
 * Only set a custom property when the record carries a value, so a half-filled brand
 * falls through to the safe defaults in styles/base.css instead of painting
 * `undefined` (R5). --brand-on-primary is NOT defaulted to primaryColor: that would
 * put a button's text and its background at the same colour.
 */
function brandVars(client: ResolvedClient): CSSProperties {
  const primary = client.brand?.primaryColor?.trim();
  const accent = client.brand?.accentColor?.trim();
  const onPrimary = client.brand?.onPrimaryColor?.trim();

  return {
    ...(primary ? { '--brand-primary': primary } : {}),
    ...(accent ? { '--brand-accent': accent } : {}),
    ...(onPrimary ? { '--brand-on-primary': onPrimary } : {}),
  } as CSSProperties;
}

export function StormA({ client }: { client: ResolvedClient }) {
  const copy = makeCopy(client, 'storm-a', stormACopy);

  const base = copy('meta.title');
  const name = (client.name ?? '').trim();
  const title = base && name ? `${base} | ${name}` : base || name;
  const description = copy('meta.description');

  useEffect(() => {
    if (title) document.title = title;
    if (!description) return;
    let tag = document.querySelector<HTMLMetaElement>('meta[name="description"]');
    if (!tag) {
      tag = document.createElement('meta');
      tag.name = 'description';
      document.head.appendChild(tag);
    }
    tag.content = description;
  }, [title, description]);

  return <StormPage client={client} copy={copy} variant="storm-a" brandStyle={brandVars(client)} />;
}

export default StormA;
