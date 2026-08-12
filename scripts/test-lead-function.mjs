/**
 * Validation + dry-run harness for the lead Function's core (app/functions/api/_core.mjs).
 *
 * Imports the real handler and exercises it with a mock Request + env — the same code
 * Cloudflare runs — so the contract is proven without Wrangler and without ever POSTing
 * to a real GHL location. GHL_DRY_RUN is set, so the network is never touched.
 *
 * Usage: node scripts/test-lead-function.mjs   (exit 1 on any failed assertion)
 */
import { handleLead, buildLead, toE164, envKeyForSlug } from '../app/functions/api/_core.mjs';

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

console.log(`\n${pass} passed, ${fails.length} failed`);
if (fails.length) {
  for (const f of fails) console.log(`  FAIL  ${f}`);
  process.exit(1);
}
console.log('lead Function contract holds.');
