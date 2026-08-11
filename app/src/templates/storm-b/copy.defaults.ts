/**
 * storm-b — COPY DEFAULTS  ·  THE STORM VARIANT.
 *
 * THE ONE PRIMARY VARIABLE IS THE HERO MESSAGE. storm-a leads on response SPEED
 * ("Storm Damage in {area}? We're Already Moving." — availability is the currency).
 * storm-b leads on INSURANCE RECOVERY and reassurance ("We handle the whole
 * recovery — cleared and documented for your insurer"). Every other string on the
 * page is IDENTICAL to storm-a: same form, same trust row, same what-we-handle,
 * same process, same insurance section, same FAQ, same footer. Holding all of that
 * constant is what makes the test attributable to the hero, not to a redesign.
 *
 *   HYPOTHESIS (one sentence)
 *   Leading the hero with insurance-recovery reassurance instead of raw response
 *   speed will lift form-fill rate among INSURED homeowners — the higher-value storm
 *   segment whose decision, once the immediate hazard is handled, turns on who will
 *   produce carrier-ready documentation — at the cost of some pure-emergency callers
 *   that speed-led copy captures.
 *
 * The distinct EARTH-TONE palette (bark browns / burnt amber, set in index.tsx and
 * NOT read from the client record) is a required visual differentiator for the A/B,
 * not the tested variable; it is a secondary difference and is flagged as such in the
 * build log. The 911 safety line and the primary CTA are held identical to storm-a on
 * purpose, so the hero MESSAGE is the only lever that moves.
 */

import { stormACopy } from '../storm-a/copy.defaults';

export const stormBCopy: Record<string, string> = {
  // Start from the control, then override ONLY the hero (the tested variable) and the
  // meta title. Everything else is byte-identical to storm-a.
  ...stormACopy,

  'meta.title': 'Storm Damage Tree Removal — Cleared & Documented for Your Insurer',
  'meta.description':
    'Storm damage cleared and fully documented for your insurance claim. Emergency tree removal, fence repair and cleanup from a licensed, insured local crew. Free on-site assessment.',

  /* ---- HERO — reframed from speed to insurance recovery. This block, plus the
   * palette, is the ONLY difference from storm-a. ---- */
  'hero.eyebrow': 'Storm recovery & insurance',
  'hero.h1InPrefix': 'Storm Damage in ',
  'hero.h1NoArea': 'Storm Damage?',
  'hero.h1b': 'We Handle the Whole Recovery.',
  'hero.sub':
    'Emergency tree and fence work, cleared and fully documented — so your insurer has what they need and you come out whole.',
  'hero.body':
    'A tree through the roof, a fence flattened, and a claim to file. We clear the damage and photograph and document every step, then hand you a written record your carrier can act on — so the cleanup and the paperwork are handled together, not one and then the other.',
  // Safety line: IDENTICAL to storm-a. Safety is not the variable.
  // Primary CTA: IDENTICAL to storm-a. The conversion mechanic is held constant.
  // Desktop art badge reinforces the insurance angle instead of speed.
  'hero.artBadgeStars': '★★★★★',
  'hero.artBadgeValue': 'Documented',
  'hero.artBadgeLabel': 'Photographed and recorded for your claim',
};

export default stormBCopy;
