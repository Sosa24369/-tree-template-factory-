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
import { Slots } from './Slots';
import { Copy } from './Copy';
import { SectionArt } from './SectionArt';
import { Readiness } from './Readiness';
import { TEMPLATE_META } from '../templates/meta';
import type { TemplateId } from '../schema/client';

// The preview picker walks TEMPLATE_META directly, so all ten are reachable. The old
// hardcoded list was seven: the three -c hybrids could not be previewed at all, which
// is exactly where a layout or copy mistake hides.

/** The publish states during which the button is disabled and the panel is "running". */
const PUBLISH_RUNNING = ['pulling', 'checking', 'building', 'protected', 'deploying'];

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
  // Session expiry. lib.ts announces a 401 on any request; the banner says what to do
  // and the edits stay on screen. It clears itself the moment a request succeeds again
  // (the publish poller ticks every 2.5 s), so signing in from another tab is enough.
  const [signedOut, setSignedOut] = useState(false);
  useEffect(() => {
    const onSession = (e: Event) => setSignedOut((e as CustomEvent).detail === 'signed-out');
    window.addEventListener('dash-session', onSession);
    return () => window.removeEventListener('dash-session', onSession);
  }, []);
  // A toast is a status line: it dismisses itself, and has a real close control.
  useEffect(() => { if (!toast) return; const t = setTimeout(() => setToast(null), 8000); return () => clearTimeout(t); }, [toast]);
  /**
   * `confirmProtected` is only ever passed after the server has BLOCKED a publish and
   * told us which live campaign pages would change. The token names that exact set,
   * so it cannot be reused for a later publish that touches different pages.
   */
  async function startPublish(confirmProtected?: string) {
    if (dirty) { setToast('Save first — publish deploys what is committed, not what is on screen.'); return; }
    setPubOpen(true);
    try { setPub(await api.publish(confirmProtected)); } catch (e: any) { if (!e.signedOut) setToast('Publish request failed: ' + e.message); }
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

  // Rendered in the editor column (full width, under the header), whether or not a
  // client is open: a failed or blocked publish must stay visible until it is dealt with.
  // The page currently on screen, as a route: the deployment pill and the "View live
  // page" link both land there, because the deployment ROOT is the neutral gate page
  // and always reads as "nothing to see here".
  const selected = record && slug
    ? { route: `/${record.isDemo ? 'demo' : 'p'}/${slug}/${previewTpl}`, templateId: previewTpl, built: !(record.excludedTemplates ?? []).includes(previewTpl) }
    : null;
  const publishPanel = (pubOpen || pub.state === 'failed' || pub.state === 'blocked') && pub.state !== 'idle'
    ? <PublishPanel pub={pub} selected={selected} onHide={() => setPubOpen(false)} onConfirm={(token) => startPublish(token)} />
    : null;

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

  // A failed save is a persistent error INSIDE the dialog, not a toast that fades
  // while the dialog sits there looking like it is still waiting for a click.
  const [saveError, setSaveError] = useState<{ title: string; detail: string; rolledBack: boolean } | null>(null);

  async function confirmSave() {
    if (!slug || !record) return;
    setBusy(true);
    setSaveError(null);
    try {
      const res = await api.save(slug, record, commitMsg);
      setDiff(null);
      setDirty(false);
      setToast(res.commit ? `Saved & committed ${res.commit}` : 'Saved (no net change to commit)');
      await loadClients();
    } catch (e: any) {
      const b = e.body ?? {};
      if (e.signedOut) {
        setSaveError({ title: 'Signed out — sign in again', detail: 'Your session expired before the save reached the server. Nothing was written. Sign in from another tab, then click Try again.', rolledBack: false });
      } else if (b.errors) {
        setSaveError({ title: 'The record failed validation', detail: b.errors.join('\n'), rolledBack: true });
      } else if (b.error === 'commit_failed') {
        setSaveError({ title: 'git commit failed — nothing was saved', detail: b.detail || e.message, rolledBack: b.rolledBack === true });
      } else if (b.error === 'push_failed') {
        setSaveError({ title: 'Committed locally, but the push to GitHub failed', detail: (b.detail || e.message) + '\n\nThe commit exists in the studio\'s clone and will be pushed with the next successful save. Nothing is lost.', rolledBack: false });
      } else if (b.error === 'layout_locked') {
        setSaveError({ title: `Layout on ${b.templateId} is locked`, detail: 'Controls (-a) never accept a layout — the A/B test depends on it.', rolledBack: true });
      } else {
        setSaveError({ title: 'Save failed', detail: b.detail || b.error || e.message, rolledBack: false });
      }
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
              <button
                className={`dash-client ${slug === c.slug ? 'is-active' : ''}`}
                type="button"
                onClick={() => {
                  // The record is one file; switching client replaces it wholesale.
                  if (dirty && c.slug !== slug && !window.confirm(`Unsaved edits on ${record?.name || slug} will be lost. Switch anyway?`)) return;
                  selectClient(c.slug);
                }}
              >
                <span className="dash-client-name">{c.name}</span>
                <code>{c.slug}</code>
              </button>
            </li>
          ))}
        </ul>
      </aside>

      <main className="dash-main">
        {signedOut && (
          <div className="dash-session" role="alert">
            <strong>Signed out — sign in again.</strong> The session expired.{' '}
            <a href="/login" target="_blank" rel="noreferrer">Sign in</a> in a new tab, then carry on here — unsaved edits are still on screen.
          </div>
        )}
        {!record && publishPanel}
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
                <button className="dash-btn dash-btn--ghost" type="button" disabled={busy || PUBLISH_RUNNING.includes(pub.state)} onClick={() => startPublish()} title="Build and deploy every committed record to Cloudflare, behind the guard suite">{PUBLISH_RUNNING.includes(pub.state) ? `Publishing… (${pub.stage || pub.state})` : pub.state === 'live' ? 'Publish again' : pub.state === 'failed' ? 'Publish (last failed)' : 'Publish'}</button>
              </div>
            </header>

            {publishPanel}

            {(validation.errors.length > 0 || validation.warnings.length > 0) && (
              <div className="dash-validation">
                {validation.errors.map((e, i) => <p key={i} className="dash-v-err">✗ {e}</p>)}
                {validation.warnings.map((w, i) => <p key={i} className="dash-v-warn">⚠ {w}</p>)}
              </div>
            )}

            <nav className="dash-sections" aria-label="Panels">
              <a href="#readiness">Readiness</a>
              <a href="#layout">Layout</a>
              <a href="#photoslots">Photos on this page</a>
              <a href="#business">Business &amp; contact</a>
              <a href="#backgrounds">Backgrounds</a>
              <a href="#copy">Copy — every text field</a>
            </nav>
            <div id="readiness"><Readiness record={record} /></div>
            <div id="layout"><Layout record={record} templateId={previewTpl} onChange={onChange} /></div>
            <div id="photoslots">
              <section className="dash-group">
                <h2 className="dash-group-head">Photos on this page</h2>
                <Slots record={record} templateId={previewTpl} onChange={onChange} />
              </section>
            </div>
            <div id="business"><Form record={record} onChange={onChange} slug={slug!} /></div>
            <div id="backgrounds"><SectionArt record={record} templateId={previewTpl} slug={slug!} onChange={onChange} /></div>
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

      {toast && (
        <div className="dash-toast" role="status">
          <span>{toast}</span>
          <button type="button" className="dash-toast-x" aria-label="Dismiss" onClick={() => setToast(null)}>×</button>
        </div>
      )}

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
            {saveError && (
              <div className="dash-save-error" role="alert">
                <strong>✗ {saveError.title}</strong>
                <pre>{saveError.detail}</pre>
                <span className="dash-help">
                  {saveError.rolledBack
                    ? 'The record on disk is unchanged — it was rolled back to the last commit. Your edits are still here in the editor; fix the cause and try again.'
                    : 'Your edits are still here in the editor.'}
                </span>
              </div>
            )}
            <div className="dash-modal-actions">
              <button className="dash-btn dash-btn--ghost" type="button" onClick={() => { setDiff(null); setSaveError(null); }}>Cancel</button>
              <button className="dash-btn" type="button" disabled={busy} onClick={confirmSave}>{saveError ? 'Try again' : busy ? 'Saving…' : 'Write & commit'}</button>
            </div>
          </div>
        </div>
      )}

      {showNew && <NewClient onClose={() => setShowNew(false)} onCreated={async (s) => { setShowNew(false); await loadClients(); await selectClient(s); }} />}
    </div>
  );
}

/**
 * THE PUBLISH PANEL — running, failed, blocked, or live with the receipt.
 *
 * Three rules it keeps:
 *   - while running, and on failure, the guard list is fully expanded, and a failure is
 *     the FIRST thing in the panel: the verdict line sits directly under the header and
 *     the failing guards are sorted to the top of the list, so the reason can never be
 *     below the fold;
 *   - on success the guard list collapses to one summary row with the breakdown behind
 *     a disclosure, and the body is the RECEIPT: one row per page this deployment
 *     changed, each linking to its production address, and the deployment id;
 *   - the panel's height is capped and it scrolls internally, so a long tail never
 *     grows the page.
 */
type SelectedPage = { route: string; templateId: string; built: boolean } | null;

/** origin + route + the trailing slash Cloudflare serves pages at. */
const pageUrl = (origin: string | null | undefined, route: string) => (origin ? `${origin.replace(/\/$/, '')}${route}/` : null);

function PublishPanel({ pub, selected, onHide, onConfirm }: { pub: any; selected: SelectedPage; onHide: () => void; onConfirm: (token: string) => void }) {
  const suite: any[] = pub.suite ?? [];
  const results: any[] = pub.guards ?? [];
  const failed = pub.state === 'failed';
  const live = pub.state === 'live';
  const blocked = pub.state === 'blocked';
  const failedGuards: string[] = pub.failedGuards ?? [];
  const prot = pub.protectedRoutes;
  const gateOk = prot ? prot.checked - (prot.changed?.length ?? 0) - (prot.unreachable?.length ?? 0) : null;
  const okCount = results.filter((g) => g.ok).length;
  const ms = pub.startedAt && pub.finishedAt ? new Date(pub.finishedAt).getTime() - new Date(pub.startedAt).getTime() : null;
  const summary = `${okCount}/${suite.length} guards${prot ? ` · ${gateOk}/${prot.checked} gate unchanged` : ''}${ms != null ? ` · ${(ms / 1000).toFixed(1)} s` : ''}`;
  const title = live ? 'Published' : failed ? 'Publish failed' : blocked ? 'Publish stopped' : `Publishing… ${pub.stage ?? pub.state}`;
  const r = pub.receipt;
  // Where the links land: the selected page, never the deployment root.
  const deployHref = r?.deploymentUrl ? (selected?.built ? pageUrl(r.deploymentUrl, selected.route) : r.deploymentUrl) : null;
  const liveHref = selected?.built ? pageUrl(pub.baseUrl, selected.route) : null;

  return (
    <section className={`dash-publish dash-publish--${pub.state}`} aria-live="polite">
      <div className="dash-publish-head">
        <strong>{title}</strong>
        {failed && failedGuards.length > 0 && <span className="dash-publish-fail">at {pub.stage}: {failedGuards.join(', ')}</span>}
        {failed && failedGuards.length === 0 && <span className="dash-publish-fail">at {pub.stage}{pub.exitCode != null ? ` (exit ${pub.exitCode})` : ''}</span>}
        {live && r?.deploymentId && deployHref && (
          <a className="dash-deploy-id" href={deployHref} target="_blank" rel="noreferrer" title={selected?.built ? `${selected.templateId} as served by this deployment` : "this deployment's own address"}>
            deployment {r.deploymentId}{selected?.built ? ` · ${selected.templateId}` : ''}
          </a>
        )}
        {liveHref && (
          <a className="dash-live-link" href={liveHref} target="_blank" rel="noreferrer" title={liveHref}>View live page ↗</a>
        )}
        {selected && !selected.built && <span className="dash-help">{selected.templateId} is not built for this client</span>}
        <button className="dash-btn dash-btn--ghost dash-btn--sm" type="button" onClick={onHide}>Hide</button>
      </div>

      <div className="dash-publish-body">
        {/* A failure is the first thing in the panel, always. */}
        {failed && failedGuards.length > 0 && (
          <p className="dash-v-err dash-publish-verdict">
            ✗ Nothing was deployed. {failedGuards.length} guard{failedGuards.length === 1 ? '' : 's'} failed:{' '}
            <strong>{failedGuards.join(', ')}</strong>. Fix the cause and publish again — there is no override.
          </p>
        )}
        {failed && failedGuards.length === 0 && (
          <p className="dash-v-err dash-publish-verdict">
            ✗ Nothing was deployed. The <strong>{pub.stage}</strong> step failed{pub.exitCode != null ? ` (exit ${pub.exitCode})` : ''}. Its output is below.
          </p>
        )}

        {live && <Receipt r={r} liveHref={liveHref} />}

        {/* The guard suite, live. Every guard is listed before it runs, so it is
            visible that a publish is gated on all of them rather than on whichever
            happened to be checked. On success it is one row; the breakdown is a click. */}
        {live ? (
          <details className="dash-guards-summary">
            <summary>✓ {summary}</summary>
            <GuardList suite={suite} results={results} running={pub.runningGuard} />
          </details>
        ) : (
          <GuardList suite={suite} results={results} running={pub.runningGuard} failedFirst={failed} />
        )}

        {/* The live-campaign gate. This is the only confirmation in the studio that
            can put a change onto a page carrying ad spend, so it names every route
            and shows what differs before it will accept a click. */}
        {blocked && (
          <div className="dash-blocked">
            <p className="dash-v-warn">
              ⚠ Stopped before deploying. This build would change {prot?.changed?.length ?? 0} live
              campaign page{(prot?.changed?.length ?? 0) === 1 ? '' : 's'}
              {(prot?.unreachable?.length ?? 0) > 0 && `, and ${prot.unreachable.length} could not be verified`}.
              Nothing has been uploaded.
            </p>
            <ul className="dash-blocked-list">
              {(prot?.changed ?? []).map((c: any) => (
                <li key={c.route}>
                  <code>{c.route}</code> — {c.reason}
                  {c.diff?.length > 0 && <pre className="dash-publish-tail">{c.diff.join('\n')}</pre>}
                </li>
              ))}
              {(prot?.unreachable ?? []).map((u: any) => (
                <li key={u.route}>
                  <code>{u.route}</code> — {u.reason}. Treated as unsafe: an unreachable page is not a page proven unchanged.
                </li>
              ))}
            </ul>
            <div className="dash-modal-actions">
              <button className="dash-btn dash-btn--ghost" type="button" onClick={onHide}>Cancel — do not deploy</button>
              <button className="dash-btn dash-btn--danger" type="button" onClick={() => onConfirm(pub.confirmToken)}>
                I have checked these {(prot?.changed?.length ?? 0) + (prot?.unreachable?.length ?? 0)} page(s) — deploy anyway
              </button>
            </div>
          </div>
        )}

        {live ? (
          <details className="dash-publish-log">
            <summary>wrangler output</summary>
            <pre className="dash-publish-tail">{(pub.tail ?? []).join('\n') || '…'}</pre>
          </details>
        ) : (
          <pre className="dash-publish-tail">{(pub.tail ?? []).join('\n') || '…'}</pre>
        )}
      </div>
    </section>
  );
}

/**
 * THE RECEIPT. One row per page this deployment changed, at its production address;
 * removed pages (a template switched off) struck through; the counts, with wrangler's
 * own count beside them and a warning if the two disagree.
 */
function Receipt({ r, liveHref }: { r: any; liveHref: string | null }) {
  if (!r) return <p className="dash-help">Live, but no receipt was recorded for this publish.</p>;
  const extra = r.uploaded != null ? r.uploaded - r.changed.length : 0;
  return (
    <div className="dash-receipt">
      {r.nothingChanged && (
        <p className="dash-receipt-none">
          Nothing changed — the live site already matched.
          {liveHref && <> <a href={liveHref} target="_blank" rel="noreferrer">View live page ↗</a></>}
        </p>
      )}
      {(r.changed.length > 0 || r.removed.length > 0) && (
        <ul className="dash-receipt-list">
          {r.changed.map((p: any) => (
            <li key={p.route}>
              <a href={p.url} target="_blank" rel="noreferrer">{p.url}</a>
              <span className="dash-badge">{p.reason === 'new' ? 'new page' : 'changed'}</span>
            </li>
          ))}
          {r.removed.map((p: any) => (
            <li key={p.route} className="is-removed">
              <span>{p.url}</span>
              <span className="dash-badge dash-badge--warn">removed — now 404</span>
            </li>
          ))}
        </ul>
      )}
      <p className="dash-help dash-receipt-meta">
        {r.changed.length} of {r.checked} page{r.checked === 1 ? '' : 's'} changed
        {r.removed.length > 0 && `, ${r.removed.length} removed`}
        {r.unreachable.length > 0 && `, ${r.unreachable.length} could not be compared`}
        {r.uploaded != null && ` · wrangler uploaded ${r.uploaded} file${r.uploaded === 1 ? '' : 's'}${r.alreadyUploaded != null ? ` (${r.alreadyUploaded} already uploaded)` : ''}`}
        {extra > 0 && ` — ${extra} of them not pages (photo variants, shared assets, the Functions bundle)`}
        .
      </p>
      {r.countDisagrees && (
        <p className="dash-v-warn">
          ⚠ wrangler uploaded fewer files than the number of pages that differ from the live site. The list above comes
          from comparing the build against the live pages; open the deployment address before trusting either count.
        </p>
      )}
      {r.unreachable.length > 0 && (
        <details className="dash-receipt-unreachable">
          <summary>{r.unreachable.length} page{r.unreachable.length === 1 ? '' : 's'} could not be compared</summary>
          <ul>{r.unreachable.map((u: any) => <li key={u.route}><code>{u.route}</code> — {u.reason}</li>)}</ul>
        </details>
      )}
    </div>
  );
}

/**
 * The guard suite as a live list. `suite` is what WILL run (from the server, so the
 * UI cannot drift from the real gate); `results` is what has run so far. With
 * `failedFirst` the failed guards sort to the top — a failure must never be below the fold.
 */
function GuardList({ suite, results, running, failedFirst = false }: { suite: any[]; results: any[]; running: string | null; failedFirst?: boolean }) {
  if (!suite.length) return null;
  const byId = new Map(results.map((r) => [r.id, r]));
  const isFail = (g: any) => byId.get(g.id)?.ok === false;
  const ordered = failedFirst ? [...suite].sort((a, b) => Number(isFail(b)) - Number(isFail(a))) : suite;
  return (
    <ul className="dash-guards">
      {ordered.map((g) => {
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
