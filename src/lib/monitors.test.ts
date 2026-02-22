import { describe, it, expect, beforeEach } from 'vitest';
import {
  getMonitors,
  setMonitors,
  addMonitor,
  updateMonitor,
  removeMonitor,
  getRunHistory,
  addRunRecord,
  getIntervalMs,
} from './monitors';
import type { Monitor } from '@/types/monitor';

const MONITORS_KEY_PREFIX = 'gravitee-monitors-';
const RUN_HISTORY_KEY = 'gravitee-monitor-runs';

describe('monitors', () => {
  beforeEach(() => {
    localStorage.removeItem(`${MONITORS_KEY_PREFIX}test-ws`);
    localStorage.removeItem(RUN_HISTORY_KEY);
  });

  describe('getMonitors / setMonitors', () => {
    it('returns empty array when no monitors', () => {
      expect(getMonitors('test-ws')).toEqual([]);
    });

    it('persists and returns monitors', () => {
      const list: Monitor[] = [
        {
          id: 'm1',
          name: 'API Health',
          collectionId: 'c1',
          environmentId: null,
          schedule: '5m',
          thresholds: { maxResponseTimeMs: 1000, minStatusCode: 200, alertOnTestFailure: true },
          webhook: { enabled: true, url: 'https://hooks.slack.com/...' },
          email: { enabled: false },
          enabled: true,
          createdAt: 1,
        },
      ];
      setMonitors('test-ws', list);
      expect(getMonitors('test-ws')).toEqual(list);
    });
  });

  describe('addMonitor', () => {
    it('adds monitor with generated id', () => {
      const m = addMonitor('test-ws', {
        name: 'Health Check',
        collectionId: 'c1',
        environmentId: null,
        schedule: '1h',
        thresholds: { maxResponseTimeMs: 0, minStatusCode: 0, alertOnTestFailure: true },
        webhook: { enabled: false, url: '' },
        email: { enabled: false },
        enabled: true,
      });
      expect(m.id).toMatch(/^mon-\d+-[a-z0-9]+$/);
      expect(m.name).toBe('Health Check');
      expect(getMonitors('test-ws')).toHaveLength(1);
    });
  });

  describe('updateMonitor', () => {
    it('updates monitor fields', () => {
      setMonitors('test-ws', [{
        id: 'm1',
        name: 'Old',
        collectionId: 'c1',
        environmentId: null,
        schedule: '5m',
        thresholds: { maxResponseTimeMs: 0, minStatusCode: 0, alertOnTestFailure: true },
        webhook: { enabled: false, url: '' },
        email: { enabled: false },
        enabled: true,
        createdAt: 1,
      }]);
      updateMonitor('test-ws', 'm1', { name: 'New', schedule: '1h' });
      expect(getMonitors('test-ws')[0].name).toBe('New');
      expect(getMonitors('test-ws')[0].schedule).toBe('1h');
    });
  });

  describe('removeMonitor', () => {
    it('removes monitor', () => {
      setMonitors('test-ws', [
        { id: 'm1', name: 'A', collectionId: 'c1', environmentId: null, schedule: '1h', thresholds: { maxResponseTimeMs: 0, minStatusCode: 0, alertOnTestFailure: true }, webhook: { enabled: false, url: '' }, email: { enabled: false }, enabled: true, createdAt: 1 },
        { id: 'm2', name: 'B', collectionId: 'c2', environmentId: null, schedule: '1h', thresholds: { maxResponseTimeMs: 0, minStatusCode: 0, alertOnTestFailure: true }, webhook: { enabled: false, url: '' }, email: { enabled: false }, enabled: true, createdAt: 2 },
      ]);
      removeMonitor('test-ws', 'm1');
      expect(getMonitors('test-ws')).toHaveLength(1);
      expect(getMonitors('test-ws')[0].id).toBe('m2');
    });
  });

  describe('getRunHistory / addRunRecord', () => {
    it('returns empty when no runs', () => {
      expect(getRunHistory()).toEqual([]);
    });

    it('stores and retrieves run records', () => {
      addRunRecord({
        id: 'run-1',
        monitorId: 'm1',
        monitorName: 'Health',
        startTime: 1000,
        endTime: 1500,
        passed: true,
        totalRequests: 2,
        passedTests: 4,
        failedTests: 0,
        maxResponseTimeMs: 300,
        minStatusCode: 200,
        itemsSummary: [],
      });
      const history = getRunHistory(10);
      expect(history).toHaveLength(1);
      expect(history[0].monitorName).toBe('Health');
      expect(history[0].passed).toBe(true);
    });
  });

  describe('getIntervalMs', () => {
    it('returns correct interval for each schedule', () => {
      expect(getIntervalMs('5m')).toBe(5 * 60 * 1000);
      expect(getIntervalMs('1h')).toBe(60 * 60 * 1000);
      expect(getIntervalMs('1d')).toBe(24 * 60 * 60 * 1000);
    });
  });
});
