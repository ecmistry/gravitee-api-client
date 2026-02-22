/**
 * Phase 11 integration tests
 * Verifies Phase 11 features: Monitoring & Scheduled Runs
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

describe('Phase 11 - Index page', () => {
  beforeEach(() => {
    localStorageMock.clear();
  });

  it('renders Monitoring button in top bar', () => {
    render(<TestWrapper><Index /></TestWrapper>);
    expect(screen.getByRole('button', { name: /monitoring/i })).toBeInTheDocument();
  });

  it('opens Monitoring sheet when Monitoring button clicked', async () => {
    const user = (await import('@testing-library/user-event')).default.setup();
    render(<TestWrapper><Index /></TestWrapper>);
    await user.click(screen.getByRole('button', { name: /monitoring/i }));
    expect(screen.getByRole('heading', { name: /monitoring/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /monitors/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /results/i })).toBeInTheDocument();
  });
});
