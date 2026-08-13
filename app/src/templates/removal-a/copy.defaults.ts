/**
 * removal-a — COPY DEFAULTS  ·  THIS TEMPLATE IS THE CONTROL.
 *
 * COPY IS LOCKED. DESIGN IS FREE.
 *
 * Every string below derives from the live Texas Tree Tops "Routine Removal"
 * landing page (https://texastreetopsllc.com/landing-page-352422), as captured in
 * source/removal/copy.md — that archive stays the byte-exact record. Two owner
 * mandates have since amended this file (each edit is flagged inline with its date):
 *
 *   - P3-T2 + DESIGN ELEVATION 2026-08-12: mechanical typos are DEFECTS, not copy
 *     ("a misspelling is not a tested variable") — fixed and listed in the session
 *     report. Deliberate STYLE quirks (load-bearing spaces, curly quotes, the
 *     hard-coded year) remain untouched.
 *   - LEAKAGE FIX 2026-08-12: brand- and geo-bound strings used to hardcode the
 *     source client's name/cities, which every OTHER client inherited (J Valdez and
 *     blank-co pages literally said "Texas Tree Tops"). Those strings now compose
 *     from the client record via {{name}} / {{areaName}} / {{areaProse}} tokens
 *     (schema/resolve.ts interpolateCopy). Where the source string is correct
 *     content that tokens cannot reproduce (TTT's legal entity name, its Tarrant
 *     prose lists), the byte-exact string lives in
 *     clients/texas-tree-tops.json → copyOverrides['removal-a'].
 *
 * Consequences, spelled out because they look like bugs:
 *   - Trailing and leading spaces are LOAD-BEARING. The source splits several
 *     headings across two nodes and puts the word gap in one of them. Each is
 *     flagged inline. A "helpful" trim closes the gap in the rendered heading.
 *   - The gap in cta.callSubLabel is a real NON-BREAKING SPACE (U+00A0). It is
 *     written as the escape \u00A0 — never as a literal character — so it survives
 *     copy/paste, reformatting and diff review. It is NOT a normal space.
 *   - Curly quotes (’), the em dash (—) and the middle dot (·) are the real
 *     Unicode characters, not ASCII lookalikes.
 *
 * WHAT IS NOT HERE — these are client DATA, resolved from the ClientRecord,
 * never from copy (schema/client.ts):
 *   - phone numbers          → client.phone.e164 (one source of truth, FIX 3)
 *   - the service-area pills → client.serviceAreaList (Section 7 marquee, 25 cities)
 *   - review author / meta / body → client.reviews[]
 *   - photo alt text         → client.photos[].alt (PhotoSet.alt)
 *   - the SMS consent copy   → client.consent.smsCopy (FIX 4; the control had none)
 *
 * Consumption: makeCopy(client, 'removal-a', removalACopy) in schema/resolve.ts.
 * Any key here is overridable per client via client.copyOverrides['removal-a'].
 * Unknown keys resolve to '' rather than throwing (R5).
 *
 * Key naming: dot-namespaced, in document order (Sections 1-13). Where the source
 * renders one heading as two or three separate nodes so it can style them
 * differently, the parts are suffixed `a` / `b` / `c` and MUST be concatenated in
 * that order to reproduce the sentence.
 */

export const removalACopy: Record<string, string> = {
  /* ---------------------------------------------------------------- *
   * SECTION 1 — Header bar (desktop + mobile copies)
   * The numbers themselves come from client.phone; only the sub-labels are copy.
   * The desktop and mobile copies are NOT identical — different capitalisation.
   * ---------------------------------------------------------------- */
  'header.tapToCall': 'Tap To Call ', // ← TRAILING SPACE (desktop, row-QUXhAWTlOS)
  'header.tapToCallMobile': 'Tap to call', //  no trailing space, lower-case c (mobile, row-XOS6-tOzGd)

  /* ---------------------------------------------------------------- *
   * SECTION 1 — Google rating badge (custom-code element)
   * logoText is rendered one <span> per letter in the source: G o o g l e
   * ---------------------------------------------------------------- */
  'ratingBadge.logoText': 'Google',
  'ratingBadge.stars': '★★★★★',
  'ratingBadge.rating': '4.9',
  'ratingBadge.caption': 'Read our latest verified reviews below',

  /* ---------------------------------------------------------------- *
   * SECTION 1 — Hero headline block
   * ---------------------------------------------------------------- */
  'hero.h1a': '$300 Off Your Tree Removal',
  'hero.h1b': ' {{areaName|Local}} Homeowners', // ← LEADING SPACE. GEO via {{areaName}} (client.serviceArea).
  'hero.h2': 'Get Your Tree Service Handled In Hours With Our Summer Special!',
  'hero.body':
    'Get $300 Off With Your Tree Removal Service All Summer! Whether you need a tree removal estimate, a tree removal quote, or a local tree removal company near you for expert help — our crew can handle the removal from start to finish. Save $300 through August 31st. Call Today!',
  // ↑ DESIGN-ELEVATION TYPO FIXES (2026-08-12, owner mandate "a misspelling is not a
  //   tested variable"): "With your" -> "With Your", "help-" -> "help —",
  //   "though August-31st" -> "through August 31st". Source strings in copy.md.

  /* ---------------------------------------------------------------- *
   * SECTION 1 — Lead form heading + fields
   * The heading block is rendered twice (desktop `sub-heading-TVyXLNMxiV`,
   * mobile `col-vk8rBPkJ5b`) with identical strings — one set of keys covers both.
   * The subline is in the DOM but carries BOTH .desktop-only and .mobile-only,
   * so the control never displays it at any width. Kept because it is source copy;
   * showing it is a DESIGN decision, which this template is free to make.
   * ---------------------------------------------------------------- */
  'form.headingA': 'Get Your ', // ← TRAILING SPACE
  'form.headingB': 'Free Tree Removal Estimate',
  'form.subline': 'Enter your info and we’ll call you with the next steps for your tree removal quote',

  'form.label.firstName': 'First Name ', // ← TRAILING SPACE
  'form.label.lastName': 'Last Name ', // ← TRAILING SPACE
  'form.label.phone': 'Phone ', // ← TRAILING SPACE
  'form.label.email': 'Email (Optional) ', // ← TRAILING SPACE
  'form.label.requiredMarker': '*', // separate <span> after the Phone label

  'form.placeholder.firstName': 'Enter your first name',
  'form.placeholder.lastName': 'Enter your last name',
  'form.placeholder.phone': 'Enter phone number',
  'form.placeholder.email': 'Enter email address',

  'form.submit': 'Request My Free Tree Removal Estimate',

  /* ---------------------------------------------------------------- *
   * SECTION 2 — Recent-jobs photo slider
   * No text. The 15 photo alts are client data (client.photos.removal[].alt).
   * ---------------------------------------------------------------- */

  /* ---------------------------------------------------------------- *
   * SECTION 3 — Benefit strip
   * ---------------------------------------------------------------- */
  'benefits.item1': '$300 Off Qualifying Tree Removal Services',
  'benefits.item2': 'Fast Scheduling & Same-Day Tree Removals',
  'benefits.item3': 'Licensed & Insured Service Up To $2 Million',
  // ↑ TYPO FIX 2026-08-12: source ran "$2Million" together; space restored.
  'benefits.item4': 'Safe Tree Removal, Debris Cleanup & Final Walkthrough',

  /* ---------------------------------------------------------------- *
   * SHARED CALL CTA — used by S3, S4, S5, S6 and S9.
   * The main label of each is the phone number itself (client data). The only
   * copy in it is the S3-desktop "Call " prefix and the shared sub-label.
   * ---------------------------------------------------------------- */
  'cta.callLabelPrefix': 'Call ', // ← TRAILING SPACE. Source S3 desktop reads "Call " + number.
  'cta.callSubLabel': 'Call Now\u00A0For A Free Estimate Today',
  // ↑ U+00A0 NON-BREAKING SPACE between "Now" and "For". Six placements in the
  //   source all use it. Retyping it as a normal space alters the control.

  /* ---------------------------------------------------------------- *
   * SECTION 4 — Why choose us + Google reviews
   * ---------------------------------------------------------------- */
  'why.h1a': 'Why {{areaName|Local}} Homeowners', // GEO via {{areaName}}
  'why.h1b': 'Choose {{name}} for Tree Removal', // BRAND via {{name}}
  'why.body':
    '{{name}} provides fast, reliable tree removal service for homeowners in {{areaProse|your area}}.',
  // ↑ LEAKAGE FIX 2026-08-12: this default used to hardcode the source client's name
  //   and 20-city prose list, so EVERY other client's page (and blank-co) claimed to
  //   be Texas Tree Tops serving TTT's cities. Now composed from the client record.
  //   Texas Tree Tops keeps its source-exact prose list (typo-fixed: duplicated
  //   Colleyville/Coppell removed, commas restored to the "Grapevine … Hurst" run)
  //   via clients/texas-tree-tops.json copyOverrides['removal-a'].

  // Review-card icon alts. The card CONTENT — author, "Google Review · a month
  // ago", and the quotation — is client data (client.reviews[]), not copy.
  'reviews.altStars': '5 stars',
  'reviews.altGoogle': 'Google',

  /* ---------------------------------------------------------------- *
   * SECTION 5 — Restoration Results Guaranteed
   * ---------------------------------------------------------------- */
  'restoration.h1a': 'Restoration ', // ← TRAILING SPACE
  'restoration.h1b': 'Results Guaranteed',
  'restoration.body':
    'Our large crews use specialized equipment to complete removals safely and efficiently — because when a tree needs to come down, you need it handled fast and done right!',
  // ↑ TYPO FIX 2026-08-12: source said "safe and efficiently"; corrected to "safely".
  //   The dash is an em dash U+2014, not a hyphen.

  /* ---------------------------------------------------------------- *
   * SECTION 6 — Tree Removal Services We Offer
   * 20 list items, in source order: items 1-7 are column 1, 8-14 column 2,
   * 15-20 column 3. Column count is a DESIGN choice; the order is not.
   * ---------------------------------------------------------------- */
  'services.h1a': 'Tree Removal ', // ← TRAILING SPACE
  'services.h1b': 'Services We Offer',
  'services.body':
    'Safe, clean, and professional tree removal service for {{areaName|local}} homeowners who need the job handled without a mess left behind.',
  // ↑ GEO FIX 2026-08-12: source said EAST Dallas on this WEST Dallas page (the
  //   sister-page paste defect). Now composed from the client record.

  'services.item1': 'Residential Tree Removal',
  'services.item2': 'Dead Tree Removal',
  'services.item3': 'Large Tree Removal',
  'services.item4': 'Oak Tree Removal',
  'services.item5': 'Tree Cutting Service', // TYPO FIX 2026-08-12: source welded the editor artifact "Bullet" onto this item.
  'services.item6': 'Safe Tree Removal Near Homes',
  'services.item7': 'Local Tree Removal Company',
  'services.item8': 'Stump Grinding',
  'services.item9': 'Tree Stump Removal',
  'services.item10': 'Tree and Stump Removal',
  'services.item11': 'Debris Cleanup & Haul Away',
  'services.item12': 'Yard Clearing After Tree Removal',
  'services.item13': 'Final Walkthrough Included',
  'services.item14': 'Tree Cutting/Branch Removal',
  'services.item15': 'Affordable Tree Removal Service',
  'services.item16': 'Same-Day Tree Removal',
  'services.item17': 'Crane-Assisted Tree Removal',
  'services.item18': 'Tree Removal Estimate',
  'services.item19': 'Tree Removal For Yard',
  'services.item20': '{{areaName|Local}} Tree Removal ', // ← TRAILING SPACE. GEO via {{areaName}}.

  /* ---------------------------------------------------------------- *
   * SECTION 7 — Areas We Serve
   * The 25 city pills are client.serviceAreaList, not copy. Only the headings live here.
   * ---------------------------------------------------------------- */
  'areas.h1a': 'Areas ', // ← TRAILING SPACE
  'areas.h1b': 'We Serve',
  'areas.h2': 'Top Rated {{areaName|Local}} Local Tree Removal Company',
  // ↑ FIXES 2026-08-12: geo via {{areaName}}, and the source said "Tree TRIMMING
  //   Company" on this REMOVAL page — wrong-service word corrected (same class as
  //   the approved P3-T2 form.subline fix).

  /* ---------------------------------------------------------------- *
   * SECTION 8 — Long-form SEO block
   * ---------------------------------------------------------------- */
  'longform.badge': 'Top Rated · 5-Star Service',
  // ↑ The middle dot is U+00B7, rendered from the literal entity `&middot;` in the
  //   source's custom-code element. If this string is ever pasted back into a GHL
  //   custom-code element, paste `Top Rated &middot; 5-Star Service` instead.
  'longform.h2a': 'Tree Removal Service Done ', // ← TRAILING SPACE
  'longform.h2b': 'Safely, Cleanly & Carefully',
  'longform.lede': 'Careful Tree Removal. Complete Cleanup. No Mess.',
  'longform.p1':
    'Some trees become a problem slowly. They lean toward the house, crowd the driveway, drop limbs across the yard, block sunlight, or sit exactly where a cleaner, better outdoor space should be. When that happens, {{name}} is the local tree removal company {{areaName|local}} homeowners call to get the tree handled without chaos, guesswork, or a mess left behind.',
  // ↑ LEAKAGE FIX 2026-08-12: brand + geo now compose from the client record.
  //   Texas Tree Tops keeps its source-exact sentence ("Fort Worth homeowners" —
  //   a real TTT service city) via copyOverrides['removal-a'].
  'longform.p2':
    'We provide professional tree removal service in {{areaProse|your area}}. Whether you need residential tree removal, dead tree removal, large tree removal, oak tree removal, or tree cutting service, our crew can inspect the job, explain your options, give you a tree removal estimate, and handle the removal from start to finish.',
  // ↑ LEAKAGE FIX 2026-08-12: the source's Tarrant-County prose list (real TTT
  //   territory) moves to TTT's copyOverrides; every other client composes from
  //   its own record.
  'longform.requestsH2a': 'Common Tree Removal ', // ← TRAILING SPACE
  'longform.requestsH2b': 'Requests We Handle',
  'longform.request1': 'Residential tree removal for unwanted, overgrown, or poorly placed trees',
  'longform.request2': 'Dead tree removal for dry, damaged, declining, or unsafe trees',
  'longform.request3': 'Tree cutting service for trees near homes, fences, garages, and driveways',
  'longform.request4': 'Removal of large trees blocking sunlight, crowding the yard, or taking over usable space',
  'longform.request5': 'Oak tree removal and other big-canopy trees handled safely',
  'longform.request6': 'Tree removal before landscaping, patio work, or other outdoor upgrades',
  'longform.request7': 'Debris cleanup and a final walkthrough after the removal is complete',

  /* ---------------------------------------------------------------- *
   * SECTION 9 — Mid-page CTA
   * The button scrolls to the form; it is not a link.
   * ---------------------------------------------------------------- */
  'nearYou.h2': 'Looking for a Tree Removal Company Near You?',
  'nearYou.body':
    'Request your free tree removal estimate today and our team will call you with the next steps for your tree removal quote.',
  'nearYou.button': 'Request my tree removal free estimate', // TYPO FIX 2026-08-12: source doubled the verb ("Get Request my …").
  'nearYou.buttonSub': 'Request a call back',

  'readyCta.h1a': 'Ready To Get ', // ← TRAILING SPACE
  'readyCta.h1b': 'That Tree Handled?',

  /* ---------------------------------------------------------------- *
   * SECTION 10 — How Our Tree Removal Service Works
   * The four steps are in the source TWICE (desktop row-O7NtuDOYvR, mobile
   * row-6Yl0-6dyH5) with byte-identical text but different ORDER — desktop reads
   * 1,2,3,4; mobile reads 1,3,2,4 with the image interleaved. Ordering is layout,
   * so this template may render either; the strings are the same set.
   * ---------------------------------------------------------------- */
  'process.h1a': 'How Our Tree',
  'process.h1b': 'Removal Service Works',

  'process.step1.label': 'Step 1',
  'process.step1.h2': 'Request Your Free Estimate',
  'process.step1.body':
    'Tell us what needs to be removed and where the tree is located. We’ll follow up quickly with the next steps for your tree removal quote.',

  'process.step2.label': 'Step 2',
  'process.step2.h2': 'We Inspect The Job',
  'process.step2.body':
    'Our crew looks at the tree size, access, nearby structures, stump grinding options, and cleanup needs so there are no wild surprises.',
  // ↑ TYPO FIX 2026-08-12: source ended "no wild surprise" — plural and full stop restored.

  'process.step3.label': 'Step 3',
  'process.step3.h2': 'Safe Tree Removal',
  'process.step3.body':
    'We handle the cutting, removal, and debris cleanup with the right crew, equipment, and process for your property.',

  'process.step4.label': 'Step 4',
  'process.step4.h2': 'Final Walkthrough',
  'process.step4.body':
    'Before we leave, we make sure the tree removal is complete, the cleanup is done, and the yard is left clean, safe, and usable again.',

  /* ---------------------------------------------------------------- *
   * SECTION 11 — FAQ (10 pairs)
   * ---------------------------------------------------------------- */
  'faq.h1a': 'Top 10 ', // ← TRAILING SPACE
  'faq.h1b': 'Frequently Asked Questions', // TYPO FIX 2026-08-12: source heading was singular.
  'faq.h1c': ' About Tree Removals', // ← LEADING SPACE

  'faq.q1': 'How fast can you come out for a tree removal estimate?',
  'faq.a1':
    'In many cases, we can schedule same-day or next-available estimates while crews are open. If you need tree removal service in {{areaName|your area}}, send your request and we’ll call you with the next steps.',
  // ↑ GEO via {{areaName}}.

  'faq.q2': 'How much does tree removal cost?',
  'faq.a2':
    'Tree removal cost depends on the size of the tree, where it sits, how close it is to the house, fence, driveway, or power lines, and how much cleanup is needed. The fastest way to get a real number is to request a free tree removal estimate so our crew can inspect the job and give you a clear quote.',

  'faq.q3': 'Do you remove dead, damaged, or overgrown trees?',
  'faq.a3':
    'Yes. We handle residential tree removal, dead tree removal, overgrown tree removal, and trees that are too close to homes, garages, fences, driveways, or usable yard space. When a tree starts turning into a problem, we help get it down safely, cleanly, and without leaving the yard looking like a battlefield.',

  'faq.q4': 'Is stump grinding included with tree removal?',
  'faq.a4':
    'Stump grinding is available with qualifying tree removals. Some homeowners want the tree gone and the stump left alone. Others want the area fully cleaned up for grass, landscaping, fencing, patios, or a better-looking yard. We’ll explain your options during the estimate.',

  'faq.q5': 'Do you clean up after the tree removal?',
  'faq.a5':
    'Yes. Our tree removal service includes debris cleanup and a final walkthrough after the job is complete. The goal is simple: remove the tree, clear the mess, and leave the property looking clean and usable again.',

  'faq.q6': 'Are you licensed and insured?',
  'faq.a6':
    'Yes. {{name}} is licensed and insured, with coverage up to $2M. Tree removal can be dangerous work, especially around homes, fences, roofs, and driveways, so you want a crew that knows how to handle the job safely.',
  // ↑ BRAND via {{name}}. NOTE: the "$2M" coverage figure is copy, not record data —
  //   flagged for the owner: a future client without $2M coverage would need to
  //   override this key or the page overstates their insurance.

  'faq.q7': 'What areas do you serve?',
  'faq.a7':
    'We provide tree removal service in {{areaProse|your area}}.',
  // ↑ LEAKAGE FIX 2026-08-12: the source answer carried the SISTER COMPANY'S
  //   service-area list (East Dallas / Mesquite / Garland … is J Valdez territory,
  //   not TTT's) — the page-builder paste defect this factory exists to kill.
  //   Composed from the client record for every client, including TTT.

  'faq.q8': 'When should I remove a tree?',
  'faq.a8':
    'Homeowners usually call for tree removal when a tree is dead, leaning, damaged, dropping limbs, growing too close to the house, blocking sunlight, crowding the yard, or standing in the way of landscaping or outdoor upgrades. If the tree is becoming a safety risk or killing the look and function of your yard, it’s time to get an estimate.',

  'faq.q9': 'Can you help if I need the tree gone before landscaping or yard work?',
  'faq.a9':
    'Yes. Many customers call us before installing sod, fencing, patios, driveways, gardens, or other outdoor upgrades. Tree and stump removal can open up the yard, bring in more sunlight, and give you a cleaner space to work with.',

  'faq.q10': 'How do I get started?',
  'faq.a10':
    'Fill out the form and request your free tree removal estimate. We’ll call you, review the job, answer your questions, and help you figure out the best next step for your property.',

  /* ---------------------------------------------------------------- *
   * SECTION 12 — Final CTA
   * This is the only phone CTA on the page whose visible text has no digits in it,
   * so a text-matching DNI rule misses it. It must be targeted by href (P4).
   * ---------------------------------------------------------------- */
  'finalCta.h1a': 'Need Tree Removal?',
  'finalCta.h1b': ' Get a Free Estimate Today', // ← LEADING SPACE
  'finalCta.body':
    'Fast tree removal service for homeowners in {{areaName|your area}}. Whether the tree is dead, overgrown, blocking your yard, or sitting too close to the house, our crew can inspect it, explain your options, and handle the removal cleanly.',
  // ↑ GEO via {{areaName}}. TYPO FIX 2026-08-12: the source's comma splice
  //   ("… West Dallas, Whether …") becomes a full stop.
  'finalCta.linkLabel': 'Get my free estimate',
  'finalCta.linkSub': 'Click to call',

  /* ---------------------------------------------------------------- *
   * SECTION 13 — Footer
   * ---------------------------------------------------------------- */
  'footer.companyName': '{{name}}',
  // ↑ LEAKAGE FIX 2026-08-12: was the source client's LEGAL entity name
  //   ("Texas Tree Tops Tree Service LLC") — now {{name}}; TTT keeps its legal
  //   name via copyOverrides['removal-a'] (a legal name is not composable).
  'footer.copyright': '© Copyright {{name}}. | All rights reserved 2026',
  // ↑ BRAND via {{name}}. TYPO FIX 2026-08-12: space restored after "©".
  //   The year stays hard-coded exactly as the source wrote it.
  'footer.privacyLabel': 'Privacy Policy',
  'footer.termsLabel': 'Terms of Service',

  /* ---------------------------------------------------------------- *
   * <head> — document metadata
   * meta author was just the bare company name, so it is client data, not copy.
   * ---------------------------------------------------------------- */
  'meta.title': 'Tree Removal Services in {{areaName|Your Area}} | {{name}}', // GEO + BRAND via tokens
  'meta.description':
    '{{name}} provides safe tree removal, stump grinding, cleanup, and free estimates.',
  // ↑ LEAKAGE FIX 2026-08-12: was "Texas Tree Tops LLC provides …" for every client.
  //   TTT keeps its "LLC" wording via copyOverrides['removal-a'].
};

export default removalACopy;

/* ==================================================================== *
 * FIDELITY NOTES — read before editing anything above.
 * ==================================================================== *
 *
 * 1. KEYS CONTAINING U+00A0 (non-breaking space), written as the escape \u00A0:
 *
 *      cta.callSubLabel      'Call Now\u00A0For A Free Estimate Today'
 *
 *    One key, six placements in the source (S3 desktop, S3 mobile, S4, S5, S6, S9).
 *    Typing a normal space here silently alters the control.
 *
 * 2. KEYS WITH A LOAD-BEARING LEADING OR TRAILING SPACE (18 keys).
 *    These are the word gaps of headings the source split across two nodes.
 *    Trim any of them and two words fuse together on the page.
 *
 *      TRAILING (15):
 *        header.tapToCall          'Tap To Call '
 *        form.headingA             'Get Your '
 *        form.label.firstName      'First Name '
 *        form.label.lastName       'Last Name '
 *        form.label.phone          'Phone '
 *        form.label.email          'Email (Optional) '
 *        cta.callLabelPrefix       'Call '
 *        restoration.h1a           'Restoration '
 *        services.h1a              'Tree Removal '
 *        services.item20           'West Dallas Tree Removal '
 *        areas.h1a                 'Areas '
 *        longform.h2a              'Tree Removal Service Done '
 *        longform.requestsH2a      'Common Tree Removal '
 *        readyCta.h1a              'Ready To Get '
 *        faq.h1a                   'Top 10 '
 *
 *      LEADING (3):
 *        hero.h1b                  ' West Dallas Homeowners'
 *        faq.h1c                   ' About Tree Removals'
 *        finalCta.h1b              ' Get a Free Estimate Today'
 *
 * 3. GEO- AND BRAND-BOUND DEFAULTS — RESOLVED 2026-08-12 via copy tokens.
 *    These keys now compose from the client record at render time
 *    ({{name}} / {{areaName}} / {{areaProse}}, schema/resolve.ts). No override is
 *    required for a new client to render its own name and geography; blank-co
 *    degrades to the tokens' neutral fallbacks (R5).
 *
 *      hero.h1b · why.h1a · why.h1b · why.body · services.body · services.item20
 *      areas.h2 · longform.p1 · longform.p2 · faq.a1 · faq.a6 · faq.a7
 *      finalCta.body · footer.companyName · footer.copyright · meta.title
 *      meta.description
 *
 *    Texas Tree Tops (the source client) carries byte-exact source strings in
 *    copyOverrides['removal-a'] ONLY where the source content is real and
 *    uncomposable: why.body (its 20-city prose list, typo-fixed), longform.p1
 *    (Fort Worth is genuine TTT territory), longform.p2 (Tarrant list),
 *    footer.companyName (legal entity name), meta.description ("LLC" wording).
 *    faq.a7 is NOT preserved for TTT — the source answer carried J VALDEZ's
 *    service list (the sister-page paste defect), so TTT composes from its own
 *    record like everyone else.
 *
 * 4. (Merged into note 3.)
 *
 * 5. SOURCE DEFECTS — status after the 2026-08-12 typo mandate
 *    ("real typos get fixed on both sides of a pair; a misspelling is not a
 *    tested variable"). FIXED, and listed in the session report:
 *      hero.body          'With your' → 'With Your' · 'help-' → 'help —'
 *                         · 'though August-31st' → 'through August 31st'
 *      benefits.item3     '$2Million' → '$2 Million'
 *      restoration.body   'safe and efficiently' → 'safely and efficiently'
 *      services.item5     'Tree Cutting ServiceBullet' → 'Tree Cutting Service'
 *      services.body      'East Dallas' on a West Dallas page → {{areaName}}
 *      areas.h2           'Tree Trimming Company' → 'Tree Removal Company'
 *      nearYou.button     doubled verb 'Get Request my …' → 'Request my …'
 *      process.step2.body 'no wild surprise' → 'no wild surprises.'
 *      faq.h1b            'Frequently Asked Question' → 'Frequently Asked Questions'
 *      finalCta.body      comma splice '… , Whether' → '… . Whether'
 *      footer.copyright   '©Copyright' → '© Copyright'
 *    KEPT (style, not defects): every load-bearing space, the U+00A0 in
 *    cta.callSubLabel, curly quotes, '$2M' vs '$2 Million' phrasing difference,
 *    the hard-coded year 2026, 'and Surrounding West Dallas' (in TTT's override).
 *
 * 6. WHAT THE CONTROL DOES NOT SAY. Three strings from the source are deliberately
 *    absent because they are client data or dead controls, not copy:
 *      - every phone number, in every one of its three display formats
 *      - 'Call (469) 402-1196' — a button hidden at every viewport width whose
 *        action opens an empty popup. Unreachable, undialable, not reproduced.
 *      - the 25 Areas-We-Serve city pills, the 15 gallery photo alts, the two
 *        long-form photo alts, and all three review cards.
 *
 * 7. STRUCTURAL FACTS THE COPY DOES NOT CARRY (see source/removal/structure.md):
 *      - form.subline is present in the DOM but hidden at every width in the source.
 *      - The S10 steps render in a different order on mobile (1, 3, 2, 4).
 *      - Desktop and mobile headers show DIFFERENT phone numbers in the source.
 *    All three are things this template's design is free to correct, because they
 *    are layout and data, not copy.
 * ==================================================================== */
