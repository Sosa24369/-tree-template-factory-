/**
 * EVERY PHOTO SLOT ON THE SELECTED PAGE, IN PAGE ORDER.
 *
 * The complaint this answers: "I can't tell what will end up on the page until it's
 * published." Before this panel the studio showed photo SETS — an array whose position
 * decided placement by rules living in three disagreeing places — and its "where this
 * lands" list did not follow the fallback cascade, so on J Valdez it silently omitted the
 * hero plate of a live ad page (docs/BUILD-LOG.md, Phase 1b, 1a).
 *
 * Here a slot is a row. The thumbnail is the REAL crop: the same box aspect, the same
 * object-fit: cover, and the same object-position the page will use — focal point if the
 * photo has one, else the slot's declared default. Both sides read lib/placement.ts, so
 * the preview and the page cannot disagree.
 */

import { useState } from 'react';
import type { Json } from './lib';
import { PLACEMENT, RESOLVES_FROM_MAP, templateCells, type Cell } from '../lib/placement.mjs';
import { photoStatus } from '../lib/photoStatus';
import { IMAGE_SLOTS, MASTERS, minWidth } from '../templates/imageSlots.mjs';
import type { PhotoSet } from '../schema/client';

const pct = (n: number) => `${Math.round(n * 100)}%`;

/** The human name and measured box for a slot, from the contract. */
function meta(templateId: string, slotId: string) {
  const s = IMAGE_SLOTS.find((x) => x.template === templateId && x.id === slotId);
  const label = s?.label?.split(' — ')[0] ?? slotId;
  const box = s?.renders?.desktop?.[0] ?? s?.renders?.tablet?.[0] ?? s?.renders?.mobile?.[0] ?? [4, 3];
  const need = s ? minWidth(s.master) : MASTERS.photo.min[0];
  return { label, box: box as [number, number], need, policy: s?.policy ?? 'cover' };
}

/** Where this photo sits in this slot — exactly what SafeImage will emit. */
function positionFor(templateId: string, slotId: string, photo: PhotoSet | null): string {
  if (photo?.focal) return `${pct(photo.focal.x)} ${pct(photo.focal.y)}`;
  return PLACEMENT[templateId]?.find((s) => s.id === slotId)?.defaultPosition ?? '50% 50%';
}

export function Slots({
  record, templateId, onChange, onFrame,
}: {
  record: Json;
  templateId: string;
  onChange: (next: Json) => void;
  onFrame?: (src: string) => void;
}) {
  const [picking, setPicking] = useState<string | null>(null);
  const slots = PLACEMENT[templateId] ?? [];
  const wired = RESOLVES_FROM_MAP.has(templateId);
  const cells = templateCells(record as never, templateId);

  // Every photograph this client has, once, for the "choose" menus.
  const library: PhotoSet[] = [];
  const seen = new Set<string>();
  for (const list of Object.values((record.photos ?? {}) as Record<string, PhotoSet[]>)) {
    for (const p of list ?? []) {
      const id = p.id ?? p.src;
      if (!seen.has(id)) { seen.add(id); library.push(p); }
    }
  }

  const assignments = (record.photoSlots?.[templateId] ?? {}) as Record<string, string>;
  const write = (patch: Record<string, string | undefined>) => {
    const next = { ...assignments };
    for (const [k, v] of Object.entries(patch)) {
      if (v === undefined) delete next[k]; else next[k] = v;
    }
    onChange({
      ...record,
      // Written for THIS template only — nothing migrates a record wholesale.
      photoSlots: { ...(record.photoSlots ?? {}), [templateId]: next },
    });
  };

  /** Assignable cells only, in page order — what the arrows walk. */
  const walkable = cells.filter((c) => c.key !== null);
  const idOf = (c: Cell) => (c.photo ? c.photo.id ?? c.photo.src : '');

  const swap = (a: Cell, b: Cell) => {
    if (!a.key || !b.key) return;
    write({ [a.key]: idOf(b) ?? '', [b.key]: idOf(a) ?? '' });
  };
  const move = (c: Cell, dir: -1 | 1) => {
    const i = walkable.findIndex((x) => x.key === c.key);
    const j = i + dir;
    if (i < 0 || j < 0 || j >= walkable.length) return;
    swap(c, walkable[j]);
  };

  if (slots.length === 0) {
    return <p className="dash-help">This template draws no client photographs.</p>;
  }

  return (
    <div className="dash-slots">
      <p className="dash-help">
        Every photo slot on <strong>{templateId}</strong>, top to bottom in page order. Each
        thumbnail is the real crop — the same box and the same framing the page will use.
        A slot marked <em>auto</em> is filled by position from the sets below; put a photo in
        it and it becomes <em>explicit</em> and stops moving when the set is reordered.
      </p>
      {!wired && (
        <p className="dash-v-warn">
          ⚠ {templateId} does not read the slot map yet, so the list below is correct but
          read-only: it shows what the page renders today, and choosing a photo here would
          not change it. removal-a and trimming-a are wired.
        </p>
      )}

      {slots.map((slot) => {
        const m = meta(templateId, slot.id);
        const mine = cells.filter((c) => c.slotId === slot.id);
        return (
          <div className="dash-slot" key={slot.id}>
            <div className="dash-slot-head">
              <strong>{m.label}</strong>
              <span className="dash-badge">{slot.set}</span>
              <span className="dash-help">
                {slot.cells === 'all'
                  ? `every photo in the set — ${mine.length} today, reorder them in the set below`
                  : `${mine.filter((c) => c.photo).length} of ${mine.length} filled`}
              </span>
            </div>

            <div className="dash-slot-cells">
              {mine.map((c) => {
                const st = photoStatus(c.photo, m.need);
                const ratio = m.box[0] / m.box[1];
                const w = 148, h = Math.max(40, Math.round(w / ratio));
                const key = c.key ?? `${slot.id}.auto.${c.index}`;
                return (
                  <div className="dash-slot-cell" key={key}>
                    <div className="dash-slot-thumb" style={{ width: w, height: h }}>
                      {c.photo ? (
                        <img
                          src={c.photo.src}
                          alt=""
                          style={{
                            width: w, height: h, objectFit: 'cover',
                            objectPosition: positionFor(templateId, slot.id, c.photo),
                            display: 'block', borderRadius: 4, background: '#eef1f4',
                          }}
                        />
                      ) : (
                        <span className="dash-empty-slot">empty — nothing renders here</span>
                      )}
                    </div>

                    <div className="dash-slot-meta">
                      <span className="dash-help">
                        {mine.length > 1 ? `cell ${c.index + 1} · ` : ''}{m.box[0]} × {m.box[1]}
                      </span>
                      <span className={`dash-badge ${c.source === 'explicit' ? 'dash-badge--ok' : ''}`}>
                        {c.source === 'explicit' ? 'explicit' : 'auto'}
                      </span>
                      {st && (
                        <span
                          className={`dash-badge ${st.kind === 'ok' ? 'dash-badge--ok' : 'dash-badge--warn'}`}
                          title={st.reason}
                        >
                          {st.label}
                        </span>
                      )}
                    </div>

                    {c.key !== null && wired && (
                      <div className="dash-slot-actions">
                        <button className="dash-btn dash-btn--ghost dash-btn--sm" type="button"
                          title="Swap with the cell above" onClick={() => move(c, -1)}>↑</button>
                        <button className="dash-btn dash-btn--ghost dash-btn--sm" type="button"
                          title="Swap with the cell below" onClick={() => move(c, 1)}>↓</button>
                        <button className="dash-btn dash-btn--ghost dash-btn--sm" type="button"
                          onClick={() => setPicking(picking === c.key ? null : c.key)}>Choose…</button>
                        {c.photo && onFrame && (
                          <button className="dash-btn dash-btn--ghost dash-btn--sm" type="button"
                            onClick={() => onFrame(c.photo!.src)}>Frame</button>
                        )}
                        {c.photo && (
                          <button className="dash-btn dash-btn--ghost dash-btn--sm" type="button"
                            title="Leave this slot empty. The photo stays in the library."
                            onClick={() => write({ [c.key as string]: '' })}>Remove</button>
                        )}
                        {c.source === 'explicit' && (
                          <button className="dash-btn dash-btn--ghost dash-btn--sm" type="button"
                            title="Go back to filling this slot by position"
                            onClick={() => write({ [c.key as string]: undefined })}>Reset to auto</button>
                        )}
                      </div>
                    )}

                    {picking === c.key && c.key && (
                      <div className="dash-slot-picker">
                        {library.length === 0 && <p className="dash-help">No photographs on this client yet.</p>}
                        {library.map((p) => (
                          <button
                            className="dash-pick" type="button" key={p.id ?? p.src}
                            title={p.src.split('/').pop()}
                            onClick={() => { write({ [c.key!]: p.id ?? p.src }); setPicking(null); }}
                          >
                            <img src={p.src} alt="" className="dash-thumb"
                              style={{ objectPosition: positionFor(templateId, slot.id, p) }} />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
              {mine.length === 0 && (
                <p className="dash-empty">Nothing reaches this slot — the set it draws from is empty, so the section hides itself.</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
