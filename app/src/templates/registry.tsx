/**
 * Template registry — the render layer's dispatch table.
 *
 * All seven ids exist from the start so the app can always answer "what does this
 * client's full set look like" (a P3 dashboard requirement). Templates not yet
 * built render an explicit placeholder rather than a crash or a blank page.
 */

import type { ReactElement } from 'react';
import type { TemplateId } from '../schema/client';
import type { ResolvedClient } from '../schema/resolve';
import { RemovalA } from './removal-a';
import { TrimmingA } from './trimming-a';
import { RemovalB } from './removal-b';
import { TrimmingB } from './trimming-b';
import { RemovalC } from './removal-c';
import { TrimmingC } from './trimming-c';
import { StormA } from './storm-a';
import { StormB } from './storm-b';
import { StormC } from './storm-c';
import { Agnostic } from './agnostic';
import removalACopyDefaults from './removal-a/copy.defaults';
import removalBCopyDefaults from './removal-b/copy.defaults';
import { removalCCopy as removalCCopyDefaults } from './removal-c/copy.defaults';
import trimmingACopyDefaults from './trimming-a/copy.defaults';
import trimmingBCopyDefaults from './trimming-b/copy.defaults';
import { trimmingCCopy as trimmingCCopyDefaults } from './trimming-c/copy.defaults';
import stormACopyDefaults from './storm-a/copy.defaults';
import stormBCopyDefaults from './storm-b/copy.defaults';
import { stormCCopy as stormCCopyDefaults } from './storm-c/copy.defaults';
import agnosticCopyDefaults from './agnostic/copy.defaults';


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

function NotBuiltYet({ id }: { id: TemplateId }) {
  const meta = TEMPLATE_META.find((t) => t.id === id);
  return (
    <div className="not-built">
      <p className="not-built-eyebrow">Template not built yet</p>
      <h1>{meta?.label ?? id}</h1>
      <p>
        <code>{id}</code> is registered but arrives in P2. The client record, the render layer and the
        shared form/phone/consent infrastructure are already in place, so building it is template work only.
      </p>
    </div>
  );
}

export function renderTemplate(id: TemplateId, client: ResolvedClient): ReactElement {
  switch (id) {
    case 'removal-a':
      return <RemovalA client={client} />;
    case 'trimming-a':
      return <TrimmingA client={client} />;
    case 'removal-b':
      return <RemovalB client={client} />;
    case 'trimming-b':
      return <TrimmingB client={client} />;
    case 'removal-c':
      return <RemovalC client={client} />;
    case 'trimming-c':
      return <TrimmingC client={client} />;
    case 'storm-a':
      return <StormA client={client} />;
    case 'storm-b':
      return <StormB client={client} />;
    case 'storm-c':
      return <StormC client={client} />;
    case 'agnostic':
      return <Agnostic client={client} />;
    default:
      return <NotBuiltYet id={id} />;
  }
}

export function isTemplateId(value: string | undefined): value is TemplateId {
  return Boolean(value) && TEMPLATE_META.some((t) => t.id === value);
}

/**
 * Whether a template applies to a given client. A client opts out of templates for
 * services it does not sell via `excludedTemplates`, so those pages are never
 * generated. Everything applies by default. This is the per-client half of the
 * registry: TEMPLATE_META says which templates are BUILT; this says which are
 * RELEVANT to a particular client.
 */
export function isTemplateApplicable(
  client: Pick<ResolvedClient, 'excludedTemplates'>,
  id: TemplateId,
): boolean {
  return !(client.excludedTemplates ?? []).includes(id);
}


/**
 * Every template's shipped copy defaults, keyed by template id. Used by the
 * dashboard preview to map rendered text back to a copy key for inline editing.
 * Read-only: nothing here changes what a page renders.
 */
export const COPY_DEFAULTS: Record<TemplateId, Record<string, string>> = {
  'removal-a': removalACopyDefaults,
  'removal-b': removalBCopyDefaults,
  'removal-c': removalCCopyDefaults,
  'trimming-a': trimmingACopyDefaults,
  'trimming-b': trimmingBCopyDefaults,
  'trimming-c': trimmingCCopyDefaults,
  'storm-a': stormACopyDefaults,
  'storm-b': stormBCopyDefaults,
  'storm-c': stormCCopyDefaults,
  agnostic: agnosticCopyDefaults,
};
