import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AIClient } from './AIClient';
import type { ApiRequest } from '@/types/api';

vi.mock('@/lib/embeddingsClient', () => ({
  createEmbeddings: vi.fn(),
}));
vi.mock('@/lib/imageClient', () => ({
  createImage: vi.fn(),
}));

const mockRequest: ApiRequest = {
  id: 'req-1',
  name: 'AI Test',
  method: 'GET',
  url: '',
  params: [],
  headers: [],
  body: '',
  bodyType: 'none',
  formData: [],
  requestType: 'ai',
  aiSubType: 'embeddings',
  aiModel: 'text-embedding-3-small',
};

describe('AIClient', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders capability selector and Embeddings / Image tabs', () => {
    render(
      <AIClient
        request={mockRequest}
        setRequest={() => {}}
        setResponse={() => {}}
        activeEnvId={null}
        environments={[]}
        globalVars={[]}
      />
    );
    expect(screen.getByText('Capability')).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Embeddings' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Image' })).toBeInTheDocument();
  });

  it('shows Embeddings model and input when Embeddings selected', () => {
    render(
      <AIClient
        request={mockRequest}
        setRequest={() => {}}
        setResponse={() => {}}
        activeEnvId={null}
        environments={[]}
        globalVars={[]}
      />
    );
    expect(screen.getByPlaceholderText(/enter text to embed/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /run/i })).toBeInTheDocument();
  });

  it('shows OPENAI_API_KEY hint when key not set', () => {
    render(
      <AIClient
        request={mockRequest}
        setRequest={() => {}}
        setResponse={() => {}}
        activeEnvId={null}
        environments={[]}
        globalVars={[]}
      />
    );
    expect(screen.getByText(/OPENAI_API_KEY/i)).toBeInTheDocument();
  });
});
