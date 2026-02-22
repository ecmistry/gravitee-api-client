/**
 * Types for Phase 11 — Monitoring & Scheduled Runs
 */

export type ScheduleInterval = '5m' | '15m' | '1h' | '6h' | '1d';

/** Interval in milliseconds */
export const SCHEDULE_INTERVAL_MS: Record<ScheduleInterval, number> = {
  '5m': 5 * 60 * 1000,
  '15m': 15 * 60 * 1000,
  '1h': 60 * 60 * 1000,
  '6h': 6 * 60 * 60 * 1000,
  '1d': 24 * 60 * 60 * 1000,
};

export interface MonitorAlertThresholds {
  /** Alert if any response exceeds this time (ms). 0 = disabled. */
  maxResponseTimeMs: number;
  /** Alert if any response status is below this (e.g. 400 = alert on 4xx/5xx). 0 = disabled. */
  minStatusCode: number;
  /** Alert when any test assertion fails */
  alertOnTestFailure: boolean;
}

export interface MonitorWebhookConfig {
  enabled: boolean;
  url: string;
  /** Optional: custom headers as JSON string or empty */
  headers?: string;
}

export interface MonitorEmailConfig {
  enabled: boolean;
  /** Email address. Sending requires backend. */
  to?: string;
}

export interface Monitor {
  id: string;
  name: string;
  /** Collection ID to run */
  collectionId: string;
  /** Optional folder ID; if set, run only that folder's requests */
  folderId?: string;
  /** Environment ID for variable resolution */
  environmentId: string | null;
  schedule: ScheduleInterval;
  thresholds: MonitorAlertThresholds;
  webhook: MonitorWebhookConfig;
  email: MonitorEmailConfig;
  enabled: boolean;
  createdAt: number;
  lastRunAt?: number;
}

export interface MonitorRunRecord {
  id: string;
  monitorId: string;
  monitorName: string;
  startTime: number;
  endTime: number;
  passed: boolean;
  totalRequests: number;
  passedTests: number;
  failedTests: number;
  maxResponseTimeMs: number;
  minStatusCode: number;
  /** Serialized RunResult items (truncated for storage) */
  itemsSummary: Array<{
    requestName: string;
    method: string;
    passed: boolean;
    statusCode: number;
    responseTimeMs: number;
    failedTests: number;
  }>;
}
