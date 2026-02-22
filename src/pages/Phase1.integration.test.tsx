/**
 * Phase 1 integration tests
 * Verifies Phase 1 features are wired up correctly
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Index from './Index';

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
    render(<BrowserRouter><Index /></BrowserRouter>);
    expect(screen.getByText('Gravitee')).toBeInTheDocument();
    expect(screen.getByText('API Client')).toBeInTheDocument();
  });

  it('renders Request Builder with method selector (GET)', () => {
    render(<BrowserRouter><Index /></BrowserRouter>);
    expect(screen.getByText('GET')).toBeInTheDocument();
  });

  it('renders URL input', () => {
    render(<BrowserRouter><Index /></BrowserRouter>);
    expect(screen.getByPlaceholderText(/api\.example\.com/)).toBeInTheDocument();
  });

  it('renders Send and Save buttons', () => {
    render(<BrowserRouter><Index /></BrowserRouter>);
    expect(screen.getByRole('button', { name: /send/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument();
  });

  it('renders Params, Headers, Body tabs', () => {
    render(<BrowserRouter><Index /></BrowserRouter>);
    expect(screen.getByRole('tab', { name: /params/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /headers/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /body/i })).toBeInTheDocument();
  });

  it('renders New Collection button in sidebar', () => {
    render(<BrowserRouter><Index /></BrowserRouter>);
    expect(screen.getByRole('button', { name: /new collection/i })).toBeInTheDocument();
  });

  it('renders History section', () => {
    render(<BrowserRouter><Index /></BrowserRouter>);
    expect(screen.getByText(/history/i)).toBeInTheDocument();
  });

  it('shows request tabs', () => {
    render(<BrowserRouter><Index /></BrowserRouter>);
    expect(screen.getByText('Untitled Request').closest('div')).toBeInTheDocument();
  });
});
