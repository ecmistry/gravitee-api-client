/**
 * Monitor alerting: webhook (POST to URL), email placeholder
 * Email requires backend; webhook works client-side.
 */
import type { Monitor, MonitorRunRecord } from '@/types/monitor';

export async function runMonitorAlert(monitor: Monitor, record: MonitorRunRecord): Promise<void> {
  const promises: Promise<void>[] = [];
  if (monitor.webhook.enabled && monitor.webhook.url.trim()) {
    promises.push(sendWebhookAlert(monitor, record));
  }
  if (monitor.email.enabled && monitor.email.to) {
    // Email: placeholder - would need backend to send
    promises.push(Promise.resolve());
  }
  await Promise.allSettled(promises);
}

async function sendWebhookAlert(monitor: Monitor, record: MonitorRunRecord): Promise<void> {
  const url = monitor.webhook.url.trim();
  if (!url) return;

  let headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (monitor.webhook.headers?.trim()) {
    try {
      const parsed = JSON.parse(monitor.webhook.headers);
      if (typeof parsed === 'object') headers = { ...headers, ...parsed };
    } catch {
      // ignore invalid JSON
    }
  }

  const payload = {
    event: 'monitor_failed',
    monitor: { id: monitor.id, name: monitor.name },
    run: {
      id: record.id,
      startTime: record.startTime,
      endTime: record.endTime,
      passed: record.passed,
      totalRequests: record.totalRequests,
      passedTests: record.passedTests,
      failedTests: record.failedTests,
      maxResponseTimeMs: record.maxResponseTimeMs,
      minStatusCode: record.minStatusCode,
      itemsSummary: record.itemsSummary,
    },
    timestamp: new Date().toISOString(),
  };

  await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
  });
}
