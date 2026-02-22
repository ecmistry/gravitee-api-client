/**
 * Phase 8 integration tests
 * Verifies Phase 8 features: Mock Server
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

describe('Phase 8 - Index page', () => {
  beforeEach(() => {
    localStorageMock.clear();
  });

  it('renders Mock Server button in top bar', () => {
    render(<TestWrapper><Index /></TestWrapper>);
    expect(screen.getByRole('button', { name: /mock server/i })).toBeInTheDocument();
  });

  it('opens Mock Server dialog when Mock Server button clicked', async () => {
    const user = (await import('@testing-library/user-event')).default.setup();
    render(<TestWrapper><Index /></TestWrapper>);
    await user.click(screen.getByRole('button', { name: /mock server/i }));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /mock server/i })).toBeInTheDocument();
  });
});
