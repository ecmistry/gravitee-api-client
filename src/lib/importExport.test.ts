import { describe, it, expect } from 'vitest';
import { detectFormat, exportToJSON, importFromPostman, importFromInsomnia } from './importExport';
import type { Collection } from '@/types/api';

describe('importExport', () => {
  describe('detectFormat', () => {
    it('detects native format', () => {
      const native = [{ id: 'c1', name: 'Col', folders: [], requests: [{ id: 'r1', name: 'R', method: 'GET', url: '', params: [], headers: [], body: '' }] }];
      expect(detectFormat(native)).toBe('native');
    });

    it('detects postman format', () => {
      const postman = { info: { _postman_id: 'x', name: 'Test' }, item: [] };
      expect(detectFormat(postman)).toBe('postman');
    });

    it('detects insomnia format', () => {
      const insomnia = { resources: [] };
      expect(detectFormat(insomnia)).toBe('insomnia');
    });

    it('returns unknown for invalid data', () => {
      expect(detectFormat(null)).toBe('unknown');
      expect(detectFormat({})).toBe('unknown');
    });
  });

  describe('exportToJSON', () => {
    it('exports collections as JSON string', () => {
      const cols: Collection[] = [{ id: 'c1', name: 'Test', folders: [], requests: [] }];
      const json = exportToJSON(cols);
      expect(() => JSON.parse(json)).not.toThrow();
      expect(JSON.parse(json)).toEqual(cols);
    });
  });

  describe('importFromPostman', () => {
    it('imports postman collection', () => {
      const data = {
        info: { name: 'My API' },
        item: [{
          name: 'Get User',
          request: { method: 'GET', url: 'https://api.example.com/users', header: [], body: { mode: 'raw', raw: '{}' } }
        }]
      };
      const result = importFromPostman(data);
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('My API');
      expect(result[0].requests).toHaveLength(1);
      expect(result[0].requests[0].method).toBe('GET');
      expect(result[0].requests[0].url).toBe('https://api.example.com/users');
    });
  });

  describe('importFromInsomnia', () => {
    it('imports insomnia export', () => {
      const data = {
        resources: [{
          _type: 'request',
          name: 'Get Data',
          method: 'GET',
          url: 'https://api.example.com/data',
          headers: [],
          body: {}
        }]
      };
      const result = importFromInsomnia(data);
      expect(result).toHaveLength(1);
      expect(result[0].requests).toHaveLength(1);
      expect(result[0].requests[0].method).toBe('GET');
      expect(result[0].requests[0].url).toBe('https://api.example.com/data');
    });
  });
});
