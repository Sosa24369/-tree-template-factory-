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

import { readFileSync, writeFileSync, readdirSync, existsSync, mkdirSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';
import { createHash, randomBytes } from 'node:crypto';
import { tmpdir } from 'node:os';

const SLUG_RE = /^[a-z0-9][a-z0-9-]*$/;
const WIDTHS = [400, 800, 1200];

/**
 * The identity every studio save is committed under. Deliberately NOT a person: a
 * studio commit is an edit made through the tool, and the tool is what signs it. Passed
 * as `-c` flags on every invocation rather than written into the clone's config, so it
 * survives a redeploy, a recreated volume, and a fresh clone — none of which ever has a
 * global git identity, which is exactly how the first real save on Railway died:
 *   fatal: unable to auto-detect email address (got 'root@<container>.(none)')
 */
export const STUDIO_IDENTITY = { name: 'Template Studio', email: 'studio@leedscompany.local' };

/**
 * @param {{
 *   repoRoot: string,
 *   afterCommit?: (commit: string) => Promise<void> | void,
 *   identity?: { name: string, email: string },
 * }} opts
 */
export function dashboardCore(opts) {
        const ROOT = opts.repoRoot;
        const CLIENTS = join(ROOT, 'clients');
        const PUB = join(ROOT, 'app', 'public');
        const ASSETS = join(PUB, 'assets');

        const identity = opts.identity ?? STUDIO_IDENTITY;
        const GIT_BASE = ['-c', `user.name=${identity.name}`, '-c', `user.email=${identity.email}`];
        const git = (args) => execFileSync('git', [...GIT_BASE, ...args], { cwd: ROOT, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
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

        /* ---- logo pipeline: ONE file, no srcset (see generate-logo-variants.mjs) ----
         * A logo is not a photo and must not go through the srcset path above. The
         * header renders it large enough to be the mobile LCP on the text-hero
         * templates, and React 19's SSR float hoists a preload for the fallback `src`
         * of any <img srcSet> — which never matches the candidate the browser then
         * picks, so every logo would download twice on the LCP path (measured:
         * storm 99 -> 96). One 192px file, sized for the largest the header ever shows
         * at 2x, is small AND crisp AND floats nothing. Never upscaled: a smaller
         * source keeps its own size rather than being blown up.
         */
        async function processLogo(slug, buffer) {
  const { default: sharp } = await import('sharp');
  mkdirSync(assetDir(slug), { recursive: true });

  const LOGO_PX = 192;
  const meta = await sharp(buffer).metadata();
  const longest = Math.max(meta.width ?? 0, meta.height ?? 0);
  const box = longest > 0 ? Math.min(LOGO_PX, longest) : LOGO_PX;

  const buf = await sharp(buffer)
    // `contain` on a TRANSPARENT background keeps a non-square mark intact without
    // inventing a white plate behind a logo that was designed to sit on the brand
    // colour. The header lockup centres whatever it is given.
    .resize({ width: box, height: box, fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 }, withoutEnlargement: true })
    .webp({ quality: 90 })
    .toBuffer();
  const out = await sharp(buf).metadata();
  const hash = createHash('sha1').update(buf).digest('hex').slice(0, 8);
  const name = `logo-header-${hash}.webp`;
  writeFileSync(join(assetDir(slug), name), buf);
  return { src: `/assets/${slug}/${name}`, width: out.width ?? box, height: out.height ?? box, sourceLongestEdge: longest };
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

    // POST /api/dash/upload-logo  { slug, filename, dataBase64 }
    if (req.method === 'POST' && url === '/api/dash/upload-logo') {
      const { slug, dataBase64 } = await readBody(req);
      if (!okSlug(slug)) return send(res, 400, { error: 'bad slug' });
      const b64 = String(dataBase64 || '').replace(/^data:[^,]+,/, '');
      if (!b64) return send(res, 400, { error: 'no image data' });
      const logo = await processLogo(slug, Buffer.from(b64, 'base64'));
      return send(res, 200, { logo });
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
      const file = clientFile(slug);
      const next = JSON.stringify(clean, null, 2) + '\n';

      // ATOMIC: the record on disk is either the last commit or the new commit — never
      // a written-but-uncommitted state. The first real save on Railway wrote and
      // STAGED the file, then `git commit` died for want of an identity, and the clone
      // was left holding the edit with nothing in history to show for it. A later
      // publish would have built and shipped it. So: remember what was there, and if
      // the commit fails for any reason other than "nothing changed", put it back and
      // unstage everything this save staged.
      const previous = existsSync(file) ? readFileSync(file, 'utf8') : null;
      const rollback = () => {
        try { git(['reset', '-q', '--', file]); } catch {}
        if (existsSync(assetDir(slug))) { try { git(['reset', '-q', '--', assetDir(slug)]); } catch {} }
        if (previous === null) { try { rmSync(file, { force: true }); } catch {} }
        else writeFileSync(file, previous, 'utf8');
      };

      writeFileSync(file, next, 'utf8');
      git(['add', '--', file]);
      if (existsSync(assetDir(slug))) git(['add', '--', assetDir(slug)]);

      // The message is the operator's. No trailer: a studio save is Faizan's edit,
      // made through the tool — it is not co-authored by anything.
      const msg = (message && String(message).trim()) || `studio: update ${slug}`;
      let commit = null;
      try {
        git(['commit', '-m', msg]);
        commit = git(['rev-parse', '--short', 'HEAD']).trim();
      } catch (e) {
        const out = `${e.stdout || ''}${e.stderr || ''}`;
        // Nothing staged (no net change) is not a failure — and nothing to roll back.
        if (/nothing to commit|no changes added to commit/i.test(out)) {
          return send(res, 200, { ok: true, commit: null, warnings });
        }
        rollback();
        const detail = (e.stderr || e.stdout || String(e)).toString().trim().split('\n').slice(-6).join('\n');
        return send(res, 500, { error: 'commit_failed', detail, rolledBack: true });
      }
      // The commit exists locally. A failed push is NOT rolled back — the record on
      // disk matches history, and the next successful save pushes both commits. It is
      // reported here, with git's stderr, rather than left to propagate: the handler's
      // outer catch would flatten it to a bare 500 with no detail.
      try {
        await afterCommit(commit);
      } catch (e) {
        if (e?.message === 'push_failed') return send(res, 502, { error: 'push_failed', detail: e.detail ?? '', commit, warnings });
        throw e;
      }
      return send(res, 200, { ok: true, commit, warnings });
    }

    // POST /api/dash/new-client
    //   { slug, name, serviceArea?, serviceAreaList?, phoneE164?, brand?, excludedTemplates?, isDemo? }
    //
    // BUILDS A NEUTRAL RECORD. It used to DUPLICATE an existing client, which carried
    // that client's `crm.ghlLocationId` and `tracking.gtmContainerId` into the new
    // record — so a new client created from Texas Tree Tops would have routed its
    // leads into TTT's GHL sub-account and fired its conversions into TTT's ad
    // account, and its SMS consent line would have read "text messages from Texas
    // Tree Tops". None of the existing guards catch that: the location id never
    // reaches any HTML, so R4 (which greps built pages) cannot see it.
    //
    // Nothing identifying is inherited now. Every CRM and tracking field starts
    // EMPTY, and the readiness checklist in the studio lists them as blockers.
    if (req.method === 'POST' && url === '/api/dash/new-client') {
      const body = await readBody(req);
      const slug = body.slug;
      if (!okSlug(slug)) return send(res, 400, { error: 'slug must be lowercase letters, numbers and hyphens' });
      if (existsSync(clientFile(slug))) return send(res, 409, { error: `client "${slug}" already exists` });

      const name = String(body.name ?? '').trim();
      if (!name) return send(res, 400, { error: 'company name is required' });

      const e164 = String(body.phoneE164 ?? '').trim();
      if (e164 && !/^\+\d{10,15}$/.test(e164)) return send(res, 400, { error: `phone "${e164}" is not E.164 (+1XXXXXXXXXX)` });

      const brand = body.brand ?? {};
      const isDemo = body.isDemo === true;

      const record = {
        _comment: `Created in the studio. CRM and tracking start EMPTY on purpose — nothing is inherited from another client. See the readiness checklist for what is still needed before this client can take a real lead.`,
        ...(isDemo ? { isDemo: true } : {}),
        slug,
        name,
        serviceArea: String(body.serviceArea ?? '').trim(),
        serviceAreaList: Array.isArray(body.serviceAreaList) ? body.serviceAreaList.map((c) => String(c).trim()).filter(Boolean) : [],
        brand: {
          logoUrl: null,
          primaryColor: typeof brand.primaryColor === 'string' ? brand.primaryColor : '#1f3d2b',
          accentColor: typeof brand.accentColor === 'string' ? brand.accentColor : '#c8952b',
          onPrimaryColor: typeof brand.onPrimaryColor === 'string' ? brand.onPrimaryColor : '#ffffff',
          ...(brand.fontPairing ? { fontPairing: brand.fontPairing } : {}),
          ...(brand.spacingScale ? { spacingScale: brand.spacingScale } : {}),
        },
        phone: { e164, kind: 'direct', displayOverride: null, googleAdsCallAsset: null },
        leadDestination: { thankYouUrl: '/thank-you', isExternalAllowed: false },
        consent: {
          // Composed with THIS client's name. A2P expects the sender to be named.
          smsCopy: `By checking this box you agree to receive text messages from ${name} about your estimate and service. Message frequency varies. Message and data rates may apply. Reply STOP to opt out or HELP for help.`,
          required: false,
          privacyPolicyUrl: '',
          termsOfServiceUrl: '',
        },
        // Empty, always. Filled in by hand once the GHL sub-account exists.
        crm: { ghlLocationId: '', adClickIdFieldId: null, attributionFieldIds: {}, leadTags: [], leadSource: '' },
        tracking: { gtmContainerId: null, callRailSwapScriptUrl: null },
        photos: {},
        reviews: [],
        copyOverrides: {},
        excludedTemplates: Array.isArray(body.excludedTemplates) ? body.excludedTemplates.filter((t) => typeof t === 'string') : [],
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
