/**
 * dashboardApi() — the Vite DEV-SERVER adapter for the content dashboard.
 *
 * All logic lives in dashboard-core.mjs, shared with server/index.mjs (the Railway
 * deployment). This file only wires the core into Vite's middleware chain, and ONLY
 * during `vite dev` (apply: 'serve'): it cannot be present in a built bundle, so the
 * unauthenticated local dashboard is local by construction.
 */

import { join } from 'node:path';
import { existsSync, readFileSync } from 'node:fs';
import { dashboardCore } from './dashboard-core.mjs';

export function dashboardApi() {
  return {
    name: 'dashboard-api',
    apply: 'serve', // dev only — never in a build
    configureServer(server) {
      const repoRoot = join(server.config.root, '..');
      const handle = dashboardCore({ repoRoot });
      // Match production: a photo uploaded but not yet saved is served out of staging,
      // so the preview is not broken between upload and save. See server/index.mjs.
      server.middlewares.use((req, res, next) => {
        const m = /^\/assets\/([a-zA-Z0-9._-]+)\/([a-zA-Z0-9._-]+)$/.exec((req.url || '').split('?')[0]);
        if (!m || m[2].startsWith('.')) return next();
        if (existsSync(join(repoRoot, 'app', 'public', 'assets', m[1], m[2]))) return next();
        const staged = join(repoRoot, '.studio-staging', m[1], m[2]);
        if (!existsSync(staged)) return next();
        res.setHeader('content-type', m[2].endsWith('.webp') ? 'image/webp' : 'application/octet-stream');
        res.setHeader('cache-control', 'no-store');
        res.end(readFileSync(staged));
      });
      server.middlewares.use(async (req, res, next) => {
        const handled = await handle(req, res);
        if (!handled) next();
      });
    },
  };
}
