/**
 * What the Datum dual-write needs from the page that GHL never did. Read-only: nothing here renders, and every reader
 * falls back to an empty string rather than throw, so a missing node or storage can never break a submit.
 */

const SESSION_KEY = 'ttf_session_v1';

/** One id per browser tab session, kept in sessionStorage (no PII). Empty when storage is unavailable. */
export function getSessionId(): string {
  try {
    const existing = sessionStorage.getItem(SESSION_KEY);
    if (existing) return existing;
    const fresh = crypto.randomUUID();
    sessionStorage.setItem(SESSION_KEY, fresh);
    return fresh;
  } catch {
    return '';
  }
}

/** The words beside the SMS checkbox as rendered (the copy and its policy links), ticked or not. */
export function consentShownText(): string {
  try {
    const label = document.querySelector('label[for="ttf-consent"]');
    return (label?.textContent ?? '').replace(/\s+/g, ' ').trim();
  } catch {
    return '';
  }
}

/** The phone number the page shows — from the first tel: link, which call tracking swaps in place. */
export function displayedTrackingNumber(): string {
  try {
    const link = document.querySelector('a[href^="tel:"]');
    return (link?.getAttribute('href') ?? '').replace(/^tel:/, '').trim();
  } catch {
    return '';
  }
}
