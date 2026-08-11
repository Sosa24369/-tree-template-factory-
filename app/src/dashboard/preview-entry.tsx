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
 * Templates are consumed here, never modified — they are frozen.
 */

import { StrictMode, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { resolveClient } from '../schema/resolve';
import { renderTemplate, isTemplateId } from '../templates/registry';
import '../styles/base.css';

interface Msg {
  record: any;
  templateId: string;
}

function Rendered({ record, templateId }: Msg) {
  if (!isTemplateId(templateId)) return <p style={{ padding: 24 }}>Unknown template “{templateId}”.</p>;
  const { client } = resolveClient({ ...record, slug: record.slug || 'preview' });
  return <>{renderTemplate(templateId, client)}</>;
}

function Preview() {
  const [msg, setMsg] = useState<Msg | null>(null);

  useEffect(() => {
    function onMessage(e: MessageEvent) {
      if (e.data && e.data.type === 'dash-preview') setMsg({ record: e.data.record, templateId: e.data.templateId });
    }
    window.addEventListener('message', onMessage);
    // Announce readiness so the parent posts the current state immediately.
    window.parent?.postMessage({ type: 'dash-preview-ready' }, '*');
    return () => window.removeEventListener('message', onMessage);
  }, []);

  if (!msg) return <p style={{ padding: 24, fontFamily: 'system-ui', color: '#667' }}>Waiting for the dashboard…</p>;

  // MemoryRouter at the template's own route so LeadForm's useParams/useNavigate
  // resolve exactly as they do on the live site.
  const slug = msg.record.slug || 'preview';
  return (
    <MemoryRouter initialEntries={[`/p/${slug}/${msg.templateId}`]}>
      <Routes>
        <Route path="/p/:clientSlug/:templateId" element={<Rendered record={msg.record} templateId={msg.templateId} />} />
      </Routes>
    </MemoryRouter>
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Preview />
  </StrictMode>,
);
