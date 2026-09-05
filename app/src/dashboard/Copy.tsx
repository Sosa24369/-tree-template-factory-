/**
 * THE COPY EDITOR — every text field a template ships, per template.
 *
 * The old panel could only edit an override you already knew the key of, and the
 * preview's click-to-edit reaches leaf text nodes only (a heading split across two
 * styled spans, or a sentence with a link in it, is not clickable). So the strings
 * that most need editing — the offer band, the FAQ answers, the process steps — were
 * the hardest to reach. This lists all of them.
 *
 * For the selected template it walks COPY_DEFAULTS in the order the copy file declares
 * (page order), groups by key namespace, and shows each key's shipped default with the
 * client's override on top of it. Editing writes an override; clearing it back to the
 * default REMOVES the override rather than storing a duplicate, so a record only ever
 * carries the strings that actually differ.
 *
 * Two things it refuses to hide:
 *   - a `{{token}}` in a value composes from the client record ({{name}}, {{areaName}},
 *     {{areaProse}}). Overwriting the token with a literal hardcodes this client's name
 *     or city into their copy, which is fine, but it stops following the record — so
 *     the row says so.
 *   - editing a control (-a) template's copy also changes its -c hybrid, and copy is
 *     the A/B test's constant. The banner says which template is affected.
 */

import { useMemo, useState } from 'react';
import type { Json } from './lib';
import { COPY_DEFAULTS, INHERITS_OVERRIDES_FROM, groupFor, keysFor } from './copyDefaults';
import { TEMPLATE_META } from '../templates/meta';
import type { TemplateId } from '../schema/client';

const TOKEN_RE = /\{\{[a-zA-Z]+(\|[^}]*)?\}\}/;

export function Copy({
  record,
  templateId,
  onChange,
  onPickTemplate,
}: {
  record: Json;
  templateId: TemplateId;
  onChange: (r: Json) => void;
  onPickTemplate: (t: TemplateId) => void;
}) {
  const [q, setQ] = useState('');
  const [onlyOverridden, setOnlyOverridden] = useState(false);

  const defaults = COPY_DEFAULTS[templateId] ?? {};
  // A hybrid has no overrides of its own in practice: it inherits its control's.
  // Editing it here would write copyOverrides['removal-c'], which DOES win — but it
  // would also break the parity the hybrid exists to hold. So a hybrid is edited
  // through its control, and the picker sends you there.
  const inheritsFrom = INHERITS_OVERRIDES_FROM[templateId];
  const editTarget = (inheritsFrom ?? templateId) as TemplateId;
  const overrides: Record<string, string> = record.copyOverrides?.[editTarget] ?? {};

  const rows = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return keysFor(templateId)
      .map((key) => ({
        key,
        group: groupFor(key),
        def: defaults[key] ?? '',
        override: Object.hasOwn(overrides, key) ? overrides[key] : null,
      }))
      .filter((r) => (onlyOverridden ? r.override !== null : true))
      .filter((r) => !needle || r.key.toLowerCase().includes(needle) || r.def.toLowerCase().includes(needle) || (r.override ?? '').toLowerCase().includes(needle));
  }, [templateId, q, onlyOverridden, defaults, overrides]);

  const grouped = useMemo(() => {
    const out: { group: string; rows: typeof rows }[] = [];
    for (const row of rows) {
      const last = out[out.length - 1];
      if (last && last.group === row.group) last.rows.push(row);
      else out.push({ group: row.group, rows: [row] });
    }
    return out;
  }, [rows]);

  function write(key: string, value: string) {
    const next = { ...(record.copyOverrides ?? {}) };
    const forTpl = { ...(next[editTarget] ?? {}) };
    // Typing the default back in removes the override — a record should only ever
    // carry the strings that actually differ from the template.
    if (value === (defaults[key] ?? '')) delete forTpl[key];
    else forTpl[key] = value;
    if (Object.keys(forTpl).length) next[editTarget] = forTpl;
    else delete next[editTarget];
    onChange({ ...record, copyOverrides: next });
  }

  const overrideCount = Object.keys(overrides).length;
  const totalKeys = keysFor(templateId).length;
  const affectedHybrid = TEMPLATE_META.find((t) => INHERITS_OVERRIDES_FROM[t.id] === templateId);

  return (
    <div className="dash-field dash-copy">
      <div className="dash-copy-head">
        <span className="dash-label">Copy — every text field on this template</span>
        <select className="dash-input dash-input--xs" value={templateId} onChange={(e) => onPickTemplate(e.target.value as TemplateId)}>
          {TEMPLATE_META.map((t) => (
            <option key={t.id} value={t.id}>{t.label} ({t.id})</option>
          ))}
        </select>
      </div>

      <p className="dash-help">
        {totalKeys} text fields ship with <code>{templateId}</code>. {overrideCount} overridden for this client.
        Clear a field back to its default to remove the override.
      </p>

      {inheritsFrom && (
        <p className="dash-copy-note">
          <strong>{templateId}</strong> renders <strong>{inheritsFrom}</strong>’s copy, byte for byte — that is what the
          hybrid exists to prove. Edits below are written to <code>{inheritsFrom}</code> and change both pages.
        </p>
      )}
      {!inheritsFrom && affectedHybrid && (
        <p className="dash-copy-note">
          This is a control. Its copy is also rendered by <strong>{affectedHybrid.id}</strong>, and copy is the constant
          the A/B test holds fixed — an edit here changes what the test is measuring.
        </p>
      )}

      <div className="dash-copy-tools">
        <input className="dash-input" placeholder="Search keys and text…" value={q} onChange={(e) => setQ(e.target.value)} />
        <label className="dash-check">
          <input type="checkbox" checked={onlyOverridden} onChange={(e) => setOnlyOverridden(e.target.checked)} />
          only overridden
        </label>
      </div>

      {grouped.length === 0 && <p className="dash-empty">No copy field matches “{q}”.</p>}

      {grouped.map(({ group, rows }) => (
        <div className="dash-copy-group" key={group + rows[0].key}>
          <h4 className="dash-copy-group-title">{group}</h4>
          {rows.map((r) => {
            const value = r.override ?? r.def;
            const isOverridden = r.override !== null;
            const lines = Math.min(8, Math.max(1, Math.ceil(value.length / 70)));
            return (
              <div className={`dash-copy-row ${isOverridden ? 'is-overridden' : ''}`} key={r.key}>
                <div className="dash-copy-row-head">
                  <code className="dash-copy-key">{r.key}</code>
                  {isOverridden && (
                    <button className="dash-btn dash-btn--ghost dash-btn--xs" type="button" onClick={() => write(r.key, r.def)}>
                      revert to default
                    </button>
                  )}
                </div>
                <textarea
                  className="dash-input dash-textarea"
                  rows={lines}
                  value={value}
                  onChange={(e) => write(r.key, e.target.value)}
                />
                {TOKEN_RE.test(r.def) && (
                  <span className="dash-help">
                    Default composes from the client record ({r.def.match(TOKEN_RE)![0]}). Replacing it with literal text
                    stops this line following the record.
                  </span>
                )}
                {isOverridden && (
                  <span className="dash-copy-default" title="the template's shipped default">
                    default: {r.def || '(empty)'}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
