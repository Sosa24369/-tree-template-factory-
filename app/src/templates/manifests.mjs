/**
 * SECTION MANIFESTS — one per template, in document order. Data only.
 *
 * Plain JS with no component imports, so it can be read by resolve.ts (to compute
 * resolvedLayout for every template) AND by scripts/verify-layout-lock.mjs in Node,
 * without either creating an import cycle back into the React tree.
 *
 * Rules:
 *  - Order here IS the default render order. It must match the JSX order each
 *    template had before layout became data, or the P0 byte-identical proof fails.
 *  - `required: true` sections (header, footer, the sticky call bar) can never be
 *    hidden or moved. The editor renders them pinned.
 *  - `defaultSize` is what a section renders at when the client sets nothing. In P0
 *    no section emits a size class for its default, so output is unchanged.
 */

const S = (id, label, defaultSize = 'M', required = false) => ({ id, label, required, defaultSize });
const HEADER = S('header', 'Header', 'M', true);
const FOOTER = S('footer', 'Footer', 'M', true);
const STICKY = S('sticky', 'Sticky call bar', 'M', true);

export const MANIFESTS = Object.freeze({
  'removal-a': Object.freeze([
    HEADER,
    S('hero', 'Hero + form', 'L'),
    S('benefits', 'Offer band'),
    S('why-choose', 'Why choose us + reviews'),
    S('restoration', 'Results grid'),
    S('longform', 'Services blurb'),
    S('areas', 'Service areas'),
    S('process', 'How it works'),
    S('gallery', 'Recent jobs'),
    S('services', 'Services list'),
    S('mid-cta', 'Mid-page CTA'),
    S('faq', 'FAQ'),
    S('final-cta', 'Final CTA'),
    FOOTER,
    STICKY,
  ]),
  'removal-b': Object.freeze([
    HEADER,
    S('hero', 'Hero + estimate panel', 'L'),
    S('trust-bar', 'Trust bar'),
    S('proof', 'Proof'),
    S('work', 'Work'),
    S('scope', 'Scope'),
    S('areas', 'Service areas'),
    S('process', 'How it works'),
    S('signals', 'Signals'),
    S('faq', 'FAQ'),
    S('final-cta', 'Final CTA'),
    FOOTER,
    STICKY,
  ]),
  'removal-c': Object.freeze([
    HEADER,
    S('hero', 'Hero', 'L'),
    S('benefits', 'Offer band'),
    S('why', 'Why choose us + reviews'),
    S('restoration', 'Results grid'),
    S('longform', 'Services blurb'),
    S('areas', 'Service areas'),
    S('process', 'How it works'),
    S('services', 'Services'),
    S('near', 'Mid-page CTA'),
    S('ready', 'Ready band'),
    S('faq', 'FAQ'),
    S('final', 'Final CTA'),
    FOOTER,
    STICKY,
  ]),
  'trimming-a': Object.freeze([
    HEADER,
    S('hero', 'Hero + form', 'L'),
    S('benefits', 'Offer band'),
    S('why-choose', 'Why choose us + reviews'),
    S('done-right', 'Done right grid'),
    S('longform', 'Services blurb'),
    S('areas', 'Service areas'),
    S('process', 'How it works'),
    S('gallery', 'Recent jobs'),
    S('services', 'Services list'),
    S('mid-cta', 'Mid-page CTA'),
    S('faq', 'FAQ'),
    S('final-cta', 'Final CTA'),
    FOOTER,
    STICKY,
  ]),
  'trimming-b': Object.freeze([
    HEADER,
    S('hero', 'Hero + estimate panel', 'L'),
    S('offer', 'Offer'),
    S('reviews', 'Reviews'),
    S('work', 'Work'),
    S('standard', 'The standard'),
    S('areas', 'Service areas'),
    S('testimony', 'Testimony'),
    S('restraint', 'Restraint'),
    S('faq', 'FAQ'),
    FOOTER,
    STICKY,
  ]),
  'trimming-c': Object.freeze([
    HEADER,
    S('hero', 'Hero', 'L'),
    S('benefits', 'Offer band'),
    S('why', 'Why choose us + reviews'),
    S('done-right', 'Done right grid'),
    S('longform', 'Services blurb'),
    S('areas', 'Service areas'),
    S('process', 'How it works'),
    S('services', 'Services'),
    S('mid', 'Mid-page CTA'),
    S('ready', 'Ready band'),
    S('faq', 'FAQ'),
    S('final', 'Final CTA'),
    FOOTER,
    STICKY,
  ]),
  // All three storm templates render the shared StormPage tree, so they share one
  // manifest. storm-a is the control and is locked by id (isControlTemplate).
  'storm-a': Object.freeze([
    HEADER,
    S('hero', 'Hero + estimate panel', 'L'),
    S('trust', 'Trust band'),
    S('reviews', 'Reviews'),
    S('work', 'Results grid'),
    S('handle', 'What we handle'),
    S('areas', 'Service areas'),
    S('process', 'How storm response works'),
    S('insurance', 'Insurance'),
    S('faq', 'FAQ'),
    S('final-cta', 'Final CTA'),
    FOOTER,
    STICKY,
  ]),
  get 'storm-b'() { return this['storm-a']; },
  get 'storm-c'() { return this['storm-a']; },
  agnostic: Object.freeze([
    HEADER,
    S('hero', 'Hero + form', 'L'),
    S('trust', 'Trust row'),
    S('reviews', 'Reviews'),
    S('gallery', 'Gallery'),
    S('services', 'Services'),
    S('areas', 'Service areas'),
    S('faq', 'FAQ'),
    S('final-cta', 'Final CTA'),
    FOOTER,
    STICKY,
  ]),
});

export const TEMPLATE_IDS_WITH_MANIFEST = Object.freeze(Object.keys(MANIFESTS));
