/**
 * Location pages (canopy-pages: v1). A page is the client's base template,
 * rendered with the client's copy, the page's overrides on top, and the page's
 * location as `{{areaName}}`. Nothing else about the client changes: the same
 * phone, GTM container, form, photos and reviews.
 */
import type { ClientPage } from '../schema/client';
import type { ResolvedClient } from '../schema/resolve';

export function pageFor(client: ResolvedClient, slug: string | undefined): ClientPage | undefined {
  if (!slug) return undefined;
  return (client.pages ?? []).find((p) => p.slug === slug);
}

export function pageClient(client: ResolvedClient, page: ClientPage): ResolvedClient {
  const base = client.copyOverrides?.[page.templateId] ?? {};
  return {
    ...client,
    serviceArea: page.location,
    copyOverrides: {
      ...client.copyOverrides,
      [page.templateId]: { ...base, ...(page.copyOverrides ?? {}) },
    },
  };
}
