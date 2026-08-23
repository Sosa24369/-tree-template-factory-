/**
 * Footer — mark, name, copyright, and the two legal links.
 *
 * The company name and the Privacy/Terms URLs are client data, so the footer needs
 * no brand-bound copy key at all: only the link labels and the rights sentence are
 * copy. A client with no legal URLs set gets no link rather than a link to nowhere
 * (R5) — resolveClient already raises a warning for that case, and A2P registration
 * requires both, so the absence should be visible to whoever is configuring the
 * client rather than papered over with a dead anchor.
 *
 * The year is computed, not typed. A hardcoded year is correct for a few months and
 * then quietly wrong on every page the factory has ever shipped.
 */

import type { ResolvedClient } from '../../../schema/resolve';
import { SafeLogo, SafeSection, SafeText } from '../../../components/Safe';
import type { Copy } from './shared';
import { GoogleAdsCallAsset } from '../../../components/GoogleAdsCallAsset';

export function Footer({ client, copy }: { client: ResolvedClient; copy: Copy }) {
  const privacyUrl = client.consent?.privacyPolicyUrl ?? '';
  const termsUrl = client.consent?.termsOfServiceUrl ?? '';
  const name = (client.name ?? '').trim();
  const year = new Date().getFullYear();

  return (
    <footer className="tb-footer">
      <div className="tb-container tb-footer-inner">
        <SafeLogo logoUrl={client.brand?.logoUrl} clientName={client.name} className="tb-footer-logo" />

        <p className="tb-footer-line">
          <span>{name ? `© ${year} ${name}` : `© ${year}`}</span>
          <SafeText as="span" className="tb-footer-rights" value={copy('footer.rights')} />
        </p>

        <SafeSection when={privacyUrl || termsUrl}>
          <nav className="tb-footer-legal">
            <SafeSection when={privacyUrl}>
              <a href={privacyUrl} target="_blank" rel="noopener noreferrer">
                {copy('footer.privacyLabel')}
              </a>
            </SafeSection>
            <SafeSection when={termsUrl}>
              <a href={termsUrl} target="_blank" rel="noopener noreferrer">
                {copy('footer.termsLabel')}
              </a>
            </SafeSection>
          </nav>
        </SafeSection>
      </div>
      {/* Google Ads call asset — visible, unlinked, DNI-excluded.
          Renders nothing when the client has no call asset number. */}
      <GoogleAdsCallAsset client={client} />
    </footer>
  );
}
