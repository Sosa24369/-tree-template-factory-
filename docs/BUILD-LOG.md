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
| 5 | Client content dashboard | **DONE** — `820ce11` (+ `4c5cd52`) |

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

## Task 5 — client content dashboard (DONE)

A local, schema-driven FORM editor over the client JSON records — not a page builder.
Runs only under `vite dev`; the public build is untouched.

**Run it:** `cd app && npm run dev`, then open `/dashboard.html`.

### Architecture (matches the stack — no second framework, no database)

- **Backend = a dev-only Vite plugin** (`app/dashboard-server.mjs`, `apply: 'serve'`).
  It is registered only in `configureServer`, so it exists during `vite dev` and
  CANNOT be present in a build — the dashboard is local-only by construction (also
  satisfies the standing "dashboard is never deployed" rule). Endpoints: list clients,
  read a client, list a client's assets, diff (no write), upload (sharp pipeline),
  save (write + git commit), new-client.
- **Every write is confined** to `/clients/<slug>.json` or `app/public/assets/<slug>/`,
  with `slug` validated against `/^[a-z0-9-]+$/`. One client can NEVER write into
  another's folder — cross-client leakage (R4) is made structural, not just
  discouraged.
- **Frontend** is a separate dev entry (`app/dashboard.html` → `src/dashboard/`),
  React (the existing stack), never added to the build inputs.

### The field schema (`src/dashboard/schema.ts`)

The form is DERIVED from a schema, not hardcoded. Each entry is
`{ path, label, group, type, help, validation, required }`, where `path` is a dot-path
into the record and `group` is a page section. Groups, in order: **identity · contact ·
areas · offer(copy) · reviews · media(photos) · footer(consent/legal) · tracking**.
The form renders by walking the schema and grouping. A field present in a client JSON
with **no schema entry** is collected by a leaf-walker (`lib.ts#unlabelledLeaves`) and
rendered in a clearly-marked **"Unlabelled fields"** group rather than disappearing —
so a new template key is editable the moment it appears, and the dashboard does not rot.
Complex fields delegate to dedicated editors: **reviews** (author/meta/body, add/remove),
**photos** (per service, below), and **copy overrides** (per-template key→value, add/remove).

### How image optimisation is wired in

Every upload POSTs to `/api/dash/upload`, which runs the **same sharp pipeline as the
build**: WebP q80, width capped at 1600 (the `optimize-assets` settings), then 400/800/
1200w variants at q78 (the `generate-srcset` settings), never upscaling. It returns a
ready `PhotoSet` with a real `srcset`. So an unoptimised drop physically cannot reach a
template and blow the mobile budget the P2 work bought. A **focal-point + aspect** control
crops on upload (sharp `extract` centred on the clicked point), baking the fix into the
file — so a bad crop is corrected with **no template change** (templates are frozen).
"Pick from existing" and upload both read/write ONLY the selected client's folder.

### Validation before save

phone must be E.164; thank-you must be present and is rejected if it is
`titantreeservicetx.com` or off-domain without the explicit toggle; consent copy
required; required fields non-blank. Privacy/Terms blank **warns but does not block**,
with the `legalUrlsPending` reason stated. The same checks run client-side (live) and
server-side (belt) — verified: saving an empty duplicate returned HTTP 422.

### Save

Shows a real `git diff --no-index` of proposed-vs-current BEFORE writing. On confirm it
writes the record, `git add`s the record + any new images, and commits with the entered
message and the Co-Authored-By trailer. New-client duplicates a record but **never
deep-copies photos** — it blanks name/logo/photos/reviews, creates a fresh asset folder
with a `.gitkeep`, and returns the empty photo slots to flag. Saving writes and commits;
it does not deploy.

### What was verified

In Chrome: client picker, grouped schema form (labels, help, section hints), live
preview of the REAL template updating as you type (accent colour recoloured the hero,
CTAs and sticky bar live), dirty tracking, the legalUrlsPending warning, and the
diff-before-write modal showing the exact unified diff. Via the API: new-client (no
photos copied, slots flagged), upload (a 4:3 focal-crop produced base + 400w variant with
a correct srcset), validation rejection (HTTP 422), and a real save→commit (correct
message + Co-Authored-By). All test artifacts were removed and the test commit reset;
the tree is clean.

### What's unfinished / notes

- **"Pick from existing"** attaches an existing file by `src` only; it does not
  reconstruct a `srcset` for an already-optimised asset (the picker shows a "no srcset"
  badge in that case). Uploads — the recommended path — always get the full srcset.
  A follow-up could look up existing `-400w/-800w` variant files and rebuild the srcset
  when picking.
- **Focal re-crop of an already-attached photo** is done by uploading a fresh file; there
  is no in-place re-crop of an existing optimised asset (that would re-crop an already-
  compressed WebP). Acceptable, noted.
- **copyOverrides** editor edits/removes/adds raw `template → key → value` entries. It
  does not enumerate a template's available copy keys (that list lives in each template's
  `copy.defaults.ts`); the editor trusts the key you type. A future nicety is a key
  autocomplete sourced from the defaults.

---

# START HERE TOMORROW

1. **Run a real applied-throttling Lighthouse pass** on `/p/texas-tree-tops/storm-a/`
   and `/storm-b/` (and re-confirm the five original templates) once a Chrome/Lighthouse
   toolchain is available. Target ≥95 / ≤2.0s / CLS 0. Confidence is high from structural
   parity with the measured removal-b + the DOM/byte evidence, but tonight had no Chrome
   CLI so the number was not machine-measured. This is the one open gate.
2. **Supply j-valdez storm photography.** Its storm pages currently render art-free
   (no storm or removal photos on the record) — correct, but a hero panel + gallery need
   its own storm images. Drop them in `app/public/assets/j-valdez/`, add them via the
   dashboard (auto-optimised), and the storm pages fill in with no code change.
3. **Curate the TTT storm gallery** if desired — the storm set mixes true storm-damage
   shots with general crew/truck photos (some with the baked-in `(682) 365-7478` number).
   Use the dashboard to remove the off-message ones; all remaining are TTT's own work.
4. **Decide the storm A/B palette question:** storm-b's earth-tone palette is a secondary
   difference alongside the hero-message variable. If you want a pure single-variable
   test, hold the palette equal to storm-a; if palette is itself worth testing, keep it
   and treat the pair as a two-factor test. Documented in the storm-b commit + above.
5. **Still blocked on the same P4 items** (unchanged, not tonight's scope): confirm the
   two destination phone numbers before any deploy that routes calls; create the TTT
   `ad_click_id` GHL custom field; supply per-client Privacy/Terms URLs (the dashboard
   warns on these). None block the templates themselves.

---

# P4 SESSION — close verification gaps, prep deploy

Run of 2026-08-11 (follow-up). Started clean at `bfa6a45`, local == origin. Tasks in
order; no template or dashboard rebuild/refactor — this closes gaps and preps deploy.

## Task 1 — storm performance, MEASURED under applied throttling (gate CLOSED)

Lighthouse 13.4.1 installed and run against the built `dist` served locally, driving
the installed Google Chrome. **Applied** throttling, not simulated:
`--throttling-method=devtools` (CDP), mobile form factor, standard mobile profile
(RTT 150 ms, ~1.6 Mbps down, CPU 4× slowdown), `--only-categories=performance`.

| Page | Perf | LCP | CLS |
|------|-----:|----:|----:|
| texas-tree-tops / storm-a | 99 | 1.7 s | 0 |
| texas-tree-tops / storm-b | 99 | 1.7 s | 0 |
| j-valdez / storm-a | 99 | 1.6 s | 0 |
| j-valdez / storm-b | 99 | 1.6 s | 0 |
| blank-co / storm-a | 99 | 1.6 s | 0 |
| blank-co / storm-b | 100 | 1.5 s | 0 |

**All pass the gate (Perf ≥ 95, LCP ≤ 2.0 s, CLS 0).** These are measured, not inferred;
they confirm (and slightly beat) the overnight run's parity estimate. Corroboration: on
mobile the ONLY image request is the small header logo (webp for TTT, svg for j-valdez) —
no hero photograph and no gallery image on the critical path, so the LCP is the H1 text as
designed. Reports saved under `/tmp/lh-*.json`.

## Task 2 — FAQ R5, independently re-verified across ALL SEVEN templates

`blank-co` alone cannot exercise the defect (it falls back to default copy, so every
question is present). Re-verified with a temporary answer-only fixture that blanks
`faq.q1` on all seven templates (agnostic, which ships blank FAQ defaults, also got a
filled `faq.a1`), built, and checked two independent ways:

- the permanent guard `scripts/verify-faq-a11y.mjs`: 57 pages, 186 `<summary>` scanned,
  **0 empty-name summaries**, 7 orphan-answer blocks;
- an inline per-template grep (not the guard): each of removal-a, removal-b, trimming-a,
  trimming-b, **storm-a, storm-b**, agnostic produced exactly **1 orphan block and 0
  empty-name `<summary>`**.

So on every template — including storm-a/storm-b, which were built after the fix — a
blanked question with a surviving answer renders a plain `<div>`/`<p>`, never a
`<summary>`, and produces no focusable element without an accessible name. Fixture removed,
clean rebuild (43 pages) green.
