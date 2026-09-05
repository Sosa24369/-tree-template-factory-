/**
 * The live-preview iframe.
 *
 * It renders the REAL template component (renderTemplate) with the REAL resolver
 * (resolveClient) against whatever edited record the dashboard posts in — so the
 * preview is the actual page, not an approximation, and it reflects unsaved edits
 * without touching disk. Isolated in an iframe so the template's sticky header, fixed
 * mobile bar and scoped CSS behave exactly as they do in production and cannot leak
 * into the dashboard chrome.
 *
 * INLINE COPY EDITING. After each render, rendered text is matched back to the
 * template's copy keys (COPY_DEFAULTS merged with the client's overrides) and tagged
 * with data-copy-key. Clicking a tagged element makes it editable in place; leaving
 * it posts { type: 'dash-copy-edit', templateId, key, value } to the dashboard, which
 * writes copyOverrides[templateId][key]. This is preview-side instrumentation only —
 * the templates are untouched and a deployed page carries none of it.
 *
 * Templates are consumed here, never modified — they are frozen.
 */

import { StrictMode, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { resolveClient } from '../schema/resolve';
import { renderTemplate, isTemplateId, COPY_DEFAULTS } from '../templates/registry';
import type { TemplateId } from '../schema/client';
import '../styles/base.css';

document.documentElement.setAttribute('data-dash-preview', '');

interface Msg {
  record: any;
  templateId: string;
}

function Rendered({ record, templateId }: Msg) {
  if (!isTemplateId(templateId)) return <p style={{ padding: 24 }}>Unknown template “{templateId}”.</p>;
  const { client } = resolveClient({ ...record, slug: record.slug || 'preview' });
  return <>{renderTemplate(templateId, client)}</>;
}

/** Tag rendered text nodes with the copy key whose value they display. */
function tagCopy(record: any, templateId: TemplateId) {
  const map = new Map<string, string[]>();
  const merged = { ...(COPY_DEFAULTS[templateId] ?? {}), ...(record.copyOverrides?.[templateId] ?? {}) };
  for (const [key, value] of Object.entries(merged)) {
    const v = String(value ?? '').replace(/\s+/g, ' ').trim();
    if (v.length < 2) continue;
    map.set(v, [...(map.get(v) ?? []), key]);
  }
  document.querySelectorAll('[data-copy-key]').forEach((el) => { el.removeAttribute('data-copy-key'); el.removeAttribute('data-copy-keys'); });
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_ELEMENT);
  let n: Node | null = walker.nextNode();
  let tagged = 0;
  while (n) {
    const el = n as HTMLElement;
    // Leaf-ish elements only: text content that is exactly one copy value.
    if (el.children.length === 0 || [...el.childNodes].every((c) => c.nodeType === Node.TEXT_NODE || (c as HTMLElement).tagName === 'BR')) {
      const text = (el.textContent ?? '').replace(/\s+/g, ' ').trim();
      const keys = text ? map.get(text) : undefined;
      if (keys && !el.closest('form') && !['SCRIPT', 'STYLE', 'OPTION'].includes(el.tagName)) {
        el.setAttribute('data-copy-key', keys[0]);
        if (keys.length > 1) el.setAttribute('data-copy-keys', keys.join(','));
        tagged++;
      }
    }
    n = walker.nextNode();
  }
  window.parent?.postMessage({ type: 'dash-preview-tagged', templateId, tagged }, '*');
}

function installEditing(getMsg: () => Msg | null) {
  document.addEventListener('click', (e) => {
    const el = (e.target as HTMLElement).closest<HTMLElement>('[data-copy-key]');
    if (!el) return;
    e.preventDefault();
    e.stopPropagation();
    if (el.isContentEditable) return;
    const key = el.getAttribute('data-copy-key')!;
    const original = el.textContent ?? '';
    el.setAttribute('contenteditable', 'true');
    el.focus();
    const range = document.createRange(); range.selectNodeContents(el);
    const sel = window.getSelection(); sel?.removeAllRanges(); sel?.addRange(range);

    const finish = (commit: boolean) => {
      el.removeAttribute('contenteditable');
      el.removeEventListener('blur', onBlur); el.removeEventListener('keydown', onKey);
      const value = el.textContent ?? '';
      if (!commit) { el.textContent = original; return; }
      if (value === original) return;
      const msg = getMsg();
      if (msg) window.parent?.postMessage({ type: 'dash-copy-edit', templateId: msg.templateId, key, value }, '*');
    };
    const onBlur = () => finish(true);
    const onKey = (ev: KeyboardEvent) => {
      if (ev.key === 'Escape') { ev.preventDefault(); finish(false); el.blur(); }
      if (ev.key === 'Enter' && !ev.shiftKey) { ev.preventDefault(); el.blur(); }
    };
    el.addEventListener('blur', onBlur); el.addEventListener('keydown', onKey);
  }, true);
}

function Preview() {
  const [msg, setMsg] = useState<Msg | null>(null);

  useEffect(() => {
    let current: Msg | null = null;
    function onMessage(e: MessageEvent) {
      if (e.data && e.data.type === 'dash-preview') { current = { record: e.data.record, templateId: e.data.templateId }; setMsg(current); }
    }
    window.addEventListener('message', onMessage);
    installEditing(() => current);
    // Announce readiness so the parent posts the current state immediately.
    window.parent?.postMessage({ type: 'dash-preview-ready' }, '*');
    return () => window.removeEventListener('message', onMessage);
  }, []);

  // Re-tag after every render of a new record/template.
  useEffect(() => {
    if (!msg || !isTemplateId(msg.templateId)) return;
    const t = setTimeout(() => tagCopy(msg.record, msg.templateId as TemplateId), 30);
    return () => clearTimeout(t);
  }, [msg]);

  if (!msg) return <p style={{ padding: 24, fontFamily: 'system-ui', color: '#667' }}>Waiting for the dashboard…</p>;

  // MemoryRouter at the template's own route so LeadForm's useParams/useNavigate
  // resolve exactly as they do on the live site — including the PREFIX, because a
  // demo client's pages live under /demo/ and its thank-you link has to follow.
  const slug = msg.record.slug || 'preview';
  const base = msg.record.isDemo ? 'demo' : 'p';
  return (
    <MemoryRouter initialEntries={[`/${base}/${slug}/${msg.templateId}`]} key={`${base}/${slug}/${msg.templateId}`}>
      <Routes>
        <Route path={`/${base}/:clientSlug/:templateId`} element={<Rendered record={msg.record} templateId={msg.templateId} />} />
      </Routes>
    </MemoryRouter>
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Preview />
  </StrictMode>,
);
