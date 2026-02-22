import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ApiDocs } from './ApiDocs';
import type { Collection } from '@/types/api';

const mockCollections: Collection[] = [
  {
    id: 'col-1',
    name: 'Test Collection',
    folders: [],
    requests: [
      {
        id: 'req-1',
        name: 'Get Users',
        method: 'GET',
        url: 'https://api.example.com/users',
        params: [],
        headers: [],
        body: '',
        bodyType: 'none',
        formData: [],
      },
    ],
  },
];

describe('ApiDocs', () => {
  beforeEach(() => {
    vi.stubGlobal('localStorage', {
      getItem: vi.fn(() => '[]'),
      setItem: vi.fn(),
      removeItem: vi.fn(),
    });
  });

  it('renders dialog with title', () => {
    render(
      <ApiDocs open={true} onOpenChange={() => {}} collections={mockCollections} />
    );
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /api documentation/i })).toBeInTheDocument();
  });

  it('shows Export HTML and OpenAPI buttons', () => {
    render(
      <ApiDocs open={true} onOpenChange={() => {}} collections={mockCollections} />
    );
    expect(screen.getByRole('button', { name: /export html/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /openapi json/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /openapi yaml/i })).toBeInTheDocument();
  });

  it('shows collection selector', () => {
    render(
      <ApiDocs open={true} onOpenChange={() => {}} collections={mockCollections} />
    );
    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });
});
