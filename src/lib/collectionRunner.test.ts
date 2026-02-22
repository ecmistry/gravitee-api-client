import { describe, it, expect } from 'vitest';
import {
  parseCSV,
  parseJSONData,
  parseDataFile,
  exportRunResultJSON,
  exportRunResultHTML,
  type RunResult,
} from './collectionRunner';

describe('collectionRunner', () => {
  describe('parseCSV', () => {
    it('returns empty array for fewer than 2 lines', () => {
      expect(parseCSV('')).toEqual([]);
      expect(parseCSV('a,b,c')).toEqual([]);
    });

    it('parses CSV with header row', () => {
      const text = 'id,name\n1,Alice\n2,Bob';
      const result = parseCSV(text);
      expect(result).toHaveLength(2);
      expect(result[0].get('id')).toBe('1');
      expect(result[0].get('name')).toBe('Alice');
      expect(result[1].get('id')).toBe('2');
      expect(result[1].get('name')).toBe('Bob');
    });

    it('strips surrounding quotes from header and values', () => {
      const text = '"id","name"\n"1","Alice"';
      const result = parseCSV(text);
      expect(result).toHaveLength(1);
      expect(result[0].get('id')).toBe('1');
      expect(result[0].get('name')).toBe('Alice');
    });
  });

  describe('parseJSONData', () => {
    it('parses array of objects', () => {
      const text = '[{"id":1,"name":"A"},{"id":2,"name":"B"}]';
      const result = parseJSONData(text);
      expect(result).toHaveLength(2);
      expect(result[0].get('id')).toBe('1');
      expect(result[0].get('name')).toBe('A');
      expect(result[1].get('id')).toBe('2');
      expect(result[1].get('name')).toBe('B');
    });

    it('parses single object as one row', () => {
      const text = '{"id":1,"name":"Test"}';
      const result = parseJSONData(text);
      expect(result).toHaveLength(1);
      expect(result[0].get('id')).toBe('1');
      expect(result[0].get('name')).toBe('Test');
    });

    it('returns empty for invalid JSON', () => {
      expect(parseJSONData('not json')).toEqual([]);
      expect(parseJSONData('')).toEqual([]);
    });

    it('converts values to strings', () => {
      const result = parseJSONData('[{"n":42,"b":true}]');
      expect(result[0].get('n')).toBe('42');
      expect(result[0].get('b')).toBe('true');
    });
  });

  describe('parseDataFile', () => {
    it('parses CSV by extension', () => {
      const result = parseDataFile('a,b\n1,2', 'data.csv');
      expect(result).toHaveLength(1);
      expect(result[0].get('a')).toBe('1');
      expect(result[0].get('b')).toBe('2');
    });

    it('parses JSON by extension', () => {
      const result = parseDataFile('[{"x":1}]', 'data.json');
      expect(result).toHaveLength(1);
      expect(result[0].get('x')).toBe('1');
    });

    it('falls back to JSON when content looks like JSON', () => {
      const result = parseDataFile('[{"y":2}]', 'data.txt');
      expect(result).toHaveLength(1);
      expect(result[0].get('y')).toBe('2');
    });
  });

  describe('exportRunResultJSON', () => {
    it('serializes run result as formatted JSON', () => {
      const result: RunResult = {
        runId: 'run-1',
        startTime: 1000,
        endTime: 2000,
        totalRequests: 2,
        totalIterations: 1,
        passedTests: 2,
        failedTests: 1,
        items: [
          {
            requestId: 'r1',
            requestName: 'Get',
            method: 'GET',
            url: 'https://api.test/',
            response: { status: 200, statusText: 'OK', headers: {}, data: {}, time: 50, size: 0 },
            testResults: [{ name: 'Status', passed: true }],
            duration: 50,
          },
          {
            requestId: 'r2',
            requestName: 'Post',
            method: 'POST',
            url: 'https://api.test/',
            response: { status: 400, statusText: 'Bad Request', headers: {}, data: {}, time: 30, size: 0 },
            testResults: [{ name: 'Status', passed: false, error: 'Expected 200' }],
            duration: 30,
          },
        ],
        stopped: false,
      };
      const json = exportRunResultJSON(result);
      const parsed = JSON.parse(json);
      expect(parsed.runId).toBe('run-1');
      expect(parsed.passedTests).toBe(2);
      expect(parsed.failedTests).toBe(1);
      expect(parsed.items).toHaveLength(2);
    });
  });

  describe('exportRunResultHTML', () => {
    it('produces valid HTML with summary and results', () => {
      const result: RunResult = {
        runId: 'run-1',
        startTime: 1000,
        endTime: 2000,
        totalRequests: 1,
        totalIterations: 1,
        passedTests: 1,
        failedTests: 0,
        items: [
          {
            requestId: 'r1',
            requestName: 'Get Users',
            method: 'GET',
            url: 'https://api.test/users',
            response: { status: 200, statusText: 'OK', headers: {}, data: {}, time: 100, size: 0 },
            testResults: [{ name: 'Status is 200', passed: true }],
            duration: 100,
          },
        ],
        stopped: false,
      };
      const html = exportRunResultHTML(result);
      expect(html).toContain('<!DOCTYPE html>');
      expect(html).toContain('Collection Run Report');
      expect(html).toContain('Get Users');
      expect(html).toContain('Status is 200');
      expect(html).toContain('1 passed');
      expect(html).toContain('0 failed');
    });

    it('indicates when run was stopped', () => {
      const result: RunResult = {
        runId: 'run-2',
        startTime: 1000,
        endTime: 1500,
        totalRequests: 1,
        totalIterations: 1,
        passedTests: 0,
        failedTests: 0,
        items: [],
        stopped: true,
      };
      const html = exportRunResultHTML(result);
      expect(html).toContain('stopped');
    });
  });
});
