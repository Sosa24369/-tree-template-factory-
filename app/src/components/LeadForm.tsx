/**
 * The one lead form used by every template.
 *
 * Carries three of the four P0 corrections:
 *   FIX 1 — post-submit destination comes from client config and is guarded against
 *           off-domain redirects (resolveClient does the guarding).
 *   FIX 2 — hidden ad-click-id fields on EVERY template, matching the J Valdez
 *           pattern: a real input hidden by the `d-none` class, not removed and not
 *           type="hidden", so the field is present in the DOM exactly as GHL renders it.
 *   FIX 4 — explicit SMS consent opt-in with Privacy/Terms links, submitted to GHL.
 *
 * Submission itself is P4. `submitLead` is the single seam; nothing else changes.
 */

import { useEffect, useRef, useState, type FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import type { ResolvedClient } from '../schema/resolve';
import { getAttribution } from '../lib/attribution';
import { getSubmissionId } from '../lib/submissionId';
import { submitLead, type LeadPayload } from '../lib/leads';
import { PhoneLink } from './PhoneLink';

export interface LeadFormLabels {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  submit: string;
}

interface Props {
  client: ResolvedClient;
  labels: LeadFormLabels;
  className?: string;
}

type Status = 'idle' | 'submitting' | 'error';

const EMPTY = { firstName: '', lastName: '', phone: '', email: '', consent: false, company_website: '' };

export function LeadForm({ client, labels, className }: Props) {
  const [values, setValues] = useState(EMPTY);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<Status>('idle');
  // A ref, not the status state, is the real double-submit guard: two rapid
  // clicks (or a click + Enter) both run onSubmit before React re-renders, so
  // both would read status==='idle'. A ref updates synchronously and closes
  // that race. The submissionId dedupe and GHL's phone-upsert are backstops;
  // this stops the second POST from ever leaving.
  const inFlight = useRef(false);
  const navigate = useNavigate();
  const { clientSlug, templateId } = useParams();

  /**
   * A relative thankYouUrl stays inside the current client+template so the
   * confirmation page knows whose brand and phone number to render. An absolute
   * URL has already survived the external-domain guard in resolveClient, so it is
   * an explicit, deliberate off-site destination.
   */
  function destination(): string {
    const url = client.safeThankYouUrl;
    if (/^[a-z][a-z0-9+.-]*:\/\//i.test(url)) return url;
    return clientSlug && templateId ? `/p/${clientSlug}/${templateId}${url}` : url;
  }

  function validate(v: typeof EMPTY): Record<string, string> {
    const e: Record<string, string> = {};
    if (!v.firstName.trim()) e.firstName = 'Please enter your first name.';
    const digits = v.phone.replace(/\D/g, '');
    if (!digits) e.phone = 'Please enter your phone number.';
    else if (digits.length < 10) e.phone = 'That phone number looks too short.';
    if (v.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.email.trim())) e.email = 'That email address looks incomplete.';
    if (client.consent.required && !v.consent) e.consent = 'Please agree before we can text you.';
    return e;
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (inFlight.current || status === 'submitting') return; // double-submit guard

    const found = validate(values);
    setErrors(found);
    if (Object.keys(found).length) {
      document.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus();
      return;
    }

    inFlight.current = true;
    setStatus('submitting');
    const attribution = getAttribution();
    // Minted in the submit handler (never in render/effects, so StrictMode
    // cannot double-mint) and stable across retry, refresh and back-nav — the
    // key Google Ads dedupes the conversion on.
    const submissionId = getSubmissionId(client.slug, templateId ?? '');
    const payload: LeadPayload = {
      firstName: values.firstName.trim(),
      lastName: values.lastName.trim(),
      phone: values.phone.trim(),
      email: values.email.trim(),
      consentGiven: values.consent,
      consentText: values.consent ? client.consent.smsCopy : '',
      consentTimestamp: values.consent ? new Date().toISOString() : '',
      adClickId: attribution.adClickId,
      adClickIdSource: attribution.adClickIdSource,
      clickIds: attribution.clickIds,
      utm: attribution.utm,
      company_website: values.company_website, // honeypot
      clientSlug: client.slug,
      templateId: templateId ?? '',
      submissionId,
    };

    try {
      await submitLead(payload, client);
      // Fire the conversion event ONLY on genuine CRM success, before navigation, so a
      // failed submit never fires it and a refresh of the thank-you page cannot
      // double-count. This is the event a GTM tag turns into the ad conversion.
      window.dataLayer?.push({
        event: 'generate_lead',
        client: client.slug,
        template: templateId ?? 'unknown',
        placement: 'lead-form',
        // Ads dedupes on transaction_id: a retried/refreshed/back-navved
        // resubmission carries the same id and counts once.
        transaction_id: submissionId,
        submission_id: submissionId,
      });
      const to = destination();
      if (/^[a-z][a-z0-9+.-]*:\/\//i.test(to)) window.location.assign(to);
      else navigate(to);
    } catch {
      // A failed submit must not look like a success. The error state renders the
      // client's phone number as a "call us" fallback, so the lead is not lost.
      // Release the latch so a genuine retry is possible; a retry reuses the
      // same submissionId, so it still counts as one conversion.
      inFlight.current = false;
      setStatus('error');
    }
    // On success the latch stays closed: navigation is imminent and no second
    // submit from this mounted form should ever fire.
  }

  const set = (patch: Partial<typeof EMPTY>) => setValues((v) => ({ ...v, ...patch }));

  // Attribution is captured before the first render (see main.tsx), so this is
  // populated immediately. The effect re-reads it after a client-side navigation
  // that carries a new click id, so the hidden fields never go stale.
  const [attribution, setAttribution] = useState(getAttribution);
  useEffect(() => {
    const current = getAttribution();
    if (current.adClickId !== attribution.adClickId) setAttribution(current);
  }, [clientSlug, templateId, attribution.adClickId]);

  return (
    <form className={className} onSubmit={onSubmit} noValidate>
      <div className="field">
        <label htmlFor="ttf-first">{labels.firstName}</label>
        <input
          id="ttf-first" name="first_name" type="text" autoComplete="given-name"
          value={values.firstName} onChange={(e) => set({ firstName: e.target.value })}
          aria-invalid={Boolean(errors.firstName)}
          aria-describedby={errors.firstName ? 'ttf-first-err' : undefined}
        />
        {errors.firstName && <p id="ttf-first-err" className="field-error" role="alert">{errors.firstName}</p>}
      </div>

      <div className="field">
        <label htmlFor="ttf-last">{labels.lastName}</label>
        <input
          id="ttf-last" name="last_name" type="text" autoComplete="family-name"
          value={values.lastName} onChange={(e) => set({ lastName: e.target.value })}
        />
      </div>

      <div className="field">
        <label htmlFor="ttf-phone">{labels.phone}</label>
        <input
          id="ttf-phone" name="phone" type="tel" inputMode="tel" autoComplete="tel"
          value={values.phone} onChange={(e) => set({ phone: e.target.value })}
          aria-invalid={Boolean(errors.phone)}
          aria-describedby={errors.phone ? 'ttf-phone-err' : undefined}
        />
        {errors.phone && <p id="ttf-phone-err" className="field-error" role="alert">{errors.phone}</p>}
      </div>

      <div className="field">
        <label htmlFor="ttf-email">{labels.email}</label>
        <input
          id="ttf-email" name="email" type="email" inputMode="email" autoComplete="email"
          value={values.email} onChange={(e) => set({ email: e.target.value })}
          aria-invalid={Boolean(errors.email)}
          aria-describedby={errors.email ? 'ttf-email-err' : undefined}
        />
        {errors.email && <p id="ttf-email-err" className="field-error" role="alert">{errors.email}</p>}
      </div>

      {/* FIX 2 — ad click id fields. Present on EVERY template, hidden with `d-none`
          exactly as the J Valdez source form hides its Ad Click ID field. */}
      <div className="d-none field-container" aria-hidden="true">
        <label htmlFor="ttf-ad-click-id">Ad Click ID</label>
        <input
          id="ttf-ad-click-id" name="ad_click_id" type="text" tabIndex={-1} readOnly
          data-q="gclid" data-ghl-field={client.crm.adClickIdFieldId ?? ''}
          value={attribution.adClickId}
        />
        <input name="ad_click_id_source" type="text" tabIndex={-1} readOnly value={attribution.adClickIdSource} />
        <input name="gclid"  type="text" tabIndex={-1} readOnly value={attribution.clickIds.gclid ?? ''} />
        <input name="gbraid" type="text" tabIndex={-1} readOnly value={attribution.clickIds.gbraid ?? ''} />
        <input name="wbraid" type="text" tabIndex={-1} readOnly value={attribution.clickIds.wbraid ?? ''} />
        <input name="fbclid" type="text" tabIndex={-1} readOnly value={attribution.clickIds.fbclid ?? ''} />
      </div>

      {/* Honeypot — bots fill it, humans cannot see or tab to it. */}
      <input
        type="text" name="company_website" tabIndex={-1} autoComplete="off"
        aria-hidden="true" className="visually-hidden"
        value={values.company_website} onChange={(e) => set({ company_website: e.target.value })}
      />

      {/* FIX 4 — A2P consent. */}
      <div className="field consent-field">
        <label className="consent-label" htmlFor="ttf-consent">
          <input
            id="ttf-consent" name="sms_consent" type="checkbox"
            checked={values.consent} onChange={(e) => set({ consent: e.target.checked })}
            aria-invalid={Boolean(errors.consent)}
            aria-describedby={errors.consent ? 'ttf-consent-err' : undefined}
          />
          <span className="consent-copy">
            {client.consent.smsCopy}
            {(client.consent.privacyPolicyUrl || client.consent.termsOfServiceUrl) && ' '}
            {client.consent.privacyPolicyUrl && (
              <a href={client.consent.privacyPolicyUrl} target="_blank" rel="noopener noreferrer">Privacy Policy</a>
            )}
            {client.consent.privacyPolicyUrl && client.consent.termsOfServiceUrl && ' · '}
            {client.consent.termsOfServiceUrl && (
              <a href={client.consent.termsOfServiceUrl} target="_blank" rel="noopener noreferrer">Terms of Service</a>
            )}
          </span>
        </label>
        {errors.consent && <p id="ttf-consent-err" className="field-error" role="alert">{errors.consent}</p>}
      </div>

      <button type="submit" className="btn btn-primary" disabled={status === 'submitting'}>
        {status === 'submitting' ? 'Sending…' : labels.submit}
      </button>

      {status === 'error' && (
        <p className="form-error" role="alert">
          Something went wrong sending your request. Please call{' '}
          <PhoneLink client={client} placement="form-error" /> and we'll take care of it.
        </p>
      )}
    </form>
  );
}
