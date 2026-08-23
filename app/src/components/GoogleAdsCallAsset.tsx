/**
 * The Google Ads call asset line.
 *
 * Google verifies a call asset by RENDERING the landing page and checking that the
 * number is visibly present. This renders it as small, muted text at the bottom of
 * the footer — quiet enough that a buyer's eye passes over it, plainly readable to
 * anyone (or anything) actually looking.
 *
 * WHAT THIS DELIBERATELY IS NOT
 * -----------------------------
 * Not hidden. No `display:none`, no `visibility:hidden`, no zero-size box, no
 * off-screen transform, no text coloured to match its background. Two reasons, and
 * the second is the serious one:
 *   1. Google's check is for a VISIBLE number, so hiding it fails the very thing
 *      it exists to pass.
 *   2. Showing a crawler something the user cannot see is cloaking — an Ads policy
 *      violation that puts the whole account at risk, not just the asset.
 * If someone later "tidies" this into a hidden element, they have broken it.
 *
 * Not a link. No `tel:` href, so a customer who taps it does not reach a line that
 * sits outside GHL and outside CallRail, uncounted.
 *
 * Not swappable. `data-dni="exclude"` and CallRail's own `notranslate`-style opt-out
 * are both applied, so DNI cannot rewrite this number at P4. A swapped number here
 * would silently invalidate the verification.
 *
 * Renders NOTHING when the client has no call asset number — which is the correct
 * state for every client who has not supplied one (R5).
 */

import type { ResolvedClient } from '../schema/resolve';

export function GoogleAdsCallAsset({ client }: { client: ResolvedClient }) {
  const display = client.googleAdsCallAssetDisplay;
  if (!display) return null;

  return (
    <p
      className="gads-call-asset"
      // CallRail DNI exclusion. `data-dni="exclude"` is our own hook; the
      // `notranslate` class is the conventional opt-out CallRail honours.
      // ⚠️ CONFIRM the exact exclusion mechanism against CallRail's current docs
      // when DNI is installed at P4, and verify this number does NOT swap.
      data-dni="exclude"
      data-call-asset="google-ads"
    >
      <span className="notranslate">{display}</span>
    </p>
  );
}
