import type { Collection, ApiRequest, KeyValuePair } from '@/types/api';
import { importFromOpenAPI3, importFromSwagger2, isOpenAPI3, isSwagger2 } from './openApiImport';
import { collectionToOpenAPI } from './apiDocs';

export type ImportFormat = 'native' | 'postman' | 'insomnia' | 'openapi' | 'swagger' | 'unknown';

export function exportToJSON(collections: Collection[]): string {
  return JSON.stringify(collections, null, 2);
}

export function detectFormat(data: unknown): ImportFormat {
  if (Array.isArray(data) && data.length > 0 && 'requests' in data[0]) return 'native';
  if (data && typeof data === 'object' && 'info' in data && '_postman_id' in (data as Record<string, unknown>).info) return 'postman';
  if (data && typeof data === 'object' && 'item' in data && 'info' in data) return 'postman';
  if (data && typeof data === 'object' && 'resources' in data) return 'insomnia';
  if (isOpenAPI3(data)) return 'openapi';
  if (isSwagger2(data)) return 'swagger';
  return 'unknown';
}

/** Export collection to OpenAPI 3.0 (JSON or YAML) */
export function exportToOpenAPI(collections: Collection[], format: 'json' | 'yaml' = 'json'): string {
  const col = collections[0] || { id: 'default', name: 'API', folders: [], requests: [] };
  return collectionToOpenAPI(col, format);
}

/** Export collection to Postman Collection v2.1 format */
export function exportToPostman(collections: Collection[]): string {
  const col = collections[0] || { id: 'default', name: 'API', folders: [], requests: [] };
  const items: object[] = [];

  const requestToPostmanItem = (req: ApiRequest) => {
    const queryParams = req.params.filter((p) => p.enabled && p.key);
    const urlObj = {
      raw: req.url,
      ...(queryParams.length > 0 && { query: queryParams.map((p) => ({ key: p.key, value: p.value })) }),
    };
    return {
      name: req.name,
      request: {
        method: req.method,
        header: req.headers.filter((h) => h.enabled && h.key).map((h) => ({ key: h.key, value: h.value, type: 'text' })),
        url: urlObj,
        body: req.body && req.method !== 'GET' && req.method !== 'HEAD'
          ? { mode: 'raw', raw: req.body }
          : undefined,
        description: req.description,
      },
    };
  };

  col.requests.forEach((r) => items.push(requestToPostmanItem(r)));
  col.folders.forEach((f) => {
    items.push({
      name: f.name,
      item: f.requests.map((r) => requestToPostmanItem(r)),
    });
  });

  const postman = {
    info: {
      _postman_id: `col-${col.id}`,
      name: col.name,
      description: col.description,
      schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json',
    },
    item: items,
  };
  return JSON.stringify(postman, null, 2);
}

/** Parse JSON or YAML string into object */
export async function parseSpecText(text: string): Promise<unknown> {
  const trimmed = text.trim();
  if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
    return JSON.parse(text);
  }
  const { parse } = await import('yaml');
  return parse(text);
}

function parsePostmanItem(item: Record<string, unknown>): ApiRequest | null {
  if (item.request) {
    const req = item.request as Record<string, unknown>;
    const url = typeof req.url === 'string' ? req.url : (req.url as Record<string, unknown>)?.raw as string || '';
    const headers = (req.header as Array<{ key: string; value: string; disabled?: boolean }>) || [];
    const params: KeyValuePair[] = [];
    if (req.url && typeof req.url === 'object' && Array.isArray((req.url as { query?: Array<{ key: string; value: string }> }).query)) {
      (req.url as { query: Array<{ key: string; value: string }> }).query.forEach((q) => params.push({ key: q.key, value: q.value, enabled: true }));
    }
    return {
      id: `req-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      name: (item.name as string) || 'Untitled',
      description: req.description as string | undefined,
      method: ((req.method as string) || 'GET').toUpperCase() as ApiRequest['method'],
      url,
      params,
      headers: headers.map((h) => ({ key: h.key, value: h.value, enabled: !h.disabled })),
      body: (req.body as { raw?: string })?.raw || '',
      bodyType: (req.body as { mode?: string })?.mode === 'raw' ? 'json' : 'none',
      formData: [],
    };
  }
  return null;
}

function processPostmanItems(items: unknown[]): { requests: ApiRequest[]; folders: { name: string; requests: ApiRequest[] }[] } {
  const rootRequests: ApiRequest[] = [];
  const folders: { name: string; requests: ApiRequest[] }[] = [];
  for (const it of items) {
    const item = it as Record<string, unknown>;
    if (item.request) {
      const req = parsePostmanItem(item);
      if (req) rootRequests.push(req);
    } else if (Array.isArray(item.item)) {
      const folderReqs: ApiRequest[] = [];
      for (const sub of item.item) {
        const r = parsePostmanItem(sub as Record<string, unknown>);
        if (r) folderReqs.push(r);
      }
      folders.push({ name: (item.name as string) || 'Folder', requests: folderReqs });
    }
  }
  return { requests: rootRequests, folders };
}

export function importFromPostman(data: Record<string, unknown>): Collection[] {
  const items = (data.item || []) as unknown[];
  const { requests, folders } = processPostmanItems(items);
  const folderObjs = folders.map((f) => ({
    id: `folder-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    name: f.name,
    requests: f.requests,
  }));
  return [{
    id: `col-${Date.now()}`,
    name: (data.info as { name?: string })?.name || 'Imported Collection',
    folders: folderObjs,
    requests,
  }];
}

export function importFromInsomnia(data: any): Collection[] {
  const requests: ApiRequest[] = (data.resources || [])
    .filter((r: any) => r._type === 'request')
    .map((r: any) => ({
      id: `req-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      name: r.name || 'Untitled',
      method: r.method || 'GET',
      url: r.url || '',
      params: [],
      headers: (r.headers || []).map((h: any) => ({
        key: h.name, value: h.value, enabled: !h.disabled
      })),
      body: r.body?.text || '',
      bodyType: r.body?.mimeType?.includes('json') ? 'json' : 'none',
      formData: [],
    }));

  return [{
    id: `col-${Date.now()}`,
    name: 'Imported Collection',
    folders: [],
    requests,
  }];
}
