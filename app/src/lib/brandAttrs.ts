/**
 * Style-token attributes for a template's root element.
 *
 * `data-font` and `data-spacing` are emitted ONLY for a non-default value, so a
 * client that has set neither produces exactly the markup it did before these
 * tokens existed. base.css maps the attributes to CSS: the font pairings are
 * self-hosted @font-face declarations that the browser only downloads when a rule
 * actually uses them, so `system` costs zero requests.
 *
 * `data-demo` is emitted only for the demo account, and exists for one reason:
 * removal-a paints five decorative section backgrounds from the CONTROL CLIENT's
 * own photographs, hard-coded in removal-a.css because the extracted source page
 * paints them there (see removal-a/assets.ts). A demo must not reuse a paying
 * client's photography, so removal-a.css swaps those five for the shared
 * placeholders under [data-demo]. Emitting nothing for a real client keeps every
 * live page byte-identical.
 */
import type { ResolvedClient } from '../schema/resolve';

export function brandAttrs(
  client: ResolvedClient
): { 'data-font'?: string; 'data-spacing'?: string; 'data-demo'?: string } {
  const font = client.brand?.fontPairing;
  const spacing = client.brand?.spacingScale;
  return {
    ...(font && font !== 'system' ? { 'data-font': font } : {}),
    ...(spacing && spacing !== 'default' ? { 'data-spacing': spacing } : {}),
    ...(client.isDemo ? { 'data-demo': 'true' } : {}),
  };
}
