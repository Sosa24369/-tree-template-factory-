import type { PhotoSet } from '../schema/client';
import type { ResolvedClient } from '../schema/resolve';

export type ServiceKey = 'removal' | 'trimming' | 'storm' | 'generic';

/** Order to try when the requested service has no photos for this client. */
export const CASCADE: Record<ServiceKey, ServiceKey[]>;

/** Photographs for this client and service, in preference order. [] when there are none. */
export function photosFor(client: ResolvedClient, service: ServiceKey, limit?: number): PhotoSet[];

/** True when this client has any photography at all. */
export function hasPhotos(client: ResolvedClient): boolean;

/** Split out the video entries (the source "gallery" includes MP4s). */
export function partitionMedia(photos: PhotoSet[]): { videos: PhotoSet[]; stills: PhotoSet[] };
