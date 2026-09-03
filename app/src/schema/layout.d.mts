import type { SizeToken } from './client';

export const SIZE_TOKENS: readonly SizeToken[];

export interface SectionDef {
  id: string;
  label: string;
  required: boolean;
  defaultSize: SizeToken;
}

export interface ResolvedSection {
  id: string;
  hidden: boolean;
  size: SizeToken;
  defaultSize: SizeToken;
  required: boolean;
}

export function resolveLayout(
  manifest: readonly SectionDef[],
  clientLayout: unknown,
  opts?: { locked?: boolean }
): { sections: ResolvedSection[]; warnings: string[] };

export function isControlTemplate(templateId: unknown): boolean;
