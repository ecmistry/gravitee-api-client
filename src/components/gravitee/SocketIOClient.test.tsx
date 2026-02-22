import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SocketIOClient } from './SocketIOClient';
import type { ApiRequest } from '@/types/api';

const mockRequest: ApiRequest = {
  id: 'req-1',
  name: 'Socket.IO Test',
  method: 'GET',
  url: 'http://localhost:3000',
  params: [],
  headers: [],
  body: '',
  bodyType: 'none',
  formData: [],
};

describe('SocketIOClient', () => {
  it('renders URL input and Connect button when disconnected', () => {
    render(
      <SocketIOClient
        request={mockRequest}
        setRequest={() => {}}
        activeEnvId={null}
        environments={[]}
        globalVars={[]}
      />
    );
    expect(screen.getByPlaceholderText(/https:\/\/example\.com or http:\/\/localhost/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /connect/i })).toBeInTheDocument();
    expect(screen.getByText(/disconnected/i)).toBeInTheDocument();
  });

  it('shows Emit Event section with event name and payload inputs', () => {
    render(
      <SocketIOClient
        request={mockRequest}
        setRequest={() => {}}
        activeEnvId={null}
        environments={[]}
        globalVars={[]}
      />
    );
    expect(screen.getByPlaceholderText(/event name/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/\{"key": "value"\}/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /emit/i })).toBeInTheDocument();
  });

  it('shows filter events input', () => {
    render(
      <SocketIOClient
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
