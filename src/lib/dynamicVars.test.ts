import { describe, it, expect } from 'vitest';
import { resolveDynamicVariables, defaultDynamicResolvers } from './dynamicVars';

describe('dynamicVars', () => {
  describe('resolveDynamicVariables', () => {
    it('returns text unchanged when no dynamic variables', () => {
      expect(resolveDynamicVariables('hello')).toBe('hello');
      expect(resolveDynamicVariables('https://api.example.com/users')).toBe('https://api.example.com/users');
    });

    it('resolves $randomUUID to valid UUID format', () => {
      const result = resolveDynamicVariables('{{$randomUUID}}');
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      expect(result).toMatch(uuidRegex);
    });

    it('resolves $guid same as $randomUUID', () => {
      const result = resolveDynamicVariables('{{$guid}}');
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      expect(result).toMatch(uuidRegex);
    });

    it('resolves $timestamp to numeric string', () => {
      const before = Date.now();
      const result = resolveDynamicVariables('{{$timestamp}}');
      const after = Date.now();
      const num = parseInt(result, 10);
      expect(num).toBeGreaterThanOrEqual(before);
      expect(num).toBeLessThanOrEqual(after);
    });

    it('resolves $randomInt to number 0-1000 by default', () => {
      const result = resolveDynamicVariables('{{$randomInt}}');
      const num = parseInt(result, 10);
      expect(num).toBeGreaterThanOrEqual(0);
      expect(num).toBeLessThanOrEqual(1000);
    });

    it('resolves $randomInt:100 to number 0-100', () => {
      for (let i = 0; i < 10; i++) {
        const result = resolveDynamicVariables('{{$randomInt:100}}');
        const num = parseInt(result, 10);
        expect(num).toBeGreaterThanOrEqual(0);
        expect(num).toBeLessThanOrEqual(100);
      }
    });

    it('resolves $randomEmail to email-like string', () => {
      const result = resolveDynamicVariables('{{$randomEmail}}');
      expect(result).toMatch(/^[a-z0-9]+@[a-z0-9]+\.com$/i);
    });

    it('resolves $randomBoolean to true or false string', () => {
      const result = resolveDynamicVariables('{{$randomBoolean}}');
      expect(['true', 'false']).toContain(result);
    });

    it('resolves $randomString to alphanumeric string', () => {
      const result = resolveDynamicVariables('{{$randomString}}');
      expect(result).toMatch(/^[a-z0-9]+$/i);
      expect(result.length).toBeGreaterThan(0);
    });

    it('resolves $randomString:20 with param', () => {
      const result = resolveDynamicVariables('{{$randomString:20}}');
      expect(result).toMatch(/^[a-z0-9]+$/i);
      expect(result.length).toBeLessThanOrEqual(20);
    });

    it('resolves multiple dynamic vars in same string', () => {
      const result = resolveDynamicVariables('id={{$randomUUID}}&t={{$timestamp}}');
      expect(result).toMatch(/^id=[0-9a-f-]+&t=\d+$/i);
    });

    it('leaves unknown $var unresolved', () => {
      expect(resolveDynamicVariables('{{$unknownVar}}')).toBe('{{$unknownVar}}');
    });

    it('uses custom resolvers when provided', () => {
      const custom = { foo: () => 'bar', num: () => '42' };
      expect(resolveDynamicVariables('{{$foo}}', custom)).toBe('bar');
      expect(resolveDynamicVariables('{{$num}}', custom)).toBe('42');
    });
  });

  describe('defaultDynamicResolvers', () => {
    it('exposes expected resolvers', () => {
      expect(Object.keys(defaultDynamicResolvers)).toContain('randomUUID');
      expect(Object.keys(defaultDynamicResolvers)).toContain('guid');
      expect(Object.keys(defaultDynamicResolvers)).toContain('timestamp');
      expect(Object.keys(defaultDynamicResolvers)).toContain('randomInt');
      expect(Object.keys(defaultDynamicResolvers)).toContain('randomEmail');
      expect(Object.keys(defaultDynamicResolvers)).toContain('randomBoolean');
      expect(Object.keys(defaultDynamicResolvers)).toContain('randomString');
    });
  });
});
