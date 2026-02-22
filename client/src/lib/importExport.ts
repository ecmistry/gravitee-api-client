import type { Collection, Request } from '../App';

// Postman Collection v2.1 format
interface PostmanCollection {
  info: {
    name: string;
    schema: string;
  };
  item: PostmanItem[];
}

interface PostmanItem {
  name: string;
  request?: {
    method: string;
    header: Array<{ key: string; value: string }>;
    url: string | { raw: string };
    body?: {
      mode: string;
      raw?: string;
    };
  };
  item?: PostmanItem[]; // For folders
}

// Insomnia export format
interface InsomniaExport {
  _type: string;
  resources: InsomniaResource[];
}

interface InsomniaResource {
  _type: string;
  _id: string;
  name: string;
  method?: string;
  url?: string;
  headers?: Array<{ name: string; value: string }>;
  body?: {
    mimeType?: string;
    text?: string;
  };
  parameters?: Array<{ name: string; value: string }>;
}

export function exportToJSON(collections: Collection[]): string {
  return JSON.stringify(collections, null, 2);
}

export function exportToPostman(collections: Collection[]): string {
  const postmanCollections = collections.map(col => ({
    info: {
      name: col.name,
      schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json'
    },
    item: col.requests.map(req => ({
      name: req.name,
      request: {
        method: req.method,
        header: req.headers
          .filter(h => h.enabled)
          .map(h => ({ key: h.key, value: h.value })),
        url: req.url,
        body: req.body ? {
          mode: 'raw',
          raw: req.body
        } : undefined
      }
    }))
  }));

  return JSON.stringify(postmanCollections[0] || {}, null, 2);
}

export function importFromPostman(data: any): Collection[] {
  try {
    const postman = data as PostmanCollection;
    
    const parseItem = (item: PostmanItem): Request | null => {
      if (!item.request) return null;
      
      const url = typeof item.request.url === 'string' 
        ? item.request.url 
        : item.request.url?.raw || '';
      
      return {
        id: `req-${Date.now()}-${Math.random()}`,
        name: item.name,
        method: item.request.method as any,
        url,
        params: [],
        headers: (item.request.header || []).map(h => ({
          key: h.key,
          value: h.value,
          enabled: true
        })),
        body: item.request.body?.raw || '',
        bodyType: item.request.body?.mode as any || 'none'
      };
    };

    const requests: Request[] = [];
    const processItems = (items: PostmanItem[]) => {
      items.forEach(item => {
        if (item.request) {
          const req = parseItem(item);
          if (req) requests.push(req);
        }
        if (item.item) {
          processItems(item.item);
        }
      });
    };

    processItems(postman.item || []);

    return [{
      id: `col-${Date.now()}`,
      name: postman.info?.name || 'Imported Collection',
      folders: [],
      requests
    }];
  } catch (error) {
    console.error('Failed to import Postman collection:', error);
    throw new Error('Invalid Postman collection format');
  }
}

export function importFromInsomnia(data: any): Collection[] {
  try {
    const insomnia = data as InsomniaExport;
    
    const requests: Request[] = insomnia.resources
      .filter(r => r._type === 'request')
      .map(r => ({
        id: `req-${Date.now()}-${Math.random()}`,
        name: r.name,
        method: (r.method || 'GET') as any,
        url: r.url || '',
        params: (r.parameters || []).map(p => ({
          key: p.name,
          value: p.value,
          enabled: true
        })),
        headers: (r.headers || []).map(h => ({
          key: h.name,
          value: h.value,
          enabled: true
        })),
        body: r.body?.text || '',
        bodyType: r.body?.mimeType?.includes('json') ? 'json' : 'raw'
      }));

    return [{
      id: `col-${Date.now()}`,
      name: 'Imported from Insomnia',
      folders: [],
      requests
    }];
  } catch (error) {
    console.error('Failed to import Insomnia export:', error);
    throw new Error('Invalid Insomnia export format');
  }
}

export function detectFormat(data: any): 'native' | 'postman' | 'insomnia' | 'unknown' {
  if (Array.isArray(data) && data[0]?.id && data[0]?.requests) {
    return 'native';
  }
  
  if (data.info && data.info.schema && data.item) {
    return 'postman';
  }
  
  if (data._type === 'export_format_4' && data.resources) {
    return 'insomnia';
  }
  
  return 'unknown';
}
