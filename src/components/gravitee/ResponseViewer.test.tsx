import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ResponseViewer } from './ResponseViewer';
import type { ApiResponse } from '@/types/api';

describe('ResponseViewer', () => {
  it('shows empty state when no response', () => {
    render(<ResponseViewer response={null} loading={false} />);
    expect(screen.getByText('No Response Yet')).toBeInTheDocument();
    expect(screen.getByText(/Enter a URL and click Send/)).toBeInTheDocument();
  });

  it('shows loading state', () => {
    render(<ResponseViewer response={null} loading={true} />);
    expect(screen.getByText('Sending request...')).toBeInTheDocument();
  });

  it('shows status, time, size when response present', () => {
    const response: ApiResponse = {
      status: 200,
      statusText: 'OK',
      headers: { 'content-type': 'application/json' },
      data: { foo: 'bar' },
      time: 150,
      size: 256
    };
    render(<ResponseViewer response={response} loading={false} />);
    expect(screen.getByText('200 OK')).toBeInTheDocument();
    expect(screen.getByText('150ms')).toBeInTheDocument();
    expect(screen.getByText(/KB/)).toBeInTheDocument();
  });

  it('shows Body and Headers tabs', () => {
    const response: ApiResponse = {
      status: 200,
      statusText: 'OK',
      headers: {},
      data: {},
      time: 0,
      size: 0
    };
    render(<ResponseViewer response={response} loading={false} />);
    expect(screen.getByRole('tab', { name: /body/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /headers/i })).toBeInTheDocument();
  });

  it('pretty-prints JSON in body', () => {
    const response: ApiResponse = {
      status: 200,
      statusText: 'OK',
      headers: {},
      data: { key: 'value' },
      time: 0,
      size: 0
    };
    render(<ResponseViewer response={response} loading={false} />);
    expect(screen.getByText(/"key":/)).toBeInTheDocument();
    expect(screen.getByText(/"value"/)).toBeInTheDocument();
  });
});
