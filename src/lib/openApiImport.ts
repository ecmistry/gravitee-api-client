/**
 * Import OpenAPI 3.0 and Swagger 2.0 specs into collections
 */
import type { Collection, ApiRequest, KeyValuePair } from '@/types/api';

type OpenAPI3Paths = Record<string, Record<string, OpenAPI3Operation>>;
type OpenAPI3Operation = {
  summary?: string;
  description?: string;
  operationId?: string;
  parameters?: OpenAPI3Parameter[];
  requestBody?: { content?: Record<string, { schema?: unknown; example?: unknown }> };
};

type OpenAPI3Parameter = {
  name: string;
  in: 'path' | 'query' | 'header' | 'cookie';
  required?: boolean;
  schema?: { type?: string; default?: unknown };
};

type OpenAPI3 = {
  openapi?: string;
  info?: { title?: string; description?: string; version?: string };
  servers?: Array<{ url: string }>;
  paths?: OpenAPI3Paths;
};

type Swagger2Paths = Record<string, Record<string, Swagger2Operation>>;
type Swagger2Operation = {
  summary?: string;
  description?: string;
  operationId?: string;
  parameters?: Swagger2Parameter[];
  consumes?: string[];
  produces?: string[];
};

type Swagger2Parameter = {
  name: string;
  in: 'path' | 'query' | 'header' | 'body' | 'formData';
  required?: boolean;
  type?: string;
  schema?: unknown;
};

type Swagger2 = {
  swagger?: string;
  info?: { title?: string; description?: string; version?: string };
  host?: string;
  basePath?: string;
  schemes?: string[];
  paths?: Swagger2Paths;
};

function genId(): string {
  return `req-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function toParams(params: OpenAPI3Parameter[] | Swagger2Parameter[]): KeyValuePair[] {
  return (params || []).map((p: { name: string; in?: string }) => ({
    key: p.name,
    value: '',
    enabled: true,
  }));
}

function buildUrl(baseUrl: string, path: string): string {
  const base = baseUrl.replace(/\/$/, '');
  const p = path.startsWith('/') ? path : `/${path}`;
  return `${base}${p}`;
}

function getExampleBody(content?: Record<string, { schema?: unknown; example?: unknown }>): string {
  if (!content) return '';
  const json = content['application/json'];
  if (json?.example != null) return typeof json.example === 'string' ? json.example : JSON.stringify(json.example, null, 2);
  if (json?.schema != null) return JSON.stringify(json.schema, null, 2);
  return '';
}

/** Import OpenAPI 3.0 spec (JSON or parsed from YAML) */
export function importFromOpenAPI3(spec: OpenAPI3): Collection[] {
  const title = spec.info?.title || 'Imported API';
  const servers = spec.servers || [];
  const baseUrl = servers[0]?.url?.replace(/\/$/, '') || 'https://api.example.com';
  const paths = spec.paths || {};
  const requests: ApiRequest[] = [];

  for (const [path, operations] of Object.entries(paths)) {
    if (typeof operations !== 'object' || operations === null) continue;
    for (const [method, op] of Object.entries(operations)) {
      const m = method.toLowerCase();
      if (!['get', 'post', 'put', 'patch', 'delete', 'head', 'options'].includes(m)) continue;
      const operation = op as OpenAPI3Operation;
      const params = operation.parameters || [];
      const queryParams = params.filter((p) => p.in === 'query');
      const pathParams = params.filter((p) => p.in === 'path');
      const headerParams = params.filter((p) => p.in === 'header');
      let url = buildUrl(baseUrl, path);
      const urlParams: KeyValuePair[] = [
        ...pathParams.map((p) => ({ key: p.name, value: `{${p.name}}`, enabled: true })),
        ...queryParams.map((p) => ({ key: p.name, value: '', enabled: true })),
      ];
      const headers: KeyValuePair[] = headerParams.map((p) => ({ key: p.name, value: '', enabled: true }));
      const body = getExampleBody(operation.requestBody?.content);
      const bodyType = body?.trim().startsWith('{') || body?.trim().startsWith('[') ? 'json' : 'none';

      requests.push({
        id: genId(),
        name: operation.summary || operation.operationId || `${m.toUpperCase()} ${path}`,
        description: operation.description,
        method: m.toUpperCase() as ApiRequest['method'],
        url,
        params: urlParams,
        headers,
        body: body || '',
        bodyType: body ? (bodyType as 'json') : 'none',
        formData: [],
      });
    }
  }

  return [{
    id: `col-${Date.now()}`,
    name: title,
    description: spec.info?.description,
    folders: [],
    requests,
  }];
}

/** Import Swagger 2.0 spec (JSON or parsed from YAML) */
export function importFromSwagger2(spec: Swagger2): Collection[] {
  const title = spec.info?.title || 'Imported API';
  const scheme = (spec.schemes && spec.schemes[0]) || 'https';
  const host = spec.host || 'api.example.com';
  const basePath = spec.basePath || '';
  const baseUrl = `${scheme}://${host}${basePath}`;
  const paths = spec.paths || {};
  const requests: ApiRequest[] = [];

  for (const [path, operations] of Object.entries(paths)) {
    if (typeof operations !== 'object' || operations === null) continue;
    for (const [method, op] of Object.entries(operations)) {
      const m = method.toLowerCase();
      if (!['get', 'post', 'put', 'patch', 'delete', 'head', 'options'].includes(m)) continue;
      const operation = op as Swagger2Operation;
      const params = operation.parameters || [];
      const queryParams = params.filter((p: Swagger2Parameter) => p.in === 'query');
      const pathParams = params.filter((p: Swagger2Parameter) => p.in === 'path');
      const headerParams = params.filter((p: Swagger2Parameter) => p.in === 'header');
      const bodyParam = params.find((p: Swagger2Parameter) => p.in === 'body');
      let body = '';
      if (bodyParam && bodyParam.schema) {
        body = JSON.stringify(bodyParam.schema, null, 2);
      }
      const urlParams: KeyValuePair[] = [
        ...pathParams.map((p: { name: string }) => ({ key: p.name, value: `{${p.name}}`, enabled: true })),
        ...queryParams.map((p: { name: string }) => ({ key: p.name, value: '', enabled: true })),
      ];
      const headers: KeyValuePair[] = headerParams.map((p: { name: string }) => ({ key: p.name, value: '', enabled: true }));
      const url = buildUrl(baseUrl, path);

      requests.push({
        id: genId(),
        name: operation.summary || operation.operationId || `${m.toUpperCase()} ${path}`,
        description: operation.description,
        method: m.toUpperCase() as ApiRequest['method'],
        url,
        params: urlParams,
        headers,
        body,
        bodyType: body ? 'json' : 'none',
        formData: [],
      });
    }
  }

  return [{
    id: `col-${Date.now()}`,
    name: title,
    description: spec.info?.description,
    folders: [],
    requests,
  }];
}

export function isOpenAPI3(data: unknown): data is OpenAPI3 {
  return !!(
    data &&
    typeof data === 'object' &&
    'openapi' in data &&
    typeof (data as OpenAPI3).openapi === 'string' &&
    ((data as OpenAPI3).openapi?.startsWith('3.') || (data as OpenAPI3).openapi === '3.0')
  );
}

export function isSwagger2(data: unknown): data is Swagger2 {
  return !!(
    data &&
    typeof data === 'object' &&
    'swagger' in data &&
    (data as Swagger2).swagger === '2.0'
  );
}
