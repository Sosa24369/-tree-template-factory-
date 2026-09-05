/**
 * "CAN THIS CLIENT TAKE A REAL LEAD YET?"
 *
 * Creating a client in the studio writes a record and builds ten pages. It does NOT
 * wire GoHighLevel: the location id is created by hand in GHL, and the Private
 * Integration Token is a Cloudflare Pages environment secret that only the account
 * owner can set. Neither can be done from here, and neither SHOULD be — a token that
 * the studio could write is a token the studio could leak.
 *
 * So instead of half-attempting it, this is the checklist. It reads the record and
 * says exactly what is still missing, in the order it has to be done, with the exact
 * value to paste where. Everything it cannot verify from the record — the token, the
 * GHL custom fields — is stated as a manual step rather than shown as a tick.
 *
 * BLOCKERS stop leads reaching the CRM at all. WARNINGS are things that cost money or
 * compliance later (no A2P links means no SMS; no GTM means no conversions).
 */

import type { Json } from './lib';

type Level = 'blocker' | 'warning' | 'manual' | 'ok';

interface Item {
  level: Level;
  label: string;
  detail: string;
}

/** Same rule as the lead Function's envKeyForSlug — one client, one secret name. */
export function envKeyForSlug(slug: string): string {
  return 'GHL_PIT_' + String(slug).toUpperCase().replace(/[^A-Z0-9]+/g, '_');
}

/** The reserved fictional range the demo uses. A real client must not ship one. */
const NON_ROUTABLE = /^\+1555/;

export function readiness(record: Json): Item[] {
  const items: Item[] = [];
  const slug = record.slug ?? '';
  const push = (level: Level, label: string, detail: string) => items.push({ level, label, detail });

  if (record.isDemo) {
    push(
      'ok',
      'Demo account — no CRM wiring needed',
      'This client is a demo. Its pages are noindex and the lead Function refuses their submissions before reading any token, so there is nothing to wire and nothing to leak.'
    );
    return items;
  }

  /* ---- the lead path ---- */
  const loc = record.crm?.ghlLocationId?.trim?.() ?? '';
  if (!loc) push('blocker', 'GHL location id', 'Create the sub-account in GoHighLevel and paste its location id into CRM & tracking. Until then every lead is refused with "lead routing not configured".');
  else push('ok', 'GHL location id', loc);

  push(
    'manual',
    `Cloudflare secret ${envKeyForSlug(slug)}`,
    'Create a Private Integration Token in this client’s GHL sub-account, then add it in the Cloudflare Pages project under Settings → Environment variables, as a SECRET with exactly this name. The studio cannot read or write it — that is deliberate: the token exists only in the Function’s server context, never in the repo and never in a browser.'
  );

  const e164 = record.phone?.e164?.trim?.() ?? '';
  if (!e164) push('blocker', 'Phone number', 'Every call CTA renders from phone.e164. Without it the buttons do not render.');
  else if (!/^\+\d{10,15}$/.test(e164)) push('blocker', 'Phone number is not E.164', `"${e164}" — expected +1XXXXXXXXXX. Display text and the tel: link both derive from this one value.`);
  else if (NON_ROUTABLE.test(e164)) push('blocker', 'Phone number is a fictional 555 number', `${e164} cannot ring anyone. This is the demo range — a real client needs their real line.`);
  else push('ok', 'Phone number', e164);

  const ty = record.leadDestination?.thankYouUrl?.trim?.() ?? '';
  if (!ty) push('blocker', 'Thank-you destination', 'Where a submitted lead lands. Keep it relative unless the client genuinely owns an off-domain URL.');
  else push('ok', 'Thank-you destination', ty);

  /* ---- compliance ---- */
  if (!record.consent?.smsCopy?.trim?.()) push('blocker', 'SMS opt-in copy', 'The consent label beside the form checkbox. Required — the consent state is submitted to GHL with every lead.');
  else push('ok', 'SMS opt-in copy', 'set');

  const privacy = record.consent?.privacyPolicyUrl?.trim?.() ?? '';
  const terms = record.consent?.termsOfServiceUrl?.trim?.() ?? '';
  if (!privacy || !terms) {
    push(
      'warning',
      'Privacy Policy and Terms URLs',
      'Both are blank. Leads still submit, but A2P registration requires a policy that NAMES this business — the shared agency URL must not be reused. No A2P means no SMS follow-up.'
    );
  } else push('ok', 'Privacy Policy and Terms URLs', 'both set');

  /* ---- measurement ---- */
  const gtm = record.tracking?.gtmContainerId ?? '';
  if (!gtm) push('warning', 'GTM container', 'No container id, so no conversion fires and the ad account is optimising blind. Per client — never share a container.');
  else if (!/^GTM-[A-Z0-9]{4,10}$/.test(gtm)) push('blocker', 'GTM container id is malformed', `"${gtm}" is not GTM-shaped, so the prerenderer will skip injection with a build warning.`);
  else push('ok', 'GTM container', gtm);

  if (!record.crm?.adClickIdFieldId) {
    push('warning', 'GHL ad-click-id custom field', 'Not mapped. Click ids are still captured and reported as droppedFields, but they will not land on a GHL field until the custom field exists and its id is pasted in.');
  } else push('ok', 'GHL ad-click-id custom field', record.crm.adClickIdFieldId);

  const asset = record.phone?.googleAdsCallAsset?.trim?.() ?? '';
  if (!asset) push('warning', 'Google Ads call-asset number', 'Blank, so nothing renders. Needed only if this client runs a call asset — Google verifies it by finding the number visibly on the landing page.');
  else if (asset === e164) push('warning', 'Google Ads call-asset number', 'Same as the CTA number, so the footer line just repeats it. Legal, but probably not intended.');
  else push('ok', 'Google Ads call-asset number', asset);

  /* ---- content ---- */
  const photoCount = Object.values(record.photos ?? {}).reduce((n: number, list: any) => n + (list?.length ?? 0), 0);
  if (!photoCount) push('warning', 'Photos', 'No photos on record. Every gallery and results grid self-hides (R5), so the pages render — but they render thin.');
  else push('ok', 'Photos', `${photoCount} across ${Object.keys(record.photos ?? {}).length} service set(s)`);

  if (!(record.reviews ?? []).length) push('warning', 'Reviews', 'None transcribed, so every review block self-hides. Transcribe them VERBATIM from the client’s own profile — never write or tidy one.');
  else push('ok', 'Reviews', `${record.reviews.length} on record`);

  if (!(record.serviceAreaList ?? []).length) push('warning', 'Service areas', 'Empty, so the areas grid and marquee hide.');
  else push('ok', 'Service areas', `${record.serviceAreaList.length} listed`);

  if (!record.brand?.logoUrl) push('warning', 'Logo', 'None, so the header renders the company name as a wordmark. That is a supported state, not a bug.');
  else push('ok', 'Logo', record.brand.logoUrl);

  return items;
}

const ICON: Record<Level, string> = { blocker: '✗', warning: '⚠', manual: '☐', ok: '✓' };

export function Readiness({ record }: { record: Json }) {
  const items = readiness(record);
  const blockers = items.filter((i) => i.level === 'blocker');
  const manual = items.filter((i) => i.level === 'manual');
  const warnings = items.filter((i) => i.level === 'warning');

  return (
    <details className="dash-readiness" open={blockers.length > 0}>
      <summary>
        Ready for real leads?{' '}
        {blockers.length > 0 ? (
          <span className="dash-pill dash-pill--err">{blockers.length} blocker{blockers.length === 1 ? '' : 's'}</span>
        ) : (
          <span className="dash-pill dash-pill--ok">no blockers</span>
        )}
        {manual.length > 0 && <span className="dash-pill">{manual.length} manual step{manual.length === 1 ? '' : 's'}</span>}
        {warnings.length > 0 && <span className="dash-pill dash-pill--warn">{warnings.length} warning{warnings.length === 1 ? '' : 's'}</span>}
      </summary>
      <ul className="dash-readiness-list">
        {items.map((i, n) => (
          <li key={n} className={`dash-ready dash-ready--${i.level}`}>
            <span className="dash-ready-icon" aria-hidden="true">{ICON[i.level]}</span>
            <span className="dash-ready-body">
              <strong>{i.label}</strong>
              <span className="dash-ready-detail">{i.detail}</span>
            </span>
          </li>
        ))}
      </ul>
    </details>
  );
}
