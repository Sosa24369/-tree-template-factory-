# structure.md — J Valdez Tree Services · "trimming" landing page

Source: https://jvaldeztreeservices.com/landing-page-997015
GHL locationId `FaHof000UZrAJUKORVCj` · funnelId `aWDKXf94ZPEgGj9HkbEn` · pageId `8rOLN04AbtNEocqeoqlW`

---

## 1. Ordered section list (rendered DOM order)

| # | GHL section id | Name | One-line description |
|---|---|---|---|
| 1 | `section-9JRQtJShoU` (rows `row-QUXhAWTlOS`, `row-XOS6-tOzGd`) | Header bar | Two mutually exclusive header rows: a desktop bar (Google rating badge + logo + "Call (214) 985-7697") and a mobile bar (logo + "(469) 402-1196 / Tap To Call"). |
| 2 | `section-9JRQtJShoU` (row `row-jmYMAXF38W`) | Hero + lead form | Google 4.9 badge, H1 offer headline, urgency H2, offer paragraph, then the 5-field GHL form on the left and two hero photos on the right. |
| 3 | `section-6TzwOQDUZq` | Before/after gallery | Swiper carousel of five 1080×1080 job photos; no copy, alt text only. |
| 4 | `section-a8UgWW3zd0` | Four benefit cards + call CTA | 2×2 icon+text cards (discount, same-week, licensed/insured, safe trimming) plus a phone CTA that differs by breakpoint. |
| 5 | `section-evIFlIWTQp` | Why homeowners choose J Valdez + Google reviews | Google rating pill, two-line H1, service-area sentence, five-slide Google review carousel, phone CTA. Section has a photo background. |
| 6 | `section-i0C6s9XHTY` | "Done Clean, Done Right" photo grid | H1 + supporting line + five work photos in two rows, phone CTA. |
| 7 | `section-Pt0S1QTMn0` | Services we offer | H1 + supporting line + three "service-card" columns of bullet lists (6 / 6 / 5 items), phone CTA. Section has a photo background. |
| 8 | `section-o8EAaPwuM8` | Areas we serve | H1, sub-heading, and a three-track CSS marquee of nine service-area pills. Marquee row has its own background image. |
| 9 | `section-cpwew5Yzi0` | How our tree trimming service works | Two-line H1 plus a four-step process, authored twice (mobile copy and desktop copy) around a tall vertical connector graphic. |
| 10 | `section-toIz3g1_9P` | Long-form SEO block + mid-page CTA | "Top Rated - 5 Star Service", the two long-form paragraphs (marked up as H2), "Common Tree Trimming Requests We Handle" list, a scroll-to-form CTA, and the "Ready To Get Those Trees Trimmed?" phone band. |
| 11 | `section-7oJnz-0VhU` | FAQ | "Top 10 Frequently Asked Question About Tree Trimming" accordion with exactly 10 Q/A pairs. |
| 12 | `section-zZW8Wc9Z7T` | Final CTA | "Need Tree Trimming? / Get a Free Estimate Today" + paragraph + scroll-to-form button. Section has a photo background. |
| 13 | `section-yOWoo1RyOV` | Footer | Logo, business name, address + phone contact box, divider, copyright, and Privacy/Terms links (desktop) or buttons (mobile). |

Element-level outline (indentation = DOM nesting) is reproduced verbatim from the snapshot in the notes at the bottom of this file.

---

## 2. Responsive duplication — the source renders desktop and mobile copies of the same content

GHL implements responsive visibility with two classes and two media queries only:

```
@media (max-width:767px) { .desktop-only { display:none } }
@media (min-width:768px) { .mobile-only  { display:none } }
```

An element carrying **both** classes is therefore hidden at every width.

### 2.1 Header — two separate rows, two different phone numbers
- `row-QUXhAWTlOS` — `desktop-only`. Google rating badge (`image--OXKJdqjR2`), circular logo (`image-Yx59ATBVD_`), phone button "Call (214) 985-7697".
- `row-XOS6-tOzGd` — `mobile-only`. Circular logo (`image-AsROCxR7PD`, same asset as `image-Yx59ATBVD_`), phone button "(469) 402-1196" / "Tap To Call".
- Record the header **once** in a rebuild, but note the desktop and mobile bars carry **different phone numbers and different anchor text**.
- Dead markup: `col-6PAsUZZzSt` (`desktop-only`) is nested **inside** the `mobile-only` header row and contains `button-3zhCn5xTPd` ("Call (469) 402-1196"). A desktop-only column inside a mobile-only row can never be visible, so this button renders on no breakpoint.

### 2.2 Hero form heading — two different strings, not a straight duplicate
- `col-yL4DnEssSU` (visible on both breakpoints) contains `sub-heading-TVyXLNMxiV` which is `desktop-only`: "Get Your Free Trimming Estimate".
- `col-vk8rBPkJ5b` is `mobile-only` and contains `sub-heading-7aLzvfhBAh`: "Get Your Free Tree Trimming Estimate  East Dallas & Nearby" (note the doubled space).
- These are **different copy**, not a responsive duplicate — record both.

### 2.3 Hero form sub-paragraph — duplicated AND invisible
- `paragraph-BOeRKrin1Q` and `paragraph-hPbI9yy1Ja` are byte-identical: "Enter your info and we’ll call you with the next steps for your tree removal quote".
- Both carry `class="c-paragraph c-wrapper desktop-only mobile-only"` and both have `hideDesktop: true, hideMobile: true` in the page payload, so **neither renders at any width**. The sentence is present twice in the DOM and visible zero times.

### 2.4 Benefit-card CTA — duplicated with a different phone number
- `col-TZ4hzPn0si` (`desktop-only`) → "Call (214) 985-7697" / "Call Now For A Free Estimate Today".
- `col-Vq25j9zPj1` (`mobile-only`) → "Call (469) 402-1196" / "Call Now For A Free Estimate Today".
- Same sub-text, different number and different main text.

### 2.5 Process steps — same four steps authored twice, in a different order
- `row-6Yl0-6dyH5` (`mobile-only`) lays the four steps out in a single stack, **DOM order 1 → 2 → 3 → 4**.
- `row-O7NtuDOYvR` (`desktop-only`) splits them across two columns flanking a vertical graphic, so the **DOM order is 1 → 3 → (image) → 2 → 4**: `col-L275YyIRyS` holds Step 1 and Step 3, `col-uOVpFx6nWx` holds the connector image, `col-TR-5Y4e4ga` holds Step 2 and Step 4.
- The strings are identical between the two copies. copy.md records the four steps once.
- Dead markup: `col-VU_FilZYy3` (`desktop-only`, holding `image-uAaKobxnI8`) is nested inside the `mobile-only` row, so that copy of the connector graphic never renders; only `image-VSnTZtdVWa` in the desktop row shows.

### 2.6 "Common Tree Trimming Requests" photo — one per breakpoint
- `col-POFA7zo986` (`desktop-only`) → `image-iKayx-SL1U` (media `6a45b3c080abc5e234517473.png`).
- `col-RSYR8Gqj-T` (`mobile-only`) → `image-_ut3oJ_w6f` (media `6a45b3c3f5487c97781a77e8.png`).
- Different assets, same slot.

### 2.7 Footer legal links — link on desktop, broken popup button on mobile
- `row-xdA6wLUcIY` (`desktop-only`) → two real anchors to `links.treeleads.io` (Privacy Policy, Terms of Service), each opening in a new tab.
- `row-z2ymiYHJ_G` (`mobile-only`) → two `<button>` elements with GHL action `openPopup` targeting `hl_main_popup-eJnCVAV3I5`. That popup exists in the payload with **zero child elements**, so on mobile the Privacy Policy and Terms of Service controls open an empty overlay. Copy is identical; behaviour is not.

### 2.8 Service-area marquee — one block, six internal repeats, two orderings
`custom-code-A8otsFIT--` is a single element (not a responsive duplicate) that emits three `.marquee-track` rows, each containing two identical `.marquee-group` copies (the standard CSS-marquee doubling trick). That is 6 × 9 = **54 pills in the DOM for nine unique names**.
- Track 1 (`.marquee-track`) and Track 3 (`.marquee-track`) use **order A**: Mesquite, Rockwall, Rowlett, Forney, Heath, Fate, Sunnyvale, Garland, East Dallas & Lake Ray Hubbard.
- Track 2 (`.marquee-track.reverse`) uses **order B**, the same nine names rotated by six: Sunnyvale, Garland, East Dallas & Lake Ray Hubbard, Mesquite, Rockwall, Rowlett, Forney, Heath, Fate.
- copy.md records the nine names once per ordering, not 54 times.

### 2.9 Google review slider
`custom-code-8BO6xwlaH1` renders five slides with `loop:true`. Swiper clones slides at runtime, but the SSR HTML contains each review exactly once. No responsive duplicate.

---

## 3. PHONE TREATMENT

### Distinct numbers on the page: **2**

| Display | href | Occurrences (anchors) |
|---|---|---|
| (214) 985-7697 | `tel:+12149857697` | 6 |
| (469) 402-1196 | `tel:+14694021196` | 3 |

Total dialable anchors: **9**. (The saved snapshot contains 12 raw `tel:` substrings; the extra 3 are inside the serialised `__NUXT_DATA__` page payload, not rendered anchors.)

### A. (214) 985-7697 — `href="tel:+12149857697"` (desktop-weighted)

| # | Where | GHL element | Anchor main text | Anchor sub-text | aria-label |
|---|---|---|---|---|---|
| 1 | Header, desktop bar | `button-qwl5Ux0JZe` (in `col-m-yDegukWx`, `desktop-only`) | `Call (214) 985-7697` | *(none)* | `Call (214) 985-7697 ` |
| 2 | Section 4, benefit-cards CTA, desktop column | `button-w6i_nJR0lW` (in `col-TZ4hzPn0si`, `desktop-only`) | `Call (214) 985-7697` | `Call Now For A Free Estimate Today` | `Call (214) 985-7697 Call Now For A Free Estimate Today` |
| 3 | Section 5, below the Google review slider | `button--kIKpIzaUL` | `Call (214) 985-7697` | `Call Now For A Free Estimate Today` | same as above |
| 4 | Section 6, below the "Done Clean, Done Right" photo grid | `button-GecFCrteC2` | `Call (214) 985-7697` | `Call Now For A Free Estimate Today` | same as above |
| 5 | Section 7, below the services bullet columns | `button-_LS21RqVvN` | `Call (214) 985-7697` | `Call Now For A Free Estimate Today` | same as above |
| 6 | Section 10, "Ready To Get Those Trees Trimmed?" band | `button-kwfdGgdu0L` | `Call (214) 985-7697` | `Call Now For A Free Estimate Today` | same as above |

### B. (469) 402-1196 — `href="tel:+14694021196"` (mobile + footer)

| # | Where | GHL element | Anchor main text | Anchor sub-text | aria-label |
|---|---|---|---|---|---|
| 1 | Header, mobile bar | `button-ilOPxA15xd` (in `col-TduIKpEgr0` of `row-XOS6-tOzGd`, `mobile-only`) | `(469) 402-1196` | `Tap To Call` | `(469) 402-1196 Tap To Call` |
| 2 | Section 4, benefit-cards CTA, mobile column | `button-Tk8AUj2tvs` (in `col-Vq25j9zPj1`, `mobile-only`) | `Call (469) 402-1196` | `Call Now For A Free Estimate Today` | `Call (469) 402-1196 Call Now For A Free Estimate Today` |
| 3 | Footer contact box (raw HTML, not a GHL button) | `custom-code-0aE34cxYy4` → `<a href="tel:+14694021196">` | `(469) 402-1196` | *(none)* | *(none)* |

> **Whitespace note:** the sub-text `Call Now For A Free Estimate Today` is shown above with an ordinary space for readability. In the source there is a **U+00A0 non-breaking space** between "Now" and "For". copy.md carries the exact bytes.

### C. Phone-looking control that does **not** dial
- `button-3zhCn5xTPd` — a `<button>` (no `href`), main text `Call (469) 402-1196`, aria-label `Call (469) 402-1196 `. GHL action is `openPopup` → `hl_main_popup-eJnCVAV3I5`, which is an empty popup. It also sits in a `desktop-only` column inside the `mobile-only` header row, so it never renders. **Do not treat this as a tracked phone control.**

### D. Number-formatting consistency — relevant for CallRail DNI

- **Every `href` on this page is already E.164 with the `+1` country code.** All 6 use `tel:+12149857697` and all 3 use `tel:+14694021196`. There is **no** bare/dashed href variant (nothing like `href="tel:682-452-0735"`) anywhere in the markup. This page does not have the formatting inconsistency seen on other pages in this account.
- **Display text is not consistent, though.** Five different display strings exist across the 9 anchors:
  - `Call (214) 985-7697` (×6)
  - `Call (469) 402-1196` (×1 anchor, plus ×1 non-dialing button)
  - `(469) 402-1196` (×2 — mobile header button and the footer raw-HTML anchor)
  A text-substitution DNI rule keyed on a single display string will miss at least one control. Number-swap must be keyed on `href`, not on visible text.
- **The two numbers are split by breakpoint, not by intent.** Desktop visitors only ever see (214) 985-7697 except in the footer; mobile visitors only ever see (469) 402-1196. Any DNI pool has to cover both numbers, or the swap will silently apply to one breakpoint only.
- **One anchor is inside a Custom HTML/JS element** (the footer contact box). It is not a GHL button, so it will not be touched by any GHL-button-level replacement and needs its own selector.
- **There is no sticky/floating call bar** on this page. The only always-reachable phone control is in the header (which scrolls away) and the footer.
- The two numbers are also the two ends of the page: the funnel is named `Tree Trimming Campaign - Google Ads`, so (214) 985-7697 — the number on every mid-page CTA on desktop — is the highest-value swap target.

---

## 4. Other structural notes worth carrying forward

- **No `<title>` element** is rendered, and **no `<meta name="description">` element exists at all** (`name="description"` and `og:description` both occur 0 times in the snapshot) — the empty strings live only in the payload, where `meta.title` / `meta.description` / `meta.author` / `meta.imageUrl` (payload object 4986) all resolve to index 42 = `""`. "Absent" and "empty" are different rebuild targets; the element is absent. The snapshot has exactly **5** `<meta>` elements: `charset=utf-8`, `viewport`, `og:type`, `twitter:type`, `apple-mobile-web-app-capable`. Plus the GHL default favicon.
- **Section / row background images:** five (see images.json, role `background`): `section-evIFlIWTQp`, `section-Pt0S1QTMn0`, `row-sReEX03pnX` (the marquee row), `row-YIxQrLnVyw` (the "Ready" band) and `section-zZW8Wc9Z7T`. All use GHL option `fill-width-height`, opacity 1. **They are responsive.** The bare `assets.cdn.filesafe.space` URL recorded as `src` exists only in the `__NUXT_DATA__` element config and is never requested; the stylesheet paints each one through a `.bg-<elementId>` class with three transformed URLs under three media queries — `@media (max-width: 480px)` → `r_768`, `@media (min-width: 481px) and (max-width: 1024px)` → `r_900`, `@media (min-width: 1025px)` → `r_1200`. All three are now in each entry's `variants[]`. Note these are **not** the `<picture>` breakpoints used by `<img>` assets (see note 13).
- **Decorative CSS background SVGs (easy to miss — they have no `<img>` tag):** two hand-written client-CSS assets that render on many elements and are recorded in images.json with role `background`:
  - `6a443a9a4c02d14b8db7c6ed.svg` — the **CTA arrow glyph**, on **10 buttons**: `::after` on `.btn-arrow .main-heading-group` (1, desktop header) and `.mob-btn-arrow .main-heading-group` (1, mobile header), and `::before` on `.left_arrow` (8: `cbutton-w6i_nJR0lW`, `cbutton-Tk8AUj2tvs`, `cbutton--kIKpIzaUL`, `cbutton-GecFCrteC2`, `cbutton-_LS21RqVvN`, `cbutton-T5sp7p0n-b`, `cbutton-kwfdGgdu0L`, `cbutton-gyo6-qwTP1`). Box is 35×35 on the two `::after` rules, 36×36 on `::before`.
  - `6a443144c597b88b613bf310.svg` — the **FAQ accordion indicator**, `::before` on all **10** `.hl-faq-child-heading` rows, 30×25. The open-state rule only repositions it (`top: 22px; transform: translateY(0)`); the same SVG is used in both states.
  A rebuild that reads only `<img>` tags will silently drop both.
- **Dead assets — do NOT port:** `6a44237c21b1234da3de128a.svg` and `6a44237c45073744c0091e4a.svg` are uploaded location assets referenced by `#row-hEon8-PXEE::before` / `::after` (40×40 and 60×60 leaf decorations flanking the hero form row), but the whole block is inside a CSS comment that opens `/* leaf on form` and closes `} */` immediately before `.btn-arrow`. They render nowhere and are deliberately **not** in images.json. They are the only two slash-form `filesafe.space/<locationId>/media/<id>` assets in the snapshot that images.json does not carry — the other 40 are all recorded. (The three Satoshi `.otf` files are also filesafe media but appear percent-encoded, `filesafe.space%2F…%2Fmedia%2F`, and are fonts, not images.)
- **Fonts:** custom Satoshi faces uploaded to the location (`customhl-…-Satoshi Bold / Medium / Regular`, three `.otf` files) plus Google Fonts Inter + Roboto, `api.fontshare.com` Satoshi, and `fonts.cdnfonts.com` Satoshi. Three separate Satoshi sources are loaded.
- **Third-party JS inside custom-code blocks:** Swiper 8.0.5 (CSS + JS from cdnjs) is loaded for both the gallery and the review slider.
- **Form scroll targets:** both scroll-to-form buttons (`button-T5sp7p0n-b`, `button-gyo6-qwTP1`) target `form-5gd7-YxgNV`, the hero form. There is only one form on the page.
- **Form submit action:** `actionType: "1"` → redirect to `https://jvaldeztreeservices.com/thank-you-page-89169333-5732`. A `thankyouText` string is also configured but unused because the redirect wins.
- **No opt-in / consent checkbox** exists on the form (`isGDPRCompliant: false`), which matters if this page is ever cited for A2P 10DLC compliance.

---

## 5. EXTRACTION-NOTES (ambiguities, judgement calls, things NOT to "fix")

**Method.** Everything here comes from the saved snapshot `raw/trimming.html` (769,913 bytes) plus the four clean extracts. Where the flat extracts were ambiguous or empty, values were resolved by parsing the page's `__NUXT_DATA__` payload (a devalue-serialised array of 5,141 entries) and by re-walking the DOM with a nesting-aware parser. Nothing below was inferred from the live site.

1. **Section numbering is editorial.** The page has **12** `section-*` elements. copy.md and this file use **13** numbered sections because `section-9JRQtJShoU` is split into "Header bar" and "Hero + lead form" (they are visually and functionally distinct). Every editorial section is mapped to its GHL id.

2. **Element counts in the snapshot** (for verification of any rebuild): 16 `<h1>`, 17 `<h2>`, 0 `<h3>`, 15 `<h4>` (5 review names + 10 FAQ questions), 24 `<li>`, **96** `<img>` tags resolving to 33 distinct `src` values, 9 `tel:` anchors.
   - `<img>` breakdown so the number is self-checking: 54 service-area check icons (`6a44191a…svg`, 6 marquee groups × 9 pills) + 5 review star strips + 5 review Google glyphs + 2 header logo copies (desktop + mobile) + 2 process connector graphics (desktop + the never-rendered mobile copy) + 2 footer contact icons + 5 gallery slides + 21 remaining one-off photos/icons = **96**; 25 of the 96 are wrapped in a `<picture>` element (`<picture>` count = 25).
   - Counting gotchas: use `<img(?=[\s>/])` — a plain `grep -o '<img'` is fine here, but a plain `grep -o '<li'` returns 78 because it also matches `<link`; the strict `<li(?=[\s>/])` gives 24.
   - **images.json holds 41 entries**: the 33 distinct `<img>` srcs + 5 section/row CSS background images + 2 decorative CSS background SVGs (CTA arrow, FAQ indicator) + 1 CSS flag sprite. The inline envelope `<svg>` in the email field is the only rendered image-like asset NOT in images.json — it has no URL, so it is captured in form.json on the email field (`inlineIcon`).

3. **Multiple `<h1>` per section is authentic.** GHL renders multi-line headings as consecutive `<h1>` elements (e.g. "Why East Dallas Homeowners" + "Choose J Valdez for Tree Trimming"). Do not collapse them into one `<h1>` or demote any to `<h2>` - that would change the control's heading structure.

4. **Three long body paragraphs are marked up as `<h2>`, not `<p>`.** In Section 10, "Some trees just need attention...", the empty spacer, and "We provide professional tree trimming and pruning services..." all live inside `sub-heading-c3kHit8V0Y` as `<h2>` elements. Reproduce them as `<h2>`.

5. **Apostrophes are inconsistent and must stay that way.** Curly `’` (U+2019) appears only in "we’ll" in the two hero sub-paragraphs and in FAQ 10 ("We’ll call you"). Every other apostrophe on the page is a straight `'`.

6. **The `Call Now<U+00A0>For A Free Estimate Today` sub-text uses a real non-breaking space**, not the `&nbsp;` entity. There are exactly 14 U+00A0 bytes in the file: 6 in the rendered `<span class="sub-heading-button">` elements, 6 in the matching `aria-label` attributes, 1 in the `__NUXT_DATA__` copy of the string, and 1 inside a GHL CSS `content` rule.

7. **`tel:` count discrepancy explained.** The meta extract lists 12 `tel:` strings in document order. Only **9** are rendered anchors; the other 3 are inside the serialised `__NUXT_DATA__` payload (the button configs). Do not read the meta file's 12 as 12 phone links.

8. **`locationId` / `formId` candidates came back empty in the flat extract.** They were resolved from the payload: locationId `FaHof000UZrAJUKORVCj`, formId `o4MpEGeGgVZZIeDKHv2j`. There is exactly one of each on the page - no ambiguity, no guessing.

9. **Image `width` / `height` in images.json are `null` unless the snapshot literally states them.** Exactly **5** of the 96 `<img>` tags carry dimension attributes — the five gallery slides, all `width="1080" height="1080"`. Those five entries are the ONLY ones with non-null `width`/`height`. Every other entry is `null` with a `note` saying so. There is no other dimension source in the snapshot: `naturalWidth` occurs 0 times, every `imageMeta` in `__NUXT_DATA__` resolves to payload index 42 (the empty string), and the GHL per-image CSS is `width:auto;height:auto` (e.g. `.image--OXKJdqjR2{margin:0;width:auto;height:auto}`).
    - **An earlier revision of images.json carried intrinsic pixel sizes on 33 entries. They were removed** — they could not be pointed at anywhere in `raw/trimming.html` (e.g. `4320`, `2781`, `3832` each occur exactly once in the file and every one of those hits is a Nuxt payload array index, such as `"hoverAnimation":3832`, not a size). Guessed dimensions are worse than absent ones for a pixel-faithful rebuild.
    - **Where a real rendered box exists in CSS it is recorded separately**, in a `renderedSizeCSS` array that quotes the exact rule, so it can never be mistaken for an intrinsic size: `.contact-item img{width:32px;height:32px;flex-shrink:0}` (both footer icons), `.service-pill img{width:16px;height:16px;flex-shrink:0}` (marquee check), `.rating{display:block;width:82px;margin:8px 0 6px}` (review stars, width only), `.google-logo{width:22px;height:auto;flex-shrink:0}` (review Google glyph), `.hl_page-preview--content .image-AsROCxR7PD .image-container img{box-shadow:undefined;width:600px}` (mobile header logo — note the literal `box-shadow:undefined`, a GHL serialisation bug that is in the source), `.image-VSnTZtdVWa{margin:0;width:auto;height:50%}` (process connector), plus the pseudo-element boxes for the two decorative CSS SVGs.

10. **Image `alt` values.** Of the 96 `<img>` tags: **25** render `alt=""` (the GHL image elements — recorded as `""`), **64** have **no `alt` attribute at all** (the hand-written `<img>` tags inside custom-code blocks: review stars, review Google glyph, the 54 marquee check icons — recorded as `null`), and **7** carry real alt text (the five gallery slides plus the two footer contact icons, `"Location"` and `"Phone"`). There is no alt text to paraphrase or improve. The `background`-role entries are CSS backgrounds, not `<img>` tags, so `alt` is `null` for them by definition rather than by omission.

11. **Header image roles came from inspecting the asset files, which are OUTSIDE the snapshot.** Flagged as such because it is the one place these files used off-snapshot evidence:
    - `6a44238a21b1234da3de141c.svg` contains the Google brand palette (#FF302F, #3686F7, #20B15A and five #FDCC0D star fills) - it is a **Google rating badge**, so its role is `icon`, not `logo`.
    - `6a4424280f3445329fcb76fc.svg` is a white circle wrapping an embedded PNG - the **same embedded PNG** that appears inside the footer logo SVG `6a440bf64c02d14b8dab1b7b.svg`. That confirms it is the J Valdez logo lockup, role `logo`.
    - The pixel dimensions read off those files during that inspection were **deleted** and are not reproduced here or in images.json: they are unverifiable from `raw/trimming.html`, and only what the snapshot states is allowed to stand (see note 9).

12. **Photographic asset roles are positional, not descriptive.** Because every GHL image has an empty alt, roles like `hero`, `gallery` and `other` were assigned from where the element sits in the layout. What the photos actually depict was not determined and is not asserted anywhere in images.json.

13. **CDN variant set.** For assets served through `images.leadconnectorhq.com`, the `<picture>` block emits five `<source>` rules but only **four distinct URLs**: `r_900`, `r_768`, `r_640`, `r_320`. The 480-320px breakpoint re-uses the `r_768` URL - a GHL quirk, not an extraction error. `src` in images.json is the highest-resolution variant, `r_1200`.

14. **Assets inside custom-code blocks have no variants — but the five section/row backgrounds DO.** Gallery slides, review stars/glyph, marquee check icon and the footer contact icons are hand-written URLs pointing straight at `assets.cdn.filesafe.space`, so their `variants` arrays are empty by fact, not by omission. The **five background images are the exception**: they are GHL background settings, not custom-code markup, and the stylesheet requests three `images.leadconnectorhq.com` transforms per background (`r_768` / `r_900` / `r_1200`) under `max-width:480px` / `481-1024px` / `min-width:1025px`. Those three URLs are now in each background entry's `variants[]`; only the `assets.cdn.filesafe.space` `src` (the payload value) is never fetched. The two decorative CSS SVGs (CTA arrow, FAQ indicator) genuinely have no variants — they are hand-written client CSS pointing at `assets.cdn.filesafe.space`.

15. **Google badge markup detail.** "Google" is six single-letter `<span>`s (one per brand colour) and the stars are five `&#9733;` entities in one span. A naive DOM text dump splits this into `G o o g l e` - the rendered string is `Google`.

16. **A build comment survives in the source.** The Google-badge custom code contains `<!-- Bottom row: caption (typo fixed) -->`. It is an HTML comment, not visible copy, and is recorded here rather than in copy.md.

17. **Deliberate defects preserved in copy.md** (each is flagged inline there): "dicousnt" for discount; the doubled space in "includes  roof"; the stray ", —"; the doubled space in "Estimate  East Dallas"; the unclosed "(Multi-Tree Bundle Pricing"; "Mutli-Tree Pricing"; the duplicated "patio work"; "no wild surprises"; "start to finish.."; "Frequently Asked Question" (singular); FAQ 3 being a verbatim copy of FAQ 2 that does not answer its own question; FAQ 8's leading space inside `<h4>`; "tree removal" appearing three times on a trimming page (hero form sub-paragraph, the "Why choose" sentence, FAQ 7, FAQ 10); Forney missing from the Section 12 city list; the review typo "they high quality equipment"; "J. Valdez" in the copyright vs "J Valdez" elsewhere; trailing spaces on "Summer Special Ends Soon. ", "East Dallas Tree Trim Service ", "Ready To Get Those ", "Areas ", "Tree Trimming Service Done ", "Common Tree Trimming ", "Tree Trimming ".

18. **Functional defects found while extracting** (recorded so the A/B "control" is understood, not so they get fixed):
    - The hero form's supporting sentence ("Enter your info and we’ll call you...") exists **twice** in the DOM and renders **zero** times - both copies carry `hideDesktop: true` AND `hideMobile: true`.
    - `button-3zhCn5xTPd` looks like a phone CTA ("Call (469) 402-1196") but its action is `openPopup` on an empty popup, and it is unreachable at every breakpoint anyway.
    - The mobile Privacy Policy and Terms of Service buttons open the same empty popup instead of the legal pages that the desktop links point to.
    - Two connector/decorative images (`image-uAaKobxnI8`, and the never-rendered header button's column) sit in breakpoint-contradictory containers and never display.
    - The hero-form leaf decoration (`#row-hEon8-PXEE::before` / `::after`, assets `6a44237c21b1234da3de128a.svg` and `6a44237c45073744c0091e4a.svg`) was authored and then commented out in the page CSS. The assets are still uploaded to the location; nothing paints them.
    If the rebuilt template "fixes" any of these, the A/B test is no longer control-vs-variant on copy alone. Flag them to the operator before changing behaviour.

19. **One inline `<svg>` on the page, and it is not in images.json.** The email field renders an envelope glyph as an inline `<svg class="input-icon" aria-hidden="true" viewbox="0 0 24 24" ... style="color:#1C1C1CFF;">` immediately before `<input type="email">`, inside `<div class="flex email-input relative">`. It has no URL, so it lives in **form.json** on the email field as `inlineIcon` (opening tag, `<path>` and `d` recorded verbatim). It is also the reason that input carries `style="padding-left:36px !important;"`. No other inline `<svg>` exists in the snapshot (`<svg` count = 1).

20. **GTM is configured but not loaded in the snapshot — see tracking.json `tags[0].servedVsInjected`.** Only the body `<noscript><iframe …ns.html?id=GTM-PFZPR33H…></noscript>` is server-rendered (in `<body>`, byte offset ~540083; `</head>` is at 312946). The `gtm.js` loader `<script>` is **not** in the served `<head>` — the head contains no `googletagmanager` or `GTM-` substring, and its only four `<script>` tags are libphonenumber-js, intl-tel-input utils, intl-tel-input, and the Nuxt entry chunk. The loader exists only as an escaped string in `__NUXT_DATA__` (`globalHeadTrackingCode`, payload index 5019) and is injected client-side at hydration; the empty `<div id="gb-track-hl-custom-code"></div>` sits beside the noscript. Do not describe the head script as present in the served HTML.

21. **Not captured, by design.** Runtime-only state (Swiper's cloned loop slides, GTM's downstream tags, the GHL form's XHR endpoint at submit time) is not in the snapshot and is not asserted anywhere in these files.
