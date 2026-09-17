import { StrictMode } from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import App from './App';
import { captureAttribution } from './lib/attribution';
import { watchCallBar } from './lib/callbar';

// FIX 2 — capture click ids BEFORE the first render, so the hidden ad_click_id
// input is populated on first paint rather than one effect-tick later.
captureAttribution();

const container = document.getElementById('root')!;
const tree = (
  <StrictMode>
    <App />
  </StrictMode>
);

// Pages are prerendered at build time; hydrate them instead of throwing the
// server-rendered markup away and re-rendering from scratch.
if (container.hasChildNodes()) hydrateRoot(container, tree);
else createRoot(container).render(tree);

// The prerendered markup is already in the DOM, so the call bar and the section call
// buttons exist before hydration finishes; the observer needs neither React nor a wait.
watchCallBar();
