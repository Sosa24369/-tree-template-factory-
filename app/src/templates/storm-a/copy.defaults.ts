/**
 * storm-a — COPY DEFAULTS  ·  THE STORM CONTROL.
 *
 * This is NOT a byte-for-byte reproduction of a source page. The live storm page was
 * ~69% un-edited removal boilerplate (a $300 summer-removal offer, West Dallas geo on
 * a Fort Worth page, a removal FAQ); reproducing it would give a "storm control" that
 * is mostly a removal page. So this copy was written for storm and APPROVED in
 * docs/storm-copy-draft.md, with three decisions locked at approval:
 *
 *   1. SAME-DAY ASSESSMENT IS A FIRM PROMISE, not the source's hedged "in most
 *      cases". The trust row and FAQ state it plainly.
 *   2. AFTER-HOURS CALLS ARE ANSWERED — the night/weekend FAQ stays and is a yes.
 *   3. THE OFFER IS A FREE ON-SITE ASSESSMENT + WRITTEN DOCUMENTATION, never a
 *      discount. Discounting reads wrong when someone's roof is open; on emergency
 *      intent the currency is availability and speed.
 *
 * Kept from the draft: the emergency hero premise, the 911 safety line (a safety
 * instruction, rendered prominently, never softened), fence repair as a first-class
 * service, and insurance language that stops at documentation and never implies a
 * claim will be paid ("Coverage decisions are between you and your carrier").
 *
 * GEOGRAPHY IS CLIENT DATA. The draft targets Fort Worth / Tarrant County because
 * that is what the source storm page targets, but nothing here hardcodes a city:
 * the hero composes the area from client.serviceArea and the service-area section
 * renders client.serviceAreaList. Every string below reads correctly with no place
 * name and better with one, so a client in any market renders without an override.
 */

export const stormACopy: Record<string, string> = {
  /* ---------------------------------------------------------------- *
   * <head>. The company name is DATA and is appended in index.tsx, so this needs
   * no per-client override.
   * ---------------------------------------------------------------- */
  'meta.title': 'Storm Damage Tree Removal — Emergency Response',
  'meta.description':
    'Storm damage? Emergency tree removal, fence repair and cleanup from a licensed, insured local crew — with written documentation for your insurer. Free on-site assessment.',

  /* ---------------------------------------------------------------- *
   * Header + the shared call CTA.
   * ---------------------------------------------------------------- */
  'header.badge': 'Licensed & insured',
  'header.callSub': 'Storm line — tap to call',
  'cta.callPrefix': 'Call ',
  'cta.callSub': 'We’ll get a crew moving', // TYPO FIX 2026-08-12: curly apostrophe per file convention

  /* ---------------------------------------------------------------- *
   * HERO — the emergency premise. Speed and availability are the currency.
   *
   * The headline is composed in Hero.tsx: with a service area it reads
   * "Storm Damage in {area}? We're Already Moving."; with none it falls back to
   * hero.h1NoArea so it is never "Storm Damage in ? …" (R5).
   * ---------------------------------------------------------------- */
  'hero.eyebrow': 'Emergency storm response',
  'hero.h1InPrefix': 'Storm Damage in ',
  'hero.h1NoArea': 'Storm Damage?',
  'hero.h1b': 'We’re Already Moving.', // TYPO FIX 2026-08-12: curly apostrophe per file convention
  'hero.sub':
    'Emergency tree removal, fence repair and cleanup — a licensed, insured local crew, and written documentation for your insurer.',
  'hero.body':
    'A tree on the house, a fence flattened, a yard full of wreckage. You need it gone, and you need a record of what happened. Our crew clears storm damage and photographs and documents every job before we touch it — so you have what your insurer asks for.',
  // Rendered prominently, NOT as fine print. It is a safety instruction.
  'hero.safety':
    'If a tree is touching a power line, or the structure looks unsafe, call 911 first and stay clear. Then call us and we’ll get a crew moving.',
  'hero.primaryCta': 'Get My Free Storm Assessment',
  'hero.secondaryPrefix': 'Call ',
  // Optional desktop art overlay badge (hidden entirely when the client has no art).
  'hero.artBadgeStars': '★★★★★',
  'hero.artBadgeValue': 'Same day',
  'hero.artBadgeLabel': 'Trees on homes & vehicles first',

  /* ---------------------------------------------------------------- *
   * ASSESSMENT FORM — high on the page (emergency intent wants action now).
   * ---------------------------------------------------------------- */
  'estimate.eyebrow': 'Free on-site assessment',
  'estimate.h2a': 'Tell us what happened. ',
  'estimate.h2b': 'We’ll call you back.', // TYPO FIX 2026-08-12: curly apostrophe per file convention
  'estimate.lede':
    'Thirty seconds now, and we’ll call you to get a crew scheduled. Trees on homes and vehicles are first in the queue.',
  'estimate.formHeading': 'Get a Free Storm Damage Assessment',
  'estimate.formSub': "30 seconds. We’ll call you back and get a crew scheduled.",
  'estimate.label.firstName': 'First name',
  'estimate.label.lastName': 'Last name',
  'estimate.label.phone': 'Phone',
  'estimate.label.email': 'Email (optional)',
  'estimate.submit': 'Request Emergency Callback',
  'estimate.orCall': 'Storm on your property right now?',
  'estimate.formFootnote': 'No cost, no obligation. We assess and document on site.',

  /* ---------------------------------------------------------------- *
   * TRUST ROW — four points. Same-day is a FIRM promise (locked decision 1).
   * ---------------------------------------------------------------- */
  'trust.item1': 'No-cost on-site storm assessment',
  'trust.item2': 'Same-day response — trees on homes and vehicles first',
  'trust.item3': 'Licensed and insured up to $2 million — proof on request',
  'trust.item4': 'Damage photographed and documented for your claim',

  /* ---------------------------------------------------------------- *
   * WHAT WE HANDLE — three groups. Fence repair is a first-class service.
   * ---------------------------------------------------------------- */
  'handle.eyebrow': 'What we handle',
  'handle.h2a': 'Storm damage, ',
  'handle.h2b': 'start to finish.',
  'handle.lede':
    'Trees, fences and the mess a storm leaves behind — cleared by one crew, documented as we go.',

  'handle.group1.h': 'Trees',
  'handle.group1.item1': 'Tree fell on a house or roof',
  'handle.group1.item2': 'Tree fell on a car or driveway',
  'handle.group1.item3': 'Tree leaning on a structure',
  'handle.group1.item4': 'Split or storm-cracked trees',
  'handle.group1.item5': 'Downed tree removal',
  'handle.group1.item6': 'Safe removal beside homes and power drops',

  'handle.group2.h': 'Fences',
  'handle.group2.item1': 'Fence crushed by a fallen tree',
  'handle.group2.item2': 'Leaning or blown-over fence',
  'handle.group2.item3': 'Storm-damaged fence sections',
  'handle.group2.item4': 'Wood and metal fence repair',
  'handle.group2.item5': 'Full fence-line replacement',
  'handle.group2.item6': '',

  'handle.group3.h': 'Cleanup',
  'handle.group3.item1': 'Limbs and branches hauled away',
  'handle.group3.item2': 'Yard wreckage cleared',
  'handle.group3.item3': 'Full property clearing',
  'handle.group3.item4': 'Haul-away of damaged material',
  'handle.group3.item5': 'Same-day cleanup where access allows',
  'handle.group3.item6': '',

  /* ---------------------------------------------------------------- *
   * HOW STORM RESPONSE WORKS — four steps.
   * ---------------------------------------------------------------- */
  'process.eyebrow': 'How storm response works',
  'process.h2a': 'From the call ',
  'process.h2b': 'to a cleared yard.',
  'process.step1.label': 'Step 1',
  'process.step1.h': 'Call or request an assessment',
  'process.step1.body':
    'Tell us what happened: tree on the house, fence down, yard full of debris. If a tree is on a power line, call 911 first and stay clear.',
  'process.step2.label': 'Step 2',
  'process.step2.h': 'We assess and document on site',
  'process.step2.body':
    'We look at the tree, the structure, access and safety, then give you a clear free estimate on site — and photograph and document the damage for your records.',
  'process.step3.label': 'Step 3',
  'process.step3.h': 'We clear it, same-day where possible',
  'process.step3.body':
    'Our crew handles the cutting, removal and haul-off with the right equipment for work beside homes and power drops.',
  'process.step4.label': 'Step 4',
  'process.step4.h': 'Walkthrough before we leave',
  'process.step4.body':
    'We walk the property with you and confirm the work is complete, the debris is gone and the yard is safe to use again.',

  /* ---------------------------------------------------------------- *
   * RECENT STORM WORK — gallery heading. Photographs are client DATA and the
   * section hides itself when the client has none (see Work.tsx).
   * ---------------------------------------------------------------- */
  'work.eyebrow': 'Recent storm work',
  'work.h2a': 'What we clear ',
  'work.h2b': 'after a storm.',
  'work.lede': 'Real jobs, photographed on site. Every image below is our own crew’s work.',

  /* ---------------------------------------------------------------- *
   * INSURANCE DOCUMENTATION — never implies coverage (locked wording).
   * ---------------------------------------------------------------- */
  'insurance.eyebrow': 'For your claim',
  'insurance.h2a': 'Documentation ',
  'insurance.h2b': 'your insurer will ask for.',
  'insurance.body':
    'We photograph the damage before we start, record what was removed and repaired, and give you a written breakdown you can hand to your carrier.',
  'insurance.point1': 'Before-and-after photographs of the damage and the work',
  'insurance.point2': 'A written breakdown of what was removed and repaired',
  'insurance.point3': 'Provided at no cost, whether or not you file a claim',
  'insurance.disclaimer':
    'Coverage decisions are between you and your carrier — but the documentation is on us, and it is included at no cost.',

  /* ---------------------------------------------------------------- *
   * SERVICE AREA — cities render from client.serviceAreaList (nothing hardcoded).
   * ---------------------------------------------------------------- */
  'areas.eyebrow': 'Where we respond',
  'areas.h2a': 'Storm crews ',
  'areas.h2b': 'across the area.',
  'areas.lede': 'If your suburb is on this list, a crew can be on the way. If it isn’t, call and ask.',

  /* ---------------------------------------------------------------- *
   * FAQ — eight questions. Locked decisions 1 (firm same-day) and 2 (after-hours
   * answered) both live here.
   * ---------------------------------------------------------------- */
  'faq.eyebrow': 'Storm questions',
  'faq.h2a': 'Answered ',
  'faq.h2b': 'before you call.',
  'faq.q1': 'How fast can you get here after a storm?',
  'faq.a1':
    'We respond the same day. Trees on homes, vehicles and other hazards go to the front of the queue, and you get an on-site assessment the same day you call.',
  'faq.q2': 'A tree fell on my house — what do I do first?',
  'faq.a2':
    'If the tree is touching a power line or the structure looks unsafe, call 911 first and stay clear. Then call us and we’ll get a crew moving.',
  'faq.q3': 'Do you remove trees off roofs, cars and fences?',
  'faq.a3': 'Yes. Trees on structures and vehicles are exactly what our storm crew handles.',
  'faq.q4': 'Do you repair storm-damaged fences?',
  'faq.a4': 'Yes — fence repair and replacement, including fences crushed by fallen trees.',
  'faq.q5': 'Will you help with my insurance claim?',
  'faq.a5':
    'We photograph and document the damage and provide a written breakdown you can give your insurer. Coverage decisions are between you and your carrier.',
  'faq.q6': 'How much does storm tree removal cost?',
  'faq.a6': 'Every job is different, so we quote on site. The estimate is free and there’s no obligation.',
  'faq.q7': 'Do you clean up the debris afterward?',
  'faq.a7': 'Yes. Limbs, branches and wreckage are hauled off, and we do a final walkthrough with you.',
  'faq.q8': 'Can you come out at night or on a weekend?',
  'faq.a8':
    'Yes. Storms don’t keep business hours, so we answer after-hours calls. Tell us what happened, and if a crew can safely work it, we will.',

  /* ---------------------------------------------------------------- *
   * FINAL CTA.
   * ---------------------------------------------------------------- */
  'final.h2a': 'Tree on your house? ',
  'final.h2b': 'Fence down?',
  'final.body':
    'Tell us what happened and we’ll get a crew moving. Free on-site assessment, damage documented, debris hauled.',
  'final.primaryCta': 'Get My Free Storm Assessment',

  /* ---------------------------------------------------------------- *
   * STICKY mobile bar + footer.
   * ---------------------------------------------------------------- */
  'sticky.callSub': 'Storm line',
  'sticky.formLabel': 'Free assessment',

  'footer.tagline': 'Emergency storm damage response — trees, fences and cleanup, documented for your insurer.',
  'footer.disclaimer':
    'Free on-site assessment and written documentation included at no cost. Coverage decisions are between you and your carrier.',
  'footer.rights': 'All rights reserved.',
  'footer.privacyLabel': 'Privacy Policy',
  'footer.termsLabel': 'Terms of Service',
};

export default stormACopy;
