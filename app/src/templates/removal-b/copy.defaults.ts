/**
 * removal-b — COPY DEFAULTS  ·  THIS TEMPLATE IS THE VARIANT.
 *
 * removal-a is the control and its copy is locked byte-for-byte to the live source
 * page. This file is the opposite: it is NEW copy, written for the test.
 *
 * WHAT IS HELD CONSTANT WITH THE CONTROL (or the test measures nothing):
 *   - the service      — tree removal
 *   - the offer        — $300 off qualifying tree removals, through August 31
 *   - the audience     — homeowners with a tree that needs to come down
 *   - the proof claims — licensed and insured up to $2 million, 4.9 Google rating,
 *                        same-day / next-available scheduling, crane-assisted
 *                        takedowns, stump grinding, debris haul-away, final
 *                        walkthrough, free no-obligation estimates.
 *     Every one of those is a claim the source page already makes
 *     (source/removal/copy.md). Nothing here invents a capability, a guarantee, a
 *     certification, a year-count or a job-count that the business has not stated.
 *
 * WHAT IS DELIBERATELY DIFFERENT (this IS the variant):
 *   - THE LEVER. The control leads with the discount. This leads with the risk of
 *     leaving the tree standing, and with who is carrying the liability while it
 *     comes down.
 *   - THE ORDER. The control shows the offer in the H1 and the reviews far below.
 *     Here the reviews and the credentials come FIRST and the $300 is not named
 *     until the form section, as the reason to book now rather than the reason to
 *     read on.
 *   - THE ASK. The control's hero is a form. This hero asks for a phone call, and
 *     the form is a mid-page section for people who would rather not call.
 *   - THE LENGTH. The control runs a long SEO body block and a ten-question FAQ.
 *     This runs a diagnostic ("five things that turn a tree into a problem") and
 *     six questions, all of them about risk, cost or what is left in the yard.
 *
 * DELIBERATELY GEOGRAPHY-NEUTRAL AND BRAND-NEUTRAL.
 * The control's defaults hard-code one city and one company name into a dozen
 * sentences, so every new client has to override them. Nothing below names a place
 * or a company. Where a page reads better with a place name, the template composes
 * it from client.serviceArea / client.serviceAreaList at render time, and simply
 * omits the phrase when the record has none (R5). A client that wants city names
 * baked into the prose can still add them through
 * client.copyOverrides['removal-b'].
 *
 * WHAT IS NOT HERE — client DATA, resolved from the ClientRecord, never copy:
 *   phone numbers (client.phone.e164) · company name (client.name) · service areas
 *   (client.serviceArea, client.serviceAreaList) · reviews (client.reviews[]) ·
 *   photo alt text (client.photos[].alt) · SMS consent wording
 *   (client.consent.smsCopy) · legal URLs (client.consent.*Url).
 *
 * Consumption: makeCopy(client, 'removal-b', removalBCopy). Unknown keys resolve to
 * '' rather than throwing, and an empty string renders nothing at all (R5).
 *
 * Headings are split into `…a` / `…b` parts so the second part can be painted in the
 * accent colour. The parts are concatenated in order, and the word gap lives inside
 * the trailing space of the `a` part — trimming one fuses two words together.
 */

export const removalBCopy: Record<string, string> = {
  /* ---------------------------------------------------------------- *
   * <head>
   * The company name is appended from client.name by index.tsx, so this
   * default carries no brand and needs no per-client override.
   * ---------------------------------------------------------------- */
  'meta.title': 'Tree Removal — Free Estimate From a Licensed, Insured Crew',
  'meta.description':
    'Dead, leaning, or hanging over the roof? Get a free tree removal estimate from a licensed and insured crew. Debris hauled away and a final walkthrough before we leave.',

  /* ---------------------------------------------------------------- *
   * Header
   * ---------------------------------------------------------------- */
  'header.callSub': 'Tap to call',
  'header.badge': 'Licensed & insured',

  /* ---------------------------------------------------------------- *
   * S1 — Hero.  RISK-LED, CALL-FIRST. No form, no discount, no price.
   * ---------------------------------------------------------------- */
  'hero.eyebrow': 'Tree removal · free estimates',
  'hero.h1a': 'Get it down ',
  'hero.h1b': 'before it comes down.',
  'hero.sub':
    'Dead, leaning, split, or hanging over the roof — we take the tree apart in a controlled way, haul every piece off your property, and walk the yard with you before the crew leaves.',
  'hero.areaPrefix': 'Crews working in ', // + client.serviceArea, omitted when blank
  'hero.secondary': 'Rather not call? Request a callback',

  'hero.chip1': 'Licensed & insured up to $2 million',
  'hero.chip2': 'Rated 4.9 on Google',
  'hero.chip3': 'Same-day & next-available crews',
  'hero.chip4': 'Debris hauled off, yard walked',

  'hero.artBadgeValue': '4.9',
  'hero.artBadgeLabel': 'Google rating',
  'hero.artBadgeStars': '★★★★★',

  /* ---------------------------------------------------------------- *
   * Shared call CTA
   * ---------------------------------------------------------------- */
  'cta.callPrefix': 'Call ',
  'cta.callSub': 'Free estimate · no obligation',

  /* ---------------------------------------------------------------- *
   * S2 — Credential ticker
   * ---------------------------------------------------------------- */
  'trust.item1': 'Licensed & insured up to $2 million',
  'trust.item2': 'Same-day & next-available removals',
  'trust.item3': 'Crane-assisted takedowns',
  'trust.item4': 'Stump grinding available',
  'trust.item5': 'Debris cleanup & haul away',
  'trust.item6': 'Final walkthrough before we leave',
  'trust.item7': 'Free, no-pressure estimates',

  /* ---------------------------------------------------------------- *
   * S3 — The diagnostic. This section is the variant's emotional lever:
   * it hands the homeowner a way to judge their own tree.
   * ---------------------------------------------------------------- */
  'signals.eyebrow': 'Read your own tree',
  'signals.h2a': 'Five things that turn a tree ',
  'signals.h2b': 'into a bill you did not plan for',
  'signals.lede':
    'A tree almost never fails without warning. If you can see any of these from your back door, the tree has already told you what it intends to do.',

  'signals.item1.h': 'It leans, or the soil is lifting at the base',
  'signals.item1.body':
    'Roots that have started to pull out of the ground do not settle back down. A lean that showed up after a storm is the one to take seriously this week, not next season.',

  'signals.item2.h': 'Dead limbs, a thinning canopy, bark falling away',
  'signals.item2.body':
    'A dying tree sheds limbs first and comes apart in the wind second. Dead tree removal is a scheduled job; clearing what is left after a failure is not.',

  'signals.item3.h': 'It hangs over the roof, the drive, or the power drop',
  'signals.item3.body':
    'Everything that tree drops lands on something you own. This is the case where waiting is the expensive option rather than the cautious one.',

  'signals.item4.h': 'A split trunk, an open cavity, fungus at the base',
  'signals.item4.body':
    'Structural damage inside the trunk is invisible from the ground. Our crew can tell you in a few minutes whether what is holding it up is still sound.',

  'signals.item5.h': 'It is simply in the way of the yard you want',
  'signals.item5.body':
    'Sunlight, grass, a patio, a fence line, a driveway. Not every removal is urgent — plenty of them are just the first step of the project.',

  'signals.footnote': 'Not sure which one you are looking at? That is what the free estimate is for.',

  /* ---------------------------------------------------------------- *
   * S4 — Proof, placed BEFORE the offer. Control does the reverse.
   * The stat VALUES are marketing claims the source page already makes;
   * the review cards themselves are client.reviews[].
   * ---------------------------------------------------------------- */
  'proof.eyebrow': 'Verified Google reviews',
  'proof.h2a': 'Read the reviews ',
  'proof.h2b': 'before you read the offer',
  'proof.lede':
    'We would rather be judged on the jobs than on a discount. These are unedited Google reviews from homeowners who had the same decision to make.',

  'proof.stat1.value': '4.9',
  'proof.stat1.label': 'Average Google rating',
  'proof.stat2.value': '$2M',
  'proof.stat2.label': 'Liability coverage carried',
  'proof.stat3.value': 'Same day',
  'proof.stat3.label': 'Estimates when crews are open',

  // Accessible name for the five-star row. The review's own source and date come
  // from client.reviews[].meta, so nothing here duplicates them.
  'proof.altStars': '5 stars',

  /* ---------------------------------------------------------------- *
   * S5 — The work. Photographs are client data; a client with none has
   * no section here at all.
   * ---------------------------------------------------------------- */
  'work.eyebrow': 'Recent removals',
  'work.h2a': 'This is what the yard looks like ',
  'work.h2b': 'once we have driven away',
  'work.lede':
    'Real jobs, real properties: the tree gone, the debris hauled off, and ground you can actually use again.',

  /* ---------------------------------------------------------------- *
   * S6 — The offer, and the form. The $300 is named for the first time
   * HERE, roughly two thirds down the page.
   * ---------------------------------------------------------------- */
  'estimate.ribbon': 'Summer special',
  'estimate.h2a': 'Now the offer: ',
  'estimate.h2b': '$300 off your tree removal',
  'estimate.lede':
    'Qualifying removals booked through August 31 come with $300 off. It is taken off a real quote — we price the job the same whether you mention it or not, and the crew will tell you honestly if your tree does not qualify.',

  'estimate.reassure1': 'A person calls you back, not an automated system',
  'estimate.reassure2': 'Free estimate, no obligation, no pressure',
  'estimate.reassure3': 'Nobody turns up at the property unannounced',

  'estimate.orCall': 'Would you rather just talk it through?',

  'estimate.formHeading': 'Tell us about the tree',
  'estimate.formSub':
    'Your name and a number is enough to start. We will call you back with the next steps and a free estimate.',

  'estimate.label.firstName': 'First name',
  'estimate.label.lastName': 'Last name',
  'estimate.label.phone': 'Phone *',
  'estimate.label.email': 'Email (optional)',
  'estimate.submit': 'Get my free estimate',
  'estimate.formFootnote': '$300 off applies to qualifying removals booked through August 31.',

  /* ---------------------------------------------------------------- *
   * S7 — How it works
   * ---------------------------------------------------------------- */
  'process.eyebrow': 'How it works',
  'process.h2a': 'Four steps, ',
  'process.h2b': 'and no surprises in the middle',

  'process.step1.label': 'Step 1',
  'process.step1.h': 'You send the details',
  'process.step1.body':
    'Tell us what needs to come down and roughly where it sits. We call you back and ask the handful of questions that actually decide the price.',

  'process.step2.label': 'Step 2',
  'process.step2.h': 'We look at the job properly',
  'process.step2.body':
    'Size, access, what sits underneath it, whether the stump goes too, and how much cleanup it needs. You get a clear number before anything starts.',

  'process.step3.label': 'Step 3',
  'process.step3.h': 'The tree comes down safely',
  'process.step3.body':
    'A large crew and the right equipment: rigged down in sections when it is tight to the house, crane-assisted when the job calls for it.',

  'process.step4.label': 'Step 4',
  'process.step4.h': 'We walk the yard with you',
  'process.step4.body':
    'Debris hauled away, the ground cleared, and a final walkthrough together before the crew leaves. If something is not right, it gets put right then.',

  /* ---------------------------------------------------------------- *
   * S8 — Scope. Two groups instead of the control's three columns.
   * ---------------------------------------------------------------- */
  'scope.eyebrow': 'What is included',
  'scope.h2a': 'Removal is the job. ',
  'scope.h2b': 'Cleanup is part of it.',
  'scope.lede': 'One crew and one price, from the first cut to the last rake.',

  'scope.group1.h': 'The takedown',
  'scope.group1.item1': 'Residential tree removal',
  'scope.group1.item2': 'Dead tree removal',
  'scope.group1.item3': 'Large tree removal',
  'scope.group1.item4': 'Oak and other big-canopy trees',
  'scope.group1.item5': 'Trees tight to homes, fences and driveways',
  'scope.group1.item6': 'Crane-assisted removal',
  'scope.group1.item7': 'Tree cutting and branch removal',

  'scope.group2.h': 'The ground afterwards',
  'scope.group2.item1': 'Stump grinding',
  'scope.group2.item2': 'Tree and stump removal',
  'scope.group2.item3': 'Debris cleanup and haul away',
  'scope.group2.item4': 'Yard clearing after the removal',
  'scope.group2.item5': 'Clearing ahead of landscaping or patio work',
  'scope.group2.item6': 'Final walkthrough included',
  'scope.group2.item7': 'Same-day and next-available scheduling',

  /* ---------------------------------------------------------------- *
   * S9 — Service area. The cities themselves are client.serviceAreaList.
   * ---------------------------------------------------------------- */
  'areas.eyebrow': 'Service area',
  'areas.h2a': 'Where the crews ',
  'areas.h2b': 'are working',
  'areas.lede':
    'If your address is close to this list but not on it, call anyway — we will tell you straight away whether we can get a crew to you.',

  /* ---------------------------------------------------------------- *
   * S10 — Six questions, all of them about risk, cost or cleanup.
   * ---------------------------------------------------------------- */
  'faq.eyebrow': 'Straight answers',
  'faq.h2a': 'The six questions ',
  'faq.h2b': 'homeowners actually ask',

  'faq.q1': 'How fast can someone actually get out here?',
  'faq.a1':
    'While crews are open we schedule same-day or next-available estimates. Send your details or call, and we will tell you honestly what this week looks like rather than booking you and hoping.',

  'faq.q2': 'What does tree removal cost?',
  'faq.a2':
    'It comes down to the size of the tree, where it sits, what is underneath it — house, fence, driveway, power lines — and how much cleanup is needed. Anyone quoting a firm price without seeing it is guessing. The free estimate exists so you get a real number instead of a range.',

  'faq.q3': 'The tree is right next to my house. Is that a problem?',
  'faq.a3':
    'It is the normal job rather than the hard one. Trees close to a structure come down in rigged sections instead of in one piece, and we bring a crane in when the job calls for it.',

  'faq.q4': 'Are you licensed and insured?',
  'faq.a4':
    'Yes — licensed and insured, with liability coverage up to $2 million. Ask every crew you get a quote from for the same thing, and be careful with anyone who cannot produce it.',

  'faq.q5': 'Does the stump go too?',
  'faq.a5':
    'Stump grinding is available with qualifying removals. Some homeowners want the tree gone and the stump left alone; others want the ground clear for grass, a patio or a fence line. We will price both during the estimate.',

  'faq.q6': 'What is left in the yard when you finish?',
  'faq.a6':
    'Debris cleanup and haul-away are part of the job, and we do a final walkthrough with you before the crew leaves. The point is that the tree is gone and the yard is usable again the same day.',

  /* ---------------------------------------------------------------- *
   * S11 — Final CTA
   * ---------------------------------------------------------------- */
  'finalCta.h2a': 'Still standing? ',
  'finalCta.h2b': 'Let us get it handled.',
  'finalCta.body':
    'One call, a free estimate, and a crew that leaves the yard cleaner than the tree did. $300 off qualifying removals booked through August 31.',
  'finalCta.callSub': 'Free estimate · $300 off through August 31',
  'finalCta.formLink': 'Or send your details instead',

  /* ---------------------------------------------------------------- *
   * S12 — Footer
   * ---------------------------------------------------------------- */
  'footer.tagline': 'Tree removal, stump grinding, and full cleanup.',
  'footer.rights': 'All rights reserved.',
  'footer.privacyLabel': 'Privacy Policy',
  'footer.termsLabel': 'Terms of Service',
  'footer.disclaimer':
    '$300 off applies to qualifying tree removal services booked through August 31. Ask about eligibility during your free estimate.',

  /* ---------------------------------------------------------------- *
   * Mobile action bar
   * ---------------------------------------------------------------- */
  'sticky.formLabel': 'Free estimate',
  'sticky.callSub': 'Tap to call',
};

export default removalBCopy;

/* ==================================================================== *
 * NOTES
 * ==================================================================== *
 *
 * 1. LOAD-BEARING TRAILING SPACES. Every `…h2a` / `…h1a` key ends with a space
 *    because the heading is rendered as two spans and the word gap lives in the
 *    first one. Trimming any of these fuses two words on the page:
 *
 *      hero.h1a 'Get it down '            signals.h2a 'Five things that turn a tree '
 *      proof.h2a 'Read the reviews '      work.h2a    'This is what the yard looks like '
 *      estimate.h2a 'Now the offer: '     process.h2a 'Four steps, '
 *      scope.h2a 'Removal is the job. '   areas.h2a   'Where the crews '
 *      faq.h2a 'The six questions '       finalCta.h2a 'Still standing? '
 *      cta.callPrefix 'Call '             hero.areaPrefix 'Crews working in '
 *
 * 2. CLAIM PROVENANCE. Every factual claim traces to source/removal/copy.md:
 *      $300 off / through August 31   → hero body, benefit strip
 *      licensed & insured, $2M        → benefit strip ('$2Million'), FAQ 6 ('$2M')
 *      4.9 Google rating              → hero rating badge
 *      same-day / next-available      → benefit strip, FAQ 1
 *      crane-assisted                 → services list
 *      stump grinding, stump removal  → services list, FAQ 4
 *      debris cleanup & haul away     → services list, benefit strip
 *      final walkthrough              → services list, process step 4
 *      free, no-obligation estimate   → form heading, process step 1
 *    Nothing above claims a certification, a warranty, a response-time guarantee,
 *    an emergency service, a years-in-business figure or a job count, because the
 *    source does not. If a client can substantiate more, it goes in
 *    copyOverrides — not in this file.
 *
 * 3. THE OFFER IS NAMED EXACTLY TWICE in the body of the page: once in the
 *    estimate section (where it is the reason to book now) and once in the final
 *    CTA. That is the structural bet this variant is making. Moving it back into
 *    the hero via an override turns removal-b into a re-skin of removal-a and the
 *    test stops measuring anything.
 * ==================================================================== */
