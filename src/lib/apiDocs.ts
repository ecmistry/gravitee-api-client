/**
 * API Documentation Generator
 * Converts collections to OpenAPI 3.0 and static HTML
 */
import type { Collection, Folder, ApiRequest, ApiResponse } from '@/types/api';
import { getAllRequests } from '@/lib/collections';

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function mdToHtml(md: string): string {
  if (!md?.trim()) return '';
  return md
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/^### (.*)$/gm, '<h4>$1</h4>')
    .replace(/^## (.*)$/gm, '<h3>$1</h3>')
    .replace(/^# (.*)$/gm, '<h2>$1</h2>')
    .replace(/^\* (.*)$/gm, '<li>$1</li>')
    .replace(/^- (.*)$/gm, '<li>$1</li>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>')
    .replace(/\n\n/g, '</p><p>')
    .replace(/\n/g, '<br>');
}

function parseUrl(u: string): { path: string; baseUrl: string; pathParams: string[] } {
  try {
    const url = new URL(u);
    const path = url.pathname;
    const pathParams: string[] = [];
    path.split('/').forEach((seg) => {
      if (seg.startsWith(':') || /^\{.+\}$/.test(seg)) pathParams.push(seg.replace(/^[:{}]|}$/g, ''));
    });
    const baseUrl = `${url.protocol}//${url.host}`;
    return { path, baseUrl, pathParams };
  } catch {
    return { path: u, baseUrl: '', pathParams: [] };
  }
}

/** Convert collection to OpenAPI 3.0 spec */
export function collectionToOpenAPI(col: Collection, format: 'json' | 'yaml' = 'json'): string {
  const { path: firstPath, baseUrl } = col.requests[0] ? parseUrl(col.requests[0].url) : { path: '/', baseUrl: 'https://api.example.com' };
  const servers = baseUrl ? [{ url: baseUrl }] : [];

  const paths: Record<string, Record<string, unknown>> = {};
  const requests = getAllRequests(col);

  for (const req of requests) {
    if ((req.requestType ?? 'http') !== 'http') continue;
    const { path, pathParams } = parseUrl(req.url);
    const pathKey = path || '/';

    const parameters: Array<{ name: string; in: string; required?: boolean; schema: { type: string } }> = [];
    req.params.forEach((p) => {
      if (p.enabled && p.key) {
        parameters.push({ name: p.key, in: 'query', schema: { type: 'string' } });
      }
    });
    pathParams.forEach((p) => {
      parameters.push({ name: p, in: 'path', required: true, schema: { type: 'string' } });
    });

    const requestBody =
      req.body && req.method !== 'GET' && req.method !== 'HEAD'
        ? {
            content: {
              [req.bodyType === 'json' ? 'application/json' : 'text/plain']: {
                schema: req.bodyType === 'json' ? (() => { try { return { example: JSON.parse(req.body || '{}') }; } catch { return {}; } })() : { type: 'string', example: req.body },
              },
            },
          }
        : undefined;

    const op: Record<string, unknown> = {
      summary: req.name,
      description: req.description || undefined,
      parameters: parameters.length ? parameters : undefined,
      requestBody,
      responses: {
        '200': { description: 'Success' },
        '400': { description: 'Bad Request' },
        '500': { description: 'Server Error' },
      },
    };

    if (!paths[pathKey]) paths[pathKey] = {};
    paths[pathKey][req.method.toLowerCase()] = op;
  }

  const spec = {
    openapi: '3.0.0',
    info: { title: col.name, description: col.description || undefined, version: '1.0.0' },
    servers,
    paths,
  };

  if (format === 'yaml') {
    return toYaml(spec);
  }
  return JSON.stringify(spec, null, 2);
}

function toYaml(obj: unknown, indent = 0): string {
  if (obj === null || obj === undefined) return 'null';
  if (typeof obj === 'number' || typeof obj === 'boolean') return String(obj);
  if (typeof obj === 'string') return /^[\w-]+$/.test(obj) ? obj : `"${obj.replace(/"/g, '\\"')}"`;
  if (Array.isArray(obj)) {
    return obj.map((v) => '  '.repeat(indent) + '- ' + toYaml(v, indent + 1).trim()).join('\n');
  }
  const lines: string[] = [];
  for (const [k, v] of Object.entries(obj)) {
    const val = toYaml(v, indent + 1);
    if (val.includes('\n')) {
      lines.push('  '.repeat(indent) + k + ':\n' + (val.startsWith('-') ? val : val.split('\n').map((l) => '  ' + l).join('\n')));
    } else {
      lines.push('  '.repeat(indent) + k + ': ' + val.trim());
    }
  }
  return lines.join('\n');
}

/** Build example response for request (from history or placeholder) */
function getExampleResponse(req: ApiRequest, historyByRequest?: Map<string, ApiResponse>): string {
  const hist = historyByRequest?.get(req.id);
  if (hist?.data != null) {
    try {
      return typeof hist.data === 'string' ? hist.data : JSON.stringify(hist.data, null, 2);
    } catch {
      return '{}';
    }
  }
  if (req.bodyType === 'json' && req.body) {
    try {
      JSON.parse(req.body);
      return req.body;
    } catch {
      return '{}';
    }
  }
  return '{}';
}

/** Generate static HTML documentation site */
export function collectionToStaticHTML(
  col: Collection,
  historyByRequest?: Map<string, ApiResponse>
): string {
  const requests = getAllRequests(col);
  const httpRequests = requests.filter((r) => (r.requestType ?? 'http') === 'http');

  const navItems: string[] = [];
  col.requests.forEach((r) => {
    const req = requests.find((x) => x.id === r.id);
    if (req) navItems.push(`<a href="#req-${req.id}" class="nav-item">${escapeHtml(req.name)}</a>`);
  });
  col.folders.forEach((f) => {
    navItems.push(`<div class="nav-folder">${escapeHtml(f.name)}</div>`);
    f.requests.forEach((r) => {
      navItems.push(`<a href="#req-${r.id}" class="nav-item indent">${escapeHtml(r.name)}</a>`);
    });
  });

  const sections: string[] = [];
  const renderRequest = (req: ApiRequest) => {
    const { path } = parseUrl(req.url);
    const exampleResp = getExampleResponse(req, historyByRequest);
    const enabledParams = req.params.filter((p) => p.enabled && p.key);
    const enabledHeaders = req.headers.filter((h) => h.enabled && h.key);

    return `
    <section id="req-${req.id}" class="endpoint">
      <div class="method-badge ${(req.method || 'GET').toLowerCase()}">${req.method}</div>
      <h2>${escapeHtml(req.name)}</h2>
      <div class="path"><code>${escapeHtml(path || req.url)}</code></div>
      ${req.description ? `<div class="description prose">${mdToHtml(req.description)}</div>` : ''}
      ${enabledParams.length ? `
      <h4>Query Parameters</h4>
      <table><thead><tr><th>Name</th><th>Value</th></tr></thead><tbody>
        ${enabledParams.map((p) => `<tr><td><code>${escapeHtml(p.key)}</code></td><td>${escapeHtml(p.value)}</td></tr>`).join('')}
      </tbody></table>` : ''}
      ${enabledHeaders.length ? `
      <h4>Headers</h4>
      <table><thead><tr><th>Name</th><th>Value</th></tr></thead><tbody>
        ${enabledHeaders.map((h) => `<tr><td><code>${escapeHtml(h.key)}</code></td><td>${escapeHtml(h.value)}</td></tr>`).join('')}
      </tbody></table>` : ''}
      ${req.body && req.method !== 'GET' && req.method !== 'HEAD' ? `
      <h4>Request Body</h4>
      <pre><code>${escapeHtml(req.body)}</code></pre>` : ''}
      <h4>Example Response</h4>
      <pre><code>${escapeHtml(exampleResp)}</code></pre>
    </section>`;
  };

  col.requests.forEach((r) => {
    const req = httpRequests.find((x) => x.id === r.id);
    if (req) sections.push(renderRequest(req));
  });
  col.folders.forEach((f) => {
    f.requests.forEach((r) => {
      const req = httpRequests.find((x) => x.id === r.id);
      if (req) sections.push(renderRequest(req));
    });
  });

  const collectionDesc = col.description ? mdToHtml(col.description) : '';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(col.name)} - API Documentation</title>
  <style>
    *{box-sizing:border-box;margin:0;padding:0}
    body{font-family:system-ui,-apple-system,sans-serif;line-height:1.6;color:#1a1a1a;display:flex;min-height:100vh}
    .sidebar{width:260px;background:#f5f5f5;padding:1rem;overflow-y:auto;border-right:1px solid #e0e0e0}
    .sidebar h3{margin-bottom:0.75rem;font-size:1rem}
    .nav-item{display:block;padding:0.4rem 0;color:#333;text-decoration:none;font-size:0.9rem}
    .nav-item:hover{color:#f24f1c}
    .nav-item.indent{padding-left:1rem}
    .nav-folder{margin-top:0.5rem;font-weight:600;font-size:0.85rem}
    .main{flex:1;padding:2rem;max-width:800px}
    .endpoint{margin-bottom:2.5rem;padding-bottom:2rem;border-bottom:1px solid #e0e0e0}
    .endpoint h2{margin-bottom:0.5rem;font-size:1.25rem}
    .method-badge{display:inline-block;padding:0.2rem 0.5rem;border-radius:4px;font-size:0.75rem;font-weight:600;margin-right:0.5rem}
    .get{background:#e3f2fd;color:#1976d2}
    .post{background:#e8f5e9;color:#388e3c}
    .put{background:#fff3e0;color:#f57c00}
    .patch{background:#fce4ec;color:#c2185b}
    .delete{background:#ffebee;color:#d32f2f}
    .path{margin:0.5rem 0;font-family:monospace;font-size:0.95rem}
    .description{margin:0.75rem 0}
    .prose h4{font-size:0.9rem;margin-top:1rem}
    table{border-collapse:collapse;width:100%;margin:0.5rem 0}
    th,td{border:1px solid #e0e0e0;padding:0.5rem;text-align:left}
    th{background:#f5f5f5;font-size:0.85rem}
    pre{background:#f5f5f5;padding:1rem;border-radius:6px;overflow-x:auto;font-size:0.85rem}
    code{font-family:monospace}
  </style>
</head>
<body>
  <aside class="sidebar">
    <h3>${escapeHtml(col.name)}</h3>
    ${navItems.join('\n')}
  </aside>
  <main class="main">
    <h1>${escapeHtml(col.name)}</h1>
    ${collectionDesc ? `<div class="description prose">${collectionDesc}</div>` : ''}
    ${sections.join('\n')}
  </main>
</body>
</html>`;
}
