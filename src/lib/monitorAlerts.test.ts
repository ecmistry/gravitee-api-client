import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { runMonitorAlert } from './monitorAlerts';
import type { Monitor, MonitorRunRecord } from '@/types/monitor';

const baseRecord: MonitorRunRecord = {
  id: 'run-1',
  monitorId: 'm1',
  monitorName: 'Health',
  startTime: 1000,
  endTime: 1500,
  passed: false,
  totalRequests: 2,
  passedTests: 2,
  failedTests: 2,
  maxResponseTimeMs: 500,
  minStatusCode: 200,
  itemsSummary: [],
};

describe('monitorAlerts', () => {
  const originalFetch = globalThis.fetch;
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true }));
  });
  afterEach(() => {
    vi.stubGlobal('fetch', originalFetch);
  });

  it('does not call fetch when webhook disabled', async () => {
    const monitor: Monitor = {
      id: 'm1',
      name: 'Test',
      collectionId: 'c1',
      environmentId: null,
      schedule: '1h',
      thresholds: { maxResponseTimeMs: 0, minStatusCode: 0, alertOnTestFailure: true },
      webhook: { enabled: false, url: 'https://example.com/webhook' },
      email: { enabled: false },
      enabled: true,
      createdAt: 0,
    };
    await runMonitorAlert(monitor, baseRecord);
    expect(fetch).not.toHaveBeenCalled();
  });

  it('does not call fetch when webhook url empty', async () => {
    const monitor: Monitor = {
      id: 'm1',
      name: 'Test',
      collectionId: 'c1',
      environmentId: null,
      schedule: '1h',
      thresholds: { maxResponseTimeMs: 0, minStatusCode: 0, alertOnTestFailure: true },
      webhook: { enabled: true, url: '  ' },
      email: { enabled: false },
      enabled: true,
      createdAt: 0,
    };
    await runMonitorAlert(monitor, baseRecord);
    expect(fetch).not.toHaveBeenCalled();
  });

  it('posts to webhook url when enabled', async () => {
    const monitor: Monitor = {
      id: 'm1',
      name: 'Health Check',
      collectionId: 'c1',
      environmentId: null,
      schedule: '1h',
      thresholds: { maxResponseTimeMs: 0, minStatusCode: 0, alertOnTestFailure: true },
      webhook: { enabled: true, url: 'https://hooks.slack.com/abc' },
      email: { enabled: false },
      enabled: true,
      createdAt: 0,
    };
    await runMonitorAlert(monitor, baseRecord);
    expect(fetch).toHaveBeenCalledWith(
      'https://hooks.slack.com/abc',
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: expect.stringContaining('monitor_failed'),
      })
    );
    const body = JSON.parse((fetch as ReturnType<typeof vi.fn>).mock.calls[0][1].body);
    expect(body.event).toBe('monitor_failed');
    expect(body.monitor.name).toBe('Health Check');
    expect(body.run.passed).toBe(false);
  });
});
