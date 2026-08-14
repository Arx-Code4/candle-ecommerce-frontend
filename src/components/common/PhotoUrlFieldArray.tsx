import { Controller, useFieldArray, type Control } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { AdminProductFormValues } from '@/types';

interface PhotoUrlFieldArrayProps {
  control: Control<AdminProductFormValues>;
}

export default function PhotoUrlFieldArray({ control }: PhotoUrlFieldArrayProps) {
  const { fields, append, remove } = useFieldArray({ control, name: 'photos' });

  return (
    <fieldset className="space-y-3">
      <legend className="text-sm font-medium text-foreground">Photos</legend>
      {fields.map((field, index) => (
        <div
          key={field.id}
          className="grid gap-3 rounded-lg border border-border bg-card p-3 md:grid-cols-[1fr_8rem_auto]"
        >
          <div className="space-y-1">
            <Label htmlFor={`photos.${index}.url`}>Photo URL</Label>
            <Controller
              control={control}
              name={`photos.${index}.url`}
              render={({ field: urlField }) => (
                <Input id={`photos.${index}.url`} placeholder="https://" {...urlField} />
              )}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor={`photos.${index}.sortOrder`}>Sort order</Label>
            <Controller
              control={control}
              name={`photos.${index}.sortOrder`}
              render={({ field: sortField }) => (
                <Input
                  id={`photos.${index}.sortOrder`}
                  type="number"
                  placeholder={String(index)}
                  value={sortField.value ?? ''}
                  onChange={(e) =>
                    sortField.onChange(e.target.value === '' ? undefined : Number(e.target.value))
                  }
                />
              )}
            />
          </div>
          <Button
            type="button"
            variant="outline"
            className="self-end"
            disabled={fields.length === 1}
            onClick={() => remove(index)}
          >
            Remove
          </Button>
        </div>
      ))}
      <Button
        type="button"
        variant="secondary"
        onClick={() => append({ url: '', sortOrder: fields.length })}
      >
        Add Photo
      </Button>
    </fieldset>
  );
}
