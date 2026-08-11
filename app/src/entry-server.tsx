/**
 * Prerender entry. Every client × template page is fully known at build time, so
 * each one is rendered to static HTML rather than being assembled in the browser.
 *
 * P1 measured the cost of not doing this: mobile LCP 5.2s, of which 1.7s was the
 * hero image not being discoverable until the JS ran and 2.9s was nothing painting
 * until React rendered the tree. Neither is fixable at the asset layer.
 */
import { StrictMode } from 'react';
import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router';
import { AppRoutes } from './App';
import './styles/base.css';

export function render(url: string): string {
  return renderToString(
    <StrictMode>
      <StaticRouter location={url}>
        <AppRoutes />
      </StaticRouter>
    </StrictMode>
  );
}

export { listClients } from './lib/clientRegistry';
export { TEMPLATE_META } from './templates/registry';
