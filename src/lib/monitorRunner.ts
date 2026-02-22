/**
 * Runs a monitor: executes collection/folder and produces MonitorRunRecord
 */
import { executeRequest } from './executeRequest';
import { getAllRequests } from './collections';
import { addRunRecord } from './monitors';
import { runMonitorAlert } from './monitorAlerts';
import type { Monitor, MonitorRunRecord } from '@/types/monitor';
import type { Collection, ApiRequest } from '@/types/api';
import type { Environment } from './variables';
import type { KeyValuePair } from '@/types/api';
export interface RunMonitorInput {
  monitor: Monitor;
  collection: Collection;
  environments: Environment[];
  globalVars: KeyValuePair[];
  workspaceId: string;
}

export async function runMonitor(input: RunMonitorInput): Promise<MonitorRunRecord> {
  const { monitor, collection, environments, globalVars, workspaceId } = input;
  const envId = monitor.environmentId;
  const folder = monitor.folderId
    ? collection.folders.find((f) => f.id === monitor.folderId)
    : undefined;
  const requests: ApiRequest[] = folder
    ? folder.requests
    : getAllRequests(collection);
  const httpRequests = requests.filter((r) => (r.requestType ?? 'http') === 'http');

  const runId = `run-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  const startTime = Date.now();
  const scriptVars = new Map<string, string>();
  const itemsSummary: MonitorRunRecord['itemsSummary'] = [];
  let passedTests = 0;
  let failedTests = 0;
  let maxResponseTimeMs = 0;
  let minStatusCode = 999;
  let anyFailed = false;

  for (const req of httpRequests) {
    try {
      const { response, testResults } = await executeRequest({
        request: req,
        collection,
        folder,
        activeEnvId: envId,
        environments,
        globalVars,
        scriptVars,
      });
      const passed = testResults.filter((r) => r.passed).length;
      const failed = testResults.filter((r) => !r.passed).length;
      passedTests += passed;
      failedTests += failed;
      maxResponseTimeMs = Math.max(maxResponseTimeMs, response.time);
      minStatusCode = Math.min(minStatusCode, response.status);
      const itemPassed = failed === 0 && response.status >= 200 && response.status < 400;
      if (!itemPassed) anyFailed = true;
      itemsSummary.push({
        requestName: req.name,
        method: req.method,
        passed: itemPassed,
        statusCode: response.status,
        responseTimeMs: response.time,
        failedTests: failed,
      });
    } catch {
      failedTests += 1;
      anyFailed = true;
      itemsSummary.push({
        requestName: req.name,
        method: req.method,
        passed: false,
        statusCode: 0,
        responseTimeMs: 0,
        failedTests: 1,
      });
    }
  }

  const endTime = Date.now();
  const thresholds = monitor.thresholds;
  const thresholdFailed =
    (thresholds.maxResponseTimeMs > 0 && maxResponseTimeMs > thresholds.maxResponseTimeMs) ||
    (thresholds.minStatusCode > 0 && minStatusCode < thresholds.minStatusCode) ||
    (thresholds.alertOnTestFailure && failedTests > 0);

  const passed = !anyFailed && !thresholdFailed;

  const record: MonitorRunRecord = {
    id: runId,
    monitorId: monitor.id,
    monitorName: monitor.name,
    startTime,
    endTime,
    passed,
    totalRequests: httpRequests.length,
    passedTests,
    failedTests,
    maxResponseTimeMs,
    minStatusCode: minStatusCode === 999 ? 0 : minStatusCode,
    itemsSummary,
  };

  addRunRecord(record);

  const { updateMonitor } = await import('./monitors');
  updateMonitor(workspaceId, monitor.id, { lastRunAt: endTime });

  if (!passed || thresholdFailed) {
    runMonitorAlert(monitor, record).catch(() => {});
  }

  return record;
}

