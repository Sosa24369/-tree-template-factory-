/**
 * Renders a template's sections from the client's RESOLVED layout.
 *
 * A template hands over a map of section id -> render function for the sections it
 * lets the client reorder or hide. Required sections (header, footer, sticky bar)
 * stay as static JSX in the template exactly where they are, because they are pinned
 * by definition; only ids present in `renderers` are rendered here.
 *
 * SIZE TOKENS. A section rendered at its manifest default emits nothing extra — so a
 * client with no `layout` produces byte-identical HTML (the P0 invariant). A section
 * at a NON-default size is wrapped in one block div carrying `size-<token>` and
 * `data-section`, which base.css turns into padding / width rules. A wrapper rather
 * than a prop because ~60 section components would otherwise each need editing to
 * forward a class, and a block div around a block section has no layout effect of
 * its own.
 */

import { Fragment, type ReactNode } from 'react';
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
    const node = render({ size: s.size, index });
    out.push(
      s.size !== s.defaultSize ? (
        <div key={s.id} className={`size-${s.size}`} data-section={s.id}>
          {node}
        </div>
      ) : (
        <Fragment key={s.id}>{node}</Fragment>
      )
    );
    index++;
  }
  return out;
}
