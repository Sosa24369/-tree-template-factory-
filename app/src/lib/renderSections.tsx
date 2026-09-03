/**
 * Renders a template's sections from the client's RESOLVED layout.
 *
 * A template hands over a map of section id -> render function for the sections it
 * lets the client reorder or hide. Required sections (header, footer, sticky bar)
 * stay as static JSX in the template exactly where they are, because they are pinned
 * by definition; only ids present in `renderers` are rendered here.
 *
 * Output-neutral by construction: with no client `layout`, the resolved order IS the
 * manifest order, nothing is hidden, and every section renders at its default size —
 * so a template converted to this helper produces byte-identical HTML. That property
 * is what the P0 build diff proves.
 */

import type { ReactNode } from 'react';
import type { SizeToken, TemplateId } from '../schema/client';
import type { ResolvedClient } from '../schema/resolve';

export type SectionRenderer = (ctx: { size: SizeToken; index: number }) => ReactNode;

export function renderSections(
  client: ResolvedClient,
  templateId: TemplateId,
  renderers: Record<string, SectionRenderer>
): ReactNode[] {
  const order = client.resolvedLayout?.[templateId] ?? [];
  const out: ReactNode[] = [];
  let index = 0;
  for (const s of order) {
    if (s.hidden) continue;
    const render = renderers[s.id];
    if (!render) continue;
    out.push(<Fragment key={s.id}>{render({ size: s.size, index })}</Fragment>);
    index++;
  }
  return out;
}

import { Fragment } from 'react';
