/**
 * Browser-callable MCP client. Uses /mcp-bridge for stdio transport (bridge runs in Node).
 * HTTP transport could be added later for MCP servers that expose Streamable HTTP.
 */

const MCP_BRIDGE_PATH = '/mcp-bridge';

export interface McpBridgeListToolsResult {
  ok: true;
  tools: Array<{ name: string; description?: string; inputSchema?: unknown }>;
}

export interface McpBridgeListToolsError {
  ok: false;
  error: string;
}

export type McpBridgeListToolsResponse = McpBridgeListToolsResult | McpBridgeListToolsError;

export interface McpBridgeCallToolResult {
  ok: true;
  content?: Array<{ type: string; text?: string }>;
  isError?: boolean;
  _raw?: unknown;
}

export interface McpBridgeCallToolError {
  ok: false;
  error: string;
}

export type McpBridgeCallToolResponse = McpBridgeCallToolResult | McpBridgeCallToolError;

/**
 * List tools from an MCP server via stdio (uses backend bridge).
 */
export async function listToolsStdio(
  command: string,
  args: string[] = []
): Promise<McpBridgeListToolsResponse> {
  const base = getBaseUrl();
  const res = await fetch(`${base}${MCP_BRIDGE_PATH}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'list_tools',
      transport: 'stdio',
      command,
      args,
    }),
  });
  const data = await res.json();
  if (!res.ok) {
    return { ok: false, error: data?.error ?? res.statusText };
  }
  return data as McpBridgeListToolsResponse;
}

/**
 * Call a tool on an MCP server via stdio (uses backend bridge).
 */
export async function callToolStdio(
  command: string,
  args: string[],
  toolName: string,
  toolArgs: Record<string, unknown> | string
): Promise<McpBridgeCallToolResponse> {
  const body: Record<string, unknown> = {
    action: 'call_tool',
    transport: 'stdio',
    command,
    args,
    toolName,
  };
  body.toolArgs = typeof toolArgs === 'string' ? toolArgs : toolArgs;
  const base = getBaseUrl();
  const res = await fetch(`${base}${MCP_BRIDGE_PATH}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) {
    return { ok: false, error: data?.error ?? res.statusText };
  }
  return data as McpBridgeCallToolResponse;
}

function getBaseUrl(): string {
  if (typeof window !== 'undefined' && window.location?.origin) {
    return window.location.origin;
  }
  return '';
}
