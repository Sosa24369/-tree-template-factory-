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
}

export interface LeadResult {
  ok: true;
  contactId: string | null;
}

/**
 * P4 will map this payload onto GHL's Upsert Contact body:
 *   locationId       <- client.crm.ghlLocationId
 *   tags             <- client.crm.leadTags
 *   source           <- client.crm.leadSource
 *   customFields[]   <- { id: client.crm.adClickIdFieldId, value: payload.adClickId }
 *                       plus the consent fields
 * The mapping lives server-side so the token never reaches the browser.
 */
export async function submitLead(payload: LeadPayload, client: ResolvedClient): Promise<LeadResult> {
  // ─────────────────────────────────────────────────────────────────
  // PHASE 4 replaces this body with:
  //   const res = await fetch('/api/lead', { method: 'POST', ... })
  // ─────────────────────────────────────────────────────────────────
  if (import.meta.env.DEV) {
    console.info('[P1 placeholder] lead for %s -> GHL location %s', client.slug, client.crm.ghlLocationId || '(unset)', payload);
  }
  // Real latency so the submitting state, the disabled button and the
  // double-submit guard are genuinely exercised before P4 wires the API.
  await new Promise((r) => setTimeout(r, 600));
  return { ok: true, contactId: null };
}
