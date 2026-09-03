/**
 * Builds the content-dashboard UI as static files for the Railway editor service.
 *
 * Separate from vite.config.ts on purpose: the public landing-page build must never
 * contain the dashboard, and this build must never contain the dev-only API plugin.
 * Output goes to dist-dashboard/, which server/index.mjs serves behind the login.
 */
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'node:path';

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist-dashboard',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        dashboard: resolve(__dirname, 'dashboard.html'),
        preview: resolve(__dirname, 'dashboard-preview.html'),
      },
    },
  },
});
