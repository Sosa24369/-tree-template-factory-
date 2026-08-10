import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useParams, Link } from 'react-router-dom';
import { captureAttribution } from './lib/attribution';
import { getClient, listClients } from './lib/clientRegistry';
import { TEMPLATE_META, isTemplateId, renderTemplate } from './templates/registry';
import { ThankYou } from './routes/ThankYou';
import './styles/base.css';

/**
 * Renders one client's page for one template. This route IS the proof of the
 * factory property: the same template component, a different :clientSlug, a
 * different-looking page, with no code change.
 */
function TemplateRoute() {
  const { clientSlug, templateId } = useParams();
  const entry = getClient(clientSlug);

  if (!entry) return <Missing what={`client "${clientSlug}"`} />;
  if (!isTemplateId(templateId)) return <Missing what={`template "${templateId}"`} />;

  const { client, issues } = entry;
  const errors = issues.filter((i) => i.level === 'error');

  return (
    <>
      {/* Config problems surface loudly in dev and never reach a visitor in prod. */}
      {import.meta.env.DEV && issues.length > 0 && (
        <details className="config-issues" open={errors.length > 0}>
          <summary>
            {errors.length} error{errors.length === 1 ? '' : 's'}, {issues.length - errors.length} warning
            {issues.length - errors.length === 1 ? '' : 's'} in <code>{client.slug}.json</code>
          </summary>
          <ul>
            {issues.map((i, n) => (
              <li key={n} className={`issue issue-${i.level}`}>
                <code>{i.field}</code> — {i.message}
              </li>
            ))}
          </ul>
        </details>
      )}
      {renderTemplate(templateId, client)}
    </>
  );
}

function Missing({ what }: { what: string }) {
  return (
    <main className="index">
      <h1>Not found</h1>
      <p>No such {what}.</p>
      <p><Link to="/">Back to the index</Link></p>
    </main>
  );
}

/** Dev index — every client × every template. P3 replaces this with the real dashboard. */
function Index() {
  const clients = listClients();
  return (
    <main className="index">
      <h1>Template factory</h1>
      <p className="index-lede">
        {clients.length} client{clients.length === 1 ? '' : 's'} × {TEMPLATE_META.length} templates.
        Adding a client is a JSON file in <code>/clients</code> — never a code change.
      </p>

      {clients.map(({ client, issues }) => (
        <section key={client.slug} className="index-client">
          <h2>
            {client.name} <code>{client.slug}</code>
          </h2>
          <p className="index-meta">
            {client.phoneDisplay || 'no phone'} · {client.serviceArea || 'no service area'} ·{' '}
            {client.tracking.gtmContainerId ?? 'no GTM'}
            {issues.length > 0 && <> · <strong>{issues.length} config issue{issues.length === 1 ? '' : 's'}</strong></>}
          </p>
          <ul className="index-templates">
            {TEMPLATE_META.map((t) => (
              <li key={t.id}>
                <Link to={`/p/${client.slug}/${t.id}`} className={t.built ? 'built' : 'unbuilt'}>
                  {t.label}
                </Link>
                {!t.built && <span className="badge">P2</span>}
              </li>
            ))}
          </ul>
        </section>
      ))}
    </main>
  );
}

export default function App() {
  // FIX 2 — capture click ids on first paint, before any navigation can drop them.
  useEffect(() => {
    captureAttribution();
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/p/:clientSlug/:templateId" element={<TemplateRoute />} />
        <Route path="/p/:clientSlug/:templateId/thank-you" element={<ThankYou />} />
        <Route path="/thank-you" element={<ThankYou />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
