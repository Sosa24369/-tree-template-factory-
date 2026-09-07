/**
 * THE IMAGE SLOT CONTRACT — every place a client image renders, declared once.
 *
 * Every number here was MEASURED, not read off the CSS: headless Chrome rendered the
 * built pages for Texas Tree Tops (removal, storm, agnostic) and J Valdez (trimming)
 * at three viewports — 390, 820 and 1440 CSS px, device scale 2 — scrolled every
 * deferred image into view, and read each image's rendered box, object-fit and
 * object-position (docs/BUILD-LOG.md, Studio v3 Phase 1). Re-measure with
 * scratch/measure-slots.mjs if a template's CSS changes.
 *
 * Three policies, because the templates crop in three different ways:
 *
 *   cover   The box is fixed by the CSS and the photo is cropped to fill it — the
 *           crop changes per breakpoint (removal-a's proof strip is 2.19:1 on a phone
 *           and 1.38:1 on a tablet). The FOCAL POINT drives `object-position`, so
 *           these slots need one: without it the browser crops to the centre and
 *           heads go missing.
 *   frame   The box takes the PHOTO's own shape (<DeferredImage> reserves an
 *           aspect-ratio box from the record's width/height) and the whole photo
 *           shows. Nothing is cropped — but a grid of these is only even when every
 *           photo in the set has the same shape, which is why the pipeline makes
 *           4:3 masters. Storm's tile grid on Texas Tree Tops mixes 4:3, 3:4 and 1:1
 *           cells today for exactly this reason.
 *   contain The logo. Never cropped: the pipeline trims transparent padding and
 *           fits the mark into a square canvas on a transparent background.
 *   plate   A decorative background under an 84–94% tint (removal-a's five section
 *           plates). Cover-cropped, but veiled so heavily that a focal point is
 *           optional; texture reads, detail does not.
 *
 * Photo sets, not slots, are what a client uploads: photos.removal / .trimming /
 * .storm / .generic. A template picks from the set for its service by INDEX (the
 * first removal photo is removal-a's hero plate; the last three are its service
 * strip), so reordering a set re-slots the photos. When a client has no photos for
 * a service, lib/photos.ts falls back within the client: removal → generic → storm →
 * trimming, and so on. It never falls back to another client's photographs, and
 * never to template artwork.
 *
 * Data only. Imported by the studio (the Frame dialog, the readiness checklist, the
 * three-crop preview), by scripts/verify-image-spec.mjs (the publish guard) and by
 * scripts/generate-image-spec.mjs (docs/IMAGE-SPEC.md). The public bundle never
 * imports it.
 */

/** The viewports the numbers were measured at, in CSS px. */
export const BREAKPOINTS = [
  { id: 'mobile', label: 'Mobile', viewport: 390 },
  { id: 'tablet', label: 'Tablet', viewport: 820 },
  { id: 'desktop', label: 'Desktop', viewport: 1440 },
];

/**
 * What to upload. One master per photo, 4:3, and the pipeline emits every rendered
 * width from it (400 / 800 / 1200 / 1600). Minimums are set by the largest box a
 * photo can land in at 2× device pixels: a 4:3 tile renders up to 1094 CSS px wide
 * (removal-b's masonry on desktop), so 1200 is the floor for a tile; removal-a's
 * hero plate is 1440 CSS px wide, so the removal set's first photo needs 1600.
 */
export const MASTERS = {
  photo: { aspect: [4, 3], recommended: [1600, 1200], min: [1200, 900], why: 'the largest 4:3 tile renders 1094 px wide on desktop; below 1200 it is upscaled on a retina screen' },
  heroPlate: { aspect: [4, 3], recommended: [2000, 1500], min: [1600, 1200], why: 'removal-a paints it 1440 px wide behind the headline on desktop (and 1656 px tall on a tablet); the pipeline caps masters at 1600, so 1600 is the floor' },
  logo: { recommended: 'SVG, or a transparent PNG 512 px or more on its longest edge', min: 192, why: 'the header shows it at 96 px, so 192 px is the 2× floor; smaller is never upscaled and looks soft' },
  art: { aspect: [16, 9], recommended: [1600, 900], min: [1200, 675], why: 'painted full-width (1440 px) under an 84–94% tint; the marquee strip is 1180 × 62' },
};

/**
 * @typedef {'cover'|'frame'|'contain'|'plate'} Policy
 * @typedef {{ template: string, id: string, label: string, section: string, element: string,
 *   source: { set: 'removal'|'trimming'|'storm'|'generic'|'logo'|'art', pick: string },
 *   policy: Policy, focal: 'required'|'optional'|'none', master: keyof typeof MASTERS,
 *   renders: { mobile: [number, number][] | null, tablet: [number, number][] | null, desktop: [number, number][] | null },
 *   legibility?: boolean, notes?: string }} ImageSlot
 */

/** Logo slots are the same on every template; listed once, applied to all ten. */
export const SHARED_SLOTS = [
  {
    template: '*', id: 'logo-header', label: 'Header logo', section: 'Header', element: '.hdbrand-logo',
    source: { set: 'logo', pick: 'brand.logoUrl' }, policy: 'contain', focal: 'none', master: 'logo',
    renders: { mobile: [[64, 64]], tablet: [[96, 96]], desktop: [[96, 96]] },
    notes: 'The mobile LCP element on the text-hero templates. One 192 × 192 webp on a transparent background, no srcset (React SSR would preload a file the browser then ignores). Sits on the header paper (light) on nine templates and on ink (dark) on storm — the studio checks its contrast against both.',
  },
  {
    template: '*', id: 'logo-footer', label: 'Footer logo', section: 'Footer', element: '.ra-footer-logo · .rb-footer-logo · .st-footer-logo · .ta-footer-logo · .tb-footer-logo',
    source: { set: 'logo', pick: 'brand.logoUrl' }, policy: 'contain', focal: 'none', master: 'logo',
    renders: { mobile: [[52, 52]], tablet: [[52, 52]], desktop: [[52, 52]] },
    notes: 'Same file as the header. 52 px on removal-a and trimming-a, 50 on removal-b, 40 on storm, 34 on trimming-b; the hybrids and agnostic render the name as text.',
  },
];

/** @type {ImageSlot[]} */
export const IMAGE_SLOTS = [
  /* ---------------------------------------------------------------- removal-a */
  {
    template: 'removal-a', id: 'hero-plate', label: 'Hero plate — the photograph behind the headline and the form', section: 'Hero + form', element: '.ra-hero-plate-img',
    source: { set: 'removal', pick: 'first' }, policy: 'cover', focal: 'required', master: 'heroPlate', legibility: true,
    renders: { mobile: null, tablet: [[820, 1656]], desktop: [[1440, 1192]] },
    notes: 'Not painted on a phone: mobile leads with the brand colour (a 412 × 1586 plate decoded too late to be the LCP). On a tablet it is a 1:2 portrait crop of the master; on desktop 1.2:1. The headline sits on it — see the legibility check.',
  },
  {
    template: 'removal-a', id: 'hero-proof', label: 'Hero proof strip — two photographs under the form', section: 'Hero + form', element: '.ra-hero-proof-img',
    source: { set: 'removal', pick: '2nd and 3rd' }, policy: 'cover', focal: 'required', master: 'photo',
    renders: { mobile: [[350, 160], [350, 160]], tablet: [[361, 262], [361, 262]], desktop: [[537, 280], [537, 280]] },
    notes: 'The crop swings from 2.19:1 (phone) to 1.38:1 (tablet) to 1.92:1 (desktop). A stacked before/after composite here shows only the seam.',
  },
  {
    template: 'removal-a', id: 'mosaic', label: 'Results grid mosaic', section: 'Results grid', element: '.ra-mosaic-img',
    source: { set: 'generic', pick: 'first 5 (or the removal set when there is no generic set)' }, policy: 'cover', focal: 'required', master: 'photo',
    renders: { mobile: [[170, 128], [170, 128], [170, 128], [170, 128], [350, 263]], tablet: [[239, 179], [239, 179], [239, 179], [239, 179], [489, 366]], desktop: [[1092, 380], [1092, 380], [725, 543], [725, 543], [725, 543]] },
    notes: '4:3 cells on phone and tablet; on desktop the first two cells are 2.87:1 strips, which keep only the middle third of a 4:3 master.',
  },
  {
    template: 'removal-a', id: 'longform', label: 'Services blurb — side photograph', section: 'Services blurb', element: '.ra-longform-photo-img',
    source: { set: 'removal', pick: '2nd' }, policy: 'frame', focal: 'optional', master: 'photo',
    renders: { mobile: [[350, 467]], tablet: [[738, 985]], desktop: [[445, 595]] },
    notes: 'Measured with a 3:4 photograph; the box takes the master\'s shape, so a 4:3 master renders 350 × 263 on a phone.',
  },
  {
    template: 'removal-a', id: 'rail', label: 'Recent jobs rail', section: 'Recent jobs', element: '.ra-rail-img',
    source: { set: 'removal', pick: 'all' }, policy: 'frame', focal: 'none', master: 'photo',
    renders: { mobile: [[253, 190]], tablet: [[427, 320]], desktop: [[427, 320]] },
    notes: 'A filmstrip at a fixed height (190 px on a phone, 320 px above); each photo keeps its own width. Mixed shapes are acceptable here and nowhere else.',
  },
  {
    template: 'removal-a', id: 'service-photo', label: 'Services list — column headers', section: 'Services list', element: '.ra-service-photo',
    source: { set: 'removal', pick: 'last 3' }, policy: 'cover', focal: 'required', master: 'photo',
    renders: { mobile: [[348, 150]], tablet: [[736, 190]], desktop: [[343, 190]] },
    notes: 'The most aggressive crop on any template: 3.87:1 on a tablet keeps a quarter of a 4:3 master\'s height. Put the focal point on the thing that must survive.',
  },
  {
    template: 'removal-a', id: 'art-why', label: 'Why choose us — background plate', section: 'Why choose us + reviews', element: '.ra-section (why)',
    source: { set: 'art', pick: 'sectionArt.removal-a.why' }, policy: 'plate', focal: 'optional', master: 'art',
    renders: { mobile: [[390, 896]], tablet: [[820, 809]], desktop: [[1440, 994]] },
    notes: 'Veiled ~90% by a light scrim.',
  },
  {
    template: 'removal-a', id: 'art-services', label: 'Services list — background plate', section: 'Services list', element: '.ra-section (services)',
    source: { set: 'art', pick: 'sectionArt.removal-a.services' }, policy: 'plate', focal: 'optional', master: 'art',
    renders: { mobile: [[390, 1932]], tablet: [[820, 2753]], desktop: [[1440, 1079]] },
    notes: 'Veiled ~92% by a light scrim.',
  },
  {
    template: 'removal-a', id: 'art-marquee', label: 'Service-area marquee strip', section: 'Service areas', element: '.ra-marquee',
    source: { set: 'art', pick: 'sectionArt.removal-a.marquee' }, policy: 'plate', focal: 'optional', master: 'art',
    renders: { mobile: [[390, 62]], tablet: [[820, 62]], desktop: [[1180, 62]] },
    notes: 'A 62 px strip, unveiled and edge-masked — the only plate where the photo is really visible. Keep it low-contrast or the city names get lost.',
  },
  {
    template: 'removal-a', id: 'art-ready', label: 'Mid-page CTA — background plate', section: 'Mid-page CTA', element: '.ra-ready',
    source: { set: 'art', pick: 'sectionArt.removal-a.ready' }, policy: 'plate', focal: 'optional', master: 'art',
    renders: { mobile: [[390, 240]], tablet: [[820, 244]], desktop: [[1440, 318]] },
    notes: 'Veiled ~87% by a dark scrim; white text on top.',
  },
  {
    template: 'removal-a', id: 'art-final', label: 'Final CTA — background plate', section: 'Final CTA', element: '.ra-final',
    source: { set: 'art', pick: 'sectionArt.removal-a.final' }, policy: 'plate', focal: 'optional', master: 'art',
    renders: { mobile: [[390, 430]], tablet: [[820, 403]], desktop: [[1440, 519]] },
    notes: 'Veiled ~89% by a dark scrim; white text on top.',
  },

  /* ---------------------------------------------------------------- removal-b */
  {
    template: 'removal-b', id: 'hero-wash', label: 'Hero — faint photograph washed over the right half (desktop only)', section: 'Hero', element: '.rb-hero::after',
    source: { set: 'removal', pick: 'first' }, policy: 'plate', focal: 'optional', master: 'photo',
    renders: { mobile: null, tablet: null, desktop: [[720, 1505]] },
    notes: 'Painted at 14% opacity under a left-to-right mask, only inside the (min-width: 980px) query, so a phone never downloads it. The headline is in the left half and never sits on it. The focal point becomes background-position.',
  },
  {
    template: 'removal-b', id: 'tile', label: 'Recent work — masonry tiles', section: 'Recent work', element: '.rb-tile-img',
    source: { set: 'removal', pick: 'first 6' }, policy: 'frame', focal: 'none', master: 'photo',
    renders: { mobile: [[170, 128]], tablet: [[239, 179]], desktop: [[726, 545], [726, 545], [726, 545], [1094, 821], [1094, 821], [368, 276]] },
    notes: 'Every tile takes the master\'s shape; the desktop masonry gives two tiles 1094 px of width, which is why the tile floor is 1200.',
  },
  {
    template: 'removal-b', id: 'scope', label: 'Scope — side photograph', section: 'Scope', element: '.rb-scope-photo-img',
    source: { set: 'removal', pick: '2nd' }, policy: 'frame', focal: 'optional', master: 'photo',
    renders: { mobile: [[350, 467]], tablet: [[738, 985]], desktop: [[451, 601]] },
    notes: 'Measured with a 3:4 photograph; a 4:3 master renders 350 × 263 on a phone.',
  },

  /* ---------------------------------------------------------------- removal-c */
  {
    template: 'removal-c', id: 'hero-wash', label: 'Hero — faint photograph washed over the right 42% (desktop only)', section: 'Hero', element: '.rc-hero::after',
    source: { set: 'removal', pick: 'first' }, policy: 'plate', focal: 'none', master: 'photo',
    renders: { mobile: null, tablet: null, desktop: [[605, 937]] },
    notes: '16% opacity, masked, desktop only, centred — the hybrid has no focal variable. The headline never sits on it.',
  },
  {
    template: 'removal-c', id: 'work', label: 'Work grid', section: 'Work', element: '.rc-work-img',
    source: { set: 'removal', pick: 'first 9' }, policy: 'frame', focal: 'none', master: 'photo',
    renders: { mobile: [[171, 128]], tablet: [[364, 273]], desktop: [[364, 273]] },
    notes: 'Two columns of frame cells. On Texas Tree Tops today six of the nine cells are 3:4 and three are 4:3 because the photos are; uniform masters make a uniform grid.',
  },
  {
    template: 'removal-c', id: 'longform', label: 'Services blurb — side photograph', section: 'Services blurb', element: '.rc-longform-photo-img',
    source: { set: 'removal', pick: '2nd' }, policy: 'frame', focal: 'optional', master: 'photo',
    renders: { mobile: [[351, 469]], tablet: [[738, 985]], desktop: [[454, 606]] },
  },

  /* ---------------------------------------------------------------- storm-a / storm-b / storm-c */
  ...['storm-a', 'storm-b', 'storm-c'].flatMap((template) => [
    {
      template, id: 'hero-wash', label: 'Hero — faint photograph washed over the right half (desktop only)', section: 'Hero', element: '.st-hero::after',
      source: { set: 'storm', pick: 'first (falls back to the removal set, never to trimming)' }, policy: 'plate', focal: 'optional', master: 'photo',
      renders: { mobile: null, tablet: null, desktop: [[720, template === 'storm-c' ? 1255 : 1167]] },
      notes: '14% opacity, masked, desktop only. The focal point becomes background-position. The headline is in the left half.',
    },
    {
      template, id: 'tile', label: 'Work tiles', section: 'Work', element: '.st-tile-img',
      source: { set: 'storm', pick: 'first 6' }, policy: 'frame', focal: 'none', master: 'photo',
      renders: { mobile: [[171, 128]], tablet: [[240, 180]], desktop: [[340, 255]] },
      notes: 'Frame cells at 171 / 240 / 340 px wide. Texas Tree Tops\' grid today mixes 4:3, 3:4 and 1:1 cells (800 × 600, 382 × 510 and 1200 × 1200 photos).',
    },
    {
      template, id: 'handle', label: 'What we handle — side photograph', section: 'What we handle', element: '.st-handle-photo-img',
      source: { set: 'storm', pick: 'the photo after the tiles (7th), or the last' }, policy: 'frame', focal: 'optional', master: 'photo',
      renders: { mobile: [[351, 263]], tablet: [[740, 555]], desktop: [[400, 300]] },
      notes: 'Measured with a square photograph (351 × 351); a 4:3 master renders 351 × 263 on a phone.',
    },
  ]),

  /* ---------------------------------------------------------------- trimming-a */
  {
    template: 'trimming-a', id: 'hero-band', label: 'Hero — two-up photo band closing the hero', section: 'Hero', element: '.ta-shot-img (hero)',
    source: { set: 'trimming', pick: 'first 2' }, policy: 'cover', focal: 'required', master: 'photo',
    renders: { mobile: [[348, 148], [348, 148]], tablet: [[360, 248], [360, 248]], desktop: [[530, 248], [530, 248]] },
    notes: '2.35:1 on a phone, 1.45:1 on a tablet, 2.14:1 on desktop. A square or a stacked composite is cut through the middle here.',
  },
  {
    template: 'trimming-a', id: 'gallery', label: 'Before/after gallery rail', section: 'Gallery', element: '.ta-shot-img (gallery)',
    source: { set: 'trimming', pick: 'the middle share after the hero takes 2 (with 12 photos: 5)' }, policy: 'cover', focal: 'required', master: 'photo',
    renders: { mobile: [[350, 130], [170, 130]], tablet: [[490, 230], [240, 230]], desktop: [[717, 537], [353, 230]] },
    notes: 'A lead cell plus a row of 1.3:1 / 1.53:1 cells; the lead is 4:3 on desktop. Before/after labels at the top edge of a square are cut off in the small cells.',
  },
  {
    template: 'trimming-a', id: 'grid', label: '"Done clean, done right" grid', section: 'Done right', element: '.ta-shot-img (grid)',
    source: { set: 'trimming', pick: 'the rest (with 12 photos: the last 5)' }, policy: 'cover', focal: 'required', master: 'photo',
    renders: { mobile: [[304, 304]], tablet: [[320, 320]], desktop: [[268, 268]] },
    notes: 'Square cells: a 4:3 master loses a quarter of its width. With fewer than 8 photos this grid is empty and the section keeps its copy.',
  },
  {
    template: 'trimming-a', id: 'longform', label: 'Longform — side photograph', section: 'Longform', element: '.ta-longform-photo-img',
    source: { set: 'trimming', pick: '2nd' }, policy: 'frame', focal: 'optional', master: 'photo',
    renders: { mobile: [[350, 263]], tablet: [[740, 555]], desktop: [[440, 330]] },
    notes: 'Measured with a square photograph (350 × 350); a 4:3 master renders 350 × 263 on a phone.',
  },

  /* ---------------------------------------------------------------- trimming-b */
  {
    template: 'trimming-b', id: 'work', label: 'Work — multi-column photographs', section: 'Work', element: '.tb-work-img',
    source: { set: 'trimming', pick: 'first 6' }, policy: 'frame', focal: 'none', master: 'photo',
    renders: { mobile: [[167, 125]], tablet: [[234, 176]], desktop: [[316, 237]] },
    notes: 'Measured with square photographs (167 × 167 …); a 4:3 master renders 167 × 125 on a phone.',
  },
  {
    template: 'trimming-b', id: 'standard', label: 'Standard — side photograph', section: 'Standard', element: '.tb-standard-photo-img',
    source: { set: 'trimming', pick: '2nd' }, policy: 'frame', focal: 'optional', master: 'photo',
    renders: { mobile: [[343, 257]], tablet: [[722, 542]], desktop: [[393, 295]] },
    notes: 'Measured with a square photograph; 4:3 figures shown.',
  },

  /* ---------------------------------------------------------------- trimming-c */
  {
    template: 'trimming-c', id: 'work', label: 'Work grid', section: 'Work', element: '.tc-work-img',
    source: { set: 'trimming', pick: 'first 8' }, policy: 'frame', focal: 'none', master: 'photo',
    renders: { mobile: [[171, 128]], tablet: [[364, 273]], desktop: [[266, 200]] },
    notes: 'Measured with square photographs (171 × 171 …); 4:3 figures shown.',
  },
  {
    template: 'trimming-c', id: 'longform', label: 'Longform — side photograph', section: 'Longform', element: '.tc-longform-photo-img',
    source: { set: 'trimming', pick: '2nd' }, policy: 'frame', focal: 'optional', master: 'photo',
    renders: { mobile: [[351, 263]], tablet: [[738, 554]], desktop: [[445, 334]] },
    notes: 'Measured with a square photograph; 4:3 figures shown.',
  },

  /* ---------------------------------------------------------------- agnostic */
  {
    template: 'agnostic', id: 'shot', label: 'Gallery tiles', section: 'Gallery', element: '.ag-shot-img',
    source: { set: 'generic', pick: 'all (falls back to removal, then trimming, then storm)' }, policy: 'cover', focal: 'required', master: 'photo',
    renders: { mobile: [[170, 128]], tablet: [[240, 180]], desktop: [[340, 255]] },
    notes: 'The one grid with CSS-fixed 4:3 boxes: every photo is cover-cropped to 4:3 regardless of its shape. Measured at 23 tiles on Texas Tree Tops with mixed photographs, every cell 4:3.',
  },
];

/** The minimum width, in px, for a master kind (logos: longest edge). */
export function minWidth(master) {
  const m = MASTERS[master]?.min;
  return Array.isArray(m) ? m[0] : Number(m) || 0;
}

/**
 * The position of a photo AMONG THE STILLS of its set, which is what the templates
 * slot by (partitionMedia drops videos before any slicing). -1 for a video.
 */
export function stillIndex(list, i) {
  if (!Array.isArray(list) || !list[i] || list[i].kind === 'video') return -1;
  let n = 0;
  for (let k = 0; k < i; k++) if (list[k] && list[k].kind !== 'video') n++;
  return n;
}
export const stillCount = (list) => (Array.isArray(list) ? list.filter((p) => p && p.kind !== 'video').length : 0);

/** The slots one photo lands in, given its set and its index among the stills — for the Frame dialog. */
export function slotsForPhoto(set, index, count) {
  if (index < 0) return [];
  const out = [];
  for (const s of IMAGE_SLOTS) {
    if (s.source.set !== set) continue;
    const pick = s.source.pick;
    let hit = false;
    if (/^first$/.test(pick)) hit = index === 0;
    else if (/^first (\d+)/.test(pick)) hit = index < Number(pick.match(/^first (\d+)/)[1]);
    else if (/^2nd$/.test(pick)) hit = index === 1;
    else if (/^2nd and 3rd/.test(pick)) hit = index === 1 || index === 2;
    else if (/^last 3/.test(pick)) hit = index >= Math.max(0, count - 3);
    else if (/^all/.test(pick)) hit = true;
    else if (/^the middle share/.test(pick)) { const rest = count - 2; const half = rest >= 6 ? Math.ceil(rest / 2) : rest; hit = index >= 2 && index < 2 + half; }
    else if (/^the rest/.test(pick)) { const rest = count - 2; const half = rest >= 6 ? Math.ceil(rest / 2) : rest; hit = rest >= 6 && index >= 2 + half; }
    else if (/^the photo after the tiles/.test(pick)) hit = index === Math.min(6, count - 1);
    if (hit) out.push(s);
  }
  return out;
}

/** Slot lookup. */
export function slotById(template, id) {
  return IMAGE_SLOTS.find((s) => s.template === template && s.id === id) ?? null;
}
