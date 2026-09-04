import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation, useParams, Link } from 'react-router-dom';
import { captureAttribution } from './lib/attribution';
import { ensureCallRail, swapCallRail } from './lib/callrail';
import { getClient, listClients } from './lib/clientRegistry';
import { TEMPLATE_META, isTemplateApplicable, isTemplateId, renderTemplate } from './templates/registry';
import { modeFor, pagePath, type PageMode } from './lib/pagePath';
import { ThankYou } from './routes/ThankYou';
import './styles/base.css';

/**
 * Renders one client's page for one template. This route IS the proof of the
 * factory property: the same template component, a different :clientSlug, a
 * different-looking page, with no code change.
 */
function TemplateRoute({ mode }: { mode: PageMode }) {
  const { clientSlug, templateId } = useParams();
  const entry = getClient(clientSlug);

  // CallRail DNI: the swap script loads once per document, from per-client
  // data. Route-change re-swaps live in AppRoutes, so they also fire when the
  // visitor moves to the thank-you page.
  useEffect(() => {
    if (entry) ensureCallRail(entry.client.tracking.callRailSwapScriptUrl);
  }, [entry]);

  if (!entry) return <Missing what={`client "${clientSlug}"`} />;
  // A client lives under exactly ONE prefix: real clients under /p/, the demo
  // account under /demo/. Hitting the other prefix is not-found, so there is
  // never a second copy of a page at an address the robots rules do not cover.
  if (entry && modeFor(entry.client) !== mode) return <Missing what={`client "${clientSlug}" at this address`} />;
  if (!isTemplateId(templateId)) return <Missing what={`template "${templateId}"`} />;

  const { client, issues } = entry;
  // A template this client has opted out of (a service they do not sell) is never a
  // real page — treat a direct hit as not-found rather than render a photo-less page.
  if (!isTemplateApplicable(client, templateId)) return <Missing what={`template "${templateId}" for ${client.name}`} />;
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
      {/* The index is dev-only now; in prod this links to the neutral root. */}
      {import.meta.env.DEV ? <p><Link to="/">Back to the index</Link></p> : null}
    </main>
  );
}

/**
 * The public face of `/` and of any unmatched route. Deliberately says nothing:
 * no client names, no roster, no links into /p/ pages. The roster below is a
 * dev tool, and before ad traffic exists the public root must not enumerate
 * clients, phone numbers or GTM ids to anyone who types the bare domain.
 */
function PublicRoot() {
  return (
    <main className="index">
      <h1>Nothing to see here</h1>
      <p>This site hosts advertising landing pages. There is no page at this address.</p>
    </main>
  );
}

function NotFound() {
  return (
    <main className="index">
      <h1>Page not found</h1>
      <p>There is no page at this address.</p>
    </main>
  );
}

/** Dev index — every client × every template. Dev-only: the prod `/` is PublicRoot. */
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
            {TEMPLATE_META.map((t) => {
              const applicable = isTemplateApplicable(client, t.id);
              return (
                <li key={t.id}>
                  {applicable ? (
                    <Link to={pagePath(client, t.id)} className={t.built ? 'built' : 'unbuilt'}>
                      {t.label}
                    </Link>
                  ) : (
                    // A service this client does not sell — not generated, not linked.
                    <span className="unbuilt" title="Not applicable to this client">{t.label}</span>
                  )}
                  {!t.built && <span className="badge">P2</span>}
                  {!applicable && <span className="badge">n/a</span>}
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </main>
  );
}

/**
 * Routes without a Router around them, so the browser entry can wrap them in
 * BrowserRouter and the prerender entry in StaticRouter. Same tree both times,
 * which is what keeps hydration from mismatching.
 */
export function AppRoutes() {
  // FIX 2 — capture click ids on first paint, before any navigation can drop them.
  // main.tsx also calls this before render; this covers a client-side navigation
  // that arrives with a new click id.
  useEffect(() => {
    captureAttribution();
  }, []);

  // CallRail scans the DOM only on script load; an SPA navigation renders
  // phone numbers it has never seen. Re-swap on every route change (a no-op
  // until a template mounts and loads the per-client script).
  const location = useLocation();
  useEffect(() => {
    swapCallRail();
  }, [location.pathname]);

  return (
      <Routes>
        {/* The roster is a dev tool. In prod the bare root is a neutral
            placeholder, and unmatched routes render NotFound instead of
            redirecting — the server side pairs this with a real 404.html so
            the status code is honest too (see scripts/prerender.mjs). */}
        <Route path="/" element={import.meta.env.DEV ? <Index /> : <PublicRoot />} />
        <Route path="/p/:clientSlug/:templateId" element={<TemplateRoute mode="live" />} />
        <Route path="/p/:clientSlug/:templateId/thank-you" element={<ThankYou mode="live" />} />
        {/* The demo account. Same components, same records, different prefix —
            which is what lets one _headers rule noindex the whole showcase. */}
        <Route path="/demo/:clientSlug/:templateId" element={<TemplateRoute mode="demo" />} />
        <Route path="/demo/:clientSlug/:templateId/thank-you" element={<ThankYou mode="demo" />} />
        <Route path="/thank-you" element={<ThankYou />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}
