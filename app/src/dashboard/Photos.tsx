/**
 * The photo editor — per service (storm / removal / trimming / generic).
 *
 * Every upload goes through /api/dash/upload, which runs the SAME sharp pipeline as
 * the build (WebP q80, 1600w cap, 400/800/1200w variants) and returns a ready
 * PhotoSet with a srcset. So an unoptimised drop cannot reach a template. Uploads and
 * "pick from existing" both write into — and read from — ONLY this client's asset
 * folder: the slug is fixed to the selected client, so cross-client leakage is
 * impossible from here, not merely discouraged.
 *
 * A focal-point + aspect control crops on upload (baked into the file via sharp), so a
 * bad crop is fixed without any template change.
 */

import { useEffect, useRef, useState } from 'react';
import type { Json } from './lib';
import { api, fileToBase64 } from './lib';

const SERVICES = ['storm', 'removal', 'trimming', 'generic'] as const;
type Service = (typeof SERVICES)[number];

const ASPECTS: { label: string; value: number | null }[] = [
  { label: 'Original', value: null },
  { label: '4:3 (gallery)', value: 4 / 3 },
  { label: '16:9', value: 16 / 9 },
  { label: '1:1', value: 1 },
];

export function Photos({ record, onChange, slug }: { record: Json; onChange: (r: Json) => void; slug: string }) {
  const photos = record.photos ?? {};
  const setService = (svc: Service, list: any[]) => onChange({ ...record, photos: { ...photos, [svc]: list } });

  return (
    <div className="dash-field">
      <span className="dash-label">Photos</span>
      <span className="dash-help">
        This client’s own job photos, per service. Drag the handle to reorder; click a photo’s subject to set its focal point. Uploads are optimised and given responsive variants automatically. Only ever
        written to <code>/assets/{slug}/</code>.
      </span>
      {SERVICES.map((svc) => (
        <PhotoService key={svc} svc={svc} slug={slug} list={photos[svc] ?? []} onList={(l) => setService(svc, l)} />
      ))}
    </div>
  );
}

function PhotoService({ svc, slug, list, onList }: { svc: Service; slug: string; list: any[]; onList: (l: any[]) => void }) {
  const [busy, setBusy] = useState(false);
  const [picking, setPicking] = useState(false);
  const [from, setFrom] = useState<number | null>(null);
  const [over, setOver] = useState<number | null>(null);
  const [pending, setPending] = useState<{ dataUrl: string; file: File } | null>(null);

  const setAt = (i: number, patch: any) => onList(list.map((p, n) => (n === i ? { ...p, ...patch } : p)));
  const remove = (i: number) => onList(list.filter((_, n) => n !== i));

  return (
    <div className="dash-photo-svc">
      <div className="dash-photo-svc-head">
        <strong>{svc}</strong>
        <span className="dash-badge">{list.length} photo{list.length === 1 ? '' : 's'}</span>
        {list.length === 0 && <span className="dash-empty-slot">empty — needs photos</span>}
      </div>

      <div className="dash-photo-grid" onPointerLeave={() => setOver(null)}>
        {list.map((p, i) => (
          <div
            className={`dash-photo ${from === i ? "is-dragging" : ""} ${over === i && from !== null && from !== i ? "is-over" : ""}`}
            key={p.src ?? i}
            onPointerEnter={() => from !== null && setOver(i)}
            onPointerUp={() => { if (from !== null && over !== null && from !== over) { const n = [...list]; const [it] = n.splice(from, 1); n.splice(over, 0, it); onList(n); } setFrom(null); setOver(null); }}
          >
            <div className="dash-thumb-wrap">
              <img
                src={p.src}
                alt=""
                className="dash-thumb"
                style={p.focal ? { objectPosition: `${Math.round(p.focal.x * 100)}% ${Math.round(p.focal.y * 100)}%` } : undefined}
                onClick={(e) => {
                  // Click on the subject sets a non-destructive focal point (object-position),
                  // unlike the crop baked in at upload.
                  const r = (e.target as HTMLImageElement).getBoundingClientRect();
                  setAt(i, { focal: { x: +((e.clientX - r.left) / r.width).toFixed(3), y: +((e.clientY - r.top) / r.height).toFixed(3) } });
                }}
                title="Click the subject to set the focal point"
              />
              {p.focal && <span className="dash-focal" style={{ left: `${p.focal.x * 100}%`, top: `${p.focal.y * 100}%` }} aria-hidden="true" />}
              <span className="dash-handle dash-handle--photo" aria-label="Drag to reorder" onPointerDown={(e) => { (e.target as HTMLElement).setPointerCapture?.(e.pointerId); setFrom(i); setOver(i); }} onPointerUp={(e) => (e.target as HTMLElement).releasePointerCapture?.(e.pointerId)}>⠿</span>
            </div>
            <input className="dash-input dash-input--sm" placeholder="alt text" value={p.alt ?? ''} onChange={(e) => setAt(i, { alt: e.target.value })} />
            <div className="dash-photo-actions">
              {p.srcset ? <span className="dash-badge dash-badge--ok" title={p.srcset}>srcset ✓</span> : <span className="dash-badge dash-badge--warn">no srcset</span>}
              {p.focal && <button className="dash-btn dash-btn--ghost dash-btn--sm" type="button" title="Back to centred crop" onClick={() => { const { focal: _f, ...rest } = p; onList(list.map((q, n) => (n === i ? rest : q))); }}>Centre</button>}
              <button className="dash-btn dash-btn--ghost dash-btn--sm" type="button" onClick={() => remove(i)}>
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="dash-photo-add">
        <label className="dash-btn dash-btn--sm">
          Upload photo
          <input
            type="file"
            accept="image/*"
            hidden
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (!file) return;
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

      {picking && <ExistingPicker slug={slug} onPick={(src) => { onList([...list, { src, alt: '' }]); setPicking(false); }} onClose={() => setPicking(false)} />}

      {pending && (
        <CropDialog
          dataUrl={pending.dataUrl}
          onCancel={() => setPending(null)}
          onConfirm={async (focal, aspect) => {
            setBusy(true);
            setPending(null);
            try {
              const { photo } = await api.upload({
                slug,
                filename: pending.file.name,
                dataBase64: pending.dataUrl,
                ...(aspect ? { focal, aspect } : {}),
              });
              onList([...list, photo]);
            } catch (err: any) {
              alert('Upload failed: ' + err.message);
            } finally {
              setBusy(false);
            }
          }}
        />
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
        <button className="dash-btn dash-btn--ghost dash-btn--sm" type="button" onClick={onClose}>
          Close
        </button>
      </div>
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

function CropDialog({ dataUrl, onCancel, onConfirm }: { dataUrl: string; onCancel: () => void; onConfirm: (focal: { x: number; y: number }, aspect: number | null) => void }) {
  const [focal, setFocal] = useState({ x: 0.5, y: 0.5 });
  const [aspect, setAspect] = useState<number | null>(4 / 3);
  const imgRef = useRef<HTMLImageElement>(null);

  return (
    <div className="dash-modal" role="dialog" aria-modal="true">
      <div className="dash-modal-card">
        <h3>Frame the photo</h3>
        <p className="dash-help">Click the subject to set the focal point, choose an aspect, and the crop is baked in on upload — no template change needed. Choose “Original” to skip cropping.</p>
        <div className="dash-crop">
          <img
            ref={imgRef}
            src={dataUrl}
            alt=""
            className="dash-crop-img"
            onClick={(e) => {
              const r = (e.target as HTMLImageElement).getBoundingClientRect();
              setFocal({ x: (e.clientX - r.left) / r.width, y: (e.clientY - r.top) / r.height });
            }}
          />
          {aspect && <span className="dash-focal" style={{ left: `${focal.x * 100}%`, top: `${focal.y * 100}%` }} aria-hidden="true" />}
        </div>
        <label className="dash-field">
          <span className="dash-label">Aspect</span>
          <select className="dash-input" value={aspect === null ? 'null' : String(aspect)} onChange={(e) => setAspect(e.target.value === 'null' ? null : Number(e.target.value))}>
            {ASPECTS.map((a) => (
              <option key={a.label} value={a.value === null ? 'null' : String(a.value)}>
                {a.label}
              </option>
            ))}
          </select>
        </label>
        <div className="dash-modal-actions">
          <button className="dash-btn dash-btn--ghost" type="button" onClick={onCancel}>
            Cancel
          </button>
          <button className="dash-btn" type="button" onClick={() => onConfirm(focal, aspect)}>
            Optimise & add
          </button>
        </div>
      </div>
    </div>
  );
}
