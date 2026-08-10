# Structure — Texas Tree Tops "removal" landing page

- **Live URL:** https://texastreetopsllc.com/landing-page-352422
- **GHL funnel page name:** "Routine Removal - Landing Page"
- **GHL locationId:** `zfoeYpKrqshgdFr4gG3b` · **funnelId:** `qbi6awJ3BCcbiBe6OCON` · **funnelPageId:** `Pq9zlf1JDKlbKWekGLKv`
- **13 top-level sections**, all `div.fullSection.c-section.c-wrapper`. No sticky or fixed bar anywhere (every row's `sticky` property is `noneSticky`; `position:sticky` appears 0 times in the page CSS).

---

## Section order

| # | GHL id | What it is |
|---|---|---|
| 1 | `section-9JRQtJShoU` | Header bar (logo + phone CTA), Google-rating badge, `$300 Off` hero headline, and the single lead-capture form. |
| 2 | `section-6TzwOQDUZq` | "Recent jobs" photo slider — a Swiper 8.0.5 carousel of 15 hot-linked Google Business Profile photos. No text at all. |
| 3 | `section-a8UgWW3zd0` | Four-item benefit strip (icon + line each), followed by the first big call CTA. |
| 4 | `section-evIFlIWTQp` | "Why West Dallas Homeowners Choose Texas Tree Tops", a service-area paragraph, three Google review cards, then a call CTA. |
| 5 | `section-i0C6s9XHTY` | "Restoration Results Guaranteed" — one paragraph, a 2+3 photo grid, then a call CTA. |
| 6 | `section-Pt0S1QTMn0` | "Tree Removal Services We Offer" — 20 service list items in three image-headed columns, then a call CTA. |
| 7 | `section-o8EAaPwuM8` | "Areas We Serve" — a three-track scrolling marquee of 25 city pills. |
| 8 | `section-cbglAhOxWH` | Long-form SEO block: badge, headline, two body paragraphs, two inline base64 photos, and a 7-item "Common Requests" list. |
| 9 | `section-toIz3g1_9P` | Mid-page CTA: "Looking for a Tree Removal Company Near You?", a scroll-to-form button, the "Ready To Get / That Tree Handled?" headline, and a call CTA. |
| 10 | `section-cpwew5Yzi0` | "How Our Tree Removal Service Works" — the four-step process. |
| 11 | `section-em7O_SRdYL` | FAQ — 10 question/answer pairs. |
| 12 | `section-zZW8Wc9Z7T` | Final CTA: "Need Tree Removal? / Get a Free Estimate Today" + click-to-call. |
| 13 | `section-yOWoo1RyOV` | Footer: logo, business name, copyright, Privacy Policy and Terms of Service. |

---

## CSS background images — which section each one paints

Five full-bleed photographic backgrounds are painted by CSS, not by `<img>`/`<picture>`. Each is emitted as its own inline `<style>` holding three `@media` blocks, and each paints a `div.bg.fill-width-height.<class>` that is absolutely positioned `100% × 100%` as the first child of the section or row named below. **They are invisible to any extraction that greps for the token `background-image` — GHL writes the `background:` shorthand.** Full URLs, variants and the exact declarations are in `images.json`.

| CSS selector | Paints | Section | Asset | Owning GHL location |
|---|---|---|---|---|
| `.bg-section-evIFlIWTQp` | `div#section-evIFlIWTQp` | **S4** Why Choose Us + Google Reviews | `6a441bc20f3445329fc952f9.png` | `FaHof000UZrAJUKORVCj` (foreign) |
| `.bg-section-Pt0S1QTMn0` | `div#section-Pt0S1QTMn0` | **S6** Services We Offer | `6a43fb56a7501a002a01a8c1.png` | `FaHof000UZrAJUKORVCj` (foreign) |
| `.bg-row-sReEX03pnX` | `div#row-sReEX03pnX` (the city-pill marquee row) | **S7** Areas We Serve | `762d835c-f3df-42c3-8e90-3cfcaab72998.png` | `zfoeYpKrqshgdFr4gG3b` (own) |
| `.bg-row-YIxQrLnVyw` | `div#row-YIxQrLnVyw` ("Ready To Get / That Tree Handled?" + call CTA) | **S9** Mid-page CTA | `a9b45bf7-c181-430b-b74f-620b38ce8314.png` | `zfoeYpKrqshgdFr4gG3b` (own) |
| `.bg-section-zZW8Wc9Z7T` | `div#section-zZW8Wc9Z7T` | **S12** Final CTA | `6a4407bb21b1234da3d660dd.png` | `FaHof000UZrAJUKORVCj` (foreign) |

Every one uses the same three breakpoints: `@media (max-width: 480px)` → the `r_768` variant, `@media (min-width: 481px) and (max-width: 1024px)` → `r_900`, `@media (min-width: 1025px)` → `r_1200`; declarations are `background: url(…); opacity: 1`. Sections 1, 2, 3, 5, 8, 10, 11 and 13 have **no** background image. Each of the five classes above appears exactly 4× in the served HTML — 3× in its own `@media` blocks and once as the painted `div` — so there is exactly one painted element per background. The only other section-level paint is a flat colour, not an image: `#section-9JRQtJShoU::after { content:""; position:absolute; inset:0; background: rgba(1, 76, 48, 0.7); pointer-events:none; z-index:1 }`, and it is live **only** inside `@media (max-width: 480px)` — the S1 darkening overlay is mobile-only.

Two further decorative assets are also CSS backgrounds on pseudo-elements and are recorded in `images.json`, not here: the CTA arrow glyph (`.btn-arrow`/`.mob-btn-arrow` `.main-heading-group::after` and `.left_arrow::before`, 10 buttons across S1/S3/S4/S5/S6/S9/S12) and the FAQ accordion indicator (`.hl-faq .hl-faq-child-heading::before`, all 10 S11 rows).

---

## Responsive duplication

GoHighLevel renders a desktop copy and a mobile copy of several blocks into the **same** DOM and hides one with CSS. The rules are:

```
@media only screen and (max-width:767px) { .desktop-only { display:none } }
@media only screen and (min-width:768px) { .mobile-only  { display:none } }
```

`copy.md` records each duplicated block **once**, except where the two copies differ in href or element type, in which case both are recorded because they are not interchangeable.

### Blocks that are rendered twice

| Block | Desktop copy | Mobile copy | Do the two copies differ? |
|---|---|---|---|
| **Header phone CTA** (S1) | `row-QUXhAWTlOS` — "(682) 365-7478" / "Tap To Call " → `tel:+16823657478` | `row-XOS6-tOzGd` — "682-452-0735" / "Tap to call" → `tel:+14694021196` | **YES — different number, different href.** Both recorded. |
| **Form heading + subline** (S1) | `sub-heading-TVyXLNMxiV` + `paragraph-BOeRKrin1Q` | `col-vk8rBPkJ5b` (heading + `paragraph-hPbI9yy1Ja`) | No — identical strings. |
| **Benefit-strip call CTA** (S3) | `col-TZ4hzPn0si` — "Call (682) 365-7478" → `tel:+16823657478` | `col-Vq25j9zPj1` — "682-452-0735" → `tel:682-452-0735` | **YES — different number and a differently-formatted href.** Both recorded. |
| **Four process steps** (S10) | `row-O7NtuDOYvR` | `row-6Yl0-6dyH5` | Same strings, **different order** — see below. |
| **Footer legal links** (S13) | `row-xdA6wLUcIY` — real `<a href>` to links.treeleads.io | `row-z2ymiYHJ_G` — `<button>` with `openPopup` | **YES — different element type; the mobile one has no href.** Both recorded. |

### The S10 ordering difference

The four process steps appear in a different sequence in each copy. This is a real difference in the source, not an extraction artifact.

- **Desktop copy** (`row-O7NtuDOYvR`): Step 1 → Step 2 → Step 3 → Step 4, then the process image.
- **Mobile copy** (`row-6Yl0-6dyH5`): Step 1 → Step 3 → *process image* → Step 2 → Step 4.

The mobile copy interleaves the image between steps 3 and 2, so a mobile visitor reads the steps as 1, 3, 2, 4. The step text is byte-identical between copies; only the order and image placement change.

### Duplication that is NOT responsive

Two blocks repeat in the DOM for reasons other than desktop/mobile. Do not mistake them for responsive twins.

- **S7 "Areas We Serve" marquee.** Three `ttt-track` elements, each containing **two identical `ttt-group` children** — the standard duplicate-the-track trick for a seamless infinite scroll. So each city name appears twice in the DOM but is one logical pill. The 25 unique pills, in source order, are recorded once in `copy.md`. Track 2 carries the extra class `reverse` and scrolls the opposite way. Each pill is `<div class="ttt-pill"><span class="ttt-pin"><svg …/></span><span>City</span></div>` — the `ttt-pin` holds an **inline map-pin SVG**, byte-identical in all 50 copies, sized 15×15 by `.ttt-pin svg`. It is one logical icon and is recorded in `images.json` as `city-pill-map-pin`; it accounts for 50 of the 51 inline `<svg>` elements in the served body (the 51st is the envelope glyph in the email field).
- **S4 review-card icons.** The "5 stars" and "Google" SVGs each appear three times, once per review card — one logical asset, three placements.

### Elements present in the DOM but never visible at any width

- `paragraph-BOeRKrin1Q` and `paragraph-hPbI9yy1Ja` — both copies of the form subline "Enter your info and we’ll call you with the next steps for your tree removal quote" carry **both** `desktop-only` and `mobile-only`, so one media rule or the other always hides them.
- The "Call (469) 402-1196" button (`button-3zhCn5xTPd`) — a `desktop-only` element inside a `desktop-only` column inside the `mobile-only` header row.

---

## PHONE TREATMENT

This is the section that matters for CallRail DNI. **There is no CallRail script on the page** (`tracking.json` → `absent`). Every number below is hard-coded in the served markup, so nothing is currently swappable and there is no `swap.js` to inherit behaviour from.

### Distinct phone numbers appearing on the page

Three distinct numbers appear, and they do not line up cleanly.

| Number | Appears as visible text | Appears as an href |
|---|---|---|
| **(682) 365-7478** | 6 times | 7 times, always `tel:+16823657478` |
| **682-452-0735** | 2 times | 1 time, as `tel:682-452-0735` |
| **(469) 402-1196** | 1 time (in a button) | never as visible link text — but `tel:+14694021196` **is** the href behind the *other* number |

**Why 6 text vs 7 hrefs for (682) 365-7478.** The visible-text count is 6, not 7: placement 10 (`button-gyo6-qwTP1`, S12 final CTA) carries `href="tel:+16823657478"` but its visible text is `Get my free estimate` / `Click to call` and contains no digits at all. **A DNI rule that works by replacing the number as text will silently miss that button** — it must be targeted by href. Placements 1, 4, 6, 7, 8 and 9 in the table below are the six that show the number as text.

Counts recomputed from `raw/removal.html` (scripts, styles, comments and the `__NUXT_DATA__` payload stripped, entities unescaped, then a phone-shaped regex over the remaining text): `(682) 365-7478` ×6, `682-452-0735` ×2, `(469) 402-1196` ×1. Hrefs counted separately from the markup: `tel:+16823657478` ×7, `tel:+14694021196` ×1, `tel:682-452-0735` ×1. The raw string `(682) 365-7478` matches 12× in the markup because each of the 6 anchors repeats the number inside its `aria-label` — do not use that number as a text count.

### Every phone placement, in document order

| # | Where | Section / element | Visible main text | Visible sub text | href |
|---|---|---|---|---|---|
| 1 | Header, desktop | S1 `row-QUXhAWTlOS` → `button-qwl5Ux0JZe` | `(682) 365-7478` | `Tap To Call ` (trailing space) | `tel:+16823657478` |
| 2 | Header, mobile | S1 `row-XOS6-tOzGd` → `button-ilOPxA15xd` | `682-452-0735` | `Tap to call` | **`tel:+14694021196`** |
| 3 | Header, mobile row (hidden) | S1 `button-3zhCn5xTPd` | `Call (469) 402-1196` | — | **none** — `<button>`, GHL action `openPopup` → empty popup |
| 4 | Benefit strip, desktop | S3 `col-TZ4hzPn0si` → `button-w6i_nJR0lW` | `Call (682) 365-7478` | `Call Now`+U+00A0+`For A Free Estimate Today` | `tel:+16823657478` |
| 5 | Benefit strip, mobile | S3 `col-Vq25j9zPj1` → `button-Tk8AUj2tvs` | `682-452-0735` | `Call Now`+U+00A0+`For A Free Estimate Today` | **`tel:682-452-0735`** |
| 6 | Reviews CTA | S4 `button--kIKpIzaUL` | `(682) 365-7478` | `Call Now`+U+00A0+`For A Free Estimate Today` | `tel:+16823657478` |
| 7 | Restoration CTA | S5 `button-GecFCrteC2` | `(682) 365-7478` | `Call Now`+U+00A0+`For A Free Estimate Today` | `tel:+16823657478` |
| 8 | Services CTA | S6 `button-_LS21RqVvN` | `(682) 365-7478` | `Call Now`+U+00A0+`For A Free Estimate Today` | `tel:+16823657478` |
| 9 | Mid-page CTA | S9 `button-kwfdGgdu0L` | `(682) 365-7478` | `Call Now`+U+00A0+`For A Free Estimate Today` | `tel:+16823657478` |
| 10 | Final CTA | S12 `button-gyo6-qwTP1` | `Get my free estimate` | `Click to call` | `tel:+16823657478` |

There is **no** phone number in the footer (S13) and **no** sticky/floating call bar.

### Number-formatting inconsistencies — read before wiring DNI

1. **Displayed number ≠ dialled number (placement 2).** The mobile header button shows `682-452-0735` but its href is `tel:+14694021196`. A mobile visitor reads one number and dials a completely different one. The GHL element config confirms this is in the source, not a render artifact: `{ text: "682-452-0735", subText: "Tap to call", action: "click-to-call", phoneNumber: "tel:+14694021196" }`. The `aria-label` is `682-452-0735 Tap to call`, so screen readers announce the *displayed* number too.
2. **Bare, non-E.164 href (placement 5).** The mobile benefit-strip CTA uses `href="tel:682-452-0735"` — no `+1`, no country code, hyphen-separated. Every other tel href on the page is E.164 (`tel:+1…`). Stored config is `phoneNumber: "682-452-0735"`, i.e. the `tel:` prefix is being synthesised at render time rather than stored. A DNI script that matches on `tel:+1…` or normalises E.164 only will miss this one.
3. **Three display formats for numbers.** `(682) 365-7478` parenthesised, `682-452-0735` hyphenated, `Call (469) 402-1196` prefixed with the word "Call". A text-replacement DNI rule keyed on a single format will only catch a subset.
4. **`(469) 402-1196` is display-only.** It never appears as an href, and the button it lives in has no call action at all — it opens `hl_main_popup-eJnCVAV3I5`, whose element tree is empty. It is also hidden at every viewport width. Nobody can dial it from this page.
5. **`+14694021196` is href-only.** The reverse of #4 — the number is dialled (placement 2) but never displayed anywhere on the page.
6. **The mobile experience uses a different tracked number from desktop.** Placements 2 and 5 (both mobile-only) point at `+14694021196` and `682-452-0735` respectively, while every desktop placement points at `+16823657478`. Mobile and desktop are effectively on different lines, and the two mobile placements are not even on the same line as each other.
7. **Non-breaking space in the CTA subtitle.** Six of the ten placements share the subtitle `Call Now`+U+00A0+`For A Free Estimate Today`. Preserve the U+00A0.

### Non-phone outbound links

| Where | Text | href | Behaviour |
|---|---|---|---|
| S13 footer, desktop | `Privacy Policy` | `https://links.treeleads.io/preview/mKHiwloWMigr9M9z00tv` | new tab |
| S13 footer, desktop | `Terms of Service` | `https://links.treeleads.io/preview/Q3OqcRO0SoaE5nnwNGcK` | new tab |
| S13 footer, mobile | `Privacy Policy` | none | `<button>` → empty popup (dead) |
| S13 footer, mobile | `Terms of Service` | none | `<button>` → empty popup (dead) |
| S9 mid-page | `Get Request my tree removal free estimate` | none | `<button>` → `scroll-to-element` targeting `form-5gd7-YxgNV` |

The form's own post-submit redirect points off-brand to `https://titantreeservicetx.com/thank-you-page-89169333-2226` — see `form.json`.
