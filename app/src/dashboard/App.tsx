/**
 * The dashboard shell.
 *
 * Left: pick a client (or create one). Centre: the schema-driven grouped form. Right:
 * the live preview — the real template rendering the edited record, updated as you
 * type, with a picker to preview the same client across every template. Bottom: the
 * validation summary and the save flow (diff first, then write + commit).
 *
 * The JSON files remain the source of truth; this is a form over them. Saving writes
 * and commits — it never deploys.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { Json } from './lib';
import { api, validate } from './lib';
import { Form } from './Form';
import './dashboard.css';

const TEMPLATES = ['storm-a', 'storm-b', 'removal-a', 'removal-b', 'trimming-a', 'trimming-b', 'agnostic'];

export function App() {
  const [clients, setClients] = useState<{ slug: string; name: string }[]>([]);
  const [slug, setSlug] = useState<string | null>(null);
  const [record, setRecord] = useState<Json | null>(null);
  const [dirty, setDirty] = useState(false);
  const [previewTpl, setPreviewTpl] = useState('storm-a');
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [diff, setDiff] = useState<string | null>(null);
  const [commitMsg, setCommitMsg] = useState('');
  const [showNew, setShowNew] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const loadClients = useCallback(() => api.clients().then((r) => setClients(r.clients)), []);
  useEffect(() => { loadClients(); }, [loadClients]);

  const selectClient = useCallback(async (s: string) => {
    const { record } = await api.client(s);
    setSlug(s);
    setRecord(record);
    setDirty(false);
  }, []);

  const validation = useMemo(() => (record ? validate(record) : { errors: [], warnings: [] }), [record]);

  // Push the edited record into the preview iframe whenever it changes.
  const postPreview = useCallback(() => {
    if (record && iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage({ type: 'dash-preview', record, templateId: previewTpl }, '*');
    }
  }, [record, previewTpl]);
  useEffect(() => { const t = setTimeout(postPreview, 120); return () => clearTimeout(t); }, [postPreview]);
  useEffect(() => {
    const onReady = (e: MessageEvent) => { if (e.data?.type === 'dash-preview-ready') postPreview(); };
    window.addEventListener('message', onReady);
    return () => window.removeEventListener('message', onReady);
  }, [postPreview]);

  const onChange = (r: Json) => { setRecord(r); setDirty(true); };

  async function reviewSave() {
    if (!slug || !record) return;
    if (validation.errors.length) { setToast('Fix the errors before saving.'); return; }
    setBusy(true);
    try {
      const { diff } = await api.diff(slug, record);
      setDiff(diff || '(no changes)');
      setCommitMsg(`dashboard: update ${slug}`);
    } catch (e: any) {
      setToast('Diff failed: ' + e.message);
    } finally {
      setBusy(false);
    }
  }

  async function confirmSave() {
    if (!slug || !record) return;
    setBusy(true);
    try {
      const res = await api.save(slug, record, commitMsg);
      setDiff(null);
      setDirty(false);
      setToast(res.commit ? `Saved & committed ${res.commit}` : 'Saved (no net change to commit)');
      await loadClients();
    } catch (e: any) {
      const errs = e.body?.errors ? e.body.errors.join(' ') : e.message;
      setToast('Save failed: ' + errs);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="dash">
      <aside className="dash-side">
        <div className="dash-brand">
          <strong>Content dashboard</strong>
          <span className="dash-brand-sub">local only · writes + commits, never deploys</span>
        </div>
        <button className="dash-btn dash-btn--block" type="button" onClick={() => setShowNew(true)}>
          + New client
        </button>
        <ul className="dash-clients">
          {clients.map((c) => (
            <li key={c.slug}>
              <button className={`dash-client ${slug === c.slug ? 'is-active' : ''}`} type="button" onClick={() => selectClient(c.slug)}>
                <span className="dash-client-name">{c.name}</span>
                <code>{c.slug}</code>
              </button>
            </li>
          ))}
        </ul>
      </aside>

      <main className="dash-main">
        {!record && <div className="dash-placeholder">Pick a client to edit, or create one.</div>}
        {record && (
          <>
            <header className="dash-head">
              <div>
                <h1>{record.name || slug}</h1>
                <code>clients/{slug}.json{dirty ? ' •' : ''}</code>
              </div>
              <div className="dash-head-actions">
                {validation.errors.length > 0 && <span className="dash-pill dash-pill--err">{validation.errors.length} error{validation.errors.length === 1 ? '' : 's'}</span>}
                {validation.warnings.length > 0 && <span className="dash-pill dash-pill--warn">{validation.warnings.length} warning{validation.warnings.length === 1 ? '' : 's'}</span>}
                <button className="dash-btn" type="button" disabled={busy || !dirty || validation.errors.length > 0} onClick={reviewSave}>
                  Review &amp; save
                </button>
              </div>
            </header>

            {(validation.errors.length > 0 || validation.warnings.length > 0) && (
              <div className="dash-validation">
                {validation.errors.map((e, i) => <p key={i} className="dash-v-err">✗ {e}</p>)}
                {validation.warnings.map((w, i) => <p key={i} className="dash-v-warn">⚠ {w}</p>)}
              </div>
            )}

            <Form record={record} onChange={onChange} slug={slug!} />
          </>
        )}
      </main>

      <section className="dash-preview">
        <div className="dash-preview-bar">
          <select className="dash-input" value={previewTpl} onChange={(e) => setPreviewTpl(e.target.value)}>
            {TEMPLATES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
          <span className="dash-help">live preview</span>
        </div>
        <iframe ref={iframeRef} className="dash-frame" src="/dashboard-preview.html" title="Live preview" />
      </section>

      {toast && <div className="dash-toast" onClick={() => setToast(null)}>{toast}</div>}

      {diff !== null && (
        <div className="dash-modal" role="dialog" aria-modal="true">
          <div className="dash-modal-card dash-modal-card--wide">
            <h3>Review changes to clients/{slug}.json</h3>
            {validation.warnings.length > 0 && <p className="dash-v-warn">⚠ {validation.warnings.join(' ')}</p>}
            <pre className="dash-diff">{colorless(diff)}</pre>
            <label className="dash-field">
              <span className="dash-label">Commit message</span>
              <input className="dash-input" value={commitMsg} onChange={(e) => setCommitMsg(e.target.value)} />
            </label>
            <div className="dash-modal-actions">
              <button className="dash-btn dash-btn--ghost" type="button" onClick={() => setDiff(null)}>Cancel</button>
              <button className="dash-btn" type="button" disabled={busy} onClick={confirmSave}>Write &amp; commit</button>
            </div>
          </div>
        </div>
      )}

      {showNew && <NewClient clients={clients} onClose={() => setShowNew(false)} onCreated={async (s) => { setShowNew(false); await loadClients(); await selectClient(s); }} />}
    </div>
  );
}

function NewClient({ clients, onClose, onCreated }: { clients: { slug: string; name: string }[]; onClose: () => void; onCreated: (slug: string) => void }) {
  const [slug, setSlug] = useState('');
  const [from, setFrom] = useState(clients[0]?.slug ?? '');
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  return (
    <div className="dash-modal" role="dialog" aria-modal="true">
      <div className="dash-modal-card">
        <h3>New client</h3>
        <p className="dash-help">Duplicates an existing record as a starting point. Photos are NOT copied — a fresh asset folder is created and the photo slots start empty.</p>
        <label className="dash-field">
          <span className="dash-label">New slug</span>
          <input className="dash-input" value={slug} placeholder="acme-tree-co" onChange={(e) => setSlug(e.target.value.toLowerCase())} />
        </label>
        <label className="dash-field">
          <span className="dash-label">Duplicate from</span>
          <select className="dash-input" value={from} onChange={(e) => setFrom(e.target.value)}>
            {clients.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.name} ({c.slug})
              </option>
            ))}
          </select>
        </label>
        {err && <p className="dash-v-err">✗ {err}</p>}
        <div className="dash-modal-actions">
          <button className="dash-btn dash-btn--ghost" type="button" onClick={onClose}>Cancel</button>
          <button
            className="dash-btn"
            type="button"
            disabled={busy || !slug}
            onClick={async () => {
              setBusy(true);
              setErr(null);
              try {
                await api.newClient(slug, from);
                onCreated(slug);
              } catch (e: any) {
                setErr(e.message);
              } finally {
                setBusy(false);
              }
            }}
          >
            Create
          </button>
        </div>
      </div>
    </div>
  );
}

/** git diff arrives with no colour; keep it as plain text (the <pre> styles +/-). */
function colorless(s: string): string {
  return s;
}
