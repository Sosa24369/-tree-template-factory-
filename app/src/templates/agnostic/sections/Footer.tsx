/**
 * Footer — company name, registered name, copyright, legal links, small print.
 *
 * The footer is the page floor and always renders: even a completely unfilled
 * record has a company name, and a page that simply stops after the last
 * section looks truncated rather than spare.
 *
 * The mark here is the company name set as a wordmark rather than a second copy
 * of the image mark. It is quieter at the bottom of a page, and it means this
 * section renders identically whether or not the record has an image file.
 *
 * LEGAL LINKS come from client.consent.privacyPolicyUrl / termsOfServiceUrl —
 * real anchors, not buttons wired to a popup. Their labels fall back to the
 * neutral defaults in copy.defaults.ts, because a client that HAS set the URLs
 * must never end up with two invisible links: A2P registration requires both to
 * be reachable next to the opt-in. A client with no URLs gets no links rather
 * than links to nowhere (R5) — resolveClient already raises that as a warning.
 */

import type { ResolvedClient } from '../../../schema/resolve';
import { SafeText } from '../../../components/Safe';
import { agnosticChrome } from '../copy.defaults';
import { hasText, orChrome, type Copy } from './shared';

export function Footer({ client, copy }: { client: ResolvedClient; copy: Copy }) {
  const privacyUrl = client.consent?.privacyPolicyUrl ?? '';
  const termsUrl = client.consent?.termsOfServiceUrl ?? '';
  const hasLegal = hasText(privacyUrl) || hasText(termsUrl);

  return (
    <footer className="ag-footer">
      <div className="ag-container ag-footer-inner">
        <div className="ag-footer-id">
          <SafeText as="p" className="ag-footer-mark" value={client.name} />
          <SafeText as="p" className="ag-footer-legal-name" value={copy('footer.legalName')} />
        </div>

        {hasLegal && (
          <nav className="ag-footer-links" aria-label="Legal">
            {hasText(privacyUrl) && (
              <a href={privacyUrl} target="_blank" rel="noopener noreferrer">
                {orChrome(copy('footer.privacyLabel'), agnosticChrome.privacyLabel)}
              </a>
            )}
            {hasText(termsUrl) && (
              <a href={termsUrl} target="_blank" rel="noopener noreferrer">
                {orChrome(copy('footer.termsLabel'), agnosticChrome.termsLabel)}
              </a>
            )}
          </nav>
        )}

        <SafeText as="p" className="ag-footer-copyright" value={copy('footer.copyright')} />
        <SafeText as="p" className="ag-footer-note" value={copy('footer.note')} />
      </div>
    </footer>
  );
}
