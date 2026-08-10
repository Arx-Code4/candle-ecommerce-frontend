import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import VariantSelector from '@/components/common/VariantSelector';
import type { ProductVariant } from '@/types';

const gridVariants: ProductVariant[] = [
  { id: 'v1', scent: 'vanilla', size: 'small', stock: 5 },
  { id: 'v2', scent: 'vanilla', size: 'large', stock: 3 },
  { id: 'v3', scent: 'lavender', size: 'small', stock: 2 },
  { id: 'v4', scent: 'lavender', size: 'large', stock: 0 },
];

const incompleteVariants: ProductVariant[] = [
  { id: 'v1', scent: 'vanilla', size: 'small', stock: 5 },
  { id: 'v2', scent: 'vanilla', size: 'large', stock: 3 },
  { id: 'v3', scent: 'lavender', size: 'small', stock: 2 },
];

describe('VariantSelector', () => {
  const onSelect = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders distinct scent and size options', () => {
    render(<VariantSelector variants={gridVariants} onSelect={onSelect} />);
    expect(screen.getByRole('option', { name: /vanilla/i })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: /lavender/i })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: /small/i })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: /large/i })).toBeInTheDocument();
    // Deduplicated: 2 scents + 2 sizes, not one option per variant row
    expect(screen.getAllByRole('option')).toHaveLength(4);
  });

  it('disables a combination with no matching variant', async () => {
    const user = userEvent.setup();
    render(<VariantSelector variants={incompleteVariants} onSelect={onSelect} />);

    await user.click(screen.getByRole('option', { name: /lavender/i }));
    expect(screen.getByRole('option', { name: /large/i })).toBeDisabled();
  });

  it('disables a combination whose variant has zero stock', async () => {
    const user = userEvent.setup();
    render(<VariantSelector variants={gridVariants} onSelect={onSelect} />);

    await user.click(screen.getByRole('option', { name: /lavender/i }));
    expect(screen.getByRole('option', { name: /large/i })).toBeDisabled();
  });

  it('calls onSelect only when both scent and size resolve to exactly one variant', async () => {
    const user = userEvent.setup();
    render(<VariantSelector variants={gridVariants} onSelect={onSelect} />);

    await user.click(screen.getByRole('option', { name: /vanilla/i }));
    expect(onSelect).not.toHaveBeenCalled();

    await user.click(screen.getByRole('option', { name: /small/i }));
    expect(onSelect).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'v1', scent: 'vanilla', size: 'small' })
    );
  });

  it('single-variant product auto-selects on mount', () => {
    const single: ProductVariant[] = [{ id: 'only', scent: 'vanilla', size: 'large', stock: 4 }];
    render(<VariantSelector variants={single} onSelect={onSelect} />);
    expect(onSelect).toHaveBeenCalledWith(single[0]);
  });

  it('out-of-stock sizes under a selected scent still show as visible-but-disabled', async () => {
    const allOut: ProductVariant[] = [
      { id: 'v1', scent: 'vanilla', size: 'small', stock: 0 },
      { id: 'v2', scent: 'vanilla', size: 'large', stock: 0 },
    ];
    const user = userEvent.setup();
    render(<VariantSelector variants={allOut} onSelect={onSelect} />);

    await user.click(screen.getByRole('option', { name: /vanilla/i }));

    const small = screen.getByRole('option', { name: /small/i });
    const large = screen.getByRole('option', { name: /large/i });
    expect(small).toBeVisible();
    expect(large).toBeVisible();
    expect(small).toBeDisabled();
    expect(large).toBeDisabled();
  });
});
