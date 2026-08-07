import type { ProductFormInput } from '@/types';

export function buildProductFormData(input: Partial<ProductFormInput>): FormData {
  const formData = new FormData();

  if (input.name !== undefined) formData.append('name', input.name);
  if (input.description !== undefined) formData.append('description', input.description);
  if (input.price !== undefined) formData.append('price', String(input.price));
  if (input.variants !== undefined) formData.append('variants', JSON.stringify(input.variants));
  if (input.photos !== undefined) {
    input.photos.forEach((file) => formData.append('photos', file));
  }

  return formData;
}
