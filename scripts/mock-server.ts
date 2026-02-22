/**
 * Standalone mock server - run with: npx tsx scripts/mock-server.ts
 * Accepts config via POST /__mock/load; serves mocked routes; POST /__mock/stop to exit.
 */
import { createServer, type IncomingMessage, type ServerResponse } from 'node:http';
import type { MockServerConfig, MockRoute, MockExample } from '../src/types/mock';
import { findMatchingRoute } from '../src/lib/mockServer';

const CONTROL_PREFIX = '/__mock';
const DEFAULT_PORT = 3010;

let config: MockServerConfig | null = null;
const sequentialIndex = new Map<string, number>();

function corsHeaders(): Record<string, string> {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };
}

function send(res: ServerResponse, status: number, body: string, headers: Record<string, string> = {}) {
  const h = { ...corsHeaders(), ...headers };
  res.writeHead(status, h);
  res.end(body);
}

function sendJson(res: ServerResponse, status: number, data: unknown) {
  send(res, status, JSON.stringify(data), { 'Content-Type': 'application/json' });
}

function buildHeadersFromExample(ex: MockExample): Record<string, string> {
  const out: Record<string, string> = {};
  for (const h of ex.headers ?? []) {
    if (h.enabled !== false && h.key) out[h.key] = h.value;
  }
  return out;
}

async function handleRequest(req: IncomingMessage, res: ServerResponse) {
  if (req.method === 'OPTIONS') {
    send(res, 204, '');
    return;
  }

  const url = req.url ?? '/';
  const [pathname, search] = url.includes('?') ? url.split('?', 2) : [url, ''];

  if (pathname.startsWith(CONTROL_PREFIX)) {
    if (pathname === `${CONTROL_PREFIX}/load` && req.method === 'POST') {
      let body = '';
      for await (const chunk of req) body += chunk;
      try {
        config = JSON.parse(body) as MockServerConfig;
        sequentialIndex.clear();
        sendJson(res, 200, { ok: true, routes: config.routes?.length ?? 0 });
      } catch (e) {
        sendJson(res, 400, { error: String(e) });
      }
      return;
    }
    if (pathname === `${CONTROL_PREFIX}/stop` && req.method === 'POST') {
      sendJson(res, 200, { ok: true });
      process.exit(0);
      return;
    }
    if (pathname === `${CONTROL_PREFIX}/status`) {
      sendJson(res, 200, {
        running: true,
        port: config?.port ?? DEFAULT_PORT,
        routes: config?.routes?.length ?? 0,
      });
      return;
    }
  }

  if (!config?.routes?.length) {
    sendJson(res, 404, { error: 'No mock routes configured. POST config to /__mock/load' });
    return;
  }

  const method = req.method ?? 'GET';
  const match = findMatchingRoute(config.routes, method, pathname, search, sequentialIndex);

  if (!match) {
    sendJson(res, 404, { error: `No mock for ${method} ${pathname}` });
    return;
  }

  const { route, example } = match;
  if (route.delayMs && route.delayMs > 0) {
    await new Promise((r) => setTimeout(r, route.delayMs));
  }

  const headers = buildHeadersFromExample(example);
  const status = example.status || 200;
  const body = example.body ?? '';
  send(res, status, body, headers);
}

const port = parseInt(process.env.MOCK_PORT ?? String(DEFAULT_PORT), 10);
const server = createServer(handleRequest);
server.listen(port, () => {
  console.log(`Mock server on http://localhost:${port}`);
  console.log('POST config to /__mock/load, POST /__mock/stop to exit');
});
