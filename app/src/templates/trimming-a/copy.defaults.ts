/**
 * trimming-a — COPY DEFAULTS  ·  THIS TEMPLATE IS THE CONTROL.
 *
 * COPY IS LOCKED. DESIGN IS FREE.
 *
 * Every string below derives from the live J Valdez Tree Services "Tree Trimming"
 * landing page (https://jvaldeztreeservices.com/landing-page-997015), as captured
 * in source/trimming/copy.md — that archive stays the byte-exact record. Two owner
 * mandates have since amended this file (each edit is flagged inline with its date):
 *
 *   - P3-T2 + DESIGN ELEVATION 2026-08-12: mechanical typos are DEFECTS, not copy
 *     ("a misspelling is not a tested variable"). Fixed and listed in the session
 *     report: "dicousnt"→"discount", "Mutli-Tree"→"Multi-Tree", the wrong-service
 *     "tree removal" wording (form.subline, why.body, faq.a7, faq.a10), the
 *     doubled space "includes  roof", the stray "trim, —" comma, the never-closed
 *     "(Multi-Tree Bundle Pricing", "start to finish..", singular "Frequently
 *     Asked Question", the duplicated "patio work", the welded "Available—", and
 *     "©Copyright" with no space.
 *   - LEAKAGE FIX 2026-08-12: brand- and geo-bound strings used to hardcode
 *     J Valdez's name, cities, and STREET ADDRESS, which every other client
 *     inherited (Texas Tree Tops' live page said "Choose J Valdez" and carried
 *     J Valdez's address in its footer). Those strings now compose from the client
 *     record via {{name}} / {{areaName}} / {{areaProse}} tokens
 *     (schema/resolve.ts interpolateCopy). J Valdez keeps source-exact wording
 *     (minus the typo fixes) via clients/j-valdez.json copyOverrides['trimming-a'].
 *
 * Consequences, spelled out because they look like bugs:
 *   - Leading and trailing spaces are LOAD-BEARING. The source splits most headings
 *     across two or three nodes and puts the word gap inside one of them. Each is
 *     flagged inline. A "helpful" trim fuses two words in the rendered heading.
 *   - The gap in cta.callSubLabel is a real NON-BREAKING SPACE (U+00A0). It is
 *     written as the escape \u00A0 — never as a literal character — so it survives
 *     copy/paste, reformatting and diff review. It is NOT a normal space.
 *   - Curly quotes (’) and the em dash (—) are the real Unicode characters, not
 *     ASCII lookalikes. The source mixes curly and straight apostrophes and the mix
 *     is reproduced exactly: ’ appears ONLY in form.subline and faq.a10.
 *
 * WHAT IS NOT HERE — these are client DATA, resolved from the ClientRecord, never
 * from copy (schema/client.ts):
 *   - phone numbers            → client.phone.e164 (one source of truth, FIX 3)
 *   - the service-area pills   → client.serviceAreaList (Section 8 marquee)
 *   - review author / date / body → client.reviews[]
 *   - photo alt text           → client.photos.trimming[].alt (PhotoSet.alt)
 *   - the SMS consent copy     → client.consent.smsCopy (FIX 4; the control had none)
 *   - the legal URLs           → client.consent.privacyPolicyUrl / termsOfServiceUrl
 *
 * Consumption: makeCopy(client, 'trimming-a', trimmingACopy) in schema/resolve.ts.
 * Any key here is overridable per client via client.copyOverrides['trimming-a'].
 * Unknown keys resolve to '' rather than throwing (R5).
 *
 * Key naming: dot-namespaced, in DOCUMENT ORDER (Sections 1-13 of structure.md).
 * Where the source renders one heading as two or three separate nodes so it can
 * style them differently, the parts are suffixed `a` / `b` / `c` and MUST be
 * concatenated in that order to reproduce the sentence.
 */

export const trimmingACopy: Record<string, string> = {
  /* ---------------------------------------------------------------- *
   * SECTION 1 — Header bar (desktop row + mobile row)
   *
   * The source ships two mutually exclusive header rows carrying two DIFFERENT
   * phone numbers: desktop "Call (214) 985-7697" with no sub-text, mobile
   * "(469) 402-1196" with the sub-text "Tap To Call". The numbers themselves are
   * client data (client.phone.e164), so only the wrapper words are copy here.
   * ---------------------------------------------------------------- */
  'header.callPrefix': 'Call ', // ← TRAILING SPACE. Desktop bar reads "Call " + number.
  'header.tapToCall': 'Tap To Call', // mobile bar sub-text. No trailing space.

  /* ---------------------------------------------------------------- *
   * SECTION 2 — Google rating badge (custom-code-tV4Rhd85m3)
   * logoText is rendered one coloured <span> per letter in the source: G o o g l e
   * ---------------------------------------------------------------- */
  'ratingBadge.logoText': 'Google',
  'ratingBadge.stars': '★★★★★',
  'ratingBadge.rating': '4.9',
  'ratingBadge.caption': 'Read our latest verified reviews below',

  /* ---------------------------------------------------------------- *
   * SECTION 2 — Hero headline block
   * ---------------------------------------------------------------- */
  'hero.h1a': '{{areaName|Local}} Get 10% Off Tree Trimming With ', // ← TRAILING SPACE. GEO via {{areaName}}.
  'hero.h1b': 'Roof & Gutter Branch Clearance', // <strong> run
  'hero.h2': 'Same-Week Appointments Available — Get Your Trees Trimmed Today! Summer Special Ends Soon. ',
  // ↑ TRAILING SPACE kept. TYPO FIX 2026-08-12: the em dash was welded to
  //   "Available" with no space before it.
  'hero.body':
    "Need a tree trimming service near you? Our {{areaName|local}} crew includes roof and gutter branch clearance with every trim — plus a 10% discount and multi-tree bundle pricing when more than one tree needs work. Whether it's a curb-appeal shape-up, full tree pruning, or overgrown limbs hanging over your roofline, we inspect every branch, walk you through your options upfront, and handle the trim and cleanup start to finish. No surprises on price. No debris left behind.",
  // ↑ P3-T2 APPROVED EXCEPTION: "dicousnt" -> "discount". DESIGN-ELEVATION TYPO
  //   FIXES 2026-08-12 (same mandate class): doubled space in "includes  roof"
  //   collapsed; stray comma in "with every trim, —" removed. GEO now via
  //   {{areaName}} — the hardcoded "East Dallas" leaked J Valdez's geography onto
  //   every other client's page.

  /* ---------------------------------------------------------------- *
   * SECTION 2 — Lead form heading + fields
   *
   * The desktop and mobile form headings are NOT a responsive duplicate — they are
   * DIFFERENT COPY (structure.md §2.2). Desktop `sub-heading-TVyXLNMxiV` reads
   * "Get Your Free Trimming Estimate"; mobile `sub-heading-7aLzvfhBAh` reads
   * "Get Your Free Tree Trimming Estimate  East Dallas & Nearby". Both ship, each
   * at its own breakpoint, because dropping either would delete source copy.
   * ---------------------------------------------------------------- */
  'form.headingA': 'Get Your ', // ← TRAILING SPACE (desktop)
  'form.headingB': 'Free Trimming Estimate', // coloured <strong> run (desktop)
  'form.headingMobileA': 'Get Your Free Tree Trimming Estimate  ', // ← TWO TRAILING SPACES
  'form.headingMobileB': '{{areaName|Your Area}} & Nearby', // coloured <strong> run (mobile). GEO via {{areaName}}.

  // Authored TWICE in the source (paragraph-BOeRKrin1Q and paragraph-hPbI9yy1Ja),
  // byte-identical, and both carry hideDesktop AND hideMobile — so the control
  // renders this sentence zero times at every width. It is real source copy, so it
  // is kept; showing it once is a DESIGN decision, which this template may make.
  // The source said "tree removal quote" on a trimming page. P3-T2 APPROVED
  // EXCEPTION: corrected to "tree trimming quote" to match the surrounding voice —
  // a wrong service name is a defect, not a copy choice.
  'form.subline': 'Enter your info and we’ll call you with the next steps for your tree trimming quote',

  'form.label.firstName': 'First Name',
  'form.label.lastName': 'Last Name',
  'form.label.phone': 'Phone',
  'form.label.requiredGap': ' ',
  // ↑ The literal space between the "Phone" label text and its asterisk <span>.
  //   form.json: `<label for="phone">Phone <span>*</span></label>`, rendered "Phone *".
  //   Kept as its own key so both source strings below stay byte-exact.
  'form.label.requiredMarker': '*', // its own <span> in the source
  'form.label.email': 'Email (Optional)',
  'form.label.adClickId': 'Ad Click ID',
  // ↑ Recorded for completeness. <LeadForm/> renders this hidden field itself, inside
  //   the same `d-none` wrapper GHL uses, so this key is not consumed by a section.

  // The four placeholders from form.json. NOT CURRENTLY RENDERED: the shared
  // <LeadForm/> takes labels only, and adding a `placeholders` prop is a change to a
  // component every template shares, so it is not made from inside one template.
  // Recorded here so the strings are not lost and so wiring them later is a one-line
  // change at the call site in sections/Hero.tsx. Every field keeps its visible
  // <label>, which is the accessible pattern regardless.
  'form.placeholder.firstName': 'Enter your first name',
  'form.placeholder.lastName': 'Enter your last name',
  'form.placeholder.phone': 'Enter phone number',
  'form.placeholder.email': 'Enter email address',

  'form.submit': 'Get My Tree Trimming Estimate',

  /* ---------------------------------------------------------------- *
   * SECTION 3 — Before/after gallery slider
   * No visible copy at all. The five slide alts are client data
   * (client.photos.trimming[].alt).
   * ---------------------------------------------------------------- */

  /* ---------------------------------------------------------------- *
   * SECTION 4 — Four benefit cards
   * ---------------------------------------------------------------- */
  'benefits.item1': '10% Off Tree Trimming With Roof & Gutter Clearance! (Multi-Tree Bundle Pricing)',
  // ↑ TYPO FIX 2026-08-12: the source never closed the parenthesis.
  'benefits.item2': 'Same-Week Scheduling & Tree Trimming Appointments',
  'benefits.item3': 'Licensed & Insured Service Up To $2 Million',
  'benefits.item4': 'Safe Tree Trimming, Debris Cleanup & Final Walkthrough',

  /* ---------------------------------------------------------------- *
   * SHARED CALL CTA — used by S4, S5, S6, S7 and the S10 "Ready" band.
   * The main label of each is the phone number itself (client data). The only copy
   * in it is the "Call " prefix and the shared sub-label.
   * ---------------------------------------------------------------- */
  'cta.callLabelPrefix': 'Call ', // ← TRAILING SPACE
  'cta.callSubLabel': 'Call Now\u00A0For A Free Estimate Today',
  // ↑ U+00A0 NON-BREAKING SPACE between "Now" and "For". Six placements in the
  //   source all use it (structure.md §6 counts 14 U+00A0 bytes in the snapshot).
  //   Retyping it as a normal space alters the control.

  /* ---------------------------------------------------------------- *
   * SECTION 5 — Why homeowners choose us + Google reviews
   * The two heading parts are two separate <h1> elements with NO gap between them,
   * so they only make sense as separate lines (rendered `stacked`).
   * ---------------------------------------------------------------- */
  'why.h1a': 'Why {{areaName|Local}} Homeowners', // GEO via {{areaName}}
  'why.h1b': 'Choose {{name}} for Tree Trimming', // BRAND via {{name}}
  'why.body':
    '{{name}} provides fast, reliable tree trimming service for homeowners in {{areaProse|your area}}.',
  // ↑ LEAKAGE FIX 2026-08-12: this default hardcoded "J Valdez Tree Service" and
  //   its cities, which rendered on TEXAS TREE TOPS' live trimming-a page (and
  //   blank-co). Composed from the record now. J Valdez keeps its source-exact
  //   sentence (short brand + its own list, wrong-service word fixed) via
  //   clients/j-valdez.json copyOverrides['trimming-a'].

  /* ---------------------------------------------------------------- *
   * SECTION 6 — "Tree Trimming Done Clean, Done Right" photo grid
   * ---------------------------------------------------------------- */
  'doneRight.h1a': 'Tree Trimming ', // ← TRAILING SPACE
  'doneRight.h1b': 'Done Clean, Done Right', // coloured <strong> run
  'doneRight.body':
    "Our trained crews use professional-grade equipment to trim, shape, and clean up safely and efficiently — because your trees deserve care that's done right.",

  /* ---------------------------------------------------------------- *
   * SECTION 7 — Services we offer
   * Three bullet columns in the source: items 1-6, 7-12, 13-17. The column COUNT is
   * layout (and collapses on a phone); the item ORDER is copy and is reproduced
   * exactly, column by column.
   * ---------------------------------------------------------------- */
  'services.h1a': 'Tree Trimming ', // ← TRAILING SPACE
  'services.h1b': 'Services We Offer', // coloured <strong> run
  'services.body':
    'Safe, clean, and professional tree trimming service for {{areaName|local}} homeowners who need the job handled without a mess left behind.', // GEO via {{areaName}}

  // Column 1 (bulletList-DW1kSshz9P)
  'services.item1': 'Residential Tree Trimming',
  'services.item2': 'Tree Pruning Service',
  'services.item3': 'Crown Thinning & Deadwooding',
  'services.item4': 'Overgrown Branch Trimming',
  'services.item5': 'Curb Appeal Shape-Up',
  'services.item6': 'Safe Tree Trimming Near Homes',

  // Column 2 (bulletList-kmcbJRQ19n)
  'services.item7': 'Roof & Gutter Branch Clearance',
  'services.item8': 'Driveway & Fence Line Trimming',
  'services.item9': 'Debris Cleanup & Haul Away',
  'services.item10': 'Multi-Tree Pricing', // ← P3-T2 APPROVED EXCEPTION: source transposed "Mutli-Tree"; a typo is a defect, corrected.
  'services.item11': 'Final Walkthrough Included',
  'services.item12': '{{areaName|Local}} Tree Trim Service ', // ← TRAILING SPACE. GEO via {{areaName}}.

  // Column 3 (bulletList-NHH49kGF49) — five items, not six.
  'services.item13': 'Affordable Tree Trimming Service',
  'services.item14': 'Same-Day Tree Trimming',
  'services.item15': 'Insured Tree Trimming Crew',
  'services.item16': 'Free Tree Trimming Estimate',
  'services.item17': 'Tree Trimming Near You',

  /* ---------------------------------------------------------------- *
   * SECTION 8 — Areas we serve (marquee)
   * Here it is the FIRST part that carries the accent colour, not the second.
   * The nine city pills are client data (client.serviceAreaList).
   * ---------------------------------------------------------------- */
  'areas.h1a': 'Areas ', // ← TRAILING SPACE. Coloured <strong> run.
  'areas.h1b': 'We Serve',
  'areas.h2': 'Top Rated {{areaName|Local}} Local Tree Trimming Company', // GEO via {{areaName}}

  /* ---------------------------------------------------------------- *
   * SECTION 9 — How our tree trimming service works
   * The four steps are authored twice in the source (a mobile copy and a desktop
   * copy) with byte-identical strings and a different DOM order. Recorded once.
   * The two heading parts are separate <h1>s with no gap — rendered `stacked`.
   * ---------------------------------------------------------------- */
  'process.h1a': 'How Our Tree',
  'process.h1b': 'Trimming Service Works',

  'process.step1.label': 'Step 1',
  'process.step1.h2': 'Request Your Free Estimate',
  'process.step1.body':
    "Tell us what needs to be trimmed and where the trees are located. We'll follow up quickly with the next steps for your tree trimming quote.",

  'process.step2.label': 'Step 2',
  'process.step2.h2': 'We Inspect The Job',
  'process.step2.body':
    'Our crew looks at the tree size, branch access, nearby structures like your roof and gutters, and cleanup needs so there are no wild surprises.',
  // ↑ "no wild surprises" — the source reads "wild", not "wilder" and not "no surprises".

  'process.step3.label': 'Step 3',
  'process.step3.h2': 'Safe Tree Trimming',
  'process.step3.body':
    'We handle the trimming, pruning, and debris cleanup with the right crew, equipment, and process for your property.',

  'process.step4.label': 'Step 4',
  'process.step4.h2': 'Final Walkthrough',
  'process.step4.body':
    'Before we leave, we make sure the trimming is complete, the cleanup is done, and your yard is left clean, safe, and looking sharp.',

  /* ---------------------------------------------------------------- *
   * SECTION 10 — Long-form SEO block + mid-page CTA + "Ready" band
   *
   * longform.lede, longform.p1, longform.spacer and longform.p2 are all marked up as
   * <h2> in the source, not as paragraphs (structure.md §4). They are body prose, so
   * this template renders them as prose — a design decision. The strings are untouched.
   * ---------------------------------------------------------------- */
  'longform.badge': 'Top Rated - 5 Star Service',
  'longform.h1a': 'Tree Trimming Service Done ', // ← TRAILING SPACE
  'longform.h1b': 'Safely, Cleanly & Carefully', // coloured <strong> run
  'longform.lede': 'Careful Tree Trimming. Complete Cleanup. No Mess.',
  'longform.p1':
    'Some trees just need attention before small problems become bigger ones. Branches creep toward the roofline, crowd the driveway, hang over the fence, or block sunlight from the yard. When that happens, {{name}} is the local tree trimming company {{areaName|local}} homeowners call to get branches handled without chaos, guesswork, or a mess left behind.',
  // ↑ LEAKAGE FIX 2026-08-12: brand + geo compose from the record; J Valdez keeps
  //   its source-exact sentence via copyOverrides['trimming-a'].
  'longform.spacer': '',
  // ↑ An EMPTY <h2> sits between p1 and p2 in the source. Recorded so the block is
  //   complete; <SafeText/> renders nothing for it, which is exactly what an empty
  //   spacer element contributes.
  'longform.p2':
    'We provide professional tree trimming and pruning services in {{areaProse|your area}}. Whether you need a tree trimming service, a tree pruning service, roofline branch clearance, or trim trees near your driveway and fence line, our crew can inspect the job, explain your options, give you a tree trimming estimate, and handle the work start to finish.',
  // ↑ GEO via {{areaProse}}; J Valdez keeps its source-exact list via override.
  //   TYPO FIX 2026-08-12: the double full stop "finish.." becomes one.

  'longform.requestsH1a': 'Common Tree Trimming ', // ← TRAILING SPACE
  'longform.requestsH1b': 'Requests We Handle', // coloured <strong> run
  'longform.request1': 'Residential tree trimming for overgrown, unshaped, or hard-to-reach branches',
  'longform.request2': 'Tree pruning service for weak, dead, or storm-prone limbs before they become a hazard',
  'longform.request3': 'Roof & gutter branch clearance for limbs touching or overhanging your roofline or siding',
  'longform.request4':
    'Tree Trimming before landscaping, patio work, fencing, sod, or outdoor upgrades, Etc',
  // ↑ TYPO FIX 2026-08-12: the source repeated "patio work" at the end of the line.
  //   The ", Etc" styling stays as written.
  'longform.request5': 'Canopy thinning and crown reduction for a cleaner, safer, healthier yard',
  'longform.request6': 'Tree shaping and structural trimming when you want the job fully done right',
  'longform.request7': 'Debris cleanup & final walkthrough after Trimming',

  // Mid-page CTA. The button is a scroll-to-form action in the source, NOT a phone
  // link, despite the sub-text "Request a call back".
  'midCta.h2': 'Looking for a Tree Trimming Company Near You?',
  'midCta.offer': 'Request your free tree trimming estimate today and get 10% Off!', // rendered <u> in the source
  'midCta.body': 'Our team will call you with the next steps for your tree trimming quote.',
  'midCta.button': 'Get my tree trimming estimate',
  'midCta.buttonSub': 'Request a call back',

  // The "Ready" band (row-YIxQrLnVyw) — two separate <h1>s, rendered `stacked`.
  'readyCta.h1a': 'Ready To Get Those ', // ← TRAILING SPACE
  'readyCta.h1b': 'Trees Trimmed?',

  /* ---------------------------------------------------------------- *
   * SECTION 11 — FAQ
   * ---------------------------------------------------------------- */
  'faq.h1a': 'Top 10 ', // ← TRAILING SPACE
  'faq.h1b': 'Frequently Asked Questions', // TYPO FIX 2026-08-12: source heading was singular.
  'faq.h1c': ' About Tree Trimming', // ← LEADING SPACE

  'faq.q1': 'How fast can you come out for a tree trimming estimate?',
  'faq.a1':
    "In many cases, we can schedule same-day or next-available estimates while crews are open. If you need tree trimming service in {{areaProse|your area}}, send your request and we'll call you with the next steps.",
  // ↑ GEO via {{areaProse}}; J Valdez keeps its source-exact "… or East Dallas"
  //   phrasing via override.

  'faq.q2': 'How much does tree trimming cost?',
  'faq.a2':
    'Tree trimming cost depends on the size and number of trees, how much needs to be cut back, access to the branches, and how much cleanup is needed. The fastest way to get a real number is to request a free tree trimming estimate so our crew can inspect the job and give you a clear quote.',

  'faq.q3': 'Do you trim dead, damaged, or overgrown trees?',
  'faq.a3':
    'Tree trimming cost depends on the size and number of trees, how much needs to be cut back, access to the branches, and how much cleanup is needed. The fastest way to get a real number is to request a free tree trimming estimate so our crew can inspect the job and give you a clear quote',
  // ↑ This answer is a VERBATIM COPY of faq.a2 and does not answer its own question.
  //   It also drops the final full stop that faq.a2 has. Both PRESERVED.

  'faq.q4': 'Do you clean up after tree trimming?',
  'faq.a4':
    'Yes. Our tree trimming service includes debris cleanup and a final walkthrough after the job is complete. The goal is simple: trim the branches, clear the mess, and leave the property looking clean and usable again.',

  'faq.q5': 'Are you licensed and insured?',
  'faq.a5':
    'Yes. {{name}} is licensed and insured, with coverage up to $2M. Tree trimming can be dangerous work, especially around homes, fences, roofs, and driveways, so you want a crew that knows how to handle the job safely.',
  // ↑ BRAND via {{name}} (this used to assert J VALDEZ's insurance on TTT's page).
  //   NOTE for the owner: the "$2M" figure itself is copy, not record data.

  'faq.q6': 'When should I trim my trees?',
  'faq.a6':
    "Homeowners usually call for tree trimming when branches are dead, cracked, hanging low, growing too close to the house, blocking sunlight, crowding the yard, or overhanging the roof or driveway. If branches are becoming a safety risk or hurting your yard's curb appeal, it's time to get an estimate.",

  'faq.q7': 'What areas do you serve?',
  'faq.a7':
    'We provide tree trimming service in {{areaProse|your area}}.',
  // ↑ FIXES 2026-08-12: "tree REMOVAL service" on a trimming page corrected
  //   (approved P3-T2 class); geo via {{areaProse}}. J Valdez keeps its source
  //   phrasing (service word fixed) via override.

  'faq.q8': ' Can you help if I need trees shaped up before selling, renting, or hosting?',
  // ↑ LEADING SPACE inside the <h4>. PRESERVED.
  'faq.a8':
    'Yes. Many customers call us before listing a home, hosting an event, or completing yard upgrades. Trimming and shaping your trees can improve curb appeal, let in more sunlight, and give your property a cleaner, more finished look.',

  'faq.q9': "Will trimming hurt my tree's health?",
  'faq.a9':
    "No — when it's done correctly. Our crew follows proper pruning techniques to remove weak, dead, or overgrown limbs without over-cutting, so your tree stays healthy and keeps its natural shape. Ask about our Tree Health + Trim maintenance plan if you want ongoing care between visits.",

  'faq.q10': 'How do I get started?',
  'faq.a10':
    'Fill out the form and request your free tree trimming estimate. We’ll call you, review the job, answer your questions, and help you figure out the best next step for your property.',
  // ↑ FIX 2026-08-12: "tree REMOVAL estimate" on a trimming page corrected
  //   (approved P3-T2 class). The CURLY apostrophe in "We’ll" stays.

  /* ---------------------------------------------------------------- *
   * SECTION 12 — Final CTA
   * Two separate <h1>s, rendered `stacked`. The button is a scroll-to-form action in
   * the source and does NOT dial, despite the sub-text "Click to call".
   * ---------------------------------------------------------------- */
  'finalCta.h1a': 'Need Tree Trimming?',
  'finalCta.h1b': 'Get a Free Estimate Today', // <strong> run
  'finalCta.body':
    'Fast tree trimming service for homeowners in {{areaProse|your area}}. Whether branches are overgrown, hanging over your roof, or crowding your yard, our crew can inspect it, explain your options, and handle the trim cleanly.',
  // ↑ GEO via {{areaProse}}; J Valdez keeps its source-exact (Forney-less) list
  //   via override.
  'finalCta.button': 'Get my free estimate',
  'finalCta.buttonSub': 'Click to call',

  /* ---------------------------------------------------------------- *
   * SECTION 13 — Footer
   * ---------------------------------------------------------------- */
  'footer.companyName': '{{name}}',
  // ↑ LEAKAGE FIX 2026-08-12: was J Valdez's LEGAL entity name for every client;
  //   J Valdez keeps "J Valdez Tree Service LLC" via copyOverrides['trimming-a'].
  'footer.address': '',
  // ↑ LEAKAGE FIX 2026-08-12: this default was J VALDEZ'S STREET ADDRESS
  //   ("2413 Pinehurst Lane Mesquite, TX 75150"), which rendered in the footer of
  //   Texas Tree Tops' and blank-co's pages. An address is client data: it now
  //   ships only via that client's own copyOverrides (empty renders nothing).
  'footer.copyright': '© Copyright {{name}}. | All rights reserved 2026',
  // ↑ BRAND via {{name}}. TYPO FIX 2026-08-12: space restored after "©". J Valdez
  //   keeps its "J. Valdez Tree Service Co." wording via override; the year stays
  //   hard-coded as the source wrote it.
  'footer.privacyLabel': 'Privacy Policy',
  'footer.termsLabel': 'Terms of Service',

  /* ---------------------------------------------------------------- *
   * <head> — document metadata
   *
   * BOTH ARE DELIBERATELY EMPTY. The control renders NO <title> element and NO
   * <meta name="description"> at all (copy.md "Strings that appear nowhere on the
   * page"; structure.md §4 confirms the elements are absent, not merely empty).
   * Inventing either would be inventing copy, so the control ships without them and
   * index.tsx skips both when the value is blank. A real client build sets them
   * through client.copyOverrides['trimming-a'].
   * ---------------------------------------------------------------- */
  'meta.title': '',
  'meta.description': '',
};

export default trimmingACopy;

/* ==================================================================== *
 * FIDELITY NOTES — read before editing anything above.
 * ==================================================================== *
 *
 * 1. THE KEY CONTAINING U+00A0 (non-breaking space), written as the escape \u00A0:
 *
 *      cta.callSubLabel      'Call Now\u00A0For A Free Estimate Today'
 *
 *    One key, six placements in the source (S4 desktop, S4 mobile, S5, S6, S7, S10).
 *    Typing a normal space here silently alters the control.
 *
 * 2. KEYS WITH A LOAD-BEARING LEADING OR TRAILING SPACE (14 keys).
 *    These are the word gaps of headings the source split across two or three nodes,
 *    plus four strings that simply end in a space. Trim any of them and two words
 *    fuse together on the page.
 *
 *      TRAILING (12):
 *        header.callPrefix         'Call '
 *        hero.h1a                  'East Dallas Get 10% Off Tree Trimming With '
 *        hero.h2                   '… Summer Special Ends Soon. '
 *        form.headingA             'Get Your '
 *        form.headingMobileA       'Get Your Free Tree Trimming Estimate  '  ← TWO spaces
 *        cta.callLabelPrefix       'Call '
 *        doneRight.h1a             'Tree Trimming '
 *        services.h1a              'Tree Trimming '
 *        services.item12           'East Dallas Tree Trim Service '
 *        areas.h1a                 'Areas '
 *        longform.h1a              'Tree Trimming Service Done '
 *        longform.requestsH1a      'Common Tree Trimming '
 *        readyCta.h1a              'Ready To Get Those '
 *        faq.h1a                   'Top 10 '
 *
 *      LEADING (2):
 *        faq.h1c                   ' About Tree Trimming'
 *        faq.q8                    ' Can you help if I need trees shaped up…'
 *
 *      SPACE-ONLY (1):
 *        form.label.requiredGap    ' '   (the gap between "Phone" and its "*" span)
 *
 * 3. SOURCE DEFECTS — status after the 2026-08-12 typo mandate ("real typos get
 *    fixed on both sides of a pair; a misspelling is not a tested variable").
 *    [T2] = the original P3-T2 exceptions; [DE] = Design Elevation 2026-08-12.
 *
 *    FIXED (all listed in the session report):
 *      hero.body            doubled space "includes  roof"        [DE]
 *      hero.body            "dicousnt" -> "discount"              [T2]
 *      hero.body            stray ", —" after "with every trim"   [DE]
 *      hero.h2              "Available—" -> "Available —"         [DE]
 *      form.subline         "tree removal quote" -> trimming      [T2]
 *      benefits.item1       unclosed parenthesis closed           [DE]
 *      why.body             "tree removal service" -> trimming    [DE]
 *      services.item10      "Mutli-Tree" -> "Multi-Tree"          [T2]
 *      longform.p2          "finish.." -> "finish."               [DE]
 *      longform.request4    duplicated "patio work" removed       [DE]
 *      faq.h1b              "Question" -> "Questions"             [DE]
 *      faq.a7               "tree removal service" -> trimming    [DE]
 *      faq.a10              "tree removal estimate" -> trimming   [DE]
 *      footer.copyright     "©Copyright" -> "© Copyright"         [DE]
 *
 *    KEPT (style/content, not mechanical typos — flagged to the owner instead):
 *      form.headingMobileA  doubled trailing space (load-bearing source spacing)
 *      process.step2.body   "no wild surprises" (correct here; removal-a's copy
 *                           of the sentence was the broken one)
 *      faq.a3               a verbatim copy of faq.a2 that does not answer its own
 *                           question — fixing it means WRITING copy; owner call
 *      faq.q8               leading space inside the heading
 *      finalCta.body        Forney missing from J Valdez's override list (source)
 *      footer.copyright     "J. Valdez" vs "J Valdez" (in J Valdez's override)
 *      longform.request4    the ", Etc" line ending
 *
 *    Not in this file, because they are not copy: the review typo "they high quality
 *    equipment" lives in client.reviews[] (a real customer's words, reproduced as
 *    written), and the four functional defects — the never-rendered header button,
 *    the mobile Privacy/Terms buttons that open an empty popup, the form sub-paragraph
 *    hidden at every width, and the two breakpoint-contradictory images — are
 *    behaviour, recorded in structure.md §5.18 and in the section files that replace
 *    them.
 *
 * 4./5. GEO- AND BRAND-BOUND DEFAULTS — RESOLVED 2026-08-12 via copy tokens.
 *    These keys now compose from the client record at render time
 *    ({{name}} / {{areaName}} / {{areaProse}}, schema/resolve.ts interpolateCopy):
 *
 *      hero.h1a · form.headingMobileB · why.h1a · why.h1b · why.body
 *      services.body · services.item12 · areas.h2 · longform.p1 · longform.p2
 *      faq.a1 · faq.a5 · faq.a7 · finalCta.body · footer.companyName
 *      footer.address (now EMPTY by default — an address only ships from a
 *      client's own copyOverrides) · footer.copyright
 *
 *    J Valdez (the source client) carries byte-exact source strings — minus the
 *    listed typo fixes — in clients/j-valdez.json copyOverrides['trimming-a'] for:
 *    why.h1b (short brand "J Valdez"), why.body, longform.p1, faq.a1, faq.a5,
 *    faq.a7, finalCta.body (the Forney-less list), footer.companyName (legal
 *    entity), footer.address, footer.copyright ("J. Valdez Tree Service Co.").
 *    No other client needs an override to render its own name and geography;
 *    blank-co degrades to the tokens' neutral fallbacks (R5).
 *
 * 6. STRINGS IN THE SOURCE THAT ARE DELIBERATELY NOT KEYS HERE.
 *
 *      'Call (214) 985-7697' / '(469) 402-1196' / 'Call (469) 402-1196'
 *          Two different numbers across nine anchors, split by breakpoint. Numbers
 *          are client data and reach the DOM only through <PhoneLink/>, derived from
 *          one client.phone.e164 (FIX 3). Only the wrapper words are copy.
 *      The nine service-area pill names
 *          client.serviceAreaList.
 *      The five review names, dates and bodies
 *          client.reviews[].
 *      'Location' / 'Phone' (footer contact-box image alts)
 *          Replaced by inline SVG marked aria-hidden, with the address and the phone
 *          number as the accessible text beside them.
 *      'Privacy Policy' / 'Terms of Service' URLs
 *          client.consent.privacyPolicyUrl / termsOfServiceUrl. Only the LABELS are
 *          copy (footer.privacyLabel / footer.termsLabel).
 */
