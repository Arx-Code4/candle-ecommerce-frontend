import { useQuery } from '@tanstack/react-query';
import api from '@/lib/axios';
import { QUERY_KEYS } from '@/constants';
import type { Product, ProductPhoto } from '@/types';

// Backend returns photos as bare URL strings (already sorted); the frontend
// type expects {id, url, sortOrder} objects (PhotoGallery keys off `id`).
// Adapting here, once, keeps every consumer of useProduct() working with
// the richer shape without needing to know about the wire format.
function adaptPhotos(photos: string[]): ProductPhoto[] {
  return photos.map((url, index) => ({ id: String(index), url, sortOrder: index }));
}

export function useProduct(id: string) {
  return useQuery<Product>({
    queryKey: [QUERY_KEYS.PRODUCTS, id],
    queryFn: async () => {
      const response = await api.get<Omit<Product, 'photos'> & { photos: string[] }>(
        `/products/${id}`
      );
      return { ...response.data, photos: adaptPhotos(response.data.photos) };
    },
    enabled: !!id,
  });
}
