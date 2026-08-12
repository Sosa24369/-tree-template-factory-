/**
 * The single seam between the templates and the CRM.
 *
 * P1: placeholder. P4 replaces the body of submitLead with a POST to a Cloudflare
 * Pages Function that holds the GHL token server-side. Nothing else in the app changes.
 */

import type { ResolvedClient } from '../schema/resolve';
import type { ClickIdParam } from './attribution';

export interface LeadPayload {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;

  /** FIX 4 — consent record submitted with the lead, not just rendered. */
  consentGiven: boolean;
  consentText: string;
  consentTimestamp: string;

  /** FIX 2 — click-level attribution on every template. */
  adClickId: string;
  adClickIdSource: string;
  clickIds: Partial<Record<ClickIdParam, string>>;
  utm: Record<string, string>;

  company_website: string; // honeypot
  clientSlug: string;
  /** Which template the lead came from — the Function tags with it and rejects a
   *  submit from a template the client has opted out of. */
  templateId: string;
  /** Non-PII dedupe key (see lib/submissionId.ts). Same id on every retry of
   *  the same submission; rides the dataLayer event as transaction_id and
   *  gives the server a replay handle. */
  submissionId: string;
}

export interface LeadResult {
  ok: true;
  contactId: string | null;
}

/**
 * POSTs the lead to the same-origin Pages Function at /api/lead, which does the GHL
 * mapping server-side (slug -> location id -> per-client token). The browser never
 * sees a token or a location id: the seam is a fetch, and everything sensitive is on
 * the far side of it.
 *
 * The `client` argument is kept for signature stability (and a dev log); the Function
 * routes by `payload.clientSlug`, so nothing client-specific has to be trusted from the
 * browser beyond the slug, which the Function validates against its own registry.
 *
 * Throws on any non-2xx so the form falls into its error state, which offers the phone
 * number — a submit that fails must never look like a submit that succeeded.
 */
export async function submitLead(payload: LeadPayload, client: ResolvedClient): Promise<LeadResult> {
  if (import.meta.env.DEV) {
    console.info('[lead] POST /api/lead for %s (%s)', client.slug, payload.templateId || 'no-template');
  }

  const res = await fetch('/api/lead', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    let detail = '';
    try {
      detail = ((await res.json()) as { error?: string })?.error ?? '';
    } catch {
      /* non-JSON error body */
    }
    throw new Error(detail || `lead submit failed (${res.status})`);
  }

  const data = (await res.json().catch(() => ({}))) as { contactId?: string | null };
  return { ok: true, contactId: data?.contactId ?? null };
}
