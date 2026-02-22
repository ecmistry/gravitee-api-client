/**
 * Workspace-scoped storage for collections
 * Migrates legacy api-client-collections to gravitee-collections-personal
 */
import type { Collection } from '@/types/api';
import { logActivity } from './workspaces';

const LEGACY_COLLECTIONS_KEY = 'api-client-collections';

function collectionsKey(workspaceId: string): string {
  return `gravitee-collections-${workspaceId}`;
}

export function getCollections(workspaceId: string): Collection[] {
  const key = collectionsKey(workspaceId);
  const raw = localStorage.getItem(key);

  if (raw) {
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  // Migrate from legacy key (only for personal workspace)
  if (workspaceId === 'personal') {
    const legacy = localStorage.getItem(LEGACY_COLLECTIONS_KEY);
    if (legacy) {
      try {
        const parsed = JSON.parse(legacy);
        const cols = Array.isArray(parsed) ? parsed : [{ id: 'default', name: 'My Workspace', folders: [], requests: [] }];
        localStorage.setItem(key, JSON.stringify(cols));
        return cols;
      } catch {
        /* ignore */
      }
    }
  }

  return [{ id: 'default', name: 'My Workspace', folders: [], requests: [] }];
}

export function setCollections(workspaceId: string, collections: Collection[]): void {
  localStorage.setItem(collectionsKey(workspaceId), JSON.stringify(collections));
}

export function logCollectionActivity(
  workspaceId: string,
  action: 'create' | 'update' | 'delete',
  entityType: 'collection' | 'folder' | 'request',
  entityId: string,
  entityName: string,
  details?: string
): void {
  logActivity({
    workspaceId,
    action,
    entityType,
    entityId,
    entityName,
    actorId: 'local',
    actorName: 'You',
    details,
  });
}
