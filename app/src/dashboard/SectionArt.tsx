/**
 * SECTION BACKGROUND PLATES — the decorative bands a template paints in CSS.
 *
 * Separate from the Photos editor because these are a different kind of thing. A
 * photo in `photos.removal` is content: it appears in a gallery, it is announced, it
 * has alt text. A plate is wallpaper behind a 90% scrim — it is painted as
 * `background-image`, it is announced to nobody, and it has no alt. This panel says
 * that plainly rather than offering an alt field that would do nothing.
 *
 * Only removal-a has plates today (templates/sectionArt.ts holds the list), so for
 * every other template the panel explains itself and gets out of the way instead of
 * rendering an empty box.
 *
 * The unset state is meaningful and is labelled as such: it renders the file this
 * template has always painted, which belongs to the control client. That is a real
 * pre-existing cross-client reference, and the panel names it rather than hiding it.
 */

import { useState } from 'react';
import type { Json } from './lib';
import { api, fileToBase64 } from './lib';
import { SECTION_ART } from '../templates/sectionArt';
import type { TemplateId } from '../schema/client';

/** The plates are wide bands; a landscape crop is nearly always what is wanted. */
const ASPECTS: { label: string; value: number | null }[] = [
  { label: 'No crop (use the whole image)', value: null },
  { label: '16:9 — wide band', value: 16 / 9 },
  { label: '21:9 — very wide strip', value: 21 / 9 },
  { label: '4:3', value: 4 / 3 },
];

export function SectionArt({
  record,
  templateId,
  slug,
  onChange,
}: {
  record: Json;
  templateId: TemplateId;
  slug: string;
  onChange: (r: Json) => void;
}) {
  const slots = SECTION_ART[templateId];

  if (!slots) {
    return (
      <div className="dash-field dash-art">
        <span className="dash-label">Section backgrounds — {templateId}</span>
        <p className="dash-help">
          This template paints no decorative background plates. Its section imagery comes from the client’s photo sets
          above, or it is type-only by design.
        </p>
      </div>
    );
  }

  const set: Record<string, Json> = record.sectionArt?.[templateId] ?? {};

  function write(slotId: string, photo: Json | null) {
    const next = { ...(record.sectionArt ?? {}) };
    const forTpl = { ...(next[templateId] ?? {}) };
    if (photo) forTpl[slotId] = photo;
    else delete forTpl[slotId];
    if (Object.keys(forTpl).length) next[templateId] = forTpl;
    else delete next[templateId];
    onChange({ ...record, sectionArt: next });
  }

  return (
    <div className="dash-field dash-art">
      <span className="dash-label">Section backgrounds — {templateId}</span>
      <span className="dash-help">
        Decorative bands painted behind a tint scrim. They carry <strong>no alt text</strong> — they are not content
        images and are announced to nobody, so an alt here would only add noise to a screen reader. Uploads are written
        only to <code>/assets/{slug}/</code>.
      </span>
      {slots.map((slot) => (
        <Slot key={slot.id} slot={slot} slug={slug} value={set[slot.id] ?? null} onWrite={(p) => write(slot.id, p)} />
      ))}
    </div>
  );
}

function Slot({
  slot,
  slug,
  value,
  onWrite,
}: {
  slot: { id: string; label: string; cssVar: string; note: string };
  slug: string;
  value: Json | null;
  onWrite: (photo: Json | null) => void;
}) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [aspect, setAspect] = useState<number | null>(16 / 9);

  async function upload(file: File) {
    setBusy(true);
    setErr(null);
    try {
      const dataBase64 = await fileToBase64(file);
      const { photo } = await api.upload({
        slug,
        filename: `bg-${slot.id}-${file.name}`,
        dataBase64,
        ...(aspect ? { focal: { x: 0.5, y: 0.5 }, aspect } : {}),
      });
      // A plate has no alt, deliberately. Store an empty one so nothing downstream
      // invents a description for an image nobody is told about.
      onWrite({ ...photo, alt: '' });
    } catch (e: any) {
      setErr(e.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="dash-card dash-art-slot">
      <div className="dash-art-head">
        <strong>{slot.label}</strong>
        <code>{slot.cssVar}</code>
      </div>
      <span className="dash-help">{slot.note}</span>
      <div className="dash-art-row">
        <span className="dash-art-preview">
          {value?.src ? <img src={value.src} alt="" /> : <em>template default</em>}
        </span>
        <div className="dash-art-actions">
          <label className="dash-btn dash-btn--sm">
            {busy ? 'Processing…' : value ? 'Replace' : 'Upload'}
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp"
              hidden
              disabled={busy}
              onChange={(e) => { const f = e.target.files?.[0]; if (f) upload(f); e.currentTarget.value = ''; }}
            />
          </label>
          <select className="dash-input dash-input--xs" value={aspect ?? ''} onChange={(e) => setAspect(e.target.value ? Number(e.target.value) : null)}>
            {ASPECTS.map((a) => (
              <option key={a.label} value={a.value ?? ''}>{a.label}</option>
            ))}
          </select>
          {value && (
            <button className="dash-btn dash-btn--ghost dash-btn--sm" type="button" onClick={() => onWrite(null)}>
              Clear (use the template default)
            </button>
          )}
        </div>
      </div>
      {!value && (
        <p className="dash-help dash-art-unset">
          Unset — this band paints the template’s built-in file. That file was extracted from one particular client’s
          page, and every client who leaves this blank shows the same one. Upload here to give this client their own.
        </p>
      )}
      {value?.src && <code className="dash-logo-path">{value.src} · {value.width}×{value.height}</code>}
      {err && <p className="dash-v-err">✗ {err}</p>}
    </div>
  );
}
