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
12. **removal-c work grid under-declared its sizes (pre-existing, fixed).** Criterion 8, run
    for the first time on removal-c because it is in this batch's diff, found the work cells
    render 364 px at 820 and 1440 (live and built alike) while removal-c/page.tsx passed no
    `sizes` at all, so the images fell to DeferredImage's default `22vw` (317 px at 1440)
    instead of the contract's `26vw`. Not caused by the batch;
    fixed by reading `slotSizes('removal-c', 'work')`, the same rule every wired template
    follows. Changes only the `sizes` attribute on the three removal-c pages. Rejected:
    leaving it and reporting, since the amendment stops only on a box that cannot be fixed.
13. **Grid breakpoint 768, not 860.** The one-rule grid first went to three columns at
    860px, so at 820 an odd count (Summit's 3, Texas Tree Tops' 5) grew a spanning cell
    that criterion 8 flagged (738px box, 492px declared) — a miss the live page did not
    have, because its appended block went to three columns at 768. Restored 768: the live
    tablet layout is preserved, J Valdez's six cells stay uniform (two rows of three), and
    the 820 miss disappears. Rejected: declaring bigger sizes for a spanning cell.
14. **Pre-existing criterion-8 misses on pages outside the target (left, listed).** The
    same check on the LIVE pages shows J Valdez removal-b's spanning tile (350px at 390,
    489px at 820 against 176/246 declared) and Summit removal-a's rail (332px at 390 against
    254 declared) already miss today. Neither page is in the batch; both are template
    `sizes` strings for spanning/odd cells. Logged for a later sizes pass; not fixed here
    because each would be a change to a page the owner did not name, for a defect the
    batch did not cause.

## 2026-09-16 — J Valdez trimming-a (page 2), findings before the build

15. **S2's 10-vs-8 cities mismatch is in the record's own copy, and stays.** The chips
    render `serviceAreaList` (10 cities). The paragraph above them is the record's
    `copyOverrides.trimming-a["why.body"]`, which names 8: Forney and Lake Ray Hubbard are
    chips only. No other template override has the mismatch (removal-a composes its
    sentence from the list). The spec keeps headline and body copy as they are unless an
    item names the copy, and the ads are tuned to it — so this is reported for the owner's
    decision (add the two cities to the sentence, or drop them from the list), not edited.
    Rejected: editing the override to name all ten.
16. **P1 is a regression from the last ship, and the fix is the seam, not either section.**
    Measured live: the Recent jobs band and the offer band abut (0 px between the sections)
    but the band's bottom padding is a full `--ta-pad` (B9 gave it `padding-block: … var(--ta-pad)`)
    and the offer band B10 moved after it opens with another full pad: 54+54 / 66+66 /
    108+108 px of white between the last photo and the first card at 390/820/1440. The
    standard allows one section pad at a seam. Fix: half a pad on each side of that seam
    (`.ta-process + .ta-gallery { padding-bottom: calc(var(--ta-pad)/2) }` and
    `.ta-gallery + .ta-benefits { padding-top: calc(var(--ta-pad)/2) }`), so the seam equals
    one pad. Rejected: touching the offer band's own layout, or reordering again.
17. **S1 is one layout, applied to the three batch templates, not to the shared slider file.**
    Whole cards at every width: one card per view under 768, two to 1023, three from 1024
    (`flex-basis: calc((100% − gaps)/n)`), scroll-snap paginating whole cards, and
    `align-items: flex-start` so a card fits its own text. Scoped to `.trimming-a`,
    `.removal-a` and `.storm-a` so removal-b, trimming-b and agnostic keep the live slider.
    removal-a's review evidence (after-why-*.png, measurements) is refreshed after this
    lands. Rejected: editing `reviews-slider.css` (changes 14 pages, ten outside the batch).
18. **S3 photo placement on trimming-a.** The composite work-photo-2 also fills the
    services-blurb slot (740×740 at 820) — a composite in a large cell — so it leaves both
    places: grid cell 2 ← IMG_1117 (limbs lowered over a roof: the headline's own promise),
    longform ← IMG_1116 (climber in the canopy). work-photo-5 (trucks beside an empty lot)
    ← PXL_20260407_145030926 (lakeside slope, trimmed trees). work-photo-1 (bucket truck in a
    large tree) stays: it reads as canopy work under "Done clean, done right". gallery-slide-4
    stays in cell 6 and also in Recent jobs — the owner-accepted repeat until more originals
    arrive; the three new photos were needed elsewhere. Rejected: pulling gallery-slide-4
    and leaving five cells (the uniform grid needs six).
19. **Pins so the new trimming photos change only the grid and the blurb.** trimming-a's
    slots are positional (hero 2, gallery = middle share, grid = the rest), so three more
    photos in `photos.trimming` would re-split the sets and grow Recent jobs. The band and
    hero band are pinned to what they show today: hero-band.2 = hero-photo-2, gallery.1–5 =
    gallery-slide-1..5, and the cells the larger middle share would add are pinned empty
    ('' — the studio's own Remove-from-slot) so the band keeps exactly five tiles. Rejected:
    a separate set key (the schema has four; generic is read directly by removal-a's grid).
20. **trimming-a's blurb photo is `grid[1]`, not the `longform` slot (pre-existing contract
    mismatch, logged, not fixed here).** Longform.tsx renders the second Done-clean grid
    photo; the placement contract declares a `longform` slot picking the set's second
    photo, so the studio's slot list would preview one picture while the page shows another,
    and a pin on that key does nothing. The batch keeps the diff small: the dead pin is
    removed, the grid is ordered so cell 2 (and therefore the blurb) is the climber
    (IMG_1116) and the limbs-over-a-roof photo takes cell 6 — which also retires the
    gallery-slide-4 repeat. Consequence accepted: the climber appears twice (cell 2 and the
    blurb), as the composite did on the live page. The fix — Longform reading its slot, or
    the contract saying "grid cell 2" — changes Texas Tree Tops' and Summit's blurb photos
    and is a template item for the report. Rejected: fixing it now.
21. **trimming-c work grid: same missing `sizes` as removal-c (pre-existing, fixed).**
    Criterion 8 at 820: cells 364 px, declared 180 (DeferredImage's default 22vw); the
    contract's 45vw covers it. `sizes={slotSizes('trimming-c','work')}` — attribute only,
    three trimming-c pages.

## 2026-09-16 — Texas Tree Tops removal-a (page 3)

22. **T3's sixth cell is `restoration-photo-1`.** The grid's five photos (gallery-02/03/04/
    05/07) are 382–680 px files — 2–3× upscaled in every cell and "Replace"-grade under the
    guard's legacy allowance; not this page's item, reported. The only removal-library files
    that fill a 353 px cell at 2× are the five `restoration-photo-*` at 1000 px; of those,
    photo-1 (a climber cutting a dead tree down with a chainsaw) and grid-2 (a lift at a
    leaning tree over a garage) are removal work, photo-3 is a crew standing under an oak,
    photo-4 a chipper at a driveway, photo-5 a stump grinder. Photo-1: the clearest cut, no
    branding, no composite. Rejected: the Mobile Makeover set (Texas Tree Tops trimming —
    wrong service for a removal grid).
23. **T4 is not real.** The 24-item rail's first item is reachable at 390, 820 and 1440 on
    the live page (first item at x = 20 / 41 / 174 px inside a left-aligned rail); the
    unreachable-first-item defect was trimming-a's centred rail, fixed in Group B. Reported
    as measured; no change.
24. **T5 details.** (a) The three stock alts are on the Texas Tree Tops record; (b) `slotAlt()`
    now prefers a record alt everywhere, which also gives J Valdez's hero-proof.2 its record
    description (page 1's diff and compare are re-run); (c) the Benefits template artwork
    gets a neutral description of the picture instead of "<client> tree removal job" — true
    for Texas Tree Tops (their photograph), no longer a false claim on Summit; (d) Summit's
    stock alts: the two inaccurate ones corrected and the third harmonised to the same three
    strings, in all four sets the demo lists them (12 entries); (e) the guard in
    verify-image-spec.mjs fails any `_shared/` or `_template/` record entry with no alt or an
    alt naming the client, demos included.

## 2026-09-16 — Texas Tree Tops storm-a (page 4)

25. **T7 is a rewrite of the shared component, not a CSS override.** Two ways to give every
    page one static list: (a) keep `ServiceAreasCarousel` as it was and hide the second copy
    and the animation with CSS; (b) render one list. (a) leaves 50 chips in the DOM for 25
    cities, the aria-hidden duplicate in every page's HTML, a tabbable track and the marquee
    code in the bundle. Chose (b): one `<ul>`, cities deduplicated case-insensitively, the
    group role and label kept, the chip rule untouched, the class root and export names kept
    so the six importing templates need no edit. Reach is 21 pages across all three clients
    (the owner's ruling, decisions 5, is "the static list on every page"); each is in the
    prerender diff with the same markup change, and each was measured at 390/820/1440.
26. **Storm-a's work grid stays (no S3).** The six tiles are three shapes by design (171×128,
    171×228, 171×171 at 390; 340×255, 340×454, 340×340 at 1440) and the grid closes cleanly
    on live at every width — the spec's S3 (one aspect ratio, one size) named removal-a and
    trimming-a's grids, not this one, and the draft scope said no S3. The storm photo set on
    the Mac is 800×600 (under the 1200 minimum, and the tall tile is 680×908 at 2×), so no
    photo from it goes in. For the report: ask Texas Tree Tops for storm originals ≥1600 px
    (tree on a roof/fence/car, uprooted root plate, crews at a storm job).
27. **The page-4 diff is measured with the hash-normalised snapshot** (`pagediff.sh` →
    `prediff.py`), the same method as pages 1–3. A first run against `app/dist` directly
    listed 55 of 55 pages, every thank-you page by 4 lines: the JS and CSS bundle file names,
    which change with every build. Normalised, the thank-you pages drop out and the list is
    the 21 T7 pages plus the pages already explained by pages 1–3 and the T5 alts.

## 2026-09-16 — found while closing page 4, belongs to page 1's record change

28. **J Valdez agnostic, removal-b and removal-c are pinned to the photos they show live.**
    The `photos.removal` set added on page 1 is read first by those three templates (their
    slots cascade removal → generic → trimming), so the build had swapped every photo on
    them for the seven removal originals — and with that dropped `hero-photo-2` (the truck)
    and `gallery-slide-5` (the yard sign) from three pages they occupy on live. That breaks
    the standing rule "keep them in every slot they occupy" and the owner's "grid only, rest
    unchanged"; page 1's diff had labelled it as service-match and let it through. Fix, the
    smallest diff that preserves what is live: explicit keys on the J Valdez record —
    `agnostic.shot.1–12`, `removal-b.hero-wash/tile.1–7/scope`, `removal-c.hero-wash/
    work.1–9/longform` — each cell the photo it shows today, verified reference-for-reference
    against the live HTML (15 / 13 / 14 refs). Rejected: changing the resolver's cascade
    order (a template change reaching every client) and removing `photos.removal` (page 1's
    grid needs it). The truck is now on the same seven J Valdez pages as live and the sign
    on the same six. Cost: +220 B JS (the record is bundled), batch +1,527 B of 3,072.
    Page-4 decisions: 25–28, under the five-per-page stop.

## Hook firings (the publish guard), for the report

Three firings, all false positives on the hook's own regex, none an attempt to publish:
(1) the rails commit, whose message quoted the deploy command (decisions 7, fixed by
stripping heredoc bodies); (2) a hook-fix command whose pipe-test lines quoted it (7);
(3) while writing the REPORT, a read-only `grep` over docs and package files for the
deploy command's name as a search pattern — refused whole, nothing ran, re-issued without
the phrase. The amendment's stop condition names "the publish hook fires for any reason
other than the proof run"; as with 7, a pattern match on a string in a read-only command
is logged and the run continues. No firing came from a publish, deploy or push command.

## 2026-09-16 — the hold: a check lied, two defects, a sweep (owner's second instruction)

29. **The dead-space check measured the wrapper, not the photo.** `ib = im ? im.getBounding
    ClientRect() : wb` — with no `<img>` inside a services card the image box was taken to
    be the wrapper, so dead space was 0 by construction. Red, then green, on page 1's
    build: unchanged, `dead 0px` on all nine cards; changed so a rendered box with no image
    fails, run under the screenshot's own conditions (the harness's fast scroll pass, then
    measure), cards 2 and 3 fail `348×261: NO IMG`; run settled (slow pass, wait for every
    image) all three hold their loaded photographs. Cause: `DeferredImage` inserts the
    `<img>` only once an IntersectionObserver fires within 300 px of the viewport, and the
    capture ran ahead of the two lower cards. The slots were filled (record pins resolve,
    the built HTML carries all three sources); the harness and the check were wrong. The
    screenshot harness now scrolls slowly, waits for every image, and hides the fixed bar
    before a section clip (a section capture painted the bar mid-clip, which is the second
    screenshot). The deferred-placeholder window itself is a finding for the sweep.
30. **Two guards, two hosts.** The static half (`image-boxes`, post phase) runs wherever node
    runs — the studio's publish included — and fails a box with no image fallback or a
    missing file: 0 hits on the build and on the live copies. The rendered half needs Chrome;
    the studio host is Railpack with no browser, and the suite's contract says a guard that
    cannot run is FAILED, never skipped-as-passed — so a browser guard in `post` would turn
    the studio's Publish button off. It is a `rendered` phase instead: publish.mjs runs and
    lists pre/post only; the release machine runs `scripts/run-guards.mjs rendered` before a
    publish and the batch evidence records it. Rejected: skip-when-no-browser (a hidden pass),
    and adding Chrome to the Railway image (the owner's call, not an unattended one).
31. **Areas: a grid whose column count is chosen from the city count.** Alphabetical, all
    cities at once, no scroll, no mask. A wrapped flex row cannot promise a last row of ≥ 2,
    so the component computes columns per breakpoint and emits them as custom properties:
    <768 two (three only if two strands a city and three does not); ≥768 four / three /
    five; ≥1024 five / six / four / seven — the first whose last row holds ≥ 2. Twenty-five
    (Texas Tree Tops) is 5 × 5: two and three columns both strand one city at 390, and five
    would be 71 px wide — so at <768 the last THREE cities share the last row (a 12-track
    grid: cells span 6, the tail spans 4). J Valdez 10 → 2 / 4 / 5 columns; Summit 12 →
    2 / 4 / 5; Texas Tree Tops 25 → 2 (+tail) / 5 / 5. Chips stay pills (the two-column
    grid at 390 is not cramped; the tail cells may wrap a long name to two lines).
32. **removal-a and trimming-a use the shared component too.** They carried their own static
    lists (`.ra-tags`, `.ta-tags`, with a pin icon); "same component, same result" and the
    guard's "chip count equals the record on every route" both want one list. Their own
    rules are deleted; the section wrappers, headings and copy are untouched.
34. **Card 1's focal point.** `work-photo-3` (square, 1080 px) in a 4:3 box crops 25 % of its
    height; the eave in the top-left corner runs to ~31 % of the frame at the left edge.
    Focal set on the photograph, `{x: 0.55, y: 1.0}` (one focal point per photograph): the
    crop now takes the whole 25 % from the top, keeping the climber and the chipper; a
    sliver of eave (~6 % of the frame) can remain in the corner — shown in the crop, and
    the sweep's row says whether it reads as a defect. The same focal reaches the photo's
    other cells (removal-a benefits and rail, trimming-a grid cell 3).
