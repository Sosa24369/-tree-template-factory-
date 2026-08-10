# structure.md — texastreetopsllc.com/storm  (Texas Tree Tops)

Captured 2026-08-08. GHL funnel page, Nuxt-rendered.

- Domain: `texastreetopsllc.com`   Page URL path: `/storm`
- Funnel name: "Storm Removal (storm watch) - Google Ads Copy"
- Page name: "Storm Removal- Landing Page"
- 13 top-level sections, in DOM order.

---

## SECTION ORDER

| # | Element id | What it is |
|---|---|---|
| 1 | `section-9JRQtJShoU` | Header bar (logo + click-to-call) + hero headline/sub/paragraph + the lead form + two hero photos. Header has a full desktop row and a full mobile row. |
| 2 | `section-6TzwOQDUZq` | Recent-jobs photo slider — Swiper.js custom-HTML block, 15 Google Business Profile photos, no text. |
| 3 | `section-a8UgWW3zd0` | Four value props (icon + bold label + line of detail) followed by a click-to-call CTA in desktop and mobile variants. |
| 4 | `section-evIFlIWTQp` | "Why West Dallas Homeowners / Choose Texas Tree Tops" heading + service-area paragraph + Google-reviews Swiper (3 cards) + call CTA. |
| 5 | `section-i0C6s9XHTY` | "Restoration Results Guaranteed" heading + paragraph + 5-image photo grid + call CTA. |
| 6 | `section-Pt0S1QTMn0` | "Tree Removal Services We Offer" — three service cards, each an image over a bullet list (7 / 7 / 6 items) + call CTA. |
| 7 | `section-o8EAaPwuM8` | "Areas We Serve" — heading, sub-heading, and a 3-row scrolling pill marquee of city names. |
| 8 | `section-cbglAhOxWH` | Long-form SEO feature blocks in one custom-HTML element: copy + truck photo, then uprooted-tree photo + green checklist. Both photos are inline base64. |
| 9 | `section-toIz3g1_9P` | "Need Storm Damage Handled Fast?" CTA band — scroll-to-form button, then "Ready To Get That Tree Off Your Property?" + call CTA. |
| 10 | `section-cpwew5Yzi0` | "How Our Tree / Storm Response Works" — four numbered steps, rendered as two DIFFERENT responsive sets (see below). |
| 11 | `section-em7O_SRdYL` | "Storm Damage Questions, Answered" — GHL FAQ accordion, 10 Q&A pairs, all collapsed at load. |
| 12 | `section-zZW8Wc9Z7T` | Final CTA — "Storm Damage In Fort Worth? / Get A Free Estimate Now" + paragraph + click-to-call. |
| 13 | `section-yOWoo1RyOV` | Footer — logo, legal name, copyright line, Privacy Policy + Terms of Service in desktop and mobile variants. |

---

## RESPONSIVE / DUPLICATION NOTES

GHL renders desktop and mobile copies of several blocks into the same HTML and hides one
with CSS. The two rules are defined once each in the page stylesheet:

- `@media only screen and (max-width:767px) { .desktop-only { display:none } }`
- `@media only screen and (min-width:768px) { .mobile-only  { display:none } }`

Blocks that ship twice:

1. **Header bar (Section 1).** `row-QUXhAWTlOS` (`desktop-only`) and `row-XOS6-tOzGd`
   (`mobile-only`) are two independent header rows. They do NOT contain the same assets or
   the same phone number — desktop shows an SVG logo + a badge image + `(682) 365-7478`;
   mobile shows the PNG logo + a button labelled `682-452-0735` that dials `+14694021196`.
2. **Form heading (Section 1).** Desktop uses `sub-heading-TVyXLNMxiV` "Get a Free Storm
   Damage Estimate" plus `sub-heading-sqIBTrDyGt` "30 seconds. We call you back fast.";
   mobile uses `col-vk8rBPkJ5b` → `sub-heading-7aLzvfhBAh` "Get Your Free Tree Removal
   Estimate". Different copy, not a mirror.
3. **Section 3 call CTA.** `button-w6i_nJR0lW` (`desktop-only`) vs `button-Tk8AUj2tvs`
   (`mobile-only`) — same sub-line, different main label and different href.
4. **Section 10 process steps.** `row-6Yl0-6dyH5` (`mobile-only`) and `row-O7NtuDOYvR`
   (`desktop-only`) hold FOUR STEPS EACH BUT WITH DIFFERENT COPY. Mobile is generic
   tree-removal copy ("Request Your Free Estimate / We Inspect The Job / Safe Tree Removal /
   Final Walkthrough"); desktop is storm-specific ("Call Or Request An Estimate / We Clear It
   Same-Day When Possible / Same Day Response & Assess The Damage / Final Walkthrough").
   **ORDERING DIFFERENCE:** the desktop set is authored in DOM order Step 1, Step 3, Step 2,
   Step 4 — the "Step 2" block physically follows the "Step 3" block in the HTML (grid CSS
   places them visually). The mobile set is in plain 1-2-3-4 order.
   The same process image (`7f278126-…png`) is placed twice, once per set
   (`image-uAaKobxnI8` mobile / `image-VSnTZtdVWa` desktop).
5. **Footer legal links (Section 13).** `row-xdA6wLUcIY` (`desktop-only`) holds real
   `<a href>` links to links.treeleads.io; `row-z2ymiYHJ_G` (`mobile-only`) holds `<button>`
   elements with an `openPopup` action pointing at an EMPTY popup.
6. **Areas-We-Serve marquee (Section 7).** Not a responsive duplicate — a marquee duplicate.
   Each of the three rows renders its pill group twice: `<div class="ttt-group" data-set>`
   followed by an identical `<div class="ttt-group" aria-hidden="true">` clone, so the
   infinite scroll has no seam. That is why the clean-text dump shows every city twice, in
   the pattern 9 + 9, 8 + 8, 8 + 8. Recorded once in copy.md.
7. **Google reviews / photo sliders.** Swiper may clone slides at runtime; the server HTML
   contains exactly 3 review slides and 15 photo slides, no clones.

### Elements that are in the DOM but NEVER VISIBLE at any breakpoint
- `button-3zhCn5xTPd` — text "Call (469) 402-1196". Its column `col-6PAsUZZzSt` is
  `desktop-only` but it is nested inside `row-XOS6-tOzGd` which is `mobile-only`, so it is
  display:none above 768px (row) and below 768px (column).
- `paragraph-BOeRKrin1Q` and `paragraph-hPbI9yy1Ja` — both carry `desktop-only` AND
  `mobile-only` on the same element. Copy: "Enter your info and we’ll call you with the next
  steps for your tree removal quote". Hidden everywhere.

---

## PHONE TREATMENT

Three distinct numbers appear on this page. This matters for CallRail DNI because the
number a visitor SEES and the number the link DIALS do not always agree, and one href is
not in E.164.

### Number A — (682) 365-7478  →  `tel:+16823657478`
Seven anchors, all E.164, all consistent between label and href.

| # | Where | Element | Main anchor text | Sub anchor text | href |
|---|---|---|---|---|---|
| 1 | Header, desktop row (`row-QUXhAWTlOS`, desktop-only) | `button-qwl5Ux0JZe_btn` | `(682) 365-7478` | `Tap To Call ` (trailing space) | `tel:+16823657478` |
| 2 | Section 3 value-prop CTA, desktop (`desktop-only`) | `button-w6i_nJR0lW_btn` | `Call (682) 365-7478` | `Call Now For A Free Estimate Today` (NBSP) | `tel:+16823657478` |
| 3 | Section 4, under the reviews slider | `button--kIKpIzaUL_btn` | `(682) 365-7478` | `Call Now For A Free Estimate Today` (NBSP) | `tel:+16823657478` |
| 4 | Section 5, under "Restoration Results Guaranteed" | `button-GecFCrteC2_btn` | `(682) 365-7478` | `Call Now For A Free Estimate Today` (NBSP) | `tel:+16823657478` |
| 5 | Section 6, under the service cards | `button-_LS21RqVvN_btn` | `(682) 365-7478` | `Call Now For A Free Estimate Today` (NBSP) | `tel:+16823657478` |
| 6 | Section 9 mid-page CTA band | `button-kwfdGgdu0L_btn` | `(682) 365-7478` | `Call Now For A Free Estimate` (NORMAL space, no "Today") | `tel:+16823657478` |
| 7 | Section 12 final CTA (above footer) | `button-gyo6-qwTP1_btn` | `Get my free estimate` | `Click to call` | `tel:+16823657478` |

### Number B — 682-452-0735 / (682) 452-0735
This is the number the CONTENT treats as the main line, but it is only ever dialled once,
and that href is malformed.

| Where | Element | Anchor / text | href |
|---|---|---|---|
| Section 3 value-prop CTA, mobile (`mobile-only`) | `button-Tk8AUj2tvs_btn` | main `682-452-0735`, sub `Call Now For A Free Estimate Today` | **`tel:682-452-0735`** — BARE, NOT E.164, no `+1` |
| Header, mobile row — LABEL ONLY | `button-ilOPxA15xd_btn` | main `682-452-0735`, sub `Tap to call` | **`tel:+14694021196`** — dials Number C, NOT this number |
| Section 10 desktop Step 1 body copy | `paragraph-u5sFb_-zF9` | "Call (682) 452-0735 and tell us what happened …" | plain text, not a link |
| Section 11 FAQ answer 1 | `faq-f5SqrykS2z` | "… Most storm calls get a same-day assessment. Call (682) 452-0735." | plain text, not a link |
| Section 11 FAQ answer 10 | `faq-f5SqrykS2z` | "Fastest way is to call (682) 452-0735. Or send the form …" | plain text, not a link |
| `<meta name="description">` / `og:description` | head | "… free estimates. Call (682) 452-0735." | plain text |
| JSON-LD `telephone` (primary) | schema markup | `"telephone": "(682) 452-0735"` | structured data |

### Number C — (469) 402-1196  →  `tel:+14694021196`
| Where | Element | Anchor / text | href |
|---|---|---|---|
| Header, mobile row (`row-XOS6-tOzGd`, mobile-only) | `button-ilOPxA15xd_btn` | shows `682-452-0735` / `Tap to call` | `tel:+14694021196` |
| Header, orphaned never-visible button | `button-3zhCn5xTPd_btn` | `Call (469) 402-1196` | no href — action `openPopup` to an empty popup |
| JSON-LD second `contactPoint` | schema markup | `"telephone": "(469) 402-1196"` | structured data |

### Formatting inconsistencies to carry into DNI planning
1. **Label/href mismatch (worst offender).** The mobile header button *displays*
   `682-452-0735` but its href is `tel:+14694021196`. A DNI swap keyed on displayed text
   will not match the href, and vice versa.
2. **Non-E.164 href.** `button-Tk8AUj2tvs_btn` uses `tel:682-452-0735` with no `+1`. Every
   other tel href on the page is E.164. Any regex or CallRail selector built around
   `tel:+1…` silently skips this one — and it is the ONLY mobile-visible CTA in Section 3.
3. **Number B renders in TWO formats — across three distinct numbers.** Numbers A and C use
   one format each; Number B uses two. Text-based number replacement must handle both
   punctuations. Verified with
   `grep -oE '\(?[0-9]{3}\)?[ .-]?[0-9]{3}[ .-][0-9]{4}' raw/storm.html | sort | uniq -c`:

   | Rendering | Count | Where |
   |---|---|---|
   | `(682) 365-7478` — Number A, parenthesised, ONLY format | 14 | the 7 anchors, each contributing its main text + its `aria-label` |
   | `(682) 452-0735` — Number B, parenthesised | 12 | meta description, `og:description`, JSON-LD `telephone`, JSON-LD `contactPoint`, `paragraph-u5sFb_-zF9`, FAQ 1, FAQ 10 — each x2 (rendered DOM + Nuxt payload) |
   | `682-452-0735` — Number B, hyphenated | 6 | `button-ilOPxA15xd` (`aria-label` + `main-heading-button`) and `button-Tk8AUj2tvs` (`href` + `aria-label` + `main-heading-button`), + 1 payload string |
   | `(469) 402-1196` — Number C, parenthesised, ONLY format | 5 | |

   So: **body copy, meta and schema say `(682) 452-0735`; both buttons say `682-452-0735`.**
   The same number, punctuated two ways, is the real hazard here — not the count of numbers.
4. **Number A is the click-to-call number everywhere on desktop; Number B is the number the
   body copy, FAQ, meta description and schema tell people to call.** They are different
   numbers. Whichever CallRail pool is installed has to decide which of the two it owns.
5. **NBSP in five CTA sub-lines.** `Call Now For A Free Estimate Today` uses U+00A0
   between "Now" and "For". String matching on `"Call Now For A Free Estimate Today"` with a
   normal space will fail on five of six CTAs.
6. **No sticky/floating call bar exists on this page.** No element uses `position:fixed` or
   `position:sticky` for a call CTA; the only fixed-position rules belong to GHL overlays,
   modals and the FAQ popup.

---

## FORM PLACEMENT

Exactly one form on the page: `form-5gd7-YxgNV` in Section 1, right column of the hero.
It is a GHL native form slot (form "Storm Watch Form", id `vj6sZGG1Fi4M9PAsIZRx`), not an
iframe and not a `<form>` element — GHL renders `#_builder-form` as a `<div>`. See form.json.
The Section 9 button "Get My Free Storm Estimate" scroll-jumps back up to this same form.

---

## EXTRACTION-NOTES  (ambiguities, source defects, do-not-fix list)

1. `&middot;` vs `·` — Section 8's badge is authored as `Top Rated &middot; 5-Star Service`
   inside a Custom HTML element. A browser renders "Top Rated · 5-Star Service". The
   provided `storm.text.txt` shows the raw entity because that extractor only decodes
   `&amp;`-class entities. copy.md records the RENDERED text and flags the source encoding.
   If the rebuild emits HTML, emit `&middot;` to stay byte-identical to source.
2. `&amp;` appears in source for every literal ampersand inside GHL rich text
   ("Licensed &amp; Insured", "Safely, Cleanly &amp; Carefully", "Same Day Response &amp;
   Assess The Damage ", "the removal &amp; work"). Rendered as `&`.
3. Trailing / leading whitespace that IS part of the copy and must survive:
   - `Tap To Call ` (desktop header sub-line)
   - `Safe removal near homes ` (Section 6 card 1, last-but-one bullet)
   - `Leaning or blown-over fence ` (Section 6 card 3)
   - ` Wood and metal fence repair` (Section 6 card 3 — LEADING space)
   - `Same Day Response & Assess The Damage ` (Section 10 desktop Step 2 h2)
   - `Storm Damage Questions, Answered ` (Section 11 h1)
   - `Storm Damage In Fort Worth? ` (Section 12 first h1)
   - aria-labels `Privacy Policy `, `Terms of Service `, `Call (469) 402-1196 `,
     `(682) 365-7478 Tap To Call `
4. Empty elements that render as visible blank lines (global CSS gives `h1..h6:empty` and
   `p:empty` the pseudo-content `"\a0"`): an empty `<h2></h2>` after "30 seconds. We call you
   back fast."; an empty `<p></p>` after the "Fast, Same-Day Response …" line; an empty
   `<p></p>` after the "Licensed & Insured …" line. Preserve them — deleting them changes
   vertical rhythm.
5. Wrong-city copy is INTENTIONALLY PRESERVED. This is a Fort Worth storm page, yet it says
   "Why West Dallas Homeowners", "Top Rated West Dallas Local Tree Trimming Company",
   "for East Dallas homeowners" (Section 6 intro), and the Section 4 service-area paragraph
   lists mostly Dallas-side suburbs ending "and Surrounding West Dallas".
6. Other source defects preserved verbatim: "so there are no wild surprise" (missing "s",
   no full stop); "complete removals safe and efficiently" (should be "safely"); "Licensed &
   Insured Insured up to $2 million" ("Insured" twice); "Colleyville" and "Coppell" each
   listed twice in the Section 4 paragraph; "Grapevine Keller Trophy Club Westlake Mansfield
   Fort Worth Hurst" run together without commas; footer "©Copyright" with no space.
7. **Form redirect points at a different company.** The GHL form action is
   `actionType: "1"` with
   `redirectUrl: "https://titantreeservicetx.com/thank-you-page-89169333-2226"` —
   titantreeservicetx.com is not Texas Tree Tops. Recorded, not corrected. The funnel's own
   next step is `/thank-you-page-89169333-2226-1418` (page id `PzQcXJTqS6kEXm01czpN`), so it
   is ambiguous which of the two actually fires. Flagged rather than guessed.
8. **JSON-LD schema markup is stale / borrowed from the removal page.** It advertises a
   "$300 Off … All Summer! Save $300 though August-31st" offer that appears nowhere in the
   visible copy, an `addressLocality` of "West Dallas", an `areaServed` list containing East
   Dallas / Mesquite / Garland / Rowlett / Rockwall / Sunnyvale / Heath / Fate / Forney /
   "Lake Ray Hubbard area", and a 10-question FAQPage whose questions and answers are
   COMPLETELY DIFFERENT from the 10 visible FAQ items. The word "though" (for "through") is
   in the offer text. None of this is visible copy; it is recorded here so a rebuild does not
   silently inherit or silently drop it.
9. The mobile Privacy Policy / Terms of Service buttons open `hl_main_popup-eJnCVAV3I5`,
   whose `popup` array in the page payload is EMPTY. On mobile those links are dead. Not fixed.
10. GHL owner/branding leakage in the form config: `company.domain = "login.treeleads.io"`,
    `company.name = "Scale And Automate"`, plus an agency logo URL on
    msgsndr-private.storage.googleapis.com. Not rendered on the page.
11. The clean-text extractor normalised U+00A0 to a plain space and split inline
    `<strong>` / `<span>` runs into separate lines. copy.md reconstructs the true per-element
    strings from the raw HTML, so copy.md — not storm.text.txt — is the byte-accurate record.
12. No CallRail script, no GA4 tag, no Google Ads tag and no Facebook pixel are present on
    this page today. Only a GTM container — and of that container, only the body `<noscript>`
    iframe is server-rendered; the head `<script>` bootstrap is carried in `__NUXT_DATA__` and
    injected at hydration (`'googletagmanager' in html[:html.find('</head>')]` → `False`).
    Whatever fires downstream fires from inside GTM. See tracking.json.
13. **Five sections/rows carry CSS background-image layers** that are invisible in the clean-text
    dump and were absent from the first extraction pass. Each is painted by a
    `<div class="bg fill-width-height bg-…">` first child, with three responsive `url()` rules
    (r_768 / r_900 / r_1200). Owners: `section-evIFlIWTQp` (S4), `section-Pt0S1QTMn0` (S6),
    `row-sReEX03pnX` inside `section-o8EAaPwuM8` (S7), `row-YIxQrLnVyw` inside
    `section-toIz3g1_9P` (S9), and `section-zZW8Wc9Z7T` (S12, a real client photo at
    `opacity: .3`). Two more image layers are delivered purely as CSS backgrounds on
    pseudo-elements — the CTA arrow on all 10 call/CTA buttons and the FAQ heading glyph on all
    10 question rows — and two logical images are authored as inline `<svg>` (the marquee map
    pin x50 in S7, the envelope on the form's Email field x1 in S1). All of these are recorded
    in images.json. A rebuild that reads only the `<img>` elements will render flat, textureless
    sections and arrowless buttons.
