/**
 * TEMPLATE METADATA — id, label, service, variant, built.
 *
 * Data only, in its own module on purpose. registry.tsx re-exports it, but registry
 * imports every template component (and therefore every template stylesheet), so
 * anything that only needs to KNOW the ten templates — the studio's copy editor, its
 * template picker, scripts/generate-lead-registry.mjs — imports this instead and
 * pulls in no CSS.
 *
 * This is also the ONE source of truth the lead Function's known-template list is
 * derived from at build time, which is what stops an arbitrary templateId from being
 * reflected into a GHL tag.
 */

import type { TemplateId } from '../schema/client';

export interface TemplateMeta {
  id: TemplateId;
  label: string;
  service: 'removal' | 'trimming' | 'storm' | 'agnostic';
  /** hybrid = the -c pages: the control's exact copy in the variant's design
   *  direction, executed premium (Design Elevation 2026-08-12). */
  variant: 'control' | 'variant' | 'hybrid' | 'blank';
  built: boolean;
}

export const TEMPLATE_META: TemplateMeta[] = [
  { id: 'removal-a', label: 'Tree Removal — Control', service: 'removal', variant: 'control', built: true },
  { id: 'removal-b', label: 'Tree Removal — Variant', service: 'removal', variant: 'variant', built: true },
  { id: 'removal-c', label: 'Tree Removal — Hybrid', service: 'removal', variant: 'hybrid', built: true },
  { id: 'trimming-a', label: 'Tree Trimming — Control', service: 'trimming', variant: 'control', built: true },
  { id: 'trimming-b', label: 'Tree Trimming — Variant', service: 'trimming', variant: 'variant', built: true },
  { id: 'trimming-c', label: 'Tree Trimming — Hybrid', service: 'trimming', variant: 'hybrid', built: true },
  { id: 'storm-a', label: 'Storm Damage — Control', service: 'storm', variant: 'control', built: true },
  { id: 'storm-b', label: 'Storm Damage — Variant', service: 'storm', variant: 'variant', built: true },
  { id: 'storm-c', label: 'Storm Damage — Hybrid', service: 'storm', variant: 'hybrid', built: true },
  { id: 'agnostic', label: 'Service-Agnostic — Blank', service: 'agnostic', variant: 'blank', built: true },
];
