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

const registry = {};
for (const file of readdirSync(CLIENTS).filter((f) => f.endsWith('.json'))) {
  const slug = file.replace(/\.json$/, '');
  const d = JSON.parse(readFileSync(join(CLIENTS, file), 'utf8'));
  registry[slug] = {
    name: d.name ?? '',
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

mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(OUT, JSON.stringify(registry, null, 2) + '\n', 'utf8');
console.log(`lead registry: ${Object.keys(registry).length} client(s) -> ${OUT.replace(ROOT, '')}`);
