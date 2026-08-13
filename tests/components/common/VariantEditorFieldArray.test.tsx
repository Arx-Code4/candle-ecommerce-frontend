import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useForm } from 'react-hook-form';
import VariantEditorFieldArray from '@/components/common/VariantEditorFieldArray';
import type { AdminProductFormValues } from '@/types';

function Harness({
  variants = [{ scent: 'Vanilla', size: 'Large', stock: 5 }],
}: {
  variants?: AdminProductFormValues['variants'];
}) {
  const { control } = useForm<AdminProductFormValues>({
    defaultValues: {
      name: 'Candle',
      description: 'Nice',
      price: 25,
      photos: [{ url: 'https://cdn.example.com/a.jpg', sortOrder: 0 }],
      variants,
    },
  });
  return <VariantEditorFieldArray control={control} />;
}

describe('VariantEditorFieldArray', () => {
  it('renders scent, size, and stock inputs', () => {
    render(<Harness />);
    expect(screen.getByLabelText(/scent/i)).toHaveValue('Vanilla');
    expect(screen.getByLabelText(/size/i)).toHaveValue('Large');
    expect(screen.getByLabelText(/stock/i)).toHaveValue(5);
  });

  it('adds a variant row', async () => {
    const user = userEvent.setup();
    render(<Harness />);
    await user.click(screen.getByRole('button', { name: /add variant/i }));
    expect(screen.getAllByLabelText(/scent/i)).toHaveLength(2);
  });

  it('disables remove when only one variant remains', () => {
    render(<Harness />);
    expect(screen.getByRole('button', { name: /remove/i })).toBeDisabled();
  });

  it('warns on duplicate scent/size pairs case-insensitively', async () => {
    const user = userEvent.setup();
    render(
      <Harness
        variants={[
          { scent: 'Vanilla', size: 'Large', stock: 2 },
          { scent: '', size: '', stock: 0 },
        ]}
      />
    );

    await user.type(screen.getAllByLabelText(/scent/i)[1], ' vanilla ');
    await user.type(screen.getAllByLabelText(/size/i)[1], 'LARGE');

    expect(screen.getAllByText(/duplicate scent\/size/i).length).toBeGreaterThan(0);
  });
});
