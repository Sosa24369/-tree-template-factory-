/**
 * The Canopy API — a service-to-service door into the studio, for exactly six
 * routes (Canopy P14, brief §12.2; the contract is Canopy's docs/LAUNCH_PLAN.md §3).
 *
 *   GET  /api/canopy/v1/templates                  the ten templates, read-only
 *   GET  /api/canopy/v1/clients/:slug              one client: pages, allowed templates, GTM
 *   PUT  /api/canopy/v1/clients/:slug              create a client, or update a DEMO client
 *   POST /api/canopy/v1/clients/:slug/pages        add or update one location page
 *   POST /api/canopy/v1/publish                    start the existing publisher
 *   GET  /api/canopy/v1/publish                    the publisher's status and receipt
 *
 * AUTH. `Authorization: Bearer <STUDIO_API_TOKEN>`, compared as SHA-256 digests
 * in constant time. No token configured → every route answers 503; the door is
 * closed, never open. This group is mounted BEFORE the session gate and answers
 * every request under its prefix itself, so it never falls through to the human
 * routes — and the human routes never look at this token: `/api/dash/*`,
 * `/api/publish` and `/` still need the session cookie, exactly as before.
 *
 * WHAT THE TOKEN CANNOT DO.
 *   - change an existing real client's record (409 real_client_readonly): any
 *     field there shows on a live page;
 *   - use a template a real client does not run (422 template_not_allowed);
 *   - confirm a change to the protected live pages: publish is started without
 *     `confirmProtected`, so a build that would change them stays `blocked` until
 *     a person releases it in the studio;
 *   - reach anything but these six routes.
 *
 * Every write takes `dryRun: true`, which validates and returns what would be
 * written without touching the clone.
 */

import { createHash, timingSafeEqual } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { EventEmitter } from 'node:events';
import { Hono } from 'hono';

export const CANOPY_PREFIX = '/api/canopy/v1';
const OK_SLUG = /^[a-z0-9][a-z0-9-]*$/;
const PAGES_MARKER = 'canopy-pages: v1';

const digest = (s) => createHash('sha256').update(String(s)).digest();

export function tokenOk(header, expected) {
  if (!expected) return false;
  const m = /^Bearer\s+(.+)$/.exec(header || '');
  if (!m) return false;
  return timingSafeEqual(digest(m[1].trim()), digest(expected));
}

/** Run the shared dashboard core in-process, as the human routes do. */
export function callCore(core, method, url, body) {
  return new Promise((resolve, reject) => {
    const req = new EventEmitter();
    req.method = method;
    req.url = url;
    req.headers = { 'content-type': 'application/json' };
    const res = {
      statusCode: 200,
      headers: {},
      setHeader(k, v) { this.headers[k.toLowerCase()] = v; },
      end(data) {
        let parsed = null;
        try { parsed = data ? JSON.parse(String(data)) : null; } catch { parsed = { raw: String(data) }; }
        resolve({ status: this.statusCode, body: parsed });
      },
    };
    Promise.resolve(core(req, res)).catch(reject);
    setImmediate(() => {
      if (body !== undefined) req.emit('data', Buffer.from(JSON.stringify(body)));
      req.emit('end');
    });
  });
}

export function slugify(...parts) {
  return parts
    .join('-')
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '') // "ñ" → "n", not "n-"
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60)
    .replace(/-+$/g, '');
}

export function readTemplates(repoDir) {
  const text = readFileSync(join(repoDir, 'app/src/templates/meta.ts'), 'utf8');
  const re = /\{\s*id:\s*'([^']+)',\s*label:\s*'([^']+)',\s*service:\s*'([^']+)',\s*variant:\s*'([^']+)',\s*built:\s*(true|false)\s*\}/g;
  const out = [];
  for (const m of text.matchAll(re)) out.push({ id: m[1], label: m[2], family: m[3], variant: m[4], built: m[5] === 'true' });
  return out;
}

export function copyKeys(repoDir, templateId, seen = new Set()) {
  if (seen.has(templateId)) return new Set();
  seen.add(templateId);
  const file = join(repoDir, 'app/src/templates', templateId, 'copy.defaults.ts');
  if (!existsSync(file)) return new Set();
  const text = readFileSync(file, 'utf8');
  const keys = new Set([...text.matchAll(/^\s*'([A-Za-z0-9_.]+)'\s*:/gm)].map((m) => m[1]));
  if (keys.size) return keys;
  const from = /from\s+'\.\.\/([a-z0-9-]+)\/copy\.defaults'/.exec(text);
  return from ? copyKeys(repoDir, from[1], seen) : keys;
}

export function protectedRoutes(repoDir) {
  try {
    return JSON.parse(readFileSync(join(repoDir, 'protected-routes.json'), 'utf8')).routes ?? [];
  } catch {
    return [];
  }
}

/**
 * The templates a client may have pages on. A demo client: every built one. A real
 * client with live campaign pages: the templates of those pages, plus their -c
 * twins (which share the -a copy). A real client without live pages: every built
 * template it has not excluded.
 */
export function allowedTemplates(record, templates, protectedList) {
  const built = templates.filter((t) => t.built).map((t) => t.id);
  if (record.isDemo) return built;
  const prefix = `/p/${record.slug}/`;
  const live = protectedList.filter((r) => r.startsWith(prefix)).map((r) => r.slice(prefix.length));
  if (live.length) {
    const set = new Set(live);
    for (const id of live) if (id.endsWith('-a')) set.add(id.replace(/-a$/, '-c'));
    return built.filter((id) => set.has(id));
  }
  return built.filter((id) => !(record.excludedTemplates ?? []).includes(id));
}

export function makeCanopyApi({ repoDir, core, publisher, token = () => process.env.STUDIO_API_TOKEN || '' }) {
  const api = new Hono();
  const clientFile = (slug) => join(repoDir, 'clients', `${slug}.json`);
  const readRecord = (slug) => (existsSync(clientFile(slug)) ? JSON.parse(readFileSync(clientFile(slug), 'utf8')) : null);
  const supportsPages = () => {
    try { return readFileSync(join(repoDir, 'app/src/schema/client.ts'), 'utf8').includes(PAGES_MARKER); } catch { return false; }
  };

  api.use('*', async (c, next) => {
    const expected = token();
    if (!expected) return c.json({ error: 'not_configured', message: 'The Canopy API is off: no token is set on this studio.' }, 503);
    if (!tokenOk(c.req.header('authorization'), expected)) return c.json({ error: 'unauthorized' }, 401);
    return next();
  });

  api.get('/templates', (c) => c.json({ templates: readTemplates(repoDir) }));

  const view = (record) => {
    const templates = readTemplates(repoDir);
    const prot = protectedRoutes(repoDir);
    const base = record.isDemo ? '/demo' : '/p';
    const allowed = allowedTemplates(record, templates, prot);
    const pages = [];
    for (const t of templates) {
      if (!t.built || (record.excludedTemplates ?? []).includes(t.id)) continue;
      const route = `${base}/${record.slug}/${t.id}`;
      pages.push({ route, templateId: t.id, url: `${publisher.baseUrl}${route}/`, protected: prot.includes(route), kind: 'template' });
    }
    for (const p of record.pages ?? []) {
      const route = `${base}/${record.slug}/${p.slug}`;
      pages.push({ route, templateId: p.templateId, url: `${publisher.baseUrl}${route}/`, protected: prot.includes(route), kind: 'location',
        service: p.service, location: p.location });
    }
    return {
      slug: record.slug,
      name: record.name,
      isDemo: record.isDemo === true,
      serviceArea: record.serviceArea ?? '',
      serviceAreaList: record.serviceAreaList ?? [],
      gtm: Boolean(record.tracking?.gtmContainerId),
      gtmContainerId: record.tracking?.gtmContainerId ?? null,
      pages,
      allowedTemplates: allowed,
      supportsLocationPages: supportsPages(),
      editorUrl: `/?client=${encodeURIComponent(record.slug)}`,
    };
  };

  api.get('/clients/:slug', (c) => {
    const slug = c.req.param('slug');
    if (!OK_SLUG.test(slug)) return c.json({ error: 'bad_slug' }, 400);
    const record = readRecord(slug);
    if (!record) return c.json({ error: 'no_such_client' }, 404);
    return c.json(view({ ...record, slug }));
  });

  api.put('/clients/:slug', async (c) => {
    const slug = c.req.param('slug');
    if (!OK_SLUG.test(slug)) return c.json({ error: 'bad_slug' }, 400);
    const body = await c.req.json().catch(() => ({}));
    const dryRun = body.dryRun === true;
    const existing = readRecord(slug);
    if (existing && existing.isDemo !== true) {
      return c.json({ error: 'real_client_readonly', message: `"${slug}" is a real client with live pages; change it in the studio, where a person reviews the diff.` }, 409);
    }
    const fields = {
      name: typeof body.name === 'string' ? body.name.trim() : undefined,
      serviceArea: typeof body.serviceArea === 'string' ? body.serviceArea.trim() : undefined,
      serviceAreaList: Array.isArray(body.serviceAreaList) ? body.serviceAreaList.map((s) => String(s).trim()).filter(Boolean) : undefined,
      phoneE164: typeof body.phoneE164 === 'string' ? body.phoneE164.trim() : undefined,
      gtmContainerId: typeof body.gtmContainerId === 'string' ? body.gtmContainerId.trim() : undefined,
      ghlLocationId: typeof body.ghlLocationId === 'string' ? body.ghlLocationId.trim() : undefined,
    };
    if (fields.gtmContainerId && !/^GTM-[A-Z0-9]{4,10}$/.test(fields.gtmContainerId)) return c.json({ error: 'bad_gtm', message: 'GTM container must look like GTM-XXXXXX' }, 422);
    if (!existing) {
      if (!fields.name) return c.json({ error: 'name_required' }, 422);
      const plan = { slug, name: fields.name, isDemo: body.isDemo === true, excludedTemplates: Array.isArray(body.excludedTemplates) ? body.excludedTemplates : [] };
      if (dryRun) return c.json({ dryRun: true, created: true, plan });
      const made = await callCore(core, 'POST', '/api/dash/new-client', {
        slug, name: fields.name, serviceArea: fields.serviceArea, serviceAreaList: fields.serviceAreaList,
        phoneE164: fields.phoneE164, isDemo: body.isDemo === true, excludedTemplates: plan.excludedTemplates,
      });
      if (made.status !== 200) return c.json({ error: 'create_failed', detail: made.body }, made.status);
    }
    const record = readRecord(slug);
    const next = {
      ...record,
      ...(fields.name ? { name: fields.name } : {}),
      ...(fields.serviceArea !== undefined ? { serviceArea: fields.serviceArea } : {}),
      ...(fields.serviceAreaList ? { serviceAreaList: fields.serviceAreaList } : {}),
      ...(fields.phoneE164 ? { phone: { ...record.phone, e164: fields.phoneE164 } } : {}),
      tracking: { ...record.tracking, ...(fields.gtmContainerId ? { gtmContainerId: fields.gtmContainerId } : {}) },
      crm: { ...record.crm, ...(fields.ghlLocationId ? { ghlLocationId: fields.ghlLocationId } : {}) },
    };
    if (dryRun) return c.json({ dryRun: true, created: false, record: next });
    const saved = await callCore(core, 'POST', '/api/dash/save', { slug, record: next, message: `canopy: ${existing ? 'update' : 'create'} ${slug}` });
    if (saved.status !== 200) return c.json({ error: 'save_failed', detail: saved.body }, saved.status);
    return c.json({ slug, created: !existing, commit: saved.body?.commit ?? null, view: view({ ...next, slug }) });
  });

  api.post('/clients/:slug/pages', async (c) => {
    const slug = c.req.param('slug');
    if (!OK_SLUG.test(slug)) return c.json({ error: 'bad_slug' }, 400);
    const record = readRecord(slug);
    if (!record) return c.json({ error: 'no_such_client' }, 404);
    const body = await c.req.json().catch(() => ({}));
    const dryRun = body.dryRun === true;
    const templates = readTemplates(repoDir);
    const allowed = allowedTemplates({ ...record, slug }, templates, protectedRoutes(repoDir));
    const templateId = String(body.templateId || '');
    if (!allowed.includes(templateId)) {
      return c.json({ error: 'template_not_allowed', message: `${templateId || 'no template'} is not one of this client's templates`, allowed }, 422);
    }
    const service = String(body.service || '').trim();
    const location = String(body.location || '').trim();
    if (!service || !location) return c.json({ error: 'service_and_location_required' }, 422);
    const pageSlug = slugify(service, location);
    if (!OK_SLUG.test(pageSlug) || templates.some((t) => t.id === pageSlug) || pageSlug === 'thank-you') {
      return c.json({ error: 'bad_page_slug', pageSlug }, 422);
    }
    const copy = body.copy && typeof body.copy === 'object' ? body.copy : {};
    const known = copyKeys(repoDir, templateId);
    const unknown = Object.keys(copy).filter((k) => !known.has(k));
    if (unknown.length) return c.json({ error: 'unknown_copy_keys', unknown }, 422);
    const bad = Object.entries(copy).filter(([, v]) => typeof v !== 'string' || v.length > 2000).map(([k]) => k);
    if (bad.length) return c.json({ error: 'bad_copy_values', keys: bad }, 422);
    const pages = [...(record.pages ?? [])];
    const at = pages.findIndex((p) => p.slug === pageSlug);
    if (at >= 0 && pages[at].templateId !== templateId) {
      return c.json({ error: 'page_slug_taken', message: `${pageSlug} already exists on ${pages[at].templateId}` }, 409);
    }
    const page = { slug: pageSlug, templateId, service, location, copyOverrides: copy };
    if (at >= 0) pages[at] = page; else pages.push(page);
    const base = record.isDemo ? '/demo' : '/p';
    const route = `${base}/${slug}/${pageSlug}`;
    const url = `${publisher.baseUrl}${route}/`;
    if (dryRun) return c.json({ dryRun: true, route, url, page, supportsLocationPages: supportsPages() });
    if (!supportsPages()) {
      return c.json({ error: 'studio_needs_update', message: 'This studio’s site build does not render location pages yet (the canopy-pages: v1 change is not on main). Nothing was written.' }, 409);
    }
    const saved = await callCore(core, 'POST', '/api/dash/save', { slug, record: { ...record, pages }, message: `canopy: page ${slug}/${pageSlug}` });
    if (saved.status !== 200) return c.json({ error: 'save_failed', detail: saved.body }, saved.status);
    return c.json({ route, url, page, commit: saved.body?.commit ?? null, editorUrl: `/?client=${encodeURIComponent(slug)}&template=${templateId}` });
  });

  api.post('/publish', async (c) => {
    const st = publisher.status;
    if (st.state !== 'idle' && !['live', 'failed', 'blocked'].includes(st.state)) return c.json(st, 202);
    // Never with confirmProtected: only a person releases a change to a live campaign page.
    publisher.run({});
    await new Promise((r) => setTimeout(r, 50));
    return c.json(publisher.status, 202);
  });

  api.get('/publish', (c) => c.json({ ...publisher.status, baseUrl: publisher.baseUrl }));

  api.all('*', (c) => c.json({ error: 'unknown_endpoint' }, 404));
  return api;
}
