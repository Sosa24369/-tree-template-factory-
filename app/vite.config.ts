import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
// @ts-expect-error — plain .mjs dev-only plugin, no types needed
import { dashboardApi } from './dashboard-server.mjs';

export default defineConfig({
  // dashboardApi is a DEV-ONLY plugin (apply: 'serve'); it is never part of a build,
  // so the content dashboard cannot be deployed. The public site build is untouched.
  plugins: [react(), dashboardApi()],
  server: {
    // /clients lives at the repo root, outside the Vite root, so records are
    // committed alongside the source of truth rather than buried in the app.
    fs: { allow: ['..'] },
  },
});
