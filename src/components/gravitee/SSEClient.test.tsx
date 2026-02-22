import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SSEClient } from './SSEClient';
import type { ApiRequest } from '@/types/api';

const mockRequest: ApiRequest = {
  id: 'req-1',
  name: 'SSE Test',
  method: 'GET',
  url: 'https://example.com/events',
  params: [],
  headers: [],
  body: '',
  bodyType: 'none',
  formData: [],
};

describe('SSEClient', () => {
  it('renders URL input and Connect button when disconnected', () => {
    render(
      <SSEClient
        request={mockRequest}
        setRequest={() => {}}
        activeEnvId={null}
        environments={[]}
        globalVars={[]}
      />
    );
    expect(screen.getByPlaceholderText(/https:\/\/example\.com\/events/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /connect/i })).toBeInTheDocument();
    expect(screen.getByText(/disconnected/i)).toBeInTheDocument();
  });

  it('shows Reconnect on disconnect checkbox', () => {
    render(
      <SSEClient
        request={mockRequest}
        setRequest={() => {}}
        activeEnvId={null}
        environments={[]}
        globalVars={[]}
      />
    );
    expect(screen.getByText(/reconnect on disconnect/i)).toBeInTheDocument();
  });

  it('shows filter by event input', () => {
    render(
      <SSEClient
        request={mockRequest}
        setRequest={() => {}}
        activeEnvId={null}
        environments={[]}
        globalVars={[]}
      />
    );
    expect(screen.getByPlaceholderText(/e\.g\. message/i)).toBeInTheDocument();
  });
});
