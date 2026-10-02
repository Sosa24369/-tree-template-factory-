/**
 * POST /api/lead — the one server endpoint between a landing-page form and GHL.
 *
 * A Cloudflare Pages Function. The token that authorises the GHL write lives ONLY in
 * this server context (env secret GHL_PIT_<SLUG>), never in the client bundle. All the
 * logic — validation, slug->location->token routing, click-id mapping, dry-run — is in
 * _core.mjs so it is unit-testable in plain Node.
 *
 * Datum dual-write (_datum.mjs, _relay.mjs) — per site behind DATUM_DUAL_WRITE_<SLUG>=on,
 * default off. With no site's flag on this is exactly the previous handler: the request
 * goes to handleLead untouched and its response is returned as is. With a site's flag on,
 * the GHL write and the visitor's response are still handleLead's alone; only once GHL
 * has accepted the lead is a copy relayed to Datum, inside waitUntil, so nothing waits on
 * Datum and nothing Datum does can change what the visitor sees.
 */

import { handleLead } from './_core.mjs';
import { relayLead } from './_datum.mjs';
import { anyDualWriteOn, dualWriteOn } from './_relay.mjs';

interface Env {
  GHL_DRY_RUN?: string;
  // GHL_PIT_<SLUG> secrets are read by name in _core.mjs; typed loosely here. The Datum
  // relay adds DATUM_API_URL, DATUM_SITE_SECRET_<SLUG>, DATUM_DUAL_WRITE_<SLUG> and the
  // DATUM_LEAD_QUEUE producer binding.
  [key: string]: unknown;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  // Every flag off (the default): the previous handler, nothing else read or run.
  if (!anyDualWriteOn(context.env)) return handleLead(context.request, context.env);

  const lead = await context.request
    .clone()
    .json()
    .catch(() => null);
  const res = await handleLead(context.request, context.env);
  const slug = typeof lead?.clientSlug === 'string' ? lead.clientSlug : '';
  if (res.status === 200 && dualWriteOn(context.env, slug)) {
    const outcome = await res
      .clone()
      .json()
      .catch(() => null);
    // Only a lead GHL accepted: not a honeypot drop, not a dry run.
    if (outcome?.ok === true && !outcome.dropped && !outcome.dryRun)
      context.waitUntil(relayLead({ env: context.env, slug, lead, request: context.request }));
  }
  return res;
};

// A GET is not a lead submission — answer clearly rather than 404 into the SPA.
export const onRequestGet: PagesFunction<Env> = () =>
  new Response(JSON.stringify({ error: 'POST a lead payload to this endpoint' }), {
    status: 405,
    headers: { 'content-type': 'application/json', allow: 'POST' },
  });
