/**
 * THE CLIENT DATA SCHEMA
 *
 * R1: no client-specific value is ever hardcoded in a template. Everything a template
 * renders that differs between clients comes from a ClientRecord.
 *
 * A new client is a new JSON file in /clients. It is a data-entry task, never a build task.
 */

export type TemplateId =
  | 'removal-a'
  | 'removal-b'
  | 'trimming-a'
  | 'trimming-b'
  | 'storm-a'
  | 'storm-b'
  | 'agnostic';

export const TEMPLATE_IDS: TemplateId[] = [
  'removal-a',
  'removal-b',
  'trimming-a',
  'trimming-b',
  'storm-a',
  'storm-b',
  'agnostic',
];

/* ------------------------------------------------------------------ *
 * Phone — FIX 3
 *
 * ONE source of truth per client. Display text and the tel: href are BOTH derived
 * from `e164`, so they are structurally incapable of diverging the way the source
 * pages do (mobile header displaying one number while dialling another).
 * ------------------------------------------------------------------ */

export interface ClientPhone {
  /**
   * The single source of truth. E.164, e.g. "+16824520735".
   * Every phone touchpoint on every template renders from this one value.
   */
  e164: string;

  /**
   * What this number actually is.
   * 'ghl-tracking' — a GoHighLevel tracking number that FORWARDS to the company's
   *                  real business line. This is the current setup for both clients.
   * 'direct'       — the company's own line, no forwarding.
   *
   * Matters at P4: CallRail DNI adds another forwarding hop on top of a
   * 'ghl-tracking' number (CallRail -> GHL -> business line).
   */
  kind: 'ghl-tracking' | 'direct';

  /**
   * Optional display override. Leave null and the display string is derived from
   * e164 in one canonical format, which is what keeps CallRail's swap targets
   * consistent. Only set this if a client insists on a different presentation.
   */
  displayOverride: string | null;
}

/* ------------------------------------------------------------------ *
 * Lead destination — FIX 1
 *
 * The source removal page redirected submitted leads to titantreeservicetx.com,
 * an unrelated company. Redirect destination is now per-client config, defaults
 * on-site, and an external domain is only possible if someone explicitly sets it.
 * ------------------------------------------------------------------ */

export interface ClientLeadDestination {
  /**
   * Where a lead lands after a successful submit.
   * Relative path => on-site route inside this template app (the default, and the
   * only thing `isExternalAllowed: false` permits).
   */
  thankYouUrl: string;

  /**
   * Must be explicitly true before any absolute/off-domain URL is accepted.
   * Guards against another titantreeservicetx.com.
   */
  isExternalAllowed: boolean;
}

/* ------------------------------------------------------------------ *
 * Consent — FIX 4
 *
 * No source form had consent (isGDPRCompliant: false), which blocks A2P/SMS.
 * Every template's form now carries an explicit opt-in, and the consent state is
 * submitted to GHL so there is a record.
 * ------------------------------------------------------------------ */

export interface ClientConsent {
  /** The opt-in label rendered beside the checkbox. Per-client so wording can be tuned. */
  smsCopy: string;
  /** Whether the box is required to submit. Default false — a required box costs leads. */
  required: boolean;
  privacyPolicyUrl: string;
  termsOfServiceUrl: string;
}

/* ------------------------------------------------------------------ *
 * CRM
 * ------------------------------------------------------------------ */

export interface ClientCrm {
  /** GHL sub-account this client's leads go to. */
  ghlLocationId: string;
  /**
   * GHL custom-field id that receives the ad click id — FIX 2.
   * Recorded from the live J Valdez form in P0: contact.ad_click_id.
   * Null means the field has not been created in that sub-account yet, in which
   * case the click id is still captured and submitted under `ad_click_id`.
   */
  adClickIdFieldId: string | null;
  /** Tags applied to every lead from this client's pages. Drives GHL workflow triggers. */
  leadTags: string[];
  /** Written to the contact's `source`. */
  leadSource: string;
}

/* ------------------------------------------------------------------ *
 * Tracking
 * ------------------------------------------------------------------ */

export interface ClientTracking {
  /** PER-CLIENT. GTM-W32M4C6F is Texas Tree Tops; GTM-PFZPR33H is J Valdez. Never shared. */
  gtmContainerId: string | null;
  /** CallRail DNI swap script URL, copied verbatim from the client's CallRail company. P4. */
  callRailSwapScriptUrl: string | null;
}

/* ------------------------------------------------------------------ *
 * Brand & content
 * ------------------------------------------------------------------ */

export interface ClientBrand {
  /** Path under /assets, or null. A null logo must render as the client name, never as a broken image (R5). */
  logoUrl: string | null;
  primaryColor: string;
  accentColor: string;
  /** Optional; falls back to primaryColor. */
  onPrimaryColor: string | null;
}

export interface PhotoSet {
  /** Path under /assets. Self-hosted (decision 5) — never a GHL CDN URL. */
  src: string;
  /**
   * Responsive candidates, generated by scripts/generate-srcset.mjs. Every entry
   * is a real file produced by an actual resize, never an assumed width.
   */
  srcset?: string;
  alt: string;
  /** null wherever the source does not state a dimension. Null over guess. */
  width: number | null;
  height: number | null;
}

export interface ClientRecord {
  /** Stable key. Also the filename: /clients/<slug>.json */
  slug: string;
  name: string;
  /** Free text, e.g. "West Dallas, TX". Rendered wherever a service area is named. */
  serviceArea: string;
  /** Individual cities/areas, for list and marquee sections. */
  serviceAreaList: string[];

  brand: ClientBrand;
  phone: ClientPhone;
  leadDestination: ClientLeadDestination;
  consent: ClientConsent;
  crm: ClientCrm;
  tracking: ClientTracking;

  /** Per-service photo sets, keyed by service. Missing or empty is legal (R5). */
  photos: Partial<Record<'removal' | 'trimming' | 'storm' | 'generic', PhotoSet[]>>;

  /** Google/other reviews rendered in review sections. Empty is legal (R5). */
  reviews: Array<{ author: string; meta: string; body: string }>;

  /**
   * Per-client, per-template copy overrides. A template ships pre-filled defaults;
   * anything set here wins. Editing these is what the P3 dashboard does.
   * Shape: copyOverrides['removal-a']['hero.h1'] = "..."
   */
  copyOverrides: Partial<Record<TemplateId, Record<string, string>>>;
}

/* ------------------------------------------------------------------ *
 * Defaults — every optional branch of the schema has a safe value, so a
 * half-filled client record renders rather than crashing (R5).
 * ------------------------------------------------------------------ */

export const CLIENT_DEFAULTS = {
  consent: {
    required: false,
    smsCopy:
      'By checking this box you agree to receive text messages from us about your request. ' +
      'Message frequency varies. Message and data rates may apply. Reply STOP to opt out.',
  },
  leadDestination: {
    thankYouUrl: '/thank-you',
    isExternalAllowed: false,
  },
} as const;
