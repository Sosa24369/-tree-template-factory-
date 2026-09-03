/**
 * dashboardApi() — the Vite DEV-SERVER adapter for the content dashboard.
 *
 * All logic lives in dashboard-core.mjs, shared with server/index.mjs (the Railway
 * deployment). This file only wires the core into Vite's middleware chain, and ONLY
 * during `vite dev` (apply: 'serve'): it cannot be present in a built bundle, so the
 * unauthenticated local dashboard is local by construction.
 */

import { join } from 'node:path';
import { dashboardCore } from './dashboard-core.mjs';

export function dashboardApi() {
  return {
    name: 'dashboard-api',
    apply: 'serve', // dev only — never in a build
    configureServer(server) {
      const handle = dashboardCore({ repoRoot: join(server.config.root, '..') });
      server.middlewares.use(async (req, res, next) => {
        const handled = await handle(req, res);
        if (!handled) next();
      });
    },
  };
}
