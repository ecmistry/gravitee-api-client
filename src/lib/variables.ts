import type { KeyValuePair } from '@/types/api';
import { resolveDynamicVariables } from './dynamicVars';

export interface Environment {
  id: string;
  name: string;
  variables: KeyValuePair[];
}

const ENVIRONMENTS_KEY = 'gravitee-environments';
const ACTIVE_ENV_KEY = 'gravitee-active-env';
const GLOBAL_VARS_KEY = 'gravitee-global-vars';

export function getEnvironments(): Environment[] {
  try {
    const data = localStorage.getItem(ENVIRONMENTS_KEY);
    if (!data) return [];
    const parsed = JSON.parse(data);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function setEnvironments(envs: Environment[]): void {
  localStorage.setItem(ENVIRONMENTS_KEY, JSON.stringify(envs));
}

export function getActiveEnvironmentId(): string | null {
  return localStorage.getItem(ACTIVE_ENV_KEY);
}

export function setActiveEnvironmentId(id: string | null): void {
  if (id) localStorage.setItem(ACTIVE_ENV_KEY, id);
  else localStorage.removeItem(ACTIVE_ENV_KEY);
}

export function getGlobalVariables(): KeyValuePair[] {
  try {
    const data = localStorage.getItem(GLOBAL_VARS_KEY);
    if (!data) return [];
    const parsed = JSON.parse(data);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function setGlobalVariables(vars: KeyValuePair[]): void {
  localStorage.setItem(GLOBAL_VARS_KEY, JSON.stringify(vars));
}

/** Build a flat map of variable name -> value (globals first, then active env, then scriptVars) */
function buildVarMap(
  envId: string | null,
  envs: Environment[],
  globals: KeyValuePair[],
  scriptVars?: Map<string, string>
): Map<string, string> {
  const map = new Map<string, string>();
  globals.forEach(v => { if (v.enabled && v.key) map.set(v.key.trim(), v.value); });
  if (envId) {
    const env = envs.find(e => e.id === envId);
    env?.variables.forEach(v => { if (v.enabled && v.key) map.set(v.key.trim(), v.value); });
  }
  scriptVars?.forEach((v, k) => map.set(k.trim(), v));
  return map;
}

/** Resolve {{variableName}} and {{$dynamicVar}} in a string. Variables are case-sensitive. */
export function resolveVariables(
  text: string,
  envId: string | null,
  envs: Environment[],
  globals: KeyValuePair[],
  scriptVars?: Map<string, string>
): string {
  const map = buildVarMap(envId, envs, globals, scriptVars);
  let result = resolveDynamicVariables(text);
  result = result.replace(/\{\{(\w+)\}\}/g, (_, name) => map.get(name) ?? `{{${name}}}`);
  return result;
}

/** Apply variable resolution to request URL, headers, body, params, formData. Includes {{$randomUUID}}, {{$timestamp}}, etc. */
export function resolveRequestVariables<T extends { url?: string; headers?: Array<{ key: string; value: string; enabled?: boolean }>; body?: string; params?: Array<{ key: string; value: string; enabled?: boolean }>; formData?: Array<{ key: string; value: string; enabled?: boolean }> }>(
  request: T,
  envId: string | null,
  envs: Environment[],
  globals: KeyValuePair[],
  scriptVars?: Map<string, string>
): T {
  const resolve = (s: string) => resolveVariables(s, envId, envs, globals, scriptVars);
  return {
    ...request,
    url: request.url ? resolve(request.url) : request.url,
    headers: request.headers?.map(h => ({ ...h, key: resolve(h.key), value: resolve(h.value) })) ?? request.headers,
    body: request.body ? resolve(request.body) : request.body,
    params: request.params?.map(p => ({ ...p, key: resolve(p.key), value: resolve(p.value) })) ?? request.params,
    formData: request.formData?.map(f => ({ ...f, key: resolve(f.key), value: resolve(f.value) })) ?? request.formData,
  } as T;
}
