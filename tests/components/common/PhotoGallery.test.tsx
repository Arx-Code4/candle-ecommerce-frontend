import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PhotoGallery from '@/components/common/PhotoGallery';
import type { ProductPhoto } from '@/types';

const photos: ProductPhoto[] = [
  { id: 'ph1', url: 'https://cdn.example.com/p1.jpg', sortOrder: 0 },
  { id: 'ph2', url: 'https://cdn.example.com/p2.jpg', sortOrder: 1 },
  { id: 'ph3', url: 'https://cdn.example.com/p3.jpg', sortOrder: 2 },
];

describe.skip('PhotoGallery', () => {
  it('renders the first photo large by default', () => {
    render(<PhotoGallery photos={photos} />);
    const main = screen.getByRole('img', { name: /main|selected|large|primary/i });
    expect(main).toHaveAttribute('src', photos[0].url);
  });

  it('clicking a thumbnail updates the large image', async () => {
    const user = userEvent.setup();
    render(<PhotoGallery photos={photos} />);

    const thumbs = screen.getAllByRole('img');
    // Click the thumbnail for p3 (last photo)
    await user.click(thumbs[thumbs.length - 1]);

    const main = screen.getByRole('img', { name: /main|selected|large|primary/i });
    expect(main).toHaveAttribute('src', photos[2].url);
  });

  it('empty photos array renders a placeholder, not a crash', () => {
    expect(() => render(<PhotoGallery photos={[]} />)).not.toThrow();
    expect(screen.getByRole('img')).toBeInTheDocument();
  });
});

