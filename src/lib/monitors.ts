/**
 * Monitor storage and run history
 * Workspace-scoped; monitors reference collection IDs within the workspace
 */
import type { Monitor, MonitorRunRecord } from '@/types/monitor';
import { SCHEDULE_INTERVAL_MS } from '@/types/monitor';

const MONITORS_KEY_PREFIX = 'gravitee-monitors-';
const RUN_HISTORY_KEY = 'gravitee-monitor-runs';
const MAX_RUN_HISTORY = 500;

function monitorsKey(workspaceId: string): string {
  return `${MONITORS_KEY_PREFIX}${workspaceId}`;
}

function generateId(): string {
  return `mon-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function getMonitors(workspaceId: string): Monitor[] {
  try {
    const raw = localStorage.getItem(monitorsKey(workspaceId));
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function setMonitors(workspaceId: string, monitors: Monitor[]): void {
  localStorage.setItem(monitorsKey(workspaceId), JSON.stringify(monitors));
}

export function addMonitor(workspaceId: string, monitor: Omit<Monitor, 'id' | 'createdAt'>): Monitor {
  const monitors = getMonitors(workspaceId);
  const m: Monitor = {
    ...monitor,
    id: generateId(),
    createdAt: Date.now(),
  };
  monitors.push(m);
  setMonitors(workspaceId, monitors);
  return m;
}

export function updateMonitor(workspaceId: string, id: string, updates: Partial<Monitor>): void {
  const monitors = getMonitors(workspaceId).map((m) =>
    m.id === id ? { ...m, ...updates } : m
  );
  setMonitors(workspaceId, monitors);
}

export function removeMonitor(workspaceId: string, id: string): void {
  setMonitors(workspaceId, getMonitors(workspaceId).filter((m) => m.id !== id));
}

export function getRunHistory(limit?: number): MonitorRunRecord[] {
  try {
    const raw = localStorage.getItem(RUN_HISTORY_KEY);
    const arr = raw ? JSON.parse(raw) : [];
    const sorted = (arr as MonitorRunRecord[]).sort((a, b) => b.startTime - a.startTime);
    return limit ? sorted.slice(0, limit) : sorted;
  } catch {
    return [];
  }
}

export function addRunRecord(record: MonitorRunRecord): void {
  const history = getRunHistory();
  history.unshift(record);
  const trimmed = history.slice(0, MAX_RUN_HISTORY);
  localStorage.setItem(RUN_HISTORY_KEY, JSON.stringify(trimmed));
}

export function getIntervalMs(interval: keyof typeof SCHEDULE_INTERVAL_MS): number {
  return SCHEDULE_INTERVAL_MS[interval] ?? SCHEDULE_INTERVAL_MS['1h'];
}
