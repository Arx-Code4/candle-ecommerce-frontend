import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useSearchParams } from 'react-router-dom';
import FilterBar from '@/components/common/FilterBar';

vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>();
  return { ...actual, useSearchParams: vi.fn() };
});

describe('FilterBar', () => {
  const setSearchParams = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  function mockParams(query: string) {
    vi.mocked(useSearchParams).mockReturnValue([
      new URLSearchParams(query),
      setSearchParams,
    ] as unknown as ReturnType<typeof useSearchParams>);
  }

  it('reads current scent/size from URL', () => {
    mockParams('scent=vanilla');
    render(<FilterBar />);
    const vanilla = screen.getByRole('button', { name: /vanilla/i });
    expect(vanilla).toHaveAttribute('aria-pressed', 'true');
  });

  it('selecting a new filter value merges into search params and resets page', async () => {
    mockParams('scent=vanilla&page=3');
    const user = userEvent.setup();
    render(<FilterBar />);

    await user.click(screen.getByRole('button', { name: /large/i }));

    expect(setSearchParams).toHaveBeenCalled();
    const next = setSearchParams.mock.calls[0][0] as URLSearchParams | Record<string, string>;
    const params =
      next instanceof URLSearchParams ? next : new URLSearchParams(next as Record<string, string>);
    expect(params.get('size')).toBe('large');
    expect(params.get('page')).toBe('1');
    expect(params.get('scent')).toBe('vanilla');
  });

  it('selecting the already-active filter value toggles it off', async () => {
    mockParams('scent=vanilla');
    const user = userEvent.setup();
    render(<FilterBar />);

    await user.click(screen.getByRole('button', { name: /vanilla/i }));

    expect(setSearchParams).toHaveBeenCalled();
    const next = setSearchParams.mock.calls[0][0] as URLSearchParams | Record<string, string>;
    const params =
      next instanceof URLSearchParams ? next : new URLSearchParams(next as Record<string, string>);
    expect(params.get('scent')).toBeNull();
  });

  it('clear filters removes scent/size but not page', async () => {
    mockParams('scent=vanilla&size=large&page=2');
    const user = userEvent.setup();
    render(<FilterBar />);

    await user.click(screen.getByRole('button', { name: /clear filters/i }));

    expect(setSearchParams).toHaveBeenCalled();
    const next = setSearchParams.mock.calls[0][0] as URLSearchParams | Record<string, string>;
    const params =
      next instanceof URLSearchParams ? next : new URLSearchParams(next as Record<string, string>);
    expect(params.get('scent')).toBeNull();
    expect(params.get('size')).toBeNull();
    expect(params.get('page')).toBe('2');
  });
});
