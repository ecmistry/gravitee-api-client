/**
 * Phase 13 integration tests
 * Verifies MCP, LLM, and AI request types
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { WorkspaceProvider } from '@/contexts/WorkspaceContext';
import Index from './Index';

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter><WorkspaceProvider>{children}</WorkspaceProvider></BrowserRouter>
);

beforeEach(() => {
  (global as unknown as { ResizeObserver: unknown }).ResizeObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  }));
});

const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => { store[key] = value; },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { store = {}; },
  };
})();
Object.defineProperty(global, 'localStorage', { value: localStorageMock });

describe('Phase 13 - MCP, LLM, AI request types', () => {
  beforeEach(() => {
    localStorageMock.clear();
  });

  it('renders MCP, LLM, and AI type selectors', () => {
    render(<TestWrapper><Index /></TestWrapper>);
    expect(screen.getByRole('button', { name: 'MCP' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'LLM' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'AI' })).toBeInTheDocument();
  });

  it('shows MCP client when MCP type selected', async () => {
    const user = (await import('@testing-library/user-event')).default.setup();
    render(<TestWrapper><Index /></TestWrapper>);
    await user.click(screen.getByRole('button', { name: 'MCP' }));
    expect(screen.getByRole('button', { name: /list tools/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /run tool/i })).toBeInTheDocument();
  });

  it('shows LLM client when LLM type selected', async () => {
    const user = (await import('@testing-library/user-event')).default.setup();
    render(<TestWrapper><Index /></TestWrapper>);
    await user.click(screen.getByRole('button', { name: 'LLM' }));
    expect(screen.getByRole('button', { name: /send/i })).toBeInTheDocument();
  });

  it('shows AI client when AI type selected', async () => {
    const user = (await import('@testing-library/user-event')).default.setup();
    render(<TestWrapper><Index /></TestWrapper>);
    await user.click(screen.getByRole('button', { name: 'AI' }));
    expect(screen.getByRole('tab', { name: 'Embeddings' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Image' })).toBeInTheDocument();
  });
});
