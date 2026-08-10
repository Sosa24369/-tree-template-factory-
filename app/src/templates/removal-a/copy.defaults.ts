/**
 * removal-a — COPY DEFAULTS  ·  THIS TEMPLATE IS THE CONTROL.
 *
 * COPY IS LOCKED. DESIGN IS FREE.
 *
 * Every string below is reproduced BYTE-FOR-BYTE from the live Texas Tree Tops
 * "Routine Removal" landing page (https://texastreetopsllc.com/landing-page-352422),
 * as captured in source/removal/copy.md. That page is the control in the
 * design A/B test, so its wording is the constant. `removal-a` may be re-laid-out,
 * re-styled, re-typed and re-animated however we like — but if a single character
 * of this file changes, the control has been altered and the test is invalid.
 *
 * Consequences, spelled out because they look like bugs:
 *   - Typos are DELIBERATE. "Tree Cutting ServiceBullet", "no wild surprise",
 *     "Save $300 though August-31st", "Get Request my tree removal free estimate",
 *     "Frequently Asked Question" (singular), "removals safe and efficiently",
 *     "©Copyright" (no space). Do not fix them. See the FIDELITY NOTES at the bottom.
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
  'hero.h1b': ' West Dallas Homeowners', // ← LEADING SPACE. GEO-BOUND.
  'hero.h2': 'Get Your Tree Service Handled In Hours With Our Summer Special!',
  'hero.body':
    'Get $300 Off With your Tree Removal Service All Summer! Whether you need a tree removal estimate, a tree removal quote, or a local tree removal company near you for expert help- our crew can handle the removal from start to finish. Save $300 though August-31st. Call Today!',
  // ↑ "With your" (lower-case y), "help-" with no space before the dash, and
  //   "though August-31st" where "through" is meant. All three are in the source.

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
  'benefits.item3': 'Licensed & Insured Service Up To $2Million',
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
  'why.h1a': 'Why West Dallas Homeowners', // GEO-BOUND
  'why.h1b': 'Choose Texas Tree Tops for Tree Removal', // BRAND-BOUND
  'why.body':
    'Texas Tree Tops provides fast, reliable tree removal service for homeowners in Highland Park, University Park, Kessler Park / N. Oak Cliff, Colleyville, Coppell, Flower Mound, Cedar Hill / DeSoto / Duncanville, Southlake, Colleyville, Grapevine Keller Trophy Club Westlake Mansfield Fort Worth Hurst, Euless, Bedford, Coppell, Carrollton, Farmers Branch, Addison, Irving, Grand Prairie, and Surrounding West Dallas',
  // ↑ GEO-BOUND AND BRAND-BOUND, and the single most client-specific string in
  //   this file: it is a prose service-area list. "Colleyville" and "Coppell"
  //   each appear twice and the "Grapevine Keller Trophy Club Westlake Mansfield
  //   Fort Worth Hurst" run has no commas — both preserved. For a non-control
  //   client, override this key (or compose it from client.serviceAreaList).

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
    'Our large crews use specialized equipment to complete removals safe and efficiently — because when a tree needs to come down, you need it handled fast and done right!',
  // ↑ "safe and efficiently" (source says "safe", not "safely"); the dash is an
  //   em dash U+2014, not a hyphen.

  /* ---------------------------------------------------------------- *
   * SECTION 6 — Tree Removal Services We Offer
   * 20 list items, in source order: items 1-7 are column 1, 8-14 column 2,
   * 15-20 column 3. Column count is a DESIGN choice; the order is not.
   * ---------------------------------------------------------------- */
  'services.h1a': 'Tree Removal ', // ← TRAILING SPACE
  'services.h1b': 'Services We Offer',
  'services.body':
    'Safe, clean, and professional tree removal service for East Dallas homeowners who need the job handled without a mess left behind.',
  // ↑ GEO-BOUND, and says EAST Dallas on a WEST Dallas page. Source defect, preserved.

  'services.item1': 'Residential Tree Removal',
  'services.item2': 'Dead Tree Removal',
  'services.item3': 'Large Tree Removal',
  'services.item4': 'Oak Tree Removal',
  'services.item5': 'Tree Cutting ServiceBullet', // editor artifact: "Bullet" welded on. PRESERVED.
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
  'services.item20': 'West Dallas Tree Removal ', // ← TRAILING SPACE. GEO-BOUND.

  /* ---------------------------------------------------------------- *
   * SECTION 7 — Areas We Serve
   * The 25 city pills are client.serviceAreaList, not copy. Only the headings live here.
   * ---------------------------------------------------------------- */
  'areas.h1a': 'Areas ', // ← TRAILING SPACE
  'areas.h1b': 'We Serve',
  'areas.h2': 'Top Rated West Dallas Local Tree Trimming Company',
  // ↑ GEO-BOUND, and says TRIMMING on a REMOVAL page. Source defect, preserved.

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
    'Some trees become a problem slowly. They lean toward the house, crowd the driveway, drop limbs across the yard, block sunlight, or sit exactly where a cleaner, better outdoor space should be. When that happens, Texas Tree Tops is the local tree removal company Fort Worth homeowners call to get the tree handled without chaos, guesswork, or a mess left behind.',
  // ↑ GEO-BOUND (Fort Worth) and BRAND-BOUND.
  'longform.p2':
    'We provide professional tree removal service in Fort Worth, Arlington, Keller, Southlake, North Richland Hills, Hurst, Bedford, Haltom City, and throughout Tarrant County. Whether you need residential tree removal, dead tree removal, large tree removal, oak tree removal, or tree cutting service, our crew can inspect the job, explain your options, give you a tree removal estimate, and handle the removal from start to finish.',
  // ↑ GEO-BOUND: a second, different prose service-area list — Tarrant County —
  //   on a Dallas County page. Preserved.
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
  'nearYou.button': 'Get Request my tree removal free estimate', // doubled verb + mixed case. PRESERVED.
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
    'Our crew looks at the tree size, access, nearby structures, stump grinding options, and cleanup needs so there are no wild surprise',
  // ↑ ends "no wild surprise" — missing plural "s" AND missing the full stop. Both preserved.

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
  'faq.h1b': 'Frequently Asked Question', // singular in the source. PRESERVED.
  'faq.h1c': ' About Tree Removals', // ← LEADING SPACE

  'faq.q1': 'How fast can you come out for a tree removal estimate?',
  'faq.a1':
    'In many cases, we can schedule same-day or next-available estimates while crews are open. If you need tree removal service in West Dallas, send your request and we’ll call you with the next steps.',
  // ↑ GEO-BOUND (West Dallas).

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
    'Yes. Texas Tree Tops is licensed and insured, with coverage up to $2M. Tree removal can be dangerous work, especially around homes, fences, roofs, and driveways, so you want a crew that knows how to handle the job safely.',
  // ↑ BRAND-BOUND. Also note "$2M" here vs "$2Million" in benefits.item3 — the
  //   source writes the insurance figure two different ways. Both preserved.

  'faq.q7': 'What areas do you serve?',
  'faq.a7':
    'We provide tree removal service in East Dallas, Mesquite, Garland, Rowlett, Rockwall, Sunnyvale, Heath, Fate, Forney, and the Lake Ray Hubbard area.',
  // ↑ GEO-BOUND: a third, different prose service-area list — East Dallas — that
  //   matches neither the H1 (West Dallas) nor longform.p2 (Tarrant County).

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
    'Fast tree removal service for homeowners in West Dallas, Whether the tree is dead, overgrown, blocking your yard, or sitting too close to the house, our crew can inspect it, explain your options, and handle the removal cleanly.',
  // ↑ GEO-BOUND. Comma splice with a capital "Whether" is in the source. PRESERVED.
  'finalCta.linkLabel': 'Get my free estimate',
  'finalCta.linkSub': 'Click to call',

  /* ---------------------------------------------------------------- *
   * SECTION 13 — Footer
   * ---------------------------------------------------------------- */
  'footer.companyName': 'Texas Tree Tops Tree Service LLC', // BRAND-BOUND
  'footer.copyright': '©Copyright Texas Tree Tops. | All rights reserved 2026',
  // ↑ BRAND-BOUND. No space after "©", and the year is hard-coded. PRESERVED.
  'footer.privacyLabel': 'Privacy Policy',
  'footer.termsLabel': 'Terms of Service',

  /* ---------------------------------------------------------------- *
   * <head> — document metadata
   * meta author was just the bare company name, so it is client data, not copy.
   * ---------------------------------------------------------------- */
  'meta.title': 'Tree Removal Services in West Dallas | Texas Tree Tops', // GEO + BRAND-BOUND
  'meta.description':
    'Texas Tree Tops LLC provides safe tree removal, stump grinding, cleanup, and free estimates.', // BRAND-BOUND
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
 * 3. GEO-BOUND DEFAULTS — for P2/P3.
 *    These strings hard-code a place name inside a fixed marketing sentence, so
 *    they stay in copy (not the client record) and are changed per client through
 *    client.copyOverrides['removal-a']. Any client that is not Texas Tree Tops in
 *    West Dallas MUST override every key in this list or the page will name the
 *    wrong city. The P3 editor should surface these as a single "geography" group.
 *
 *      hero.h1b          ' West Dallas Homeowners'
 *      why.h1a           'Why West Dallas Homeowners'
 *      why.body          prose service-area list — Highland Park … Surrounding West Dallas
 *      services.body     'East Dallas homeowners'          ← EAST, on a WEST Dallas page
 *      services.item20   'West Dallas Tree Removal '
 *      areas.h2          'Top Rated West Dallas Local Tree Trimming Company'
 *      longform.p1       'Fort Worth homeowners'
 *      longform.p2       prose service-area list — Fort Worth … Tarrant County
 *      faq.a1            'tree removal service in West Dallas'
 *      faq.a7            prose service-area list — East Dallas … Lake Ray Hubbard
 *      finalCta.body     'homeowners in West Dallas'
 *      meta.title        'Tree Removal Services in West Dallas'
 *
 *    FOUR different geographies coexist in the control — West Dallas, East Dallas,
 *    Fort Worth and Tarrant County. That is not an extraction error, it is what the
 *    live page says. The control reproduces it; a real client build overrides it.
 *
 * 4. BRAND-BOUND DEFAULTS — contain the control client's company name inside a
 *    fixed sentence. Same treatment: override per client.
 *
 *      why.h1b            'Choose Texas Tree Tops for Tree Removal'
 *      why.body           'Texas Tree Tops provides fast, reliable …'
 *      longform.p1        '… Texas Tree Tops is the local tree removal company …'
 *      faq.a6             'Texas Tree Tops is licensed and insured …'
 *      footer.companyName 'Texas Tree Tops Tree Service LLC'
 *      footer.copyright   '©Copyright Texas Tree Tops. | All rights reserved 2026'
 *      meta.title         '… | Texas Tree Tops'
 *      meta.description   'Texas Tree Tops LLC provides …'
 *
 *    footer.copyright also hard-codes the year 2026, exactly as the source does.
 *
 * 5. DELIBERATE SOURCE DEFECTS PRESERVED — do not "fix" these:
 *      hero.body          'With your' · 'help-' · 'Save $300 though August-31st'
 *      benefits.item3     '$2Million'  (vs '$2M' in faq.a6 — two spellings, both kept)
 *      restoration.body   'removals safe and efficiently'  (should be 'safely')
 *      services.item5     'Tree Cutting ServiceBullet'
 *      services.body      'East Dallas' on a West Dallas page
 *      areas.h2           'Tree Trimming Company' on a tree-removal page
 *      nearYou.button     'Get Request my tree removal free estimate'
 *      process.step2.body '… no wild surprise'  (no plural, no full stop)
 *      faq.h1b            'Frequently Asked Question'  (singular)
 *      finalCta.body      'in West Dallas, Whether the tree is dead…'  (comma splice)
 *      footer.copyright   '©Copyright'  (no space after the ©)
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
