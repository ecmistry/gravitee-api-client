/**
 * Phase 10 integration tests
 * Verifies Phase 10 features: Workspaces, Settings sheet, Activity
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

describe('Phase 10 - Index page', () => {
  beforeEach(() => {
    localStorageMock.clear();
  });

  it('renders workspace switcher in sidebar', () => {
    render(<TestWrapper><Index /></TestWrapper>);
    expect(screen.getByRole('button', { name: /personal/i })).toBeInTheDocument();
  });

  it('opens Settings sheet when Settings button clicked', async () => {
    const user = (await import('@testing-library/user-event')).default.setup();
    render(<TestWrapper><Index /></TestWrapper>);
    await user.click(screen.getByRole('button', { name: /settings/i }));
    expect(screen.getByRole('heading', { name: /settings/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /workspaces/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /profile/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /activity/i })).toBeInTheDocument();
  });
});
