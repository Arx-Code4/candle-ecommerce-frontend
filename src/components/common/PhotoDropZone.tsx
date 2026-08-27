import { useRef, useState } from 'react';
import { Controller, type Control, type FieldPath } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import type { AdminProductFormValues } from '@/types';

const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_FILES = 6;

interface PhotoDropzoneProps {
  control: Control<AdminProductFormValues>;
  name: FieldPath<AdminProductFormValues>;
}

export default function PhotoDropzone({ control, name }: PhotoDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => {
        const files: File[] = (field.value as File[] | undefined) ?? [];

        const addFiles = (incoming: FileList | null) => {
          if (!incoming) return;
          const valid = Array.from(incoming).filter((f) => ACCEPTED_TYPES.includes(f.type));
          const next = [...files, ...valid].slice(0, MAX_FILES);
          field.onChange(next);
          if (inputRef.current) {
            inputRef.current.value = '';
          }
        };

        const removeFile = (index: number) => {
          field.onChange(files.filter((_, i) => i !== index));
        };

        return (
          <div className="space-y-2">
            <Label htmlFor="photoFiles-input">Upload photos</Label>
            <div
              data-testid="photo-dropzone"
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsDragging(false);
                addFiles(e.dataTransfer.files);
              }}
              onClick={() => inputRef.current?.click()}
              className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground transition-colors ${
                isDragging ? 'border-primary bg-accent' : 'border-border'
              }`}
            >
              <p>Drag and drop photos here, or click to browse</p>
              <p className="text-xs">JPEG, PNG, or WebP · up to {MAX_FILES} files</p>
              <input
                ref={inputRef}
                id="photoFiles-input"
                type="file"
                accept={ACCEPTED_TYPES.join(',')}
                multiple
                className="hidden"
                onChange={(e) => addFiles(e.target.files)}
              />
            </div>

            {files.length > 0 && (
              <ul className="grid grid-cols-3 gap-3 md:grid-cols-6">
                {files.map((file, index) => (
                  <li key={`${file.name}-${index}`} className="relative">
                    <img
                      src={URL.createObjectURL(file)}
                      alt={file.name}
                      className="aspect-square w-full rounded-md border border-border object-cover"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      className="absolute -right-2 -top-2 h-6 w-6 rounded-full p-0"
                      onClick={() => removeFile(index)}
                      aria-label={`Remove ${file.name}`}
                    >
                      ×
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        );
      }}
    />
  );
}
