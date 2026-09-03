import type { TemplateId } from '../schema/client';
import type { SectionDef } from '../schema/layout.mjs';

export const MANIFESTS: Readonly<Record<TemplateId, readonly SectionDef[]>>;
export const TEMPLATE_IDS_WITH_MANIFEST: readonly TemplateId[];
