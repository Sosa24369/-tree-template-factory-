/**
 * The grouped, schema-driven form. It renders by walking FIELDS and grouping by
 * `group` — nothing about the shape is hardcoded. Complex fields (reviews, photos,
 * copy overrides) delegate to their own editors; everything the schema does not
 * describe lands in the "Unlabelled fields" group so it is never silently dropped.
 */

import type { Json } from './lib';
import { getPath, setPath, unlabelledLeaves } from './lib';
import { FIELDS, GROUPS, type FieldDef } from './schema';
import { Photos } from './Photos';

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
  if (def.path === 'copyOverrides') return <CopyOverrides value={value ?? {}} onChange={(v) => set(def.path, v)} def={def} />;

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

function CopyOverrides({ value, onChange, def }: { value: Record<string, Record<string, string>>; onChange: (v: any) => void; def: FieldDef }) {
  const templates = Object.keys(value);
  const setKey = (tpl: string, key: string, val: string) => onChange({ ...value, [tpl]: { ...value[tpl], [key]: val } });
  const removeKey = (tpl: string, key: string) => {
    const next = { ...value, [tpl]: { ...value[tpl] } };
    delete next[tpl][key];
    if (Object.keys(next[tpl]).length === 0) delete next[tpl];
    onChange(next);
  };
  return (
    <div className="dash-field">
      <span className="dash-label">{def.label}</span>
      {def.help && <span className="dash-help">{def.help}</span>}
      {templates.length === 0 && <p className="dash-empty">No copy overrides. This client uses every template’s default copy. Add one below to change a headline, offer or FAQ line for a specific template.</p>}
      {templates.map((tpl) => (
        <div className="dash-card" key={tpl}>
          <strong className="dash-card-title">{tpl}</strong>
          {Object.keys(value[tpl]).map((key) => (
            <div key={key}>
              <span className="dash-copy-key">{key}</span>
              <div className="dash-card-row">
                <textarea className="dash-input dash-textarea" rows={2} value={value[tpl][key]} onChange={(e) => setKey(tpl, key, e.target.value)} />
                <button className="dash-btn dash-btn--ghost dash-btn--sm" type="button" onClick={() => removeKey(tpl, key)}>
                  ×
                </button>
              </div>
            </div>
          ))}
        </div>
      ))}
      <AddOverride onAdd={(tpl, key, val) => setKey(tpl, key, val)} />
    </div>
  );
}

function AddOverride({ onAdd }: { onAdd: (tpl: string, key: string, val: string) => void }) {
  const templateIds = ['removal-a', 'removal-b', 'trimming-a', 'trimming-b', 'storm-a', 'storm-b', 'agnostic'];
  return (
    <details className="dash-add">
      <summary>+ Add a copy override</summary>
      <form
        className="dash-add-form"
        onSubmit={(e) => {
          e.preventDefault();
          const f = e.currentTarget as any;
          const tpl = f.tpl.value, key = f.key.value.trim(), val = f.val.value;
          if (tpl && key) {
            onAdd(tpl, key, val);
            f.key.value = '';
            f.val.value = '';
          }
        }}
      >
        <select name="tpl" className="dash-input">
          {templateIds.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
        <input name="key" className="dash-input" placeholder="copy key, e.g. hero.h1b" />
        <textarea name="val" className="dash-input dash-textarea" rows={2} placeholder="override value" />
        <button className="dash-btn dash-btn--sm" type="submit">
          Add
        </button>
      </form>
    </details>
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
