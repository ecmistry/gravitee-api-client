import { describe, it, expect, beforeEach } from 'vitest';
import {
  getWorkspaces,
  setWorkspaces,
  getActiveWorkspaceId,
  setActiveWorkspaceId,
  addWorkspace,
  renameWorkspace,
  removeWorkspace,
  getActivity,
  logActivity,
} from './workspaces';

const WORKSPACES_KEY = 'gravitee-workspaces';
const ACTIVE_WORKSPACE_KEY = 'gravitee-active-workspace';
const ACTIVITY_KEY = 'gravitee-activity';

describe('workspaces', () => {
  beforeEach(() => {
    localStorage.removeItem(WORKSPACES_KEY);
    localStorage.removeItem(ACTIVE_WORKSPACE_KEY);
    localStorage.removeItem(ACTIVITY_KEY);
  });

  describe('getWorkspaces / setWorkspaces', () => {
    it('returns default Personal workspace when empty', () => {
      localStorage.removeItem(WORKSPACES_KEY);
      const ws = getWorkspaces();
      expect(ws).toHaveLength(1);
      expect(ws[0]).toMatchObject({ id: 'personal', name: 'Personal', type: 'personal' });
    });

    it('persists and returns custom workspaces', () => {
      const custom = [
        { id: 'a', name: 'A', type: 'personal' as const, createdAt: 1 },
        { id: 'b', name: 'B', type: 'team' as const, createdAt: 2 },
      ];
      setWorkspaces(custom);
      expect(getWorkspaces()).toEqual(custom);
    });
  });

  describe('getActiveWorkspaceId / setActiveWorkspaceId', () => {
    it('defaults to personal when no active set', () => {
      expect(getActiveWorkspaceId()).toBe('personal');
    });

    it('returns and persists active workspace id', () => {
      setWorkspaces([{ id: 'a', name: 'A', type: 'personal', createdAt: 1 }]);
      setActiveWorkspaceId('a');
      expect(getActiveWorkspaceId()).toBe('a');
    });

    it('falls back to first workspace if active id is invalid', () => {
      setWorkspaces([{ id: 'a', name: 'A', type: 'personal', createdAt: 1 }]);
      setActiveWorkspaceId('nonexistent');
      expect(getActiveWorkspaceId()).toBe('a');
    });
  });

  describe('addWorkspace', () => {
    it('adds a new workspace and returns it', () => {
      const ws = addWorkspace('My Workspace', 'personal');
      expect(ws.name).toBe('My Workspace');
      expect(ws.type).toBe('personal');
      expect(ws.id).toMatch(/^ws-\d+-[a-z0-9]+$/);
      const all = getWorkspaces();
      expect(all.some((w) => w.id === ws.id)).toBe(true);
    });
  });

  describe('renameWorkspace', () => {
    it('renames an existing workspace', () => {
      setWorkspaces([{ id: 'a', name: 'A', type: 'personal', createdAt: 1 }]);
      renameWorkspace('a', 'Renamed');
      expect(getWorkspaces()[0].name).toBe('Renamed');
    });
  });

  describe('removeWorkspace', () => {
    it('removes workspace and switches active if needed', () => {
      setWorkspaces([
        { id: 'a', name: 'A', type: 'personal', createdAt: 1 },
        { id: 'b', name: 'B', type: 'personal', createdAt: 2 },
      ]);
      setActiveWorkspaceId('a');
      removeWorkspace('a');
      expect(getWorkspaces()).toHaveLength(1);
      expect(getActiveWorkspaceId()).toBe('b');
    });

    it('does not remove last workspace', () => {
      setWorkspaces([{ id: 'a', name: 'A', type: 'personal', createdAt: 1 }]);
      removeWorkspace('a');
      expect(getWorkspaces()).toHaveLength(1);
    });
  });

  describe('getActivity / logActivity', () => {
    it('returns empty activity when none logged', () => {
      expect(getActivity('personal')).toEqual([]);
    });

    it('logs and retrieves activity filtered by workspace', () => {
      logActivity({
        workspaceId: 'personal',
        action: 'create',
        entityType: 'collection',
        entityId: 'c1',
        entityName: 'My Collection',
        actorId: 'local',
        actorName: 'You',
      });
      const acts = getActivity('personal');
      expect(acts).toHaveLength(1);
      expect(acts[0]).toMatchObject({
        workspaceId: 'personal',
        action: 'create',
        entityType: 'collection',
        entityName: 'My Collection',
      });
      expect(acts[0].id).toBeDefined();
      expect(acts[0].timestamp).toBeDefined();
    });

    it('filters activity by workspace id', () => {
      logActivity({
        workspaceId: 'personal',
        action: 'create',
        entityType: 'collection',
        entityId: 'c1',
        entityName: 'C1',
        actorId: 'local',
        actorName: 'You',
      });
      logActivity({
        workspaceId: 'ws-other',
        action: 'create',
        entityType: 'collection',
        entityId: 'c2',
        entityName: 'C2',
        actorId: 'local',
        actorName: 'You',
      });
      expect(getActivity('personal')).toHaveLength(1);
      expect(getActivity('ws-other')).toHaveLength(1);
    });
  });
});
