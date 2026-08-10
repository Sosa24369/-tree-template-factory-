# Source copy — Texas Tree Tops "removal" landing page

- **Live URL:** https://texastreetopsllc.com/landing-page-352422
- **Page title:** "Tree Removal Services in West Dallas | Texas Tree Tops"
- **GHL page name:** "Routine Removal - Landing Page"
- **Captured from:** `raw/removal.html`

## How to read this file

Every string is wrapped in double quotes so leading/trailing spaces are visible. Copy **inside** the quotes only.
Text is reproduced **byte-for-byte**, including typos, missing plurals, doubled words and geography that contradicts the rest of the page. Nothing here has been corrected. Annotations outside the quotes are mine and are not page copy.

Two invisible characters recur and matter:

- `⟦NBSP⟧` is written **as a real U+00A0 character inside the quoted strings**. Wherever you see the words `Now For` in a call-button subtitle, the space between them is a non-breaking space, not a normal space.
- Several strings carry a **trailing space** or a **leading space** — visible against the closing/opening quote.

Sections are numbered in document order and keyed to the GHL section id.

---

## Section 1 — Header + Hero + Lead Form  (`section-9JRQtJShoU`)

### 1a. Header bar — desktop copy (`row-QUXhAWTlOS`, class `desktop-only`)

- image: logo (no alt)
- image: secondary header graphic (no alt)
- link (tel:+16823657478) — main: "(682) 365-7478"
- link (tel:+16823657478) — sub: "Tap To Call " ← trailing space is in the source

### 1b. Header bar — mobile copy (`row-XOS6-tOzGd`, class `mobile-only`)

- image: logo (no alt)
- link (tel:+14694021196) — main: "682-452-0735" ← the displayed number and the dialled number DO NOT MATCH; see structure.md
- link (tel:+14694021196) — sub: "Tap to call"
- button (no href; GHL action `openPopup` → `hl_main_popup-eJnCVAV3I5`, which is an empty popup): "Call (469) 402-1196"
  - aria-label on this button is "Call (469) 402-1196 " ← trailing space
  - This button sits in a `desktop-only` column nested inside the `mobile-only` row, so it is hidden at every viewport width. Recorded because it is in the source.

### 1c. Google review badge (custom-code element)

- logoText — rendered one `<span>` per letter, reading "Google": "G" "o" "o" "g" "l" "e"
- body: "★★★★★"
- body: "4.9"
- body: "Read our latest verified reviews below"

### 1d. Hero headline block

- h1 (span 1 of 2): "$300 Off Your Tree Removal"
- h1 (span 2 of 2): " West Dallas Homeowners" ← leading space is in the source
- h2: "Get Your Tree Service Handled In Hours With Our Summer Special!"
- body: "Get $300 Off With your Tree Removal Service All Summer! Whether you need a tree removal estimate, a tree removal quote, or a local tree removal company near you for expert help- our crew can handle the removal from start to finish. Save $300 though August-31st. Call Today!"
  - contains "With your" (lower-case y), "help-" with no space before the dash, and "though August-31st" where "through" is meant. All preserved.

### 1e. Form heading — desktop copy (`sub-heading-TVyXLNMxiV`, class `desktop-only`)

- h2 (text node): "Get Your " ← trailing space
- h2 (span): "Free Tree Removal Estimate"
- body: "Enter your info and we’ll call you with the next steps for your tree removal quote"
  - This paragraph (`paragraph-BOeRKrin1Q`) carries BOTH `desktop-only` and `mobile-only` classes, so it is `display:none` at every width.

### 1f. Form heading — mobile copy (`col-vk8rBPkJ5b`, class `mobile-only`)

Identical strings to 1e; the source renders the heading block twice.

- h2 (text node): "Get Your " ← trailing space
- h2 (span): "Free Tree Removal Estimate"
- body: "Enter your info and we’ll call you with the next steps for your tree removal quote"
  - This paragraph (`paragraph-hPbI9yy1Ja`) also carries both `desktop-only` and `mobile-only`, so it too is hidden at every width.

### 1g. Lead form (rendered ONCE — see form.json)

- label: "First Name " ← trailing space
- label: "Last Name " ← trailing space
- label: "Phone " ← trailing space
- label (required marker, separate span): "*"
- label: "Email (Optional) " ← trailing space
- placeholder: "Enter your first name"
- placeholder: "Enter your last name"
- placeholder: "Enter phone number"
- placeholder: "Enter email address"
- button (submit): "Request My Free Tree Removal Estimate"

### 1h. Two images below the form (`row-jmYMAXF38W`)

- image (no alt)
- image (no alt)

---

## Section 2 — Recent-jobs photo gallery  (`section-6TzwOQDUZq`)

No visible text. A Swiper 8.0.5 slider inside a custom-code element holding 15 Google Business Profile photos, every one with the same alt text:

- imageAlt (×15): "Texas Tree Tops tree removal in Fort Worth"
  - The alt says **Fort Worth** on a **West Dallas** page. Preserved.

The custom-code element's HTML comment (not visible copy, recorded for completeness) reads:
"============================================================
     TEXAS TREE TOPS  —  PHOTO GALLERY (recent jobs slider)
     Enhanced photos, auto-scroll, hover zoom. Swap the image src's.
     Paste into a GHL Custom HTML / Code element. Self-contained.
     ============================================================"

---

## Section 3 — Benefit strip + call CTA  (`section-a8UgWW3zd0`)

- image (no alt) — `image-N7IfoGIdXY`, in a `desktop-only` column
- icon + body: "$300 Off Qualifying Tree Removal Services"
- icon + body: "Fast Scheduling & Same-Day Tree Removals"
- icon + body: "Licensed & Insured Service Up To $2Million"
- icon + body: "Safe Tree Removal, Debris Cleanup & Final Walkthrough"

### 3a. Call CTA — desktop copy (`col-TZ4hzPn0si`, class `desktop-only`)

- link (tel:+16823657478) — main: "Call (682) 365-7478"
- link (tel:+16823657478) — sub: "Call Now For A Free Estimate Today" ← the space between "Now" and "For" is U+00A0

### 3b. Call CTA — mobile copy (`col-Vq25j9zPj1`, class `mobile-only`)

- link (tel:682-452-0735) — main: "682-452-0735" ← href is a BARE number, not E.164; see structure.md
- link (tel:682-452-0735) — sub: "Call Now For A Free Estimate Today" ← U+00A0 between "Now" and "For"

---

## Section 4 — Why choose us + Google reviews  (`section-evIFlIWTQp`)

- h1: "Why West Dallas Homeowners"
- h1 (second `<h1>`, wrapped in `<strong>`): "Choose Texas Tree Tops for Tree Removal"
- body: "Texas Tree Tops provides fast, reliable tree removal service for homeowners in Highland Park, University Park, Kessler Park / N. Oak Cliff, Colleyville, Coppell, Flower Mound, Cedar Hill / DeSoto / Duncanville, Southlake, Colleyville, Grapevine Keller Trophy Club Westlake Mansfield Fort Worth Hurst, Euless, Bedford, Coppell, Carrollton, Farmers Branch, Addison, Irving, Grand Prairie, and Surrounding West Dallas"
  - "Colleyville" and "Coppell" each appear twice; "Grapevine Keller Trophy Club Westlake Mansfield Fort Worth Hurst" has no commas at all. Preserved.

### Review card 1

- h4: "Amy Pulaski"
- imageAlt: "5 stars"
- imageAlt: "Google"
- body: "Google Review · a month ago"
- body: "Great service! I had a dead tree removed and replaced. Daniel sent numerous photos of trees for my approval. The two gentlemen who came to do the work were on time, courteous, and professional. They went above and beyond to make sure I was happy when they finished. I would highly recommend them."

### Review card 2

- h4: "Carol Malcik"
- imageAlt: "5 stars"
- imageAlt: "Google"
- body: "Local Guide · 9 months ago"
- body: "Texas Tree Tops removed a massive tree over 100 feet tall from our backyard. The removal was challenging due to the tree's proximity to our house, the neighbors' house, the fence, and our pool. The team demonstrated exceptional skill and care."
  - the apostrophes in "tree's" and "neighbors'" are STRAIGHT quotes (U+0027), unlike the curly ’ used elsewhere on the page.

### Review card 3

- h4: "John Bundren"
- imageAlt: "5 stars"
- imageAlt: "Google"
- body: "Google Review · 11 months ago"
- body: "The Texas Tree Tops team did an amazing job taking down a huge pecan tree in our yard. They were fast, professional, and affordable. They had to navigate a tricky overhang on our neighbor's house as well. Daniel was also great to work with."
  - straight apostrophe in "neighbor's".

### Section 4 CTA

- link (tel:+16823657478) — main: "(682) 365-7478"
- link (tel:+16823657478) — sub: "Call Now For A Free Estimate Today" ← U+00A0 between "Now" and "For"

---

## Section 5 — Restoration Results Guaranteed  (`section-i0C6s9XHTY`)

- h1 (text node): "Restoration " ← trailing space
- h1 (span): "Results Guaranteed"
- body: "Our large crews use specialized equipment to complete removals safe and efficiently — because when a tree needs to come down, you need it handled fast and done right!"
  - "safe and efficiently" (should be "safely"); the dash is an em dash U+2014.
- 5 images (no alt), laid out 2 + 3
- link (tel:+16823657478) — main: "(682) 365-7478"
- link (tel:+16823657478) — sub: "Call Now For A Free Estimate Today" ← U+00A0 between "Now" and "For"

---

## Section 6 — Tree Removal Services We Offer  (`section-Pt0S1QTMn0`)

- h1 (text node): "Tree Removal " ← trailing space
- h1 (span): "Services We Offer"
- body: "Safe, clean, and professional tree removal service for East Dallas homeowners who need the job handled without a mess left behind."
  - says **East Dallas** on a **West Dallas** page. Preserved.

Service list — 20 items in three columns, each column preceded by an image (no alt).

Column 1 (after `image-N_8V3zhF8M`):

- listItem: "Residential Tree Removal"
- listItem: "Dead Tree Removal"
- listItem: "Large Tree Removal"
- listItem: "Oak Tree Removal"
- listItem: "Tree Cutting ServiceBullet"
- listItem: "Safe Tree Removal Near Homes"
- listItem: "Local Tree Removal Company"

Column 2 (after `image-59wbz-qT4H`):

- listItem: "Stump Grinding"
- listItem: "Tree Stump Removal"
- listItem: "Tree and Stump Removal"
- listItem: "Debris Cleanup & Haul Away"
- listItem: "Yard Clearing After Tree Removal"
- listItem: "Final Walkthrough Included"
- listItem: "Tree Cutting/Branch Removal"

Column 3 (after `image-M7UKburXYu`):

- listItem: "Affordable Tree Removal Service"
- listItem: "Same-Day Tree Removal"
- listItem: "Crane-Assisted Tree Removal"
- listItem: "Tree Removal Estimate"
- listItem: "Tree Removal For Yard"
- listItem: "West Dallas Tree Removal " ← trailing space

### Section 6 CTA

- link (tel:+16823657478) — main: "(682) 365-7478"
- link (tel:+16823657478) — sub: "Call Now For A Free Estimate Today" ← U+00A0 between "Now" and "For"

---

## Section 7 — Areas We Serve  (`section-o8EAaPwuM8`)

- h1 (span): "Areas " ← trailing space
- h1 (trailing text node): "We Serve"
- h2 (span): "Top Rated West Dallas Local Tree Trimming Company"
  - says **Trimming** on a tree-**removal** page. Preserved.

A three-track CSS marquee of city pills. Each track's group of pills is duplicated in the markup for the infinite-scroll effect; the 25 pills below are the unique set, in source order.

Track 1 (`ttt-track`, scrolls forward):

- listItem: "Highland Park"
- listItem: "University Park"
- listItem: "Kessler Park"
- listItem: "Colleyville"
- listItem: "Coppell"
- listItem: "Flower Mound"
- listItem: "Cedar Hill"
- listItem: "DeSoto"
- listItem: "Duncanville"

Track 2 (`ttt-track reverse`):

- listItem: "Southlake"
- listItem: "Grapevine"
- listItem: "Keller"
- listItem: "Trophy Club"
- listItem: "Westlake"
- listItem: "Mansfield"
- listItem: "Fort Worth"
- listItem: "Hurst"

Track 3 (`ttt-track`):

- listItem: "Euless"
- listItem: "Bedford"
- listItem: "Carrollton"
- listItem: "Farmers Branch"
- listItem: "Addison"
- listItem: "Irving"
- listItem: "Grand Prairie"
- listItem: "West Dallas"

---

## Section 8 — Long-form SEO copy  (`section-cbglAhOxWH`)

- badge: "Top Rated · 5-Star Service"
  - The served HTML writes this as the literal entity `Top Rated &middot; 5-Star Service`; the browser renders U+00B7 MIDDLE DOT. The string above is the rendered form. If you are pasting into a GHL custom-code element, paste `Top Rated &middot; 5-Star Service`.
- h2 (text node): "Tree Removal Service Done " ← trailing space
- h2 (span): "Safely, Cleanly & Carefully"
- body: "Careful Tree Removal. Complete Cleanup. No Mess."
- body: "Some trees become a problem slowly. They lean toward the house, crowd the driveway, drop limbs across the yard, block sunlight, or sit exactly where a cleaner, better outdoor space should be. When that happens, Texas Tree Tops is the local tree removal company Fort Worth homeowners call to get the tree handled without chaos, guesswork, or a mess left behind."
  - says **Fort Worth** homeowners. Preserved.
- body: "We provide professional tree removal service in Fort Worth, Arlington, Keller, Southlake, North Richland Hills, Hurst, Bedford, Haltom City, and throughout Tarrant County. Whether you need residential tree removal, dead tree removal, large tree removal, oak tree removal, or tree cutting service, our crew can inspect the job, explain your options, give you a tree removal estimate, and handle the removal from start to finish."
  - a **Tarrant County** service list on a West Dallas (Dallas County) page. Preserved.
- imageAlt: "Texas Tree Tops branded trucks in Fort Worth"
- imageAlt: "Large tree removal by Texas Tree Tops"
- h2 (text node): "Common Tree Removal " ← trailing space
- h2 (span): "Requests We Handle"
- listItem: "Residential tree removal for unwanted, overgrown, or poorly placed trees"
- listItem: "Dead tree removal for dry, damaged, declining, or unsafe trees"
- listItem: "Tree cutting service for trees near homes, fences, garages, and driveways"
- listItem: "Removal of large trees blocking sunlight, crowding the yard, or taking over usable space"
- listItem: "Oak tree removal and other big-canopy trees handled safely"
- listItem: "Tree removal before landscaping, patio work, or other outdoor upgrades"
- listItem: "Debris cleanup and a final walkthrough after the removal is complete"

---

## Section 9 — Mid-page CTA  (`section-toIz3g1_9P`)

- h2: "Looking for a Tree Removal Company Near You?"
- body: "Request your free tree removal estimate today and our team will call you with the next steps for your tree removal quote."
- button (GHL action `scroll-to-element` → `form-5gd7-YxgNV`) — main: "Get Request my tree removal free estimate"
  - "Get Request my tree removal free estimate" reads as a doubled verb and inconsistent casing. Preserved.
- button — sub: "Request a call back"
- h1 (span): "Ready To Get " ← trailing space
- h1 (second `<h1>`, span): "That Tree Handled?"
- link (tel:+16823657478) — main: "(682) 365-7478"
- link (tel:+16823657478) — sub: "Call Now For A Free Estimate Today" ← U+00A0 between "Now" and "For"

---

## Section 10 — How Our Tree Removal Service Works  (`section-cpwew5Yzi0`)

- h1 (span): "How Our Tree"
- h1 (second `<h1>`, span): "Removal Service Works"

The four steps are rendered **twice** — a desktop copy and a mobile copy, in different orders. The strings are identical in both. Recorded once here; see structure.md for the ordering difference.

- body: "Step 1"
- h2: "Request Your Free Estimate"
- body: "Tell us what needs to be removed and where the tree is located. We’ll follow up quickly with the next steps for your tree removal quote."

- body: "Step 2"
- h2: "We Inspect The Job"
- body: "Our crew looks at the tree size, access, nearby structures, stump grinding options, and cleanup needs so there are no wild surprise"
  - "no wild surprise" — missing the final "s", and no closing full stop. Preserved.

- body: "Step 3"
- h2: "Safe Tree Removal"
- body: "We handle the cutting, removal, and debris cleanup with the right crew, equipment, and process for your property."

- body: "Step 4"
- h2: "Final Walkthrough"
- body: "Before we leave, we make sure the tree removal is complete, the cleanup is done, and the yard is left clean, safe, and usable again."

- image (no alt) — appears once in each of the two copies

---

## Section 11 — FAQ  (`section-em7O_SRdYL`)

- h1 (text node): "Top 10 " ← trailing space
- h1 (span): "Frequently Asked Question"
- h1 (trailing text node): " About Tree Removals" ← leading space
  - "Frequently Asked Question" is singular. Preserved.

- h4: "How fast can you come out for a tree removal estimate?"
- body: "In many cases, we can schedule same-day or next-available estimates while crews are open. If you need tree removal service in West Dallas, send your request and we’ll call you with the next steps."

- h4: "How much does tree removal cost?"
- body: "Tree removal cost depends on the size of the tree, where it sits, how close it is to the house, fence, driveway, or power lines, and how much cleanup is needed. The fastest way to get a real number is to request a free tree removal estimate so our crew can inspect the job and give you a clear quote."

- h4: "Do you remove dead, damaged, or overgrown trees?"
- body: "Yes. We handle residential tree removal, dead tree removal, overgrown tree removal, and trees that are too close to homes, garages, fences, driveways, or usable yard space. When a tree starts turning into a problem, we help get it down safely, cleanly, and without leaving the yard looking like a battlefield."

- h4: "Is stump grinding included with tree removal?"
- body: "Stump grinding is available with qualifying tree removals. Some homeowners want the tree gone and the stump left alone. Others want the area fully cleaned up for grass, landscaping, fencing, patios, or a better-looking yard. We’ll explain your options during the estimate."

- h4: "Do you clean up after the tree removal?"
- body: "Yes. Our tree removal service includes debris cleanup and a final walkthrough after the job is complete. The goal is simple: remove the tree, clear the mess, and leave the property looking clean and usable again."

- h4: "Are you licensed and insured?"
- body: "Yes. Texas Tree Tops is licensed and insured, with coverage up to $2M. Tree removal can be dangerous work, especially around homes, fences, roofs, and driveways, so you want a crew that knows how to handle the job safely."
  - "$2M" here vs "$2Million" in Section 3. Both preserved as written.

- h4: "What areas do you serve?"
- body: "We provide tree removal service in East Dallas, Mesquite, Garland, Rowlett, Rockwall, Sunnyvale, Heath, Fate, Forney, and the Lake Ray Hubbard area."
  - an **East Dallas** service list. Preserved.

- h4: "When should I remove a tree?"
- body: "Homeowners usually call for tree removal when a tree is dead, leaning, damaged, dropping limbs, growing too close to the house, blocking sunlight, crowding the yard, or standing in the way of landscaping or outdoor upgrades. If the tree is becoming a safety risk or killing the look and function of your yard, it’s time to get an estimate."

- h4: "Can you help if I need the tree gone before landscaping or yard work?"
- body: "Yes. Many customers call us before installing sod, fencing, patios, driveways, gardens, or other outdoor upgrades. Tree and stump removal can open up the yard, bring in more sunlight, and give you a cleaner space to work with."

- h4: "How do I get started?"
- body: "Fill out the form and request your free tree removal estimate. We’ll call you, review the job, answer your questions, and help you figure out the best next step for your property."

---

## Section 12 — Final CTA  (`section-zZW8Wc9Z7T`)

- h1: "Need Tree Removal?"
- h1 (second `<h1>`, wrapped in `<strong>`): " Get a Free Estimate Today" ← leading space
- body: "Fast tree removal service for homeowners in West Dallas, Whether the tree is dead, overgrown, blocking your yard, or sitting too close to the house, our crew can inspect it, explain your options, and handle the removal cleanly."
  - comma splice with a capital "Whether". Preserved.
- link (tel:+16823657478) — main: "Get my free estimate"
- link (tel:+16823657478) — sub: "Click to call"
  - This is the only phone CTA on the page whose visible text does not contain a phone number.

---

## Section 13 — Footer  (`section-yOWoo1RyOV`)

- image: logo (no alt)
- body: "Texas Tree Tops Tree Service LLC"
- body: "©Copyright Texas Tree Tops. | All rights reserved 2026"
  - no space after "©". Preserved.

### 13a. Legal links — desktop copy (`row-xdA6wLUcIY`, class `desktop-only`)

- link (https://links.treeleads.io/preview/mKHiwloWMigr9M9z00tv, opens in new tab): "Privacy Policy"
- link (https://links.treeleads.io/preview/Q3OqcRO0SoaE5nnwNGcK, opens in new tab): "Terms of Service"

### 13b. Legal links — mobile copy (`row-z2ymiYHJ_G`, class `mobile-only`)

Same labels, but rendered as `<button>` elements with GHL action `openPopup` → `hl_main_popup-eJnCVAV3I5`, which is an EMPTY popup. On mobile these two links therefore open nothing.

- button: "Privacy Policy" (aria-label "Privacy Policy " ← trailing space)
- button: "Terms of Service" (aria-label "Terms of Service " ← trailing space)

---

## Placeholder / attribute strings (not body copy, but reproduced verbatim)

- inputPlaceholder: "Enter your first name"
- inputPlaceholder: "Enter your last name"
- inputPlaceholder: "Enter phone number"
- inputPlaceholder: "Enter email address"
- imageAlt (gallery, ×15): "Texas Tree Tops tree removal in Fort Worth"
- imageAlt: "5 stars"
- imageAlt: "Google"
- imageAlt: "Texas Tree Tops branded trucks in Fort Worth"
- imageAlt: "Large tree removal by Texas Tree Tops"
- metaTitle: "Tree Removal Services in West Dallas | Texas Tree Tops"
- metaDescription: "Texas Tree Tops LLC provides safe tree removal, stump grinding, cleanup, and free estimates."
- metaAuthor: "Texas Tree Tops"

---

## EXTRACTION-NOTES

Ambiguities and source defects recorded rather than resolved. **None of these were fixed.**

1. **Geography is inconsistent across the page.** Title, H1, FAQ #1, marquee and Section 6's last list item say **West Dallas**. Section 6's intro paragraph and FAQ #7 say **East Dallas** (with Mesquite / Garland / Rowlett / Rockwall / Lake Ray Hubbard). Section 8 says **Fort Worth** and **Tarrant County**. The 15 gallery photos all carry alt "Texas Tree Tops tree removal in Fort Worth". The `<meta name="keywords">` block is entirely East Dallas / Mesquite / Lake Ray Hubbard. All four geographies coexist in the control.

2. **"Tree Cutting ServiceBullet"** (Section 6) — an editor artifact where the word "Bullet" was left welded onto the service name. Preserved exactly.

3. **"so there are no wild surprise"** (Section 10, Step 2) — missing plural "s" and missing terminal punctuation. Preserved exactly, in both the desktop and the mobile copy.

4. **"Save $300 though August-31st"** (Section 1d) — "though" for "through". Preserved.

5. **"Get Request my tree removal free estimate"** (Section 9 button) — doubled verb, inconsistent capitalisation. Preserved.

6. **"Top Rated West Dallas Local Tree Trimming Company"** (Section 7) — says *trimming* on a *removal* page. Preserved.

7. **"removals safe and efficiently"** (Section 5) — "safe" for "safely". Preserved.

8. **Insurance figure is written two ways**: "$2Million" (Section 3) and "$2M" (FAQ #6).

9. **Non-breaking space in every call-button subtitle.** The subtitle "Call Now For A Free Estimate Today" uses U+00A0 between "Now" and "For" in all six places it occurs. If it is retyped with a normal space the control has been altered.

10. **Trailing/leading spaces are load-bearing for reproduction.** Confirmed in: "Tap To Call ", "Get Your ", "First Name ", "Last Name ", "Phone ", "Email (Optional) ", "Restoration ", "Tree Removal ", "West Dallas Tree Removal ", "Areas ", "Tree Removal Service Done ", "Common Tree Removal ", "Ready To Get ", "Top 10 ", and leading spaces in " West Dallas Homeowners", " About Tree Removals", " Get a Free Estimate Today".

11. **Mixed apostrophe characters.** Body copy written in GHL uses the curly ’ (U+2019): "we’ll", "it’s", "We’ll". The three Google review quotations, which came in via a custom-code element, use the straight ' (U+0027): "tree's", "neighbors'", "neighbor's". Both preserved as-is.

12. **`&middot;` in Section 8.** The badge is authored as the raw entity `Top Rated &middot; 5-Star Service` inside a custom-code element. Browsers render "Top Rated · 5-Star Service". The prepared `clean/removal.text.txt` recorded the undecoded entity, which is why that file and this one differ on this one line. Both forms are given in Section 8 above so neither can be lost.

13. **Two paragraphs are hidden at every viewport width.** `paragraph-BOeRKrin1Q` and `paragraph-hPbI9yy1Ja` — both instances of "Enter your info and we’ll call you with the next steps for your tree removal quote" — each carry the classes `desktop-only` **and** `mobile-only`. The stylesheet sets `.desktop-only{display:none}` under `@media (max-width:767px)` and `.mobile-only{display:none}` under `@media (min-width:768px)`, so the element is hidden in both branches. The form's supporting line is therefore in the DOM but never seen. Recorded, not fixed.

14. **The "Call (469) 402-1196" button is also never visible.** It sits in a `desktop-only` column nested inside a `mobile-only` row, so one of the two rules always hides it. It is additionally a dead control: its GHL action is `openPopup` targeting `hl_main_popup-eJnCVAV3I5`, whose element tree is empty (`child: []`).

15. **The two footer legal "links" on mobile are dead.** The `mobile-only` copies are `<button>` elements with action `openPopup` pointing at the same empty popup, not anchors. Only the `desktop-only` copies carry real hrefs to links.treeleads.io.

16. **The Google review badge's custom code contains an author comment reading "Bottom row: caption (typo fixed)".** This is an HTML comment, not visible copy. Noted only so nobody mistakes it for page text.

17. **Review-badge SVGs are served from a different GHL location.** The "5 stars" and "Google" SVGs load from `assets.cdn.filesafe.space/FaHof000UZrAJUKORVCj/...` while every other first-party asset uses this page's own location id `zfoeYpKrqshgdFr4gG3b`.

18. **Image roles are inferred, not stated.** All 21 GHL `<picture>` assets render with `alt=""` and carry no intrinsic width/height in the markup, so `role` in images.json is inferred from DOM placement and CSS sizing. The two marked `logo` and the four marked `icon` in the benefit strip are confident; the ones marked `gallery` in Sections 5 and 6 and the ones marked `other` in Sections 1, 3 and 10 are placement-based guesses. The assets were not downloaded, so no role here is visually verified.

19. **The gallery slider's photo count.** 15 `<img>` elements, 15 distinct Google media ids, no duplication. The first one's URL ends `=m18` while the other fourteen end `=s680-w680-h510-rw`; all fourteen-plus-one carry `width="680" height="510"`.

20. **Swiper is loaded twice.** `https://cdnjs.cloudflare.com/ajax/libs/Swiper/8.0.5/swiper-bundle.min.js` appears as two separate `<script src>` tags.

21. **The form's redirect points at another company's domain.** See form.json — `redirectUrl` is `https://titantreeservicetx.com/thank-you-page-89169333-2226`. Recorded verbatim; I could not determine from static HTML whether that or the relative `funnelNextStep` actually fires.

22. **No Ad Click ID field exists on this page.** Stated explicitly, with the four checks that establish it, in form.json → `adClickIdField`.
