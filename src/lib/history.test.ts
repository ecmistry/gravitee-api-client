import { describe, it, expect, beforeEach } from 'vitest';
import { saveToHistory, getHistory, clearHistory, type HistoryEntry } from './history';
import type { ApiRequest, ApiResponse } from '@/types/api';

const mockRequest: ApiRequest = {
  id: 'req-1',
  name: 'Test',
  method: 'GET',
  url: 'https://api.example.com/echo',
  params: [],
  headers: [],
  body: '',
  bodyType: 'none'
};

const mockResponse: ApiResponse = {
  status: 200,
  statusText: 'OK',
  headers: {},
  data: { message: 'hello' },
  time: 50,
  size: 100
};

describe('History', () => {
  beforeEach(() => {
    clearHistory();
  });

  it('returns empty array when no history', () => {
    expect(getHistory()).toEqual([]);
  });

  it('saves request to history', () => {
    saveToHistory(mockRequest, mockResponse);
    const history = getHistory();
    expect(history).toHaveLength(1);
    expect(history[0].request).toEqual(mockRequest);
    expect(history[0].response).toEqual(mockResponse);
    expect(history[0].timestamp).toBeDefined();
  });

  it('prepends new entries', () => {
    saveToHistory(mockRequest, mockResponse);
    saveToHistory({ ...mockRequest, id: 'req-2' }, mockResponse);
    const history = getHistory();
    expect(history[0].request.id).toBe('req-2');
    expect(history[1].request.id).toBe('req-1');
  });

  it('clearHistory removes all entries', () => {
    saveToHistory(mockRequest, mockResponse);
    expect(getHistory()).toHaveLength(1);
    clearHistory();
    expect(getHistory()).toEqual([]);
  });
});
