import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    // /clients lives at the repo root, outside the Vite root, so records are
    // committed alongside the source of truth rather than buried in the app.
    fs: { allow: ['..'] },
  },
});
