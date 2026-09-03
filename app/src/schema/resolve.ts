/**
 * Turns a raw client JSON file into a fully-populated record that templates can
 * render without defensive checks scattered through every component.
 *
 * Two jobs:
 *  1. Fill defaults so a half-filled record still renders (R5).
 *  2. Enforce the guards the schema promises — most importantly that a lead is
 *     never redirected off-domain unless someone explicitly allowed it (FIX 1).
 */

import { CLIENT_DEFAULTS, type ClientRecord, type TemplateId } from './client';
import { isControlTemplate, resolveLayout, type ResolvedSection } from './layout.mjs';
import { MANIFESTS } from '../templates/manifests.mjs';

export interface ResolveIssue {
  level: 'error' | 'warning';
  field: string;
  message: string;
}

export interface ResolvedClient extends ClientRecord {
  /** Display string for the phone, always derived unless explicitly overridden. */
  phoneDisplay: string;
  /** tel: href, always derived from the same e164 as phoneDisplay. */
  phoneHref: string;
  /**
   * Google Ads call asset number, formatted for display. Empty string when the
   * client has not supplied one — which renders nothing rather than a placeholder.
   * Display only: there is deliberately no matching href.
   */
  googleAdsCallAssetDisplay: string;
  /** Post-submit destination after the external-domain guard has been applied. */
  safeThankYouUrl: string;
  /**
   * Every template's section order after applying this client's `layout`, the
   * manifest defaults, and the control lock. Templates render from this, never from
   * the raw `layout` field. Always present for every TemplateId (R5).
   */
  resolvedLayout: Record<TemplateId, ResolvedSection[]>;
}

/** One canonical display format for the whole factory: (214) 985-7697 */
export function formatPhoneDisplay(e164: string): string {
  const digits = (e164 || '').replace(/\D/g, '');
  const ten = digits.length === 11 && digits.startsWith('1') ? digits.slice(1) : digits;
  if (ten.length !== 10) return e164 || '';
  return `(${ten.slice(0, 3)}) ${ten.slice(3, 6)}-${ten.slice(6)}`;
}

export function isExternalUrl(url: string): boolean {
  return /^[a-z][a-z0-9+.-]*:\/\//i.test(url) || url.startsWith('//');
}

export function resolveClient(raw: ClientRecord): {
  client: ResolvedClient;
  issues: ResolveIssue[];
} {
  const issues: ResolveIssue[] = [];

  // ---- Phone (FIX 3) ------------------------------------------------------
  const e164 = (raw.phone?.e164 ?? '').trim();
  if (!e164) {
    issues.push({ level: 'error', field: 'phone.e164', message: 'No phone number set. Phone CTAs will not render.' });
  } else if (!/^\+\d{10,15}$/.test(e164)) {
    issues.push({
      level: 'error',
      field: 'phone.e164',
      message: `"${e164}" is not E.164. Expected +1XXXXXXXXXX. Display and tel: are both derived from this value, so a bad value breaks every CTA at once.`,
    });
  }
  const phoneDisplay = raw.phone?.displayOverride?.trim() || formatPhoneDisplay(e164);
  const phoneHref = e164 ? `tel:${e164}` : '';

  // ---- Google Ads call asset (display only) -------------------------------
  // Validated but never fatal: a malformed value renders nothing and raises a
  // warning, because a broken footer line must not take a landing page down.
  const callAssetRaw = (raw.phone?.googleAdsCallAsset ?? '').trim();
  let googleAdsCallAssetDisplay = '';
  if (callAssetRaw) {
    if (/^\+\d{10,15}$/.test(callAssetRaw)) {
      googleAdsCallAssetDisplay = formatPhoneDisplay(callAssetRaw);
      if (callAssetRaw === e164) {
        issues.push({
          level: 'warning',
          field: 'phone.googleAdsCallAsset',
          message: 'The Google Ads call asset number is the same as the main CTA number, so the footer line just repeats it. That is legal but probably not what was intended.',
        });
      }
    } else {
      issues.push({
        level: 'error',
        field: 'phone.googleAdsCallAsset',
        message: `"${callAssetRaw}" is not E.164. Expected +1XXXXXXXXXX. Rendering nothing rather than a malformed number, which would fail Google's call-asset check anyway.`,
      });
    }
  }

  // ---- Lead destination (FIX 1) -------------------------------------------
  const requested = (raw.leadDestination?.thankYouUrl ?? '').trim() || CLIENT_DEFAULTS.leadDestination.thankYouUrl;
  const externalAllowed = raw.leadDestination?.isExternalAllowed === true;
  let safeThankYouUrl = requested;

  if (isExternalUrl(requested) && !externalAllowed) {
    // This is the titantreeservicetx.com guard. Refuse, do not silently obey.
    issues.push({
      level: 'error',
      field: 'leadDestination.thankYouUrl',
      message: `Refusing to redirect leads to the external URL "${requested}" because leadDestination.isExternalAllowed is not true. Falling back to ${CLIENT_DEFAULTS.leadDestination.thankYouUrl}.`,
    });
    safeThankYouUrl = CLIENT_DEFAULTS.leadDestination.thankYouUrl;
  } else if (isExternalUrl(requested) && externalAllowed) {
    issues.push({
      level: 'warning',
      field: 'leadDestination.thankYouUrl',
      message: `Leads are being sent off-domain to "${requested}". Conversion tracking fires on our page before the redirect, but verify this domain is actually this client's.`,
    });
  }

  // ---- Consent (FIX 4) ----------------------------------------------------
  const consent = {
    smsCopy: raw.consent?.smsCopy?.trim() || CLIENT_DEFAULTS.consent.smsCopy,
    required: raw.consent?.required ?? CLIENT_DEFAULTS.consent.required,
    privacyPolicyUrl: raw.consent?.privacyPolicyUrl ?? '',
    termsOfServiceUrl: raw.consent?.termsOfServiceUrl ?? '',
  };
  if (!consent.privacyPolicyUrl || !consent.termsOfServiceUrl) {
    issues.push({
      level: 'warning',
      field: 'consent',
      message: 'Privacy Policy and/or Terms of Service URL missing. A2P registration requires both to be linked next to the opt-in.',
    });
  }

  // ---- CRM / tracking -----------------------------------------------------
  if (!raw.crm?.ghlLocationId) {
    issues.push({ level: 'warning', field: 'crm.ghlLocationId', message: 'No GHL location id. Form submissions cannot be routed until P4.' });
  }
  if (!raw.tracking?.gtmContainerId) {
    issues.push({ level: 'warning', field: 'tracking.gtmContainerId', message: 'No GTM container. Conversions will not fire for this client.' });
  }
  if (!raw.crm?.adClickIdFieldId) {
    issues.push({
      level: 'warning',
      field: 'crm.adClickIdFieldId',
      message: 'No GHL custom-field id for the ad click id. Click ids are still captured and submitted under "ad_click_id", but will not land on a mapped GHL field until this is set.',
    });
  }

  // ---- Layout (LAYOUT IS DATA) --------------------------------------------
  // Resolved for every template up front so a template never has to guard against
  // a missing entry. Controls (-a) are locked: their layout is ignored with a warning.
  const rawLayout = (raw as { layout?: unknown }).layout;
  const layoutIsObject = rawLayout != null && typeof rawLayout === 'object' && !Array.isArray(rawLayout);
  if (rawLayout != null && !layoutIsObject) {
    issues.push({ level: 'warning', field: 'layout', message: 'layout is not an object — every template uses its defaults.' });
  }
  const resolvedLayout = {} as Record<TemplateId, ResolvedSection[]>;
  for (const templateId of Object.keys(MANIFESTS) as TemplateId[]) {
    const entry = layoutIsObject ? (rawLayout as Record<string, unknown>)[templateId] : undefined;
    const { sections, warnings } = resolveLayout(MANIFESTS[templateId], entry, {
      locked: isControlTemplate(templateId),
    });
    resolvedLayout[templateId] = sections;
    for (const w of warnings) issues.push({ level: 'warning', field: `layout.${templateId}`, message: w });
  }

  const client: ResolvedClient = {
    ...raw,
    serviceAreaList: raw.serviceAreaList ?? [],
    reviews: raw.reviews ?? [],
    photos: raw.photos ?? {},
    copyOverrides: raw.copyOverrides ?? {},
    consent,
    leadDestination: { thankYouUrl: requested, isExternalAllowed: externalAllowed },
    phoneDisplay,
    phoneHref,
    googleAdsCallAssetDisplay,
    safeThankYouUrl,
    resolvedLayout,
  };

  return { client, issues };
}

/**
 * Copy interpolation tokens. A default (or an override) may embed
 * `{{token}}` or `{{token|fallback}}`; the value is composed from the CLIENT
 * RECORD at resolution time, never hardcoded in a template (R1/R4).
 *
 *   {{name}}      → client.name
 *   {{areaName}}  → client.serviceArea up to the first comma ("West Dallas, TX"
 *                   → "West Dallas") — the form marketing prose wants
 *   {{areaProse}} → client.serviceAreaList joined as English prose
 *                   ("A, B, and C")
 *
 * The fallback renders when the record value is blank (the blank-co R5 fixture),
 * so a tokenized sentence degrades to neutral prose — never to a stray gap, and
 * never to another client's place or name, which is exactly the defect this
 * mechanism exists to kill: the extracted controls used to ship their source
 * client's name and geography to every other client as the default.
 * An unknown token renders its fallback (or ''), never the raw braces (R5).
 */
const COPY_TOKEN_RE = /\{\{(\w+)(?:\|([^}]*))?\}\}/g;

function joinProse(items: string[]): string {
  if (items.length <= 1) return items[0] ?? '';
  if (items.length === 2) return `${items[0]} and ${items[1]}`;
  return `${items.slice(0, -1).join(', ')}, and ${items[items.length - 1]}`;
}

function interpolateCopy(value: string, client: ResolvedClient): string {
  if (!value.includes('{{')) return value;
  return value.replace(COPY_TOKEN_RE, (_m, token: string, fallback = '') => {
    switch (token) {
      case 'name':
        return (client.name ?? '').trim() || fallback;
      case 'areaName': {
        const area = (client.serviceArea ?? '').split(',')[0].trim();
        return area || fallback;
      }
      case 'areaProse': {
        const cities = (client.serviceAreaList ?? [])
          .filter((c) => typeof c === 'string' && c.trim())
          .map((c) => c.trim());
        return cities.length ? joinProse(cities) : fallback;
      }
      default:
        return fallback;
    }
  });
}

/**
 * Copy resolution: template default unless this client overrides that key,
 * then {{token}} interpolation from the client record (see above).
 * Returns '' for an unknown key rather than throwing or rendering "undefined" (R5).
 *
 * `inheritOverridesFrom` exists for the -c hybrids: removal-c renders
 * removal-a's copy BYTE-IDENTICALLY, and for the source client part of that
 * copy lives in copyOverrides['removal-a'] (its source-exact strings). The
 * hybrid names its parent here so those overrides apply to it too; its own
 * copyOverrides['removal-c'] entries still win if ever set.
 */
export function makeCopy(
  client: ResolvedClient,
  templateId: TemplateId,
  defaults: Record<string, string>,
  inheritOverridesFrom?: TemplateId
) {
  const inherited = inheritOverridesFrom ? (client.copyOverrides?.[inheritOverridesFrom] ?? {}) : {};
  const overrides = { ...inherited, ...(client.copyOverrides?.[templateId] ?? {}) };
  return function copy(key: string): string {
    const value = overrides[key] ?? defaults[key];
    if (value === undefined) {
      if (import.meta.env.DEV) console.warn(`[copy] missing key "${key}" for ${templateId}`);
      return '';
    }
    return interpolateCopy(value, client);
  };
}
