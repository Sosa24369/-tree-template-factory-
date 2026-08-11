/**
 * agnostic — COPY DEFAULTS.
 *
 * BLANK BY DESIGN. Every key in `agnosticCopy` ships as an EMPTY STRING.
 *
 * That is not an oversight and it is not a to-do. This template is the
 * service-neutral shell handed to an operator for a business we know nothing
 * about — roofing, fencing, HVAC, plumbing, paving, pest control, anything.
 * Shipping pre-written marketing sentences here would be worse than shipping
 * nothing:
 *
 *   - Placeholder marketing text READS AS REAL. "Fast, reliable service you can
 *     count on" looks finished, so it survives the dashboard pass, and the
 *     client goes live with our filler under their name.
 *   - Any sentence specific enough to be useful is specific to a service, and
 *     R4 forbids this template from knowing what the service is.
 *   - An empty string is a visible, unambiguous prompt in the P3 editor: the
 *     field is blank, so somebody fills it in.
 *
 * So the operator writes 100% of the marketing voice, and this file's job is to
 * enumerate exactly WHICH strings the page has room for. The key list IS the
 * content brief.
 *
 * WHAT MUST STILL RENDER WHEN EVERY KEY IS EMPTY
 * ----------------------------------------------
 * All of it (R5). Every section that has nothing to show returns null, the
 * sections that remain re-balance their own layout, and the page reads as a
 * deliberately spare one — header, a headline-free request card on the brand
 * colour, footer. Never a run of empty headings and orphan rules.
 *
 * WHAT IS NOT COPY — resolved from the ClientRecord, never from this file:
 *   phone numbers        → client.phone.e164        (via <PhoneLink/>)
 *   company name         → client.name
 *   brand mark + colours → client.brand
 *   service-area prose   → client.serviceArea
 *   individual areas     → client.serviceAreaList
 *   review author/quote  → client.reviews[]
 *   photographs + alt    → client.photos.generic[]  (via photosFor)
 *   SMS consent wording  → client.consent.smsCopy   (rendered by <LeadForm/>)
 *   Privacy / Terms URLs → client.consent.*Url
 *
 * Consumption: makeCopy(client, 'agnostic', agnosticCopy). Any key here is
 * overridable per client via client.copyOverrides.agnostic, and an unknown key
 * resolves to '' rather than throwing (R5).
 */

export const agnosticCopy: Record<string, string> = {
  /* ---------------------------------------------------------------- *
   * <head>
   * ---------------------------------------------------------------- */
  'meta.title': '',
  'meta.description': '',

  /* ---------------------------------------------------------------- *
   * Header — the brand mark and one call CTA.
   * The number itself is client data; this is the small line under it.
   * ---------------------------------------------------------------- */
  'header.callSub': '',

  /* ---------------------------------------------------------------- *
   * Hero — headline, subhead, up to three short proof points, and the form.
   * ---------------------------------------------------------------- */
  'hero.eyebrow': '',
  'hero.h1': '',
  'hero.sub': '',
  'hero.point1': '',
  'hero.point2': '',
  'hero.point3': '',

  /* ---------------------------------------------------------------- *
   * Lead form. `form.label.*` and `form.submit` fall back to
   * `agnosticChrome` when blank — see the note on that export below.
   * ---------------------------------------------------------------- */
  'form.heading': '',
  'form.subline': '',
  'form.label.firstName': '',
  'form.label.lastName': '',
  'form.label.phone': '',
  'form.label.email': '',
  'form.submit': '',
  'form.footnote': '',

  /* ---------------------------------------------------------------- *
   * Trust row — up to four very short credibility items (licensed, insured,
   * years in business, warranty…). The whole strip disappears if all four
   * are blank.
   * ---------------------------------------------------------------- */
  'trust.item1': '',
  'trust.item2': '',
  'trust.item3': '',
  'trust.item4': '',

  /* ---------------------------------------------------------------- *
   * Services grid — twelve slots. Any number of them may stay blank; the
   * grid packs whatever is filled and hides itself when nothing is.
   * ---------------------------------------------------------------- */
  'services.eyebrow': '',
  'services.h2': '',
  'services.body': '',
  'services.item1': '',
  'services.item2': '',
  'services.item3': '',
  'services.item4': '',
  'services.item5': '',
  'services.item6': '',
  'services.item7': '',
  'services.item8': '',
  'services.item9': '',
  'services.item10': '',
  'services.item11': '',
  'services.item12': '',

  /* ---------------------------------------------------------------- *
   * Gallery — headings only. The photographs are client data and the whole
   * section is absent for a client that has none.
   * ---------------------------------------------------------------- */
  'gallery.eyebrow': '',
  'gallery.h2': '',
  'gallery.body': '',

  /* ---------------------------------------------------------------- *
   * Reviews — headings only. The quotations are client data.
   * ---------------------------------------------------------------- */
  'reviews.eyebrow': '',
  'reviews.h2': '',

  /* ---------------------------------------------------------------- *
   * Service area — headings only. The area itself is client data.
   * ---------------------------------------------------------------- */
  'areas.eyebrow': '',
  'areas.h2': '',
  'areas.body': '',

  /* ---------------------------------------------------------------- *
   * FAQ — eight pairs. A pair renders when either half is filled.
   * ---------------------------------------------------------------- */
  'faq.eyebrow': '',
  'faq.h2': '',
  'faq.q1': '',
  'faq.a1': '',
  'faq.q2': '',
  'faq.a2': '',
  'faq.q3': '',
  'faq.a3': '',
  'faq.q4': '',
  'faq.a4': '',
  'faq.q5': '',
  'faq.a5': '',
  'faq.q6': '',
  'faq.a6': '',
  'faq.q7': '',
  'faq.a7': '',
  'faq.q8': '',
  'faq.a8': '',

  /* ---------------------------------------------------------------- *
   * Closing CTA. `finalCta.formLinkLabel` is the text of the in-page link
   * back up to the request card; blank simply omits that link, leaving the
   * call CTA on its own.
   * ---------------------------------------------------------------- */
  'finalCta.h2': '',
  'finalCta.body': '',
  'finalCta.formLinkLabel': '',

  /* ---------------------------------------------------------------- *
   * Shared sub-label under every phone CTA on the page.
   * ---------------------------------------------------------------- */
  'cta.callSub': '',

  /* ---------------------------------------------------------------- *
   * Footer. `footer.privacyLabel` / `footer.termsLabel` fall back to
   * `agnosticChrome` when blank, because a client WITH legal URLs set must
   * never end up with two invisible links — A2P registration checks for them.
   * ---------------------------------------------------------------- */
  'footer.legalName': '',
  'footer.copyright': '',
  'footer.privacyLabel': '',
  'footer.termsLabel': '',
  'footer.note': '',
};

export default agnosticCopy;

/* ==================================================================== *
 * FUNCTIONAL CHROME — the deliberate exception to "everything is blank".
 * ==================================================================== *
 *
 * Six strings on this page are not marketing voice, they are the operating
 * parts of a working form and a compliant footer:
 *
 *   - an <input> with an empty <label> is an unlabelled input. That is not a
 *     spare design, it is a broken form and an accessibility failure, and the
 *     visitor cannot tell which box wants what.
 *   - a Privacy Policy / Terms link with no text is an invisible link. The
 *     client record already carries the URLs, and A2P registration requires
 *     both to be reachable beside the opt-in.
 *
 * So these carry a neutral working default. They are still fully overridable —
 * the matching `form.label.*` / `form.submit` / `footer.*Label` copy keys above
 * win whenever the operator fills them in, and these only apply when the key
 * resolves blank. Nothing here names a service, a place, a company or a trade,
 * so this file stays as service-neutral as the rest of the template (R4).
 */
export const agnosticChrome = {
  firstName: 'First name',
  lastName: 'Last name',
  phone: 'Phone',
  email: 'Email (optional)',
  submit: 'Submit',
  privacyLabel: 'Privacy Policy',
  termsLabel: 'Terms of Service',
} as const;

/**
 * Alt text for a client photograph that arrived without any.
 *
 * PhotoSet.alt is client data and always wins. This is only the floor for a
 * record whose photos were added without alt text, and it is composed from
 * `client.name` at render time rather than hardcoded, so no company name lives
 * in the template (R1). It describes the photograph's ROLE on the page and
 * never guesses at what the photograph shows — this template has no idea what
 * trade it is selling, and inventing a subject would be a lie in an accessible
 * name rather than a helpful description.
 */
export function galleryAlt(clientName: string, index: number): string {
  const who = (clientName || '').replace(/^\s+|\s+$/g, '');
  return who ? `${who} — completed work, photo ${index}` : `Completed work, photo ${index}`;
}
