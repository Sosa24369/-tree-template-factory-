/**
 * IMAGE CHECKS — the arithmetic behind the studio's image contract. Pure functions
 * plus a few sharp-backed measurements; shared by dashboard-core (the upload
 * pipeline and the /api/dash/image-check endpoint) and testable without a server.
 *
 *   sniffHeic         iPhone HEIC/HEIF by container brand — refused with a message,
 *                     never converted (prebuilt sharp has no HEVC decoder on Railway;
 *                     a silent failure is worse than a clear message).
 *   coverCrop         the source rectangle an object-fit: cover box shows for a
 *                     given object-position — the same geometry the browser uses.
 *   heroLegibility    the contrast of white headline text over removal-a's hero
 *                     plate, measured on the pixels behind the headline block at
 *                     tablet and desktop, with the template's own scrim composited
 *                     on top; and the extra flat darkening that would lift it to 4.5:1.
 *   logoChecks        transparent-padding trim, baked-in background box detection,
 *                     and the mark's contrast against the header papers and ink.
 */

/* ---------------------------------------------------------------- colour maths */

export const hexToRgb = (hex) => {
  const h = String(hex || '').replace('#', '');
  const v = h.length === 3 ? h.split('').map((c) => c + c).join('') : h;
  const n = parseInt(v.slice(0, 6), 16);
  return Number.isFinite(n) ? [(n >> 16) & 255, (n >> 8) & 255, n & 255] : [0, 0, 0];
};
export const rgbToHex = ([r, g, b]) => '#' + [r, g, b].map((c) => Math.round(Math.max(0, Math.min(255, c))).toString(16).padStart(2, '0')).join('');

/** WCAG relative luminance of an sRGB triplet (0–255). */
export function relativeLuminance([r, g, b]) {
  const f = (c) => { c /= 255; return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; };
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
}
/** WCAG contrast ratio between two luminances. */
export function contrastRatio(l1, l2) {
  const a = Math.max(l1, l2), b = Math.min(l1, l2);
  return (a + 0.05) / (b + 0.05);
}
/** `top` at `alpha` over `under`, per channel. */
export const blend = (top, alpha, under) => top.map((c, i) => c * alpha + under[i] * (1 - alpha));

/* ---------------------------------------------------------------- file sniffing */

const HEIC_BRANDS = new Set(['heic', 'heix', 'hevc', 'hevx', 'heim', 'heis', 'hevm', 'hevs', 'mif1', 'msf1']);
/** True for an ISO-BMFF container whose brand is HEIF/HEIC — an iPhone photo. */
export function sniffHeic(buffer) {
  if (!buffer || buffer.length < 12) return false;
  if (buffer.toString('ascii', 4, 8) !== 'ftyp') return false;
  return HEIC_BRANDS.has(buffer.toString('ascii', 8, 12).toLowerCase());
}
export const isSvg = (buffer, filename = '') => /\.svg$/i.test(filename) || /^\s*(<\?xml[^>]*>\s*)?(<!--[\s\S]*?-->\s*)*<svg[\s>]/i.test(buffer.subarray(0, 512).toString('utf8'));

/* ---------------------------------------------------------------- crop geometry */

/**
 * object-fit: cover — the rectangle of the SOURCE image (iw × ih) that fills a box
 * (bw × bh) at object-position (px, py), each 0–1. Returns source-pixel coordinates.
 */
export function coverCrop(iw, ih, bw, bh, px = 0.5, py = 0.5) {
  const scale = Math.max(bw / iw, bh / ih);
  const width = bw / scale, height = bh / scale;
  const left = (iw - width) * Math.min(1, Math.max(0, px));
  const top = (ih - height) * Math.min(1, Math.max(0, py));
  return { left, top, width, height, scale };
}

/* ---------------------------------------------------------------- pixels */

const clampInt = (v, lo, hi) => Math.max(lo, Math.min(hi, Math.round(v)));

/** Mean RGB of a rectangle of an image (source-pixel coordinates). */
export async function regionMean(input, region) {
  const { default: sharp } = await import('sharp');
  const img = sharp(input);
  const meta = await img.metadata();
  const W = meta.width ?? 0, H = meta.height ?? 0;
  const left = clampInt(region.left, 0, Math.max(0, W - 2));
  const top = clampInt(region.top, 0, Math.max(0, H - 2));
  const width = clampInt(region.width, 1, W - left);
  const height = clampInt(region.height, 1, H - top);
  const { channels } = await sharp(input).extract({ left, top, width, height }).removeAlpha().stats();
  return channels.slice(0, 3).map((c) => c.mean);
}

/* ---------------------------------------------------------------- hero legibility */

/**
 * removal-a's hero: the plate is object-fit: cover behind the whole hero, the
 * headline block is white text at the top-left, and `.ra-hero::after` lays two
 * gradients over the plate — a radial wash of the brand primary (45% at the
 * top-left corner, gone by 62% of the way out) and a vertical linear scrim of the
 * deep tone (72% at the top to 88% at the bottom). Measured geometry (Phase 1):
 *
 *   tablet   plate 820 × 1656 · headline block x 41 y 49 w 403 h 608 (hero-relative)
 *   desktop  plate 1440 × 1192 · headline block x 174 y 76 w 403 h 690
 *
 * The plate's default object-position is `center 35%`; a focal point overrides it.
 * Mobile paints no plate at all (brand colour), so there is nothing to measure.
 */
export const REMOVAL_A_HERO = {
  tablet: { plate: [820, 1656], headline: { x: 41, y: 49, w: 403, h: 608 } },
  desktop: { plate: [1440, 1192], headline: { x: 174, y: 76, w: 403, h: 690 } },
  defaultPosition: { x: 0.5, y: 0.35 },
  scrim: { radial: { alpha: 0.45, extent: 0.62, at: [0.15, 0] }, linear: { top: 0.72, bottom: 0.88 } },
  text: [255, 255, 255],
  target: 4.5,
};

/**
 * Contrast of the white headline over the hero plate at each breakpoint, and the
 * extra flat darkening (`--ra-hero-scrim`) that would lift it to the target.
 *
 * @param {Buffer|string} plate  the master image
 * @param {{ x:number, y:number }|null} focal
 * @param {{ primaryColor:string, deep?:string, deeper?:string }} brand
 */
export async function heroLegibility(plate, focal, brand) {
  const { default: sharp } = await import('sharp');
  const meta = await sharp(plate).metadata();
  const iw = meta.width ?? 0, ih = meta.height ?? 0;
  const primary = hexToRgb(brand.primaryColor || '#1f3d2b');
  // --ra-deep is color-mix(brand-primary 86%, #000) and --ra-deeper is
  // color-mix(brand-primary 62%, #000) in removal-a.css; the same mixes here.
  const deep = brand.deep ? hexToRgb(brand.deep) : blend(primary, 0.86, [0, 0, 0]);
  const deeper = brand.deeper ? hexToRgb(brand.deeper) : blend(primary, 0.62, [0, 0, 0]);
  const pos = focal ? { x: focal.x, y: focal.y } : REMOVAL_A_HERO.defaultPosition;
  const out = {};
  for (const bp of ['tablet', 'desktop']) {
    const { plate: [bw, bh], headline } = REMOVAL_A_HERO[bp];
    const crop = coverCrop(iw, ih, bw, bh, pos.x, pos.y);
    // The headline block, mapped from box pixels into source pixels.
    const region = { left: crop.left + headline.x / crop.scale, top: crop.top + headline.y / crop.scale, width: headline.w / crop.scale, height: headline.h / crop.scale };
    const mean = await regionMean(plate, region);
    // Scrim at the headline block's centre: linear alpha by vertical position, radial
    // alpha by distance from the top-left origin as a fraction of its extent.
    const cy = (headline.y + headline.h / 2) / bh, cx = (headline.x + headline.w / 2) / bw;
    const { radial, linear } = REMOVAL_A_HERO.scrim;
    const linAlpha = linear.top + (linear.bottom - linear.top) * cy;
    const linColour = blend(deeper, cy, deep);
    const dist = Math.hypot(cx - radial.at[0], cy - radial.at[1]);
    const radAlpha = Math.max(0, radial.alpha * (1 - dist / radial.extent));
    const underScrim = blend(primary, radAlpha, blend(linColour, linAlpha, mean));
    const lum = relativeLuminance(underScrim);
    const contrast = contrastRatio(relativeLuminance(REMOVAL_A_HERO.text), lum);
    // Extra black at alpha a: L' = L (1 - a). Needed L' for the target: 1.05/target - 0.05.
    const needL = 1.05 / REMOVAL_A_HERO.target - 0.05;
    const extra = lum > needL ? Math.min(0.9, Math.ceil((1 - needL / lum) * 20) / 20) : 0;
    out[bp] = {
      imageMean: rgbToHex(mean),
      behindText: rgbToHex(underScrim),
      contrast: Math.round(contrast * 100) / 100,
      passes: contrast >= REMOVAL_A_HERO.target,
      extraScrim: extra,
      contrastWithExtra: Math.round(contrastRatio(relativeLuminance(REMOVAL_A_HERO.text), lum * (1 - extra)) * 100) / 100,
    };
  }
  const worst = Math.min(out.tablet.contrast, out.desktop.contrast);
  return { ...out, mobile: null, worst, passes: worst >= REMOVAL_A_HERO.target, suggestedScrim: Math.max(out.tablet.extraScrim, out.desktop.extraScrim), target: REMOVAL_A_HERO.target };
}

/* ---------------------------------------------------------------- logos */

/**
 * The header paper on nine templates and the ink on storm, as the brand-neutral
 * tones the templates mix. Contrast is reported against both.
 */
export const HEADER_TONES = { paper: '#f6f7f4', ink: '#0f1a14' };

/**
 * Trim transparent padding, detect a baked-in solid background box, and measure the
 * mark's contrast against the header tones. Returns the trimmed buffer (PNG) plus the
 * findings; the caller decides what to do with them.
 */
export async function logoChecks(buffer, { filename = '' } = {}) {
  const { default: sharp } = await import('sharp');
  const svg = isSvg(buffer, filename);
  let img = svg ? sharp(buffer, { density: 384 }) : sharp(buffer).rotate();
  let meta = await img.metadata();
  const hasAlpha = Boolean(meta.hasAlpha) || svg;
  const warnings = [];

  // Trim: transparent padding on a PNG/SVG; a flat border colour on an opaque file.
  let trimmed = buffer, tmeta = meta;
  try {
    const t = await img.clone().ensureAlpha().trim({ threshold: 12 }).png().toBuffer({ resolveWithObject: true });
    trimmed = t.data; tmeta = t.info;
  } catch { /* nothing to trim */ }

  // A baked-in box: every corner opaque and the same colour. Sample the four corners
  // of the trimmed image (after trim, a real transparent logo has transparent corners).
  const { data, info } = await sharp(trimmed).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const px = (x, y) => { const i = (y * info.width + x) * 4; return [data[i], data[i + 1], data[i + 2], data[i + 3]]; };
  const corners = [px(1, 1), px(info.width - 2, 1), px(1, info.height - 2), px(info.width - 2, info.height - 2)];
  const opaqueCorners = corners.filter((c) => c[3] > 250);
  let backgroundBox = null;
  if (opaqueCorners.length === 4) {
    const [r, g, b] = opaqueCorners[0];
    const same = opaqueCorners.every(([r2, g2, b2]) => Math.abs(r - r2) + Math.abs(g - g2) + Math.abs(b - b2) < 30);
    if (same) { backgroundBox = rgbToHex([r, g, b]); warnings.push(`The logo has a solid ${backgroundBox} box baked in. Send an SVG or a transparent PNG so it sits on the brand colour, not on a rectangle.`); }
  }

  // Contrast against the header: a mark is not one colour (a white disc with dark
  // lettering averages to light grey and reads fine), so measure the SHARE of the
  // mark's opaque pixels that clear 3:1 against each tone. Under a third readable
  // means most of the mark melts into the header.
  const box = backgroundBox ? hexToRgb(backgroundBox) : null;
  const paperL = relativeLuminance(hexToRgb(HEADER_TONES.paper)), inkL = relativeLuminance(hexToRgb(HEADER_TONES.ink));
  let sum = [0, 0, 0], n = 0, okPaper = 0, okInk = 0;
  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3] < 128) continue;
    if (box && Math.abs(data[i] - box[0]) + Math.abs(data[i + 1] - box[1]) + Math.abs(data[i + 2] - box[2]) < 30) continue;
    const l = relativeLuminance([data[i], data[i + 1], data[i + 2]]);
    if (contrastRatio(l, paperL) >= 3) okPaper++;
    if (contrastRatio(l, inkL) >= 3) okInk++;
    sum[0] += data[i]; sum[1] += data[i + 1]; sum[2] += data[i + 2]; n++;
  }
  const mark = n ? sum.map((s) => s / n) : [128, 128, 128];
  const share = (k) => (n ? Math.round((k / n) * 100) : 0);
  const contrast = { paperReadablePct: share(okPaper), inkReadablePct: share(okInk), meanVsPaper: Math.round(contrastRatio(relativeLuminance(mark), paperL) * 100) / 100, meanVsInk: Math.round(contrastRatio(relativeLuminance(mark), inkL) * 100) / 100 };
  if (contrast.paperReadablePct < 34) warnings.push(`Only ${contrast.paperReadablePct}% of the mark clears 3:1 against the light header paper — most of it will wash out on nine of the ten templates.`);
  if (contrast.inkReadablePct < 34) warnings.push(`Only ${contrast.inkReadablePct}% of the mark clears 3:1 against storm's dark header — most of it will disappear there.`);

  return {
    trimmed,
    source: { width: meta.width ?? null, height: meta.height ?? null, format: svg ? 'svg' : meta.format ?? null, hasAlpha },
    trimmedTo: { width: tmeta.width ?? info.width, height: tmeta.height ?? info.height },
    backgroundBox,
    markColor: rgbToHex(mark),
    contrast,
    // No OCR on this server (no tesseract, no vision model until Phase 5 brings an
    // ANTHROPIC_API_KEY), so "does the logo contain text that isn't the company name"
    // is reported as unchecked rather than guessed at.
    textCheck: { status: 'unavailable', reason: 'no OCR on the studio server; checked by eye until Phase 5 adds a vision call' },
    warnings,
  };
}
