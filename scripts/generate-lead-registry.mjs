/**
 * Generates the CRM routing registry the lead Pages Function needs.
 *
 * The Function runs at the edge and has no filesystem, so the slug -> GHL routing map
 * must be bundled at build time. This reads every /clients/*.json and emits a minimal,
 * NON-SECRET map (location id, ad-click field id, tags, source, name) that the Function
 * imports. Tokens are NEVER here — they live only in environment secrets
 * (GHL_PIT_<SLUG>). Everything written here is already committed in the client records.
 *
 * Keeps the factory property intact: adding a client is still a JSON file in /clients;
 * this regenerates on the next build. Run standalone or as the first build step.
 *
 * Usage: node scripts/generate-lead-registry.mjs
 */
import { readFileSync, writeFileSync, readdirSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';

const ROOT = new URL('..', import.meta.url).pathname;
const CLIENTS = join(ROOT, 'clients');
const OUT = join(ROOT, 'app', 'functions', 'api', 'client-crm.generated.json');

// Canonical template ids, read from the ONE source of truth (TEMPLATE_META) so the
// Function can validate an incoming templateId against the real set — not just the
// per-client exclusion list. Without this, an attacker could post an arbitrary
// templateId and have it reflected into a GHL tag (`lp-<anything>`). Parsed rather
// than hardcoded so it cannot drift from the template registry.
//
// TEMPLATE_META lives in templates/meta.ts (data only). It used to be parsed out of
// registry.tsx, which also imports every template component and stylesheet; the split
// exists so the studio can import the metadata without dragging the CSS in with it.
const META_TS = readFileSync(join(ROOT, 'app', 'src', 'templates', 'meta.ts'), 'utf8');
const metaBlock = META_TS.slice(META_TS.indexOf('export const TEMPLATE_META'));
const knownTemplates = [...metaBlock.matchAll(/id:\s*'([a-z0-9-]+)'/g)].map((m) => m[1]);
if (knownTemplates.length === 0) throw new Error('could not parse TEMPLATE_META ids from templates/meta.ts');

const clients = {};
for (const file of readdirSync(CLIENTS).filter((f) => f.endsWith('.json'))) {
  const slug = file.replace(/\.json$/, '');
  const d = JSON.parse(readFileSync(join(CLIENTS, file), 'utf8'));
  clients[slug] = {
    name: d.name ?? '',
    // DEMO ACCOUNT. The Function refuses this slug outright, before it reads any
    // token — a demo form must never reach a real GHL location. Carried here (not
    // inferred from an empty ghlLocationId) so the refusal is an explicit, tested
    // decision rather than a side effect of a half-filled record.
    isDemo: d.isDemo === true,
    ghlLocationId: d.crm?.ghlLocationId ?? '',
    adClickIdFieldId: d.crm?.adClickIdFieldId ?? null,
    // Optional map of attribution key -> GHL custom field id, e.g.
    // {"gclid": "<fieldId>", "utm_campaign": "<fieldId>"}. Field ids are
    // created in GHL by hand (docs/TRACKING_MANUAL_LIST.md) and pasted into
    // the client record — NEVER invented here. Until then this is empty and
    // the Function reports those values as droppedFields instead.
    attributionFieldIds: d.crm?.attributionFieldIds ?? {},
    leadTags: d.crm?.leadTags ?? [],
    leadSource: d.crm?.leadSource ?? '',
    // Templates this client does NOT sell — the Function refuses a lead for one, so a
    // form can never post from a page the client isn't running.
    excludedTemplates: d.excludedTemplates ?? [],
  };
}

// Guard the token-routing invariant at BUILD time: the Function derives each
// client's token env var by uppercasing the slug and collapsing punctuation to
// `_` (envKeyForSlug). Two slugs that differ only in punctuation/case would
// then share one GHL_PIT_* secret — pairing one client's location with
// another's token. It cannot happen with today's slugs, so assert it can never
// be introduced silently by a future client file.
const envKeyFor = (slug) => 'GHL_PIT_' + slug.toUpperCase().replace(/[^A-Z0-9]+/g, '_');
const byEnvKey = {};
for (const slug of Object.keys(clients)) {
  const k = envKeyFor(slug);
  (byEnvKey[k] ??= []).push(slug);
}
const collisions = Object.entries(byEnvKey).filter(([, slugs]) => slugs.length > 1);
if (collisions.length) {
  throw new Error(
    'token env-key collision — these slugs map to one GHL_PIT_* secret: ' +
      collisions.map(([k, slugs]) => `${k} <- ${slugs.join(', ')}`).join(' ; ')
  );
}

// Shape: { knownTemplates: [...], clients: { slug: {...} } }. The nested
// `clients` map keeps client lookup separate from metadata, so no metadata key
// can ever be addressed as if it were a client slug.
const registry = { knownTemplates, clients };

mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(OUT, JSON.stringify(registry, null, 2) + '\n', 'utf8');
console.log(`lead registry: ${Object.keys(clients).length} client(s), ${knownTemplates.length} templates -> ${OUT.replace(ROOT, '')}`);
