/**
 * trimming-a — COPY DEFAULTS  ·  THIS TEMPLATE IS THE CONTROL.
 *
 * COPY IS LOCKED. DESIGN IS FREE.
 *
 * Every string below is reproduced BYTE-FOR-BYTE from the live J Valdez Tree
 * Services "Tree Trimming" landing page (https://jvaldeztreeservices.com/landing-page-997015),
 * as captured in source/trimming/copy.md. That page is the control in the design
 * A/B test, so its wording is the constant. `trimming-a` may be re-laid-out,
 * re-styled and re-typed however we like — but if a single character of this file
 * changes, the control has been altered and the test is invalid.
 *
 * Consequences, spelled out because they look like bugs:
 *   - Typos are DELIBERATE. "10% dicousnt", "Mutli-Tree Pricing", the never-closed
 *     "(Multi-Tree Bundle Pricing", "no wild surprises", "start to finish..",
 *     "Frequently Asked Question" (singular), the duplicated "patio work",
 *     "©Copyright" with no space. Do not fix them. See the FIDELITY NOTES at the
 *     bottom for the complete list and where each one sits.
 *   - "tree removal" appears FOUR times on a tree TRIMMING page (form.subline,
 *     why.body, faq.a7, faq.a10). That is what the live page says. It is the single
 *     most tempting "fix" in this file and it is the one that would most obviously
 *     invalidate the control.
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
  'hero.h1a': 'East Dallas Get 10% Off Tree Trimming With ', // ← TRAILING SPACE. GEO-BOUND.
  'hero.h1b': 'Roof & Gutter Branch Clearance', // <strong> run
  'hero.h2': 'Same-Week Appointments Available— Get Your Trees Trimmed Today! Summer Special Ends Soon. ',
  // ↑ TRAILING SPACE, and the em dash is welded to "Available" with no space before it.
  'hero.body':
    "Need a tree trimming service near you? Our East Dallas crew includes  roof and gutter branch clearance with every trim, — plus a 10% dicousnt and multi-tree bundle pricing when more than one tree needs work. Whether it's a curb-appeal shape-up, full tree pruning, or overgrown limbs hanging over your roofline, we inspect every branch, walk you through your options upfront, and handle the trim and cleanup start to finish. No surprises on price. No debris left behind.",
  // ↑ THREE deliberate defects: the DOUBLED SPACE in "includes  roof", the
  //   misspelling "dicousnt" (discount), and the stray ", —" after "with every trim".

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
  'form.headingMobileB': 'East Dallas & Nearby', // coloured <strong> run (mobile). GEO-BOUND.

  // Authored TWICE in the source (paragraph-BOeRKrin1Q and paragraph-hPbI9yy1Ja),
  // byte-identical, and both carry hideDesktop AND hideMobile — so the control
  // renders this sentence zero times at every width. It is real source copy, so it
  // is kept; showing it once is a DESIGN decision, which this template may make.
  // It also says "tree removal quote" on a trimming page. PRESERVED.
  'form.subline': 'Enter your info and we’ll call you with the next steps for your tree removal quote',

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
  'benefits.item1': '10% Off Tree Trimming With Roof & Gutter Clearance! (Multi-Tree Bundle Pricing',
  // ↑ The opening parenthesis is NEVER CLOSED in the source. PRESERVED.
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
  'why.h1a': 'Why East Dallas Homeowners', // GEO-BOUND
  'why.h1b': 'Choose J Valdez for Tree Trimming', // BRAND-BOUND
  'why.body':
    'J Valdez Tree Service provides fast, reliable tree removal service for homeowners in Mesquite, Garland, Rowlett, Rockwall, Sunnyvale, Heath, Fate, and East Dallas.',
  // ↑ "tree removal service" on a TRIMMING page. BRAND- and GEO-BOUND. PRESERVED.

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
    'Safe, clean, and professional tree trimming service for East Dallas homeowners who need the job handled without a mess left behind.', // GEO-BOUND

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
  'services.item10': 'Mutli-Tree Pricing', // ← TRANSPOSITION: "Mutli-Tree", not "Multi-Tree". PRESERVED.
  'services.item11': 'Final Walkthrough Included',
  'services.item12': 'East Dallas Tree Trim Service ', // ← TRAILING SPACE. GEO-BOUND.

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
  'areas.h2': 'Top Rated East Dallas Local Tree Trimming Company', // GEO-BOUND

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
    'Some trees just need attention before small problems become bigger ones. Branches creep toward the roofline, crowd the driveway, hang over the fence, or block sunlight from the yard. When that happens, J Valdez Tree Service is the local tree trimming company East Dallas homeowners call to get branches handled without chaos, guesswork, or a mess left behind.', // BRAND- and GEO-BOUND
  'longform.spacer': '',
  // ↑ An EMPTY <h2> sits between p1 and p2 in the source. Recorded so the block is
  //   complete; <SafeText/> renders nothing for it, which is exactly what an empty
  //   spacer element contributes.
  'longform.p2':
    'We provide professional tree trimming and pruning services in East Dallas, Mesquite, Garland, Rowlett, Rockwall, Sunnyvale, Heath, Fate, and the Lake Ray Hubbard area. Whether you need a tree trimming service, a tree pruning service, roofline branch clearance, or trim trees near your driveway and fence line, our crew can inspect the job, explain your options, give you a tree trimming estimate, and handle the work start to finish..',
  // ↑ DOUBLE FULL STOP at the end: "start to finish..". GEO-BOUND. PRESERVED.

  'longform.requestsH1a': 'Common Tree Trimming ', // ← TRAILING SPACE
  'longform.requestsH1b': 'Requests We Handle', // coloured <strong> run
  'longform.request1': 'Residential tree trimming for overgrown, unshaped, or hard-to-reach branches',
  'longform.request2': 'Tree pruning service for weak, dead, or storm-prone limbs before they become a hazard',
  'longform.request3': 'Roof & gutter branch clearance for limbs touching or overhanging your roofline or siding',
  'longform.request4':
    'Tree Trimming before landscaping, patio work, fencing, sod, or outdoor upgrades patio work, Etc',
  // ↑ "patio work" appears TWICE and the line ends ", Etc". Both PRESERVED.
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
  'faq.h1b': 'Frequently Asked Question', // SINGULAR in the source. PRESERVED.
  'faq.h1c': ' About Tree Trimming', // ← LEADING SPACE

  'faq.q1': 'How fast can you come out for a tree trimming estimate?',
  'faq.a1':
    "In many cases, we can schedule same-day or next-available estimates while crews are open. If you need tree trimming service in Mesquite, Garland, Rowlett, Rockwall, Sunnyvale, Heath, Fate, or East Dallas, send your request and we'll call you with the next steps.", // GEO-BOUND

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
    'Yes. J Valdez Tree Service is licensed and insured, with coverage up to $2M. Tree trimming can be dangerous work, especially around homes, fences, roofs, and driveways, so you want a crew that knows how to handle the job safely.', // BRAND-BOUND

  'faq.q6': 'When should I trim my trees?',
  'faq.a6':
    "Homeowners usually call for tree trimming when branches are dead, cracked, hanging low, growing too close to the house, blocking sunlight, crowding the yard, or overhanging the roof or driveway. If branches are becoming a safety risk or hurting your yard's curb appeal, it's time to get an estimate.",

  'faq.q7': 'What areas do you serve?',
  'faq.a7':
    'We provide tree removal service in East Dallas, Mesquite, Garland, Rowlett, Rockwall, Sunnyvale, Heath, Fate, Forney, and the Lake Ray Hubbard area.',
  // ↑ "tree removal service" on a TRIMMING page. GEO-BOUND. PRESERVED.

  'faq.q8': ' Can you help if I need trees shaped up before selling, renting, or hosting?',
  // ↑ LEADING SPACE inside the <h4>. PRESERVED.
  'faq.a8':
    'Yes. Many customers call us before listing a home, hosting an event, or completing yard upgrades. Trimming and shaping your trees can improve curb appeal, let in more sunlight, and give your property a cleaner, more finished look.',

  'faq.q9': "Will trimming hurt my tree's health?",
  'faq.a9':
    "No — when it's done correctly. Our crew follows proper pruning techniques to remove weak, dead, or overgrown limbs without over-cutting, so your tree stays healthy and keeps its natural shape. Ask about our Tree Health + Trim maintenance plan if you want ongoing care between visits.",

  'faq.q10': 'How do I get started?',
  'faq.a10':
    'Fill out the form and request your free tree removal estimate. We’ll call you, review the job, answer your questions, and help you figure out the best next step for your property.',
  // ↑ "tree removal estimate" on a TRIMMING page, and the CURLY apostrophe in "We’ll".

  /* ---------------------------------------------------------------- *
   * SECTION 12 — Final CTA
   * Two separate <h1>s, rendered `stacked`. The button is a scroll-to-form action in
   * the source and does NOT dial, despite the sub-text "Click to call".
   * ---------------------------------------------------------------- */
  'finalCta.h1a': 'Need Tree Trimming?',
  'finalCta.h1b': 'Get a Free Estimate Today', // <strong> run
  'finalCta.body':
    'Fast tree trimming service for homeowners in East Dallas, Mesquite, Garland, Rowlett, Rockwall, Sunnyvale, Heath, and Fate. Whether branches are overgrown, hanging over your roof, or crowding your yard, our crew can inspect it, explain your options, and handle the trim cleanly.',
  // ↑ Forney is MISSING from this city list although it appears in the marquee and in
  //   faq.a7. GEO-BOUND. PRESERVED.
  'finalCta.button': 'Get my free estimate',
  'finalCta.buttonSub': 'Click to call',

  /* ---------------------------------------------------------------- *
   * SECTION 13 — Footer
   * ---------------------------------------------------------------- */
  'footer.companyName': 'J Valdez Tree Service LLC', // BRAND-BOUND
  'footer.address': '2413 Pinehurst Lane Mesquite, TX 75150', // BRAND- and GEO-BOUND
  'footer.copyright': '©Copyright J. Valdez Tree Service Co. | All rights reserved 2026',
  // ↑ No space after "©", and "J. Valdez" with a full stop here vs "J Valdez"
  //   everywhere else on the page. The year 2026 is hard-coded, as in the source.
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
 * 3. DELIBERATE DEFECTS, in document order. Every one of these is in the live page
 *    and every one of them is the control. Fixing any of them invalidates the test.
 *
 *      hero.body            doubled space in "includes  roof"
 *      hero.body            "dicousnt" (discount)
 *      hero.body            stray ", —" after "with every trim"
 *      hero.h2              "Available—" with no space before the em dash
 *      form.headingMobileA  doubled space before "East Dallas & Nearby"
 *      form.subline         "tree removal quote" on a TRIMMING page
 *      benefits.item1       "(Multi-Tree Bundle Pricing" — parenthesis never closed
 *      why.body             "tree removal service" on a TRIMMING page
 *      services.item10      "Mutli-Tree Pricing" — transposed letters
 *      longform.p2          "start to finish.." — double full stop
 *      longform.request4    "patio work" duplicated, line ends ", Etc"
 *      process.step2.body   "no wild surprises"
 *      faq.h1b              "Frequently Asked Question" — singular
 *      faq.a3               a verbatim copy of faq.a2 that answers a different
 *                           question, and drops faq.a2's final full stop
 *      faq.a7               "tree removal service" on a TRIMMING page
 *      faq.q8               leading space inside the heading
 *      faq.a10              "tree removal estimate" on a TRIMMING page
 *      finalCta.body        Forney missing from a city list that includes it elsewhere
 *      footer.copyright     "©Copyright" (no space) and "J. Valdez" vs "J Valdez"
 *
 *    Not in this file, because they are not copy: the review typo "they high quality
 *    equipment" lives in client.reviews[] (a real customer's words, reproduced as
 *    written), and the four functional defects — the never-rendered header button,
 *    the mobile Privacy/Terms buttons that open an empty popup, the form sub-paragraph
 *    hidden at every width, and the two breakpoint-contradictory images — are
 *    behaviour, recorded in structure.md §5.18 and in the section files that replace
 *    them.
 *
 * 4. GEO-BOUND DEFAULTS — for P3.
 *    These strings hard-code a place name inside a fixed marketing sentence, so they
 *    stay in copy (not in the client record) and are changed per client through
 *    client.copyOverrides['trimming-a']. Any client that is not this one MUST
 *    override every key in this list or the page will name the wrong city. The P3
 *    editor should surface them as a single "geography" group.
 *
 *      hero.h1a             'East Dallas Get 10% Off…'
 *      form.headingMobileB  'East Dallas & Nearby'
 *      why.h1a              'Why East Dallas Homeowners'
 *      why.body             prose city list — Mesquite … East Dallas
 *      services.body        'East Dallas homeowners'
 *      services.item12      'East Dallas Tree Trim Service '
 *      areas.h2             'Top Rated East Dallas Local Tree Trimming Company'
 *      longform.p1          'East Dallas homeowners call…'
 *      longform.p2          prose city list — East Dallas … Lake Ray Hubbard
 *      faq.a1               prose city list — Mesquite … East Dallas
 *      faq.a7               prose city list — East Dallas … Lake Ray Hubbard
 *      finalCta.body        prose city list, minus Forney
 *      footer.address       '2413 Pinehurst Lane Mesquite, TX 75150'
 *
 * 5. BRAND-BOUND DEFAULTS — contain the control client's company name inside a fixed
 *    sentence. Same treatment: override per client.
 *
 *      why.h1b              'Choose J Valdez for Tree Trimming'
 *      why.body             'J Valdez Tree Service provides…'
 *      longform.p1          '… J Valdez Tree Service is the local tree trimming…'
 *      faq.a5               'J Valdez Tree Service is licensed and insured…'
 *      footer.companyName   'J Valdez Tree Service LLC'
 *      footer.copyright     '©Copyright J. Valdez Tree Service Co. …'
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
