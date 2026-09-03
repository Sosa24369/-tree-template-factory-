/**
 * Style-token attributes for a template's root element.
 *
 * `data-font` and `data-spacing` are emitted ONLY for a non-default value, so a
 * client that has set neither produces exactly the markup it did before these
 * tokens existed. base.css maps the attributes to CSS: the font pairings are
 * self-hosted @font-face declarations that the browser only downloads when a rule
 * actually uses them, so `system` costs zero requests.
 */
import type { ResolvedClient } from '../schema/resolve';

export function brandAttrs(client: ResolvedClient): { 'data-font'?: string; 'data-spacing'?: string } {
  const font = client.brand?.fontPairing;
  const spacing = client.brand?.spacingScale;
  return {
    ...(font && font !== 'system' ? { 'data-font': font } : {}),
    ...(spacing && spacing !== 'default' ? { 'data-spacing': spacing } : {}),
  };
}
