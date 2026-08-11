/**
 * Dashboard helpers: dot-path get/set on the client record, the leaf-path walker that
 * powers the "unlabelled fields" group, and thin fetch wrappers over the dev API.
 */

import { IGNORED_PATHS, SCHEMA_PATHS } from './schema';

export type Json = any;

export function getPath(obj: Json, path: string): Json {
  return path.split('.').reduce((o, k) => (o == null ? undefined : o[k]), obj);
}

/** Immutable set-by-path — returns a new object, never mutates the record in place. */
export function setPath(obj: Json, path: string, value: Json): Json {
  const keys = path.split('.');
  const clone = Array.isArray(obj) ? [...obj] : { ...obj };
  let cur = clone;
  for (let i = 0; i < keys.length - 1; i += 1) {
    const k = keys[i];
    const next = cur[k];
    cur[k] = Array.isArray(next) ? [...next] : { ...(next ?? {}) };
    cur = cur[k];
  }
  cur[keys[keys.length - 1]] = value;
  return clone;
}

/**
 * Every leaf path in the record that the schema does NOT already describe and that
 * is not structural — these render in the "Unlabelled fields" group so a new template
 * key is editable the moment it appears, instead of vanishing.
 */
export function unlabelledLeaves(record: Json): string[] {
  const out: string[] = [];
  const owned = new Set<string>();
  for (const p of SCHEMA_PATHS) owned.add(p);
  // Anything nested under a schema-owned complex field (photos, reviews, copyOverrides)
  // is edited by that field's dedicated editor, so don't also surface its leaves.
  const complexPrefixes = ['photos', 'reviews', 'copyOverrides'];

  const walk = (val: Json, prefix: string) => {
    if (val && typeof val === 'object' && !Array.isArray(val)) {
      for (const k of Object.keys(val)) walk(val[k], prefix ? `${prefix}.${k}` : k);
      return;
    }
    if (!prefix) return;
    if (IGNORED_PATHS.has(prefix)) return;
    if (owned.has(prefix)) return;
    if (complexPrefixes.some((p) => prefix === p || prefix.startsWith(`${p}.`))) return;
    // Arrays that a schema field owns (serviceAreaList, crm.leadTags) are handled;
    // any OTHER array/scalar leaf is genuinely unlabelled.
    if (owned.has(prefix)) return;
    out.push(prefix);
  };
  walk(record, '');
  return out;
}

/* ---- API ---- */

async function j<T>(res: Response): Promise<T> {
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw Object.assign(new Error((body as any).error || res.statusText), { body });
  return body as T;
}

export const api = {
  clients: () => fetch('/api/dash/clients').then((r) => j<{ clients: { slug: string; name: string }[] }>(r)),
  client: (slug: string) => fetch(`/api/dash/client/${slug}`).then((r) => j<{ record: Json }>(r)),
  assets: (slug: string) => fetch(`/api/dash/assets/${slug}`).then((r) => j<{ files: { name: string; src: string }[] }>(r)),
  diff: (slug: string, record: Json) =>
    fetch('/api/dash/diff', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ slug, record }) }).then((r) => j<{ diff: string }>(r)),
  upload: (payload: { slug: string; filename: string; dataBase64: string; focal?: { x: number; y: number }; aspect?: number }) =>
    fetch('/api/dash/upload', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(payload) }).then((r) => j<{ photo: Json }>(r)),
  save: (slug: string, record: Json, message: string) =>
    fetch('/api/dash/save', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ slug, record, message }) }).then((r) => j<{ ok: boolean; commit: string | null; warnings: string[] }>(r)),
  newClient: (slug: string, fromSlug: string) =>
    fetch('/api/dash/new-client', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ slug, fromSlug }) }).then((r) => j<{ ok: boolean; record: Json; emptyPhotoSlots: string[] }>(r)),
};

/** Client-side mirror of the server's validation, for live feedback. */
export function validate(record: Json): { errors: string[]; warnings: string[] } {
  const errors: string[] = [];
  const warnings: string[] = [];
  const e164 = record?.phone?.e164?.trim?.() ?? '';
  if (!e164) errors.push('Phone number is required.');
  else if (!/^\+\d{10,15}$/.test(e164)) errors.push(`Phone "${e164}" is not E.164 (+1XXXXXXXXXX).`);
  if (!record?.name?.trim?.()) errors.push('Company name is required.');
  const ty = record?.leadDestination?.thankYouUrl?.trim?.() ?? '';
  if (!ty) errors.push('Thank-you URL is required.');
  else if (/titantreeservicetx\.com/i.test(ty)) errors.push('Thank-you URL must never be titantreeservicetx.com.');
  else if (/^[a-z][a-z0-9+.-]*:\/\//i.test(ty) && record?.leadDestination?.isExternalAllowed !== true)
    errors.push('Thank-you URL is off-domain but off-domain redirects are not allowed. Keep it relative or enable the toggle for this client’s own domain.');
  if (!record?.consent?.smsCopy?.trim?.()) errors.push('SMS consent copy is required.');
  if (!record?.consent?.privacyPolicyUrl?.trim?.() || !record?.consent?.termsOfServiceUrl?.trim?.())
    warnings.push('Privacy / Terms URL blank (legalUrlsPending) — allowed, but A2P needs both before running SMS.');
  return { errors, warnings };
}

export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
