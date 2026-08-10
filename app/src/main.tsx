import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { captureAttribution } from './lib/attribution';

// FIX 2 — capture click ids BEFORE the first render.
// Doing this in a useEffect meant the hidden ad_click_id input rendered empty on
// first paint: effects run after children render. The submitted payload was still
// correct (it re-reads at submit) but the field a debugger inspects was stale, and
// anything that reads it during render would have seen nothing.
captureAttribution();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
