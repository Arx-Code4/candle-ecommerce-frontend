import { describe, it, expect } from 'vitest';
import { buildProductFormData } from '@/lib/productFormData';

function makeFile(name = 'photo.jpg'): File {
  return new File(['fake-bytes'], name, { type: 'image/jpeg' });
}

describe('buildProductFormData', () => {
  it('appends name, description, and price as strings', () => {
    const fd = buildProductFormData({ name: 'Candle', description: 'Smells nice', price: 25 });

    expect(fd.get('name')).toBe('Candle');
    expect(fd.get('description')).toBe('Smells nice');
    // FormData only holds strings/Blobs — price must be coerced, not left as a number.
    expect(fd.get('price')).toBe('25');
  });

  it('JSON-stringifies variants into a single field', () => {
    const variants = [{ scent: 'Vanilla', size: 'Large', stock: 10 }];
    const fd = buildProductFormData({ variants });

    expect(fd.get('variants')).toBe(JSON.stringify(variants));
  });

  it('appends each photo under the same "photos" key', () => {
    const photos = [makeFile('a.jpg'), makeFile('b.jpg')];
    const fd = buildProductFormData({ photos });

    const entries = fd.getAll('photos');
    expect(entries).toHaveLength(2);
    expect((entries[0] as File).name).toBe('a.jpg');
    expect((entries[1] as File).name).toBe('b.jpg');
  });

  // CRITICAL — this is the whole reason the function checks `!== undefined`
  // per field instead of unconditionally appending everything. On an
  // update, omitting `photos` from the input entirely must mean the
  // "photos" key never appears in the FormData at all — the backend
  // treats "field present but empty" and "field absent" differently
  // (absent = keep existing photos; present, even as an empty file list,
  // still triggers the multer/multipart parsing path).
  it('omits the photos field entirely when photos is not provided (preserves existing photos on update)', () => {
    const fd = buildProductFormData({ name: 'Updated name' });

    expect(fd.has('photos')).toBe(false);
    expect(fd.getAll('photos')).toHaveLength(0);
  });

  it('omits fields not present in a partial update payload', () => {
    const fd = buildProductFormData({ price: 30 });

    expect(fd.has('name')).toBe(false);
    expect(fd.has('description')).toBe(false);
    expect(fd.has('variants')).toBe(false);
    expect(fd.get('price')).toBe('30');
  });

  it('produces an empty FormData for an empty input', () => {
    const fd = buildProductFormData({});
    expect(Array.from(fd.keys())).toHaveLength(0);
  });
});
