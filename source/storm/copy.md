# copy.md — texastreetopsllc.com/storm  (Texas Tree Tops)

SOURCE OF TRUTH. Captured 2026-08-08 from the live GHL page.
Every string below is byte-identical to the RENDERED page text — i.e. to what a browser
paints, after HTML character entities have been resolved. Typos, doubled words,
wrong-city references, trailing/leading spaces and non-breaking spaces are
DELIBERATELY PRESERVED. Do not "fix" anything.

ENTITY CONVENTION (read before rebuilding HTML): entities are recorded here in decoded /
rendered form, and the raw source encoding is stated in the annotation beside the string.
Two strings on this page are affected: `&#9733;` is recorded as `★★★★★` (Section 1d) and
`&middot;` is recorded as `·` (Section 8a). To be byte-identical at the HTML level rather
than at the rendered-text level, emit the entity, not the decoded character.

Legend for annotations in `( )` after a string — these are notes, not copy.
`[NBSP]` markers in notes point at U+00A0 characters that ARE present in the string.
Sections are numbered in document order and named descriptively by me.

---

## Section 1 — Header + Hero + Lead Form  (`section-9JRQtJShoU`)

### 1a. Header bar — DESKTOP variant (`row-QUXhAWTlOS`, class `desktop-only`)
- link (tel:+16823657478) main: "(682) 365-7478"
- link (tel:+16823657478) sub: "Tap To Call " (trailing space is in the source)
- link aria-label: "(682) 365-7478 Tap To Call " (trailing space in the source)

### 1b. Header bar — MOBILE variant (`row-XOS6-tOzGd`, class `mobile-only`)
- link (tel:+14694021196) main: "682-452-0735"
- link (tel:+14694021196) sub: "Tap to call"
- link aria-label: "682-452-0735 Tap to call"
  (NOTE: the visible number and the dialled number DO NOT MATCH. See structure.md → PHONE TREATMENT.)

### 1c. Header — orphaned button (`button-3zhCn5xTPd`) — PRESENT IN DOM, NEVER VISIBLE
- button: "Call (469) 402-1196"
- button aria-label: "Call (469) 402-1196 " (trailing space in the source)
  (NOTE: this button sits in `col-6PAsUZZzSt` which is `desktop-only`, nested inside
   `row-XOS6-tOzGd` which is `mobile-only`. Hidden at every breakpoint. Action = openPopup
   → `hl_main_popup-eJnCVAV3I5`, and that popup has zero elements in the funnel payload.)

### 1d. Google rating badge — Custom HTML (`custom-code-9vG6F0bwt2`)
- body: "Google"
  (rendered from six individually-coloured single-letter spans: G o o g l e — the clean-text
   extractor emitted them as "G o o g l e" with spaces. The visible word is "Google".)
- body: "★★★★★"
- body: "4.9"
- body: "Read our latest verified reviews below"

### 1e. Hero copy
- h1: "Tree On Your House? We're On Our Way."
  (source markup: `<h1><strong>Tree On Your House? </strong>We're On Our Way.</h1>`)
- h2: "Fort Worth emergency tree removal — storm damage cleared fast by a licensed, insured local crew."
- body: "Tree fell on your house, roof, or car? Fence down? Don't wait. We handle emergency tree removal and storm cleanup across Fort Worth and Tarrant County, and we document the damage for your records. Free on-site estimate."

### 1f. Form headings — DESKTOP (`col-yL4DnEssSU`)
- h2: "Get a Free Storm Damage Estimate"   (wrapper `sub-heading-TVyXLNMxiV`, class `desktop-only`)
- h2: "30 seconds. We call you back fast."   (wrapper `sub-heading-sqIBTrDyGt`)
- h2: ""   (an EMPTY second `<h2>` inside the same element; global CSS gives empty headings
   `content:"\a0"`, so it renders as one blank non-breaking-space line. Preserve the empty h2.)
- body: "Enter your info and we’ll call you with the next steps for your tree removal quote"
  (wrapper `paragraph-BOeRKrin1Q` carries BOTH `desktop-only` AND `mobile-only` → NEVER VISIBLE at any breakpoint. Still in the DOM.)

### 1g. Form headings — MOBILE (`col-vk8rBPkJ5b`, class `mobile-only`)
- h2: "Get Your Free Tree Removal Estimate"
  (source markup: `<h2>Get Your <strong><span style="color: var(--color-ndisocfr)">Free Tree Removal Estimate</span></strong></h2>`)
- body: "Enter your info and we’ll call you with the next steps for your tree removal quote"
  (wrapper `paragraph-hPbI9yy1Ja` also carries BOTH `desktop-only` AND `mobile-only` → NEVER VISIBLE.)

### 1h. Lead form (`form-5gd7-YxgNV` → GHL form "Storm Watch Form")
- label: "First Name"
- placeholder: "Enter your first name"
- label: "Last Name"
- placeholder: "Enter your last name"
- label: "Phone"
- label (required marker): "*"
- placeholder: "Enter phone number"
- label: "Email (Optional)"
- placeholder: "Enter email address"
- button (submit): "Submit Form - Request Emergency Callback"
  (stored in GHL as `<p>Submit Form - Request Emergency Callback</p>`)

---

## Section 2 — Recent-Jobs Photo Slider  (`section-6TzwOQDUZq`)

NO TEXT. A Swiper.js slider (`custom-code-75tiX9YkJq`) holding 15 Google Business Profile
photos, every one carrying the same alt text:
- image alt (×15): "Texas Tree Tops tree removal in Fort Worth"

---

## Section 3 — Four Value Props + Call CTA  (`section-a8UgWW3zd0`)

- body: "No Cost, Storm Damage"          (bold; own `<p>`)
- body: "On-site assessment"             (bold; own `<p>`)
- body: "Fast, Same-Day Response - We prioritize trees on property and emergency hazards"
  ("Fast, Same-Day Response" is bold, then a plain " - We prioritize…". An EMPTY `<p></p>` follows it in the same element.)
- body: "Licensed & Insured Insured up to $2 million — proof on request"
  (source markup: `<strong>Licensed &amp; Insured </strong>Insured up to $2 million — proof on request`
   — the trailing space inside `<strong>` is the only separator, and the word "Insured" appears TWICE.
   An EMPTY `<p></p>` follows it in the same element.)
- body: "Removal, Cleanup & Walkthrough"                          (bold, then a `<br>`)
- body: "Debris hauled, property cleared, final walkthrough"      (same `<p>`, after the `<br>`)

### 3a. CTA — DESKTOP (`button-w6i_nJR0lW`, class `desktop-only`)
- link (tel:+16823657478) main: "Call (682) 365-7478"
- link (tel:+16823657478) sub: "Call Now For A Free Estimate Today"
  ([NBSP] — U+00A0 between "Now" and "For", NOT a normal space)

### 3b. CTA — MOBILE (`button-Tk8AUj2tvs`, class `mobile-only`)
- link (tel:682-452-0735) main: "682-452-0735"
- link (tel:682-452-0735) sub: "Call Now For A Free Estimate Today"
  ([NBSP] — U+00A0 between "Now" and "For")
  (NOTE: this href is a BARE, non-E.164 `tel:682-452-0735`. See structure.md → PHONE TREATMENT.)

---

## Section 4 — Why Homeowners Choose Us + Google Reviews Slider  (`section-evIFlIWTQp`)

- h1: "Why West Dallas Homeowners"
- h1: "Choose Texas Tree Tops for Tree Removal"
  (two separate `<h1>` elements inside one heading component; the second is wrapped in `<strong>`)
- body: "Texas Tree Tops provides fast, reliable tree removal service for homeowners in Highland Park, University Park, Kessler Park / N. Oak Cliff, Colleyville, Coppell, Flower Mound, Cedar Hill / DeSoto / Duncanville, Southlake, Colleyville, Grapevine Keller Trophy Club Westlake Mansfield Fort Worth Hurst, Euless, Bedford, Coppell, Carrollton, Farmers Branch, Addison, Irving, Grand Prairie, and Surrounding West Dallas"
  (PRESERVE AS IS: this is a Fort Worth storm page that says "West Dallas"; "Colleyville" and
   "Coppell" each appear twice; "Grapevine Keller Trophy Club Westlake Mansfield Fort Worth Hurst"
   runs with no commas; there is no full stop at the end.)

### 4a. Review card 1 (`custom-code-8BO6xwlaH1`, Swiper slide 1)
- h4: "Amy Pulaski"
- body: "Google Review · a month ago"
- body: "Great service! I had a dead tree removed and replaced. Daniel sent numerous photos of trees for my approval. The two gentlemen who came to do the work were on time, courteous, and professional. They went above and beyond to make sure I was happy when they finished. I would highly recommend them."

### 4b. Review card 2
- h4: "Carol Malcik"
- body: "Local Guide · 9 months ago"
- body: "Texas Tree Tops removed a massive tree over 100 feet tall from our backyard. The removal was challenging due to the tree's proximity to our house, the neighbors' house, the fence, and our pool. The team demonstrated exceptional skill and care."

### 4c. Review card 3
- h4: "John Bundren"
- body: "Google Review · 11 months ago"
- body: "The Texas Tree Tops team did an amazing job taking down a huge pecan tree in our yard. They were fast, professional, and affordable. They had to navigate a tricky overhang on our neighbor's house as well. Daniel was also great to work with."

### 4d. CTA (`button--kIKpIzaUL`)
- link (tel:+16823657478) main: "(682) 365-7478"
- link (tel:+16823657478) sub: "Call Now For A Free Estimate Today"   ([NBSP])

---

## Section 5 — Restoration Results Guaranteed + Photo Grid  (`section-i0C6s9XHTY`)

- h1: "Restoration Results Guaranteed"
  (source markup: `<h1>Restoration <strong><span style="color: var(--color-ndisocfr)">Results Guaranteed</span></strong></h1>`)
- body: "Our large crews use specialized equipment to complete removals safe and efficiently — because when a tree needs to come down, you need it handled fast and done right!"
  (PRESERVE: "removals safe and efficiently", not "safely")

### 5a. CTA (`button-GecFCrteC2`)
- link (tel:+16823657478) main: "(682) 365-7478"
- link (tel:+16823657478) sub: "Call Now For A Free Estimate Today"   ([NBSP])

---

## Section 6 — Tree Removal Services We Offer  (`section-Pt0S1QTMn0`)

- h1: "Tree Removal Services We Offer"
  (source markup: `<h1>Tree Removal <strong><span style="color: var(--color-ndisocfr)">Services We Offer</span></strong></h1>`)
- body: "Safe, clean, and professional tree removal service for East Dallas homeowners who need the job handled without a mess left behind."
  (PRESERVE: "East Dallas" on a Fort Worth storm page.)

### 6a. Service card 1 (`col-4VDpyH4uXR` → `bulletList-DW1kSshz9P`)
- listItem: "Tree fell on house or roof"
- listItem: "Tree fell on car or driveway"
- listItem: "Tree leaning on house"
- listItem: "Split or storm-cracked trees"
- listItem: "Downed tree removal"
- listItem: "Safe removal near homes "   (TRAILING SPACE in the source)
- listItem: "Local Tree Removal Company"

### 6b. Service card 2 (`col-OE656IgCt6` → `bulletList-kmcbJRQ19n`)
- listItem: "Limbs and branches hauled away"
- listItem: "Yard wreckage cleared"
- listItem: "Tree and Stump Removal"
- listItem: "Same-day cleanup available"
- listItem: "Yard Clearing After Tree Removal"
- listItem: "Full property clearing"
- listItem: "Tree Cutting/Branch Removal"

### 6c. Service card 3 (`col-SZntXtwarW` → `bulletList-NHH49kGF49`)
- listItem: "Storm-damaged fence sections"
- listItem: "Fence crushed by fallen trees"
- listItem: "Leaning or blown-over fence "   (TRAILING SPACE in the source)
- listItem: " Wood and metal fence repair"   (LEADING SPACE in the source)
- listItem: "Full fence line replacement"
- listItem: "Haul-away of damaged material"

### 6d. CTA (`button-_LS21RqVvN`)
- link (tel:+16823657478) main: "(682) 365-7478"
- link (tel:+16823657478) sub: "Call Now For A Free Estimate Today"   ([NBSP])

---

## Section 7 — Areas We Serve (scrolling pill marquee)  (`section-o8EAaPwuM8`)

- h1: "Areas We Serve"
  (source markup: `<h1><strong><span style="color: var(--color-ndisocfr)">Areas </span></strong>We Serve</h1>`)
- h2: "Top Rated West Dallas Local Tree Trimming Company"
  (PRESERVE: "West Dallas" and "Tree Trimming" on a Fort Worth storm-REMOVAL page.)

Marquee content (`custom-code-A8otsFIT--`). Three rows. Each row's group of pills is
duplicated in the DOM by an `aria-hidden="true"` clone for the infinite-scroll effect —
recorded ONCE here. See structure.md → RESPONSIVE / DUPLICATION NOTES.

Row 1:
- listItem: "Highland Park"
- listItem: "University Park"
- listItem: "Kessler Park"
- listItem: "Colleyville"
- listItem: "Coppell"
- listItem: "Flower Mound"
- listItem: "Cedar Hill"
- listItem: "DeSoto"
- listItem: "Duncanville"

Row 2:
- listItem: "Southlake"
- listItem: "Grapevine"
- listItem: "Keller"
- listItem: "Trophy Club"
- listItem: "Westlake"
- listItem: "Mansfield"
- listItem: "Fort Worth"
- listItem: "Hurst"

Row 3:
- listItem: "Euless"
- listItem: "Bedford"
- listItem: "Carrollton"
- listItem: "Farmers Branch"
- listItem: "Addison"
- listItem: "Irving"
- listItem: "Grand Prairie"
- listItem: "West Dallas"

---

## Section 8 — Feature Blocks (SEO copy)  (`section-cbglAhOxWH`, `custom-code-LtvZmszk9_`)

### 8a. Block A — copy + truck photo
- body (badge): "Top Rated · 5-Star Service"
  (SOURCE ENCODING: the HTML is literally `Top Rated &middot; 5-Star Service`. Browsers render "·".
   The clean-text extractor left the entity undecoded, which is why storm.text.txt shows `&middot;`.
   To be byte-identical at the HTML level, reproduce `&middot;`. See EXTRACTION-NOTES.)
- h2: "Tree Removal Service Done Safely, Cleanly & Carefully"
  (source markup: `<h2 class="tt-h">Tree Removal Service Done <span class="tt-g">Safely, Cleanly &amp; Carefully</span></h2>`)
- body (kicker): "Careful Tree Removal. Complete Cleanup. No Mess."
- body: "Some trees become a problem slowly. They lean toward the house, crowd the driveway, drop limbs across the yard, block sunlight, or sit exactly where a cleaner, better outdoor space should be. When that happens, Texas Tree Tops is the local tree removal company Fort Worth homeowners call to get the tree handled without chaos, guesswork, or a mess left behind."
- body: "We provide professional tree removal service in Fort Worth, Arlington, Keller, Southlake, North Richland Hills, Hurst, Bedford, Haltom City, and throughout Tarrant County. Whether you need residential tree removal, dead tree removal, large tree removal, oak tree removal, or tree cutting service, our crew can inspect the job, explain your options, give you a tree removal estimate, and handle the removal from start to finish."
- image alt: "Texas Tree Tops branded trucks in Fort Worth"

### 8b. Block B — photo + green checklist
- image alt: "Large tree removal by Texas Tree Tops"
- h2: "Common Tree Removal Requests We Handle"
  (source markup: `<h2 class="tt-h">Common Tree Removal <span class="tt-g">Requests We Handle</span></h2>`)
- listItem: "Residential tree removal for unwanted, overgrown, or poorly placed trees"
- listItem: "Dead tree removal for dry, damaged, declining, or unsafe trees"
- listItem: "Tree cutting service for trees near homes, fences, garages, and driveways"
- listItem: "Removal of large trees blocking sunlight, crowding the yard, or taking over usable space"
- listItem: "Oak tree removal and other big-canopy trees handled safely"
- listItem: "Tree removal before landscaping, patio work, or other outdoor upgrades"
- listItem: "Debris cleanup and a final walkthrough after the removal is complete"

---

## Section 9 — "Need Storm Damage Handled Fast?" CTA band  (`section-toIz3g1_9P`)

- h2: "Need Storm Damage Handled Fast?"
- body: "Call now and talk to a real person, or request a free estimate and we'll call you back quickly with next steps."
- button main: "Get My Free Storm Estimate"
- button sub: "Request a call back"
  (action = scroll-to-element → `form-5gd7-YxgNV`; it is a `<button>`, not an anchor.
   aria-label: "Get My Free Storm Estimate Request a call back")
- h1: "Ready To Get That Tree Off Your Property?"
- link (tel:+16823657478) main: "(682) 365-7478"
- link (tel:+16823657478) sub: "Call Now For A Free Estimate"
  (NOTE: this one is a NORMAL space, no NBSP, and it drops the word "Today" — unlike the five CTAs above.)

---

## Section 10 — How Our Tree Storm Response Works  (`section-cpwew5Yzi0`)

- h1: "How Our Tree"
- h1: "Storm Response Works"
  (two separate `<h1>` elements inside one heading component)

IMPORTANT: this section renders TWO DIFFERENT four-step sets — the mobile set and the
desktop set are NOT the same copy, and the desktop set is authored out of visual order
(Step 1, Step 3, Step 2, Step 4 in DOM order). Both are recorded because they differ.

### 10a. MOBILE step set (`row-6Yl0-6dyH5`, class `mobile-only`) — generic tree-removal copy
- body: "Step 1"
- h2: "Request Your Free Estimate"
- body: "Tell us what needs to be removed and where the tree is located. We’ll follow up quickly with the next steps for your tree removal quote."
- body: "Step 2"
- h2: "We Inspect The Job"
- body: "Our crew looks at the tree size, access, nearby structures, stump grinding options, and cleanup needs so there are no wild surprise"
  (PRESERVE: "no wild surprise" — missing "s", and no full stop.)
- body: "Step 3"
- h2: "Safe Tree Removal"
- body: "We handle the cutting, removal, and debris cleanup with the right crew, equipment, and process for your property."
- body: "Step 4"
- h2: "Final Walkthrough"
- body: "Before we leave, we make sure the tree removal is complete, the cleanup is done, and the yard is left clean, safe, and usable again."

### 10b. DESKTOP step set (`row-O7NtuDOYvR`, class `desktop-only`) — storm-specific copy
DOM order is Step 1, Step 3, Step 2, Step 4 (recorded here in DOM order).
- body: "Step 1"
- h2: "Call Or Request An Estimate"
- body: "Call (682) 452-0735 and tell us what happened — tree on the house, fence down, yard full of debris. If a tree is on a power line, call 911 first and stay clear."
- body: "Step 3"
- h2: "We Clear It Same-Day When Possible"
- body: "Our Fort Worth crew handles the cutting, removal, and debris haul-off with the right equipment, and walks the property with you when it's done."
- body: "Step 2"
- h2: "Same Day Response & Assess The Damage "   (TRAILING SPACE in the source)
- body: "We look at the tree, the structure, access, and safety, then give you a clear free estimate on site. We photograph and document the damage for your records."
- body: "Step 4"
- h2: "Final Walkthrough"
- body: "Before we leave, we make sure the removal & work is complete, the cleanup is done, and the yard is left clean, safe, and usable again."
  (differs from the mobile Step 4: "the removal & work is complete" vs "the tree removal is complete")

---

## Section 11 — Storm Damage Questions, Answered (FAQ accordion)  (`section-em7O_SRdYL`)

- h1: "Storm Damage Questions, Answered "   (TRAILING SPACE in the source)
  (source markup: `<h1><span style="color: var(--color-ndisocfr)">Storm Damage Questions, </span>Answered </h1>`)

GHL FAQ component `faq-f5SqrykS2z`. All ten panels are collapsed at load
(`style="height:0;padding:0;opacity:0;"`) but the answer text ships in the HTML.

- h4: "How fast can you get here after a storm?"
- body: "We respond quickly and prioritize trees on homes, vehicles, and hazards. Most storm calls get a same-day assessment. Call (682) 452-0735."
- h4: "How much does storm tree removal cost?"
- body: "Every job is different, so we quote on site. The estimate is free and there's no obligation."
- h4: "A tree fell on my house — what do I do first?"
- body: "If the tree is touching a power line or the structure looks unsafe, call 911 first and stay clear. Then call us and we'll get a crew moving."
- h4: "Do you remove trees on roofs, cars, or fences?"
- body: "Yes. Trees on structures and vehicles are exactly what our storm crew handles."
- h4: "Do you clean up the debris afterward?"
- body: "Yes. Limbs, branches, and wreckage are hauled off, and we do a final walkthrough with you."
- h4: "Are you licensed and insured?"
- body: "Yes. Texas Tree Tops is licensed and insured, with coverage up to $2M. Tree removal can be dangerous work, especially around homes, fences, roofs, and driveways, so you want a crew that knows how to handle the job safely."
- h4: "What areas do you serve?"
- body: "Fort Worth and surrounding Tarrant County."
- h4: "Will you help with my insurance claim?"
- body: "We photograph and document the damage and provide a written breakdown you can give your insurer. Coverage decisions are between you and your carrier."
- h4: "Do you repair storm-damaged fences?"
- body: "Yes — fence repair and replacement, including fences crushed by fallen trees."
- h4: "How do I get started?"
- body: "Fastest way is to call (682) 452-0735. Or send the form and we'll call you back quickly."

---

## Section 12 — Final CTA  (`section-zZW8Wc9Z7T`)

- h1: "Storm Damage In Fort Worth? "   (TRAILING SPACE — a `<span> </span>` after the bold run)
- h1: "Get A Free Estimate Now"
  (two separate `<h1>` elements inside one heading component)
- body: "Fast emergency tree removal, fence repair, and debris cleanup for Fort Worth homeowners. Licensed, insured, local. Call and talk to a real person."
- link (tel:+16823657478) main: "Get my free estimate"
- link (tel:+16823657478) sub: "Click to call"

---

## Section 13 — Footer  (`section-yOWoo1RyOV`)

- body: "Texas Tree Tops Tree Service LLC"
- body: "©Copyright Texas Tree Tops. | All rights reserved 2026"
  (no space after "©"; a full stop after "Tops"; year is 2026)

### 13a. Legal links — DESKTOP (`row-xdA6wLUcIY`, class `desktop-only`)
- link (https://links.treeleads.io/preview/mKHiwloWMigr9M9z00tv): "Privacy Policy"
  (target="_blank" rel="noreferrer noopener"; aria-label "Privacy Policy " with trailing space)
- link (https://links.treeleads.io/preview/Q3OqcRO0SoaE5nnwNGcK): "Terms of Service"
  (target="_blank" rel="noreferrer noopener"; aria-label "Terms of Service " with trailing space)

### 13b. Legal links — MOBILE (`row-z2ymiYHJ_G`, class `mobile-only`)
- button: "Privacy Policy"
- button: "Terms of Service"
  (These are `<button>` elements with NO href. Their configured action is `openPopup` →
   `hl_main_popup-eJnCVAV3I5`, and that popup contains zero elements in the funnel payload.
   On mobile the legal links therefore do nothing. Recorded as found, not fixed.)

---

## Head / meta strings (not visible on the page, recorded for fidelity)

- title: "Emergency Storm Tree Removal Fort Worth | Texas Tree Tops"
- meta title / og:title: "Emergency Storm Tree Removal Fort Worth | Texas Tree Tops"
- meta description / og:description: "Tree on your house? Fast storm damage tree removal, fence repair & debris cleanup in Fort Worth. Licensed, insured, free estimates. Call (682) 452-0735."
- meta author / og:author: "Texas Tree Tops"
- meta keywords / og:keywords: "emergency tree removal fort worth, storm damage tree removal, tree fell on house, downed tree removal"
- meta og:type / twitter:type: "website"
- meta apple-mobile-web-app-capable: "yes"
- meta viewport: "minimum-scale=1.0, width=device-width, maximum-scale=1, user-scalable=no"
