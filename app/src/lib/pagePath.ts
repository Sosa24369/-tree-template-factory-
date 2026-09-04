/**
 * The two public URL prefixes, in one place.
 *
 * `/p/`    — real client pages. These carry ad spend.
 * `/demo/` — the neutral demo account shown to sales prospects. Kept on its own
 *            prefix so a single header rule (app/public/_headers) can put
 *            `X-Robots-Tag: noindex, nofollow` on every demo page at once, and
 *            so a demo page can never be confused with a live campaign page by
 *            a URL check, a log line, or a person reading a link.
 *
 * A client belongs to exactly one prefix, decided by `isDemo` on its record.
 * The route table refuses the other prefix (src/App.tsx), so there is never a
 * second, indexable copy of a page at the wrong address.
 */

export const LIVE_BASE = '/p';
export const DEMO_BASE = '/demo';

export type PageMode = 'live' | 'demo';

export function modeFor(client: { isDemo?: boolean }): PageMode {
  return client.isDemo ? 'demo' : 'live';
}

export function basePathFor(client: { isDemo?: boolean }): string {
  return client.isDemo ? DEMO_BASE : LIVE_BASE;
}

/** The public path of one client's one template page. */
export function pagePath(client: { isDemo?: boolean; slug: string }, templateId: string): string {
  return `${basePathFor(client)}/${client.slug}/${templateId}`;
}
