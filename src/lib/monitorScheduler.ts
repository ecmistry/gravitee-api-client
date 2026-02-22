/**
 * Scheduler: runs monitors when due (every X min/hours/days)
 * Only runs when app/tab is open; no background execution.
 */
import { getIntervalMs } from './monitors';
import type { Monitor } from '@/types/monitor';
import type { ScheduleInterval } from '@/types/monitor';

const CHECK_INTERVAL_MS = 60 * 1000; // Check every minute

export function isMonitorDue(monitor: Monitor): boolean {
  if (!monitor.enabled) return false;
  const intervalMs = getIntervalMs(monitor.schedule as ScheduleInterval);
  const lastRun = monitor.lastRunAt ?? 0;
  return Date.now() - lastRun >= intervalMs;
}

export function getNextRunTime(monitor: Monitor): number {
  const intervalMs = getIntervalMs(monitor.schedule as ScheduleInterval);
  const lastRun = monitor.lastRunAt ?? monitor.createdAt;
  return lastRun + intervalMs;
}

export function createScheduler(
  checkDue: () => void
): { start: () => void; stop: () => void } {
  let intervalId: ReturnType<typeof setInterval> | null = null;
  return {
    start: () => {
      if (intervalId) return;
      intervalId = setInterval(checkDue, CHECK_INTERVAL_MS);
    },
    stop: () => {
      if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
      }
    },
  };
}
