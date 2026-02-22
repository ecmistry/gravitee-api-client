import { describe, it, expect, beforeEach } from 'vitest';
import {
  getCollections,
  setCollections,
  logCollectionActivity,
} from './workspaceStorage';
import { getActivity } from './workspaces';
import type { Collection } from '@/types/api';

describe('workspaceStorage', () => {
  beforeEach(() => {
    localStorage.removeItem('gravitee-collections-personal');
    localStorage.removeItem('gravitee-collections-ws-test');
    localStorage.removeItem('api-client-collections');
    localStorage.removeItem('gravitee-activity');
  });

  describe('getCollections / setCollections', () => {
    it('returns default collection for new workspace', () => {
      const cols = getCollections('personal');
      expect(cols).toHaveLength(1);
      expect(cols[0]).toMatchObject({ id: 'default', name: 'My Workspace' });
    });

    it('persists and retrieves collections per workspace', () => {
      const cols: Collection[] = [
        { id: 'c1', name: 'Collection 1', folders: [], requests: [] },
      ];
      setCollections('personal', cols);
      expect(getCollections('personal')).toEqual(cols);

      setCollections('ws-test', [{ id: 'c2', name: 'Collection 2', folders: [], requests: [] }]);
      expect(getCollections('ws-test')).toHaveLength(1);
      expect(getCollections('ws-test')[0].name).toBe('Collection 2');
      expect(getCollections('personal')).toEqual(cols);
    });
  });

  describe('migration from legacy', () => {
    it('migrates api-client-collections to personal workspace', () => {
      const legacy = [
        { id: 'leg', name: 'Legacy', folders: [], requests: [] },
      ];
      localStorage.setItem('api-client-collections', JSON.stringify(legacy));
      const cols = getCollections('personal');
      expect(cols).toEqual(legacy);
      expect(localStorage.getItem('gravitee-collections-personal')).toBeTruthy();
    });
  });

  describe('logCollectionActivity', () => {
    it('logs activity that appears in getActivity', () => {
      logCollectionActivity('personal', 'create', 'collection', 'c1', 'My Collection');
      logCollectionActivity('personal', 'update', 'request', 'r1', 'Get Users');

      const acts = getActivity('personal');
      expect(acts).toHaveLength(2);
      expect(acts[0]).toMatchObject({
        action: 'update',
        entityType: 'request',
        entityName: 'Get Users',
      });
      expect(acts[1]).toMatchObject({
        action: 'create',
        entityType: 'collection',
        entityName: 'My Collection',
      });
    });
  });
});
