/**
 * storm-b — THE STORM VARIANT.
 *
 * Same page as storm-a, rendered through the shared <StormPage/> and the shared
 * `.storm` stylesheet. Two things differ, and only two:
 *
 *   1. THE HERO MESSAGE — the tested variable. storm-a leads on speed; storm-b leads
 *      on insurance recovery. That difference lives entirely in copy.defaults.ts.
 *
 *   2. THE PALETTE — a required visual differentiator for the A/B. storm-a paints the
 *      page in the CLIENT's brand colours; storm-b overrides --brand-* with a FIXED
 *      earth-tone scheme (bark brown + burnt amber). Because every colour in storm.css
 *      is derived from these three custom properties, overriding them here recolours
 *      the whole page — surfaces, ink, gradients and CTAs — with no second stylesheet.
 *      A fixed palette is a template design choice, not a client value, so it is not an
 *      R1 violation (R1 guards client-specific data, and brand colours are not in the
 *      needle set).
 *
 * Everything else — structure, sections, body copy, the 911 line, the primary CTA and
 * all four P0 fixes — is held identical to storm-a so the test stays attributable.
 */

import { useEffect, type CSSProperties } from 'react';
import { makeCopy, type ResolvedClient } from '../../schema/resolve';
import { stormBCopy } from './copy.defaults';
import { StormPage } from '../storm-a/StormPage';

// storm-b shares storm-a's stylesheet (scope `.storm`); no second CSS file exists.
import '../storm-a/storm.css';

/**
 * The storm-b variant palette. Deep bark brown + burnt amber — earth tones that still
 * read tree-service, deliberately distinct from storm-a's client-brand green/gold so
 * the two are unmistakable in an A/B. Fixed for every client (this is the variant's
 * identity, the same way trimming-b's tone is fixed), which is why it is a constant
 * here and not read from client.brand.
 */
const STORM_B_PALETTE: CSSProperties = {
  '--brand-primary': '#33291f',
  '--brand-accent': '#b7772f',
  '--brand-on-primary': '#ffffff',
} as CSSProperties;

export function StormB({ client }: { client: ResolvedClient }) {
  const copy = makeCopy(client, 'storm-b', stormBCopy);

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

  return <StormPage client={client} copy={copy} variant="storm-b" brandStyle={STORM_B_PALETTE} />;
}

export default StormB;
