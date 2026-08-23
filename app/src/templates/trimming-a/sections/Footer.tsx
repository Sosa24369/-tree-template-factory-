/**
 * S13 — footer: logo, business name, the contact box, copyright, and the two legal
 * links.
 *
 * Three source defects are corrected here, all of them behaviour rather than copy:
 *
 *  1. The legal links exist twice in the source — a desktop pair of real anchors and
 *     a mobile pair of <button>s wired to a popup with zero children. On a phone the
 *     two links A2P registration requires open an empty overlay. Rendered once here,
 *     as real links, at every width.
 *  2. Those links point at the agency's own hosted pages. They come from
 *     client.consent.privacyPolicyUrl / termsOfServiceUrl, so each client links its
 *     own. A client with no URL set gets no link rather than a link to nowhere (R5);
 *     resolveClient already raises a warning for that case.
 *  3. The footer phone was raw HTML inside a custom-code block, invisible to any
 *     GHL-button-level number swap. It is a <PhoneLink/> like every other number on
 *     the page, so one CallRail rule covers all of them at P4.
 *
 * The address is copy (footer.address) and overridable per client, for the same
 * reason the company name is: it is a fixed string inside the control's markup, and
 * the ClientRecord has no address field to read it from.
 */

import type { ResolvedClient } from '../../../schema/resolve';
import { SafeLogo, SafeSection, SafeText } from '../../../components/Safe';
import { PhoneLink } from '../../../components/PhoneLink';
import { HandsetIcon, PinIcon, type Copy } from './shared';
import { GoogleAdsCallAsset } from '../../../components/GoogleAdsCallAsset';

export function Footer({ client, copy }: { client: ResolvedClient; copy: Copy }) {
  const privacyUrl = client.consent?.privacyPolicyUrl ?? '';
  const termsUrl = client.consent?.termsOfServiceUrl ?? '';
  const address = copy('footer.address');

  return (
    <footer className="ta-footer">
      <div className="ta-container ta-footer-inner">
        <div className="ta-footer-brand">
          <SafeLogo logoUrl={client.brand?.logoUrl} clientName={client.name} className="ta-footer-logo" />
          <SafeText as="p" className="ta-footer-name" value={copy('footer.companyName')} />
        </div>

        <div className="ta-contact">
          {address.trim() ? (
            <p className="ta-contact-item">
              <span className="ta-contact-icon" aria-hidden="true">
                <PinIcon />
              </span>
              <span>{address}</span>
            </p>
          ) : null}

          {client.phoneHref ? (
            <p className="ta-contact-item">
              <span className="ta-contact-icon" aria-hidden="true">
                <HandsetIcon />
              </span>
              <PhoneLink client={client} className="ta-contact-phone" placement="footer" />
            </p>
          ) : null}
        </div>
      </div>

      <div className="ta-container ta-footer-legal">
        <SafeText as="p" className="ta-footer-copy" value={copy('footer.copyright')} />

        <SafeSection when={privacyUrl || termsUrl}>
          <nav className="ta-footer-links">
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
