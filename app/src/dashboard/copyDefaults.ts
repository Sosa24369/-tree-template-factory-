/**
 * Every template's shipped copy, for the studio's copy editor.
 *
 * Imported straight from the ten copy.defaults modules rather than from
 * templates/registry.tsx, which is the same data but drags in every template
 * component and stylesheet. The studio needs the strings, not the pages.
 *
 * WHAT THIS BUYS: the copy editor can list EVERY copy key a template ships — headline,
 * body, button label, offer band, process step, FAQ, footer line — next to its default
 * and this client's override. Before this, a copy override could only be added by
 * someone who already knew the key (`hero.h1b`), or by clicking a leaf text node in the
 * preview, which cannot reach copy rendered inside a larger mixed-content element.
 */

import removalA from '../templates/removal-a/copy.defaults';
import removalB from '../templates/removal-b/copy.defaults';
import { removalCCopy } from '../templates/removal-c/copy.defaults';
import trimmingA from '../templates/trimming-a/copy.defaults';
import trimmingB from '../templates/trimming-b/copy.defaults';
import { trimmingCCopy } from '../templates/trimming-c/copy.defaults';
import stormA from '../templates/storm-a/copy.defaults';
import stormB from '../templates/storm-b/copy.defaults';
import { stormCCopy } from '../templates/storm-c/copy.defaults';
import agnostic from '../templates/agnostic/copy.defaults';
import type { TemplateId } from '../schema/client';

export const COPY_DEFAULTS: Record<TemplateId, Record<string, string>> = {
  'removal-a': removalA,
  'removal-b': removalB,
  'removal-c': removalCCopy,
  'trimming-a': trimmingA,
  'trimming-b': trimmingB,
  'trimming-c': trimmingCCopy,
  'storm-a': stormA,
  'storm-b': stormB,
  'storm-c': stormCCopy,
  agnostic,
};

/**
 * The -c hybrids render their control's copy object and inherit the control's
 * per-client overrides (makeCopy's `inheritOverridesFrom`). So an override typed
 * against removal-a ALSO changes removal-c, and the copy editor has to say so —
 * otherwise someone edits the control's headline to fix the hybrid and silently
 * moves the A/B test's constant.
 */
export const INHERITS_OVERRIDES_FROM: Partial<Record<TemplateId, TemplateId>> = {
  'removal-c': 'removal-a',
  'trimming-c': 'trimming-a',
  'storm-c': 'storm-a',
};

/**
 * Human grouping for the key namespace, in page order. A key's group is the part
 * before its first dot; anything unrecognised falls into "Other" rather than being
 * hidden, so a new template key is editable the moment it ships.
 */
export const COPY_GROUPS: { prefix: string; label: string }[] = [
  { prefix: 'meta', label: 'Page title & meta description' },
  { prefix: 'header', label: 'Header bar' },
  { prefix: 'ratingBadge', label: 'Rating badge' },
  { prefix: 'hero', label: 'Hero' },
  { prefix: 'form', label: 'Lead form labels' },
  { prefix: 'estimate', label: 'Estimate form block' },
  { prefix: 'benefits', label: 'Offer band / benefits' },
  { prefix: 'offer', label: 'Offer band' },
  { prefix: 'trust', label: 'Trust strip' },
  { prefix: 'proof', label: 'Proof & stats' },
  { prefix: 'why', label: 'Why choose us' },
  { prefix: 'reviews', label: 'Reviews block' },
  { prefix: 'restoration', label: 'Results' },
  { prefix: 'gallery', label: 'Gallery' },
  { prefix: 'work', label: 'Work' },
  { prefix: 'services', label: 'Services' },
  { prefix: 'scope', label: 'Scope' },
  { prefix: 'standard', label: 'Standard' },
  { prefix: 'handle', label: 'What we handle' },
  { prefix: 'longform', label: 'Long-form copy' },
  { prefix: 'areas', label: 'Service areas' },
  { prefix: 'process', label: 'Process steps' },
  { prefix: 'midCta', label: 'Mid-page CTA' },
  { prefix: 'faq', label: 'FAQ' },
  { prefix: 'finalCta', label: 'Final CTA' },
  { prefix: 'cta', label: 'Call-to-action labels' },
  { prefix: 'footer', label: 'Footer' },
  { prefix: 'sticky', label: 'Sticky bar' },
];

export function groupFor(key: string): string {
  const prefix = key.split('.')[0];
  return COPY_GROUPS.find((g) => g.prefix === prefix)?.label ?? 'Other';
}

/** Every key a template ships, in the order the copy file declares them. */
export function keysFor(templateId: TemplateId): string[] {
  return Object.keys(COPY_DEFAULTS[templateId] ?? {});
}
