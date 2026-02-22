import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { executeRequest } from './executeRequest';
import type { ApiRequest } from '@/types/api';
import type { Environment } from './variables';
import type { Collection, Folder } from '@/types/api';

const mockRequest: ApiRequest = {
  id: 'req-1',
  name: 'Test Request',
  method: 'GET',
  url: 'https://api.example.com/test',
  params: [],
  headers: [],
  body: '',
  bodyType: 'none',
  formData: [],
};

const mockEnvs: Environment[] = [
  { id: 'env-1', name: 'Dev', variables: [{ key: 'host', value: 'api.example.com', enabled: true }] },
];

describe('executeRequest', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('resolves environment variables in URL', async () => {
    const req: ApiRequest = { ...mockRequest, url: 'https://{{host}}/users' };
    (globalThis.fetch as ReturnType<typeof vi.fn>).mockResolvedValue(
      new Response('{}', { status: 200, headers: { 'content-type': 'application/json' } })
    );
    const scriptVars = new Map<string, string>();

    const result = await executeRequest({
      request: req,
      activeEnvId: 'env-1',
      environments: mockEnvs,
      globalVars: [],
      scriptVars,
    });

    expect(result.response.status).toBe(200);
    const fetchCall = (globalThis.fetch as ReturnType<typeof vi.fn>).mock.calls[0];
    const payload = JSON.parse(fetchCall[1]?.body ?? '{}');
    expect(payload.url).toContain('api.example.com');
  });

  it('runs pre-request script and sets vars', async () => {
    const req: ApiRequest = {
      ...mockRequest,
      url: 'https://api.test/{{token}}',
      preRequestScript: 'pm.environment.set("token", "abc123");',
    };
    (globalThis.fetch as ReturnType<typeof vi.fn>).mockResolvedValue(
      new Response('{}', { status: 200, headers: { 'content-type': 'application/json' } })
    );
    const scriptVars = new Map<string, string>();

    await executeRequest({
      request: req,
      activeEnvId: null,
      environments: [],
      globalVars: [],
      scriptVars,
    });

    expect(scriptVars.get('token')).toBe('abc123');
  });

  it('uses iteration vars for resolution', async () => {
    const req: ApiRequest = { ...mockRequest, url: 'https://api.test/user/{{userId}}' };
    (globalThis.fetch as ReturnType<typeof vi.fn>).mockResolvedValue(
      new Response('{}', { status: 200, headers: { 'content-type': 'application/json' } })
    );
    const scriptVars = new Map<string, string>();
    const iterationVars = new Map([['userId', '42']]);

    await executeRequest({
      request: req,
      activeEnvId: null,
      environments: [],
      globalVars: [],
      scriptVars,
      iterationVars,
    });

    const fetchCall = (globalThis.fetch as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(fetchCall[1]).toBeDefined();
    const payload = JSON.parse((fetchCall[1] as { body?: string })?.body ?? '{}');
    expect(payload.url).toContain('42');
  });

  it('runs test script and returns results', async () => {
    const req: ApiRequest = {
      ...mockRequest,
      testScript: 'pm.test("Status 200", function(){ pm.expect(pm.response.code).to.equal(200); });',
    };
    (globalThis.fetch as ReturnType<typeof vi.fn>).mockResolvedValue(
      new Response('{}', { status: 200, headers: { 'content-type': 'application/json' } })
    );
    const scriptVars = new Map<string, string>();

    const result = await executeRequest({
      request: req,
      activeEnvId: null,
      environments: [],
      globalVars: [],
      scriptVars,
    });

    expect(result.testResults).toHaveLength(1);
    expect(result.testResults[0].name).toBe('Status 200');
    expect(result.testResults[0].passed).toBe(true);
  });

  it('throws on invalid URL', async () => {
    const req: ApiRequest = { ...mockRequest, url: 'not-a-valid-url' };
    const scriptVars = new Map<string, string>();

    await expect(
      executeRequest({
        request: req,
        activeEnvId: null,
        environments: [],
        globalVars: [],
        scriptVars,
      })
    ).rejects.toThrow('Invalid URL');
  });

  it('throws on pre-request script error', async () => {
    const req: ApiRequest = {
      ...mockRequest,
      preRequestScript: 'throw new Error("pre-request failed");',
    };
    const scriptVars = new Map<string, string>();

    await expect(
      executeRequest({
        request: req,
        activeEnvId: null,
        environments: [],
        globalVars: [],
        scriptVars,
      })
    ).rejects.toThrow('pre-request failed');
  });
});
