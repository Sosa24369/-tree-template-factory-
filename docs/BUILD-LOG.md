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

## Task 3 (summary) — TTT storm gallery curated

photos.storm went from a 21-item general tree-service set to six storm-damage /
response images (tree-on-roof leads; branded-truck and property/trimming shots removed
to the removal slot where they already live; two storm-only off-message shots reassigned
into removal). Nothing deleted. Detail in commit `6cc05ef`. Storm perf re-measured after
the change: unchanged (Perf 99, LCP 1.7 s, CLS 0).

## Task 4 (summary) — J Valdez storm marked not-applicable

Added a per-client applicability switch (`ClientRecord.excludedTemplates`,
`registry.isTemplateApplicable`, honoured by the prerender and the app index/route).
`j-valdez.excludedTemplates = ["storm-a","storm-b"]`. Build now emits **39 pages** (was
43). Removal stays applicable for J Valdez (it is their service) but its removal photos
are missing — see the blocker list below. Detail in commit `ec9fc5f`.

## Task 5 — PRE-DEPLOY READINESS (nothing deployed)

### The four P0 fixes — present on EVERY built page (19 main pages, verified by grep)

| Fix | Check | Result |
|-----|-------|--------|
| Per-client on-site thank-you, never titan | no `titantreeservicetx.com` in any markup; both live records `thankYouUrl:"/thank-you"`, `isExternalAllowed:false` | ✅ all pages |
| Click-ID capture (gclid/gbraid/wbraid/fbclid) | all four hidden inputs present | ✅ all pages |
| One E.164 phone → display + `tel:` | `tel:+…` derived href present | ✅ all pages |
| A2P consent checkbox | `name="sms_consent"` present | ✅ all pages |

### R4 — cross-client leakage across the full built output

- **6 of 7 templates clean:** removal-b, trimming-a, trimming-b, storm-a, storm-b,
  agnostic — no other client's slug/asset/filename in any page.
- **removal-a — one pre-existing coupling:** it hosts its brand-neutral TEMPLATE SVGs
  (4 benefit icons, review star glyph, Google "G" glyph) under `/assets/j-valdez/`, so
  every removal-a page (all clients) references that path. These are UI glyphs, NOT job
  photographs, so it is not the "someone else's job photos" defect R4 targets — but it is
  a cross-folder coupling that should be cleaned up before deploy (relocate the 6 SVGs to
  `/assets/_template/removal-a/` and update `removal-a/assets.ts`). Not fixed here:
  templates are frozen this session, and this predates it (P1). **Flagged for a decision.**

### Deploy-readiness matrix

| Client | Template | State | Reason |
|--------|----------|-------|--------|
| Texas Tree Tops | storm-a, storm-b | Ready* | Perf 99 / LCP 1.7 s / CLS 0 measured; gallery curated |
| Texas Tree Tops | trimming-a, trimming-b, agnostic | Ready* | renders, P0 present |
| Texas Tree Tops | removal-a | Ready* w/ caveat | works, but relocate the j-valdez template SVGs first (R4 tidy) |
| Texas Tree Tops | removal-b | Ready* | renders, P0 present |
| J Valdez | trimming-a, trimming-b, agnostic | Ready* | its real service; 12 trimming photos |
| J Valdez | removal-a, removal-b | **BLOCKED** | no removal photos; cascade fills removal slots with TRIMMING work — must not ship |
| J Valdez | storm-a, storm-b | **N/A** | not their service — excluded, not generated |
| Blank Co | (all) | Not a target | R5 fixture only, never deployed |

\* "Ready" means the page itself is correct; ALL pages are still gated by the
cross-cutting blockers below.

### Cross-cutting blockers (gate EVERY page — none is a page defect)

1. **Lead submission is a P4 stub.** `lib/leads.ts#submitLead` does not POST to GHL yet;
   it is the single seam awaiting a Cloudflare Pages Function that holds the GHL token
   server-side. **No page should go live as a real lead-capture until this is wired** —
   otherwise forms validate and "succeed" in the browser but no lead reaches the CRM.
   This is the #1 blocker.
2. **Phone numbers unconfirmed (both clients).** HOLD on any deploy that routes calls,
   per the standing note. There is documented cross-client phone leakage in the live
   source; do not reconcile them — the human confirms each against its GHL sub-account.
3. **Legal URLs blank (A2P gap).** Privacy/Terms are empty on both records
   (`legalUrlsPending`). Pages can render, but SMS/texting workflows cannot start until
   each client's own policies exist and are linked.
4. **Analytics not wired.** No GTM/gtag script is injected into the markup yet
   (`gtmContainerId` is stored but not emitted); conversions will not fire until P4 adds
   it. CallRail DNI is likewise P4.
5. **J Valdez removal photos missing** (see matrix) — supply real tree-REMOVAL job photos
   before enabling removal-a/removal-b for J Valdez.

### Exactly which photo slots J Valdez needs (to unblock removal)

`clients/j-valdez.json → photos.removal` is empty. It needs real **tree-removal** job
photos (never trimming, never another client's):
- **removal-a** draws from `photos.removal` for: the hero LCP plate + two hero proof
  shots, the recent-jobs gallery, and the restoration grid — supply ~8–12 images.
- **removal-b** draws from it for: the desktop hero art + the work mosaic.
Add them via the dashboard (auto-optimised + srcset) or drop files in
`app/public/assets/j-valdez/` and run `node scripts/generate-srcset.mjs`. Until then
removal-a/removal-b stay blocked (they currently cascade to trimming, which must not ship).

### Cloudflare Pages deploy steps (write-only — DO NOT run this session)

Preconditions: blockers 1–4 cleared for the client/templates being launched; the
dashboard is confirmed absent from `app/dist` (verified this session — it is a dev-only
Vite plugin + non-build HTML entries, so `npm run build` never emits it).

1. **Build the static site:** `cd app && npm run build` → output is `app/dist/` (39
   prerendered pages + assets; fully self-hosted, no external hosts).
2. **Add the lead Pages Function** (unblocks #1): create `app/functions/api/lead.ts`
   that receives the LeadPayload and POSTs GHL's Upsert Contact, reading the GHL token
   from a Pages **secret** env var (never in the bundle). Point `submitLead` at it.
3. **Create the Pages project** (one-time), either:
   - Dashboard → Workers & Pages → Create → Pages → Connect to Git → repo
     `Sosa24369/-tree-template-factory-`, **build command** `cd app && npm run build`,
     **build output directory** `app/dist`, framework preset "None"; or
   - Direct upload: `npx wrangler pages project create tree-landing` then
     `npx wrangler pages deploy app/dist --project-name=tree-landing --branch=main`.
4. **Set env/secrets** on the project: the GHL API token (secret), plus any per-client
   ids the Function needs. Do NOT commit secrets (R3).
5. **Do NOT add a catch-all `/* -> /index.html 200` redirect** — every real landing URL
   is prerendered, and a catch-all would render the dev index for unknown/excluded URLs
   instead of 404ing. Leave default static 404 behaviour.
6. **Map campaign URLs** to `/p/<slug>/<template>/` per client. Confirm a **test lead
   reaches GHL** and the `tel:` dials the **confirmed** number before spending on ads.

---

# START HERE NEXT

1. **Wire lead submission (blocker #1).** Build the Cloudflare Pages Function for
   `submitLead` (GHL Upsert Contact, token as a Pages secret). Nothing on the pages
   changes — `submitLead` is the only seam. This is the single biggest thing between
   here and a working deploy.
2. **Confirm both phone numbers** against their GHL sub-accounts (human), then update the
   records. Until then, HOLD on call-routing deploys.
3. **Relocate removal-a's 6 template SVGs** out of `/assets/j-valdez/` into
   `/assets/_template/removal-a/` and update `removal-a/assets.ts` (R4 tidy; needs the
   template unfreeze). Re-run the full R4 grep after.
4. **Supply J Valdez removal photos** (slots listed above) to unblock its removal pages,
   or confirm removal is out of scope for J Valdez and exclude it too.
5. **Per-client Privacy/Terms URLs** + GTM injection + CallRail DNI — the remaining P4
   wiring before SMS and conversion tracking are live.
6. **TTT `ad_click_id` GHL custom field** still to be created (click ids are captured and
   submitted regardless; they map once the field exists).

### Verification tooling note

Lighthouse 13.4.1 was installed globally this session and used with
`--throttling-method=devtools` (applied throttling) driving the installed Google Chrome.
It is available for future perf checks: serve `app/dist` (e.g. `npx vite preview`) and run
`lighthouse <url> --only-categories=performance --throttling-method=devtools
--form-factor=mobile --chrome-flags="--headless=new"`.

---

# P4 SESSION 2 — wire the form (lead submit to GHL)

Run of 2026-08-11 (follow-up). Started clean at `f60d2b7`, local == origin. Replaced the
`submitLead` P1 stub with the real path: browser → same-origin Cloudflare Pages Function
→ GHL Upsert Contact. Nothing deployed; all proof is local (dry-run + Wrangler).

## The Function's contract (`app/functions/api/lead.ts` + `_core.mjs`)

`POST /api/lead`, JSON body. GET → 405.

- **Validates:** known client slug only (checked against the generated registry —
  unknown → 400); phone normalized to E.164 (bad → 400); consent STATE present as a
  boolean (missing → 400); first name present (missing → 400); honeypot
  `company_website` filled → 200 "dropped", nothing forwarded; a template the client
  has opted out of (`excludedTemplates`) → 400.
- **Routes by slug ONLY:** slug → registry → `ghlLocationId` + the env secret
  `GHL_PIT_<SLUG>`. The location id and token NEVER come from the request body, so one
  client's form structurally cannot write into another client's GHL. Unknown or
  unconfigured (no token) is refused (503) before any token is read.
- **Maps:** click id → the client's ad-click custom field **iff it exists** (TTT's is
  null → dropped-and-logged, lead still submits — never fail a lead over a missing
  field; J Valdez has the field → click id mapped in, passed through intact). Tags =
  client tags + `lp-<template>` + `sms-consent-yes|no`. `source` = client's leadSource.
  Consent text + timestamp recorded.
- **`GHL_DRY_RUN`** logs the exact upsert payload and posts nothing.

The routing map is generated from `/clients/*.json` by
`scripts/generate-lead-registry.mjs` (first build step) into
`app/functions/api/client-crm.generated.json` — NON-SECRET (location ids, field ids,
tags, source; already committed in the records). Tokens are env-only. Factory property
intact: adding a client is still just a JSON file.

## Validation matrix — `node scripts/test-lead-function.mjs` (24/24 pass)

Imports the real handler and runs it with a mock Request + env (GHL_DRY_RUN). unknown
slug 400 · bad phone 400 · missing consent 400 · missing name 400 · honeypot dropped
(nothing forwarded) · excluded template 400 · valid-but-no-token 503 (no POST) · TTT
maps location+phone+tags and DROPS the click id (no field) without failing · JV MAPS the
click id into its custom field, value intact · dry-run log names the env secret.

## Dry-run evidence (the exact payloads the Function WOULD send)

Via `wrangler pages dev` (dev-only) — compiled the Function, loaded `.dev.vars`
(GHL_DRY_RUN), and both curl and a real browser form-submit produced:

```
TTT  storm-a: envKey GHL_PIT_TEXAS_TREE_TOPS
     locationId zfoeYpKrqshgdFr4gG3b · phone +16824520735 (from "(682) 452-0735")
     tags [google-ads, landing-page, lp-storm-a, sms-consent-yes] · source set
     droppedFields [ad_click_id: "no GHL custom field configured for this client"]
     consent {given:true, text:"…full A2P copy…", timestamp:…}

JV   trimming-a: envKey GHL_PIT_J_VALDEZ
     locationId FaHof000UZrAJUKORVCj · phone +14694021196 (from "4694021196")
     tags [google-ads, landing-page, lp-trimming-a, sms-consent-yes]
     customFields [{id: DTlYvWAb5Y0M3iXyWfcH, value: "fb-xyz"}] · droppedFields []
```

Browser end-to-end: filled the TTT storm-a form → routed through the live Function →
`generate_lead` dataLayer event fired ONCE (`{client:texas-tree-tops, template:storm-a,
placement:lead-form}`) → landed on the client's own thank-you page. With the server
killed, the form showed **"Something went wrong sending your request. Please call
(682) 452-0735…"** (a live phone link) and did NOT navigate or fire the conversion —
the lead is never silently lost. **No POST to any real client GHL location; no sandbox
token was available, so dry-run evidence stands as the proof.**

## SVG tidy + R4

`removal-a` referenced its brand-neutral glyphs (4 benefit icons + review star/Google
glyphs) at `/assets/j-valdez/…`, where the files DID NOT EXIST — so they 404'd on every
removal-a page AND leaked the j-valdez path. Repointed the six refs to `/assets/_shared/`
(where the files already are). **Full R4 grep is now clean across all seven templates for
all three clients.** (commit `8843a68`)

## Secrets — the per-client table and how to set them

The Function reads one Private Integration Token per client from an env secret named
`GHL_PIT_<SLUG>` (slug uppercased, non-alphanumerics → `_`):

| Client | slug | env secret name | GHL location id (routing target) |
|--------|------|-----------------|----------------------------------|
| Texas Tree Tops | texas-tree-tops | `GHL_PIT_TEXAS_TREE_TOPS` | zfoeYpKrqshgdFr4gG3b |
| J Valdez Tree Services | j-valdez | `GHL_PIT_J_VALDEZ` | FaHof000UZrAJUKORVCj |

Local dev: copy `app/.dev.vars.example` → `app/.dev.vars` (gitignored), set
`GHL_DRY_RUN=1` for safe testing, add real tokens only to make live calls. Never commit
`.dev.vars`.

### Setting a secret in the Cloudflare Pages dashboard (exact click-path)

1. Cloudflare dashboard → **Workers & Pages** → your Pages project.
2. **Settings** → **Variables and secrets** (a.k.a. Environment variables) →
   **Production** (repeat for **Preview** if you preview-deploy).
3. **Add variable** → Type **Secret** → Name `GHL_PIT_<SLUG>` → Value = the client's
   Private Integration Token → **Encrypt** / **Save**.
4. **Redeploy** the project so the new secret is bound (secrets bind at deploy time).

### The human's ONE manual step per new client

> In that client's own GHL sub-account: **Settings → Private Integrations → Create** a
> token with the Contacts write scope. Copy it. In Cloudflare Pages add a secret named
> `GHL_PIT_<SLUG>` with that value (steps above). Redeploy. That is the whole per-client
> setup — everything else (location id, tags, field mapping) is already in the client
> record and regenerated into the routing map at build.

## Revised pre-deploy checklist (supersedes the previous Cloudflare section)

1. **Build:** `cd app && npm run build` → `app/dist` (39 pages; the build regenerates the
   lead registry first). Dashboard is dev-only and never in `dist` (verified).
2. **Ship the Function:** it lives in `app/functions/` and deploys automatically with
   Pages when the project's root/output is `app` / `app/dist`. Confirm `GET /api/lead`
   returns 405 on the deployed URL.
3. **Set secrets:** `GHL_PIT_<SLUG>` per launching client (table + click-path above). Do
   NOT set `GHL_DRY_RUN` in production (leave it unset so real calls happen).
4. **Still-open cross-cutting gates** (unchanged, human/P4): confirm both phone numbers;
   supply per-client Privacy/Terms URLs (A2P); inject GTM so the `generate_lead` event
   becomes an ad conversion; create TTT's `ad_click_id` GHL field; supply J Valdez
   removal photos (removal-a/b stay blocked until then); storm is N/A for J Valdez.
5. **No catch-all redirect** — every landing URL is prerendered; a `/* → /index.html`
   rule would mask 404s. Leave default.

### Post-deploy smoke test (per client, once)

1. On the LIVE site, open that client's page and submit ONE real form (real name +
   phone, consent checked).
2. In that client's GHL sub-account, confirm the contact appears in the **correct
   location**, with the `lp-<template>` and `sms-consent-yes` tags and the source set;
   if the client has the ad-click field, confirm the click id landed.
3. In GTM Preview / the ad platform, confirm the `generate_lead` event fired **once** for
   that submit (not zero, not twice).
4. Only after a clean smoke test per client, point ad spend at the URLs.

---

# START HERE NEXT

1. **Human: create the GHL Private Integration Tokens** (one per launching client) and
   add them as Cloudflare secrets `GHL_PIT_<SLUG>` (table + click-path above). This is
   the last thing gating a working live form. Until then the Function correctly refuses
   (503) rather than mis-routing.
2. **Confirm both phone numbers** against their GHL sub-accounts, then update the records.
   HOLD on call-routing deploys until done.
3. **Inject GTM** (per-client `gtmContainerId` is stored but not emitted) so the
   `generate_lead` dataLayer event — already firing on success — becomes the ad
   conversion. Add CallRail DNI at the same time if wanted.
4. **Per-client Privacy/Terms URLs** before any SMS/A2P workflow runs (records warn while
   blank).
5. **Supply J Valdez removal photos** to unblock removal-a/removal-b (slots listed in the
   prior report); create TTT's `ad_click_id` GHL field so click ids map (they're captured
   and submitted regardless).
6. **First live smoke test** per client (steps above) before ad spend.

### Verification tooling available in-repo now

- `node scripts/test-lead-function.mjs` — lead validation/mapping matrix (no network).
- `wrangler pages dev dist` (from `app/`, reads `app/.dev.vars`) — full local Function.
- `lighthouse <url> --throttling-method=devtools --form-factor=mobile` — applied-throttle perf.
- `node scripts/verify-factory-rules.mjs` (R1/R3/R5/FIX1, now scans `app/functions`) and
  `node scripts/verify-faq-a11y.mjs`.

---

# P4 SESSION 3 — DEPLOY DAY (live)

Run of 2026-08-11. Deploying was explicitly authorised for this session only. Started
clean at `c537af0`, local == origin. Live at **https://tree-template-factory.pages.dev**
(Cloudflare Pages project `tree-template-factory`, account `ef07a2f57e930a4d6499a45560b78d9f`).

## Phones reconciled (Task 1)

Human confirmation matched the existing records exactly, so **no record change was
needed** — the confirmation lifts the hold on the numbers already in place.

| Client | Confirmed | Record (unchanged) | Verified by |
|--------|-----------|--------------------|-------------|
| Texas Tree Tops | 682-452-0735 | +16824520735 | "they have been getting calls" |
| J Valdez | 469-402-1196 | +14694021196 | "they have been getting calls" |

Verified in the built output: every `tel:` on TTT pages is `+16824520735` (41), every
`tel:` on JV pages is `+14694021196` (29), and neither number appears on the other
client's pages. The call-routing HOLD is lifted only for these two confirmed numbers.

## Secrets set (Task 2) — names only

Set by the human (tokens never handled by the agent, never in the repo/transcript):

| Secret name | Bound to | Status |
|-------------|----------|--------|
| `GHL_PIT_TEXAS_TREE_TOPS` | project `tree-template-factory`, production | Value Encrypted ✓ |
| `GHL_PIT_J_VALDEZ` | project `tree-template-factory`, production | Value Encrypted ✓ |

`GHL_DRY_RUN` is NOT set in production (real calls). Redeployed after setting secrets so
they bind.

## Deploy + live verification (Task 3)

Direct-upload deploy (`wrangler pages deploy dist` from `app/`, Functions bundled from
`app/functions`). Verified on the live `*.pages.dev`:

- **All 19 built main pages return 200** (both clients + the blank-co fixture).
- **Prerendered content served** (view-source shows real markup, e.g. TTT storm-a's
  "Storm Damage in West Dallas…"), not an empty shell.
- **All assets 200** — shared CSS + JS bundle, per-client photos, logos, `_shared` SVGs.
- **`GET /api/lead` → 405** (the Function is live).

## Live URL table (client × template)

Base: `https://tree-template-factory.pages.dev/p/<client>/<template>/`

| | removal-a | removal-b | trimming-a | trimming-b | storm-a | storm-b | agnostic |
|---|---|---|---|---|---|---|---|
| **texas-tree-tops** | live | live | live | live | live | live | live |
| **j-valdez** | live¹ | live¹ | live | live | n/a² | n/a² | live |

¹ J Valdez removal pages render but its `photos.removal` is empty (cascades to trimming);
treat as **not for ad traffic** until real removal photos are supplied. ² storm excluded
for J Valdez (not their service) — not generated.

`blank-co` is the R5 fixture; its pages deploy but are not a client and get no traffic.

## Live smoke test (Task 4) — one lead per client, both PASS

Real submits to the live site (`TEST` / `DELETE ME`, consent checked, test phones
682-555-0100 and 469-555-0100):

| Client | Result | Landed on | generate_lead |
|--------|--------|-----------|---------------|
| Texas Tree Tops (storm-a) | ✅ success | its own thank-you (West Dallas / (682) 452-0735) | fired **once** `{texas-tree-tops, storm-a}` |
| J Valdez (trimming-a) | ✅ success | its own thank-you (East Dallas / (469) 402-1196) | fired **once** `{j-valdez, trimming-a}` |

Both Function calls returned success, i.e. GHL accepted the upsert with **that client's
own token to that client's own location**. Routing is slug → location id → `GHL_PIT_<SLUG>`
token, so a contact cannot be written to the other sub-account.

**UNVERIFIED BY THE AGENT (human step):** the agent cannot open the GHL UI. The human must
confirm each test contact appears in **its own** sub-account only — TTT's test in
`zfoeYpKrqshgdFr4gG3b`, J Valdez's in `FaHof000UZrAJUKORVCj` — and then **delete both test
contacts**. If a test contact shows up in the wrong sub-account, that is a
deploy-stopping defect — stop and raise it.

## Flags / not-blocking-but-clean-up

- **The public root `/` and any unmatched route serve the internal dev index** (the
  "Template factory" client roster) with HTTP 200 — Cloudflare's default SPA fallback,
  because `index.html` is that dev index. Campaign URLs (`/p/<client>/<template>/`) all
  work correctly, but the roster page should be gated/replaced before real traffic (a
  small app change — out of this session's frozen scope). Unmatched/excluded routes 200
  into the SPA which then shows "Not found" client-side.
- **`generate_lead` fires but has nowhere to go yet:** no GTM is injected in production
  (window.dataLayer is undefined, so the guarded push no-ops in a real session — proven
  by pre-seeding dataLayer in the smoke test). Kevin's GTM + CallRail DNI is the P4
  on-page-tracking step that turns the event into an ad conversion.

## Launchpad

The **Launchpad row for this app needs its live URL added**
(`https://tree-template-factory.pages.dev`) — that lives in the separate Library repo and
is a different session.

---

# START HERE NEXT

1. **Human: verify + delete the two test contacts** in GHL. TTT's `TEST DELETE ME` in
   sub-account `zfoeYpKrqshgdFr4gG3b` only; J Valdez's in `FaHof000UZrAJUKORVCj` only. A
   contact in the wrong place = stop-everything defect.
2. **Kevin's on-page tracking:** inject per-client GTM (the `generate_lead` event already
   fires on success) so it becomes the ad conversion; add CallRail DNI. Pages are live, so
   this can proceed now.
3. **Gate/replace the public dev index at `/`** before real traffic (exposes the client
   roster). Small app change; needs the template/app unfreeze.
4. **Custom domains** per client when ready (Cloudflare Pages → Custom domains).
5. **TTT `ad_click_id` GHL field** — create it so click ids map onto a contact field
   (they are captured and submitted regardless; currently dropped-and-logged).
6. **Per-client Privacy/Terms URLs** before any SMS/A2P workflow runs.
7. **J Valdez removal photos** to unblock its removal pages (or exclude removal too).
8. **Add the live URL to the Launchpad row** (Library repo, separate session).

**Not declared "ready for ads."** That is the human's call after Kevin's tracking is live
and the test contacts are verified and deleted.
