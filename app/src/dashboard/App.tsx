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
import { Layout } from './Layout';
import { Copy } from './Copy';
import { SectionArt } from './SectionArt';
import { Readiness } from './Readiness';
import { TEMPLATE_META } from '../templates/meta';
import type { TemplateId } from '../schema/client';

// The preview picker walks TEMPLATE_META directly, so all ten are reachable. The old
// hardcoded list was seven: the three -c hybrids could not be previewed at all, which
// is exactly where a layout or copy mistake hides.

export function App() {
  const [clients, setClients] = useState<{ slug: string; name: string }[]>([]);
  const [slug, setSlug] = useState<string | null>(null);
  const [record, setRecord] = useState<Json | null>(null);
  const [dirty, setDirty] = useState(false);
  const [previewTpl, setPreviewTpl] = useState<TemplateId>('removal-a');
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

  // Inline copy edits arrive from the preview iframe and land in copyOverrides.
  // Copy keys contain dots (hero.h1a), so this writes the nested object directly
  // rather than through setPath.
  const [tagged, setTagged] = useState<number | null>(null);
  // Publish state (server-only; the dev plugin has no /api/publish and stays idle).
  const [pub, setPub] = useState<any>({ state: 'idle' });
  const [pubOpen, setPubOpen] = useState(false);
  useEffect(() => {
    let stop = false;
    const tick = async () => { try { const s = await api.publishStatus(); if (!stop) setPub(s); } catch { /* dev plugin: no endpoint */ } };
    tick(); const t = setInterval(tick, 2500); return () => { stop = true; clearInterval(t); };
  }, []);
  /**
   * `confirmProtected` is only ever passed after the server has BLOCKED a publish and
   * told us which live campaign pages would change. The token names that exact set,
   * so it cannot be reused for a later publish that touches different pages.
   */
  async function startPublish(confirmProtected?: string) {
    if (dirty) { setToast('Save first — publish deploys what is committed, not what is on screen.'); return; }
    setPubOpen(true);
    try { setPub(await api.publish(confirmProtected)); } catch (e: any) { setToast('Publish request failed: ' + e.message); }
  }
  useEffect(() => {
    const onEdit = (e: MessageEvent) => {
      if (e.data?.type === 'dash-preview-tagged') { setTagged(e.data.tagged); return; }
      if (e.data?.type !== 'dash-copy-edit') return;
      const { templateId, key, value } = e.data as { templateId: string; key: string; value: string };
      setRecord((r: Json) => {
        if (!r) return r;
        const overrides = { ...(r.copyOverrides ?? {}) };
        overrides[templateId] = { ...(overrides[templateId] ?? {}), [key]: value };
        return { ...r, copyOverrides: overrides };
      });
      setDirty(true);
    };
    window.addEventListener('message', onEdit);
    return () => window.removeEventListener('message', onEdit);
  }, []);

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
          <strong>Template Studio</strong>
          <span className="dash-brand-sub">edits the client records · previews · publishes behind the guard suite</span>
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
                <button className="dash-btn dash-btn--ghost" type="button" disabled={busy || ['pulling','building','deploying'].includes(pub.state)} onClick={() => startPublish()} title="Commit + push, build, and deploy the landing pages">{['pulling','building','deploying'].includes(pub.state) ? `Publishing… (${pub.state})` : pub.state === 'live' ? 'Publish again' : pub.state === 'failed' ? 'Publish (last failed)' : 'Publish'}</button>
              </div>
            </header>

            {(validation.errors.length > 0 || validation.warnings.length > 0) && (
              <div className="dash-validation">
                {validation.errors.map((e, i) => <p key={i} className="dash-v-err">✗ {e}</p>)}
                {validation.warnings.map((w, i) => <p key={i} className="dash-v-warn">⚠ {w}</p>)}
              </div>
            )}

            <Readiness record={record} />
            <Layout record={record} templateId={previewTpl} onChange={onChange} />
            <Form record={record} onChange={onChange} slug={slug!} />
            <SectionArt record={record} templateId={previewTpl} slug={slug!} onChange={onChange} />
            <Copy record={record} templateId={previewTpl} onChange={onChange} onPickTemplate={setPreviewTpl} />
          </>
        )}
      </main>

      <section className="dash-preview">
        <div className="dash-preview-bar">
          <select className="dash-input" value={previewTpl} onChange={(e) => setPreviewTpl(e.target.value as TemplateId)}>
            {TEMPLATE_META.map((t) => (
              <option key={t.id} value={t.id} disabled={(record?.excludedTemplates ?? []).includes(t.id)}>
                {t.id}{(record?.excludedTemplates ?? []).includes(t.id) ? ' — not built for this client' : ''}
              </option>
            ))}
          </select>
          <span className="dash-help">live preview · click any text to edit it{tagged !== null ? ` (${tagged} editable)` : ''}{/-a$/.test(previewTpl) ? ' · control: copy edits affect the A/B test' : ''}</span>
        </div>
        <iframe ref={iframeRef} className="dash-frame" src="/dashboard-preview.html" title="Live preview" />
      </section>

      {(pubOpen || pub.state === 'failed' || pub.state === 'blocked') && pub.state !== 'idle' && (
        <div className={`dash-publish dash-publish--${pub.state}`}>
          <div className="dash-publish-head">
            <strong>Publish: {pub.state}{pub.stage && pub.stage !== pub.state ? ` (${pub.stage})` : ''}</strong>
            {pub.url && <a href={pub.url} target="_blank" rel="noreferrer">{pub.url}</a>}
            {pub.exitCode != null && pub.state === 'failed' && <code>exit {pub.exitCode} at {pub.stage}</code>}
            <button className="dash-btn dash-btn--ghost dash-btn--sm" type="button" onClick={() => setPubOpen(false)}>Hide</button>
          </div>

          {/* The guard suite, live. Every guard is listed before it runs, so it is
              visible that a publish is gated on all of them rather than on whichever
              happened to be checked. A failure names the guard AND what it means. */}
          <GuardList suite={pub.suite ?? []} results={pub.guards ?? []} running={pub.runningGuard} />

          {pub.state === 'failed' && (pub.failedGuards ?? []).length > 0 && (
            <p className="dash-v-err">
              ✗ Nothing was deployed. {pub.failedGuards.length} guard{pub.failedGuards.length === 1 ? '' : 's'} failed:{' '}
              <strong>{pub.failedGuards.join(', ')}</strong>. Fix the cause and publish again — there is no override.
            </p>
          )}

          {/* The live-campaign gate. This is the only confirmation in the studio that
              can put a change onto a page carrying ad spend, so it names every route
              and shows what differs before it will accept a click. */}
          {pub.state === 'blocked' && (
            <div className="dash-blocked">
              <p className="dash-v-warn">
                ⚠ Stopped before deploying. This build would change {pub.protectedRoutes?.changed?.length ?? 0} live
                campaign page{(pub.protectedRoutes?.changed?.length ?? 0) === 1 ? '' : 's'}
                {(pub.protectedRoutes?.unreachable?.length ?? 0) > 0 && `, and ${pub.protectedRoutes.unreachable.length} could not be verified`}.
                Nothing has been uploaded.
              </p>
              <ul className="dash-blocked-list">
                {(pub.protectedRoutes?.changed ?? []).map((c: any) => (
                  <li key={c.route}>
                    <code>{c.route}</code> — {c.reason}
                    {c.diff?.length > 0 && <pre className="dash-publish-tail">{c.diff.join('\n')}</pre>}
                  </li>
                ))}
                {(pub.protectedRoutes?.unreachable ?? []).map((u: any) => (
                  <li key={u.route}>
                    <code>{u.route}</code> — {u.reason}. Treated as unsafe: an unreachable page is not a page proven unchanged.
                  </li>
                ))}
              </ul>
              <div className="dash-modal-actions">
                <button className="dash-btn dash-btn--ghost" type="button" onClick={() => setPubOpen(false)}>Cancel — do not deploy</button>
                <button className="dash-btn dash-btn--danger" type="button" onClick={() => startPublish(pub.confirmToken)}>
                  I have checked these {(pub.protectedRoutes?.changed?.length ?? 0) + (pub.protectedRoutes?.unreachable?.length ?? 0)} page(s) — deploy anyway
                </button>
              </div>
            </div>
          )}

          <pre className="dash-publish-tail">{(pub.tail ?? []).join('\n') || '…'}</pre>
        </div>
      )}
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

      {showNew && <NewClient onClose={() => setShowNew(false)} onCreated={async (s) => { setShowNew(false); await loadClients(); await selectClient(s); }} />}
    </div>
  );
}

/**
 * The guard suite as a live list. `suite` is what WILL run (from the server, so the
 * UI cannot drift from the real gate); `results` is what has run so far.
 */
function GuardList({ suite, results, running }: { suite: any[]; results: any[]; running: string | null }) {
  if (!suite.length) return null;
  const byId = new Map(results.map((r) => [r.id, r]));
  return (
    <ul className="dash-guards">
      {suite.map((g) => {
        const r = byId.get(g.id);
        const state = r ? (r.ok ? 'ok' : 'fail') : running === g.id ? 'running' : 'pending';
        return (
          <li key={g.id} className={`dash-guard dash-guard--${state}`}>
            <span className="dash-guard-icon" aria-hidden="true">{state === 'ok' ? '✓' : state === 'fail' ? '✗' : state === 'running' ? '…' : '·'}</span>
            <span className="dash-guard-body">
              <strong>{g.label}</strong>
              {state === 'fail' && <span className="dash-guard-why">{g.why}</span>}
              {state === 'fail' && r?.tail?.length > 0 && <pre className="dash-publish-tail">{r.tail.join('\n')}</pre>}
              {state === 'ok' && <span className="dash-guard-ms">{r.ms} ms</span>}
            </span>
          </li>
        );
      })}
    </ul>
  );
}

/**
 * THE NEW-CLIENT FLOW.
 *
 * Name, slug, colours, phone, service areas, which templates, demo or not — then the
 * record is written and the studio opens it, with the readiness checklist saying what
 * is still needed before it can take a real lead. Logo upload and photos happen next,
 * in the editor, because they need the client's asset folder to exist first.
 *
 * It does NOT duplicate an existing client. That is what it used to do, and it carried
 * the source client's GHL location id and GTM container into the new record — leads
 * into the wrong sub-account, conversions into the wrong ad account. CRM and tracking
 * now start empty and are filled in deliberately. verify-factory-rules.mjs refuses a
 * build where two records share either identifier.
 */
function NewClient({ onClose, onCreated }: { onClose: () => void; onCreated: (slug: string) => void }) {
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [slugTouched, setSlugTouched] = useState(false);
  const [serviceArea, setServiceArea] = useState('');
  const [areas, setAreas] = useState('');
  const [phone, setPhone] = useState('');
  const [primaryColor, setPrimary] = useState('#1f3d2b');
  const [accentColor, setAccent] = useState('#c8952b');
  const [fontPairing, setFont] = useState('system');
  const [excluded, setExcluded] = useState<string[]>([]);
  const [isDemo, setIsDemo] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  // The slug follows the name until someone edits it by hand, then it stays put —
  // the slug is the filename, the URL and the token env-var name, so a surprise
  // change to it is a surprise change to all three.
  const slugify = (v: string) => v.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40);
  const effectiveSlug = slugTouched ? slug : slugify(name);
  const phoneOk = !phone.trim() || /^\+\d{10,15}$/.test(phone.trim());

  return (
    <div className="dash-modal" role="dialog" aria-modal="true">
      <div className="dash-modal-card dash-modal-card--wide">
        <h3>New client</h3>
        <p className="dash-help">
          Writes <code>clients/{effectiveSlug || '<slug>'}.json</code> and an empty asset folder. CRM and tracking start
          empty — nothing is inherited from another client. Add the logo and photos next, in the editor.
        </p>

        <div className="dash-card-row">
          <label className="dash-field">
            <span className="dash-label">Company name<span className="dash-req">*</span></span>
            <input className="dash-input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Acme Tree Co" />
          </label>
          <label className="dash-field">
            <span className="dash-label">Slug<span className="dash-req">*</span></span>
            <input
              className="dash-input"
              value={effectiveSlug}
              onChange={(e) => { setSlugTouched(true); setSlug(e.target.value.toLowerCase()); }}
            />
            <span className="dash-help">The filename, the URL, and the name of this client's token secret (<code>GHL_PIT_{(effectiveSlug || 'slug').toUpperCase().replace(/[^A-Z0-9]+/g, '_')}</code>). Lowercase letters, numbers, hyphens.</span>
          </label>
        </div>

        <div className="dash-card-row">
          <label className="dash-field">
            <span className="dash-label">Phone (E.164)</span>
            <input className="dash-input" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+15551234567" />
            {!phoneOk && <span className="dash-v-err">Not E.164 — expected +1XXXXXXXXXX.</span>}
          </label>
          <label className="dash-field">
            <span className="dash-label">Primary service area</span>
            <input className="dash-input" value={serviceArea} onChange={(e) => setServiceArea(e.target.value)} placeholder="West Dallas, TX" />
          </label>
        </div>

        <label className="dash-field">
          <span className="dash-label">Suburbs served</span>
          <textarea className="dash-input dash-textarea" rows={3} value={areas} onChange={(e) => setAreas(e.target.value)} placeholder={'One per line'} />
        </label>

        <div className="dash-card-row">
          <label className="dash-field">
            <span className="dash-label">Primary colour</span>
            <span className="dash-color-row">
              <input type="color" value={primaryColor} onChange={(e) => setPrimary(e.target.value)} />
              <input className="dash-input" value={primaryColor} onChange={(e) => setPrimary(e.target.value)} />
            </span>
          </label>
          <label className="dash-field">
            <span className="dash-label">Accent colour</span>
            <span className="dash-color-row">
              <input type="color" value={accentColor} onChange={(e) => setAccent(e.target.value)} />
              <input className="dash-input" value={accentColor} onChange={(e) => setAccent(e.target.value)} />
            </span>
          </label>
          <label className="dash-field">
            <span className="dash-label">Typography</span>
            <select className="dash-input" value={fontPairing} onChange={(e) => setFont(e.target.value)}>
              <option value="system">System (no font download)</option>
              <option value="editorial">Editorial — Fraunces + Inter</option>
              <option value="grotesk">Grotesk — Space Grotesk + Inter</option>
            </select>
            <span className="dash-help">A pairing costs about 0.015 CLS (measured); system costs nothing.</span>
          </label>
        </div>

        <div className="dash-field">
          <span className="dash-label">Templates this client gets</span>
          <span className="dash-help">Turn one off for a service they do not sell — that page is never built.</span>
          <ul className="dash-tpl-list">
            {TEMPLATE_META.map((t) => (
              <li key={t.id} className={excluded.includes(t.id) ? 'is-off' : ''}>
                <label className="dash-check">
                  <input
                    type="checkbox"
                    checked={!excluded.includes(t.id)}
                    onChange={(e) => setExcluded((x) => (e.target.checked ? x.filter((i) => i !== t.id) : [...x, t.id]))}
                  />
                  <span className="dash-tpl-label">{t.label}</span>
                  <code>{t.id}</code>
                </label>
              </li>
            ))}
          </ul>
        </div>

        <label className="dash-field dash-field--check">
          <input type="checkbox" checked={isDemo} onChange={(e) => setIsDemo(e.target.checked)} />
          <span className="dash-label">This is a demo account</span>
          <span className="dash-help">
            Pages are built at <code>/demo/{effectiveSlug || 'slug'}/…</code> with <code>noindex, nofollow</code>, and the
            lead Function refuses their form submissions before reading any token. Use it for anything shown to a prospect.
          </span>
        </label>

        {err && <p className="dash-v-err">✗ {err}</p>}
        <div className="dash-modal-actions">
          <button className="dash-btn dash-btn--ghost" type="button" onClick={onClose}>Cancel</button>
          <button
            className="dash-btn"
            type="button"
            disabled={busy || !name.trim() || !effectiveSlug || !phoneOk}
            onClick={async () => {
              setBusy(true);
              setErr(null);
              try {
                await api.newClient({
                  slug: effectiveSlug,
                  name: name.trim(),
                  serviceArea: serviceArea.trim(),
                  serviceAreaList: areas.split('\n').map((s) => s.trim()).filter(Boolean),
                  phoneE164: phone.trim(),
                  brand: { primaryColor, accentColor, onPrimaryColor: '#ffffff', ...(fontPairing !== 'system' ? { fontPairing } : {}) },
                  excludedTemplates: excluded,
                  isDemo,
                });
                onCreated(effectiveSlug);
              } catch (e: any) {
                setErr(e.message);
              } finally {
                setBusy(false);
              }
            }}
          >
            Create client
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
