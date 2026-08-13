import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useForm } from 'react-hook-form';
import PhotoUrlFieldArray from '@/components/common/PhotoUrlFieldArray';
import type { AdminProductFormValues } from '@/types';

function Harness({
  photos = [{ url: 'https://cdn.example.com/a.jpg', sortOrder: 2 }],
}: {
  photos?: AdminProductFormValues['photos'];
}) {
  const { control } = useForm<AdminProductFormValues>({
    defaultValues: {
      name: 'Candle',
      description: 'Nice',
      price: 25,
      photos,
      variants: [{ scent: 'vanilla', size: 'large', stock: 3 }],
    },
  });
  return <PhotoUrlFieldArray control={control} />;
}

describe('PhotoUrlFieldArray', () => {
  it('renders url and sortOrder inputs for each photo row', () => {
    render(<Harness />);
    expect(screen.getByLabelText(/photo url/i)).toHaveValue('https://cdn.example.com/a.jpg');
    expect(screen.getByLabelText(/sort order/i)).toHaveValue(2);
  });

  it('adds a photo row without renumbering existing sortOrder values', async () => {
    const user = userEvent.setup();
    render(<Harness />);
    await user.click(screen.getByRole('button', { name: /add photo/i }));

    const urls = screen.getAllByLabelText(/photo url/i);
    const orders = screen.getAllByLabelText(/sort order/i);
    expect(urls).toHaveLength(2);
    expect(orders[0]).toHaveValue(2);
  });

  it('disables remove when only one photo row remains', () => {
    render(<Harness />);
    expect(screen.getByRole('button', { name: /remove/i })).toBeDisabled();
  });

  it('removing a row leaves remaining sortOrder values unchanged', async () => {
    const user = userEvent.setup();
    render(
      <Harness
        photos={[
          { url: 'https://cdn.example.com/a.jpg', sortOrder: 4 },
          { url: 'https://cdn.example.com/b.jpg', sortOrder: 9 },
        ]}
      />
    );

    const removeButtons = screen.getAllByRole('button', { name: /remove/i });
    await user.click(removeButtons[0]);

    expect(screen.getByLabelText(/photo url/i)).toHaveValue('https://cdn.example.com/b.jpg');
    expect(screen.getByLabelText(/sort order/i)).toHaveValue(9);
  });
});
