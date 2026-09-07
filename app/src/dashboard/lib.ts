/**
 * Dashboard helpers: dot-path get/set on the client record, the leaf-path walker that
 * powers the "unlabelled fields" group, and thin fetch wrappers over the dev API.
 */

import { IGNORED_PATHS, SCHEMA_PATHS } from './schema';

export type Json = any;

export interface LogoChecks {
  source: { width: number | null; height: number | null; format: string | null; hasAlpha: boolean };
  trimmedTo: { width: number; height: number };
  backgroundBox: string | null;
  markColor: string;
  contrast: { paperReadablePct: number; inkReadablePct: number; meanVsPaper: number; meanVsInk: number };
  textCheck: { status: string; reason: string };
  warnings: string[];
}

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
  if (res.status === 401) {
    // The session cookie lasts 12 hours. When it lapses mid-edit the answer is a banner
    // that says what to do — never a raw "unauthorized" toast — and the edits stay on
    // screen. The App listens for this; a later successful request clears it.
    window.dispatchEvent(new CustomEvent('dash-session', { detail: 'signed-out' }));
    throw Object.assign(new Error('signed out — sign in again'), { body, signedOut: true });
  }
  if (res.ok) window.dispatchEvent(new CustomEvent('dash-session', { detail: 'ok' }));
  if (!res.ok) throw Object.assign(new Error((body as any).error || res.statusText), { body });
  return body as T;
}

export const api = {
  publishStatus: () => fetch('/api/publish').then((r) => j<any>(r)),
  // `confirmProtected` is the token the studio was shown when a publish was blocked
  // for touching a live campaign page. It names that exact route set.
  publish: (confirmProtected?: string) =>
    fetch('/api/publish', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(confirmProtected ? { confirmProtected } : {}),
    }).then((r) => j<any>(r)),
  clients: () => fetch('/api/dash/clients').then((r) => j<{ clients: { slug: string; name: string }[] }>(r)),
  client: (slug: string) => fetch(`/api/dash/client/${slug}`).then((r) => j<{ record: Json }>(r)),
  assets: (slug: string) => fetch(`/api/dash/assets/${slug}`).then((r) => j<{ files: { name: string; src: string }[] }>(r)),
  diff: (slug: string, record: Json) =>
    fetch('/api/dash/diff', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ slug, record }) }).then((r) => j<{ diff: string }>(r)),
  // The image contract's pipeline: aspect null keeps the original shape, absent = 4:3;
  // set/index/count say where the photo lands so the minimum is the slot's own. A
  // refusal comes back as { error: 'too_small' | 'heic' | 'unreadable', message }.
  upload: (payload: { slug: string; filename: string; dataBase64: string; focal?: { x: number; y: number }; aspect?: number | null; set?: string; index?: number; count?: number }) =>
    fetch('/api/dash/upload', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(payload) })
      .then((r) => j<{ photo: Json; warnings: string[]; slots: { template: string; id: string; label: string; policy: string }[] }>(r)),
  // A logo is NOT a photo: separate endpoint, separate pipeline, no srcset. Comes back
  // with the contract's checks (trim, baked-in box, header contrast).
  uploadLogo: (payload: { slug: string; filename: string; dataBase64: string }) =>
    fetch('/api/dash/upload-logo', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(payload) })
      .then((r) => j<{ logo: { src: string; width: number; height: number; sourceLongestEdge: number; checks: LogoChecks } }>(r)),
  logoCheck: (slug: string) =>
    fetch('/api/dash/logo-check', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ slug }) }).then((r) => j<({ logo: string | null; missing?: boolean } & Partial<LogoChecks>)>(r)),
  // The measured contrast of the removal-a headline over a photo as the hero plate.
  heroCheck: (payload: { slug: string; src: string; focal?: { x: number; y: number } | null; primaryColor?: string }) =>
    fetch('/api/dash/hero-check', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(payload) }).then((r) => j<any>(r)),
  save: (slug: string, record: Json, message: string) =>
    fetch('/api/dash/save', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ slug, record, message }) }).then((r) => j<{ ok: boolean; commit: string | null; warnings: string[] }>(r)),
  // Builds a NEUTRAL record. It deliberately takes no source client to copy from:
  // duplicating one carried its GHL location id and GTM container into the new
  // record, which routes leads and conversions to the wrong account.
  newClient: (payload: {
    slug: string;
    name: string;
    serviceArea?: string;
    serviceAreaList?: string[];
    phoneE164?: string;
    brand?: Record<string, string>;
    excludedTemplates?: string[];
    isDemo?: boolean;
  }) =>
    fetch('/api/dash/new-client', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(payload) }).then((r) => j<{ ok: boolean; record: Json; emptyPhotoSlots: string[] }>(r)),
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
