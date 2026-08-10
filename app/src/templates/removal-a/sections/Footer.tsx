/**
 * S13 — footer: logo, business name, copyright, Privacy Policy, Terms of Service.
 *
 * The source ships the legal links twice: a desktop pair of real <a href> links and
 * a mobile pair of <button>s wired to an EMPTY popup — i.e. on a phone, the two
 * links A2P registration requires are dead. Rendered once here, as real links, from
 * the client's own consent URLs. A client with no URLs set gets no link rather than
 * a link to nowhere (R5); resolveClient already raises a warning for that case.
 */

import type { ResolvedClient } from '../../../schema/resolve';
import { SafeLogo, SafeSection, SafeText } from '../../../components/Safe';
import type { Copy } from './shared';

export function Footer({ client, copy }: { client: ResolvedClient; copy: Copy }) {
  const privacyUrl = client.consent?.privacyPolicyUrl ?? '';
  const termsUrl = client.consent?.termsOfServiceUrl ?? '';

  return (
    <footer className="ra-footer">
      <div className="ra-container ra-footer-inner">
        <SafeLogo logoUrl={client.brand?.logoUrl} clientName={client.name} className="ra-footer-logo" />

        <SafeText as="p" className="ra-footer-name" value={copy('footer.companyName')} />
        <SafeText as="p" className="ra-footer-copy" value={copy('footer.copyright')} />

        <SafeSection when={privacyUrl || termsUrl}>
          <nav className="ra-footer-legal">
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
    </footer>
  );
}
