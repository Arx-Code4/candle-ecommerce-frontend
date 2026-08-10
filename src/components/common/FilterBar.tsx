// src/components/common/FilterBar.tsx
import type { FC } from 'react';
import { useSearchParams } from 'react-router-dom';

// TODO: confirm against the final product taxonomy (mockup shows
// Woody/Citrus/Floral/Sweet scents, 8oz/12oz/Travel Tin sizes) —
// these must exactly match the `scent`/`size` strings stored on
// ProductVariant rows, since product.service.ts filters by exact
// equality, not fuzzy/case-insensitive matching.
const SCENT_OPTIONS = ['vanilla', 'lavender', 'rose'];
const SIZE_OPTIONS = ['small', 'large'];

const FilterBar: FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const scent = searchParams.get('scent');
  const size = searchParams.get('size');

  const applyFilter = (key: 'scent' | 'size', value: string) => {
    const next = new URLSearchParams(searchParams);
    const isActive = next.get(key) === value;
    if (isActive) {
      next.delete(key); // click-to-toggle: re-clicking the active value clears it
    } else {
      next.set(key, value);
    }
    next.set('page', '1'); // any filter change invalidates the current page
    setSearchParams(next);
  };

  const clearFilters = () => {
    const next = new URLSearchParams(searchParams);
    next.delete('scent');
    next.delete('size');
    // page deliberately left untouched here — clearing filters on page 2
    // of a now-larger result set is still a valid page to be on.
    setSearchParams(next);
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="flex flex-wrap gap-2" role="group" aria-label="Scent">
        {SCENT_OPTIONS.map((option) => (
          <button
            key={option}
            type="button"
            aria-pressed={scent === option}
            onClick={() => applyFilter('scent', option)}
            className={`rounded-full border px-3 py-1.5 text-sm capitalize transition-colors ${
              scent === option
                ? 'border-primary bg-primary text-primary-foreground'
                : 'border-input bg-background text-foreground hover:bg-muted'
            }`}
          >
            {option}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-2" role="group" aria-label="Size">
        {SIZE_OPTIONS.map((option) => (
          <button
            key={option}
            type="button"
            aria-pressed={size === option}
            onClick={() => applyFilter('size', option)}
            className={`rounded-full border px-3 py-1.5 text-sm capitalize transition-colors ${
              size === option
                ? 'border-primary bg-primary text-primary-foreground'
                : 'border-input bg-background text-foreground hover:bg-muted'
            }`}
          >
            {option}
          </button>
        ))}
      </div>

      <button
        type="button"
        onClick={clearFilters}
        className="text-sm text-muted-foreground underline hover:text-foreground"
      >
        Clear filters
      </button>
    </div>
  );
};

export default FilterBar;
