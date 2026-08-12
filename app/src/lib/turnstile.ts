/**
 * Cloudflare Turnstile — client side (Q1 bot gate).
 *
 * The site key comes from `/api/turnstile-config` at runtime, not the build, so
 * both keys live in the Cloudflare dashboard. If the key is null (unconfigured)
 * the form renders no widget and submits without a token — the Function is
 * fail-open in the same state, so the page works before the keys are set.
 *
 * Explicit rendering (`?render=explicit`) is used because this is an SPA: the
 * widget must mount when the form mounts, not on first script load.
 */

const SCRIPT_URL = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';

interface TurnstileApi {
  render: (
    el: HTMLElement,
    opts: {
      sitekey: string;
      callback: (token: string) => void;
      'expired-callback'?: () => void;
      'error-callback'?: () => void;
      theme?: 'auto' | 'light' | 'dark';
    }
  ) => string;
  reset: (widgetId?: string) => void;
  remove: (widgetId: string) => void;
}

declare global {
  interface Window {
    turnstile?: TurnstileApi;
    onloadTurnstileCallback?: () => void;
  }
}

let siteKeyPromise: Promise<string | null> | null = null;

/** Fetch the public site key once. null means Turnstile is not configured. */
export function fetchSiteKey(): Promise<string | null> {
  if (!siteKeyPromise) {
    siteKeyPromise = fetch('/api/turnstile-config')
      .then((r) => (r.ok ? r.json() : { siteKey: null }))
      .then((d) => (typeof d?.siteKey === 'string' && d.siteKey ? d.siteKey : null))
      .catch(() => null);
  }
  return siteKeyPromise;
}

let scriptPromise: Promise<TurnstileApi | null> | null = null;

/** Load the Turnstile script once; resolves with the API (or null on failure). */
export function loadTurnstile(): Promise<TurnstileApi | null> {
  if (typeof window === 'undefined') return Promise.resolve(null);
  if (window.turnstile) return Promise.resolve(window.turnstile);
  if (!scriptPromise) {
    scriptPromise = new Promise((resolve) => {
      const existing = document.querySelector<HTMLScriptElement>(`script[src="${SCRIPT_URL}"]`);
      const done = () => resolve(window.turnstile ?? null);
      if (existing) {
        if (window.turnstile) return done();
        existing.addEventListener('load', done, { once: true });
        existing.addEventListener('error', () => resolve(null), { once: true });
        return;
      }
      const s = document.createElement('script');
      s.src = SCRIPT_URL;
      s.async = true;
      s.defer = true;
      s.addEventListener('load', done, { once: true });
      s.addEventListener('error', () => resolve(null), { once: true });
      document.head.appendChild(s);
    });
  }
  return scriptPromise;
}
