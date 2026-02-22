import { describe, it, expect } from 'vitest';
import { getAllRequests, getAllRequestsFromCollections, findRequestLocation, getEffectiveAuth } from './collections';
import type { Collection, ApiRequest, Folder } from '@/types/api';

const makeRequest = (id: string, name: string): ApiRequest => ({
  id,
  name,
  method: 'GET',
  url: '',
  params: [],
  headers: [],
  body: '',
  bodyType: 'none',
});

describe('collections', () => {
  describe('getAllRequests', () => {
    it('returns only root requests when no folders', () => {
      const col: Collection = {
        id: 'c1',
        name: 'Col',
        folders: [],
        requests: [makeRequest('r1', 'R1'), makeRequest('r2', 'R2')],
      };
      expect(getAllRequests(col)).toHaveLength(2);
      expect(getAllRequests(col).map(r => r.id)).toEqual(['r1', 'r2']);
    });

    it('includes folder requests', () => {
      const col: Collection = {
        id: 'c1',
        name: 'Col',
        folders: [
          {
            id: 'f1',
            name: 'Folder',
            requests: [makeRequest('r3', 'R3')],
          },
        ],
        requests: [makeRequest('r1', 'R1')],
      };
      const all = getAllRequests(col);
      expect(all).toHaveLength(2);
      expect(all.map(r => r.id)).toEqual(['r1', 'r3']);
    });

    it('returns root first then folder requests', () => {
      const col: Collection = {
        id: 'c1',
        name: 'Col',
        folders: [
          { id: 'f1', name: 'F1', requests: [makeRequest('r2', 'R2')] },
          { id: 'f2', name: 'F2', requests: [makeRequest('r3', 'R3')] },
        ],
        requests: [makeRequest('r1', 'R1')],
      };
      const all = getAllRequests(col);
      expect(all.map(r => r.id)).toEqual(['r1', 'r2', 'r3']);
    });

    it('returns empty for empty collection', () => {
      const col: Collection = { id: 'c1', name: 'Col', folders: [], requests: [] };
      expect(getAllRequests(col)).toEqual([]);
    });
  });

  describe('getAllRequestsFromCollections', () => {
    it('flattens all requests from multiple collections', () => {
      const cols: Collection[] = [
        {
          id: 'c1',
          name: 'C1',
          folders: [],
          requests: [makeRequest('r1', 'R1')],
        },
        {
          id: 'c2',
          name: 'C2',
          folders: [{ id: 'f1', name: 'F1', requests: [makeRequest('r2', 'R2')] }],
          requests: [],
        },
      ];
      const all = getAllRequestsFromCollections(cols);
      expect(all).toHaveLength(2);
      expect(all.map(r => r.id)).toEqual(['r1', 'r2']);
    });

    it('returns empty for empty collections', () => {
      expect(getAllRequestsFromCollections([])).toEqual([]);
    });
  });

  describe('findRequestLocation', () => {
    const cols: Collection[] = [
      {
        id: 'c1',
        name: 'C1',
        folders: [
          {
            id: 'f1',
            name: 'F1',
            requests: [makeRequest('r2', 'R2')],
          },
        ],
        requests: [makeRequest('r1', 'R1')],
      },
      {
        id: 'c2',
        name: 'C2',
        folders: [],
        requests: [makeRequest('r3', 'R3')],
      },
    ];

    it('finds root request', () => {
      expect(findRequestLocation(cols, 'r1')).toEqual({ collectionId: 'c1' });
      expect(findRequestLocation(cols, 'r3')).toEqual({ collectionId: 'c2' });
    });

    it('finds request in folder', () => {
      expect(findRequestLocation(cols, 'r2')).toEqual({ collectionId: 'c1', folderId: 'f1' });
    });

    it('returns null for unknown request', () => {
      expect(findRequestLocation(cols, 'r99')).toBeNull();
    });

    it('returns null for empty collections', () => {
      expect(findRequestLocation([], 'r1')).toBeNull();
    });
  });

  describe('getEffectiveAuth', () => {
    const bearerAuth = { type: 'bearer' as const, token: 'bearer-token' };
    const apiKeyAuth = { type: 'api-key' as const, key: '', value: 'key', addTo: 'header' as const, keyName: 'X-Key' };

    it('returns request auth when authInherit is none', () => {
      const request = { id: 'r1', name: 'R', method: 'GET' as const, url: '', params: [], headers: [], body: '', bodyType: 'none' as const, auth: bearerAuth, authInherit: 'none' as const };
      expect(getEffectiveAuth(request, undefined, undefined)).toBe(bearerAuth);
    });

    it('returns request auth when authInherit not set', () => {
      const request = { id: 'r1', name: 'R', method: 'GET' as const, url: '', params: [], headers: [], body: '', bodyType: 'none' as const, auth: bearerAuth };
      expect(getEffectiveAuth(request, undefined, undefined)).toBe(bearerAuth);
    });

    it('returns folder auth when inherit and folder has auth', () => {
      const request = { id: 'r1', name: 'R', method: 'GET' as const, url: '', params: [], headers: [], body: '', bodyType: 'none' as const, authInherit: 'inherit' as const };
      const folder = { id: 'f1', name: 'F', requests: [], auth: apiKeyAuth };
      const collection = { id: 'c1', name: 'C', folders: [], requests: [], auth: bearerAuth };
      expect(getEffectiveAuth(request, collection, folder)).toBe(apiKeyAuth);
    });

    it('returns collection auth when inherit and no folder auth', () => {
      const request = { id: 'r1', name: 'R', method: 'GET' as const, url: '', params: [], headers: [], body: '', bodyType: 'none' as const, authInherit: 'inherit' as const };
      const folder = { id: 'f1', name: 'F', requests: [] };
      const collection = { id: 'c1', name: 'C', folders: [], requests: [], auth: bearerAuth };
      expect(getEffectiveAuth(request, collection, folder)).toBe(bearerAuth);
    });

    it('returns request auth when inherit but no parent auth', () => {
      const request = { id: 'r1', name: 'R', method: 'GET' as const, url: '', params: [], headers: [], body: '', bodyType: 'none' as const, auth: bearerAuth, authInherit: 'inherit' as const };
      const folder = { id: 'f1', name: 'F', requests: [] };
      const collection = { id: 'c1', name: 'C', folders: [], requests: [] };
      expect(getEffectiveAuth(request, collection, folder)).toBe(bearerAuth);
    });
  });
});
