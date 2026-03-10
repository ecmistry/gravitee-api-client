import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { LLMClient } from './LLMClient';
import type { ApiRequest } from '@/types/api';

beforeEach(() => {
  global.ResizeObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  }));
});

vi.mock('@/lib/llmClient', () => ({
  createChatCompletion: vi.fn(),
  createChatCompletionStream: vi.fn(),
}));

const mockRequest: ApiRequest = {
  id: 'req-1',
  name: 'LLM Test',
  method: 'GET',
  url: '',
  params: [],
  headers: [],
  body: '',
  bodyType: 'none',
  formData: [],
  requestType: 'llm',
  llmProvider: 'openai',
  llmModel: 'gpt-4o-mini',
};

describe('LLMClient', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders provider and model selectors', () => {
    render(
      <LLMClient
        request={mockRequest}
        setRequest={() => {}}
        setResponse={() => {}}
        activeEnvId={null}
        environments={[]}
        globalVars={[]}
      />
    );
    expect(screen.getByText('Provider')).toBeInTheDocument();
    expect(screen.getByText('Model')).toBeInTheDocument();
  });

  it('renders Send button and prompt tabs', () => {
    render(
      <LLMClient
        request={mockRequest}
        setRequest={() => {}}
        setResponse={() => {}}
        activeEnvId={null}
        environments={[]}
        globalVars={[]}
      />
    );
    expect(screen.getByRole('button', { name: /send/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Prompt' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Response' })).toBeInTheDocument();
  });

  it('shows API key hint when key is not set', () => {
    render(
      <LLMClient
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
