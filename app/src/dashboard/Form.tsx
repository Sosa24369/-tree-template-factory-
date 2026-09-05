/**
 * The grouped, schema-driven form. It renders by walking FIELDS and grouping by
 * `group` — nothing about the shape is hardcoded. Complex fields (reviews, photos,
 * copy overrides) delegate to their own editors; everything the schema does not
 * describe lands in the "Unlabelled fields" group so it is never silently dropped.
 */

import { useState } from 'react';
import type { Json } from './lib';
import { api, fileToBase64, getPath, setPath, unlabelledLeaves } from './lib';
import { FIELDS, GROUPS, type FieldDef } from './schema';
import { Photos } from './Photos';
import { TEMPLATE_META } from '../templates/meta';

export function Form({ record, onChange, slug }: { record: Json; onChange: (r: Json) => void; slug: string }) {
  const set = (path: string, value: Json) => onChange(setPath(record, path, value));

  const byGroup = GROUPS.map((g) => ({ group: g, fields: FIELDS.filter((f) => f.group === g.id) }));
  const extras = unlabelledLeaves(record);

  return (
    <div className="dash-form">
      {byGroup.map(({ group, fields }) => (
        <fieldset className="dash-group" key={group.id}>
          <legend>{group.label}</legend>
          <p className="dash-group-hint">
            {group.hint} <span className="dash-group-sections">Feeds: {group.sections}</span>
          </p>
          {fields.map((f) => (
            <Field key={f.path} def={f} record={record} set={set} slug={slug} onChange={onChange} />
          ))}
        </fieldset>
      ))}

      {extras.length > 0 && (
        <fieldset className="dash-group dash-group--extra">
          <legend>Unlabelled fields</legend>
          <p className="dash-group-hint">
            These exist in the JSON but have no schema entry yet. They render here rather than disappearing — add them to
            <code> src/dashboard/schema.ts</code> to give them a proper label and group.
          </p>
          {extras.map((path) => (
            <label className="dash-field" key={path}>
              <span className="dash-label">{path}</span>
              <input
                className="dash-input"
                value={stringify(getPath(record, path))}
                onChange={(e) => set(path, coerce(getPath(record, path), e.target.value))}
              />
            </label>
          ))}
        </fieldset>
      )}
    </div>
  );
}

function Field({ def, record, set, slug, onChange }: { def: FieldDef; record: Json; set: (p: string, v: Json) => void; slug: string; onChange: (r: Json) => void }) {
  const value = getPath(record, def.path);

  if (def.type === 'photos') return <Photos record={record} onChange={onChange} slug={slug} />;
  if (def.type === 'reviews') return <Reviews value={value ?? []} onChange={(v) => set(def.path, v)} def={def} />;
  if (def.type === 'logo') return <Logo record={record} onChange={onChange} slug={slug} def={def} />;
  if (def.type === 'templates') return <Templates record={record} onChange={onChange} def={def} />;
  if (def.type === 'demo') return <DemoToggle record={record} onChange={onChange} def={def} />;

  const label = (
    <span className="dash-label">
      {def.label}
      {def.required && <span className="dash-req" title="required">*</span>}
    </span>
  );

  if (def.type === 'checkbox') {
    return (
      <label className="dash-field dash-field--check">
        <input type="checkbox" checked={Boolean(value)} onChange={(e) => set(def.path, e.target.checked)} />
        {label}
        {def.help && <span className="dash-help">{def.help}</span>}
      </label>
    );
  }

  if (def.type === 'select') {
    return (
      <label className="dash-field">
        {label}
        <select className="dash-input" value={value ?? ''} onChange={(e) => set(def.path, e.target.value)}>
          {def.options?.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        {def.help && <span className="dash-help">{def.help}</span>}
      </label>
    );
  }

  if (def.type === 'string-list') {
    const text = Array.isArray(value) ? value.join('\n') : '';
    return (
      <label className="dash-field">
        {label}
        <textarea
          className="dash-input dash-textarea"
          rows={Math.min(10, Math.max(3, (value?.length ?? 0) + 1))}
          value={text}
          onChange={(e) => set(def.path, e.target.value.split('\n').map((s) => s.trim()).filter(Boolean))}
        />
        {def.help && <span className="dash-help">{def.help}</span>}
      </label>
    );
  }

  if (def.type === 'color') {
    return (
      <label className="dash-field">
        {label}
        <span className="dash-color-row">
          <input type="color" value={/^#[0-9a-f]{6}$/i.test(value ?? '') ? value : '#000000'} onChange={(e) => set(def.path, e.target.value)} />
          <input className="dash-input" value={value ?? ''} placeholder="#1f3d2b" onChange={(e) => set(def.path, e.target.value)} />
        </span>
        {def.help && <span className="dash-help">{def.help}</span>}
      </label>
    );
  }

  if (def.type === 'textarea') {
    return (
      <label className="dash-field">
        {label}
        <textarea className="dash-input dash-textarea" rows={3} value={value ?? ''} onChange={(e) => set(def.path, e.target.value)} />
        {def.help && <span className="dash-help">{def.help}</span>}
      </label>
    );
  }

  // text / tel / url
  return (
    <label className="dash-field">
      {label}
      <input
        className="dash-input"
        type={def.type === 'tel' ? 'tel' : def.type === 'url' ? 'url' : 'text'}
        value={value ?? ''}
        placeholder={def.placeholder}
        onChange={(e) => set(def.path, e.target.value === '' && value === null ? null : e.target.value)}
      />
      {def.help && <span className="dash-help">{def.help}</span>}
    </label>
  );
}

function Reviews({ value, onChange, def }: { value: any[]; onChange: (v: any[]) => void; def: FieldDef }) {
  const setAt = (i: number, patch: any) => onChange(value.map((r, n) => (n === i ? { ...r, ...patch } : r)));
  return (
    <div className="dash-field">
      <span className="dash-label">{def.label}</span>
      {def.help && <span className="dash-help">{def.help}</span>}
      {value.map((r, i) => (
        <div className="dash-card" key={i}>
          <div className="dash-card-row">
            <input className="dash-input" placeholder="Author" value={r.author ?? ''} onChange={(e) => setAt(i, { author: e.target.value })} />
            <input className="dash-input" placeholder="Attribution (e.g. Google Review · a month ago)" value={r.meta ?? ''} onChange={(e) => setAt(i, { meta: e.target.value })} />
          </div>
          <textarea className="dash-input dash-textarea" rows={2} placeholder="Review text" value={r.body ?? ''} onChange={(e) => setAt(i, { body: e.target.value })} />
          <button className="dash-btn dash-btn--ghost dash-btn--sm" type="button" onClick={() => onChange(value.filter((_, n) => n !== i))}>
            Remove review
          </button>
        </div>
      ))}
      <button className="dash-btn dash-btn--sm" type="button" onClick={() => onChange([...value, { author: '', meta: '', body: '' }])}>
        + Add review
      </button>
    </div>
  );
}

/**
 * The LOGO field. Upload goes through /api/dash/upload-logo, which produces ONE
 * 192px webp — not a srcset (see dashboard-core's processLogo for why a srcset
 * costs LCP here). It writes the intrinsic width/height the pipeline measured, so
 * the header reserves the box before the file loads (CLS 0), and it clears any
 * stale logoSrcset left on an older record.
 *
 * "No logo" is a legitimate, tested state (R5): the header renders the company name
 * as a wordmark. Removing is one click, not a JSON edit.
 */
function Logo({ record, onChange, slug, def }: { record: Json; onChange: (r: Json) => void; slug: string; def: FieldDef }) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const brand = record.brand ?? {};
  const src = brand.logoUrl ?? null;

  async function upload(file: File) {
    setBusy(true);
    setErr(null);
    try {
      const dataBase64 = await fileToBase64(file);
      const { logo } = await api.uploadLogo({ slug, filename: file.name, dataBase64 });
      const nextBrand = { ...brand, logoUrl: logo.src, logoWidth: logo.width, logoHeight: logo.height };
      delete nextBrand.logoSrcset;
      onChange({ ...record, brand: nextBrand });
      if (logo.sourceLongestEdge && logo.sourceLongestEdge < 192) {
        setErr(`Uploaded, but the source is only ${logo.sourceLongestEdge}px on its longest edge. It was NOT upscaled, so it will look soft in the header. A 384px+ original is better.`);
      }
    } catch (e: any) {
      setErr(e.message);
    } finally {
      setBusy(false);
    }
  }

  function clear() {
    const nextBrand = { ...brand, logoUrl: null };
    delete nextBrand.logoWidth;
    delete nextBrand.logoHeight;
    delete nextBrand.logoSrcset;
    onChange({ ...record, brand: nextBrand });
  }

  return (
    <div className="dash-field">
      <span className="dash-label">{def.label}</span>
      <div className="dash-logo-row">
        <span className="dash-logo-preview" style={{ background: brand.primaryColor || '#eef1f4' }}>
          {src ? <img src={src} alt="" width={64} height={64} /> : <em>{record.name || slug}</em>}
        </span>
        <span className="dash-logo-actions">
          <label className="dash-btn dash-btn--sm">
            {busy ? 'Processing…' : src ? 'Replace logo' : 'Upload logo'}
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp,image/svg+xml"
              hidden
              disabled={busy}
              onChange={(e) => { const f = e.target.files?.[0]; if (f) upload(f); e.currentTarget.value = ''; }}
            />
          </label>
          {src && (
            <button className="dash-btn dash-btn--ghost dash-btn--sm" type="button" onClick={clear}>
              Remove (use the name as a wordmark)
            </button>
          )}
          {src && <code className="dash-logo-path">{src} · {brand.logoWidth}×{brand.logoHeight}</code>}
        </span>
      </div>
      {err && <p className="dash-v-warn">⚠ {err}</p>}
      <span className="dash-help">{def.help}</span>
    </div>
  );
}

/**
 * WHICH TEMPLATES THIS CLIENT GETS.
 *
 * The record stores the negative (`excludedTemplates`), because every template
 * applies by default and a new template must reach every existing client without
 * anyone editing ten files. The editor shows the positive, because "which pages does
 * this client have" is the question a person actually asks.
 */
function Templates({ record, onChange, def }: { record: Json; onChange: (r: Json) => void; def: FieldDef }) {
  const excluded: string[] = record.excludedTemplates ?? [];
  const toggle = (id: string, on: boolean) => {
    const next = on ? excluded.filter((t) => t !== id) : [...new Set([...excluded, id])];
    onChange({ ...record, excludedTemplates: next.sort() });
  };
  const included = TEMPLATE_META.filter((t) => !excluded.includes(t.id)).length;
  const base = record.isDemo ? '/demo' : '/p';

  return (
    <div className="dash-field">
      <span className="dash-label">{def.label}</span>
      <span className="dash-help">{def.help}</span>
      <p className="dash-help">
        <strong>{included} of {TEMPLATE_META.length}</strong> pages will be built for this client, at
        <code> {base}/{record.slug ?? '<slug>'}/&lt;template&gt;</code>.
      </p>
      <ul className="dash-tpl-list">
        {TEMPLATE_META.map((t) => {
          const on = !excluded.includes(t.id);
          return (
            <li key={t.id} className={on ? '' : 'is-off'}>
              <label className="dash-check">
                <input type="checkbox" checked={on} onChange={(e) => toggle(t.id, e.target.checked)} />
                <span className="dash-tpl-label">{t.label}</span>
                <code>{t.id}</code>
              </label>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/**
 * THE DEMO SWITCH. Not an ordinary checkbox: it moves every one of this client's
 * pages to a different URL prefix, marks them noindex/nofollow, and makes the lead
 * Function refuse their form submissions. Turning it ON for a paying client would
 * take their ad destinations offline; turning it OFF for the demo would put a fake
 * company into the index. So it confirms, and it says what it does.
 */
function DemoToggle({ record, onChange, def }: { record: Json; onChange: (r: Json) => void; def: FieldDef }) {
  const isDemo = record.isDemo === true;
  const [confirming, setConfirming] = useState(false);

  function apply(next: boolean) {
    setConfirming(false);
    const r = { ...record };
    if (next) r.isDemo = true;
    else delete r.isDemo;
    onChange(r);
  }

  return (
    <div className={`dash-field dash-demo ${isDemo ? 'is-demo' : ''}`}>
      <span className="dash-label">{def.label}</span>
      <p className="dash-help">
        {isDemo ? (
          <>
            This client is a <strong>demo</strong>. Its pages are built at <code>/demo/{record.slug}/…</code>, carry
            <code> noindex, nofollow</code> plus an <code>X-Robots-Tag</code>, and the lead Function refuses their form
            submissions before it reads any token — a demo submit can never reach a CRM.
          </>
        ) : (
          <>This is a real client. Its pages are built at <code>/p/{record.slug}/…</code> and its form submits to the CRM.</>
        )}
      </p>
      {!confirming ? (
        <button className="dash-btn dash-btn--ghost dash-btn--sm" type="button" onClick={() => setConfirming(true)}>
          {isDemo ? 'Convert to a real client…' : 'Convert to a demo account…'}
        </button>
      ) : (
        <div className="dash-confirm">
          <p className="dash-v-warn">
            {isDemo
              ? '⚠ This client’s pages move from /demo/ to /p/, become indexable, and start routing leads to GHL. They will need a GHL location id and a token secret before a lead can land anywhere.'
              : '⚠ Every page for this client MOVES from /p/ to /demo/. Any ad pointing at a /p/ URL for them will 404, and their form will stop submitting. Do not do this to a client who is running ads.'}
          </p>
          <div className="dash-modal-actions">
            <button className="dash-btn dash-btn--ghost dash-btn--sm" type="button" onClick={() => setConfirming(false)}>Cancel</button>
            <button className="dash-btn dash-btn--sm" type="button" onClick={() => apply(!isDemo)}>
              Yes, {isDemo ? 'make it a real client' : 'make it a demo'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function stringify(v: Json): string {
  if (v == null) return '';
  if (typeof v === 'object') return JSON.stringify(v);
  return String(v);
}
function coerce(prev: Json, text: string): Json {
  if (typeof prev === 'number') return text === '' ? null : Number(text);
  if (typeof prev === 'boolean') return text === 'true';
  return text;
}
