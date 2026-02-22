/**
 * Phase 2 integration tests
 * Verifies Phase 2 features: collections with folders, environment variables, description
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

describe('Phase 2 - Index page', () => {
  beforeEach(() => {
    localStorageMock.clear();
  });

  it('renders environment selector with No Environment when none configured', () => {
    render(<TestWrapper><Index /></TestWrapper>);
    expect(screen.getByRole('button', { name: /no environment/i })).toBeInTheDocument();
  });

  it('renders Description field in Request Builder', () => {
    render(<TestWrapper><Index /></TestWrapper>);
    expect(screen.getByPlaceholderText(/optional description/i)).toBeInTheDocument();
    expect(screen.getByText('Description')).toBeInTheDocument();
  });

  it('URL placeholder mentions variable syntax', () => {
    render(<TestWrapper><Index /></TestWrapper>);
    const urlInput = screen.getByPlaceholderText(/variableName/i);
    expect(urlInput).toBeInTheDocument();
  });

  it('shows Add folder when collection is expanded', () => {
    render(<TestWrapper><Index /></TestWrapper>);
    expect(screen.getByText('+ Add folder')).toBeInTheDocument();
  });

  it('shows Add request in collection', () => {
    render(<TestWrapper><Index /></TestWrapper>);
    expect(screen.getByText('+ Add request')).toBeInTheDocument();
  });
});
