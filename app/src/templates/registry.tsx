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

export interface TemplateMeta {
  id: TemplateId;
  label: string;
  service: 'removal' | 'trimming' | 'storm' | 'agnostic';
  variant: 'control' | 'variant' | 'blank';
  built: boolean;
}

export const TEMPLATE_META: TemplateMeta[] = [
  { id: 'removal-a', label: 'Tree Removal — Control', service: 'removal', variant: 'control', built: true },
  { id: 'removal-b', label: 'Tree Removal — Variant', service: 'removal', variant: 'variant', built: false },
  { id: 'trimming-a', label: 'Tree Trimming — Control', service: 'trimming', variant: 'control', built: false },
  { id: 'trimming-b', label: 'Tree Trimming — Variant', service: 'trimming', variant: 'variant', built: false },
  { id: 'storm-a', label: 'Storm Damage — Control', service: 'storm', variant: 'control', built: false },
  { id: 'storm-b', label: 'Storm Damage — Variant', service: 'storm', variant: 'variant', built: false },
  { id: 'agnostic', label: 'Service-Agnostic — Blank', service: 'agnostic', variant: 'blank', built: false },
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
    default:
      return <NotBuiltYet id={id} />;
  }
}

export function isTemplateId(value: string | undefined): value is TemplateId {
  return Boolean(value) && TEMPLATE_META.some((t) => t.id === value);
}
