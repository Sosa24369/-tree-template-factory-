import type { PhotoSet } from '../schema/client';
import type { ResolvedClient } from '../schema/resolve';
import type { ServiceKey } from './photos.mjs';

export type Pick =
  | { kind: 'first' }
  | { kind: 'nth'; n: number }
  | { kind: 'nthStrict'; n: number }
  | { kind: 'lastStill' }
  | { kind: 'firstNLessVideo'; n: number }
  | { kind: 'range'; from: number; to: number }
  | { kind: 'firstN'; n: number }
  | { kind: 'lastN'; n: number }
  | { kind: 'all' }
  | { kind: 'middleShare' }
  | { kind: 'theRest' };

export interface PlacementSlot {
  id: string;
  set: ServiceKey;
  pick: Pick;
  mode?: 'direct-then-cascade';
  /** A slot with its own fallback order, narrower than lib/photos' cascade (storm). */
  cascade?: ServiceKey[];
  cells: number | 'all';
  sizes: string;
  defaultPosition?: string;
}

export interface ResolvedSlot {
  id: string;
  photos: (PhotoSet | null)[];
  source: ('explicit' | 'auto')[];
}

export interface Cell {
  slotId: string;
  index: number;
  key: string | null;
  photo: PhotoSet | null;
  source: 'explicit' | 'auto';
}

/** One slot a photograph lands in, on one template. */
export interface Landing {
  templateId: string;
  slotId: string;
  index: number;
}

export const PLACEMENT: Record<string, PlacementSlot[]>;
/** Templates whose sections actually read the slot map. */
export const RESOLVES_FROM_MAP: Set<string>;

export function photoId(p: PhotoSet): string;
export function cellKey(slot: PlacementSlot, i: number): string;
export function resolvePlacement(client: ResolvedClient, templateId: string): Map<string, ResolvedSlot>;
export function templateCells(client: ResolvedClient, templateId: string): Cell[];
export function slotPhotos(client: ResolvedClient, templateId: string, slotId: string): (PhotoSet | null)[];

/** The stills a slot picks from, before the pick narrows them. */
export function slotSource(client: ResolvedClient, templateId: string, slotId: string): PhotoSet[];
export function slotSizes(templateId: string, slotId: string): string | undefined;
export function slotPosition(templateId: string, slotId: string): string | undefined;

/** Prospective: the slots a photo at `index` of `set` would feed. Upload-time query. */
export function slotsForPosition(set: ServiceKey, index: number, count: number): Landing[];

/** Retrospective: every slot this photograph actually occupies on this client. */
export function landingsFor(client: ResolvedClient, id: string, excluded?: Set<string>): Landing[];
