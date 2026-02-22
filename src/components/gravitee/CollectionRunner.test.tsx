import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CollectionRunner } from './CollectionRunner';
import type { Collection } from '@/types/api';

const mockCollections: Collection[] = [
  {
    id: 'col-1',
    name: 'Test Collection',
    folders: [{ id: 'f1', name: 'Folder 1', requests: [] }],
    requests: [
      {
        id: 'req-1',
        name: 'Get Users',
        method: 'GET',
        url: 'https://api.test/users',
        params: [],
        headers: [],
        body: '',
        bodyType: 'none',
        formData: [],
      },
    ],
  },
];

describe('CollectionRunner', () => {
  it('renders dialog with configuration when open', () => {
    render(
      <CollectionRunner
        open={true}
        onOpenChange={() => {}}
        collections={mockCollections}
        activeEnvId={null}
        environments={[]}
        globalVars={[]}
      />
    );
    expect(screen.getByRole('dialog', { name: /collection runner/i })).toBeInTheDocument();
    expect(screen.getByText(/collection \/ folder/i)).toBeInTheDocument();
    expect(screen.getByText(/iterations/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /run/i })).toBeInTheDocument();
  });

  it('does not render when closed', () => {
    render(
      <CollectionRunner
        open={false}
        onOpenChange={() => {}}
        collections={mockCollections}
        activeEnvId={null}
        environments={[]}
        globalVars={[]}
      />
    );
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});
