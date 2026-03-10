#!/usr/bin/env node
/**
 * MCP bridge: runs in Node only. Spawns MCP server via stdio, runs list_tools or call_tool, returns result.
 * Used by Vite middleware and serve.mjs so the browser can test stdio MCP servers.
 */
export async function handleMcpBridge(bodyStr) {
  let body;
  try {
    body = JSON.parse(bodyStr);
  } catch {
    return { ok: false, error: 'Invalid JSON body' };
  }
  const { action, transport, command, args, toolName, toolArgs } = body;
  if (transport !== 'stdio') {
    return { ok: false, error: 'Only transport "stdio" is supported by the bridge' };
  }
  if (!command || typeof command !== 'string') {
    return { ok: false, error: 'Missing or invalid "command" (e.g. npx)' };
  }
  const serverArgs = Array.isArray(args) ? args : [];
  if (action === 'list_tools') {
    return runStdioListTools(command, serverArgs);
  }
  if (action === 'call_tool') {
    if (!toolName || typeof toolName !== 'string') {
      return { ok: false, error: 'Missing or invalid "toolName" for call_tool' };
    }
    const parsedArgs = typeof toolArgs === 'string' ? parseJsonSafe(toolArgs) : toolArgs;
    return runStdioCallTool(command, serverArgs, toolName, parsedArgs ?? {});
  }
  return { ok: false, error: 'Unknown action: use list_tools or call_tool' };
}

function parseJsonSafe(str) {
  try {
    return JSON.parse(str);
  } catch {
    return null;
  }
}

async function runStdioListTools(command, serverArgs) {
  const { Client } = await import('@modelcontextprotocol/sdk/client');
  const { StdioClientTransport } = await import('@modelcontextprotocol/sdk/client/stdio');
  const transport = new StdioClientTransport({
    command,
    args: serverArgs,
  });
  const client = new Client({ name: 'gravitee-mcp-bridge', version: '1.0.0' });
  try {
    await client.connect(transport);
    const result = await client.listTools();
    return { ok: true, tools: result.tools };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : String(err),
    };
  } finally {
    await transport.close();
  }
}

async function runStdioCallTool(command, serverArgs, toolName, toolArguments) {
  const { Client } = await import('@modelcontextprotocol/sdk/client');
  const { StdioClientTransport } = await import('@modelcontextprotocol/sdk/client/stdio');
  const transport = new StdioClientTransport({
    command,
    args: serverArgs,
  });
  const client = new Client({ name: 'gravitee-mcp-bridge', version: '1.0.0' });
  try {
    await client.connect(transport);
    const result = await client.callTool({ name: toolName, arguments: toolArguments });
    return {
      ok: true,
      content: result.content,
      isError: result.isError,
      _raw: result,
    };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : String(err),
    };
  } finally {
    await transport.close();
  }
}
