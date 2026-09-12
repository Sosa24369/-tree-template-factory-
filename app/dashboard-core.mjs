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

import { readFileSync, writeFileSync, readdirSync, existsSync, mkdirSync, rmSync, renameSync } from 'node:fs';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';
import { createHash, randomBytes } from 'node:crypto';
import { tmpdir } from 'node:os';
import { sniffHeic, heroLegibility, logoChecks } from './image-checks.mjs';
import { MASTERS, slotById } from './src/templates/imageSlots.mjs';
import { slotsForPosition } from './src/lib/placement.mjs';

const SLUG_RE = /^[a-z0-9][a-z0-9-]*$/;
/** Every width a slot renders at 2×, from the contract; the master itself (≤1600) is the last candidate. */
const WIDTHS = [400, 800, 1200, 1600];
const MASTER_MAX = 1600;
const PIPELINE_VERSION = 2;

/** An upload the pipeline refuses, with the sentence the UI shows. */
class UploadRefused extends Error {
  constructor(code, status, message) { super(message); this.code = code; this.status = status; }
}

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

        /**
         * STAGING — where an upload's files wait until a record refers to them.
         *
         * The pipeline used to write straight into app/public/assets/<slug>/, while the
         * record was only updated in the browser and written on save. Upload a photo and
         * then not save it — navigate away, save a different change, let a reorder replace
         * the in-memory list — and the files stayed on disk with nothing pointing at them,
         * and the next save's `git add -- <assetDir>` swept them into the commit. Observed
         * in 84a5905: four orphaned derivatives, 159 KB, referenced by nothing.
         *
         * Now a photo lands here, is served from here so the studio can preview it, and is
         * MOVED into assets/ only by the save that commits a record naming it. Anything
         * still here when that save runs was abandoned, and is deleted. Outside app/public
         * so it can never be published, and gitignored so it can never be committed.
         */
        const STAGING = join(ROOT, '.studio-staging');
        const stageDir = (slug) => join(STAGING, slug);
        const okSlug = (slug) => typeof slug === 'string' && SLUG_RE.test(slug);

        /** Every /assets/<slug>/<file> this record names, anywhere in it. */
        const referencedAssets = (record, slug) => {
          const out = new Set();
          const re = new RegExp(`/assets/${slug}/([^"'\\s,)]+)`, 'g');
          const blob = JSON.stringify(record ?? {});
          for (const m of blob.matchAll(re)) out.add(m[1]);
          return out;
        };

        /**
         * Move the staged files this record names into assets/, and delete the rest.
         * Returns the promoted filenames so the caller can stage exactly those in git
         * rather than adding the whole folder — which is how orphans got committed.
         */
        const promoteStaged = (record, slug) => {
          const from = stageDir(slug);
          if (!existsSync(from)) return { promoted: [], discarded: [] };
          const wanted = referencedAssets(record, slug);
          const promoted = [];
          const discarded = [];
          mkdirSync(assetDir(slug), { recursive: true });
          for (const f of readdirSync(from)) {
            const src = join(from, f);
            if (wanted.has(f)) {
              renameSync(src, join(assetDir(slug), f));
              promoted.push(f);
            } else {
              // Uploaded, then never referenced by the record being saved. Abandoned.
              try { rmSync(src, { force: true }); } catch {}
              discarded.push(f);
            }
          }
          try { rmSync(from, { recursive: true, force: true }); } catch {}
          return { promoted, discarded };
        };

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

        /* ---- the photo pipeline (image contract, v2) ----
         *
         * In:  any raster (JPEG, PNG, WebP, TIFF, GIF) — HEIC is refused with a message
         *      (see image-checks.sniffHeic), never converted.
         * Then: auto-rotate from EXIF, drop every byte of metadata, crop to the master
         *      aspect (4:3 by default) around the focal point the operator clicked,
         *      refuse anything under the minimum for the slots it will land in — with
         *      the number — and emit WebP at 400 / 800 / 1200 / 1600 wide plus the
         *      master itself (never upscaled, never above 1600). The original is never
         *      written to disk.
         * Out: a PhotoSet with srcset, the focal point mapped into the master's own
         *      coordinates (so cover slots keep the subject), and a `pipeline` block
         *      recording what came in.
         *
         * JPEG fallback: not emitted, deliberately. The templates render <img srcset>
         * and are frozen (no <picture>), every browser the pages are sold into has
         * decoded WebP since 2020, and an unreferenced JPEG per size would only add
         * weight to every deploy. Three lines here if that ever changes.
         */
        async function processImage(slug, filename, buffer, focal, aspect, placement = {}) {
  const { default: sharp } = await import('sharp');
  mkdirSync(stageDir(slug), { recursive: true });

  if (sniffHeic(buffer)) {
    throw new UploadRefused('heic', 415, 'This is an iPhone HEIC file. Export it as JPEG or PNG first (Photos → File → Export → JPEG, or Settings → Camera → Formats → Most Compatible) and upload that. The studio does not convert HEIC: the image library here has no HEVC decoder, and a silently broken photo is worse than this message.');
  }

  // Auto-orient from EXIF and drop the metadata in the same pass (sharp writes no
  // metadata unless asked to). Everything after this works on the oriented pixels.
  let source;
  try { source = await sharp(buffer, { failOn: 'none' }).rotate().toBuffer({ resolveWithObject: true }); }
  catch (e) { throw new UploadRefused('unreadable', 415, `This file could not be read as an image (${String(e?.message || e).split('\n')[0]}). Upload a JPEG or PNG.`); }
  const srcMeta = { width: source.info.width ?? null, height: source.info.height ?? null, format: source.info.format ?? null, bytes: buffer.length };
  buffer = source.data;
  let meta = source.info;
  const warnings = [];

  // The master aspect. 4:3 unless the operator chose "original" (aspect === null).
  const target = aspect === null ? null : (typeof aspect === 'number' && aspect > 0 ? aspect : MASTERS.photo.aspect[0] / MASTERS.photo.aspect[1]);
  let masterFocal = focal ? { x: Math.min(1, Math.max(0, focal.x ?? 0.5)), y: Math.min(1, Math.max(0, focal.y ?? 0.5)) } : null;
  if (target && meta.width && meta.height) {
    const iw = meta.width, ih = meta.height;
    let cw = iw, ch = Math.round(iw / target);
    if (ch > ih) { ch = ih; cw = Math.round(ih * target); }
    const fx = masterFocal?.x ?? 0.5, fy = masterFocal?.y ?? 0.5;
    let left = Math.round(fx * iw - cw / 2);
    let top = Math.round(fy * ih - ch / 2);
    left = Math.min(Math.max(0, left), iw - cw);
    top = Math.min(Math.max(0, top), ih - ch);
    if (cw !== iw || ch !== ih) {
      buffer = await sharp(buffer).extract({ left, top, width: cw, height: ch }).toBuffer();
      meta = await sharp(buffer).metadata();
      // The subject's position inside the MASTER, which is what object-position needs.
      if (masterFocal) masterFocal = { x: +(((fx * iw) - left) / cw).toFixed(3), y: +(((fy * ih) - top) / ch).toFixed(3) };
    }
  } else if (target === null && meta.width && meta.height) {
    const r = meta.width / meta.height;
    warnings.push(`Kept at its original shape (${r >= 1 ? `${r.toFixed(2)}:1` : `1:${(1 / r).toFixed(2)}`}). Grids of frame slots take each photo's own shape, so a set of mixed shapes renders an uneven grid; 4:3 keeps it even.`);
  }

  // The minimum for the slots this photo lands in. The caller says which set and
  // position (an append lands at index = count); the hero plate wants 1600.
  const set = placement.set, count = Number(placement.count ?? 0), index = Number(placement.index ?? count);
  const slots = (set ? slotsForPosition(set, index, Math.max(count, index + 1)) : [])
    .map((l) => slotById(l.templateId, l.slotId)).filter(Boolean);
  let need = MASTERS.photo.min, needWhy = 'a 4:3 tile';
  for (const s of slots) if (MASTERS[s.master].min[0] > need[0]) { need = MASTERS[s.master].min; needWhy = `the ${s.template} ${s.label.split(' — ')[0].toLowerCase()}`; }
  const mw = meta.width ?? 0, mh = meta.height ?? 0;
  if (mw < need[0] || mh < need[1]) {
    const dim = mw < need[0] ? `${mw} px wide` : `${mh} px tall`;
    const needDim = mw < need[0] ? `${need[0]}` : `${need[1]}`;
    const cropped = srcMeta.width && mw < srcMeta.width ? ` (${srcMeta.width} × ${srcMeta.height} before the 4:3 crop)` : '';
    throw new UploadRefused('too_small', 422, `${dim}${cropped}, ${needWhy} needs ${needDim}. Send a larger original — the pipeline never upscales.`);
  }
  if (set === 'removal' && index !== 0 && mw < MASTERS.heroPlate.min[0]) warnings.push(`Fine for tiles, but at ${mw} px wide it cannot lead the removal set: the removal-a hero plate needs ${MASTERS.heroPlate.min[0]}.`);

  // Master: ≤1600 wide, WebP q80.
  let base = sharp(buffer);
  if (mw > MASTER_MAX) base = base.resize({ width: MASTER_MAX, withoutEnlargement: true });
  const baseBuf = await base.webp({ quality: 80 }).toBuffer();
  const outMeta = await sharp(baseBuf).metadata();

  const hash = createHash('sha1').update(baseBuf).digest('hex').slice(0, 8);
  const safeBase = (filename || 'photo').replace(/\.[a-z0-9]+$/i, '').replace(/[^a-z0-9-]+/gi, '-').toLowerCase().slice(0, 40) || 'photo';
  const name = `${safeBase}-${hash}.webp`;
  writeFileSync(join(stageDir(slug), name), baseBuf);

  // Every rendered width, never upscaled; q78 like generate-srcset.
  const intrinsic = outMeta.width ?? 0;
  const parts = [];
  for (const w of WIDTHS) {
    if (!intrinsic || w >= intrinsic) continue;
    const vName = name.replace(/\.webp$/, `-${w}w.webp`);
    const vBuf = await sharp(baseBuf).resize({ width: w, withoutEnlargement: true }).webp({ quality: 78 }).toBuffer();
    writeFileSync(join(stageDir(slug), vName), vBuf);
    parts.push(`/assets/${slug}/${vName} ${w}w`);
  }
  const src = `/assets/${slug}/${name}`;
  parts.push(`${src} ${intrinsic}w`);

  const aspectLabel = target === null ? 'original' : Math.abs(target - 4 / 3) < 0.01 ? '4:3' : `${target.toFixed(3)}:1`;
  return {
    photo: {
      src, srcset: parts.join(', '), width: outMeta.width ?? null, height: outMeta.height ?? null, alt: '',
      ...(masterFocal ? { focal: masterFocal } : {}),
      pipeline: { version: PIPELINE_VERSION, at: new Date().toISOString(), source: srcMeta, master: [outMeta.width ?? 0, outMeta.height ?? 0], aspect: aspectLabel },
    },
    warnings,
    slots: slots.map((s) => ({ template: s.template, id: s.id, label: s.label, policy: s.policy })),
  };
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
        async function processLogo(slug, buffer, filename = '') {
  const { default: sharp } = await import('sharp');
  mkdirSync(stageDir(slug), { recursive: true });
  if (sniffHeic(buffer)) throw new UploadRefused('heic', 415, 'This is an iPhone HEIC file. Export the logo as SVG or PNG and upload that.');

  // Image contract: accept SVG and transparent PNG (and any raster), trim the
  // transparent padding so the mark fills its box, and run the checks — a baked-in
  // background box, contrast against the header papers and ink. Findings come back
  // to the UI as warnings; nothing here refuses a logo, because the fallback (the
  // company name as a wordmark) is worse than a logo with a warning.
  let checks;
  try { checks = await logoChecks(buffer, { filename }); }
  catch (e) { throw new UploadRefused('unreadable', 415, `This file could not be read as an image (${String(e?.message || e).split('\n')[0]}). Upload an SVG, PNG or JPEG.`); }

  const LOGO_PX = 192;
  const longest = Math.max(checks.trimmedTo.width ?? 0, checks.trimmedTo.height ?? 0);
  const box = longest > 0 ? Math.min(LOGO_PX, longest) : LOGO_PX;
  if (longest < MASTERS.logo.min) checks.warnings.push(`After trimming, the mark is ${longest} px on its longest edge; the header shows it at 96 px, so ${MASTERS.logo.min} px is the floor for a sharp 2× render. It was NOT upscaled.`);

  const buf = await sharp(checks.trimmed)
    // `contain` on a TRANSPARENT background keeps a non-square mark intact without
    // inventing a white plate behind a logo that was designed to sit on the brand
    // colour. The header lockup centres whatever it is given.
    .resize({ width: box, height: box, fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 }, withoutEnlargement: true })
    .webp({ quality: 90 })
    .toBuffer();
  const out = await sharp(buf).metadata();
  const hash = createHash('sha1').update(buf).digest('hex').slice(0, 8);
  const name = `logo-header-${hash}.webp`;
  writeFileSync(join(stageDir(slug), name), buf);
  const { trimmed: _t, ...report } = checks;
  return { src: `/assets/${slug}/${name}`, width: out.width ?? box, height: out.height ?? box, sourceLongestEdge: longest, checks: report };
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

    // POST /api/dash/upload  { slug, filename, dataBase64, focal?, aspect?, set?, index?, count? }
    //   aspect: a number (width/height) crops to it; null keeps the original; absent = 4:3.
    //   set/index/count say where the photo will land so the minimum is the right one.
    if (req.method === 'POST' && url === '/api/dash/upload') {
      const { slug, filename, dataBase64, focal, aspect, set, index, count } = await readBody(req);
      if (!okSlug(slug)) return send(res, 400, { error: 'bad slug' });
      const b64 = String(dataBase64 || '').replace(/^data:[^,]+,/, '');
      if (!b64) return send(res, 400, { error: 'no image data' });
      const buffer = Buffer.from(b64, 'base64');
      try {
        const result = await processImage(slug, filename, buffer, focal, aspect, { set, index, count });
        return send(res, 200, result);
      } catch (e) {
        if (e instanceof UploadRefused) return send(res, e.status, { error: e.code, message: e.message });
        throw e;
      }
    }

    // POST /api/dash/upload-logo  { slug, filename, dataBase64 }
    if (req.method === 'POST' && url === '/api/dash/upload-logo') {
      const { slug, filename, dataBase64 } = await readBody(req);
      if (!okSlug(slug)) return send(res, 400, { error: 'bad slug' });
      const b64 = String(dataBase64 || '').replace(/^data:[^,]+,/, '');
      if (!b64) return send(res, 400, { error: 'no image data' });
      try {
        const logo = await processLogo(slug, Buffer.from(b64, 'base64'), filename);
        return send(res, 200, { logo });
      } catch (e) {
        if (e instanceof UploadRefused) return send(res, e.status, { error: e.code, message: e.message });
        throw e;
      }
    }

    // POST /api/dash/hero-check  { slug, src, focal?, primaryColor? }
    //   The contrast of the white removal-a headline over this photo as the hero
    //   plate, at tablet and desktop, with the template's scrim composited; and the
    //   extra scrim that would lift it to 4.5:1. Mobile paints no plate.
    if (req.method === 'POST' && url === '/api/dash/hero-check') {
      const { slug, src, focal, primaryColor } = await readBody(req);
      if (!okSlug(slug)) return send(res, 400, { error: 'bad slug' });
      const rel = String(src || '');
      if (!rel.startsWith(`/assets/${slug}/`) || rel.includes('..')) return send(res, 400, { error: 'src must be one of this client\'s own assets' });
      const file = join(PUB, rel.replace(/^\//, ''));
      if (!existsSync(file)) return send(res, 404, { error: 'no such file' });
      const result = await heroLegibility(file, focal ?? null, { primaryColor });
      return send(res, 200, result);
    }

    // POST /api/dash/logo-check  { slug }  — the checks, on the logo the record has now.
    if (req.method === 'POST' && url === '/api/dash/logo-check') {
      const { slug } = await readBody(req);
      if (!okSlug(slug) || !existsSync(clientFile(slug))) return send(res, 404, { error: 'no such client' });
      const record = JSON.parse(readFileSync(clientFile(slug), 'utf8'));
      const rel = String(record.brand?.logoUrl || '');
      if (!rel) return send(res, 200, { logo: null });
      const file = join(PUB, rel.replace(/^\//, ''));
      if (!existsSync(file)) return send(res, 200, { logo: rel, missing: true });
      const { trimmed: _t, ...report } = await logoChecks(readFileSync(file), { filename: rel });
      return send(res, 200, { logo: rel, ...report });
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
      // Files the record actually names move out of staging now; anything else uploaded
      // and never referenced is dropped rather than committed. Only the promoted files
      // are staged in git — adding the whole asset folder is what swept orphans in.
      const staged = promoteStaged(clean, slug);
      for (const f of staged.promoted) git(['add', '--', join(assetDir(slug), f)]);
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
          return send(res, 200, { ok: true, commit: null, warnings, assets: staged });
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
      return send(res, 200, { ok: true, commit, warnings, assets: staged });
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
