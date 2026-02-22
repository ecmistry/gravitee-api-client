import type { ApiRequest, ApiResponse } from '@/types/api';

const HISTORY_KEY = 'gravitee-history';
const MAX_HISTORY = 50;

export interface HistoryEntry {
  request: ApiRequest;
  response: ApiResponse;
  timestamp: number;
}

export function saveToHistory(request: ApiRequest, response: ApiResponse): void {
  const history = getHistory();
  history.unshift({ request, response, timestamp: Date.now() });
  if (history.length > MAX_HISTORY) history.length = MAX_HISTORY;
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
}

export function getHistory(): HistoryEntry[] {
  try {
    return JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
  } catch {
    return [];
  }
}

export function clearHistory(): void {
  localStorage.removeItem(HISTORY_KEY);
}
