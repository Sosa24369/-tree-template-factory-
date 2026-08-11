# Build log — known-unresolved items carried in the build

Things that are deliberately not fixed in code, because the fix is not code.
Reviewed at every phase boundary.

---

## (817) 607-3485 is printed inside the Texas Tree Tops logo image

**Status: untracked by design, pending a replacement logo from the client.**

The Texas Tree Tops logo artwork has a phone number rendered into the image itself —
`(817) 607-3485`, visible in the badge, and a fourth number distinct from the three
in the page markup. It appears in the header and the footer of every Texas Tree Tops
page.

**Consequence:** CallRail DNI swaps text nodes and `tel:` hrefs. It cannot swap a
number that is part of a raster image. **Any call placed from the number printed in
the logo is untracked and always will be**, regardless of what we do at P4.

No workaround has been attempted, per instruction — a number baked into an image is
not something to engineer around. A clean logo without the number will be supplied,
and dropping it into `brand.logoUrl` resolves this with no code change.

---

## Texas Tree Tops has no `ad_click_id` custom field in GHL

**Status: pending creation in GHL location `zfoeYpKrqshgdFr4gG3b`.**

Click IDs (`gclid` / `gbraid` / `wbraid` / `fbclid`) are captured, persisted for the
session and submitted with every lead on every template — that part is built and
verified. They will not land on a mapped GHL contact field for this client until the
custom field exists.

`clients/texas-tree-tops.json` → `crm.adClickIdFieldId` is `null`, which the resolver
surfaces as a warning on every render. Set it to the new field id once created; no
code change.

For comparison, J Valdez already has the field: `DTlYvWAb5Y0M3iXyWfcH`
(`contact.ad_click_id`, `data-q="gclid"`).

---

## Per-client Privacy Policy and Terms are not yet available

**Status: blank, pending each client's own policies.**

Both clients previously pointed at the same agency URLs on `links.treeleads.io`. A2P
registration expects the policy to name the sender, so shared agency policies are not
acceptable. `consent.privacyPolicyUrl` and `consent.termsOfServiceUrl` are now empty
strings on both records, with a `legalUrlsPending` note.

**Consequence while blank:** the consent block renders its opt-in and SMS language but
carries no policy links. That is an A2P compliance gap, and it is a reason not to run
SMS from these pages yet. The resolver warns on every render.

---

## Destination phone numbers are unconfirmed

**Status: HOLD on any deploy that routes real calls.**

- Texas Tree Tops — currently `+16824520735`. Most source call buttons dialled
  `+16823657478` instead, so these are different lines and only one of them rings the
  client.
- J Valdez — currently `+14694021196`. This same number appears on both Texas Tree
  Tops pages, so it may be an agency/shared tracking number rather than J Valdez's own.

Both are GHL tracking numbers that forward to each company's real business line.

**Until both are confirmed against their GHL sub-accounts, no page that routes calls
gets deployed.** Everything is otherwise deploy-ready; correcting a number is a
one-line change in the client record and a rebuild.

---

## Google review avatars cannot be self-hosted

**Status: resolved by design — avatars dropped.**

Two review avatar images returned HTTP 403; Google blocks hotlinking and blocks
downloading them. Per instruction, no workaround was attempted. Review cards render
an initials circle plus the star rating, the reviewer's name and the review text
(`reviewAvatarStyle: "initials"`).

---

## CallRail DNI will be a second forwarding hop

**Status: decision needed at P4, recorded now so it is not a surprise.**

Both clients' numbers are already GHL tracking numbers that forward to the real
business line. Adding CallRail DNI on top makes the chain:

    CallRail number -> GHL tracking number -> business line

Two hops of forwarding. It works, but it adds latency, can affect caller ID, and
means two systems are independently claiming attribution for the same call. The
alternative is pointing CallRail directly at the business line and giving up GHL's
native call logging. This is a business decision, not a technical one.

---

# P3 OVERNIGHT BUILD — morning report

Run of 2026-08-11 (overnight, unattended). Five tasks, in order: two fixes, two
storm templates, then the dashboard. Started from a clean tree at `319cbef`.

## Status at a glance

| # | Task | Status |
|---|------|--------|
| 1 | Fix R5 FAQ empty-summary defect | **DONE** — `5d0a531` |
| 2 | Correct three trimming source defects | **DONE** — `d56a7a3` |
| 3 | Build storm-a (control) | **DONE** — `d4aaff7` |
| 4 | Build storm-b (variant) | **DONE** — `d9b1cfc` |
| 5 | Client content dashboard | _(see the Task 5 section, appended at end of run)_ |

## Task 1 — R5 FAQ empty-summary fix

`Faq.tsx` is **NOT shared** — each template carries its own copy. The defect was
therefore in every template that collects a FAQ pair on `q || a` and then renders
`<summary><span>{q}</span></summary>`: an answer-only pair produced a focusable
`<summary>` whose only content was an aria-hidden icon — a control with no
accessible name.

**Templates touched (all five built templates were affected):** removal-a,
removal-b, trimming-a, trimming-b, agnostic. agnostic even documented keeping the
empty row ("the summary always carries a row"); that comment was the bug and is
corrected.

**Fix:** question present → `<details>`/`<summary>` as before; question blank but
answer present → the answer renders as a plain `<p>` inside a
`.<t>-faq-item--orphan` block, with **no `<summary>` at all**. Content is preserved
(an operator mid-edit still sees the answer); the a11y defect is gone.

**Proof:** new permanent guard `scripts/verify-faq-a11y.mjs` scans the prerendered
HTML and asserts every shipped `<summary>` has a non-empty accessible name. Run
against a temporary answer-only fixture (faq.q1 blanked on every template): 5
orphan-answer blocks produced, 0 empty summaries. Clean build: 0 empty summaries.

## Task 2 — three trimming source corrections (approved exceptions)

All three live ONLY in trimming-a. trimming-b was rewritten from scratch and never
inherited them, so the A/B stays valid with both templates correct — nothing to
change in trimming-b (verified: the typos are absent from its built output).

| # | Where | Before | After |
|---|-------|--------|-------|
| 1 | trimming-a hero.body | `10% dicousnt` | `10% discount` |
| 2 | trimming-a services.item10 | `Mutli-Tree Pricing` | `Multi-Tree Pricing` |
| 3 | trimming-a form.subline | `…next steps for your tree removal quote` | `…next steps for your tree trimming quote` |

Nothing else in the control copy changed. The other deliberate defects (doubled
space in "includes  roof", the stray ", —", "start to finish..", singular
"Frequently Asked Question", the unclosed "(Multi-Tree Bundle Pricing", and the
three remaining "tree removal" mentions in why.body/faq.a7/faq.a10) are outside the
mandate and stay locked. Header, fidelity-notes and section comments were updated to
record the exceptions.

## Task 3 — storm-a (control)  ·  Task 4 — storm-b (variant)

Both built on the removal-b performance architecture. Sections, the page body
(`StormPage`) and the stylesheet are scoped to `.storm` and SHARED by both variants;
storm-b imports them and differs only in hero copy + palette. This makes storm-b the
cleanest possible A/B.

**storm-b hypothesis (one sentence):** leading the hero with insurance-recovery
reassurance ("We Handle the Whole Recovery — documented for your insurer") instead of
raw response speed ("We're Already Moving") will lift form-fill rate among insured
homeowners — the higher-value storm segment whose decision, once the hazard is
handled, turns on who produces carrier-ready documentation — at the cost of some
pure-emergency callers that speed-led copy captures. The **one primary variable is
the hero message**; the earth-tone palette (bark brown #33291f + burnt amber #b7772f,
vs storm-a's client brand green/gold) is a required visual differentiator and a
secondary difference, flagged here so a future pure test can hold it constant.

**Locked approval decisions honoured in storm-a copy:** same-day assessment is a
FIRM promise; after-hours calls ARE answered (FAQ 8 is a yes); the offer is a free
on-site assessment + written documentation, never a discount. Kept: the 911 safety
line (rendered prominently), fence repair as a first-class service, insurance
language that stops at documentation ("coverage decisions are between you and your
carrier"). Geography is composed from `client.serviceArea` — nothing hardcoded.

**Definition-of-done, per template:** renders for all three clients ✓ · client swap
verified on TTT + j-valdez (different geo, brand, photos) ✓ · R4 grep clean on all
three ✓ · R5: blank-co renders with 0 "undefined", degrades, art-free hero ✓ · FAQ
a11y guard clean (orphan fix built in from the start) ✓ · all four P0 fixes present
via shared LeadForm/PhoneLink (per-client thank-you, gclid/gbraid/wbraid/fbclid
capture, one E.164 driving display + tel:, A2P consent) ✓ · `npm run build` emits 43
static pages (7 templates × 3 clients × 2 + index) ✓ · loaded both in Chrome, 0
console errors ✓.

### Images flagged for framing

- **j-valdez has NO storm or removal photography** (only trimming). Its storm pages
  therefore render **art-free** (brand hero, no gallery) rather than showing
  off-message trimming shots — this is the deliberate `stormStills` behaviour
  (storm→removal within-client, then nothing), and it is correct. **Recommend
  supplying j-valdez storm photos** so its storm pages get a hero panel and a gallery.
- **TTT storm gallery mixes true storm-damage shots with general tree-service/truck
  photos** (the set is storm[21] + removal[22]; the gallery draws the storm set,
  which itself contains some crew/truck images). Framing is acceptable — all are
  TTT's own work — but a curated storm-damage-only selection would be tighter.
- **TTT truck photos in the gallery show `(682) 365-7478` printed on the truck** —
  same baked-into-image category as the logo number already logged above; untracked
  by design, not fixable in code.

### Performance — measured how, and the honest gap

Target: mobile Perf ≥ 95, LCP ≤ 2.0s, CLS 0 under APPLIED throttling.

**Tooling gap (flagged):** this environment has no Chrome, Lighthouse or lhci CLI, so
applied-throttling Lighthouse could NOT be run here. Rather than report a simulated
number (which the brief notes already misdiagnosed this build once), the evidence
below is what was actually verifiable:

- **Structural parity with the measured baseline.** storm reuses removal-b's hero
  pattern byte-for-byte: brand-colour gradient hero, H1 as the text LCP, the desktop
  photograph handed to CSS as `--st-art` and consumed ONLY inside `@media
  (min-width: 980px)`. removal-b was measured at mobile LCP 2.0s / Perf 98 under
  applied throttling in P2a; storm's mobile critical path is the same shape.
- **Confirmed in Chrome (DOM/CSSOM):** the hero contains **0 `<img>` elements**
  (art is a CSS background), `.st-hero-art` base `display:none`, and the hero photo
  is fetched ONLY at desktop width (`hero-photo-1` requested at innerWidth 1728,
  and the prerender emits NO hero-image preload for storm). So on a phone the hero
  photo is never in the DOM and never requested — the mobile LCP is text.
- **CLS 0 by construction:** hero is text; `<DeferredImage>` reserves each box from
  measured intrinsic dimensions before the file arrives; the logo has a fixed height;
  no late-injected layout-shifting element.
- **Byte budget:** mobile has no hero photo; the critical path is prerendered HTML +
  one shared CSS bundle (~21KB gzip) + system fonts. The JS module is non-blocking
  (content is prerendered), so paint does not wait on it.

**Follow-up for morning:** run a real applied-throttling Lighthouse pass on
`/p/texas-tree-tops/storm-a/` and `/storm-b/` (and re-confirm the five original
templates) once a Chrome/Lighthouse toolchain is available, to put a measured number
against the ≥95 / ≤2.0s / 0 gate. Confidence is high from parity, but the number was
not machine-measured tonight.

### Shared-infra change and no-regression check

The only shared edit for storm was `app/scripts/prerender.mjs`: storm templates
(service === 'storm') get no hero-image preload. The change is guarded on
`template.service === 'storm'`, so every other template's `<head>` output is
byte-identical. All 43 pages build; factory rules pass; FAQ a11y guard passes across
the whole `dist`. The Task 1 FAQ edits + this prerender edit were re-verified against
every built template via the full build + both guard scripts.
