/**
 * POST /api/lead — the one server endpoint between a landing-page form and GHL.
 *
 * A Cloudflare Pages Function. The token that authorises the GHL write lives ONLY in
 * this server context (env secret GHL_PIT_<SLUG>), never in the client bundle. All the
 * logic — validation, slug->location->token routing, click-id mapping, dry-run — is in
 * _core.mjs so it is unit-testable in plain Node.
 */

import { handleLead } from './_core.mjs';

interface Env {
  GHL_DRY_RUN?: string;
  // GHL_PIT_<SLUG> secrets are read by name in _core.mjs; typed loosely here.
  [key: string]: string | undefined;
}

export const onRequestPost: PagesFunction<Env> = (context) => handleLead(context.request, context.env);

// A GET is not a lead submission — answer clearly rather than 404 into the SPA.
export const onRequestGet: PagesFunction<Env> = () =>
  new Response(JSON.stringify({ error: 'POST a lead payload to this endpoint' }), {
    status: 405,
    headers: { 'content-type': 'application/json', allow: 'POST' },
  });
