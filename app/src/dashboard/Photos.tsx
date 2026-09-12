/**
 * THE PHOTO EDITOR — per service set (storm / removal / trimming / generic), under
 * the image contract (templates/imageSlots.mjs).
 *
 * What a person needs to know at each photo, without reading the contract:
 *   - where it lands: which template slots this position in the set feeds, and
 *     whether any of them cover-crop it (then it needs a focal point);
 *   - whether it is big enough for those slots;
 *   - what the crops will look like at mobile, tablet and desktop BEFORE saving —
 *     the Frame dialog shows all three around the focal point at once;
 *   - for the removal set's first photo, the measured contrast of the headline
 *     over it on removal-a, and the scrim that fixes it.
 *
 * Every upload goes through /api/dash/upload, which auto-rotates, strips metadata,
 * crops to 4:3 around the focal point, refuses anything under the slot minimum with
 * the number, refuses HEIC with an explanation, and emits 400/800/1200/1600 WebP.
 * A refusal is shown INLINE under the set, never as an alert. Uploads and "pick from
 * existing" both read and write ONLY this client's asset folder.
 */

import { useEffect, useRef, useState } from 'react';
import type { Json } from './lib';
import { api, fileToBase64 } from './lib';
import { BREAKPOINTS, IMAGE_SLOTS, MASTERS, minWidth, slotById, stillCount, type ImageSlot } from '../templates/imageSlots.mjs';
import { landingsFor, photoId, slotPosition, slotsForPosition } from '../lib/placement.mjs';

/**
 * Every slot a photograph ACTUALLY lands in on this client, cascade and explicit
 * assignments included. The old positional query matched a slot only when the slot's
 * declared set equalled the photo's set, so on J Valdez — twelve photographs, all in
 * photos.trimming — it listed the trimming slots and silently omitted removal-a's hero
 * plate, the photograph behind the headline on a live ad page.
 */
function landedSlots(record: Json, photo: any, excluded: Set<string>): ImageSlot[] {
  if (!photo?.src) return [];
  return landingsFor(record as never, photoId(photo), excluded)
    .map((l) => slotById(l.templateId, l.slotId))
    .filter((s): s is ImageSlot => !!s);
}

const SERVICES = ['removal', 'trimming', 'storm', 'generic'] as const;
type Service = (typeof SERVICES)[number];

const ASPECTS: { label: string; value: number | null }[] = [
  { label: '4:3 — the contract (even grids, every slot)', value: 4 / 3 },
  { label: 'Original shape — grids of mixed shapes go uneven', value: null },
];

const pct = (v: number) => `${Math.round(v * 100)}%`;
const focalPos = (p: any) => (p?.focal ? `${pct(p.focal.x)} ${pct(p.focal.y)}` : undefined);
const isLegacy = (p: any) => !(p?.pipeline && Number(p.pipeline.version) >= 2);

export function Photos({ record, onChange, slug }: { record: Json; onChange: (r: Json) => void; slug: string }) {
  const photos = record.photos ?? {};
  const excluded = new Set<string>(record.excludedTemplates ?? []);
  const setService = (svc: Service, list: any[]) => onChange({ ...record, photos: { ...photos, [svc]: list } });

  return (
    <div className="dash-field" id="photos">
      <span className="dash-label">Photos</span>
      <span className="dash-help">
        This client's own job photos, one set per service. Templates take photos from a set <strong>by position</strong> — the
        first removal photo is removal-a's hero plate, the last three are its service strip — so the order matters. Send clients{' '}
        <code>docs/IMAGE-SPEC.md</code>: {MASTERS.photo.recommended[0]} × {MASTERS.photo.recommended[1]} (4:3) or larger, JPEG or PNG,
        one subject per photo. Uploads are auto-rotated, cropped to 4:3 around the focal point you click, and sized for every slot; the original is never published.
        Only ever written to <code>/assets/{slug}/</code>.
      </span>
      {SERVICES.map((svc) => (
        <PhotoService key={svc} svc={svc} slug={slug} record={record} excluded={excluded} list={photos[svc] ?? []} onList={(l) => setService(svc, l)} />
      ))}
    </div>
  );
}

/** Which templates draw from this set (and note the cascade). */
function templatesFor(svc: Service, excluded: Set<string>): string[] {
  return [...new Set(IMAGE_SLOTS.filter((s) => s.source.set === svc && !excluded.has(s.template)).map((s) => s.template))];
}

function PhotoService({ svc, slug, record, excluded, list, onList }: { svc: Service; slug: string; record: Json; excluded: Set<string>; list: any[]; onList: (l: any[]) => void }) {
  const [busy, setBusy] = useState(false);
  const [picking, setPicking] = useState(false);
  const [from, setFrom] = useState<number | null>(null);
  const [over, setOver] = useState<number | null>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const [pending, setPending] = useState<{ dataUrl: string; file: File } | null>(null);
  const [framing, setFraming] = useState<number | null>(null);
  const [notice, setNotice] = useState<{ kind: 'error' | 'warn' | 'ok'; text: string } | null>(null);

  const setAt = (i: number, patch: any) => onList(list.map((p, n) => (n === i ? { ...p, ...patch } : p)));
  const remove = (i: number) => onList(list.filter((_, n) => n !== i));

  // Reorder by dragging the handle. The handle takes pointer capture, so every move and
  // the release are delivered even when the cursor leaves the card (and on touch, where
  // capture is implicit and cannot be declined). Capture also means the OTHER cards never
  // see pointerenter, so the drop target CANNOT be tracked by hovering them: it is hit-
  // tested from the pointer's coordinates on every move instead.
  const dropIndexAt = (x: number, y: number): number | null => {
    const card = (document.elementFromPoint(x, y) as HTMLElement | null)?.closest('.dash-photo') as HTMLElement | null;
    if (!card || !gridRef.current?.contains(card)) return null; // outside this service's grid
    const n = Number(card.dataset.idx);
    return Number.isInteger(n) ? n : null;
  };
  const endDrag = (commit: boolean) => {
    if (commit && from !== null && over !== null && from !== over) {
      const n = [...list];
      const [it] = n.splice(from, 1);
      n.splice(over, 0, it);
      onList(n);
    }
    setFrom(null);
    setOver(null);
  };
  const templates = templatesFor(svc, excluded);
  const isDemo = record.isDemo === true;

  return (
    <div className="dash-photo-svc">
      <div className="dash-photo-svc-head">
        <strong>{svc}</strong>
        <span className="dash-badge">{list.length} photo{list.length === 1 ? '' : 's'}</span>
        {templates.length > 0 ? <span className="dash-help">feeds {templates.join(', ')}</span> : <span className="dash-help">no template built for this client draws from this set directly (it still serves as a fallback)</span>}
        {list.length === 0 && <span className="dash-empty-slot">empty — the templates fall back to another set, then to nothing</span>}
      </div>

      <div className="dash-photo-grid" ref={gridRef}>
        {list.map((p, i) => {
          const video = p.kind === 'video';
          const slots = landedSlots(record, p, excluded);
          const cover = slots.filter((s) => s.policy === 'cover' && s.focal === 'required');
          const needsFocal = cover.length > 0 && !p.focal;
          const heroPlate = slots.find((s) => s.legibility);
          let need = MASTERS.photo.min[0];
          for (const s of slots) need = Math.max(need, minWidth(s.master));
          const small = typeof p.width === 'number' && p.width < need;
          return (
            <div
              className={`dash-photo ${from === i ? 'is-dragging' : ''} ${over === i && from !== null && from !== i ? 'is-over' : ''}`}
              key={p.src ?? i}
              data-idx={i}
            >
              <div className="dash-thumb-wrap">
                <img
                  src={p.src}
                  alt=""
                  className="dash-thumb"
                  style={p.focal ? { objectPosition: focalPos(p) } : undefined}
                  onClick={() => setFraming(i)}
                  title="Open the Frame dialog: set the focal point and see every crop"
                />
                {p.focal && <span className="dash-focal" style={{ left: pct(p.focal.x), top: pct(p.focal.y) }} aria-hidden="true" />}
                <span
                  className="dash-handle dash-handle--photo"
                  aria-label="Drag to reorder"
                  onPointerDown={(e) => { e.currentTarget.setPointerCapture?.(e.pointerId); setFrom(i); setOver(i); }}
                  onPointerMove={(e) => { if (from === null) return; const t = dropIndexAt(e.clientX, e.clientY); if (t !== null) setOver(t); }}
                  onPointerUp={(e) => { e.currentTarget.releasePointerCapture?.(e.pointerId); endDrag(true); }}
                  onPointerCancel={() => endDrag(false)}
                >⠿</span>
                <span className="dash-photo-pos">#{i + 1}</span>
              </div>
              <div className="dash-photo-badges">
                {video && <span className="dash-badge" title="a video entry: templates skip it when slotting stills">video</span>}
                {heroPlate && <span className="dash-badge dash-badge--hero" title="removal-a paints this behind the headline on tablet and desktop">hero plate</span>}
                {cover.length > 0 && (p.focal ? <span className="dash-badge dash-badge--ok" title={cover.map((s) => `${s.template}/${s.id}`).join(', ')}>focal ✓</span> : <span className="dash-badge dash-badge--warn" title={cover.map((s) => `${s.template}/${s.id}`).join(', ')}>no focal · cropped by {cover.length}</span>)}
                {cover.length === 0 && slots.length > 0 && <span className="dash-badge" title={slots.map((s) => `${s.template}/${s.id}`).join(', ')}>shown whole</span>}
                {small && <span className="dash-badge dash-badge--warn" title={`the slots this position feeds want ${need} px`}>{p.width} px · needs {need}</span>}
                {isLegacy(p) && <span className="dash-badge" title="imported before the image contract; reported by the image-spec guard, not blocked">legacy</span>}
              </div>
              <input className="dash-input dash-input--sm" placeholder="alt text" value={p.alt ?? ''} onChange={(e) => setAt(i, { alt: e.target.value })} />
              <div className="dash-photo-actions">
                <button className="dash-btn dash-btn--ghost dash-btn--sm" type="button" onClick={() => setFraming(i)}>Frame</button>
                <button className="dash-btn dash-btn--ghost dash-btn--sm" type="button" onClick={() => remove(i)}>Remove</button>
              </div>
              {heroPlate && !video && <HeroContrast slug={slug} photo={p} primaryColor={record.brand?.primaryColor} onScrim={(v) => setAt(i, v === null ? { scrim: undefined } : { scrim: v })} />}
              {needsFocal && !isDemo && <span className="dash-help dash-photo-note">No focal point: {cover.map((s) => s.template + ' ' + s.id).join(', ')} crop{cover.length === 1 ? 's' : ''} this photo to the centre. {isLegacy(p) ? 'Reported by the image-spec guard until it is set.' : 'The image-spec guard blocks a publish until it is set.'}</span>}
            </div>
          );
        })}
      </div>

      <div className="dash-photo-add">
        <label className="dash-btn dash-btn--sm">
          Upload photo
          <input
            type="file"
            accept="image/*,.heic,.heif"
            hidden
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              setNotice(null);
              const dataUrl = await fileToBase64(file);
              setPending({ dataUrl, file });
              e.currentTarget.value = '';
            }}
          />
        </label>
        <button className="dash-btn dash-btn--ghost dash-btn--sm" type="button" onClick={() => setPicking((v) => !v)}>
          Pick from existing
        </button>
        {busy && <span className="dash-help">Optimising…</span>}
      </div>
      {notice && (
        <p className={`dash-photo-notice dash-photo-notice--${notice.kind}`} role={notice.kind === 'error' ? 'alert' : 'status'}>
          {notice.kind === 'error' ? '✗ ' : notice.kind === 'warn' ? '⚠ ' : '✓ '}{notice.text}
        </p>
      )}

      {picking && <ExistingPicker slug={slug} onPick={(src) => { onList([...list, { src, alt: '' }]); setPicking(false); }} onClose={() => setPicking(false)} />}

      {pending && (
        <CropDialog
          dataUrl={pending.dataUrl}
          set={svc}
          index={stillCount(list)}
          count={stillCount(list)}
          excluded={excluded}
          onCancel={() => setPending(null)}
          onConfirm={async (focal, aspect) => {
            setBusy(true);
            setPending(null);
            try {
              const res = await api.upload({ slug, filename: pending.file.name, dataBase64: pending.dataUrl, focal, aspect, set: svc, index: stillCount(list), count: stillCount(list) });
              onList([...list, res.photo]);
              setNotice(res.warnings.length ? { kind: 'warn', text: res.warnings.join(' ') } : { kind: 'ok', text: `Added as #${list.length + 1}: ${res.photo.width} × ${res.photo.height}, ${res.photo.pipeline?.aspect ?? ''}, lands in ${res.slots.map((s) => `${s.template} ${s.id}`).join(', ') || 'no slot on the templates this client builds'}.` });
            } catch (err: any) {
              setNotice({ kind: 'error', text: err.body?.message || err.message });
            } finally {
              setBusy(false);
            }
          }}
        />
      )}

      {framing !== null && list[framing] && (
        <FrameDialog
          photo={list[framing]}
          slots={landedSlots(record, list[framing], excluded)}
          position={framing + 1}
          onCancel={() => setFraming(null)}
          onSave={(focal) => { if (focal) setAt(framing, { focal }); else { const { focal: _f, ...rest } = list[framing]; onList(list.map((q, n) => (n === framing ? rest : q))); } setFraming(null); }}
        />
      )}
    </div>
  );
}

/** The measured headline contrast over this photo as the removal-a hero plate. */
function HeroContrast({ slug, photo, primaryColor, onScrim }: { slug: string; photo: any; primaryColor?: string; onScrim: (v: number | null) => void }) {
  const [r, setR] = useState<any>(null);
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const key = `${photo.src}|${photo.focal?.x ?? ''}|${photo.focal?.y ?? ''}`;
  useEffect(() => { setR(null); }, [key]);
  const measure = async () => {
    setBusy(true); setErr(null);
    try { setR(await api.heroCheck({ slug, src: photo.src, focal: photo.focal, primaryColor })); }
    catch (e: any) { setErr(e.message); }
    finally { setBusy(false); }
  };
  return (
    <div className="dash-hero-check">
      {!r && <button className="dash-btn dash-btn--ghost dash-btn--xs" type="button" disabled={busy} onClick={measure}>{busy ? 'Measuring…' : 'Measure headline contrast'}</button>}
      {err && <span className="dash-v-err">{err}</span>}
      {r && (
        <>
          <span className={`dash-help ${r.passes ? '' : 'dash-v-warn'}`}>
            Headline over this photo: tablet <strong>{r.tablet.contrast}:1</strong> · desktop <strong>{r.desktop.contrast}:1</strong> · mobile n/a (no plate on a phone). Target {r.target}:1 —{' '}
            {r.passes ? 'passes with the template scrim alone.' : `needs ${Math.round(r.suggestedScrim * 100)}% extra darkening.`}
          </span>
          {typeof photo.scrim === 'number' && photo.scrim > 0 && <span className="dash-badge dash-badge--ok">scrim {Math.round(photo.scrim * 100)}% set</span>}
          {!r.passes && (typeof photo.scrim !== 'number' || photo.scrim < r.suggestedScrim) && (
            <button className="dash-btn dash-btn--sm" type="button" onClick={() => onScrim(r.suggestedScrim)}>Apply {Math.round(r.suggestedScrim * 100)}% scrim</button>
          )}
          {typeof photo.scrim === 'number' && photo.scrim > 0 && <button className="dash-btn dash-btn--ghost dash-btn--xs" type="button" onClick={() => onScrim(null)}>clear scrim</button>}
          <button className="dash-btn dash-btn--ghost dash-btn--xs" type="button" onClick={measure}>re-measure</button>
        </>
      )}
    </div>
  );
}

function ExistingPicker({ slug, onPick, onClose }: { slug: string; onPick: (src: string) => void; onClose: () => void }) {
  const [files, setFiles] = useState<{ name: string; src: string }[] | null>(null);
  useEffect(() => {
    api.assets(slug).then((r) => setFiles(r.files)).catch(() => setFiles([]));
  }, [slug]);
  return (
    <div className="dash-picker">
      <div className="dash-picker-head">
        <strong>Pick from {slug}’s assets</strong>
        <button className="dash-btn dash-btn--ghost dash-btn--sm" type="button" onClick={onClose}>Close</button>
      </div>
      <p className="dash-help">A file picked here keeps whatever size and shape it has; it is not re-run through the pipeline. Open Frame after adding it.</p>
      {files === null && <p className="dash-help">Loading…</p>}
      {files && files.length === 0 && <p className="dash-empty">No images in this client’s asset folder yet.</p>}
      <div className="dash-photo-grid">
        {files?.map((f) => (
          <button className="dash-pick" type="button" key={f.src} onClick={() => onPick(f.src)} title={f.name}>
            <img src={f.src} alt="" className="dash-thumb" />
          </button>
        ))}
      </div>
    </div>
  );
}

/**
 * The three-crop preview: every breakpoint side by side, each showing the crop the
 * slot's box makes around the focal point. object-fit: cover + object-position is
 * exactly what the template does, so this IS the crop, not an approximation.
 */
function CropPreview({ src, focal, slots, position }: { src: string; focal: { x: number; y: number } | null; slots: ImageSlot[]; position: number }) {
  const cover = slots.filter((s) => s.policy === 'cover');
  const shown = cover.length ? cover.slice(0, 4) : [];
  // Where this photo sits in a given slot. A focal point wins everywhere; without one the
  // answer is the SLOT's declared default, not a blanket 50% 50%. Stage 1 found this
  // preview showing 50% 50% while removal-a's hero plate shipped `center 35%` — a 37 CSS
  // px lie on the one slot that puts the headline on a photograph. Both sides now read
  // lib/placement.ts, so they cannot disagree.
  const posFor = (s: ImageSlot) =>
    focal ? `${pct(focal.x)} ${pct(focal.y)}` : (slotPosition(s.template, s.id) ?? '50% 50%');
  return (
    <div className="dash-crops">
      {shown.length === 0 && (
        <p className="dash-help">
          Position #{position} is shown whole ({slots.length ? slots.map((s) => `${s.template} ${s.id}`).join(', ') : 'no slot on the templates this client builds'}); the box takes the photo's own shape, so nothing is cropped.
          The focal point still matters if the photo is ever moved to a cover slot.
        </p>
      )}
      {shown.map((s) => (
        <div className="dash-crop-slot" key={`${s.template}/${s.id}`}>
          <div className="dash-crop-slot-head"><strong>{s.template}</strong> · {s.label.split(' — ')[0]}</div>
          <div className="dash-crop-row">
            {BREAKPOINTS.map((b) => {
              const boxes = s.renders[b.id];
              if (!boxes) return <div className="dash-crop-cell" key={b.id}><span className="dash-help">{b.label}: not shown</span></div>;
              const [w, h] = boxes[0];
              const scale = Math.min(200 / w, 150 / h);
              return (
                <div className="dash-crop-cell" key={b.id}>
                  <span className="dash-help">{b.label} · {w} × {h}</span>
                  <img src={src} alt="" style={{ width: Math.round(w * scale), height: Math.round(h * scale), objectFit: 'cover', objectPosition: posFor(s), display: 'block', borderRadius: 4, background: '#eef1f4' }} />
                </div>
              );
            })}
          </div>
        </div>
      ))}
      {cover.length > 4 && <p className="dash-help">…and {cover.length - 4} more cover slot{cover.length - 4 === 1 ? '' : 's'} crop it the same way.</p>}
    </div>
  );
}

/** Set (or move) the focal point on a photo that is already in the set, with every crop previewed. */
function FrameDialog({ photo, slots, position, onCancel, onSave }: { photo: any; slots: ImageSlot[]; position: number; onCancel: () => void; onSave: (focal: { x: number; y: number } | null) => void }) {
  const [focal, setFocal] = useState<{ x: number; y: number } | null>(photo.focal ?? null);
  return (
    <div className="dash-modal" role="dialog" aria-modal="true">
      <div className="dash-modal-card dash-modal-card--wide">
        <h3>Frame photo #{position}</h3>
        <p className="dash-help">Click the subject. Every cover slot crops around that point; the previews below are the real crops at each breakpoint.</p>
        <div className="dash-frame-grid">
          <div className="dash-crop">
            <img
              src={photo.src}
              alt=""
              className="dash-crop-img"
              onClick={(e) => { const r = (e.target as HTMLImageElement).getBoundingClientRect(); setFocal({ x: +((e.clientX - r.left) / r.width).toFixed(3), y: +((e.clientY - r.top) / r.height).toFixed(3) }); }}
            />
            {focal && <span className="dash-focal" style={{ left: pct(focal.x), top: pct(focal.y) }} aria-hidden="true" />}
          </div>
          <div className="dash-frame-side">
            <span className="dash-label">Where #{position} lands</span>
            {slots.length === 0 && <span className="dash-help">No slot on the templates this client builds.</span>}
            <ul className="dash-slot-list">
              {slots.map((s) => <li key={`${s.template}/${s.id}`}><code>{s.template}</code> {s.label.split(' — ')[0]} <span className="dash-badge">{s.policy}</span></li>)}
            </ul>
            <span className="dash-help">{photo.width && photo.height ? `${photo.width} × ${photo.height}` : 'size unknown'}{photo.pipeline ? ` · pipeline v${photo.pipeline.version}, ${photo.pipeline.aspect}` : ' · legacy import'}</span>
          </div>
        </div>
        <CropPreview src={photo.src} focal={focal} slots={slots} position={position} />
        <div className="dash-modal-actions">
          {focal && <button className="dash-btn dash-btn--ghost" type="button" onClick={() => setFocal(null)}>Clear focal point</button>}
          <button className="dash-btn dash-btn--ghost" type="button" onClick={onCancel}>Cancel</button>
          <button className="dash-btn" type="button" onClick={() => onSave(focal)}>Use this framing</button>
        </div>
      </div>
    </div>
  );
}

/** Frame a NEW upload: focal point + master shape, with the same three-crop preview. */
function CropDialog({ dataUrl, set, index, count, excluded, onCancel, onConfirm }: { dataUrl: string; set: Service; index: number; count: number; excluded: Set<string>; onCancel: () => void; onConfirm: (focal: { x: number; y: number }, aspect: number | null) => void }) {
  const [focal, setFocal] = useState({ x: 0.5, y: 0.5 });
  const [aspect, setAspect] = useState<number | null>(4 / 3);
  const [dims, setDims] = useState<{ w: number; h: number } | null>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const slots = slotsForPosition(set as never, index, Math.max(count, index + 1))
    .map((l) => slotById(l.templateId, l.slotId))
    .filter((s): s is ImageSlot => !!s && !excluded.has(s.template));
  let need = MASTERS.photo.min[0];
  for (const s of slots) need = Math.max(need, minWidth(s.master));
  // What the 4:3 master will be, so the size warning appears before the upload is refused.
  const masterW = dims ? (aspect ? Math.min(dims.w, Math.round(dims.h * aspect)) : dims.w) : null;
  return (
    <div className="dash-modal" role="dialog" aria-modal="true">
      <div className="dash-modal-card dash-modal-card--wide">
        <h3>Frame the photo (it will be #{index + 1} in {set})</h3>
        <p className="dash-help">Click the subject. The upload is cropped to the chosen shape around it, and the crops below are what the templates will show.</p>
        <div className="dash-frame-grid">
          <div className="dash-crop">
            <img
              ref={imgRef}
              src={dataUrl}
              alt=""
              className="dash-crop-img"
              onLoad={(e) => setDims({ w: e.currentTarget.naturalWidth, h: e.currentTarget.naturalHeight })}
              onClick={(e) => { const r = (e.target as HTMLImageElement).getBoundingClientRect(); setFocal({ x: (e.clientX - r.left) / r.width, y: (e.clientY - r.top) / r.height }); }}
            />
            <span className="dash-focal" style={{ left: pct(focal.x), top: pct(focal.y) }} aria-hidden="true" />
          </div>
          <div className="dash-frame-side">
            <label className="dash-field">
              <span className="dash-label">Master shape</span>
              <select className="dash-input" value={aspect === null ? 'null' : String(aspect)} onChange={(e) => setAspect(e.target.value === 'null' ? null : Number(e.target.value))}>
                {ASPECTS.map((a) => <option key={a.label} value={a.value === null ? 'null' : String(a.value)}>{a.label}</option>)}
              </select>
            </label>
            {dims && <span className="dash-help">Source {dims.w} × {dims.h}{masterW != null && aspect ? ` → master ${masterW} × ${Math.round(masterW / aspect)}` : ''}. This position needs {need} px wide{masterW != null && masterW < need ? <strong className="dash-v-err"> — too small, it will be refused.</strong> : '.'}</span>}
            <span className="dash-label">Where #{index + 1} lands</span>
            <ul className="dash-slot-list">
              {slots.map((s) => <li key={`${s.template}/${s.id}`}><code>{s.template}</code> {s.label.split(' — ')[0]} <span className="dash-badge">{s.policy}</span></li>)}
              {slots.length === 0 && <li className="dash-help">no slot on the templates this client builds</li>}
            </ul>
          </div>
        </div>
        <CropPreview src={dataUrl} focal={focal} slots={slots} position={index + 1} />
        <div className="dash-modal-actions">
          <button className="dash-btn dash-btn--ghost" type="button" onClick={onCancel}>Cancel</button>
          <button className="dash-btn" type="button" onClick={() => onConfirm(focal, aspect)}>Optimise & add</button>
        </div>
      </div>
    </div>
  );
}
