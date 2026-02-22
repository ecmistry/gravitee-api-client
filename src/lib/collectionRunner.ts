/**
 * Collection Runner: data file parsing, run orchestration, result export.
 */

import type { ApiRequest, ApiResponse } from '@/types/api';
import type { Collection, Folder } from '@/types/api';

export interface TestResult {
  name: string;
  passed: boolean;
  error?: string;
}

export interface RunItemResult {
  requestId: string;
  requestName: string;
  method: string;
  url: string;
  response: ApiResponse;
  testResults: TestResult[];
  duration: number;
}

export interface RunResult {
  runId: string;
  startTime: number;
  endTime: number;
  totalRequests: number;
  totalIterations: number;
  passedTests: number;
  failedTests: number;
  items: RunItemResult[];
  stopped: boolean;
}

/** Parse CSV text into array of variable maps. First row = header (keys). */
export function parseCSV(text: string): Map<string, string>[] {
  const lines = text.trim().split(/\r?\n/).filter(Boolean);
  if (lines.length < 2) return [];
  const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
  const rows: Map<string, string>[] = [];
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim().replace(/^"|"$/g, ''));
    const map = new Map<string, string>();
    headers.forEach((h, j) => map.set(h, values[j] ?? ''));
    rows.push(map);
  }
  return rows;
}

/** Parse JSON: array of objects or single object. */
export function parseJSONData(text: string): Map<string, string>[] {
  try {
    const data = JSON.parse(text);
    if (Array.isArray(data)) {
      return data.map((row: Record<string, unknown>) => {
        const map = new Map<string, string>();
        Object.entries(row).forEach(([k, v]) => map.set(k, String(v ?? '')));
        return map;
      });
    }
    if (data && typeof data === 'object') {
      const map = new Map<string, string>();
      Object.entries(data).forEach(([k, v]) => map.set(k, String(v ?? '')));
      return [map];
    }
  } catch {
    // invalid JSON
  }
  return [];
}

/** Parse data file by content-type. */
export function parseDataFile(content: string, filename: string): Map<string, string>[] {
  const ext = filename.toLowerCase().slice(-4);
  if (ext === '.csv') return parseCSV(content);
  if (ext === 'json') return parseJSONData(content);
  if (content.trim().startsWith('[') || content.trim().startsWith('{')) return parseJSONData(content);
  return parseCSV(content);
}

/** Export run result as JSON. */
export function exportRunResultJSON(result: RunResult): string {
  return JSON.stringify(result, null, 2);
}

/** Export run result as HTML report. */
export function exportRunResultHTML(result: RunResult): string {
  const passed = result.passedTests;
  const failed = result.failedTests;
  const total = passed + failed;
  const pct = total > 0 ? Math.round((passed / total) * 100) : 0;
  const duration = result.endTime - result.startTime;

  const itemsHtml = result.items.map(item => {
    const allPassed = item.testResults.every(r => r.passed);
    const statusClass = allPassed ? 'bg-status-success/20 border-status-success/40' : 'bg-status-client-error/20 border-status-client-error/40';
    const testsHtml = item.testResults.map(t =>
      `<div class="py-1 ${t.passed ? 'text-status-success' : 'text-status-client-error'}">
        ${t.passed ? '✓' : '✗'} ${escapeHtml(t.name)}
        ${t.error ? `<span class="text-xs block ml-4">${escapeHtml(t.error)}</span>` : ''}
      </div>`
    ).join('');
    return `
      <div class="border rounded-lg p-4 ${statusClass}">
        <div class="font-mono text-sm font-semibold">${escapeHtml(item.method)} ${escapeHtml(item.url)}</div>
        <div class="text-xs text-muted mt-1">${escapeHtml(item.requestName)}</div>
        <div class="mt-2 text-xs">Status: ${item.response.status} ${item.response.statusText} | Time: ${item.duration}ms</div>
        ${item.testResults.length > 0 ? `<div class="mt-2">${testsHtml}</div>` : ''}
      </div>`;
  }).join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Collection Run Report</title>
  <style>
    body { font-family: system-ui, sans-serif; max-width: 800px; margin: 0 auto; padding: 2rem; background: #0f172a; color: #e2e8f0; }
    .status-success { color: #22c55e; }
    .text-status-success { color: #22c55e; }
    .text-status-client-error { color: #f87171; }
    .text-muted { color: #94a3b8; }
    .text-xs { font-size: 0.75rem; }
    .mt-1 { margin-top: 0.25rem; }
    .mt-2 { margin-top: 0.5rem; }
    .block { display: block; }
    .ml-4 { margin-left: 1rem; }
    .py-1 { padding-top: 0.25rem; padding-bottom: 0.25rem; }
    .border { border-width: 1px; }
    .rounded-lg { border-radius: 0.5rem; }
    .p-4 { padding: 1rem; }
    .font-mono { font-family: monospace; }
    .font-semibold { font-weight: 600; }
    .text-sm { font-size: 0.875rem; }
  </style>
</head>
<body>
  <h1>Collection Run Report</h1>
  <p class="text-xs text-muted">${new Date(result.startTime).toISOString()}</p>
  <div class="mt-2">
    <p><strong>Summary</strong></p>
    <p>Requests: ${result.totalRequests} × ${result.totalIterations} iteration(s) = ${result.items.length} total</p>
    <p>Tests: ${passed} passed, ${failed} failed (${pct}% pass rate)</p>
    <p>Total time: ${duration}ms</p>
    ${result.stopped ? '<p class="text-status-client-error">Run was stopped by user.</p>' : ''}
  </div>
  <div class="mt-2">
    <p><strong>Results</strong></p>
    ${itemsHtml}
  </div>
</body>
</html>`;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
