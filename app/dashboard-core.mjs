/**
 * dashboardCore() — the content dashboard's backend logic, shared by TWO adapters:
 *
 *   app/dashboard-server.mjs   the Vite dev plugin (local, no auth, apply:'serve')
 *   server/index.mjs           the Hono server deployed to Railway (auth, git sync,
 *                              publish)
 *
 * One implementation of validation, the sharp pipeline, the R4 write confinement and
 * the R2 layout lock, so the two environments cannot drift apart.
 *
 * WHAT IT GUARANTEES (unchanged from the original plugin):
 *  - Every write is confined to /clients/<slug>.json or app/public/assets/<slug>/.
 *    `slug` is validated against /^[a-z0-9-]+$/ so one client can NEVER write into
 *    another's folder (R4, structural).
 *  - Uploads run the SAME sharp pipeline as the build scripts (WebP q80, cap 1600w,
 *    400/800/1200w variants).
 *  - Saving validates the P0 invariants server-side, refuses a -a layout
 *    (422 layout_locked), then git-commits and awaits opts.afterCommit — the Railway
 *    server pushes there; a failed push propagates so the adapter can answer
 *    502 push_failed.
 *
 * Returns `handle(req, res)`: a plain Node handler that returns true when it handled
 * the request (any /api/dash/* path) and false otherwise.
 */

import { readFileSync, writeFileSync, readdirSync, existsSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';
import { createHash, randomBytes } from 'node:crypto';
import { tmpdir } from 'node:os';

const SLUG_RE = /^[a-z0-9][a-z0-9-]*$/;
const WIDTHS = [400, 800, 1200];

/** @param {{ repoRoot: string, afterCommit?: (commit: string) => Promise<void> | void }} opts */
export function dashboardCore(opts) {
        const ROOT = opts.repoRoot;
        const CLIENTS = join(ROOT, 'clients');
        const PUB = join(ROOT, 'app', 'public');
        const ASSETS = join(PUB, 'assets');

        const git = (args) => execFileSync('git', args, { cwd: ROOT, encoding: 'utf8' });
        const afterCommit = opts.afterCommit ?? (() => {});
        const clientFile = (slug) => join(CLIENTS, `${slug}.json`);
        const assetDir = (slug) => join(ASSETS, slug);
        const okSlug = (slug) => typeof slug === 'string' && SLUG_RE.test(slug);

        const send = (res, code, body) => {
  res.statusCode = code;
  res.setHeader('content-type', 'application/json');
  res.end(JSON.stringify(body));
  return true; // 'handled' — the adapters use this
        };
        const readBody = (req) =>
  new Promise((resolve, reject) => {
    let data = '';
    req.on('data', (c) => {
      data += c;
      if (data.length > 40 * 1024 * 1024) reject(new Error('body too large'));
    });
    req.on('end', () => {
      try {
        resolve(data ? JSON.parse(data) : {});
      } catch (e) {
        reject(e);
      }
    });
    req.on('error', reject);
  });

        /* ---- validation shared with the UI (belt-and-suspenders) ---- */
        function validate(record) {
  const errors = [];
  const warnings = [];
  const e164 = record?.phone?.e164?.trim?.() ?? '';
  if (!e164) errors.push('Phone number is required.');
  else if (!/^\+\d{10,15}$/.test(e164)) errors.push(`Phone "${e164}" is not E.164 (+1XXXXXXXXXX).`);

  if (!record?.name?.trim?.()) errors.push('Company name is required.');

  const ty = record?.leadDestination?.thankYouUrl?.trim?.() ?? '';
  if (!ty) errors.push('Thank-you URL is required.');
  else if (/titantreeservicetx\.com/i.test(ty)) errors.push('Thank-you URL must never be titantreeservicetx.com (the leaked external redirect).');
  else if (/^[a-z][a-z0-9+.-]*:\/\//i.test(ty) && record?.leadDestination?.isExternalAllowed !== true)
    errors.push('Thank-you URL is off-domain but "Allow off-domain redirect" is off. Keep it relative, or confirm it is this client’s own domain and enable the toggle.');

  if (!record?.consent?.smsCopy?.trim?.()) errors.push('SMS consent copy is required.');

  if (!record?.consent?.privacyPolicyUrl?.trim?.() || !record?.consent?.termsOfServiceUrl?.trim?.())
    warnings.push('Privacy Policy and/or Terms of Service URL is blank (legalUrlsPending). Allowed, but A2P registration needs both before running SMS.');

  return { errors, warnings };
        }

        /* ---- sharp pipeline: optimise + responsive variants ---- */
        async function processImage(slug, filename, buffer, focal, aspect) {
  const { default: sharp } = await import('sharp');
  mkdirSync(assetDir(slug), { recursive: true });

  let pipe = sharp(buffer);
  let meta = await pipe.metadata();

  // Optional focal-point cover-crop to a target aspect, baked into the file so no
  // template change is needed to fix a bad crop.
  if (focal && aspect && meta.width && meta.height) {
    const iw = meta.width, ih = meta.height;
    const target = aspect; // width/height
    let cw = iw, ch = Math.round(iw / target);
    if (ch > ih) { ch = ih; cw = Math.round(ih * target); }
    const fx = Math.min(1, Math.max(0, focal.x ?? 0.5));
    const fy = Math.min(1, Math.max(0, focal.y ?? 0.5));
    let left = Math.round(fx * iw - cw / 2);
    let top = Math.round(fy * ih - ch / 2);
    left = Math.min(Math.max(0, left), iw - cw);
    top = Math.min(Math.max(0, top), ih - ch);
    buffer = await sharp(buffer).extract({ left, top, width: cw, height: ch }).toBuffer();
    pipe = sharp(buffer);
    meta = await pipe.metadata();
  }

  // Base (optimised) file: cap 1600w, WebP q80 — the optimize-assets settings.
  let base = pipe;
  if (meta.width && meta.width > 1600) base = base.resize({ width: 1600, withoutEnlargement: true });
  const baseBuf = await base.webp({ quality: 80 }).toBuffer();
  const outMeta = await sharp(baseBuf).metadata();

  const hash = createHash('sha1').update(baseBuf).digest('hex').slice(0, 8);
  const safeBase = (filename || 'photo').replace(/\.[a-z0-9]+$/i, '').replace(/[^a-z0-9-]+/gi, '-').toLowerCase().slice(0, 40) || 'photo';
  const name = `${safeBase}-${hash}.webp`;
  writeFileSync(join(assetDir(slug), name), baseBuf);

  // Responsive variants — generate-srcset settings (q78), never upscale.
  const intrinsic = outMeta.width ?? 0;
  const parts = [];
  for (const w of WIDTHS) {
    if (!intrinsic || w >= intrinsic) continue;
    const vName = name.replace(/\.webp$/, `-${w}w.webp`);
    const vBuf = await sharp(baseBuf).resize({ width: w, withoutEnlargement: true }).webp({ quality: 78 }).toBuffer();
    writeFileSync(join(assetDir(slug), vName), vBuf);
    parts.push(`/assets/${slug}/${vName} ${w}w`);
  }
  const src = `/assets/${slug}/${name}`;
  parts.push(`${src} ${intrinsic}w`);

  return { src, srcset: parts.join(', '), width: outMeta.width ?? null, height: outMeta.height ?? null, alt: '' };
        }

        /* ---- routes ---- */
        return async function handle(req, res) {
  const url = req.url || '';
  if (!url.startsWith('/api/dash/')) return false;

  try {
    // GET /api/dash/clients
    if (req.method === 'GET' && url === '/api/dash/clients') {
      const list = readdirSync(CLIENTS)
        .filter((f) => f.endsWith('.json'))
        .map((f) => {
          const slug = f.replace(/\.json$/, '');
          let name = slug;
          try { name = JSON.parse(readFileSync(join(CLIENTS, f), 'utf8')).name || slug; } catch {}
          return { slug, name };
        })
        .sort((a, b) => a.name.localeCompare(b.name));
      return send(res, 200, { clients: list });
    }

    // GET /api/dash/client/:slug
    let m = url.match(/^\/api\/dash\/client\/([^/?]+)$/);
    if (req.method === 'GET' && m) {
      const slug = decodeURIComponent(m[1]);
      if (!okSlug(slug) || !existsSync(clientFile(slug))) return send(res, 404, { error: 'no such client' });
      return send(res, 200, { record: JSON.parse(readFileSync(clientFile(slug), 'utf8')) });
    }

    // GET /api/dash/assets/:slug — existing images to pick from
    m = url.match(/^\/api\/dash\/assets\/([^/?]+)$/);
    if (req.method === 'GET' && m) {
      const slug = decodeURIComponent(m[1]);
      if (!okSlug(slug)) return send(res, 400, { error: 'bad slug' });
      const dir = assetDir(slug);
      const files = existsSync(dir)
        ? readdirSync(dir)
            .filter((f) => /\.(webp|jpg|jpeg|png|svg)$/i.test(f) && !/-\d+w\.webp$/i.test(f))
            .map((f) => ({ name: f, src: `/assets/${slug}/${f}` }))
        : [];
      return send(res, 200, { files });
    }

    // POST /api/dash/diff  { slug, record } — diff proposed vs current, no write
    if (req.method === 'POST' && url === '/api/dash/diff') {
      const { slug, record } = await readBody(req);
      if (!okSlug(slug)) return send(res, 400, { error: 'bad slug' });
      const proposed = JSON.stringify(record, null, 2) + '\n';
      const tmp = join(tmpdir(), `dash-${slug}-${randomBytes(4).toString('hex')}.json`);
      writeFileSync(tmp, proposed);
      const current = existsSync(clientFile(slug)) ? clientFile(slug) : '/dev/null';
      let diff = '';
      try { diff = git(['diff', '--no-index', '--', current, tmp]); } catch (e) { diff = e.stdout || ''; }
      return send(res, 200, { diff: diff.replace(new RegExp(tmp, 'g'), `clients/${slug}.json`) });
    }

    // POST /api/dash/upload  { slug, filename, dataBase64, focal?, aspect? }
    if (req.method === 'POST' && url === '/api/dash/upload') {
      const { slug, filename, dataBase64, focal, aspect } = await readBody(req);
      if (!okSlug(slug)) return send(res, 400, { error: 'bad slug' });
      const b64 = String(dataBase64 || '').replace(/^data:[^,]+,/, '');
      if (!b64) return send(res, 400, { error: 'no image data' });
      const buffer = Buffer.from(b64, 'base64');
      const photo = await processImage(slug, filename, buffer, focal, aspect);
      return send(res, 200, { photo });
    }

    // POST /api/dash/save  { slug, record, message }
    if (req.method === 'POST' && url === '/api/dash/save') {
      const { slug, record, message } = await readBody(req);
      if (!okSlug(slug)) return send(res, 400, { error: 'bad slug' });
      // R2 — a control (-a) template's layout can never be written, whatever the UI
      // sends. The editor hides the controls; this is the guard.
      const lockedLayout = Object.keys(record?.layout ?? {}).find((id) => /-a$/.test(id));
      if (lockedLayout) return send(res, 422, { error: 'layout_locked', templateId: lockedLayout });
      const { errors, warnings } = validate(record);
      if (errors.length) return send(res, 422, { error: 'validation failed', errors, warnings });

      const clean = { ...record, slug };
      writeFileSync(clientFile(slug), JSON.stringify(clean, null, 2) + '\n', 'utf8');

      git(['add', '--', clientFile(slug)]);
      if (existsSync(assetDir(slug))) git(['add', '--', assetDir(slug)]);
      const msg = (message && String(message).trim()) || `dashboard: update ${slug}`;
      let commit = null;
      try {
        git(['commit', '-m', `${msg}\n\nCo-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>`]);
        commit = git(['rev-parse', '--short', 'HEAD']).trim();
        await afterCommit(commit);
      } catch (e) {
        // Nothing staged (no net change) is not a failure.
        if (!/nothing to commit/i.test(e.stdout || '')) throw e;
      }
      return send(res, 200, { ok: true, commit, warnings });
    }

    // POST /api/dash/new-client  { slug, fromSlug }
    if (req.method === 'POST' && url === '/api/dash/new-client') {
      const { slug, fromSlug } = await readBody(req);
      if (!okSlug(slug)) return send(res, 400, { error: 'slug must be lowercase letters, numbers and hyphens' });
      if (existsSync(clientFile(slug))) return send(res, 409, { error: `client "${slug}" already exists` });
      if (!okSlug(fromSlug) || !existsSync(clientFile(fromSlug))) return send(res, 400, { error: 'no template client to duplicate' });

      const base = JSON.parse(readFileSync(clientFile(fromSlug), 'utf8'));
      // Start empty on everything client-identifying and, crucially, on IMAGES:
      // never deep-copy another client's photos (R4). Slots are flagged empty.
      const record = {
        ...base,
        slug,
        name: '',
        brand: { ...base.brand, logoUrl: null },
        photos: {},
        reviews: [],
        copyOverrides: {},
        _comment: `Duplicated from ${fromSlug} as a starting point. Fill name/phone/area, add this client's OWN photos (none copied), and set legal URLs before running SMS.`,
      };
      mkdirSync(assetDir(slug), { recursive: true });
      // .gitkeep so the empty asset folder is tracked and obviously belongs to this client.
      writeFileSync(join(assetDir(slug), '.gitkeep'), '');
      writeFileSync(clientFile(slug), JSON.stringify(record, null, 2) + '\n', 'utf8');
      return send(res, 200, { ok: true, record, emptyPhotoSlots: ['storm', 'removal', 'trimming', 'generic'] });
    }

    return send(res, 404, { error: 'unknown endpoint' });
  } catch (err) {
    return send(res, 500, { error: String(err?.message || err) });
  }
        };
}
