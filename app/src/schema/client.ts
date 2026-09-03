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
  | 'removal-c'
  | 'trimming-a'
  | 'trimming-b'
  | 'trimming-c'
  | 'storm-a'
  | 'storm-b'
  | 'storm-c'
  | 'agnostic';

export const TEMPLATE_IDS: TemplateId[] = [
  'removal-a',
  'removal-b',
  'removal-c',
  'trimming-a',
  'trimming-b',
  'trimming-c',
  'storm-a',
  'storm-b',
  'storm-c',
  'agnostic',
];

/* ------------------------------------------------------------------ *
 * Layout — LAYOUT IS DATA
 *
 * Each template exports a section manifest (src/templates/manifests.mjs). A client
 * may reorder, hide or resize the NON-required sections of a template by setting
 * `layout[templateId]`. Resolution lives in src/schema/layout.mjs and is shared with
 * the Node verifier so there is one implementation of the rules.
 *
 * Controls (-a templates) ignore `layout` entirely so the A/B test stays valid (R2).
 * ------------------------------------------------------------------ */

/** Section size. A token, never pixels — the template maps it to its own CSS. */
export type SizeToken = 'S' | 'M' | 'L' | 'full';

export interface SectionLayout {
  /** A section id from that template's manifest. Unknown ids are ignored. */
  id: string;
  /** Required sections (header, footer, sticky bar) can never be hidden; the flag is ignored. */
  hidden: boolean;
}

export interface TemplateLayout {
  /** Full render order. Omitted manifest ids are appended in manifest order. */
  sections: SectionLayout[];
  /** sectionId -> size. Absent = the manifest's defaultSize. */
  sizes: Record<string, SizeToken>;
}

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

  /**
   * GOOGLE ADS CALL ASSET NUMBER — display only, never a CTA.
   *
   * Google verifies a call asset by rendering the landing page and checking the
   * number is VISIBLY present. This field puts it in the footer as small, muted,
   * de-emphasised text so it satisfies that check without competing with the real
   * call-to-action.
   *
   * Three rules this field exists to enforce, all of them deliberate:
   *
   *  1. VISIBLE, NEVER HIDDEN. It is rendered as ordinary text in normal document
   *     flow. No display:none, no visibility:hidden, no off-screen positioning, no
   *     background-coloured text. Hiding it would fail Google's check anyway AND
   *     count as cloaking, which is an Ads policy violation.
   *  2. NOT A LINK. No tel: href, so a customer who somehow taps it does not reach
   *     an untracked line outside GHL and CallRail.
   *  3. NEVER SWAPPED. Tagged so CallRail's DNI cannot rewrite it — a swapped
   *     number here would silently break the verification it exists for.
   *
   * E.164, e.g. "+15551234567". Empty string or null renders nothing at all, which
   * is the correct state for any client who has not supplied one.
   */
  googleAdsCallAsset: string | null;
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
  /**
   * Logo asset metadata, generated by scripts/generate-logo-variants.mjs. The header
   * renders the logo at a prominent size, which makes it the mobile LCP element on the
   * text-hero templates — so it carries a real srcset (never an assumed width) and its
   * intrinsic width/height so the box is reserved before load (CLS 0). Absent for a
   * client with no logo; the header falls back to the name wordmark (R5).
   */
  logoWidth?: number;
  logoHeight?: number;
  logoSrcset?: string;
  /**
   * Typography pairing. Three pairings ship self-hosted under app/public/fonts/
   * (Latin subset, font-display: swap). `system` loads no font file at all.
   * Absent = system.
   */
  fontPairing?: 'system' | 'editorial' | 'grotesk';
  /** Vertical rhythm scale applied through CSS custom properties. Absent = default. */
  spacingScale?: 'compact' | 'default' | 'roomy';
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
  /**
   * Focal point for cropping, each axis 0–1 (0.5/0.5 = centre). Rendered as
   * `object-position`. Absent = browser default (centre). Set by dragging in the editor.
   */
  focal?: { x: number; y: number };
  /** null wherever the source does not state a dimension. Null over guess. */
  width: number | null;
  height: number | null;
}

export interface ClientRecord {
  /**
   * TEST FIXTURE — not a real client, and never deployed.
   *
   * A fixture exists to prove the template rules (R5 graceful degradation) hold
   * against deliberately missing data. scripts/prerender.mjs skips these clients
   * unless INCLUDE_FIXTURES=1, so a test page cannot reach a public advertising
   * domain. The rule check in scripts/verify-factory-rules.mjs reads the fixture
   * from disk and does not need it built or deployed.
   */
  isFixture?: boolean;

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

  /**
   * Google/other reviews rendered in review sections. Empty is legal (R5).
   * Every entry is transcribed VERBATIM from the client's own review profile —
   * never written, merged, or "cleaned up" (a fabricated review is a legal
   * problem, not a copy choice). `rating` is the review's own star count
   * (sliders render it; absent means 5, the historical default).
   */
  reviews: Array<{ author: string; meta: string; body: string; rating?: number }>;

  /**
   * Where the reviews above were read from, and when — the audit trail that
   * makes "verbatim" checkable. Set whenever reviews are (re)transcribed.
   */
  reviewsSource?: { profileUrl: string; profileName?: string; pulledAt: string; note?: string };

  /**
   * Per-client, per-template copy overrides. A template ships pre-filled defaults;
   * anything set here wins. Editing these is what the P3 dashboard does.
   * Shape: copyOverrides['removal-a']['hero.h1'] = "..."
   */
  copyOverrides: Partial<Record<TemplateId, Record<string, string>>>;

  /**
   * Per-template layout overrides. Missing, empty or malformed values resolve to the
   * template's manifest defaults with a warning — never an error (R5). Ignored on
   * every -a template (R2); the editor refuses to write one there.
   */
  layout?: Partial<Record<TemplateId, TemplateLayout>>;

  /**
   * Templates that do NOT apply to this client — a service they do not sell.
   *
   * The factory generates every template for every client by default; this opts a
   * client OUT of specific ones so a page is never shipped that implies a service the
   * client does not offer (e.g. a storm page for a trimming-only account, which would
   * also be photo-less). Omitted or empty means every template applies. It is an
   * applicability switch, NOT a photo gap: a template the client DOES sell but has no
   * photos for stays applicable and is handled by the R5 degradation rules.
   */
  excludedTemplates?: TemplateId[];
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
