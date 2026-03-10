import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { McpClient } from './McpClient';
import type { ApiRequest } from '@/types/api';

vi.mock('@/lib/mcpClient', () => ({
  listToolsStdio: vi.fn(),
  callToolStdio: vi.fn(),
}));

const mockRequest: ApiRequest = {
  id: 'req-1',
  name: 'MCP Test',
  method: 'GET',
  url: '',
  params: [],
  headers: [],
  body: '',
  bodyType: 'none',
  formData: [],
  requestType: 'mcp',
  mcpTransport: 'stdio',
  mcpCommand: 'npx',
  mcpArgs: '[]',
};

describe('McpClient', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders transport selector and stdio command/args inputs', () => {
    render(
      <McpClient
        request={mockRequest}
        setRequest={() => {}}
        setResponse={() => {}}
        activeEnvId={null}
        environments={[]}
        globalVars={[]}
      />
    );
    expect(screen.getByPlaceholderText(/command/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /list tools/i })).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/\{"path"/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /run tool/i })).toBeInTheDocument();
  });

  it('shows Tools sidebar with hint', () => {
    render(
      <McpClient
        request={mockRequest}
        setRequest={() => {}}
        setResponse={() => {}}
        activeEnvId={null}
        environments={[]}
        globalVars={[]}
      />
    );
    expect(screen.getByText(/list tools to see available tools/i)).toBeInTheDocument();
  });
});
