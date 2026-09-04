/**
 * Validation + dry-run harness for the lead Function's core (app/functions/api/_core.mjs).
 *
 * Imports the real handler and exercises it with a mock Request + env — the same code
 * Cloudflare runs — so the contract is proven without Wrangler and without ever POSTing
 * to a real GHL location. GHL_DRY_RUN is set, so the network is never touched.
 *
 * Usage: node scripts/test-lead-function.mjs   (exit 1 on any failed assertion)
 */
import { handleLead, buildLead, toE164, envKeyForSlug, verifyTurnstile, DEMO_REFUSAL } from '../app/functions/api/_core.mjs';

let pass = 0;
const fails = [];
const ok = (name, cond, extra = '') => (cond ? (pass++, console.log(`  ok  ${name}`)) : fails.push(`${name} ${extra}`));

const base = {
  firstName: 'Sam', lastName: 'Rivera', phone: '(682) 452-0735', email: 'sam@example.com',
  consentGiven: true, consentText: 'opt-in', consentTimestamp: '2026-08-11T00:00:00Z',
  adClickId: 'CjwK-test-gclid', adClickIdSource: 'gclid',
  clickIds: { gclid: 'CjwK-test-gclid' }, utm: {}, company_website: '',
};

/** Call the real handler with a mock Request; capture dry-run console output. */
async function call(body, env = { GHL_DRY_RUN: '1' }) {
  const logs = [];
  const orig = console.log;
  console.log = (...a) => logs.push(a.join(' '));
  try {
    const req = new Request('http://x/api/lead', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) });
    const res = await handleLead(req, env);
    const json = await res.json();
    return { status: res.status, json, logs };
  } finally {
    console.log = orig;
  }
}

console.log('unit — toE164 / envKeyForSlug');
ok('E.164 passthrough', toE164('+16824520735') === '+16824520735');
ok('formats 10-digit', toE164('(682) 452-0735') === '+16824520735');
ok('formats 11-digit w/ 1', toE164('1 682 452 0735') === '+16824520735');
ok('rejects short', toE164('123') === null);
ok('env key for slug', envKeyForSlug('texas-tree-tops') === 'GHL_PIT_TEXAS_TREE_TOPS');
ok('env key for j-valdez', envKeyForSlug('j-valdez') === 'GHL_PIT_J_VALDEZ');

console.log('\nvalidation matrix');
{
  const r = await call({ ...base, clientSlug: 'not-a-real-client', templateId: 'storm-a' });
  ok('unknown slug -> 400', r.status === 400, JSON.stringify(r.json));
}
{
  const r = await call({ ...base, clientSlug: 'texas-tree-tops', templateId: 'storm-a', phone: '123' });
  ok('bad phone -> 400', r.status === 400, JSON.stringify(r.json));
}
{
  const { consentGiven, ...noConsent } = base;
  const r = await call({ ...noConsent, clientSlug: 'texas-tree-tops', templateId: 'storm-a' });
  ok('missing consent -> 400', r.status === 400, JSON.stringify(r.json));
}
{
  const r = await call({ ...base, firstName: '  ', clientSlug: 'texas-tree-tops', templateId: 'storm-a' });
  ok('missing first name -> 400', r.status === 400, JSON.stringify(r.json));
}
{
  const r = await call({ ...base, clientSlug: 'texas-tree-tops', templateId: 'storm-a', company_website: 'bot.example' });
  ok('honeypot -> 200 dropped, nothing forwarded', r.status === 200 && r.json.dropped === 'honeypot' && r.logs.length === 0, JSON.stringify(r.json));
}
{
  const r = await call({ ...base, clientSlug: 'j-valdez', templateId: 'storm-a' });
  ok('excluded template (j-valdez storm-a) -> 400', r.status === 400, JSON.stringify(r.json));
}
{
  // valid, no token, NOT dry-run -> refuses (503) and never reaches the network.
  const r = await call({ ...base, clientSlug: 'texas-tree-tops', templateId: 'storm-a' }, {});
  ok('valid but unconfigured (no token) -> 503, no POST', r.status === 503, JSON.stringify(r.json));
}

console.log('\ndry-run payload mapping');
{
  // TTT: adClickIdFieldId is null -> click id DROPPED but lead still submits.
  const r = await call({ ...base, clientSlug: 'texas-tree-tops', templateId: 'storm-a' });
  ok('TTT dry-run -> 200 dryRun', r.status === 200 && r.json.dryRun === true, JSON.stringify(r.json));
  ok('TTT click id dropped (no field), lead not failed', r.json.droppedFields?.[0]?.field === 'ad_click_id', JSON.stringify(r.json.droppedFields));
  const built = buildLead({ ...base, clientSlug: 'texas-tree-tops', templateId: 'storm-a' });
  ok('TTT location id from record', built.ghlBody.locationId === 'zfoeYpKrqshgdFr4gG3b', built.ghlBody.locationId);
  ok('TTT phone -> E.164', built.ghlBody.phone === '+16824520735', built.ghlBody.phone);
  ok('TTT tags include template + consent', built.ghlBody.tags.includes('lp-storm-a') && built.ghlBody.tags.includes('sms-consent-yes'), JSON.stringify(built.ghlBody.tags));
  ok('TTT no customFields (field missing)', built.ghlBody.customFields === undefined, JSON.stringify(built.ghlBody.customFields));
  ok('TTT dry-run log names the env secret', r.logs.join(' ').includes('GHL_PIT_TEXAS_TREE_TOPS'));
}
{
  // J Valdez: has the ad-click custom field -> click id MAPPED into it.
  const built = buildLead({ ...base, clientSlug: 'j-valdez', templateId: 'trimming-a' });
  ok('JV location id from record', built.ghlBody.locationId === 'FaHof000UZrAJUKORVCj', built.ghlBody.locationId);
  ok('JV click id mapped into custom field', built.ghlBody.customFields?.[0]?.id === 'DTlYvWAb5Y0M3iXyWfcH' && built.ghlBody.customFields?.[0]?.value === 'CjwK-test-gclid', JSON.stringify(built.ghlBody.customFields));
  ok('JV click id passed through INTACT', built.ghlBody.customFields?.[0]?.value === base.adClickId);
  const r = await call({ ...base, clientSlug: 'j-valdez', templateId: 'trimming-a' });
  ok('JV dry-run -> 200, no dropped fields', r.status === 200 && (r.json.droppedFields?.length ?? 0) === 0, JSON.stringify(r.json));
}

console.log('\nadversarial hardening (T3)');
{
  // Prototype-key slugs must be rejected as unknown clients, not resolve to a
  // truthy Object.prototype.
  for (const slug of ['__proto__', 'constructor', 'toString']) {
    const r = await call({ ...base, clientSlug: slug, templateId: 'trimming-a' });
    ok(`slug "${slug}" -> 400 unknown client`, r.status === 400 && r.json.error === 'unknown client', JSON.stringify(r.json));
  }
}
{
  // Arbitrary templateId must NOT be reflected into a tag; unknown -> lp-unknown.
  const built = buildLead({ ...base, clientSlug: 'j-valdez', templateId: 'evil-tag\ninjected' });
  ok('unknown templateId is not echoed into a tag', built.ghlBody.tags.includes('lp-unknown') && !built.ghlBody.tags.some((t) => t.includes('evil-tag')), JSON.stringify(built.ghlBody.tags));
}
{
  // Non-string templateId is malformed input, rejected (closes the array-coercion
  // exclusion bypass).
  const r = await call({ ...base, clientSlug: 'j-valdez', templateId: ['storm-a', 'x'] });
  ok('array templateId -> 400 invalid', r.status === 400 && r.json.error === 'invalid templateId', JSON.stringify(r.json));
}
{
  // Excluded template still rejected for the real client.
  const r = await call({ ...base, clientSlug: 'j-valdez', templateId: 'storm-a' });
  ok('excluded storm-a for j-valdez still -> 400', r.status === 400);
}
{
  // Oversized name/email are capped, not forwarded verbatim, and control chars
  // are collapsed.
  const built = buildLead({ ...base, clientSlug: 'j-valdez', templateId: 'trimming-a', firstName: 'A'.repeat(5000), lastName: 'B\n\r\tC', email: 'x'.repeat(5000) + '@e.com' });
  ok('firstName capped at 100', built.ghlBody.firstName.length === 100);
  ok('control chars in lastName collapsed to spaces', built.ghlBody.lastName === 'B   C');
  ok('email capped at 254', built.ghlBody.email.length <= 254);
}
{
  // A known templateId that IS applicable still tags correctly.
  const built = buildLead({ ...base, clientSlug: 'j-valdez', templateId: 'trimming-a' });
  ok('known applicable templateId tags lp-trimming-a', built.ghlBody.tags.includes('lp-trimming-a'), JSON.stringify(built.ghlBody.tags));
}

console.log('\nturnstile — verifyTurnstile (mocked network)');
{
  // Fail-OPEN when unconfigured: no secret => passes, and never calls fetch.
  let called = false;
  const r = await verifyTurnstile('any', undefined, undefined, async () => { called = true; return { json: async () => ({}) }; });
  ok('no secret configured -> ok, network untouched', r.ok === true && called === false);
}
{
  // Configured but no token => fail-closed, no network call.
  let called = false;
  const r = await verifyTurnstile('', 'secret', undefined, async () => { called = true; return { json: async () => ({}) }; });
  ok('secret set + missing token -> fail, no network', r.ok === false && called === false);
}
{
  const r = await verifyTurnstile('tok', 'secret', '1.2.3.4', async () => ({ json: async () => ({ success: true }) }));
  ok('secret set + token + success -> ok', r.ok === true);
}
{
  const r = await verifyTurnstile('tok', 'secret', undefined, async () => ({ json: async () => ({ success: false, 'error-codes': ['invalid-input-response'] }) }));
  ok('secret set + token + rejection -> fail', r.ok === false && r.codes.includes('invalid-input-response'));
}
{
  const r = await verifyTurnstile('tok', 'secret', undefined, async () => { throw new Error('network down'); });
  ok('siteverify unreachable -> fail CLOSED', r.ok === false);
}

console.log('\nturnstile — handleLead gate (mocked network)');
{
  // Enforcing env (secret set), missing token in body -> 403 before any GHL work.
  const orig = globalThis.fetch;
  globalThis.fetch = async () => ({ json: async () => ({ success: false }) });
  try {
    const req = new Request('http://x/api/lead', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ ...base, clientSlug: 'j-valdez', templateId: 'trimming-a' }) });
    const res = await handleLead(req, { GHL_DRY_RUN: '1', TURNSTILE_SECRET_KEY: 'x' });
    ok('enforced + no token -> 403', res.status === 403);
  } finally {
    globalThis.fetch = orig;
  }
}
{
  // Enforcing env, valid token (siteverify mocked success) -> proceeds to dry-run 200.
  const orig = globalThis.fetch;
  globalThis.fetch = async (url) => {
    if (String(url).includes('siteverify')) return { json: async () => ({ success: true }) };
    throw new Error('no other fetch expected in dry-run');
  };
  try {
    const req = new Request('http://x/api/lead', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ ...base, clientSlug: 'j-valdez', templateId: 'trimming-a', turnstileToken: 'good' }) });
    const res = await handleLead(req, { GHL_DRY_RUN: '1', TURNSTILE_SECRET_KEY: 'x' });
    const j = await res.json();
    ok('enforced + valid token -> 200 dryRun', res.status === 200 && j.dryRun === true);
  } finally {
    globalThis.fetch = orig;
  }
}
{
  // No secret in env: existing behavior is preserved (fail-open) — no token needed.
  const r = await call({ ...base, clientSlug: 'j-valdez', templateId: 'trimming-a' });
  ok('unconfigured env still accepts a tokenless lead (fail-open)', r.status === 200 && r.json.dryRun === true);
}

console.log('\ndemo account — refused before any token is read');
{
  // The demo slug is refused with a machine-readable `demo: true`, which is what
  // the browser form keys its "demo mode — not submitted" state off.
  const r = await call({ ...base, clientSlug: 'summit-tree', templateId: 'removal-a' });
  ok('demo slug -> 403', r.status === 403, JSON.stringify(r.json));
  ok('demo slug -> demo:true in body', r.json.demo === true, JSON.stringify(r.json));
  ok('demo refusal text is the shared constant', r.json.error === DEMO_REFUSAL, JSON.stringify(r.json));
  ok('demo submit never dry-runs a GHL payload', r.json.dryRun === undefined && r.json.ok === undefined);
  ok('demo submit logs no [GHL_DRY_RUN] record', !r.logs.some((l) => l.includes('GHL_DRY_RUN')), r.logs.join('|'));
}
{
  // buildLead is the layer that refuses; handleLead only reads env[envKey] AFTER
  // buildLead returns a payload, so a refusal here is structurally before the token.
  const built = buildLead({ ...base, clientSlug: 'summit-tree', templateId: 'removal-a' });
  ok('buildLead refuses the demo slug', built.error === DEMO_REFUSAL && built.status === 403);
  ok('buildLead returns no ghlBody for a demo slug', built.ghlBody === undefined && built.meta === undefined);
}
{
  // THE POINT OF THE WHOLE THING: even with a real-looking token in env for the
  // demo slug, and NOT in dry-run, no outbound request is made. Any fetch at all
  // here is a failure — the demo must never reach GHL.
  const origFetch = globalThis.fetch;
  let fetched = 0;
  globalThis.fetch = async (...a) => { fetched++; return origFetch(...a); };
  try {
    const req = new Request('http://x/api/lead', {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ ...base, clientSlug: 'summit-tree', templateId: 'storm-a' }),
    });
    // 'stand-in' is deliberately NOT credential-shaped: R3 scans this file for
    // pit-* strings, and a realistic-looking fake would trip it.
    const res = await handleLead(req, { GHL_PIT_SUMMIT_TREE: 'stand-in' });
    ok('demo slug with a token present in env -> still 403', res.status === 403);
    ok('demo slug made ZERO outbound requests', fetched === 0, `fetch called ${fetched}x`);
  } finally {
    globalThis.fetch = origFetch;
  }
}
{
  // The refusal is per-slug, not a blanket change: a real client still works.
  const r = await call({ ...base, clientSlug: 'texas-tree-tops', templateId: 'removal-a' });
  ok('a real client is unaffected by the demo rule', r.status === 200 && r.json.dryRun === true);
}

console.log(`\n${pass} passed, ${fails.length} failed`);
if (fails.length) {
  for (const f of fails) console.log(`  FAIL  ${f}`);
  process.exit(1);
}
console.log('lead Function contract holds.');
