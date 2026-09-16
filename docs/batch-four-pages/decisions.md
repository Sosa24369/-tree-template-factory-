# Decision log — batch/four-pages

Appended as decisions are made, never only at the end. Each entry: the decision, the
alternative rejected, and why. Owner's own rulings are marked **(owner)**.

## Standing rulings from the owner

- **(owner)** Areas We Serve stays the static wrapped list on every page. Restoring the
  marquee motion with an aria-hidden clone is a later, shared item, not part of this batch.
- **(owner)** Service-match photo swaps go into the section whose heading promises that
  service, not page-wide. On J Valdez removal-a: the Restoration grid takes removal
  originals; the Recent jobs rail and the services cards keep the trimming photos they show.
- **(owner)** B2: `work-photo-1` replaces the composite in hero proof cell 2. Set
  `hero-photo-2`'s focal point if that centres its crop; the truck and the painted number
  both stay in frame. Report every page that photo appears on.
- **(owner)** B5: services cards go 4:3 and take the taller cards.
- **(owner)** Reviews stay stubbed with the current record text; layout and button only.
- **(owner)** B4: build the Restoration grid now from the originals on this Mac; a 1080 px
  file is acceptable in any cell whose real box is ≤ 1080 at every breakpoint.

## 2026-09-16 — before the first edit

1. **Publish mechanism.** `wrangler pages project list` shows Git Provider = No for
   tree-template-factory: the landing pages publish by direct upload only, never from a
   push. Railway is not git-connected either (`railway up`). The hook still blocks
   `git push` to main/master and bare pushes, because the studio `git pull --ff-only`s main
   and its Publish button builds from it — a push to main is one click from live.
2. **Grid photos, R3.** Six cells, not five: 6 closes at 2 and 3 columns with no span
   trick; 5 needs a spanning last cell, which the owner's "uniform cell size" rules out.
   Rejected: keeping 5 with a spanning cell. Consequence: the resolver lets an explicit key
   past a fixed-count slot add a cell (`mosaic.6`), which no existing record exercises.
3. **Keeping the rail and services unchanged while importing removal photos.** The new
   photos go in `photos.removal` (the honest set). Auto-fill would then feed them to the
   rail (all), services strip (last 3), longform (2nd) and hero proof (2–3) on removal-a,
   and to J Valdez's removal-b/-c and agnostic pages. To honour "grid only": those removal-a
   slots are pinned explicitly to what they show today (rail.1–12, service-photo.1–3,
   longform). Rejected: a new non-cascading set key (the schema allows four keys only) and
   putting the photos in `photos.generic` (the cascade reaches generic before trimming).
   removal-b/-c/agnostic are not pinned: they are not protected, and a removal page showing
   removal work is the service-match rule; each is named in the prerender diff.
4. **B2 uses IMG_1119, not `work-photo-1`.** They are the same photograph; IMG_1119 is the
   1320 px original, work-photo-1 the 1000 px square. Same picture the owner chose, better
   file, no 1.07× upscale at 1440. Rejected: the existing 1000 px file.
5. **Hero plate emptied at record level, not template level.** `photoSlots.removal-a
   .hero-plate = ""` (the studio's own Remove-from-slot) so only J Valdez loses the photo;
   Texas Tree Tops' removal-a hero is untouched. Rejected: a template flag, which would
   have changed a protected page the owner did not name.

## 2026-09-16 — J Valdez removal-a, during the build

8. **image-spec guard, two violations on the first build.** (a) "photos.removal[0] is
   1320 px wide, removal-a hero-plate needs 1600": the guard applies the hero-plate minimum
   to whatever leads the removal set; the pin to an empty plate is invisible to that rule.
   Fix: reorder the set so removal-boom-over-house-nf3 (1600×1200) leads — no guard change,
   grid cells are explicit so the grid is unaffected. Rejected: teaching the guard about
   the '' pin (a guard change for one record). (b) "photoSlots.removal-a.mosaic.6 is not a
   slot": the key validator predates the resolver rule; it gets the same rule. Rejected:
   a five-cell grid (needs a spanning cell, against "uniform cell size").
9. **S1 no-stretch.** After unclamping, the cards in a row still share the tallest height
   (flex stretch: 426 px at 390, 356 px at 820/1440). The standard says nothing stretches
   to match a neighbour, review cards included → `.removal-a .rvs-track { align-items:
   flex-start }`. trimming-a gets the same in its own pass.
10. **Duplicate photos on the page (pre-existing, left).** hero-photo-2 ×3 (proof cell,
    longform, rail), work-photo-3 ×3 (Benefits, services, rail), work-photo-4/5 ×2. All
    from the rail showing the whole 12-photo library; every count is what live shows
    today. Removing rail cells is a layout change the owner excluded ("everything else
    below the fold stays"). The six new photos each appear once.
11. **Logo preloaded twice (pre-existing, left).** Every text-hero page (storm-a, removal-b,
    now removal-a) carries two preload links for the one logo file: the prerender's and
    React's SSR float. Same URL, one fetch. Removing the float touches every page
    including storm-a; not this page's item.
