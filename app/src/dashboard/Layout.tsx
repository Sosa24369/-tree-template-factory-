/**
 * The layout panel — reorder, hide and size the sections of ONE template.
 *
 * Reads the template's manifest and the client's `layout[templateId]`, resolves them
 * with the SAME resolveLayout the page uses, and writes back a full
 * { sections, sizes } record on every change so the preview updates live.
 *
 * Required sections (header, footer, sticky bar) are pinned: no drag handle, no hide
 * toggle. Controls (-a) render the whole panel read-only with the lock message; the
 * server refuses a -a layout write independently (422 layout_locked), so the UI is a
 * courtesy, not the guard.
 *
 * Dragging is pointer-based and dependency-free: press the handle, move over another
 * row, release. Keyboard: ↑/↓ buttons do the same one step at a time.
 */

import { useMemo, useRef, useState } from 'react';
import type { Json } from './lib';
import { resolveLayout, isControlTemplate, type ResolvedSection } from '../schema/layout.mjs';
import { MANIFESTS } from '../templates/manifests.mjs';
import type { SizeToken, TemplateId } from '../schema/client';

const SIZES: SizeToken[] = ['S', 'M', 'L', 'full'];

export function Layout({ record, templateId, onChange }: { record: Json; templateId: string; onChange: (r: Json) => void }) {
  const tid = templateId as TemplateId;
  const manifest = MANIFESTS[tid];
  const locked = isControlTemplate(tid);
  const resolved = useMemo(
    () => (manifest ? resolveLayout(manifest, record.layout?.[tid], { locked }).sections : []),
    [manifest, record.layout, tid, locked]
  );
  const [dragFrom, setDragFrom] = useState<number | null>(null);
  const [dragOver, setDragOver] = useState<number | null>(null);
  const listRef = useRef<HTMLUListElement>(null);

  if (!manifest) return null;

  function write(next: ResolvedSection[]) {
    if (locked) return;
    const layout = {
      sections: next.map((s) => ({ id: s.id, hidden: s.hidden })),
      sizes: Object.fromEntries(next.filter((s) => s.size !== s.defaultSize).map((s) => [s.id, s.size])),
    };
    onChange({ ...record, layout: { ...(record.layout ?? {}), [tid]: layout } });
  }

  function move(from: number, to: number) {
    if (from === to || resolved[from].required || resolved[to].required) return;
    const next = [...resolved];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    write(next);
  }

  function reset() {
    if (locked) return;
    const { [tid]: _drop, ...rest } = record.layout ?? {};
    onChange({ ...record, layout: rest });
  }

  const hasOverride = Boolean(record.layout?.[tid]);

  return (
    <div className="dash-field dash-layout">
      <div className="dash-layout-head">
        <span className="dash-label">Layout — {tid}</span>
        {!locked && hasOverride && (
          <button className="dash-btn dash-btn--ghost dash-btn--sm" type="button" onClick={reset}>
            Reset to template order
          </button>
        )}
      </div>
      {locked ? (
        <p className="dash-lock">
          Control template — layout is locked so the A/B test stays valid.
        </p>
      ) : (
        <span className="dash-help">Drag the handle to reorder. Header, footer and the sticky bar are pinned. Size is a token — the template decides what S / M / L / full mean.</span>
      )}

      <ul className="dash-layout-list" ref={listRef} onPointerLeave={() => setDragOver(null)}>
        {resolved.map((s, i) => {
          const def = manifest.find((m) => m.id === s.id)!;
          const draggable = !locked && !s.required;
          return (
            <li
              key={s.id}
              className={[
                'dash-layout-row',
                s.required ? 'is-pinned' : '',
                s.hidden ? 'is-hidden' : '',
                dragOver === i && dragFrom !== null && dragFrom !== i ? 'is-over' : '',
                dragFrom === i ? 'is-dragging' : '',
              ].join(' ')}
              onPointerEnter={() => dragFrom !== null && setDragOver(i)}
              onPointerUp={() => {
                if (dragFrom !== null && dragOver !== null) move(dragFrom, dragOver);
                setDragFrom(null); setDragOver(null);
              }}
            >
              <span
                className={`dash-handle ${draggable ? '' : 'is-disabled'}`}
                aria-label={draggable ? 'Drag to reorder' : 'Pinned'}
                onPointerDown={(e) => { if (!draggable) return; (e.target as HTMLElement).setPointerCapture?.(e.pointerId); setDragFrom(i); setDragOver(i); }}
                onPointerUp={(e) => { (e.target as HTMLElement).releasePointerCapture?.(e.pointerId); }}
              >
                {s.required ? '📌' : '⠿'}
              </span>
              <span className="dash-layout-name">
                {def.label}
                <code>{s.id}</code>
              </span>
              <span className="dash-layout-controls">
                {!s.required && !locked && (
                  <>
                    <button className="dash-btn dash-btn--ghost dash-btn--xs" type="button" disabled={i === 0 || resolved[i - 1].required} onClick={() => move(i, i - 1)} aria-label="Move up">↑</button>
                    <button className="dash-btn dash-btn--ghost dash-btn--xs" type="button" disabled={i === resolved.length - 1 || resolved[i + 1].required} onClick={() => move(i, i + 1)} aria-label="Move down">↓</button>
                  </>
                )}
                <select
                  className="dash-input dash-input--xs"
                  value={s.size}
                  disabled={locked}
                  aria-label="Section size"
                  onChange={(e) => write(resolved.map((r, n) => (n === i ? { ...r, size: e.target.value as SizeToken } : r)))}
                >
                  {SIZES.map((z) => <option key={z} value={z}>{z}{z === s.defaultSize ? ' (default)' : ''}</option>)}
                </select>
                <label className="dash-check" title={s.required ? 'Required — always shown' : 'Show this section'}>
                  <input
                    type="checkbox"
                    checked={!s.hidden}
                    disabled={locked || s.required}
                    onChange={(e) => write(resolved.map((r, n) => (n === i ? { ...r, hidden: !e.target.checked } : r)))}
                  />
                  shown
                </label>
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
