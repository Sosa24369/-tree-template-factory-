import type { TemplateId } from '../schema/client';

export type SlotPolicy = 'cover' | 'frame' | 'contain' | 'plate';
export type SlotSet = 'removal' | 'trimming' | 'storm' | 'generic' | 'logo' | 'art';
export type MasterKey = 'photo' | 'heroPlate' | 'logo' | 'art';

export interface Breakpoint { id: 'mobile' | 'tablet' | 'desktop'; label: string; viewport: number }
export interface PhotoMaster { aspect: [number, number]; recommended: [number, number]; min: [number, number]; why: string }
export interface LogoMaster { recommended: string; min: number; why: string }

export interface ImageSlot {
  template: TemplateId | '*';
  id: string;
  label: string;
  section: string;
  element: string;
  source: { set: SlotSet; pick: string };
  policy: SlotPolicy;
  focal: 'required' | 'optional' | 'none';
  master: MasterKey;
  renders: { mobile: [number, number][] | null; tablet: [number, number][] | null; desktop: [number, number][] | null };
  legibility?: boolean;
  notes?: string;
}

export const BREAKPOINTS: readonly Breakpoint[];
export const MASTERS: { photo: PhotoMaster; heroPlate: PhotoMaster; logo: LogoMaster; art: PhotoMaster };
export const SHARED_SLOTS: readonly ImageSlot[];
export const IMAGE_SLOTS: readonly ImageSlot[];
export function minWidth(master: MasterKey): number;
export function stillIndex(list: readonly any[], i: number): number;
export function stillCount(list: readonly any[]): number;
export function slotsForPhoto(set: SlotSet, index: number, count: number): ImageSlot[];
export function slotById(template: string, id: string): ImageSlot | null;
