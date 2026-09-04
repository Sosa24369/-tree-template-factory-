/**
 * FIX 1 — the on-site post-submit destination.
 *
 * The source removal page redirected submitted leads to titantreeservicetx.com, an
 * unrelated company. Leads now land here, on our own page, per client.
 *
 * A real route (reachable by direct URL), so it can serve as a Google Ads destination
 * and, if a client ever needs it, a URL-based conversion trigger. P3 fires the
 * conversion on submit success rather than on this page's load, so a refresh here
 * cannot double-count.
 */

import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { ensureCallRail } from '../lib/callrail';
import { getClient } from '../lib/clientRegistry';
import { modeFor, type PageMode } from '../lib/pagePath';
import { PhoneLink } from '../components/PhoneLink';
import { SafeLogo, SafeText } from '../components/Safe';

export function ThankYou({ mode }: { mode?: PageMode } = {}) {
  const { clientSlug } = useParams();
  const found = getClient(clientSlug);
  // Same prefix rule as the landing page: a demo client is only ever reachable
  // under /demo/, a real one only under /p/. The bare /thank-you route passes no
  // mode and keeps its client-less fallback.
  const entry = found && mode && modeFor(found.client) !== mode ? undefined : found;

  // This page can be a direct landing (ad destination / refresh), so it must
  // be able to load the per-client swap script itself — the phone number here
  // needs DNI as much as the landing page's.
  useEffect(() => {
    if (entry) ensureCallRail(entry.client.tracking.callRailSwapScriptUrl);
  }, [entry]);

  if (!entry) {
    return (
      <main className="thankyou">
        <h1>Thank you</h1>
        <p>Your request has been received. We'll be in touch shortly.</p>
      </main>
    );
  }

  const { client } = entry;

  return (
    <main className="thankyou" style={{ ['--brand-primary' as string]: client.brand.primaryColor, ['--brand-accent' as string]: client.brand.accentColor }}>
      <div className="thankyou-inner">
        <SafeLogo logoUrl={client.brand.logoUrl} clientName={client.name} className="thankyou-logo" />

        <h1>Thanks — we've got your request.</h1>

        <p className="thankyou-lede">
          A member of the team will call you shortly with the next steps for your estimate.
        </p>

        <SafeText
          as="p"
          className="thankyou-area"
          value={client.serviceArea ? `Serving ${client.serviceArea}` : ''}
        />

        <p className="thankyou-call">
          Need it handled sooner? <PhoneLink client={client} placement="thank-you" />
        </p>

        <p className="thankyou-note">
          If you don't hear from us, check your voicemail and messages — we may have already tried.
        </p>
      </div>
    </main>
  );
}
