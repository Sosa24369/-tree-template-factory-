/**
 * FIX 2 — ad click id capture on EVERY template.
 *
 * Only the J Valdez trimming page captured a click id; the Texas Tree Tops pages
 * captured none, so those campaigns had no click-level attribution at all.
 *
 * Captures gclid / gbraid / wbraid / fbclid from the query string and persists them
 * for the session, so the value survives navigation to the thank-you page and back,
 * and survives a visitor wandering between templates.
 */

export const CLICK_ID_PARAMS = ['gclid', 'gbraid', 'wbraid', 'fbclid'] as const;
export type ClickIdParam = (typeof CLICK_ID_PARAMS)[number];

const UTM_PARAMS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'] as const;

const STORE_KEY = 'ttf_attribution_v1';

export interface Attribution {
  /** The single value that maps to GHL's contact.ad_click_id — first click id found, by priority. */
  adClickId: string;
  /** Which parameter supplied adClickId, so the CRM record shows the network. */
  adClickIdSource: ClickIdParam | '';
  /** Every click id seen, kept individually as well. */
  clickIds: Partial<Record<ClickIdParam, string>>;
  utm: Partial<Record<(typeof UTM_PARAMS)[number], string>>;
  landingPage: string;
  referrer: string;
}

const EMPTY: Attribution = {
  adClickId: '',
  adClickIdSource: '',
  clickIds: {},
  utm: {},
  landingPage: '',
  referrer: '',
};

function read(): Attribution | null {
  try {
    const raw = sessionStorage.getItem(STORE_KEY);
    return raw ? { ...EMPTY, ...JSON.parse(raw) } : null;
  } catch {
    return null; // private mode / storage disabled — never throw over attribution
  }
}

function write(a: Attribution): void {
  try {
    sessionStorage.setItem(STORE_KEY, JSON.stringify(a));
  } catch {
    /* non-fatal */
  }
}

/**
 * Call once on app mount. First touch wins: a click id already captured this
 * session is never overwritten by a later param-less navigation, but a NEW click
 * id (a second ad click in the same session) does replace it, because that is the
 * click the conversion should be credited to.
 */
export function captureAttribution(search = window.location.search): Attribution {
  const params = new URLSearchParams(search);
  const existing = read() ?? { ...EMPTY };

  const clickIds: Partial<Record<ClickIdParam, string>> = { ...existing.clickIds };
  let foundNew = false;
  for (const key of CLICK_ID_PARAMS) {
    const v = params.get(key);
    if (v && v.trim()) {
      clickIds[key] = v.trim();
      foundNew = true;
    }
  }

  // Priority: Google's own ids before Meta's. gclid is the common case; gbraid and
  // wbraid replace it on iOS app / web-to-app journeys.
  const priority: ClickIdParam[] = ['gclid', 'gbraid', 'wbraid', 'fbclid'];
  const source = priority.find((k) => clickIds[k]) ?? '';

  const utm = { ...existing.utm };
  for (const key of UTM_PARAMS) {
    const v = params.get(key);
    if (v) utm[key] = v;
  }

  const next: Attribution = {
    adClickId: source ? clickIds[source]! : existing.adClickId,
    adClickIdSource: source || existing.adClickIdSource,
    clickIds,
    utm,
    landingPage: existing.landingPage || window.location.pathname + window.location.search,
    referrer: existing.referrer || document.referrer || '',
  };

  if (foundNew || !read()) write(next);
  return next;
}

export function getAttribution(): Attribution {
  return read() ?? { ...EMPTY };
}
