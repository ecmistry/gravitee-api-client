/**
 * Phase 1 integration tests
 * Verifies Phase 1 features are wired up correctly
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { WorkspaceProvider } from '@/contexts/WorkspaceContext';
import Index from './Index';

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter><WorkspaceProvider>{children}</WorkspaceProvider></BrowserRouter>
);

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => { store[key] = value; },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { store = {}; }
  };
})();
Object.defineProperty(global, 'localStorage', { value: localStorageMock });

describe('Phase 1 - Index page', () => {
  beforeEach(() => {
    localStorageMock.clear();
  });

  it('renders Gravitee API Client header', () => {
    render(<TestWrapper><Index /></TestWrapper>);
    expect(screen.getByText('Gravitee')).toBeInTheDocument();
    expect(screen.getByText('API Client')).toBeInTheDocument();
  });

  it('renders Request Builder with method selector (GET)', () => {
    render(<TestWrapper><Index /></TestWrapper>);
    expect(screen.getByText('GET')).toBeInTheDocument();
  });

  it('renders URL input', () => {
    render(<TestWrapper><Index /></TestWrapper>);
    expect(screen.getByPlaceholderText(/api\.example\.com/)).toBeInTheDocument();
  });

  it('renders Send and Save buttons', () => {
    render(<TestWrapper><Index /></TestWrapper>);
    expect(screen.getByRole('button', { name: /send/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument();
  });

  it('renders Params, Headers, Body tabs', () => {
    render(<TestWrapper><Index /></TestWrapper>);
    expect(screen.getByRole('tab', { name: /params/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /headers/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /body/i })).toBeInTheDocument();
  });

  it('renders New Collection button in sidebar', () => {
    render(<TestWrapper><Index /></TestWrapper>);
    expect(screen.getByRole('button', { name: /new collection/i })).toBeInTheDocument();
  });

  it('renders History section', () => {
    render(<TestWrapper><Index /></TestWrapper>);
    expect(screen.getByText(/history/i)).toBeInTheDocument();
  });

  it('shows request tabs', () => {
    render(<TestWrapper><Index /></TestWrapper>);
    expect(screen.getByText('Untitled Request').closest('div')).toBeInTheDocument();
  });
});
