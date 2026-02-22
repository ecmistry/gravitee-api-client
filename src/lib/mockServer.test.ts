import { describe, it, expect } from 'vitest';
import {
  matchPath,
  matchQuery,
  selectExample,
  findMatchingRoute,
  getPathFromUrl,
  toPathPattern,
} from './mockServer';
import type { MockRoute, MockExample } from '@/types/mock';

describe('mockServer', () => {
  describe('matchPath', () => {
    it('matches exact path', () => {
      expect(matchPath('/users', '/users')).toEqual({});
    });

    it('matches path with param', () => {
      expect(matchPath('/users/:id', '/users/123')).toEqual({ id: '123' });
    });

    it('matches multiple params', () => {
      expect(matchPath('/users/:userId/posts/:postId', '/users/1/posts/42')).toEqual({
        userId: '1',
        postId: '42',
      });
    });

    it('returns null for non-matching path', () => {
      expect(matchPath('/users/:id', '/users')).toBeNull();
      expect(matchPath('/users', '/users/123')).toBeNull();
    });
  });

  describe('matchQuery', () => {
    it('returns true when no rules', () => {
      const params = new URLSearchParams('a=1');
      expect(matchQuery(undefined, params)).toBe(true);
      expect(matchQuery({}, params)).toBe(true);
    });

    it('matches when all rules satisfy', () => {
      const params = new URLSearchParams('a=1&b=2');
      expect(matchQuery({ a: '1', b: '2' }, params)).toBe(true);
    });

    it('returns false when rule fails', () => {
      const params = new URLSearchParams('a=1');
      expect(matchQuery({ a: '2' }, params)).toBe(false);
      expect(matchQuery({ b: '1' }, params)).toBe(false);
    });
  });

  describe('selectExample', () => {
    const examples: MockExample[] = [
      { id: 'e1', status: 200, headers: [], body: '{}', queryParam: 'a' },
      { id: 'e2', status: 404, headers: [], body: '{"err":"not found"}', queryParam: 'b' },
    ];

    it('returns first example when selection is first', () => {
      const route: MockRoute = {
        id: 'r1',
        requestId: 'req1',
        method: 'GET',
        path: '/users',
        examples,
        exampleSelection: 'first',
      };
      const seq = new Map<string, number>();
      expect(selectExample(route, {}, new URLSearchParams(), seq)).toBe(examples[0]);
    });

    it('returns matching example when selection is query', () => {
      const route: MockRoute = {
        id: 'r1',
        requestId: 'req1',
        method: 'GET',
        path: '/users',
        queryParamName: 'scenario',
        examples,
        exampleSelection: 'query',
      };
      const seq = new Map<string, number>();
      const params = new URLSearchParams('scenario=b');
      expect(selectExample(route, {}, params, seq)).toBe(examples[1]);
    });

    it('returns first when query has no match', () => {
      const route: MockRoute = {
        id: 'r1',
        requestId: 'req1',
        method: 'GET',
        path: '/users',
        queryParamName: 'scenario',
        examples,
        exampleSelection: 'query',
      };
      const seq = new Map<string, number>();
      const params = new URLSearchParams('scenario=unknown');
      expect(selectExample(route, {}, params, seq)).toBe(examples[0]);
    });

    it('cycles through examples for sequential', () => {
      const route: MockRoute = {
        id: 'r1',
        requestId: 'req1',
        method: 'GET',
        path: '/users',
        examples,
        exampleSelection: 'sequential',
      };
      const seq = new Map<string, number>();
      expect(selectExample(route, {}, new URLSearchParams(), seq)).toBe(examples[0]);
      expect(selectExample(route, {}, new URLSearchParams(), seq)).toBe(examples[1]);
      expect(selectExample(route, {}, new URLSearchParams(), seq)).toBe(examples[0]);
    });
  });

  describe('findMatchingRoute', () => {
    const routes: MockRoute[] = [
      {
        id: 'r1',
        requestId: 'req1',
        method: 'GET',
        path: '/users/:id',
        examples: [{ id: 'e1', status: 200, headers: [], body: '{}' }],
        exampleSelection: 'first',
      },
    ];
    const seq = new Map<string, number>();

    it('finds route by method and path', () => {
      const result = findMatchingRoute(routes, 'GET', '/users/42', '', seq);
      expect(result).not.toBeNull();
      expect(result?.route.id).toBe('r1');
      expect(result?.pathParams).toEqual({ id: '42' });
    });

    it('returns null for wrong method', () => {
      expect(findMatchingRoute(routes, 'POST', '/users/42', '', seq)).toBeNull();
    });

    it('returns null for non-matching path', () => {
      expect(findMatchingRoute(routes, 'GET', '/posts/1', '', seq)).toBeNull();
    });
  });

  describe('getPathFromUrl', () => {
    it('extracts path from full URL', () => {
      expect(getPathFromUrl('https://api.example.com/users/1')).toBe('/users/1');
      expect(getPathFromUrl('http://localhost:3000/api/users')).toBe('/api/users');
    });

    it('handles invalid URL', () => {
      expect(getPathFromUrl('invalid')).toBe('/');
    });
  });

  describe('toPathPattern', () => {
    it('replaces numeric segments with :id', () => {
      expect(toPathPattern('/users/123')).toBe('/users/:id');
    });

    it('handles multiple segments', () => {
      expect(toPathPattern('/users/123/posts/456')).toBe('/users/:id/posts/:id');
    });
  });
});
