# copy.md — J Valdez Tree Services · "trimming" landing page

- **Live URL:** https://jvaldeztreeservices.com/landing-page-997015
- **GHL page name:** `Tree Trimming - Landing Page` (pageId `8rOLN04AbtNEocqeoqlW`)
- **GHL funnel:** `Tree Trimming Campaign - Google Ads` (funnelId `aWDKXf94ZPEgGj9HkbEn`, stepId `460cf2e1-ce8d-4705-a0df-19e99ab7b650`)
- **Captured:** 2026-08-08 from the saved HTML snapshot.
- **Rule:** every string below is byte-identical to the source. Typos, doubled spaces, trailing spaces, missing letters and factual inconsistencies are **intentional** and must be reproduced exactly.
- **Whitespace warning:** all whitespace inside the quoted strings is literal — trailing spaces, doubled spaces, and one **U+00A0 non-breaking space** between "Now" and "For" in the call-CTA sub-text `Call Now For A Free Estimate Today` (6 occurrences on the page). It is stored as a real U+00A0 byte in this file; do not normalise it to an ordinary space when reproducing.
- **Section numbering here is editorial.** The underlying GHL section/element ids are given so each block can be located in the builder.

---

## Section 1 — Top header bar (desktop bar + mobile bar)
GHL: `section-9JRQtJShoU` → `row-QUXhAWTlOS` (class `desktop-only`) and `row-XOS6-tOzGd` (class `mobile-only`)

**Desktop bar** (`row-QUXhAWTlOS`, `desktop-only`)
- image: Google rating badge (no text) — `image--OXKJdqjR2`
- image: circular J Valdez logo (no text) — `image-Yx59ATBVD_`
- link (tel:+12149857697) mainText: "Call (214) 985-7697"
- link (tel:+12149857697) subText: *(none — this button has no sub-heading)*
- link (tel:+12149857697) ariaLabel: "Call (214) 985-7697 "

**Mobile bar** (`row-XOS6-tOzGd`, `mobile-only`)
- image: circular J Valdez logo (no text) — `image-AsROCxR7PD`
- link (tel:+14694021196) mainText: "(469) 402-1196"
- link (tel:+14694021196) subText: "Tap To Call"
- link (tel:+14694021196) ariaLabel: "(469) 402-1196 Tap To Call"
- button mainText: "Call (469) 402-1196"   ← `button-3zhCn5xTPd`. **Not a phone link.** Its GHL action is `openPopup` → `hl_main_popup-eJnCVAV3I5`, and that popup has zero child elements. It also sits in a `desktop-only` column (`col-6PAsUZZzSt`) nested inside the `mobile-only` header row, so it never renders on either breakpoint. Recorded for completeness.
- button ariaLabel: "Call (469) 402-1196 "

---

## Section 2 — Hero: offer headline + lead form
GHL: `section-9JRQtJShoU` → `row-jmYMAXF38W`

**Google review badge** (custom HTML block `custom-code-tV4Rhd85m3`)
- body (wordmark, one coloured `<span>` per letter): "Google"
- body (stars, five `&#9733;` entities): "★★★★★"
- body: "4.9"
- body: "Read our latest verified reviews below"
  - *(source comment above this line reads `<!-- Bottom row: caption (typo fixed) -->` — a build comment, not visible copy)*

**Headline block**
- h1 (run 1, plain): "East Dallas Get 10% Off Tree Trimming With "
- h1 (run 2, wrapped in `<strong>`): "Roof & Gutter Branch Clearance"
- h1 (full rendered string): "East Dallas Get 10% Off Tree Trimming With Roof & Gutter Branch Clearance"
- h2: "Same-Week Appointments Available— Get Your Trees Trimmed Today! Summer Special Ends Soon. "
- body: "Need a tree trimming service near you? Our East Dallas crew includes  roof and gutter branch clearance with every trim, — plus a 10% dicousnt and multi-tree bundle pricing when more than one tree needs work. Whether it's a curb-appeal shape-up, full tree pruning, or overgrown limbs hanging over your roofline, we inspect every branch, walk you through your options upfront, and handle the trim and cleanup start to finish. No surprises on price. No debris left behind."
  - *(preserve: doubled space in "includes  roof", the misspelling "dicousnt", and the stray ", —")*

**Form heading — desktop copy** (`col-yL4DnEssSU`; sub-heading has class `desktop-only`)
- h2 (run 1, plain): "Get Your "
- h2 (run 2, `<strong><span style="color: var(--color-ndisocfr)">`): "Free Trimming Estimate"
- h2 (full rendered string): "Get Your Free Trimming Estimate"
- body: "Enter your info and we’ll call you with the next steps for your tree removal quote"

**Form heading — mobile copy** (`col-vk8rBPkJ5b`, class `mobile-only`)
- h2 (run 1, plain): "Get Your Free Tree Trimming Estimate  "
- h2 (run 2, `<strong><span style="color: var(--color-ndisocfr)">`): "East Dallas & Nearby"
- h2 (full rendered string): "Get Your Free Tree Trimming Estimate  East Dallas & Nearby"
- body: "Enter your info and we’ll call you with the next steps for your tree removal quote"

**Lead form** (`form-5gd7-YxgNV`; see form.json)
- label: "First Name"
- label: "Last Name"
- label: "Phone"
- label (required marker, own `<span>`): "*"
- label: "Email (Optional)"
- label (hidden field, wrapper has class `d-none`): "Ad Click ID"
- button (submit): "Get My Tree Trimming Estimate"

*(Right-hand column `col-BmNtA1vlYU` holds two hero photos and no text.)*

---

## Section 3 — Before / after gallery slider
GHL: `section-6TzwOQDUZq` → `custom-code-75tiX9YkJq`

No visible copy. Five Swiper slides; the only text is the `alt` attributes, recorded in images.json.

---

## Section 4 — Four benefit cards + call CTA
GHL: `section-a8UgWW3zd0`

- body (card 1): "10% Off Tree Trimming With Roof & Gutter Clearance! (Multi-Tree Bundle Pricing"
  - *(preserve: opening parenthesis is never closed)*
- body (card 2): "Same-Week Scheduling & Tree Trimming Appointments"
- body (card 3): "Licensed & Insured Service Up To $2 Million"
  - *(source also emits an empty `<p></p>` after this line)*
- body (card 4): "Safe Tree Trimming, Debris Cleanup & Final Walkthrough"
- link (tel:+12149857697) mainText — desktop-only column `col-TZ4hzPn0si`: "Call (214) 985-7697"
- link (tel:+12149857697) subText: "Call Now For A Free Estimate Today"
- link (tel:+12149857697) ariaLabel: "Call (214) 985-7697 Call Now For A Free Estimate Today"
- link (tel:+14694021196) mainText — mobile-only column `col-Vq25j9zPj1`: "Call (469) 402-1196"
- link (tel:+14694021196) subText: "Call Now For A Free Estimate Today"
- link (tel:+14694021196) ariaLabel: "Call (469) 402-1196 Call Now For A Free Estimate Today"

---

## Section 5 — Why East Dallas Homeowners Choose J Valdez + Google reviews
GHL: `section-evIFlIWTQp`

- image: Google rating pill (no text) — `image-HGUEiGfzxx`
- h1 (first `<h1>`): "Why East Dallas Homeowners"
- h1 (second `<h1>`): "Choose J Valdez for Tree Trimming"
- body: "J Valdez Tree Service provides fast, reliable tree removal service for homeowners in Mesquite, Garland, Rowlett, Rockwall, Sunnyvale, Heath, Fate, and East Dallas."
  - *(preserve: this is the trimming page but the sentence says "tree removal service")*

**Review slider** (custom HTML block `custom-code-8BO6xwlaH1`, five slides)

1. h4: "Christopher Medley"
   - body (date): "3 weeks ago"
   - body (review): "Outstanding work! Above and beyond my expectations! Felix and his crew were very careful and very thorough. My neighbors are all very pleased with their work also. Highly recommend! And at a great price too!"
2. h4: "Phil Vidrine"
   - body (date): "1 week ago"
   - body (review): "They did a fantastic job. I wanted a clear view of the river and they did a great job. They worked quickly and checked with me multiple times during the job to make sure I was satisfied. Very professional job! If you need tree work, you should use them!"
3. h4: "Jameon Bolin"
   - body (date): "a month ago"
   - body (review): "I'm very happy with the work they did to remove 5 trees & cut 2 back from my house. Their cleanup was thorough & they didn't tear up my yard anymore than absolutely necessary. They ground down the stumps & 4 or 5 other stumps left by other tree companies. I think this company definitely gets 5 stars!!!"
4. h4: "Elizabeth Gonzalez"
   - body (date): "2 months ago"
   - body (review): "Zero question why these guys have a 5 Star average, the owner is extremely diligent, their crew is very focused and hard working, they high quality equipment and attention to detail. Clean up afterwards was excellent, they even cleaned our pool and brushed excess leaves/debris. Highly recommend."
   - *(preserve: "they high quality equipment" — verb missing in the source review)*
5. h4: "Tom Slater"
   - body (date): "2 months ago"
   - body (review): "Excellent work, very professional and careful not to cut wires or damage outdoor furniture, cleaned up as if they were never here - highly recommend this tree service!"

- link (tel:+12149857697) mainText: "Call (214) 985-7697"
- link (tel:+12149857697) subText: "Call Now For A Free Estimate Today"
- link (tel:+12149857697) ariaLabel: "Call (214) 985-7697 Call Now For A Free Estimate Today"

---

## Section 6 — Tree Trimming Done Clean, Done Right (photo grid) + call CTA
GHL: `section-i0C6s9XHTY`

- h1 (run 1, plain): "Tree Trimming "
- h1 (run 2, `<strong><span style="color: var(--color-ndisocfr)">`): "Done Clean, Done Right"
- h1 (full rendered string): "Tree Trimming Done Clean, Done Right"
- body: "Our trained crews use professional-grade equipment to trim, shape, and clean up safely and efficiently — because your trees deserve care that's done right."
- *(five photos, no captions)*
- link (tel:+12149857697) mainText: "Call (214) 985-7697"
- link (tel:+12149857697) subText: "Call Now For A Free Estimate Today"
- link (tel:+12149857697) ariaLabel: "Call (214) 985-7697 Call Now For A Free Estimate Today"

---

## Section 7 — Tree Trimming Services We Offer + call CTA
GHL: `section-Pt0S1QTMn0`

- h1 (run 1, plain): "Tree Trimming "
- h1 (run 2, `<strong><span style="color: var(--color-ndisocfr)">`): "Services We Offer"
- h1 (full rendered string): "Tree Trimming Services We Offer"
- body: "Safe, clean, and professional tree trimming service for East Dallas homeowners who need the job handled without a mess left behind."

**Bullet column 1** (`bulletList-DW1kSshz9P`)
- listItem: "Residential Tree Trimming"
- listItem: "Tree Pruning Service"
- listItem: "Crown Thinning & Deadwooding"
- listItem: "Overgrown Branch Trimming"
- listItem: "Curb Appeal Shape-Up"
- listItem: "Safe Tree Trimming Near Homes"

**Bullet column 2** (`bulletList-kmcbJRQ19n`)
- listItem: "Roof & Gutter Branch Clearance"
- listItem: "Driveway & Fence Line Trimming"
- listItem: "Debris Cleanup & Haul Away"
- listItem: "Mutli-Tree Pricing"
  - *(preserve the transposition: "Mutli-Tree", not "Multi-Tree")*
- listItem: "Final Walkthrough Included"
- listItem: "East Dallas Tree Trim Service "
  - *(trailing space present in source)*

**Bullet column 3** (`bulletList-NHH49kGF49`)
- listItem: "Affordable Tree Trimming Service"
- listItem: "Same-Day Tree Trimming"
- listItem: "Insured Tree Trimming Crew"
- listItem: "Free Tree Trimming Estimate"
- listItem: "Tree Trimming Near You"
  - *(this last `<li>` also contains a trailing empty `<p></p>`; column 3 has 5 items, columns 1 and 2 have 6)*

- link (tel:+12149857697) mainText: "Call (214) 985-7697"
- link (tel:+12149857697) subText: "Call Now For A Free Estimate Today"
- link (tel:+12149857697) ariaLabel: "Call (214) 985-7697 Call Now For A Free Estimate Today"

---

## Section 8 — Areas We Serve (scrolling marquee)
GHL: `section-o8EAaPwuM8`

- h1 (run 1, `<strong><span style="color: var(--color-ndisocfr)">`): "Areas "
- h1 (run 2, plain): "We Serve"
- h1 (full rendered string): "Areas We Serve"
- h2 (wrapped in a Satoshi Regular 24px span): "Top Rated East Dallas Local Tree Trimming Company"

**Service-area pills** (custom HTML block `custom-code-A8otsFIT--`)

Canonical list — order A (used by marquee track 1 and track 3):
- listItem: "Mesquite"
- listItem: "Rockwall"
- listItem: "Rowlett"
- listItem: "Forney"
- listItem: "Heath"
- listItem: "Fate"
- listItem: "Sunnyvale"
- listItem: "Garland"
- listItem: "East Dallas & Lake Ray Hubbard"

Order B (used by marquee track 2, the `reverse` track — same nine names, rotated so Sunnyvale/Garland/East Dallas lead):
- listItem: "Sunnyvale"
- listItem: "Garland"
- listItem: "East Dallas & Lake Ray Hubbard"
- listItem: "Mesquite"
- listItem: "Rockwall"
- listItem: "Rowlett"
- listItem: "Forney"
- listItem: "Heath"
- listItem: "Fate"

See structure.md — the block emits three marquee tracks × two duplicate groups each = 54 pills total in the DOM for these nine names.

---

## Section 9 — How Our Tree Trimming Service Works (4 steps)
GHL: `section-cpwew5Yzi0`

- h1 (first `<h1>`, `<span style="color: var(--color-pukyxebe)">`): "How Our Tree"
- h1 (second `<h1>`, `<strong><span style="color: var(--color-ndisocfr)">`): "Trimming Service Works"

The four steps are authored **twice** (a `mobile-only` copy and a `desktop-only` copy) with identical strings. Recorded once here; see structure.md for the ordering difference.

- body (eyebrow): "Step 1"
- h2: "Request Your Free Estimate"
- body: "Tell us what needs to be trimmed and where the trees are located. We'll follow up quickly with the next steps for your tree trimming quote."

- body (eyebrow): "Step 2"
- h2: "We Inspect The Job"
- body: "Our crew looks at the tree size, branch access, nearby structures like your roof and gutters, and cleanup needs so there are no wild surprises."
  - *(preserve: "no wild surprises" — the source reads "wild", not "wild**er**" or "no surprises")*

- body (eyebrow): "Step 3"
- h2: "Safe Tree Trimming"
- body: "We handle the trimming, pruning, and debris cleanup with the right crew, equipment, and process for your property."

- body (eyebrow): "Step 4"
- h2: "Final Walkthrough"
- body: "Before we leave, we make sure the trimming is complete, the cleanup is done, and your yard is left clean, safe, and looking sharp."

---

## Section 10 — Top Rated / long-form SEO block + mid-page CTA
GHL: `section-toIz3g1_9P`

- h1: "Top Rated - 5 Star Service"
- h1 (run 1, `<span style="color: var(--color-pukyxebe)">`): "Tree Trimming Service Done "
- h1 (run 2, `<strong><span style="color: var(--color-ndisocfr)">`): "Safely, Cleanly & Carefully"
- h1 (full rendered string): "Tree Trimming Service Done Safely, Cleanly & Carefully"
- h2: "Careful Tree Trimming. Complete Cleanup. No Mess."
- h2: "Some trees just need attention before small problems become bigger ones. Branches creep toward the roofline, crowd the driveway, hang over the fence, or block sunlight from the yard. When that happens, J Valdez Tree Service is the local tree trimming company East Dallas homeowners call to get branches handled without chaos, guesswork, or a mess left behind."
- h2 (empty spacer element in source): ""
- h2: "We provide professional tree trimming and pruning services in East Dallas, Mesquite, Garland, Rowlett, Rockwall, Sunnyvale, Heath, Fate, and the Lake Ray Hubbard area. Whether you need a tree trimming service, a tree pruning service, roofline branch clearance, or trim trees near your driveway and fence line, our crew can inspect the job, explain your options, give you a tree trimming estimate, and handle the work start to finish.."
  - *(preserve the double full stop at the end: "start to finish..")*
  - *(these three long body strings are marked up as `<h2>` in the source, not as paragraphs)*

**Common Tree Trimming Requests We Handle**
- h1 (run 1, `<span style="color: var(--color-pukyxebe)">`): "Common Tree Trimming "
- h1 (run 2, `<strong><span style="color: var(--color-ndisocfr)">`): "Requests We Handle"
- h1 (full rendered string): "Common Tree Trimming Requests We Handle"
- listItem: "Residential tree trimming for overgrown, unshaped, or hard-to-reach branches"
- listItem: "Tree pruning service for weak, dead, or storm-prone limbs before they become a hazard"
- listItem: "Roof & gutter branch clearance for limbs touching or overhanging your roofline or siding"
- listItem: "Tree Trimming before landscaping, patio work, fencing, sod, or outdoor upgrades patio work, Etc"
  - *(preserve the duplicated "patio work" and the trailing ", Etc")*
- listItem: "Canopy thinning and crown reduction for a cleaner, safer, healthier yard"
- listItem: "Tree shaping and structural trimming when you want the job fully done right"
- listItem: "Debris cleanup & final walkthrough after Trimming"

**Mid-page CTA**
- h2: "Looking for a Tree Trimming Company Near You?"
- body (underlined, `<u>`): "Request your free tree trimming estimate today and get 10% Off!"
- body: "Our team will call you with the next steps for your tree trimming quote."
- button mainText: "Get my tree trimming estimate"
- button subText: "Request a call back"
- button ariaLabel: "Get my tree trimming estimate Request a call back"
  - *(action: scroll-to-element → `form-5gd7-YxgNV`. Not a phone link, despite "call back".)*

**"Ready" band** (`row-YIxQrLnVyw`)
- h1 (first `<h1>`): "Ready To Get Those "
  - *(trailing space present in source)*
- h1 (second `<h1>`): "Trees Trimmed?"
- link (tel:+12149857697) mainText: "Call (214) 985-7697"
- link (tel:+12149857697) subText: "Call Now For A Free Estimate Today"
- link (tel:+12149857697) ariaLabel: "Call (214) 985-7697 Call Now For A Free Estimate Today"

---

## Section 11 — FAQ
GHL: `section-7oJnz-0VhU` → `faq-g6aAadyh4M`

- h1 (run 1, plain): "Top 10 "
- h1 (run 2, `<strong><span style="color: var(--color-ndisocfr)">`): "Frequently Asked Question"
- h1 (run 3, plain): " About Tree Trimming"
- h1 (full rendered string): "Top 10 Frequently Asked Question About Tree Trimming"
  - *(preserve the singular "Question")*

1. h4: "How fast can you come out for a tree trimming estimate?"
   - body: "In many cases, we can schedule same-day or next-available estimates while crews are open. If you need tree trimming service in Mesquite, Garland, Rowlett, Rockwall, Sunnyvale, Heath, Fate, or East Dallas, send your request and we'll call you with the next steps."
2. h4: "How much does tree trimming cost?"
   - body: "Tree trimming cost depends on the size and number of trees, how much needs to be cut back, access to the branches, and how much cleanup is needed. The fastest way to get a real number is to request a free tree trimming estimate so our crew can inspect the job and give you a clear quote."
3. h4: "Do you trim dead, damaged, or overgrown trees?"
   - body: "Tree trimming cost depends on the size and number of trees, how much needs to be cut back, access to the branches, and how much cleanup is needed. The fastest way to get a real number is to request a free tree trimming estimate so our crew can inspect the job and give you a clear quote"
   - *(preserve: this answer is a copy of FAQ 2 and does not answer the question; note it also drops the final full stop that FAQ 2 has)*
4. h4: "Do you clean up after tree trimming?"
   - body: "Yes. Our tree trimming service includes debris cleanup and a final walkthrough after the job is complete. The goal is simple: trim the branches, clear the mess, and leave the property looking clean and usable again."
5. h4: "Are you licensed and insured?"
   - body: "Yes. J Valdez Tree Service is licensed and insured, with coverage up to $2M. Tree trimming can be dangerous work, especially around homes, fences, roofs, and driveways, so you want a crew that knows how to handle the job safely."
6. h4: "When should I trim my trees?"
   - body: "Homeowners usually call for tree trimming when branches are dead, cracked, hanging low, growing too close to the house, blocking sunlight, crowding the yard, or overhanging the roof or driveway. If branches are becoming a safety risk or hurting your yard's curb appeal, it's time to get an estimate."
7. h4: "What areas do you serve?"
   - body: "We provide tree removal service in East Dallas, Mesquite, Garland, Rowlett, Rockwall, Sunnyvale, Heath, Fate, Forney, and the Lake Ray Hubbard area."
   - *(preserve: "tree removal service" on the trimming page)*
8. h4: " Can you help if I need trees shaped up before selling, renting, or hosting?"
   - *(preserve the LEADING space inside the `<h4>`)*
   - body: "Yes. Many customers call us before listing a home, hosting an event, or completing yard upgrades. Trimming and shaping your trees can improve curb appeal, let in more sunlight, and give your property a cleaner, more finished look."
9. h4: "Will trimming hurt my tree's health?"
   - body: "No — when it's done correctly. Our crew follows proper pruning techniques to remove weak, dead, or overgrown limbs without over-cutting, so your tree stays healthy and keeps its natural shape. Ask about our Tree Health + Trim maintenance plan if you want ongoing care between visits."
10. h4: "How do I get started?"
    - body: "Fill out the form and request your free tree removal estimate. We’ll call you, review the job, answer your questions, and help you figure out the best next step for your property."
    - *(preserve: "tree removal estimate", and the curly apostrophe in "We’ll")*

The heading promises "Top 10" and there are exactly 10 entries.

---

## Section 12 — Final CTA
GHL: `section-zZW8Wc9Z7T`

- h1 (first `<h1>`): "Need Tree Trimming?"
- h1 (second `<h1>`, wrapped in `<strong>`): "Get a Free Estimate Today"
- body: "Fast tree trimming service for homeowners in East Dallas, Mesquite, Garland, Rowlett, Rockwall, Sunnyvale, Heath, and Fate. Whether branches are overgrown, hanging over your roof, or crowding your yard, our crew can inspect it, explain your options, and handle the trim cleanly."
  - *(preserve: Forney is missing from this list although it appears in the marquee and FAQ 7)*
- button mainText: "Get my free estimate"
- button subText: "Click to call"
- button ariaLabel: "Get my free estimate Click to call"
  - *(action: scroll-to-element → `form-5gd7-YxgNV`. Despite the sub-text "Click to call" it does **not** dial.)*

---

## Section 13 — Footer
GHL: `section-yOWoo1RyOV`

- image: footer logo (no text) — `image-9_ZzhOR81P`
- body: "J Valdez Tree Service LLC"

**Contact box** (custom HTML block `custom-code-0aE34cxYy4`)
- body (address, next to a "Location" pin icon): "2413 Pinehurst Lane Mesquite, TX 75150"
- link (tel:+14694021196) (next to a "Phone" icon): "(469) 402-1196"

**Legal row**
- body: "©Copyright J. Valdez Tree Service Co. | All rights reserved 2026"
  - *(preserve: no space after "©", and "J. Valdez" with a full stop here vs. "J Valdez" everywhere else)*

Desktop copy (`row-xdA6wLUcIY`, class `desktop-only`)
- link (https://links.treeleads.io/preview/mKHiwloWMigr9M9z00tv): "Privacy Policy"
- link (https://links.treeleads.io/preview/Q3OqcRO0SoaE5nnwNGcK): "Terms of Service"

Mobile copy (`row-z2ymiYHJ_G`, class `mobile-only`)
- button: "Privacy Policy"   ← `button-5nV1f7QS4s`, action `openPopup` → `hl_main_popup-eJnCVAV3I5` (empty popup). **Broken on mobile.**
- button ariaLabel: "Privacy Policy "
- button: "Terms of Service"   ← `button-NUlmfdcHX8`, action `openPopup` → same empty popup. **Broken on mobile.**
- button ariaLabel: "Terms of Service "

---

## Strings that appear nowhere on the page
- `<title>`: empty (no `<title>` element is rendered)
- `meta description`: not set (no `<meta name="description">` element is rendered; the page payload's `meta.description` is an empty string)
- `og:title` / `og:description` / `og:image`: not set; only `og:type` = "website" and `twitter:type` = "website"
