/**
 * "Deploy health" — the top card of the dashboard. Reads /api/health (booleans only)
 * and shows one row per check: green, or red with ONE plain-English sentence saying
 * what to do. Hidden entirely on the Vite dev plugin, which has no /api/health.
 */
import { useEffect, useState } from 'react';
import { api } from './lib';

type Health = {
  ok: boolean;
  checks: Record<string, boolean>;
  lastPublishAt: string | null;
  uptimeSeconds: number;
  publishState?: string;
};

/** Plain-English label and, for a red item, the one sentence that fixes it. Technical name stays in the tooltip. */
const ROWS: Record<string, { label: string; fix: string }> = {
  gitIdentity: { label: 'Saves can be signed', fix: 'The studio has no name to sign its saves with. Set STUDIO_GIT_NAME and STUDIO_GIT_EMAIL on the editor service in Railway, then redeploy.' },
  githubToken: { label: 'Saves reach GitHub', fix: 'No GitHub token: saves stay on this server and are not backed up. Mint a fine-grained token (Contents: read & write) and set GITHUB_TOKEN in Railway → editor → Variables.' },
  cloudflareToken: { label: 'Publishing can go live', fix: 'No Cloudflare token: Publish will stop at "deploying". Mint a Cloudflare Pages token with no IP filter and set CLOUDFLARE_API_TOKEN in Railway → editor → Variables.' },
  cloneClean: { label: 'Working copy is clean', fix: 'A previous save or publish left half-finished files behind, so Publish will refuse. Open each client and press Review & save; if that does not clear it, ask whoever runs the server to discard the leftover files.' },
  uiBuilt: { label: 'Studio screens are built', fix: 'The studio UI was not built on this server. Redeploy with npm run studio:deploy.' },
};

const when = (iso: string | null) => (iso ? new Date(iso).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' }) : 'never on this server');

export function DeployHealth() {
  const [h, setH] = useState<Health | null | undefined>(undefined); // undefined = loading, null = no endpoint
  const [open, setOpen] = useState(false);
  useEffect(() => {
    let stop = false;
    const tick = async () => { try { const r = await api.health(); if (!stop) setH(r); } catch { if (!stop) setH(null); } };
    tick(); const t = setInterval(tick, 30_000); return () => { stop = true; clearInterval(t); };
  }, []);
  if (h === null) return null; // dev plugin
  if (h === undefined) return <div className="dash-health dash-health--loading" aria-busy="true">Checking the server…</div>;
  const red = Object.entries(h.checks).filter(([, v]) => !v);
  return (
    <section className={`dash-health ${h.ok ? 'dash-health--ok' : 'dash-health--bad'}`} aria-live="polite">
      <button className="dash-health-head" type="button" onClick={() => setOpen((o) => !o)} aria-expanded={open || !h.ok} title="Server status: /api/health">
        <span className="dash-health-dot" aria-hidden="true" />
        <strong>{h.ok ? 'Server ready' : `${red.length} thing${red.length === 1 ? '' : 's'} to fix before publishing`}</strong>
        <span className="dash-health-meta">Last published {when(h.lastPublishAt)}</span>
        <span className="dash-health-toggle">{open || !h.ok ? 'Hide details' : 'Details'}</span>
      </button>
      {(open || !h.ok) && (
        <ul className="dash-health-list">
          {Object.entries(h.checks).map(([k, v]) => (
            <li key={k} className={v ? 'is-ok' : 'is-bad'} title={k}>
              <span className="dash-health-icon" aria-hidden="true">{v ? '✓' : '✗'}</span>
              <span>
                <span className="dash-health-label">{ROWS[k]?.label ?? k}</span>
                {!v && <span className="dash-health-fix">{ROWS[k]?.fix ?? 'Ask whoever runs the server.'}</span>}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
