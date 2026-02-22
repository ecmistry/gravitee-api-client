/**
 * Phase 6 integration tests
 * Verifies Phase 6 features: WebSocket, SSE, Socket.IO request types
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { WorkspaceProvider } from '@/contexts/WorkspaceContext';
import Index from './Index';

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter><WorkspaceProvider>{children}</WorkspaceProvider></BrowserRouter>
);

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

describe('Phase 6 - Index page', () => {
  beforeEach(() => {
    localStorageMock.clear();
  });

  it('renders HTTP, WebSocket, SSE, and Socket.IO type selectors', () => {
    render(<TestWrapper><Index /></TestWrapper>);
    expect(screen.getByRole('button', { name: 'HTTP' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'WebSocket' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'SSE' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Socket.IO' })).toBeInTheDocument();
  });

  it('shows WebSocket client when WebSocket type selected', async () => {
    const user = (await import('@testing-library/user-event')).default.setup();
    render(<TestWrapper><Index /></TestWrapper>);
    await user.click(screen.getByRole('button', { name: 'WebSocket' }));
    expect(screen.getByPlaceholderText(/ws:\/\/ or wss:\/\/ URL/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /connect/i })).toBeInTheDocument();
  });

  it('shows SSE client when SSE type selected', async () => {
    const user = (await import('@testing-library/user-event')).default.setup();
    render(<TestWrapper><Index /></TestWrapper>);
    await user.click(screen.getByRole('button', { name: 'SSE' }));
    expect(screen.getByPlaceholderText(/https:\/\/example\.com\/events/i)).toBeInTheDocument();
  });

  it('shows Socket.IO client when Socket.IO type selected', async () => {
    const user = (await import('@testing-library/user-event')).default.setup();
    render(<TestWrapper><Index /></TestWrapper>);
    await user.click(screen.getByRole('button', { name: 'Socket.IO' }));
    expect(screen.getByPlaceholderText(/https:\/\/example\.com or http:\/\/localhost/i)).toBeInTheDocument();
  });
});
