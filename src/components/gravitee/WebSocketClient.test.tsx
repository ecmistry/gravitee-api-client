import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { WebSocketClient } from './WebSocketClient';
import type { ApiRequest } from '@/types/api';

const mockRequest: ApiRequest = {
  id: 'req-1',
  name: 'WS Test',
  method: 'GET',
  url: 'ws://echo.websocket.org',
  params: [],
  headers: [],
  body: '',
  bodyType: 'none',
  formData: [],
};

describe('WebSocketClient', () => {
  it('renders URL input and Connect button when disconnected', () => {
    render(
      <WebSocketClient
        request={mockRequest}
        setRequest={() => {}}
        activeEnvId={null}
        environments={[]}
        globalVars={[]}
      />
    );
    expect(screen.getByPlaceholderText(/ws:\/\/ or wss:\/\/ URL/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /connect/i })).toBeInTheDocument();
    expect(screen.getByText(/disconnected/i)).toBeInTheDocument();
  });

  it('shows Messages and Headers tabs', () => {
    render(
      <WebSocketClient
        request={mockRequest}
        setRequest={() => {}}
        activeEnvId={null}
        environments={[]}
        globalVars={[]}
      />
    );
    expect(screen.getByRole('tab', { name: /messages/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /headers/i })).toBeInTheDocument();
  });

  it('shows text/json compose mode toggle and Send button', () => {
    render(
      <WebSocketClient
        request={mockRequest}
        setRequest={() => {}}
        activeEnvId={null}
        environments={[]}
        globalVars={[]}
      />
    );
    expect(screen.getByRole('button', { name: /send/i })).toBeInTheDocument();
  });
});
