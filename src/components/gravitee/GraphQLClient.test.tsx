import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { GraphQLClient } from './GraphQLClient';
import type { ApiRequest } from '@/types/api';

vi.mock('@/lib/graphql', () => ({
  introspectSchema: vi.fn(),
  executeGraphQL: vi.fn(),
  formatGraphQL: vi.fn((q: string) => q),
  getExplorableTypes: vi.fn(() => []),
}));

const mockRequest: ApiRequest = {
  id: 'req-1',
  name: 'GraphQL Test',
  method: 'GET',
  url: 'https://api.example.com/graphql',
  params: [],
  headers: [],
  body: '',
  bodyType: 'none',
  formData: [],
};

describe('GraphQLClient', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('renders URL input with GraphQL placeholder', () => {
    render(
      <GraphQLClient
        request={mockRequest}
        setRequest={() => {}}
        activeEnvId={null}
        environments={[]}
        globalVars={[]}
      />
    );
    expect(screen.getByPlaceholderText(/https:\/\/api\.example\.com\/graphql/i)).toBeInTheDocument();
  });

  it('renders Schema and Execute buttons', () => {
    render(
      <GraphQLClient
        request={mockRequest}
        setRequest={() => {}}
        activeEnvId={null}
        environments={[]}
        globalVars={[]}
      />
    );
    expect(screen.getAllByRole('button', { name: /schema/i }).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByRole('button', { name: /execute/i })).toBeInTheDocument();
  });

  it('shows Query tab with query editor and variables panel', () => {
    render(
      <GraphQLClient
        request={mockRequest}
        setRequest={() => {}}
        activeEnvId={null}
        environments={[]}
        globalVars={[]}
      />
    );
    expect(screen.getByRole('tab', { name: 'Query' })).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/operation name/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /format/i })).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/\{"id": "1"\}/i)).toBeInTheDocument();
  });

  it('shows Response tab', () => {
    render(
      <GraphQLClient
        request={mockRequest}
        setRequest={() => {}}
        activeEnvId={null}
        environments={[]}
        globalVars={[]}
      />
    );
    expect(screen.getByRole('tab', { name: /response/i })).toBeInTheDocument();
  });

  it('shows Schema sidebar with hint to fetch', () => {
    render(
      <GraphQLClient
        request={mockRequest}
        setRequest={() => {}}
        activeEnvId={null}
        environments={[]}
        globalVars={[]}
      />
    );
    expect(screen.getByText(/click schema to fetch/i)).toBeInTheDocument();
  });
});
