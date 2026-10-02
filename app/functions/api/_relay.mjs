/**
 * Datum relay — copies a lead that a site's Function has already handed to GoHighLevel on to Datum.
 *
 * One source (Datum's integrations/site-relay/relay/_relay.mjs), copied byte for byte into each site's
 * functions/api/ and into the datum-lead-relay consumer Worker. Files prefixed with "_" are not Pages routes.
 *
 *   flag     DATUM_DUAL_WRITE_<SLUG>=on, per site; anything else (or unset) is off and nothing here runs
 *   where    DATUM_API_URL + /public/v1/sites/<slug>/submissions — the slug is the site's own, never the body's
 *   auth     X-Datum-Signature: v1=<hex HMAC-SHA256(DATUM_SITE_SECRET_<SLUG>, exact body)>
 *   key      Idempotency-Key: <submissionId>:<first 32 hex of the body's SHA-256>, so a retry replays and a
 *            changed body is a new submission
 *   retry    one direct attempt (4 s budget) inside waitUntil; anything but a 2xx is put on DATUM_LEAD_QUEUE as the
 *            same signed message, and the consumer Worker retries it with backoff
 *
 * The caller runs relayToDatum inside context.waitUntil AFTER the visitor's response is decided, so neither the GHL
 * write nor the visitor waits on Datum. Nothing here throws; logs carry the slug, key and status, never the lead.
 */

export const DIRECT_BUDGET_MS = 4000;
const PERMANENT = new Set([400, 401, 403, 404, 405, 409, 410, 413, 415, 422]);

/** slug -> variable suffix: texas-tree-tops -> TEXAS_TREE_TOPS (the factory's GHL_PIT_<SLUG> rule). */
export const envSuffix = (slug) => String(slug).toUpperCase().replace(/[^A-Z0-9]+/g, '_');
export const flagName = (slug) => `DATUM_DUAL_WRITE_${envSuffix(slug)}`;
export const secretName = (slug) => `DATUM_SITE_SECRET_${envSuffix(slug)}`;

/** The dual-write is on for this site only when its flag is exactly "on". */
export function dualWriteOn(env, slug) {
  return Boolean(slug) && env?.[flagName(slug)] === 'on';
}

/** Whether any site's flag is on. When none is, a site's handler runs exactly as before the dual-write existed. */
export function anyDualWriteOn(env) {
  return Object.keys(env ?? {}).some((k) => k.startsWith('DATUM_DUAL_WRITE_') && env[k] === 'on');
}

const hex = (buf) => [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
const utf8 = (text) => new TextEncoder().encode(text);

export async function sha256Hex(text) {
  return hex(await crypto.subtle.digest('SHA-256', utf8(text)));
}

export async function signBody(secret, body) {
  const key = await crypto.subtle.importKey('raw', utf8(secret), { name: 'HMAC', hash: 'SHA-256' }, false, [
    'sign',
  ]);
  return `v1=${hex(await crypto.subtle.sign('HMAC', key, utf8(body)))}`;
}

/** A trimmed string capped at max, or '' for anything that is not a string. */
export const text = (v, max) => (typeof v === 'string' ? v.trim().slice(0, max) : '');

/** The one message every attempt sends, byte for byte. */
export async function relayMessage(slug, submissionId, datumBody, secret) {
  const body = JSON.stringify(datumBody);
  const sub = text(submissionId, 64).replace(/[^A-Za-z0-9._-]/g, '') || 'nosub';
  return {
    slug,
    key: `${sub}:${(await sha256Hex(body)).slice(0, 32)}`,
    body,
    signature: await signBody(secret, body),
  };
}

/**
 * One POST of a relay message: { outcome: 'done' | 'retry' | 'permanent', status }. Never throws.
 * @param {string} apiUrl
 * @param {{ slug: string, key: string, body: string, signature: string }} message
 * @param {{ fetchImpl?: typeof fetch, timeoutMs?: number }} [options]
 */
export async function postToDatum(apiUrl, message, { fetchImpl = fetch, timeoutMs = DIRECT_BUDGET_MS } = {}) {
  try {
    const res = await fetchImpl(
      `${String(apiUrl).replace(/\/$/, '')}/public/v1/sites/${encodeURIComponent(message.slug)}/submissions`,
      {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'idempotency-key': message.key,
          'x-datum-signature': message.signature,
        },
        body: message.body,
        signal: AbortSignal.timeout(timeoutMs),
      },
    );
    if (res.ok) return { outcome: 'done', status: res.status };
    return { outcome: PERMANENT.has(res.status) ? 'permanent' : 'retry', status: res.status };
  } catch (e) {
    return { outcome: 'retry', status: 0, error: e?.name === 'TimeoutError' ? 'timeout' : 'network' };
  }
}

/**
 * The dual-write for one accepted lead: the direct attempt, then the queue for anything but success.
 * Returns what happened ('done' | 'queued' | 'lost' | 'unconfigured' | 'error'); never throws.
 * @param {{ env: Record<string, any>, slug: string, submissionId?: unknown, datumBody: object, fetchImpl?: typeof fetch, timeoutMs?: number }} args
 */
export async function relayToDatum({ env, slug, submissionId, datumBody, fetchImpl = fetch, timeoutMs }) {
  try {
    const secret = env[secretName(slug)];
    if (!env.DATUM_API_URL || !secret) {
      console.error(
        `[datum] relay not configured for ${slug}: ${!env.DATUM_API_URL ? 'DATUM_API_URL' : secretName(slug)} unset`,
      );
      return { outcome: 'unconfigured' };
    }
    const message = await relayMessage(slug, submissionId, datumBody, secret);
    const direct = await postToDatum(env.DATUM_API_URL, message, {
      fetchImpl,
      ...(timeoutMs ? { timeoutMs } : {}),
    });
    if (direct.outcome === 'done') return { outcome: 'done', key: message.key, message };
    if (!env.DATUM_LEAD_QUEUE) {
      console.error(`[datum] relay failed for ${slug} key=${message.key} status=${direct.status}; no queue bound`);
      return { outcome: 'lost', key: message.key, message };
    }
    await env.DATUM_LEAD_QUEUE.send(message);
    console.warn(`[datum] relay queued for ${slug} key=${message.key} status=${direct.status}`);
    return { outcome: 'queued', key: message.key, status: direct.status, message };
  } catch (e) {
    console.error(`[datum] relay error for ${slug}: ${e?.name ?? 'Error'}`);
    return { outcome: 'error' };
  }
}
