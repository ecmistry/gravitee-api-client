/**
 * Phase 5 integration tests
 * Verifies Phase 5 features: Collection Runner
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

describe('Phase 5 - Index page', () => {
  beforeEach(() => {
    localStorageMock.clear();
  });

  it('renders Run Collection button in top bar', () => {
    render(<BrowserRouter><Index /></BrowserRouter>);
    expect(screen.getByRole('button', { name: /run collection/i })).toBeInTheDocument();
  });

  it('opens Collection Runner dialog when Run Collection clicked', async () => {
    const user = (await import('@testing-library/user-event')).default.setup();
    render(<BrowserRouter><Index /></BrowserRouter>);
    await user.click(screen.getByRole('button', { name: /run collection/i }));
    expect(screen.getByRole('dialog', { name: /collection runner/i })).toBeInTheDocument();
  });
});
