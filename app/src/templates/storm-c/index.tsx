/**
 * storm-c — THE HYBRID: storm-a's exact copy in storm-b's design direction,
 * executed premium (Design Elevation 2026-08-12).
 *
 * Same shared <StormPage/> tree as both parents, so structure is identical by
 * construction. What this template contributes:
 *
 *   1. COPY — storm-a's, byte-identical (copy.defaults.ts re-exports the
 *      control's object; makeCopy inherits the control's per-client overrides).
 *
 *   2. PALETTE — storm-b's earth-tone FAMILY (bark + amber), tuned one step
 *      richer for the premium execution: a deeper bark ground so the ambers and
 *      whites carry more light, and a slightly warmer amber that holds contrast
 *      on the dark ground. Still unmistakably the variant's family — this is
 *      the "design direction from -b" half of the hybrid bet.
 *
 *   3. ELEVATION — the `.storm-c` rules in storm.css: a larger display scale
 *      with tighter tracking, more generous section rhythm, and a hairline
 *      refinement pass. Transform/opacity only; nothing on the critical path.
 *
 * Perf posture is inherited: text hero (the H1 is the mobile LCP), desktop-only
 * CSS photo, no webfonts, no new requests.
 */

import { useEffect, type CSSProperties } from 'react';
import { makeCopy, type ResolvedClient } from '../../schema/resolve';
import { stormCCopy } from './copy.defaults';
import { StormPage } from '../storm-a/StormPage';

// storm-c shares the one `.storm` stylesheet; `.storm-c` scoping elevates it.
import '../storm-a/storm.css';

/**
 * The earth-tone family is storm-b's identity (bark brown + burnt amber);
 * these values are that family executed at a premium: deeper ground, warmer
 * amber. Fixed for every client — a template design choice, not client data.
 */
const STORM_C_PALETTE: CSSProperties = {
  '--brand-primary': '#2b2118',
  '--brand-accent': '#c08a3e',
  '--brand-on-primary': '#ffffff',
} as CSSProperties;

export function StormC({ client }: { client: ResolvedClient }) {
  // Inherits storm-a's per-client copy overrides so the rendered copy is the
  // control's, byte for byte, for every client.
  const copy = makeCopy(client, 'storm-c', stormCCopy, 'storm-a');

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

  return <StormPage client={client} copy={copy} variant="storm-c" brandStyle={STORM_C_PALETTE} />;
}

export default StormC;
