import type { AuthConfig } from '@/types/auth';
import type { Collection, Folder, ApiRequest } from '@/types/api';

/** Get effective auth for a request: folder auth > collection auth > request auth */
export function getEffectiveAuth(
  request: ApiRequest,
  collection: Collection | undefined,
  folder: Folder | undefined
): AuthConfig | undefined {
  if (request.authInherit === 'inherit' && (folder?.auth || collection?.auth)) {
    return folder?.auth ?? collection?.auth;
  }
  return request.auth;
}

/** Get all requests from a collection (top-level + from folders) */
export function getAllRequests(col: Collection): ApiRequest[] {
  const fromFolders = col.folders.flatMap(f => f.requests);
  return [...col.requests, ...fromFolders];
}

/** Get all requests across all collections */
export function getAllRequestsFromCollections(cols: Collection[]): ApiRequest[] {
  return cols.flatMap(getAllRequests);
}

/** Find which collection and optionally folder contains a request */
export function findRequestLocation(cols: Collection[], requestId: string): { collectionId: string; folderId?: string } | null {
  for (const col of cols) {
    if (col.requests.some(r => r.id === requestId)) return { collectionId: col.id };
    for (const folder of col.folders) {
      if (folder.requests.some(r => r.id === requestId)) return { collectionId: col.id, folderId: folder.id };
    }
  }
  return null;
}
