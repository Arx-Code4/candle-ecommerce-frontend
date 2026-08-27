import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useForm } from 'react-hook-form';
import PhotoDropzone from '@/components/common/PhotoDropZone';
import type { AdminProductFormValues } from '@/types';

function Harness({ photoFiles = [] }: { photoFiles?: File[] }) {
  const { control } = useForm<AdminProductFormValues>({
    defaultValues: {
      name: 'Candle',
      description: 'Nice',
      price: 25,
      photos: [{ url: '', sortOrder: 0 }],
      photoFiles,
      variants: [{ scent: 'vanilla', size: 'large', stock: 3 }],
    },
  });
  return <PhotoDropzone control={control} name="photoFiles" />;
}

function makeFile(name = 'photo.jpg', type = 'image/jpeg') {
  return new File(['x'], name, { type });
}

describe('PhotoDropzone', () => {
  beforeEach(() => {
    globalThis.URL.createObjectURL = vi.fn(() => 'blob:mock');
  });

  it('renders the dropzone with no previews when empty', () => {
    render(<Harness />);
    expect(screen.getByTestId('photo-dropzone')).toBeInTheDocument();
    expect(screen.queryAllByRole('img')).toHaveLength(0);
  });

  it('adds a file via the hidden input and shows a preview', async () => {
    const user = useEventSetup();
    render(<Harness />);

    const input = screen.getByLabelText(/upload photos/i, { selector: 'input' });
    await user.upload(input, makeFile());

    expect(screen.getAllByRole('img')).toHaveLength(1);
  });

  it('filters out files with a disallowed mime type', async () => {
    const user = useEventSetup();
    render(<Harness />);

    const input = screen.getByLabelText(/upload photos/i, { selector: 'input' });
    await user.upload(input, makeFile('doc.pdf', 'application/pdf'));

    expect(screen.queryAllByRole('img')).toHaveLength(0);
  });

  it('caps accepted files at 6', async () => {
    const user = useEventSetup();
    const files = Array.from({ length: 8 }, (_, i) => makeFile(`p${i}.jpg`));
    render(<Harness />);

    const input = screen.getByLabelText(/upload photos/i, { selector: 'input' });
    await user.upload(input, files);

    expect(screen.getAllByRole('img')).toHaveLength(6);
  });

  it('removes a file when its remove button is clicked', async () => {
    const user = useEventSetup();
    render(<Harness photoFiles={[makeFile('a.jpg'), makeFile('b.jpg')]} />);

    expect(screen.getAllByRole('img')).toHaveLength(2);
    await user.click(screen.getByRole('button', { name: /remove a\.jpg/i }));

    expect(screen.getAllByRole('img')).toHaveLength(1);
  });
});

function useEventSetup() {
  return userEvent.setup();
}
