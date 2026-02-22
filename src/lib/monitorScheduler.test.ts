import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { isMonitorDue, getNextRunTime, createScheduler } from './monitorScheduler';
import type { Monitor } from '@/types/monitor';

const baseMonitor: Monitor = {
  id: 'm1',
  name: 'Test',
  collectionId: 'c1',
  environmentId: null,
  schedule: '1h',
  thresholds: { maxResponseTimeMs: 0, minStatusCode: 0, alertOnTestFailure: true },
  webhook: { enabled: false, url: '' },
  email: { enabled: false },
  enabled: true,
  createdAt: 0,
};

describe('monitorScheduler', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('isMonitorDue', () => {
    it('returns false when monitor is disabled', () => {
      const mon = { ...baseMonitor, enabled: false, lastRunAt: 0 };
      vi.setSystemTime(1000);
      expect(isMonitorDue(mon)).toBe(false);
    });

    it('returns true when never run and interval elapsed (lastRunAt 0)', () => {
      vi.setSystemTime(6 * 60 * 1000); // 6 min
      const mon = { ...baseMonitor, lastRunAt: 0, schedule: '5m' as const };
      expect(isMonitorDue(mon)).toBe(true);
    });

    it('returns false when run recently (within interval)', () => {
      vi.setSystemTime(30 * 60 * 1000); // 30 min
      const mon = { ...baseMonitor, lastRunAt: 0, schedule: '1h' as const };
      expect(isMonitorDue(mon)).toBe(false);
    });

    it('returns true when interval has elapsed', () => {
      vi.setSystemTime(65 * 60 * 1000); // 65 min
      const mon = { ...baseMonitor, lastRunAt: 0, schedule: '1h' as const };
      expect(isMonitorDue(mon)).toBe(true);
    });
  });

  describe('getNextRunTime', () => {
    it('returns lastRun + interval when lastRunAt set', () => {
      const mon = { ...baseMonitor, lastRunAt: 1000, schedule: '1h' as const };
      expect(getNextRunTime(mon)).toBe(1000 + 60 * 60 * 1000);
    });

    it('returns createdAt + interval when no lastRunAt', () => {
      const mon = { ...baseMonitor, createdAt: 500, schedule: '15m' as const };
      expect(getNextRunTime(mon)).toBe(500 + 15 * 60 * 1000);
    });
  });

  describe('createScheduler', () => {
    it('starts and stops interval', () => {
      const checkDue = vi.fn();
      const { start, stop } = createScheduler(checkDue);
      start();
      expect(checkDue).not.toHaveBeenCalled();
      vi.advanceTimersByTime(60 * 1000);
      expect(checkDue).toHaveBeenCalledTimes(1);
      vi.advanceTimersByTime(60 * 1000);
      expect(checkDue).toHaveBeenCalledTimes(2);
      stop();
      vi.advanceTimersByTime(120 * 1000);
      expect(checkDue).toHaveBeenCalledTimes(2);
    });

    it('does not start twice', () => {
      const checkDue = vi.fn();
      const { start } = createScheduler(checkDue);
      start();
      start();
      vi.advanceTimersByTime(60 * 1000);
      expect(checkDue).toHaveBeenCalledTimes(1);
    });
  });
});
