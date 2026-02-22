/**
 * Phase 7 integration tests
 * Verifies Phase 7 features: GraphQL request type
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Index from './Index';

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

describe('Phase 7 - Index page', () => {
  beforeEach(() => {
    localStorageMock.clear();
  });

  it('renders GraphQL type selector', () => {
    render(<BrowserRouter><Index /></BrowserRouter>);
    expect(screen.getByRole('button', { name: 'GraphQL' })).toBeInTheDocument();
  });

  it('shows GraphQL client when GraphQL type selected', async () => {
    const user = (await import('@testing-library/user-event')).default.setup();
    render(<BrowserRouter><Index /></BrowserRouter>);
    await user.click(screen.getByRole('button', { name: 'GraphQL' }));
    expect(screen.getByPlaceholderText(/https:\/\/api\.example\.com\/graphql/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /execute/i })).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: /schema/i }).length).toBeGreaterThanOrEqual(1);
  });
});
