# Texas Tree Tops removal-a — page 3 scope (against docs/batch-four-pages/four-page-spec.md)

Status: DRAFT written before page 3 begins. ⏳ = measured before building. PROTECTED page
(protected-routes.json); no campaign is unpaused on this account (owner, 2026-09-16).

## What pages 1–2 already changed here (evidence needed, no new work)

| item | state on this page after pages 1–2 |
|---|---|
| T1 — S1, 5 of 9 reviews cut off | the scoped slider rule (`.removal-a .rvs-*`) already applies: whole cards 1/2/3 per view, no clamp, no stretch. Evidence: before (live) / after screens of `.ra-why`, cut count 5 → 0 ⏳ |
| T2 — S2, 50 chips for 25 cities behind the mask | removal-a's Areas.tsx is the static list already: 25 chips once, no mask. Evidence: before/after `.ra-areas`, chip count ⏳ |
| R4 4:3 cards, R5 Google button, R3 one-rule grid | template-wide from page 1; the button appears because the record has `reviewsSource.profileUrl` (cid 4122891418016832820). Evidence in the diff and screens |

## T3 — S3: the Restoration grid

Today: five cells — gallery-02, -03, -04, -05, -07 — in the page-1 grid rule that gives
three uniform columns from 768 px, so **five cells leave one empty at ≥768 and span the
last at <768**. Fix: a sixth photo, explicit `photoSlots.removal-a.mosaic.6` (the resolver
rule from page 1). Candidates, from the existing removal library first (spec):

- The five in the grid are 382–680 px files (the record calls them larger) — 2–3× upscaled
  at every width; legacy, tolerated by the guard, **not this page's item** (report it).
- The only removal-library files ≥706 px (the cell needs 353×2) are `restoration-photo-1..5`
  (1000×1000, no alt, unused on this page except in the rail). ⏳ view all five: pick one
  that is removal work (felled trunk, sections, stump, bucket/crane) and not a composite.
  If none qualifies, the Mobile Makeover set is Texas Tree Tops *trimming* — wrong service
  for a removal grid — so say so and leave the grid at five with the phone span.

## T4 — the 24-item rail

⏳ Measure first-item reachability at 390/820/1440 on the live page. The page-1 scope
probe found this rail's first item reachable (it is not the centred rail trimming-a had);
if that holds at all three widths, T4 is "measurement says not real", reported as such.

## T5 — the alt-text item (docs/ALT-TEXT-ITEM.md), the Texas Tree Tops part

1. Record: alts on `_shared/services-card-photo-1/2/3` entries in `clients/texas-tree-tops.json`
   — "Gloved hand cutting a small branch with hand pruners", "Old tree stump surrounded by
   weeds and undergrowth", "Cut section of a tree trunk resting on sawdust". Covers the
   rail (3), trimming-a (3), agnostic (3) via slots that already prefer a record alt.
2. Template: `slotAlt()` in removal-a/assets.ts prefers a record alt BEFORE composing —
   today it composes "…tree removal job, photo N" for anything filed under removal even
   when the record describes it. Covers the services strip (the tenth instance) and the
   hero proof; also changes J Valdez removal-a's hero-proof.2 alt to its record description
   → re-run page 1's diff and compare afterwards.
3. Guard: in `scripts/verify-image-spec.mjs`, a `_shared/` or `_template/` photograph
   rendered with an alt containing the client's name fails the build (R4 checks paths only,
   which is how this shipped).
4. Summit record: "…with bypass loppers" → "…with hand pruners"; "Cut stump left at ground
   level after a tree was taken down" → "Old tree stump surrounded by weeds and undergrowth".

Also on this page, for the report only: `_template/removal-a/benefit-strip-art` (their own
photograph, correctly attributed) stays; the `assets/texas-tree-tops/bg-section-*` backgrounds
are this template's default art on every client (page 1 summary).

## Evidence to produce
before/after for `.ra-why` (T1), `.ra-areas` (T2), `.ra-restoration` (T3), `.ra-gallery`
(T4) at 390/820/1440; crops for mosaic.6; compare / guards / criterion 8 / Lighthouse
before+after / diff / bundle in this folder; page 1's diff + compare re-run after T5.2.
