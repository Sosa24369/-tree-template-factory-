/**
 * The mobile call bar hides while a section's own call button is in view.
 *
 * Every template renders a fixed tap-to-call bar on phones (the spec: "a tap-to-call bar
 * stays visible while scrolling on mobile"). Measured on 2026-09-16 at 390 × 844, on
 * every page the bar sat directly on top of a section's own call button at one or more
 * scroll stops — two identical CTAs stacked, which the owner ruled a weaker ask than one.
 *
 * One observer, for every template: while any `main a[href^="tel:"]` (a section's call
 * button — the sticky header's number is at the top of the screen, never stacked with a
 * bottom bar) has a pixel in the viewport, <html data-cta-in-view> is set and the
 * stylesheet slides the bar off the bottom edge (styles/base.css). No layout shifts: the
 * bar is transformed, not removed, and the page keeps its reserved bottom padding.
 *
 * That padding is the bar's REAL height: `--callbar-h` is set on the bar's parent (the
 * template's root wrapper, which holds the footer too) from the measured box and kept
 * current on resize, so a sub-label that wraps on a narrow phone, or a safe-area inset,
 * never leaves the footer's last line under the bar. The stylesheet's static fallback is
 * the height measured at 390 px plus env(safe-area-inset-bottom).
 * Without IntersectionObserver the bar simply stays, as before.
 */
export function watchCallBar(): void {
  const bar = document.querySelector<HTMLElement>('.ra-sticky, .ta-sticky, .st-sticky, .ag-sticky, .rb-sticky, .rc-sticky, .tb-sticky, .tc-sticky');
  if (!bar) return;
  const host = bar.parentElement ?? document.body;
  const reserve = () => {
    const h = bar.getBoundingClientRect().height;
    if (h > 0) host.style.setProperty('--callbar-h', `${Math.ceil(h)}px`);
    else host.style.removeProperty('--callbar-h'); // display:none from 768px up — the stylesheet's 0 applies
  };
  reserve();
  if (typeof ResizeObserver !== 'undefined') new ResizeObserver(reserve).observe(bar);
  window.addEventListener('resize', reserve);
  if (typeof IntersectionObserver === 'undefined') return;
  const buttons = Array.from(document.querySelectorAll('main a[href^="tel:"]'));
  if (buttons.length === 0) return;
  const inView = new Set<Element>();
  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (e.isIntersecting) inView.add(e.target);
        else inView.delete(e.target);
      }
      document.documentElement.toggleAttribute('data-cta-in-view', inView.size > 0);
    },
    { threshold: 0 },
  );
  for (const b of buttons) io.observe(b);
}
