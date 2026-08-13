/**
 * HERO — the variant's whole argument in four elements.
 *
 * What is here: an eyebrow, a two-line statement, one paragraph, the phone number,
 * and a link down to the form. That is the entire section.
 *
 * WHAT IS DELIBERATELY NOT HERE
 * -----------------------------
 *   - the discount. trimming-a opens on it; this side holds it back to the `offer`
 *     section three quarters of the way down. Offer placement is the independent
 *     variable of the test, so an "improvement" that reinstates it here invalidates
 *     the comparison.
 *   - the form. It is the last section of the page.
 *   - a photograph. Two reasons, and both matter.
 *
 * WHY THE HERO HAS NO IMAGE
 * -------------------------
 * Design: the quiet half of a pair earns its confidence from space and type. A
 * photograph in this position would be doing the loud version's job.
 *
 * Performance: this is also the cheapest possible LCP. removal-a measured that a
 * photographic mobile hero cannot reach a 2.5s LCP on throttled 4G — the CSS+JS
 * critical path alone spends ~1.76s of the budget — and answered it by leading with
 * the brand colour on mobile. This template takes the same decision one step
 * further at every width: the LCP element is a heading rendered in a system font on
 * a flat brand-tinted ground, so it paints on the first frame after CSS with no
 * image request in the critical path at all. The client's photographs still carry
 * the page; they start in the `work` section, all below the fold, all deferred.
 */

import type { ReactNode } from 'react';
import type { ResolvedClient } from '../../../schema/resolve';
import { SafeText } from '../../../components/Safe';
import { ArrowDownIcon, CallLine, Display, Eyebrow, FORM_ANCHOR, type Copy } from './shared';

export function Hero({
  client,
  copy,
  formPanel,
}: {
  client: ResolvedClient;
  copy: Copy;
  formPanel?: ReactNode;
}) {
  const secondary = copy('hero.secondary').trim();

  return (
    <section className="tb-hero">
      <div className="tb-container tb-hero-inner">
        <Eyebrow value={copy('hero.eyebrow')} />

        <Display as="h1" className="tb-display--hero" lines={[copy('hero.h1a'), copy('hero.h1b')]} />

        <SafeText as="p" className="tb-lede" value={copy('hero.body')} />

        <div className="tb-hero-actions">
          <CallLine client={client} copy={copy} placement="hero" subKey="hero.callSub" className="tb-call--lead" />

          {/* An ordinary in-page link, not a scroll-to-element script: it works
              before hydration, survives a JS failure, and can be opened in a new
              tab. Rendered only when there is a label to render (R5). */}
          {secondary && (
            <a className="tb-textlink" href={`#${FORM_ANCHOR}`}>
              {secondary}
              <ArrowDownIcon />
            </a>
          )}
        </div>

        {/* CANONICAL STRUCTURE (2026-08-12): the estimate panel — its deep-ink
            surface and every estimate.* line intact — now sits in the hero. */}
        {formPanel}
      </div>
    </section>
  );
}
