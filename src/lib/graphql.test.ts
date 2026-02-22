import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { introspectSchema, executeGraphQL, formatGraphQL, getExplorableTypes } from './graphql';
import type { IntrospectionSchema } from './graphql';

describe('graphql', () => {
  describe('formatGraphQL', () => {
    it('formats a simple query with indentation', () => {
      const input = 'query{user{id name}}';
      const output = formatGraphQL(input);
      expect(output).toContain('query');
      expect(output).toContain('user');
      expect(output).toContain('id');
      expect(output).toContain('name');
      expect(output).toMatch(/\{\s*\n/);
    });

    it('handles nested braces', () => {
      const input = '{a{b{c}}}';
      const output = formatGraphQL(input);
      expect(output).toContain('a');
      expect(output).toContain('b');
      expect(output).toContain('c');
      expect(output).toMatch(/^\{\s*\n/);
      expect(output).toMatch(/\n\}$/);
    });

    it('handles commas with newlines', () => {
      const input = '{a,b,c}';
      const output = formatGraphQL(input);
      expect(output).toContain('a,');
      expect(output).toContain('b,');
      expect(output).toContain('c');
    });

    it('handles empty string', () => {
      expect(formatGraphQL('')).toBe('');
    });

    it('trims whitespace', () => {
      const input = '  { x }  ';
      const output = formatGraphQL(input);
      expect(output.startsWith('{')).toBe(true);
      expect(output.endsWith('}')).toBe(true);
    });
  });

  describe('getExplorableTypes', () => {
    const makeSchema = (types: IntrospectionSchema['types']) => ({ types } as IntrospectionSchema);

    it('filters out introspection types (__*)', () => {
      const schema = makeSchema([
        { name: '__Schema', kind: 'OBJECT' },
        { name: 'User', kind: 'OBJECT' },
      ]);
      const result = getExplorableTypes(schema);
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('User');
    });

    it('includes OBJECT, INPUT_OBJECT, INTERFACE, UNION, ENUM', () => {
      const schema = makeSchema([
        { name: 'User', kind: 'OBJECT' },
        { name: 'CreateUserInput', kind: 'INPUT_OBJECT' },
        { name: 'Node', kind: 'INTERFACE' },
        { name: 'SearchResult', kind: 'UNION' },
        { name: 'Role', kind: 'ENUM' },
      ]);
      const result = getExplorableTypes(schema);
      expect(result).toHaveLength(5);
    });

    it('filters out SCALAR', () => {
      const schema = makeSchema([
        { name: 'User', kind: 'OBJECT' },
        { name: 'String', kind: 'SCALAR' },
      ]);
      const result = getExplorableTypes(schema);
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('User');
    });

    it('returns empty array for empty types', () => {
      const schema = makeSchema([]);
      expect(getExplorableTypes(schema)).toEqual([]);
    });
  });

  describe('introspectSchema', () => {
    beforeEach(() => {
      vi.stubGlobal('fetch', vi.fn());
    });

    afterEach(() => {
      vi.unstubAllGlobals();
    });

    it('returns schema when introspection succeeds', async () => {
      const mockSchema = {
        queryType: { name: 'Query' },
        types: [{ name: 'User', kind: 'OBJECT' }],
      };
      (globalThis.fetch as ReturnType<typeof vi.fn>).mockResolvedValue(
        new Response(JSON.stringify({ data: { __schema: mockSchema } }), { status: 200 })
      );

      const result = await introspectSchema('https://api.example.com/graphql');
      expect(result).toEqual(mockSchema);
    });

    it('returns null when response has no schema', async () => {
      (globalThis.fetch as ReturnType<typeof vi.fn>).mockResolvedValue(
        new Response(JSON.stringify({ data: null }), { status: 200 })
      );
      const result = await introspectSchema('https://api.example.com/graphql');
      expect(result).toBeNull();
    });

    it('returns null on fetch error', async () => {
      (globalThis.fetch as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('Network error'));
      const result = await introspectSchema('https://api.example.com/graphql');
      expect(result).toBeNull();
    });
  });

  describe('executeGraphQL', () => {
    beforeEach(() => {
      vi.stubGlobal('fetch', vi.fn());
    });

    afterEach(() => {
      vi.unstubAllGlobals();
    });

    it('returns data and status on success', async () => {
      const mockData = { user: { id: '1', name: 'Alice' } };
      (globalThis.fetch as ReturnType<typeof vi.fn>).mockResolvedValue(
        new Response(JSON.stringify({ data: mockData }), { status: 200 })
      );

      const result = await executeGraphQL('https://api.example.com/graphql', 'query { user { id name } }');
      expect(result.data).toEqual({ data: mockData });
      expect(result.errors).toBeUndefined();
      expect(result.status).toBe(200);
    });

    it('returns errors from GraphQL response', async () => {
      const mockErrors = [{ message: 'Field "foo" not found' }];
      (globalThis.fetch as ReturnType<typeof vi.fn>).mockResolvedValue(
        new Response(JSON.stringify({ errors: mockErrors }), { status: 200 })
      );

      const result = await executeGraphQL('https://api.example.com/graphql', 'query { foo }');
      expect(result.errors).toEqual(mockErrors);
      expect(result.status).toBe(200);
    });

    it('passes variables and operationName in payload', async () => {
      (globalThis.fetch as ReturnType<typeof vi.fn>).mockResolvedValue(
        new Response(JSON.stringify({ data: {} }), { status: 200 })
      );

      await executeGraphQL(
        'https://api.example.com/graphql',
        'query GetUser($id: ID!) { user(id: $id) { name } }',
        { id: '42' },
        'GetUser'
      );

      const fetchCall = (globalThis.fetch as ReturnType<typeof vi.fn>).mock.calls[0];
      const init = fetchCall[1] as { body?: string } | undefined;
      const bodyStr = init?.body ?? '{}';
      const parsed = JSON.parse(bodyStr) as { body?: string; query?: string; variables?: unknown; operationName?: string };
      // DEV uses proxy: body is { url, method, headers, body } where body is stringified payload
      const payload = parsed.body ? JSON.parse(parsed.body) : parsed;
      expect(payload.query).toContain('GetUser');
      expect(payload.variables).toEqual({ id: '42' });
      expect(payload.operationName).toBe('GetUser');
    });

    it('handles invalid JSON response with error', async () => {
      (globalThis.fetch as ReturnType<typeof vi.fn>).mockResolvedValue(
        new Response('not json', { status: 200 })
      );

      const result = await executeGraphQL('https://api.example.com/graphql', 'query { x }');
      expect(result.errors).toEqual([{ message: 'Invalid JSON response' }]);
      expect(result.status).toBe(200);
    });

    it('handles fetch failure with error', async () => {
      (globalThis.fetch as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('Network failed'));

      const result = await executeGraphQL('https://api.example.com/graphql', 'query { x }');
      expect(result.errors).toEqual([{ message: 'Network failed' }]);
      expect(result.status).toBe(0);
    });
  });
});
