/**
 * Workspace management — local-first foundation for Phase 10
 * Full collaboration requires backend (auth, sync, real-time)
 */
import type { Workspace } from '@/types/workspace';
import type { ActivityEntry } from '@/types/workspace';

const WORKSPACES_KEY = 'gravitee-workspaces';
const ACTIVE_WORKSPACE_KEY = 'gravitee-active-workspace';
const ACTIVITY_KEY = 'gravitee-activity';
const MAX_ACTIVITY = 100;

const DEFAULT_WORKSPACE: Workspace = {
  id: 'personal',
  name: 'Personal',
  type: 'personal',
  createdAt: Date.now(),
};

function generateId(): string {
  return `ws-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function getWorkspaces(): Workspace[] {
  try {
    const raw = localStorage.getItem(WORKSPACES_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
    // Migrate: create Personal workspace
    const workspaces = [DEFAULT_WORKSPACE];
    localStorage.setItem(WORKSPACES_KEY, JSON.stringify(workspaces));
    return workspaces;
  } catch {
    return [DEFAULT_WORKSPACE];
  }
}

export function setWorkspaces(workspaces: Workspace[]): void {
  localStorage.setItem(WORKSPACES_KEY, JSON.stringify(workspaces));
}

export function getActiveWorkspaceId(): string {
  const id = localStorage.getItem(ACTIVE_WORKSPACE_KEY);
  const workspaces = getWorkspaces();
  if (id && workspaces.some((w) => w.id === id)) return id;
  return workspaces[0]?.id ?? DEFAULT_WORKSPACE.id;
}

export function setActiveWorkspaceId(id: string): void {
  localStorage.setItem(ACTIVE_WORKSPACE_KEY, id);
}

export function addWorkspace(name: string, type: 'personal' | 'team' = 'personal'): Workspace {
  const workspaces = getWorkspaces();
  const ws: Workspace = {
    id: generateId(),
    name,
    type,
    createdAt: Date.now(),
  };
  workspaces.push(ws);
  setWorkspaces(workspaces);
  return ws;
}

export function renameWorkspace(id: string, name: string): void {
  const workspaces = getWorkspaces().map((w) =>
    w.id === id ? { ...w, name } : w
  );
  setWorkspaces(workspaces);
}

export function removeWorkspace(id: string): void {
  const workspaces = getWorkspaces().filter((w) => w.id !== id);
  if (workspaces.length === 0) return;
  setWorkspaces(workspaces);
  if (getActiveWorkspaceId() === id) {
    setActiveWorkspaceId(workspaces[0]!.id);
  }
}

function getActivityRaw(): ActivityEntry[] {
  try {
    const raw = localStorage.getItem(ACTIVITY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function getActivity(workspaceId?: string): ActivityEntry[] {
  const entries = getActivityRaw();
  const filtered = workspaceId
    ? entries.filter((e) => e.workspaceId === workspaceId)
    : entries;
  return filtered.slice(-MAX_ACTIVITY).reverse();
}

export function logActivity(entry: Omit<ActivityEntry, 'id' | 'timestamp'>): void {
  const entries = getActivityRaw();
  const newEntry: ActivityEntry = {
    ...entry,
    id: `act-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    timestamp: Date.now(),
  };
  const updated = [...entries, newEntry].slice(-MAX_ACTIVITY);
  localStorage.setItem(ACTIVITY_KEY, JSON.stringify(updated));
}
