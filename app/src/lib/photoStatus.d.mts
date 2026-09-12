import type { PhotoSet } from '../schema/client';

export type StatusKind = 'ok' | 'under' | 'replace';

export interface PhotoStatus {
  kind: StatusKind;
  /** Shown on the pill. */
  label: string;
  /** One line, with the number, for the tooltip and the audit docs. */
  reason: string;
}

/** OK / Under spec / Replace for one photograph against the widest slot it must fill. */
export function photoStatus(photo: PhotoSet | null | undefined, needWidth: number): PhotoStatus | null;
