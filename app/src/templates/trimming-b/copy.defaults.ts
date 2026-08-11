/**
 * trimming-b — COPY DEFAULTS  ·  THE QUIET VARIANT OF THE TRIMMING PAIR.
 *
 * This is the B side of an A/B test against trimming-a. Same service, same offer,
 * same money: 10% off trimming, roof and gutter branch clearance included in the
 * job, and multi-tree work priced as a bundle. Everything below is a different way
 * of SELLING that, not a different thing being sold.
 *
 * THE HYPOTHESIS THIS COPY EXISTS TO TEST
 * ---------------------------------------
 * trimming-a opens on the discount and same-week availability, puts the form in the
 * hero, stacks five reviews mid-page and lists twenty services. It sells urgency.
 *
 * trimming-b opens on the one fact a discount cannot answer — a cut is permanent —
 * and sells JUDGMENT. The offer is stated once, plainly, three-quarters of the way
 * down. The form is the last thing on the page. Proof is inverted: ONE review, given
 * a whole screen, high up; the rest reduced to a quiet ledger near the bottom. The
 * long service list is replaced by three specific clearances and four refusals.
 *
 * WHY IT MIGHT WIN: trimming, unlike removal, is discretionary and reversible-looking
 * right up until it isn't. The buyer's real fear is not overpaying by 10%, it is
 * handing a healthy tree to someone who will butcher it. A page that reads like the
 * crew has standards is a stronger answer to that fear than a countdown is.
 *
 * TRUTHFULNESS RULES THIS FILE IS WRITTEN UNDER
 * ---------------------------------------------
 * Nothing here claims a certification, an insurance figure, a rating, a review
 * count, a crew size, a response time or a guarantee. Those are per-client facts and
 * they are either real for a given client or they are not; a default must not put
 * words in a client's mouth. What IS asserted is the offer itself and the arborual
 * reasoning behind the refusals (topping and spiking a retained tree really do harm
 * trees), both of which hold for every client this template is pointed at.
 *
 * WHAT IS NOT HERE — client DATA, resolved from the ClientRecord (R1):
 *   phone number  → client.phone.e164, rendered only through <PhoneLink/>
 *   company name  → client.name
 *   cities        → client.serviceArea / client.serviceAreaList
 *   reviews       → client.reviews[]
 *   photos + alts → client.photos.trimming[]
 *   consent copy  → client.consent.smsCopy
 *
 * No city, company name or phone number appears in any string below, so this file is
 * safe to ship to any client unedited. Sharpening it for a real client — naming the
 * town, naming the company — is done through client.copyOverrides['trimming-b'],
 * which is what the P3 editor writes to. Keys marked GEO-READY are the ones worth
 * overriding first: they read correctly as written but land harder with a place name.
 *
 * Consumption: makeCopy(client, 'trimming-b', trimmingBCopy). Unknown keys resolve
 * to '' rather than throwing, and every section drops itself when its strings are
 * empty (R5).
 */

export const trimmingBCopy: Record<string, string> = {
  /* ---------------------------------------------------------------- *
   * Header — one logo, one number. The sub-label is the only copy.
   * ---------------------------------------------------------------- */
  'header.callSub': 'Speak to the crew',

  /* ---------------------------------------------------------------- *
   * HERO — typographic, no form, no photograph, no discount.
   *
   * The discount is deliberately absent here. Moving it out of the hero IS the
   * variant. If this key list ever grows an offer line, the test is dead.
   * ---------------------------------------------------------------- */
  'hero.eyebrow': 'Tree Trimming',
  'hero.h1a': 'A cut is the one thing',
  'hero.h1b': 'you can’t take back.',
  'hero.body':
    'Anyone with a saw can make a tree smaller. Trimming well is knowing which limbs have to go and then stopping — because the branch you remove today is a branch the tree spends the next decade replacing, if it replaces it at all.',
  'hero.callSub': 'Talk it through first',
  'hero.secondary': 'Request a walk-through',

  /* ---------------------------------------------------------------- *
   * THE STANDARD — what every trim clears, stated as three specifics.
   * This replaces trimming-a's twenty-item service list. Three things you can
   * check afterward beat twenty you cannot.
   * ---------------------------------------------------------------- */
  'standard.eyebrow': 'The standard',
  'standard.h2a': 'Every trim clears',
  'standard.h2b': 'the same three lines.',
  'standard.body':
    'Before we talk about shape, three things get handled on every job. They are the reason most people call, and they are the parts you can walk outside and verify when we are gone.',

  'standard.item1.h': 'The roof line',
  'standard.item1.body':
    'Limbs that touch, rub or hang over the roof are cut back to a clear margin, so branches stop dragging across the shingles every time the wind moves and stop dropping their debris directly onto the house.',

  'standard.item2.h': 'The gutter line',
  'standard.item2.body':
    'The branches feeding your gutters come back, and the debris the trim creates comes out of the gutters before we leave. Clearing the branch and leaving the gutter packed is half a job.',

  'standard.item3.h': 'The deadwood',
  'standard.item3.body':
    'Dead, cracked and hanging limbs come out of the canopy first — over the driveway, the walkway, the patio, the fence line, anywhere one would land on something that matters.',

  'standard.close':
    'Anything past those three lines is a conversation, not an assumption. We show you what we would cut and why, and you decide before a saw starts.',

  /* ---------------------------------------------------------------- *
   * TESTIMONY — ONE review, full width, early. Content is client data.
   * Renders nothing at all for a client with no reviews (R5).
   * ---------------------------------------------------------------- */
  'testimony.eyebrow': 'In their words',

  /* ---------------------------------------------------------------- *
   * RESTRAINT — the refusals. The emotional lever of this whole page:
   * trust built by naming what we will NOT do, which a discount cannot buy.
   * ---------------------------------------------------------------- */
  'restraint.eyebrow': 'Where we stop',
  'restraint.h2a': 'Four things',
  'restraint.h2b': 'we won’t do.',

  'restraint.item1.h': 'We won’t top your tree.',
  'restraint.item1.body':
    'Cutting a canopy flat to make a tree smaller is the fastest way to ruin one. What grows back is a thicket of weak, fast shoots that are more likely to fail in wind than what was there before. If a tree genuinely has to come down in height, we will tell you what that costs the tree.',

  'restraint.item2.h': 'We won’t spike a tree we’re not removing.',
  'restraint.item2.body':
    'Climbing spikes put a wound in the trunk at every step. On a removal that is irrelevant. On a tree that is staying, it is damage you paid us to cause, so we climb or reach it another way.',

  'restraint.item3.h': 'We won’t take more than the reason we came.',
  'restraint.item3.body':
    'A crew already on site has every incentive to keep cutting. We quote the work that solves the problem you called about, and if we think another limb should come off, you hear the reason before it does.',

  'restraint.item4.h': 'We won’t leave the cleanup to you.',
  'restraint.item4.body':
    'Limbs, brush and the debris the trim knocks loose go with us. The measure of a finished job is that the only evidence we were there is the tree.',

  /* ---------------------------------------------------------------- *
   * WORK — the client's own trimming photographs. No heading survives an
   * empty photo set; the section removes itself entirely.
   * ---------------------------------------------------------------- */
  'work.eyebrow': 'Recent work',
  'work.h2': 'Jobs we’ve finished.',

  /* ---------------------------------------------------------------- *
   * THE OFFER — stated once, late, without a countdown.
   *
   * Same money as trimming-a. The variant is that you reach it having already
   * been told how we cut, so it reads as a reason to book rather than a reason
   * to hurry.
   * ---------------------------------------------------------------- */
  'offer.eyebrow': 'This season',
  'offer.h2a': '10% off',
  'offer.h2b': 'your trimming.',
  'offer.body':
    'The discount is on the trimming work itself, and the two things people usually get billed for separately are not extras here.',

  'offer.term1.h': '10% off trimming',
  'offer.term1.body': 'Applied to the trimming estimate you agree to at the walk-through.',

  'offer.term2.h': 'Roof and gutter clearance included',
  'offer.term2.body': 'Both lines are part of the trim, not an add-on billed at the end.',

  'offer.term3.h': 'More than one tree, priced as a bundle',
  'offer.term3.body':
    'The crew, the truck and the setup are already at your address. Several trees are priced together rather than one job at a time.',

  'offer.note': 'Mention it when you call, or leave it in your request and we will apply it to the estimate.',

  /* ---------------------------------------------------------------- *
   * REVIEWS — the remaining reviews, as a quiet ledger. Client data.
   * ---------------------------------------------------------------- */
  'reviews.eyebrow': 'Reviews',
  'reviews.h2': 'What people said afterward.',

  /* ---------------------------------------------------------------- *
   * AREAS — plain, set as running text. No marquee, no animation: this is
   * the quiet variant, and 25 pills sliding past is the loud answer.
   * The cities themselves are client.serviceAreaList.
   * ---------------------------------------------------------------- */
  'areas.eyebrow': 'Service area',
  'areas.h2': 'Where we work.',

  /* ---------------------------------------------------------------- *
   * FAQ — six questions, answered at length. trimming-a runs a longer list of
   * shorter answers; this side tests whether fewer, fuller answers read as more
   * competent.
   * ---------------------------------------------------------------- */
  'faq.h2a': 'Questions worth',
  'faq.h2b': 'asking first.',

  'faq.q1': 'How much of the tree will you actually take?',
  'faq.a1':
    'As little as solves the problem. On a normal trim that means the deadwood, the limbs on the roof, the branches feeding the gutters, and whatever is rubbing, crossing or hanging where it should not be. We will walk the tree with you and point at what we intend to cut before we start, so nothing about the finished shape is a surprise.',

  'faq.q2': 'Is there a wrong time of year to trim?',
  'faq.a2':
    'Dead, broken and hazardous limbs can come out at any time of year — waiting on a limb hanging over a walkway makes no sense. Heavier shaping is easier on a tree in its dormant season, and some species are better left alone during the months when disease spreads most easily. Tell us the species and what you want done and we will tell you honestly whether it is worth waiting.',

  'faq.q3': 'Do you really clear the gutters, or just the branches?',
  'faq.a3':
    'Both. The branches feeding the gutter are cut back, and the debris the trim puts into the gutters is cleared before we leave. It is part of the job rather than a line item, because leaving a customer with clean branches and a packed gutter is not finishing.',

  'faq.q4': 'What does trimming cost?',
  'faq.a4':
    'It depends on the size of the tree, how much has to come out, and what is underneath it — a tree over open lawn and the same tree over a roof, a fence and a driveway are not the same job. That is what the walk-through is for: you get a real number for your tree, not a range for a tree like yours.',

  'faq.q5': 'How does the discount work if I have several trees?',
  'faq.a5':
    'Multiple trees are quoted as one bundled job rather than several separate ones, because the crew and equipment are already on site, and the 10% comes off the trimming work on top of that. It is worth mentioning every tree you are thinking about at the walk-through, even the ones you are unsure about.',

  'faq.q6': 'What actually happens at the walk-through?',
  'faq.a6':
    'We meet you at the tree, look at the canopy, the trunk and what sits under it, and talk through what should come off and what should be left alone. You get the price and the plan before anything is cut, and no part of it commits you to booking.',

  /* ---------------------------------------------------------------- *
   * ESTIMATE — the form, LAST. In trimming-a it is the first thing in the hero.
   * Moving it here is the structural half of the test.
   * ---------------------------------------------------------------- */
  'estimate.eyebrow': 'The walk-through',
  'estimate.h2a': 'Have someone',
  'estimate.h2b': 'look at the tree.',
  'estimate.body':
    'Leave a name and a number. We will call, ask a couple of questions about the tree and where it sits, and set a time to walk the property with you. Price and plan before anything is cut.',
  'estimate.callPrefix': 'Or call ',

  'form.label.firstName': 'First name',
  'form.label.lastName': 'Last name',
  'form.label.phone': 'Phone',
  'form.label.email': 'Email (optional)',
  'form.submit': 'Request the walk-through',

  /* ---------------------------------------------------------------- *
   * Footer. The company name and the legal URLs are client data; only the link
   * labels and the rights sentence are copy.
   * ---------------------------------------------------------------- */
  'footer.rights': 'All rights reserved.',
  'footer.privacyLabel': 'Privacy Policy',
  'footer.termsLabel': 'Terms of Service',

  /* ---------------------------------------------------------------- *
   * <head>
   * GEO-READY: both of these read correctly with no place name, and read better
   * with one. Override per client.
   * ---------------------------------------------------------------- */
  'meta.title': 'Tree Trimming — 10% Off, Roof & Gutter Clearance Included',
  'meta.description':
    'Careful tree trimming: deadwood out, roof and gutter lines cleared, cleanup included. 10% off trimming this season, with bundle pricing on multiple trees.',
};

export default trimmingBCopy;

/* ==================================================================== *
 * NOTES
 * ==================================================================== *
 *
 * 1. SPLIT HEADINGS. Keys suffixed `a` / `b` are two halves of one sentence, set on
 *    two lines by design rather than by a builder artifact. They are rendered as
 *    separate block spans, so — unlike removal-a — NO key in this file carries a
 *    load-bearing leading or trailing space. Every string is safe to trim.
 *
 * 2. CURLY APOSTROPHES (’) are the real U+2019 character throughout, matching the
 *    factory's other copy files. Straight quotes will look wrong beside them.
 *
 * 3. KEYS DELIBERATELY ABSENT, and why:
 *      - no rating, star count or review count. trimming-a shows a badge; a default
 *        that ships "4.9" is a fabricated number on any client who is not at 4.9.
 *        Review CONTENT here is entirely client.reviews[].
 *      - no "licensed and insured", no coverage figure, no certification. True for
 *        most clients, but not something a template should assert on their behalf.
 *      - no availability promise. Same-week is trimming-a's lever; claiming it here
 *        would blur the test AND commit every client to a schedule.
 *      - no offer expiry date. "This season" is honest and does not go stale in a
 *        way that turns into a false statement three weeks after launch.
 *
 * 4. THE ONE PLACE THE OFFER APPEARS is the `offer.*` block. If a future edit adds
 *    the discount to hero.body or to the header, this stops being the variant it was
 *    built to be — offer placement is the independent variable.
 * ==================================================================== */
