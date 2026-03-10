import { describe, it, expect, vi, beforeEach } from 'vitest';
import { listToolsStdio, callToolStdio } from './mcpClient';

describe('mcpClient', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
    vi.stubGlobal('window', { location: { origin: 'http://localhost:3000' } });
  });

  it('listToolsStdio sends POST to /mcp-bridge with action list_tools', async () => {
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ ok: true, tools: [{ name: 'foo', description: 'Foo tool' }] }),
    } as Response);

    const result = await listToolsStdio('npx', ['-y', 'some-server']);

    expect(mockFetch).toHaveBeenCalledWith(
      'http://localhost:3000/mcp-bridge',
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'list_tools',
          transport: 'stdio',
          command: 'npx',
          args: ['-y', 'some-server'],
        }),
      })
    );
    expect(result).toEqual({ ok: true, tools: [{ name: 'foo', description: 'Foo tool' }] });
  });

  it('listToolsStdio returns error when bridge returns ok: false', async () => {
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ ok: false, error: 'Server not found' }),
    } as Response);

    const result = await listToolsStdio('npx', []);

    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toBe('Server not found');
  });

  it('callToolStdio sends POST with toolName and toolArgs', async () => {
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ ok: true, content: [{ type: 'text', text: 'done' }] }),
    } as Response);

    const result = await callToolStdio('npx', ['-y', 'server'], 'my_tool', { path: '/tmp' });

    expect(mockFetch).toHaveBeenCalledWith(
      'http://localhost:3000/mcp-bridge',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({
          action: 'call_tool',
          transport: 'stdio',
          command: 'npx',
          args: ['-y', 'server'],
          toolName: 'my_tool',
          toolArgs: { path: '/tmp' },
        }),
      })
    );
    expect(result.ok).toBe(true);
  });
});
