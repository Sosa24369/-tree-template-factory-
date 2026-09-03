/**
 * Loads every client record from /clients/*.json at build time.
 *
 * Adding a client is dropping a JSON file in that folder. There is no code change,
 * no registration step, no import to remember — which is the property the whole
 * project exists for.
 */

import type { ClientRecord } from '../schema/client';
import { resolveClient, type ResolveIssue, type ResolvedClient } from '../schema/resolve';

// Real clients live in /clients. Test fixtures live in /clients/_fixtures and carry
// isFixture: true, which scripts/prerender.mjs uses to keep them out of every deploy.
const modules = import.meta.glob<{ default: ClientRecord }>(
  ['../../../clients/*.json', '../../../clients/_fixtures/*.json'],
  { eager: true }
);

export interface RegistryEntry {
  client: ResolvedClient;
  issues: ResolveIssue[];
}

const registry = new Map<string, RegistryEntry>();

for (const [path, mod] of Object.entries(modules)) {
  const raw = mod.default;
  if (!raw || typeof raw !== 'object') continue;
  // The filename is authoritative for the slug, so a mismatched "slug" field
  // inside the JSON can never make a client unreachable.
  const fileSlug = path.split('/').pop()!.replace(/\.json$/, '');
  const { client, issues } = resolveClient({ ...raw, slug: raw.slug || fileSlug });
  if (raw.slug && raw.slug !== fileSlug) {
    issues.push({
      level: 'warning',
      field: 'slug',
      message: `slug "${raw.slug}" does not match filename "${fileSlug}.json". The filename wins.`,
    });
  }
  registry.set(fileSlug, { client, issues });
}

export function listClients(): RegistryEntry[] {
  return [...registry.values()].sort((a, b) => a.client.name.localeCompare(b.client.name));
}

export function getClient(slug: string | undefined): RegistryEntry | undefined {
  return slug ? registry.get(slug) : undefined;
}

export function clientSlugs(): string[] {
  return [...registry.keys()].sort();
}
