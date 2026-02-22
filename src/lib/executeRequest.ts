/**
 * Shared request execution logic for single requests and collection runner.
 * Runs pre-request script, resolves variables, sends HTTP request, runs test script.
 */

import { applyAuth } from './auth';
import { resolveRequestVariables } from './variables';
import { runPreRequestScript, runTestScript } from './scripting';
import { getEffectiveAuth } from './collections';
import type { ApiRequest, ApiResponse } from '@/types/api';
import type { Collection, Folder } from '@/types/api';
import type { AuthConfig } from '@/types/auth';
import type { Environment } from './variables';
import type { KeyValuePair } from '@/types/api';

const RAW_CONTENT_TYPES: Record<string, string> = {
  json: 'application/json',
  xml: 'application/xml',
  text: 'text/plain',
  html: 'text/html',
};

export interface ExecuteRequestInput {
  request: ApiRequest;
  collection?: Collection;
  folder?: Folder;
  activeEnvId: string | null;
  environments: Environment[];
  globalVars: KeyValuePair[];
  /** Vars from previous requests (shared across collection run). Mutated by pre-request scripts. */
  scriptVars: Map<string, string>;
  /** Optional override vars for data-driven iteration (e.g. from CSV row). */
  iterationVars?: Map<string, string>;
}

export interface ExecuteRequestResult {
  response: ApiResponse;
  testResults: Array<{ name: string; passed: boolean; error?: string }>;
}

function buildBodyAndHeaders(
  req: ApiRequest,
  authConfig: AuthConfig | undefined
): { body?: string | FormData; headers: Record<string, string>; authParams: Record<string, string> } {
  const headers: Record<string, string> = {};
  req.headers.forEach(h => {
    if (h.enabled && h.key) headers[h.key] = h.value;
  });
  const authResult = applyAuth(authConfig);
  Object.assign(headers, authResult.headers);

  if (req.method === 'GET' || req.method === 'HEAD') return { headers, authParams: authResult.params };

  const bodyType = req.bodyType || 'none';
  if (bodyType === 'none') return { headers, authParams: authResult.params };

  if (bodyType === 'form-urlencoded') {
    const formData = req.formData ?? [];
    const params = new URLSearchParams();
    formData.forEach(p => { if (p.enabled && p.key) params.append(p.key, p.value); });
    headers['Content-Type'] = 'application/x-www-form-urlencoded';
    return { body: params.toString(), headers, authParams: authResult.params };
  }

  if (bodyType === 'form-data') {
    const formData = req.formData ?? [];
    const fd = new FormData();
    formData.forEach(p => { if (p.enabled && p.key) fd.append(p.key, p.value); });
    return { body: fd, headers, authParams: authResult.params };
  }

  if (['json', 'xml', 'text', 'html'].includes(bodyType)) {
    headers['Content-Type'] = RAW_CONTENT_TYPES[bodyType] ?? 'text/plain';
  }
  return { body: req.body || undefined, headers, authParams: authResult.params };
}

/** Execute a single request. Throws on pre-request script error or invalid URL. */
export async function executeRequest(input: ExecuteRequestInput): Promise<ExecuteRequestResult> {
  const { request, collection, folder, activeEnvId, environments, globalVars, scriptVars, iterationVars } = input;

  // Run pre-request script and merge into scriptVars
  if (request.preRequestScript?.trim()) {
    const sv = { environment: new Map<string, string>(), globals: new Map<string, string>() };
    runPreRequestScript(request.preRequestScript, sv);
    sv.environment.forEach((v, k) => scriptVars.set(k, v));
    sv.globals.forEach((v, k) => scriptVars.set(k, v));
  }

  // Merge scriptVars + iteration vars (data-driven) for resolution
  const resolveVars = new Map(scriptVars);
  iterationVars?.forEach((v, k) => resolveVars.set(k, v));

  const toSend = resolveRequestVariables(request, activeEnvId, environments, globalVars, resolveVars);
  const authConfig = getEffectiveAuth(request, collection, folder);
  const built = buildBodyAndHeaders(toSend, authConfig);

  let targetUrl: string;
  try {
    const url = new URL(toSend.url);
    toSend.params.forEach(p => {
      if (p.enabled && p.key) url.searchParams.append(p.key, p.value);
    });
    Object.entries(built.authParams).forEach(([k, v]) => url.searchParams.append(k, v));
    targetUrl = url.toString();
  } catch {
    throw new Error('Invalid URL');
  }

  const { body, headers } = built;

  const proxyPayload: { url: string; method: string; headers: Record<string, string>; body?: string; formData?: Array<{ key: string; value: string }> } = {
    url: targetUrl,
    method: toSend.method,
    headers,
  };
  if (toSend.method !== 'GET' && toSend.method !== 'HEAD') {
    if (body instanceof FormData) {
      proxyPayload.formData = toSend.formData?.filter(p => p.enabled && p.key).map(p => ({ key: p.key, value: p.value })) ?? [];
    } else if (body !== undefined) {
      proxyPayload.body = body;
    }
  }

  const startTime = Date.now();
  const res = import.meta.env.DEV
    ? await fetch('/api-proxy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(proxyPayload),
      }).then(async (r) => {
        const text = await r.text();
        return new Response(text, { status: r.status, statusText: r.statusText, headers: r.headers });
      })
    : await fetch(targetUrl, { method: toSend.method, headers, body });
  const endTime = Date.now();

  const contentType = res.headers.get('content-type') || '';
  let data: unknown;
  if (contentType.includes('application/json')) {
    data = await res.json();
  } else {
    data = await res.text();
  }

  const responseHeaders: Record<string, string> = {};
  res.headers.forEach((value, key) => { responseHeaders[key] = value; });

  const response: ApiResponse = {
    status: res.status,
    statusText: res.statusText,
    headers: responseHeaders,
    data,
    time: endTime - startTime,
    size: typeof data === 'string' ? data.length : JSON.stringify(data).length,
  };

  const testResults = request.testScript?.trim()
    ? runTestScript(request.testScript, response)
    : [];

  return { response, testResults };
}
