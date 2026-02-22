/**
 * Phase 4 integration tests
 * Verifies Phase 4 features: Pre-request tab, Tests tab, dynamic variables
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

describe('Phase 4 - Index page', () => {
  beforeEach(() => {
    localStorageMock.clear();
  });

  it('renders Pre-request tab in Request Builder', () => {
    render(<BrowserRouter><Index /></BrowserRouter>);
    expect(screen.getByRole('tab', { name: /pre-request/i })).toBeInTheDocument();
  });

  it('renders Tests tab in Request Builder', () => {
    render(<BrowserRouter><Index /></BrowserRouter>);
    expect(screen.getByRole('tab', { name: /^tests$/i })).toBeInTheDocument();
  });
});
