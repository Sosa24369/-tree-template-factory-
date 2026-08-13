/**
 * trimming-c — THE HYBRID. COPY IS trimming-a's, BYTE-IDENTICAL BY CONSTRUCTION.
 *
 * No strings live here: this re-exports the trimming CONTROL's copy object, so
 * the two cannot drift. The source client's copyOverrides['trimming-a'] (its
 * source-exact strings, e.g. "Choose J Valdez…") apply here too via makeCopy's
 * inheritOverridesFrom (see index.tsx).
 *
 * HYPOTHESIS (Design Elevation 2026-08-12): the control's proven message —
 * the 10%-off roof-and-gutter H1 and all of its copy — delivered in
 * trimming-b's design direction (quiet, typographic, hairline editorial calm)
 * executed at a premium level, converts better than either parent. The one
 * thing trimming-b tests — its rewritten restrained copy and offer placement —
 * is exactly what this hybrid does NOT take.
 */

export { trimmingACopy as trimmingCCopy } from '../trimming-a/copy.defaults';
