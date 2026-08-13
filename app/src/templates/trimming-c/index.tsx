/**
 * trimming-c — THE HYBRID: trimming-a's exact copy in trimming-b's design
 * direction, executed premium (Design Elevation 2026-08-12).
 *
 * WHAT WAS TAKEN FROM EACH PARENT
 *   - COPY: trimming-a's, byte-identical (copy.defaults.ts re-exports the
 *     control's object; makeCopy inherits copyOverrides['trimming-a'], so
 *     J Valdez's source-exact strings — short brand, address, copyright —
 *     render here exactly as on the control).
 *   - DESIGN: trimming-b's language — paper ground, system-serif display
 *     against the sans, hairlines instead of cards, brand-derived tints, no
 *     hero photograph at any width — then elevated: a larger editorial scale,
 *     wider whitespace, the lead form beside the display block (stacked
 *     directly beneath it on mobile — dominant above the fold), a
 *     record-composed trust strip, the shared reviews slider, before/after
 *     photography placed as proof, and a sticky mobile call bar.
 *
 * The control's loud discount H1 set in the variant's quiet serif is the
 * hybrid's whole bet: proven words, premium voice.
 *
 * PERF: no webfont (system serif stack), text LCP at every width, photos are
 * <DeferredImage> below the fold only, zero new requests.
 */

import { useEffect, type CSSProperties } from 'react';
import { makeCopy, type ResolvedClient } from '../../schema/resolve';
import { trimmingCCopy } from './copy.defaults';
import { TrimmingCPage } from './page';
import './trimming-c.css';

export function TrimmingC({ client }: { client: ResolvedClient }) {
  const copy = makeCopy(client, 'trimming-c', trimmingCCopy, 'trimming-a');

  // The trimming control deliberately ships no meta title/description
  // (absent in its source); the prerender's per-template <title> stands.
  useEffect(() => {
    const title = copy('meta.title');
    if (title.trim()) document.title = title;
  }, [copy]);

  const brandStyle = {
    '--brand-primary': client.brand?.primaryColor ?? undefined,
    '--brand-accent': client.brand?.accentColor ?? undefined,
    '--brand-on-primary': client.brand?.onPrimaryColor ?? undefined,
  } as CSSProperties;

  return <TrimmingCPage client={client} copy={copy} brandStyle={brandStyle} />;
}

export default TrimmingC;
