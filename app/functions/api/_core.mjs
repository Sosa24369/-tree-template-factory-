/**
 * Lead handling core — the whole contract lives here so it is testable in plain Node
 * (import handleLead, hand it a Request + env) without spinning up Wrangler.
 *
 * Files prefixed with "_" are NOT routes in Cloudflare Pages Functions, so this is
 * shared code; the route wrapper is lead.ts.
 *
 * SECURITY MODEL — how one client can never write into another's GHL:
 *   slug (from the form) -> registry lookup -> that client's ghlLocationId + the
 *   env secret named GHL_PIT_<SLUG>. There is no code path where the location id or
 *   the token comes from the request body. An unknown slug is rejected before any
 *   token is read. A slug the client has opted out of (excludedTemplates) is rejected
 *   too, so a form can't post from a page that client does not run.
 */

import registryData from './client-crm.generated.json' with { type: 'json' };

const GHL_API = 'https://services.leadconnectorhq.com';
const GHL_VERSION = '2021-07-28';

// The generated file is { knownTemplates, clients }. Pull the pieces out so a
// lookup can never address metadata as a client.
const CLIENTS = registryData.clients ?? {};
const KNOWN_TEMPLATES = new Set(registryData.knownTemplates ?? []);

// Upper bounds on free-text values before they reach GHL. These are landing-
// page contact fields, not essays; the cap stops an oversized body from being
// forwarded verbatim and keeps control characters from riding through.
const MAX_LEN = { name: 100, email: 254, phone: 20 };
const clean = (value, max) =>
  String(value ?? '')
    // Collapse control chars (newlines, tabs, NULs) to spaces — they cannot
    // ride through into a downstream tag or log.
    .replace(/[\u0000-\u001F\u007F]/g, ' ')
    .trim()
    .slice(0, max);

/** Prototype-safe registry lookup: "__proto__"/"constructor" resolve to nothing. */
function lookupClient(slug) {
  return Object.hasOwn(CLIENTS, slug) ? CLIENTS[slug] : undefined;
}

const json = (status, body) =>
  new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });

/** slug -> env var name holding that client's Private Integration Token. */
export function envKeyForSlug(slug) {
  return 'GHL_PIT_' + String(slug).toUpperCase().replace(/[^A-Z0-9]+/g, '_');
}

const TURNSTILE_VERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';

/**
 * Verify a Cloudflare Turnstile token server-side (Q1 — bot/abuse control on
 * the open lead endpoint).
 *
 * Fail-OPEN when unconfigured, fail-CLOSED once configured:
 *   - no secret in env        -> { ok: true, skipped } — the endpoint behaves
 *     exactly as it did before Turnstile existed, so the code can ship before
 *     the keys are set without breaking the live form.
 *   - secret set, no token     -> { ok: false } — someone is posting around the
 *     widget.
 *   - secret set, token present -> ask Cloudflare; success gates the lead.
 *
 * The secret is read from env and passed straight to Cloudflare; it is never
 * logged or returned.
 */
export async function verifyTurnstile(token, secret, remoteip, fetchImpl = fetch) {
  if (!secret) return { ok: true, skipped: 'turnstile not configured' };
  if (!token || typeof token !== 'string') return { ok: false, reason: 'missing turnstile token' };

  const form = new URLSearchParams();
  form.set('secret', secret);
  form.set('response', token);
  if (remoteip) form.set('remoteip', remoteip);

  let res;
  try {
    res = await fetchImpl(TURNSTILE_VERIFY_URL, { method: 'POST', body: form });
  } catch {
    // If we cannot reach Cloudflare we fail CLOSED: an unverifiable token on a
    // configured endpoint is treated as a failure, not waved through.
    return { ok: false, reason: 'turnstile verify unreachable' };
  }
  const data = await res.json().catch(() => ({}));
  if (data && data.success) return { ok: true };
  return { ok: false, reason: 'turnstile rejected', codes: data?.['error-codes'] ?? [] };
}

/** Normalize a North-American phone to E.164, or null if it cannot be. */
export function toE164(raw) {
  const s = String(raw ?? '').trim();
  if (/^\+\d{10,15}$/.test(s)) return s;
  const digits = s.replace(/\D/g, '');
  if (digits.length === 10) return '+1' + digits;
  if (digits.length === 11 && digits.startsWith('1')) return '+' + digits;
  return null;
}

/**
 * Pure validation + mapping. Returns either { error, status } or { ghlBody, meta }.
 * Exported so the test can assert on it directly.
 */
export function buildLead(body) {
  // Honeypot: a bot filled the hidden field. Look like success, forward nothing.
  if (body.company_website) return { drop: 'honeypot' };

  const slug = String(body.clientSlug ?? '');
  const client = lookupClient(slug);
  if (!client) return { error: 'unknown client', status: 400 };

  // A non-string templateId (array, object, number) is malformed input, not a
  // page. Reject it rather than String()-coercing — an array like
  // ["storm-a","x"] would stringify to "storm-a,x" and slip past the exclusion
  // check while still not matching a known template.
  if (body.templateId != null && typeof body.templateId !== 'string') {
    return { error: 'invalid templateId', status: 400 };
  }
  const rawTemplate = String(body.templateId ?? '');
  if (rawTemplate && (client.excludedTemplates ?? []).includes(rawTemplate)) {
    return { error: 'template not offered by this client', status: 400 };
  }
  // Only a KNOWN template id may be reflected into a tag. An unrecognised value
  // (a new template mid-deploy, or an attacker probing) is tagged 'unknown'
  // rather than echoed verbatim — otherwise `lp-${templateId}` is an arbitrary
  // tag-injection sink. Not a hard reject: a legit new template must not 400
  // before the registry regenerates.
  const templateId = KNOWN_TEMPLATES.has(rawTemplate) ? rawTemplate : '';

  const firstName = clean(body.firstName, MAX_LEN.name);
  if (!firstName) return { error: 'first name is required', status: 400 };

  const phone = toE164(body.phone);
  if (!phone) return { error: 'a valid phone number is required', status: 400 };

  // Consent STATE must be present (either boolean). We record what it was; we never
  // silently assume opt-in.
  if (typeof body.consentGiven !== 'boolean') return { error: 'consent state is required', status: 400 };

  const email = clean(body.email, MAX_LEN.email);

  // Tags: the client's own tags + where the lead came from (client already in the
  // location, so template is the useful discriminator) + the consent state.
  const tags = [
    ...(client.leadTags ?? []),
    templateId ? `lp-${templateId}` : 'lp-unknown',
    body.consentGiven ? 'sms-consent-yes' : 'sms-consent-no',
  ];

  // Ad click id -> the client's custom field, IF it exists. TTT's field is not created
  // yet (null): drop it, note it, and still submit the contact — never fail a lead over
  // a missing custom field.
  const customFields = [];
  const droppedFields = [];
  const clickId = String(body.adClickId ?? '').trim();
  if (clickId) {
    if (client.adClickIdFieldId) customFields.push({ id: client.adClickIdFieldId, value: clickId });
    else droppedFields.push({ field: 'ad_click_id', value: clickId, reason: 'no GHL custom field configured for this client' });
  }

  // Full attribution set — every click id and every UTM the page captured is
  // preserved end-to-end. Each lands in the GHL payload when the client record
  // maps it to a real custom field id; otherwise it is reported as dropped so
  // the gap is visible, never silent. Field ids are created by hand in GHL
  // (docs/TRACKING_MANUAL_LIST.md) — this code never invents one.
  const ATTRIBUTION_KEYS = [
    'gclid', 'gbraid', 'wbraid', 'fbclid',
    'utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content',
  ];
  const fieldMap = client.attributionFieldIds ?? {};
  const attribution = { ...(body.clickIds ?? {}), ...(body.utm ?? {}) };
  const adClickIdSource = String(body.adClickIdSource ?? '');
  for (const key of ATTRIBUTION_KEYS) {
    const value = String(attribution[key] ?? '').trim();
    if (!value) continue;
    const fieldId = fieldMap[key];
    if (fieldId) {
      customFields.push({ id: fieldId, value: value.slice(0, 255) });
    } else if (key === adClickIdSource && value === clickId) {
      // Already delivered (or already reported dropped) as ad_click_id above —
      // repeating it here would double-report the same value.
    } else {
      droppedFields.push({ field: key, value: value.slice(0, 255), reason: 'no GHL custom field configured for this client' });
    }
  }

  const ghlBody = {
    locationId: client.ghlLocationId,
    firstName,
    lastName: clean(body.lastName, MAX_LEN.name),
    phone,
    ...(email ? { email } : {}),
    tags,
    source: client.leadSource || 'Landing Page',
    ...(customFields.length ? { customFields } : {}),
  };

  return {
    ghlBody,
    meta: {
      slug,
      envKey: envKeyForSlug(slug),
      droppedFields,
      consent: { given: body.consentGiven, text: body.consentText ?? '', timestamp: body.consentTimestamp ?? '' },
      // Non-PII dedupe key minted by the form (lib/submissionId.ts). Logged so a
      // replayed submission is traceable server-side; GHL upsert is already
      // idempotent on phone, so a replay updates rather than duplicates.
      submissionId: String(body.submissionId ?? '').slice(0, 64),
    },
  };
}

export async function handleLead(request, env) {
  let body;
  try {
    body = await request.json();
  } catch {
    return json(400, { error: 'invalid JSON body' });
  }

  // Bot gate (Q1). Runs before any GHL work. Fail-open while unconfigured, so
  // this can ship before the keys are set; fail-closed once TURNSTILE_SECRET_KEY
  // exists. The remote IP helps Cloudflare's scoring but is optional.
  const turnstile = await verifyTurnstile(
    body.turnstileToken,
    env.TURNSTILE_SECRET_KEY,
    request.headers.get('CF-Connecting-IP') || undefined
  );
  if (!turnstile.ok) {
    // Generic 403 — do not tell a bot which check it failed.
    return json(403, { error: 'verification failed' });
  }

  const built = buildLead(body);

  if (built.drop) return json(200, { ok: true, contactId: null, dropped: built.drop });
  if (built.error) return json(built.status, { error: built.error });

  const { ghlBody, meta } = built;

  // Dry run: log exactly what WOULD be sent (incl. which env secret and consent), post
  // nothing. This is how the wiring is proven without touching a real GHL location.
  if (env.GHL_DRY_RUN) {
    console.log('[GHL_DRY_RUN] POST /contacts/upsert ' + JSON.stringify({ envKey: meta.envKey, body: ghlBody, droppedFields: meta.droppedFields, consent: meta.consent, submissionId: meta.submissionId }));
    return json(200, { ok: true, contactId: null, dryRun: true, droppedFields: meta.droppedFields });
  }

  const token = env[meta.envKey];
  if (!token) {
    // No token configured for this client — refuse rather than send to the wrong place.
    console.error(`no token in ${meta.envKey}; refusing to submit ${meta.slug}`);
    return json(503, { error: 'lead routing not configured for this client' });
  }

  let res;
  try {
    res = await fetch(`${GHL_API}/contacts/upsert`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        Version: GHL_VERSION,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(ghlBody),
    });
  } catch (e) {
    console.error('GHL fetch threw', String(e));
    return json(502, { error: 'could not reach the CRM' });
  }

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    console.error('GHL upsert failed', res.status, text.slice(0, 300));
    return json(502, { error: 'the CRM rejected the lead' });
  }

  const data = await res.json().catch(() => ({}));
  const contactId = data?.contact?.id ?? data?.id ?? null;
  return json(200, { ok: true, contactId, droppedFields: meta.droppedFields });
}
