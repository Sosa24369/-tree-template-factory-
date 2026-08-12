/**
 * CallRail dynamic number insertion (DNI).
 *
 * Ownership rule (decided): CallRail is PRIMARY for completed calls. GTM never
 * rebuilds call tracking; a phone-link click is an engagement event only
 * (see PhoneLink). This module only does two things:
 *
 *   1. load the client's swap script ONCE per document, and
 *   2. re-run the swap after client-side route changes, because CallRail only
 *      scans the DOM on load — an SPA navigation renders new phone numbers
 *      that the script has never seen.
 *
 * The swap script URL is per-client data (`tracking.callRailSwapScriptUrl`),
 * never hardcoded. Every client's value is currently null — obtaining the real
 * URL is a CallRail-console task on docs/TRACKING_MANUAL_LIST.md. Until it is
 * filled in, this module is inert by construction.
 */

declare global {
  interface Window {
    CallTrk?: { swap: () => void };
  }
}

let loadedUrl: string | null = null;

/** Load the swap script once. Safe to call from every template mount. */
export function ensureCallRail(swapScriptUrl: string | null | undefined): void {
  if (!swapScriptUrl) return;
  if (loadedUrl) return; // one script per document; first client wins (SPA
  // cross-client navigation does not exist on the public site — see App.tsx).
  loadedUrl = swapScriptUrl;
  const s = document.createElement('script');
  s.async = true;
  s.src = swapScriptUrl;
  document.head.appendChild(s);
}

/** Re-swap after a route change. No-op until the script has loaded. */
export function swapCallRail(): void {
  try {
    window.CallTrk?.swap();
  } catch {
    /* a tracking failure must never break the page */
  }
}
