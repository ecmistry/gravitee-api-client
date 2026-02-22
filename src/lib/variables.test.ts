import { describe, it, expect, beforeEach } from 'vitest';
import {
  getEnvironments,
  setEnvironments,
  getActiveEnvironmentId,
  setActiveEnvironmentId,
  getGlobalVariables,
  setGlobalVariables,
  resolveVariables,
  resolveRequestVariables,
  type Environment,
} from './variables';
import type { KeyValuePair } from '@/types/api';

const ENV_KEYS = ['gravitee-environments', 'gravitee-active-env', 'gravitee-global-vars'];

function clearEnvStorage() {
  ENV_KEYS.forEach(key => localStorage.removeItem(key));
}

describe('variables', () => {
  beforeEach(clearEnvStorage);

  describe('getEnvironments / setEnvironments', () => {
    it('returns empty array when no data', () => {
      expect(getEnvironments()).toEqual([]);
    });

    it('stores and retrieves environments', () => {
      const envs: Environment[] = [
        { id: 'dev', name: 'Development', variables: [{ key: 'baseUrl', value: 'http://localhost', enabled: true }] },
      ];
      setEnvironments(envs);
      expect(getEnvironments()).toEqual(envs);
    });

    it('returns empty array for invalid JSON', () => {
      localStorage.setItem('gravitee-environments', 'invalid');
      expect(getEnvironments()).toEqual([]);
    });
  });

  describe('getActiveEnvironmentId / setActiveEnvironmentId', () => {
    it('returns null when not set', () => {
      expect(getActiveEnvironmentId()).toBeNull();
    });

    it('stores and retrieves active env id', () => {
      setActiveEnvironmentId('dev');
      expect(getActiveEnvironmentId()).toBe('dev');
    });

    it('removes when set to null', () => {
      setActiveEnvironmentId('dev');
      setActiveEnvironmentId(null);
      expect(getActiveEnvironmentId()).toBeNull();
    });
  });

  describe('getGlobalVariables / setGlobalVariables', () => {
    it('returns empty array when no data', () => {
      expect(getGlobalVariables()).toEqual([]);
    });

    it('stores and retrieves global variables', () => {
      const vars: KeyValuePair[] = [{ key: 'apiKey', value: 'secret', enabled: true }];
      setGlobalVariables(vars);
      expect(getGlobalVariables()).toEqual(vars);
    });

    it('returns empty array for invalid JSON', () => {
      localStorage.setItem('gravitee-global-vars', 'not json');
      expect(getGlobalVariables()).toEqual([]);
    });
  });

  describe('resolveVariables', () => {
    const envs: Environment[] = [
      {
        id: 'dev',
        name: 'Dev',
        variables: [
          { key: 'baseUrl', value: 'http://localhost:3000', enabled: true },
          { key: 'apiKey', value: 'dev-key', enabled: true },
          { key: 'disabled', value: 'x', enabled: false },
        ],
      },
      {
        id: 'prod',
        name: 'Prod',
        variables: [{ key: 'baseUrl', value: 'https://api.example.com', enabled: true }],
      },
    ];

    it('returns text unchanged when no variables', () => {
      expect(resolveVariables('hello', null, [], [])).toBe('hello');
      expect(resolveVariables('https://api.example.com', null, [], [])).toBe('https://api.example.com');
    });

    it('resolves single variable from active env', () => {
      expect(resolveVariables('{{baseUrl}}/users', 'dev', envs, [])).toBe('http://localhost:3000/users');
    });

    it('resolves multiple variables', () => {
      expect(resolveVariables('{{baseUrl}}/{{apiKey}}', 'dev', envs, [])).toBe('http://localhost:3000/dev-key');
    });

    it('uses active env when envId provided', () => {
      expect(resolveVariables('{{baseUrl}}', 'prod', envs, [])).toBe('https://api.example.com');
    });

    it('keeps unresolved variable as {{name}}', () => {
      expect(resolveVariables('{{unknown}}', 'dev', envs, [])).toBe('{{unknown}}');
    });

    it('skips disabled variables', () => {
      expect(resolveVariables('{{disabled}}', 'dev', envs, [])).toBe('{{disabled}}');
    });

    it('env vars override globals when both define same key', () => {
      const globals: KeyValuePair[] = [{ key: 'baseUrl', value: 'https://global.com', enabled: true }];
      expect(resolveVariables('{{baseUrl}}', 'dev', envs, globals)).toBe('http://localhost:3000');
    });

    it('is case-sensitive', () => {
      const envsCase: Environment[] = [
        { id: 'x', name: 'X', variables: [{ key: 'BaseUrl', value: 'http://a.com', enabled: true }] },
      ];
      expect(resolveVariables('{{baseUrl}}', 'x', envsCase, [])).toBe('{{baseUrl}}');
      expect(resolveVariables('{{BaseUrl}}', 'x', envsCase, [])).toBe('http://a.com');
    });
  });

  describe('resolveRequestVariables', () => {
    const envs: Environment[] = [
      { id: 'dev', name: 'Dev', variables: [{ key: 'host', value: 'localhost', enabled: true }] },
    ];
    const globals: KeyValuePair[] = [{ key: 'token', value: 'abc', enabled: true }];

    it('resolves URL', () => {
      const req = { url: 'https://{{host}}/api', headers: [], params: [] };
      const resolved = resolveRequestVariables(req, 'dev', envs, globals);
      expect(resolved.url).toBe('https://localhost/api');
    });

    it('resolves headers', () => {
      const req = {
        url: '',
        headers: [{ key: 'Authorization', value: 'Bearer {{token}}', enabled: true }],
        params: [],
      };
      const resolved = resolveRequestVariables(req, null, [], globals);
      expect(resolved.headers![0].value).toBe('Bearer abc');
    });

    it('resolves body', () => {
      const req = { url: '', headers: [], body: '{"host":"{{host}}"}', params: [] };
      const resolved = resolveRequestVariables(req, 'dev', envs, []);
      expect(resolved.body).toBe('{"host":"localhost"}');
    });

    it('resolves params', () => {
      const req = {
        url: '',
        headers: [],
        params: [{ key: 'api_key', value: '{{token}}', enabled: true }],
      };
      const resolved = resolveRequestVariables(req, null, [], globals);
      expect(resolved.params![0].value).toBe('abc');
    });

    it('resolves formData', () => {
      const req = {
        url: '',
        headers: [],
        params: [],
        formData: [{ key: 'token', value: '{{token}}', enabled: true }],
      };
      const resolved = resolveRequestVariables(req, null, [], globals);
      expect(resolved.formData![0].value).toBe('abc');
    });

    it('preserves request structure', () => {
      const req = { url: 'https://fixed.com', headers: [], params: [], body: '{}' };
      const resolved = resolveRequestVariables(req, null, [], []);
      expect(resolved).toEqual(req);
    });

    it('resolves script vars from pre-request (script vars override env)', () => {
      const req = { url: 'https://{{host}}/{{token}}', headers: [], params: [] };
      const scriptVars = new Map<string, string>();
      scriptVars.set('host', 'script-host');
      scriptVars.set('token', 'script-token');
      const resolved = resolveRequestVariables(req, 'dev', envs, globals, scriptVars);
      expect(resolved.url).toBe('https://script-host/script-token');
    });

    it('uses env when script var not set, script var when set', () => {
      const req = { url: '{{host}}:{{dynamicId}}', headers: [], params: [] };
      const scriptVars = new Map<string, string>();
      scriptVars.set('dynamicId', '123'); // from pre-request
      const resolved = resolveRequestVariables(req, 'dev', envs, globals, scriptVars);
      expect(resolved.url).toBe('localhost:123');
    });
  });

  describe('resolveVariables with scriptVars', () => {
    const envs: Environment[] = [
      { id: 'dev', name: 'Dev', variables: [{ key: 'x', value: 'env', enabled: true }] },
    ];

    it('script vars override env and globals', () => {
      const globals: KeyValuePair[] = [{ key: 'x', value: 'global', enabled: true }];
      const scriptVars = new Map<string, string>([['x', 'script']]);
      expect(resolveVariables('{{x}}', 'dev', envs, globals, scriptVars)).toBe('script');
    });

    it('resolves script var when env has no match', () => {
      const scriptVars = new Map<string, string>([['secret', 'abc']]);
      expect(resolveVariables('Bearer {{secret}}', null, [], [], scriptVars)).toBe('Bearer abc');
    });
  });
});
