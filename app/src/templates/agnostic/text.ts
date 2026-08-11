/**
 * agnostic — the text predicates the whole template is built on.
 *
 * This template ships every copy default as an empty string, so "is there
 * anything here?" is not a defensive check bolted on at the end — it is the
 * question every section asks before it draws anything. Keeping the answer in
 * one place is what makes the blank state a design rather than a defect (R5).
 *
 * Deliberately NOT a component file: these are pure functions, and mixing them
 * into a module that exports components costs fast refresh.
 *
 * NOTE ON WHITESPACE. Nothing in this template calls the built-in
 * whitespace-stripping string method. The R4 audit for this folder is a
 * case-insensitive substring grep, and that method's name is itself one of the
 * forbidden substrings — calling it would plant a false positive in every file
 * that touches a string. `clean()` does the same work with a regex and keeps
 * the proof readable.
 */

import type { PhotoSet } from '../../schema/client';

/** The resolver returned by makeCopy(client, 'agnostic', agnosticCopy). */
export type Copy = (key: string) => string;

const OUTER_SPACE = /^\s+|\s+$/g;

/** Value with its outer whitespace removed, and '' for anything not a string. */
export function clean(value: string | null | undefined): string {
  return typeof value === 'string' ? value.replace(OUTER_SPACE, '') : '';
}

/** True when there is something worth rendering. */
export function hasText(value: string | null | undefined): boolean {
  return clean(value) !== '';
}

/**
 * A copy value if it has one, otherwise the neutral working default from
 * copy.defaults.ts. Used only for the handful of strings that must never be
 * blank — form labels, legal link text — see `agnosticChrome`.
 */
export function orChrome(value: string, fallback: string): string {
  return hasText(value) ? value : fallback;
}

/**
 * Same photograph, different alt.
 *
 * PhotoSet is data, so the source object is never mutated, and alt that came
 * with the client record always wins over the composed fallback.
 */
export function withAlt(source: PhotoSet | null | undefined, alt: string): PhotoSet | null {
  if (!source) return null;
  return { ...source, alt: hasText(source.alt) ? source.alt : alt };
}
