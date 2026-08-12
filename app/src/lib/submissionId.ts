/**
 * The conversion dedupe key.
 *
 * One non-PII id per (client, template, browser session), generated lazily at
 * first use and persisted in sessionStorage. It rides the `generate_lead`
 * dataLayer event as `transaction_id`, which is the field Google Ads dedupes
 * conversions on — so every way the same submission could fire twice collapses
 * to one conversion:
 *
 *   - React StrictMode double-invoking effects: the id is created inside the
 *     submit handler, not in render or an effect, so StrictMode never mints one.
 *   - remount / route back-nav / page refresh: sessionStorage survives all
 *     three in the same tab; the retried submit reuses the same id.
 *   - retry after a failed submit: same id — the retry IS the same submission.
 *
 * Deliberate consequence: a second genuine lead from the same visitor for the
 * same client+template in one session shares the id and counts as ONE ad
 * conversion. For a home-services estimate form that is the honest count —
 * the alternative double-bills the ad platform for one person.
 *
 * The id also travels to /api/lead as `submissionId`, giving the server a
 * replay/dedupe handle without any PII in it.
 */

const PREFIX = 'ttf_submission_v1';

function key(clientSlug: string, templateId: string): string {
  return `${PREFIX}:${clientSlug}:${templateId}`;
}

function mint(): string {
  try {
    return crypto.randomUUID();
  } catch {
    // Insecure context fallback — still unique enough for dedupe, still no PII.
    return `sub-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
  }
}

/** The stable id for this (client, template) in this tab session. */
export function getSubmissionId(clientSlug: string, templateId: string): string {
  const k = key(clientSlug, templateId);
  try {
    const existing = sessionStorage.getItem(k);
    if (existing) return existing;
    const fresh = mint();
    sessionStorage.setItem(k, fresh);
    return fresh;
  } catch {
    // Storage unavailable (private mode): a per-call id. Dedupe degrades to
    // per-attempt, which can overcount only in a storage-less browser —
    // acceptable over throwing away the lead.
    return mint();
  }
}
