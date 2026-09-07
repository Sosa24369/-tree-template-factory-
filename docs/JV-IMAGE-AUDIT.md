# J Valdez — image audit (Studio v3, Phase 1)

**Proposal only. Nothing here has been applied.** Each row is a change for the owner to
approve; the live-campaign gate will show the resulting diff on `/p/j-valdez/removal-a`
and `/p/j-valdez/trimming-a` before anything is uploaded.

## What is on record

Twelve photographs in one set, `photos.trimming`, every one **1080 × 1080** (square,
legacy imports, no focal points). J Valdez has no removal set, so `removal-a` draws the
same twelve through the fallback (removal → generic → storm → trimming). Three of the
templates are excluded (storm-*), so the twelve feed `removal-a/b/c`, `trimming-a/b/c`
and `agnostic`.

Measured against the contract (`docs/IMAGE-SPEC.md`):

| Finding | Count | Effect |
|---|---|---|
| Under the 1200 px tile minimum | 12 of 12 | every photo is upscaled on a retina screen; the removal-a plate (needs 1600) is drawn at 1440 CSS px from 1080 source pixels — 2.7× soft on a 2× display |
| Before/after composites (two frames in one square) | 4 of 12 (#1, #3, #4, #9) | every wide cover slot shows the seam between the frames instead of a photograph; the 1.3:1 gallery cells cut the BEFORE / AFTER labels in half |
| A phone number printed in the photograph | 2 of 12 (#2 truck, #7 yard sign) | **214-985-7697** is legible on both live pages. The record's tracked number is **+1 469 402 1196**. A caller who reads the truck dials an untracked line |
| No focal point on a cover-cropped photo | 12 of 12 | the browser crops to the centre in nine cover slots across the two live pages |

## Where each photo lands on the two live pages, and what the crop does

Positions are 1-based within the set. Slots and box sizes are the measured ones
(mobile / tablet / desktop, CSS px).

| # | Photo | What it shows | Live slots | What the crop does today | Proposal |
|---|---|---|---|---|---|
| 1 | hero-photo-1 | Two landscape frames stacked: a tidy lakeside garden, top and bottom | **removal-a hero plate** (tablet 820×1656, desktop 1440×1192, behind the headline) · removal-a mosaic cell 1 (desktop 1092×380) · removal-a rail · **trimming-a hero band** (348×148 / 360×248 / 530×248) | The plate shows both frames and the seam behind the headline on tablet and desktop. The hero band and the mosaic strip crop to the seam: half of one frame, half of the other. | **Replace.** Split into two photographs and re-upload the lower frame as the lead (it needs a 1600-wide original; the frame is 1080 × 540 today). Until then, focal **0.50, 0.74** so cover slots show the lower frame's centre instead of the seam. |
| 2 | hero-photo-2 | Chipper truck and crew at the kerb, dusk; the truck reads TRIMMING · REMOVAL · **214-985-7697** | removal-a proof 1 (350×160 / 361×262 / 537×280) · removal-a longform (portrait, 350×467) · removal-a mosaic cell 2 · **trimming-a hero band** 2 · trimming-a longform | Centre crops keep the truck. The portrait longform cell cuts the truck's left third. **The printed number is on the page.** | Focal **0.32, 0.47** (the truck and crew). Decide separately whether a photo carrying a non-tracked number belongs on an ad page; if it stays, keep it out of the proof and hero-band slots (move to position ≥ 8) so it renders small. |
| 3 | gallery-slide-1 | BEFORE / AFTER stacked, labelled, a driveway cleared | removal-a proof 2 · removal-a mosaic cell 3 · removal-a rail · **trimming-a gallery** (350×130 lead / 170×130 cells) | Proof 2 at 2.19:1 shows the seam. Gallery cells at 1.3:1 cut the labels. | **Split** into BEFORE and AFTER photographs (1080 × 540 each — needs originals). Until then, focal **0.50, 0.74** (the AFTER frame). |
| 4 | gallery-slide-2 | BEFORE / AFTER side by side, labelled, a shrub removed | removal-a mosaic cell 4 · rail · trimming-a gallery | 4:3 cells cut the top 12% — through the labels. | **Split.** Until then, focal **0.50, 0.46**. |
| 5 | gallery-slide-3 | Wide view: oaks, house, lake, mown verge | removal-a mosaic cell 5 · rail · trimming-a gallery | Fine at the centre. | Focal **0.50, 0.42**. Keep. |
| 6 | gallery-slide-4 | Path under trimmed oaks toward the lake | rail · trimming-a gallery | Fine. | Focal **0.50, 0.45**. Keep. |
| 7 | gallery-slide-5 | House, oaks, lawn; a yard sign bottom-right reading TREE TRIMMING · FREE ESTIMATE · **214-985-7697** | rail · trimming-a gallery | Fine at the centre; the sign is legible at 717 px. **The printed number is on the page.** | Focal **0.40, 0.42** (the house and canopy; the sign falls outside the tighter crops). Same decision as #2 on the number. |
| 8 | work-photo-1 | Bucket truck at full extension in a large oak | rail · **trimming-a grid** (304 / 320 / 268 square) | Squares from a square: no crop. | Focal **0.50, 0.45**. Keep. **When the set moves to 4:3 masters this becomes a crop; the focal point makes it the truck.** |
| 9 | work-photo-2 | Two frames side by side, unlabelled: a gravel bed before and after | rail · trimming-a grid | Whole photo in a square cell; two frames read as one busy image. | **Split** or drop; focal **0.50, 0.50** until then. |
| 10 | work-photo-3 | A tall tree with a climber near the top, chipper behind | rail · removal-a **service strip** 1 (348×150 / 736×190 / 343×190) | The 3.87:1 tablet strip keeps a quarter of the height: a band of foliage, no climber. | Focal **0.45, 0.40** (the climber). Keep. |
| 11 | work-photo-4 | Crew member with a pole saw under freshly pruned trees | rail · service strip 2 | The strip keeps the middle band: trunks and the saw, head cut off at 3.87:1. | Focal **0.55, 0.52**. Keep. |
| 12 | work-photo-5 | The fleet parked across a field, horizon mid-frame | rail · service strip 3 | The strip lands on the trucks. | Focal **0.50, 0.45**. Keep. |

The removal-a hero plate (#1) is behind the headline on tablet and desktop. Measured with
the template's own scrim: **12.6:1 tablet, 12.9:1 desktop** against the white headline
(target 4.5:1), so no extra scrim is needed for this image; the composite is a
composition problem, not a legibility one.

## What to ask J Valdez for

1. The **original files** for the twelve (phone originals are 3000–4000 px wide; these
   were downsized to 1080 on the way through GHL/Instagram). Every slot minimum is met by
   the originals alone.
2. The **before and after frames as separate photographs** for #1, #3, #4 and #9.
3. A decision on the **truck and yard-sign number** (214-985-7697 vs the tracked
   +1 469 402 1196). If those photos stay, they should not sit in the hero or proof slots.
4. **Twelve to sixteen more** trimming/removal photographs, landscape, one subject each,
   so removal-a stops borrowing the trimming set and the trimming-a grid and gallery are
   not the same twelve as the removal-a rail.

## Applying it

Each focal point is one click in the studio (open the photo → Frame → click the
subject → Use this framing) and one save; the changed pages then go through the
live-campaign gate at the next publish, which shows the `object-position` diff on both
live routes. Replacing a photograph is an upload through the same panel, which refuses
anything under the slot minimum with the number.
