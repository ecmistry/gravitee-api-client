import type { Collection, ApiRequest } from '@/types/api';

export function exportToJSON(collections: Collection[]): string {
  return JSON.stringify(collections, null, 2);
}

export function detectFormat(data: unknown): 'native' | 'postman' | 'insomnia' | 'unknown' {
  if (Array.isArray(data) && data.length > 0 && 'requests' in data[0]) return 'native';
  if (data && typeof data === 'object' && 'info' in data && '_postman_id' in (data as any).info) return 'postman';
  if (data && typeof data === 'object' && 'resources' in data) return 'insomnia';
  return 'unknown';
}

export function importFromPostman(data: any): Collection[] {
  const collection: Collection = {
    id: `col-${Date.now()}`,
    name: data.info?.name || 'Imported Collection',
    folders: [],
    requests: (data.item || []).map((item: any) => ({
      id: `req-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      name: item.name || 'Untitled',
      method: item.request?.method || 'GET',
      url: typeof item.request?.url === 'string' ? item.request.url : item.request?.url?.raw || '',
      params: [],
      headers: (item.request?.header || []).map((h: any) => ({
        key: h.key, value: h.value, enabled: !h.disabled
      })),
      body: item.request?.body?.raw || '',
      bodyType: item.request?.body?.mode === 'raw' ? 'raw' : 'none',
    })),
  };
  return [collection];
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
    }));

  return [{
    id: `col-${Date.now()}`,
    name: 'Imported Collection',
    folders: [],
    requests,
  }];
}
