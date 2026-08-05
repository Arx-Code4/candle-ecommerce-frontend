import { describe, it, expect } from 'vitest';
import { parseValidationErrors } from '@/lib/parseValidationErrors';

describe('parseValidationErrors', () => {
  it('splits a "body.field: message" string into field and message', () => {
    const result = parseValidationErrors(['body.price: Expected number, received string']);
    expect(result).toEqual([{ field: 'price', message: 'Expected number, received string' }]);
  });

  // ADDED — react-hook-form's useFieldArray names nested fields exactly
  // like this ("variants.0.scent"), so a path this shape needs to survive
  // unchanged (after the body. strip) for setError to actually land on
  // the right nested input, not just the top-level "variants" field.
  it('preserves a nested array path (variants.0.scent) unchanged after stripping body.', () => {
    const result = parseValidationErrors(['body.variants.0.scent: Required']);
    expect(result).toEqual([{ field: 'variants.0.scent', message: 'Required' }]);
  });

  it('maps multiple errors in order', () => {
    const result = parseValidationErrors([
      'body.price: Expected number, received string',
      'body.name: String must contain at least 1 character(s)',
    ]);
    expect(result).toEqual([
      { field: 'price', message: 'Expected number, received string' },
      { field: 'name', message: 'String must contain at least 1 character(s)' },
    ]);
  });

  it('returns an empty array for an empty input', () => {
    expect(parseValidationErrors([])).toEqual([]);
  });

  it('attaches an unparseable string (no colon) to the form root, not a specific field', () => {
    const result = parseValidationErrors(['something went wrong']);
    expect(result).toEqual([{ field: '', message: 'something went wrong' }]);
  });

  // ADDED — documents a deliberate scope limit, not an oversight: only
  // the "body." prefix is stripped. Admin forms only ever submit body
  // data (the :id comes from the URL, not form state), so a "params."-
  // or "query."-prefixed error should never actually occur here — but if
  // one somehow did, leaving the raw path visible is safer than silently
  // guessing at how to strip an unexpected prefix.
  it('leaves a non-body-prefixed path unchanged (e.g. params.id)', () => {
    const result = parseValidationErrors(['params.id: Invalid ID format']);
    expect(result).toEqual([{ field: 'params.id', message: 'Invalid ID format' }]);
  });
});
