# Texas Tree Tops storm-a — page 4 scope (against docs/batch-four-pages/four-page-spec.md)

Status: DRAFT written before page 4 begins. ⏳ = measured before building. PROTECTED page,
and the only one that has carried spend (the storm removal campaign, paused now — owner,
2026-09-16). Root classes `storm storm-a`; section order hero, trust, reviews, work, handle,
areas, process, insurance, faq, final-cta.

## T6 — S1, 5 of 9 reviews cut off
Already applied: the scoped slider rule in `styles/reviews-slider.css` targets `.storm` —
whole cards 1/2/3 per view, no clamp, no stretch. No reviews button on this template (the
spec's S1 is layout; the button was trimming-a/removal-a's item). ⏳ measure on live
(cut count, partial card) and on the build (0 cut, whole cards); before/after `.st-reviews`
(or whichever section wraps `.rvs`).

## T7 — S2, 50 chips for 25 cities in a masked ticker whose first item can't be reached
`components/ServiceAreasCarousel.tsx` renders the city list twice (`row(false)` +
`row(true)` with `aria-hidden`) inside `.sac-track`, animated by `sac-marquee` and edge-masked
(`styles/service-areas-carousel.css`). Fix once, as the owner ruled: one static, wrapped,
unmasked list, each city once, first item reachable at every width, no animation. The
component is shared by storm-a, agnostic, removal-b, trimming-b, removal-c and trimming-c —
so the same change reaches those pages for all three clients (Summit's storm-b/-c too).
⏳ before: chip count 50/25 and first-item reachability at 390/820/1440 on live.

## No S3
The work grid (`.st-tile-img`, six cells) closes cleanly on live. The storm photo set on
the Mac is 800×600 — under the 1200 minimum; any storm photo would fit only a cell ≤800 px
wide. ⏳ measure the six tile boxes; if the largest is >800 at any width, no storm photo
from that set can go in and the report says what to ask Texas Tree Tops for (originals
≥1600 px of storm work: tree on a roof/fence/car, uprooted, crews).

## Evidence to produce
before/after for the reviews section and `.st-areas` at 390/820/1440; compare / guards /
criterion 8 (on every page the carousel change reaches) / Lighthouse before+after / diff /
bundle in this folder. No crops (no photo changes).
