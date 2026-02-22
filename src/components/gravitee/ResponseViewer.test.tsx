import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
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

  it('shows Tests tab when response present', () => {
    const response: ApiResponse = {
      status: 200,
      statusText: 'OK',
      headers: {},
      data: {},
      time: 0,
      size: 0
    };
    render(<ResponseViewer response={response} loading={false} />);
    expect(screen.getByRole('tab', { name: /tests/i })).toBeInTheDocument();
  });

  it('shows empty state in Tests tab when no results', async () => {
    const user = userEvent.setup();
    const response: ApiResponse = {
      status: 200,
      statusText: 'OK',
      headers: {},
      data: {},
      time: 0,
      size: 0
    };
    render(<ResponseViewer response={response} loading={false} testResults={[]} />);
    await user.click(screen.getByRole('tab', { name: /tests/i }));
    expect(screen.getByText(/Add test scripts in the Tests tab/)).toBeInTheDocument();
  });

  it('shows pass/fail for test results', async () => {
    const user = userEvent.setup();
    const response: ApiResponse = {
      status: 200,
      statusText: 'OK',
      headers: {},
      data: {},
      time: 0,
      size: 0
    };
    const testResults = [
      { name: 'Status is 200', passed: true },
      { name: 'Has body', passed: false, error: 'Expected 200 to equal 404' },
    ];
    render(<ResponseViewer response={response} loading={false} testResults={testResults} />);
    await user.click(screen.getByRole('tab', { name: /tests/i }));
    expect(screen.getByText('Status is 200')).toBeInTheDocument();
    expect(screen.getByText('Has body')).toBeInTheDocument();
    expect(screen.getByText(/Expected 200 to equal 404/)).toBeInTheDocument();
  });
});
