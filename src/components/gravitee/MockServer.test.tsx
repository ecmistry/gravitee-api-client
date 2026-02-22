import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MockServer } from './MockServer';
import type { Collection } from '@/types/api';

vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false }));

const mockCollections: Collection[] = [
  {
    id: 'col-1',
    name: 'Test Collection',
    folders: [],
    requests: [
      {
        id: 'req-1',
        name: 'Get User',
        method: 'GET',
        url: 'https://api.example.com/users/1',
        params: [],
        headers: [],
        body: '',
        bodyType: 'none',
        formData: [],
      },
    ],
  },
];

describe('MockServer', () => {
  beforeEach(() => {
    vi.mocked(fetch).mockResolvedValue({ ok: false } as Response);
  });

  it('renders dialog with title', () => {
    render(
      <MockServer
        open={true}
        onOpenChange={() => {}}
        collections={mockCollections}
      />
    );
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /mock server/i })).toBeInTheDocument();
  });

  it('shows collection selector and create button', () => {
    render(
      <MockServer
        open={true}
        onOpenChange={() => {}}
        collections={mockCollections}
      />
    );
    expect(screen.getAllByText(/collection/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByRole('button', { name: /create mock from collection/i })).toBeInTheDocument();
  });

  it('shows Apply to server and Stop server buttons', () => {
    render(
      <MockServer
        open={true}
        onOpenChange={() => {}}
        collections={mockCollections}
      />
    );
    expect(screen.getByRole('button', { name: /apply to server/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /stop server/i })).toBeInTheDocument();
  });
});
