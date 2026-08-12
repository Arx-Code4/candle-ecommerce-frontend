// src/components/common/PhotoGallery.tsx
import { useState, type FC } from 'react';
import type { ProductPhoto } from '@/types';

interface PhotoGalleryProps {
  photos: ProductPhoto[];
}

const PhotoGallery: FC<PhotoGalleryProps> = ({ photos }) => {
  const [selectedIndex, setSelectedIndex] = useState(0);

  if (photos.length === 0) {
    return (
      <div className="flex aspect-square items-center justify-center rounded-xl bg-muted">
        <img src="/placeholder-candle.png" alt="No photo available" className="h-1/2 opacity-40" />
      </div>
    );
  }

  const main = photos[selectedIndex] ?? photos[0];

  return (
    <div className="flex flex-col gap-3">
      <img
        src={main.url}
        alt="Selected product photo"
        className="aspect-square w-full rounded-xl object-cover"
      />
      <div className="flex gap-2">
        {photos.map((photo, index) => (
          <button
            key={photo.id}
            type="button"
            onClick={() => setSelectedIndex(index)}
            className={`h-16 w-16 overflow-hidden rounded-md border-2 ${
              index === selectedIndex ? 'border-primary' : 'border-transparent'
            }`}
          >
            <img
              src={photo.url}
              alt={`Photo ${index + 1}`}
              className="h-full w-full object-cover"
            />
          </button>
        ))}
      </div>
    </div>
  );
};

export default PhotoGallery;
