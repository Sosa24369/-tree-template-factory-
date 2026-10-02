/**
 * The factory's lead payload → the body Datum's public endpoint takes (POST /public/v1/sites/<slug>/submissions).
 *
 * Files prefixed with "_" are not routes. lead.ts calls relayLead inside context.waitUntil, only after handleLead
 * has accepted the lead (GHL has it and the visitor's response is decided). The tenant is NOT in the body: Datum
 * resolves it from the slug, which handleLead has already checked against this site's registry.
 *
 * Datum's form for these pages is `lead` (fields first_name, last_name, phone, email; one SMS consent checkbox).
 */
import { relayToDatum, text } from './_relay.mjs';

export const FORM_KEY = 'lead';

const orNull = (v) => (v ? v : null);

/** utm_*, click ids and the extra ad parameters the page captured, flattened to { param: value }. */
function trackingParams(lead) {
  const out = {};
  for (const source of [lead.clickIds, lead.utm, lead.adParams])
    if (source && typeof source === 'object' && !Array.isArray(source))
      for (const [k, v] of Object.entries(source)) {
        const value = text(v, 500);
        if (/^[a-z][a-z0-9_]{0,63}$/i.test(k) && value) out[k] = value;
      }
  return out;
}

/**
 * Consent: the SMS checkbox with the words the page showed, ticked or not. A page from before this change sends the
 * words only when ticked (consentText); for an unticked box it sent none, and then no entry is sent rather than an
 * invented text.
 */
export function leadToDatum(lead, request, now = new Date()) {
  const shown = text(lead.consentShownText, 1000) || text(lead.consentText, 1000);
  const fields = {};
  for (const [key, value] of [
    ['first_name', lead.firstName],
    ['last_name', lead.lastName],
    ['phone', lead.phone],
    ['email', lead.email],
  ]) {
    const v = text(value, 254);
    if (v) fields[key] = v;
  }
  return {
    form: FORM_KEY,
    submittedAt: now.toISOString(),
    externalId: orNull(text(lead.submissionId, 64)),
    fields,
    consents: shown ? [{ key: 'sms', checked: lead.consentGiven === true, text: shown }] : [],
    page: {
      url: orNull(text(lead.pageUrl, 2000)),
      ip: request.headers.get('CF-Connecting-IP') || null,
      userAgent: orNull(text(request.headers.get('User-Agent') ?? '', 1000)),
    },
    attribution: {
      params: trackingParams(lead),
      landingPage: orNull(text(lead.landingPage, 2000)),
      referrer: orNull(text(lead.referrer, 2000)),
      sessionId: orNull(text(lead.sessionId, 200)),
      trackingNumber: orNull(text(lead.trackingNumber, 40)),
    },
  };
}

/**
 * Relays one accepted lead for `slug`. Never throws.
 * @param {{ env: Record<string, any>, slug: string, lead: Record<string, any>, request: Request, fetchImpl?: typeof fetch, now?: Date, timeoutMs?: number }} args
 */
export function relayLead({ env, slug, lead, request, fetchImpl, now, timeoutMs }) {
  return relayToDatum({
    env,
    slug,
    submissionId: lead.submissionId,
    datumBody: leadToDatum(lead, request, now),
    ...(fetchImpl ? { fetchImpl } : {}),
    ...(timeoutMs ? { timeoutMs } : {}),
  });
}
