/**
 * S12 — footer: wordmark, tagline, the offer's small print, and the two legal links.
 *
 * The company name and the copyright line are composed from client.name and the
 * current year rather than written into copy, so no client has to override a
 * footer that names somebody else and no page is stamped with a year that has
 * already passed. A client with no legal URLs gets no links rather than links to
 * nowhere (R5) — resolveClient already raises a warning for that case, because A2P
 * registration needs both.
 *
 * The offer disclaimer is here on purpose: a page that discounts should say what
 * qualifies, and burying it would be the sort of thing this variant's whole tone is
 * arguing against.
 */

import type { ResolvedClient } from '../../../schema/resolve';
import { SafeLogo, SafeSection, SafeText } from '../../../components/Safe';
import type { Copy } from './shared';
import { GoogleAdsCallAsset } from '../../../components/GoogleAdsCallAsset';

export function Footer({ client, copy }: { client: ResolvedClient; copy: Copy }) {
  const privacyUrl = client.consent?.privacyPolicyUrl ?? '';
  const termsUrl = client.consent?.termsOfServiceUrl ?? '';
  const name = (client.name ?? '').trim();
  const rights = copy('footer.rights');
  const year = new Date().getFullYear();

  return (
    <footer className="rb-footer">
      <div className="rb-container rb-footer-inner">
        <div className="rb-footer-top">
          <SafeLogo logoUrl={client.brand?.logoUrl} clientName={client.name} className="rb-footer-logo" />
          <SafeText as="p" className="rb-footer-tagline" value={copy('footer.tagline')} />
        </div>

        <SafeSection when={privacyUrl || termsUrl}>
          <nav className="rb-footer-legal">
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

        <SafeText as="p" className="rb-footer-disclaimer" value={copy('footer.disclaimer')} />

        {/* Composed, not copy: no client name and no hard-coded year in the template. */}
        <p className="rb-footer-copy">
          {`© ${year}${name ? ` ${name}` : ''}${rights.trim() ? `. ${rights}` : ''}`}
        </p>
      </div>
      {/* Google Ads call asset — visible, unlinked, DNI-excluded.
          Renders nothing when the client has no call asset number. */}
      <GoogleAdsCallAsset client={client} />
    </footer>
  );
}
