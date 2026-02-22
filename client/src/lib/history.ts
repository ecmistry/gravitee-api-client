import type { Request, Response } from '../App';

export interface HistoryEntry {
  id: string;
  request: Request;
  response: Response;
  timestamp: number;
}

const MAX_HISTORY = 50;

export function saveToHistory(request: Request, response: Response): void {
  const history = getHistory();
  
  const entry: HistoryEntry = {
    id: `history-${Date.now()}`,
    request,
    response,
    timestamp: Date.now()
  };
  
  // Add to beginning and limit size
  const newHistory = [entry, ...history].slice(0, MAX_HISTORY);
  
  localStorage.setItem('api-client-history', JSON.stringify(newHistory));
}

export function getHistory(): HistoryEntry[] {
  try {
    const saved = localStorage.getItem('api-client-history');
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (error) {
    console.error('Failed to load history:', error);
  }
  return [];
}

export function clearHistory(): void {
  localStorage.removeItem('api-client-history');
}
