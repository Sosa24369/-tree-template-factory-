/**
 * Preloads the hero image as early as the SPA can manage.
 *
 * Which image is the LCP element depends on the client record, so it cannot be a
 * static <link> in index.html. Injecting it during render — before the component
 * tree paints — still beats waiting for the <img> to be discovered after React
 * mounts, which Lighthouse measured at ~2.4s of avoidable LCP delay.
 *
 * Idempotent: safe under StrictMode's double-render and across route changes.
 */

const injected = new Set<string>();

export function preloadLcpImage(src: string | null | undefined): void {
  if (!src || typeof document === 'undefined' || injected.has(src)) return;
  injected.add(src);

  const link = document.createElement('link');
  link.rel = 'preload';
  link.as = 'image';
  link.href = src;
  link.setAttribute('fetchpriority', 'high');
  document.head.appendChild(link);
}
