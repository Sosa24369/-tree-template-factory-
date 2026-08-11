/**
 * Footer — wordmark, tagline, the assessment disclaimer, and the two legal links.
 *
 * The company name and the copyright year are composed from client.name and the
 * current year rather than written into copy, so no client is stamped with someone
 * else's name or a stale year. A client with no legal URLs gets no links rather than
 * links to nowhere (R5) — resolveClient already warns on that, because A2P needs both.
 */

import type { ResolvedClient } from '../../../schema/resolve';
import { SafeLogo, SafeSection, SafeText } from '../../../components/Safe';
import type { Copy } from './shared';

export function Footer({ client, copy }: { client: ResolvedClient; copy: Copy }) {
  const privacyUrl = client.consent?.privacyPolicyUrl ?? '';
  const termsUrl = client.consent?.termsOfServiceUrl ?? '';
  const name = (client.name ?? '').trim();
  const rights = copy('footer.rights');
  const year = new Date().getFullYear();

  return (
    <footer className="st-footer">
      <div className="st-container st-footer-inner">
        <div className="st-footer-top">
          <SafeLogo logoUrl={client.brand?.logoUrl} clientName={client.name} className="st-footer-logo" />
          <SafeText as="p" className="st-footer-tagline" value={copy('footer.tagline')} />
        </div>

        <SafeSection when={privacyUrl || termsUrl}>
          <nav className="st-footer-legal">
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

        <SafeText as="p" className="st-footer-disclaimer" value={copy('footer.disclaimer')} />

        {/* Composed, not copy: no client name and no hard-coded year in the template. */}
        <p className="st-footer-copy">
          {`© ${year}${name ? ` ${name}` : ''}${rights.trim() ? `. ${rights}` : ''}`}
        </p>
      </div>
    </footer>
  );
}
