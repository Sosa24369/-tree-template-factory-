/**
 * THE FIELD SCHEMA — the dashboard is derived from this, not hardcoded.
 *
 * Each entry maps a dot-path into the client record to a human label, an editor
 * type, help text, the validation it must pass, and the page section it belongs to.
 * The form is rendered by walking this list and grouping by `group`. When a template
 * gains a field, adding one entry here surfaces it — the dashboard does not rot.
 *
 * A field PRESENT in a client JSON but ABSENT from this schema is not dropped: the
 * form collects every leaf path in the record, subtracts the ones described here, and
 * renders the remainder in a clearly-marked "Unlabelled fields" group. So a new
 * template key shows up as an editable raw field the moment it appears in a record,
 * even before someone writes a schema entry for it.
 *
 * Groups are ordered page-sections (the person editing thinks in sections, not JSON):
 *   identity · contact · areas · offer · reviews · media · footer · tracking
 */

export type FieldType =
  | 'text'
  | 'textarea'
  | 'tel'
  | 'url'
  | 'color'
  | 'select'
  | 'checkbox'
  | 'string-list' // serviceAreaList
  | 'reviews' // reviews[]
  | 'photos'; // photos.<service>[]

export interface FieldDef {
  path: string;
  label: string;
  group: GroupId;
  type: FieldType;
  help?: string;
  placeholder?: string;
  options?: { value: string; label: string }[];
  /** Required fields cannot be saved blank. */
  required?: boolean;
}

export type GroupId =
  | 'identity'
  | 'contact'
  | 'areas'
  | 'offer'
  | 'reviews'
  | 'media'
  | 'footer'
  | 'tracking';

export interface GroupDef {
  id: GroupId;
  label: string;
  hint: string;
  /** Which template sections these fields feed — shown to orient the editor. */
  sections: string;
}

export const GROUPS: GroupDef[] = [
  { id: 'identity', label: 'Business identity', hint: 'Name, logo and brand colours.', sections: 'Header · Hero · Footer' },
  { id: 'contact', label: 'Contact & lead routing', hint: 'The phone number and where a submitted lead lands.', sections: 'Every call button · the form' },
  { id: 'areas', label: 'Service area', hint: 'The city name and the list of suburbs.', sections: 'Hero · Areas grid · meta' },
  { id: 'offer', label: 'Copy & offer', hint: 'Per-template copy overrides — headline, offer, FAQ wording.', sections: 'Hero · Services · FAQ · Offer' },
  { id: 'reviews', label: 'Reviews', hint: 'Reviewer name, attribution and text. Rendered as initials + stars + text.', sections: 'Reviews / proof' },
  { id: 'media', label: 'Photos', hint: "The client's own job photos, per service. Uploads are optimised automatically.", sections: 'Hero art · galleries' },
  { id: 'footer', label: 'Consent & legal', hint: 'A2P opt-in copy and the Privacy / Terms links.', sections: 'Form consent · Footer' },
  { id: 'tracking', label: 'CRM & tracking', hint: 'GHL, GTM and CallRail identifiers. Rarely changed.', sections: 'Form submit · analytics' },
];

export const FIELDS: FieldDef[] = [
  // identity
  { path: 'name', label: 'Company name', group: 'identity', type: 'text', required: true, help: 'Drives the logo fallback, the footer copyright and the page title.' },
  { path: 'brand.logoUrl', label: 'Logo', group: 'identity', type: 'text', help: 'Path under /assets. Leave blank to render the company name as a wordmark.' },
  { path: 'brand.primaryColor', label: 'Primary colour', group: 'identity', type: 'color', help: 'Header, hero, primary buttons.' },
  { path: 'brand.accentColor', label: 'Accent colour', group: 'identity', type: 'color', help: 'CTAs, highlights, the second half of headings.' },
  { path: 'brand.onPrimaryColor', label: 'Text-on-primary', group: 'identity', type: 'color', help: 'Text colour on primary-coloured buttons. Usually white.' },

  // contact
  {
    path: 'phone.e164',
    label: 'Phone (E.164)',
    group: 'contact',
    type: 'tel',
    required: true,
    placeholder: '+15551234567',
    help: 'ONE source of truth. Both the display number and the tel: link derive from this. Must be +1XXXXXXXXXX.',
  },
  {
    path: 'phone.kind',
    label: 'Number type',
    group: 'contact',
    type: 'select',
    options: [
      { value: 'ghl-tracking', label: 'GHL tracking (forwards to the business line)' },
      { value: 'direct', label: 'Direct business line' },
    ],
    help: 'Matters at P4 for CallRail: a tracking number adds a forwarding hop.',
  },
  { path: 'phone.displayOverride', label: 'Display override', group: 'contact', type: 'text', help: 'Leave blank to derive one canonical format from the E.164 number. Only set if the client insists.' },
  {
    path: 'leadDestination.thankYouUrl',
    label: 'Thank-you URL',
    group: 'contact',
    type: 'text',
    required: true,
    help: "Where a lead lands after submitting. Keep it a relative path (on-site) unless this client genuinely owns an off-domain URL. Never titantreeservicetx.com.",
  },
  { path: 'leadDestination.isExternalAllowed', label: 'Allow off-domain redirect', group: 'contact', type: 'checkbox', help: 'Must be ON before an absolute thank-you URL is honoured. Guards against redirecting leads to the wrong company.' },

  // areas
  { path: 'serviceArea', label: 'Primary service area', group: 'areas', type: 'text', placeholder: 'Your City, ST', help: 'The headline city. Composed into the storm hero and the meta description.' },
  { path: 'serviceAreaList', label: 'Suburbs served', group: 'areas', type: 'string-list', help: 'One per line. Rendered as the areas grid and marquee. An empty list hides those sections.' },

  // offer / copy
  { path: 'copyOverrides', label: 'Copy overrides', group: 'offer', type: 'textarea', help: 'Per-template copy that overrides the template default. Edited in the Copy panel.' },

  // reviews
  { path: 'reviews', label: 'Reviews', group: 'reviews', type: 'reviews', help: 'Author, attribution line and body. Avatars are intentionally not used (Google blocks hotlinking); cards render initials + stars + text.' },

  // media
  { path: 'photos', label: 'Photo sets', group: 'media', type: 'photos', help: "Per-service galleries. Every upload is optimised and given responsive variants automatically, and only ever written to THIS client's asset folder." },

  // footer / consent
  { path: 'consent.smsCopy', label: 'SMS opt-in copy', group: 'footer', type: 'textarea', required: true, help: 'The A2P consent label beside the form checkbox.' },
  { path: 'consent.required', label: 'Consent required to submit', group: 'footer', type: 'checkbox', help: 'A required box costs leads; default off.' },
  { path: 'consent.privacyPolicyUrl', label: 'Privacy Policy URL', group: 'footer', type: 'url', help: 'Blank is allowed but flagged: A2P registration needs this. Do not reuse the shared agency URL.' },
  { path: 'consent.termsOfServiceUrl', label: 'Terms of Service URL', group: 'footer', type: 'url', help: 'Blank is allowed but flagged (legalUrlsPending).' },

  // tracking
  { path: 'crm.ghlLocationId', label: 'GHL location id', group: 'tracking', type: 'text', help: 'The GHL sub-account this client’s leads route to.' },
  { path: 'crm.adClickIdFieldId', label: 'GHL ad-click-id field id', group: 'tracking', type: 'text', help: 'Null until the custom field exists in GHL. Click ids are still captured regardless.' },
  { path: 'crm.leadSource', label: 'Lead source', group: 'tracking', type: 'text', help: 'Written to the contact’s source in GHL.' },
  { path: 'crm.leadTags', label: 'Lead tags', group: 'tracking', type: 'string-list', help: 'One per line. Applied to every lead; drives GHL workflows.' },
  { path: 'tracking.gtmContainerId', label: 'GTM container id', group: 'tracking', type: 'text', help: 'Per client, never shared. Conversions do not fire without it.' },
  { path: 'tracking.callRailSwapScriptUrl', label: 'CallRail swap script URL', group: 'tracking', type: 'url', help: 'Installed at P4.' },
];

/** Paths the schema OWNS — used to compute the "unlabelled fields" remainder. */
export const SCHEMA_PATHS = new Set(FIELDS.map((f) => f.path));

/** Paths that are structural / never hand-edited, so they are not "unlabelled". */
export const IGNORED_PATHS = new Set(['slug', '_comment']);
