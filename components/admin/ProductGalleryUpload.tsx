import { ChangeEvent, useRef } from 'react';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { imageService } from '@/services/imageService';
import { notificationService } from '@/services/notificationService';

type ProductGalleryUploadProps = {
  images: string[];
  onChange: (images: string[]) => void;
  uploading: boolean;
  onUploadingChange: (uploading: boolean) => void;
  maxImages?: number;
};

export function ProductGalleryUpload({
  images,
  onChange,
  uploading,
  onUploadingChange,
  maxImages = 12,
}: ProductGalleryUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    e.target.value = '';
    if (files.length === 0) return;

    const remaining = maxImages - images.length;
    if (remaining <= 0) {
      notificationService.error(`Maximum ${maxImages} gallery images allowed`);
      return;
    }

    const toUpload = files.slice(0, remaining);
    if (files.length > remaining) {
      notificationService.error(`Only ${remaining} more image(s) can be added`);
    }

    onUploadingChange(true);
    const uploaded: string[] = [];

    try {
      for (const file of toUpload) {
        const url = await imageService.uploadImage(file);
        uploaded.push(url);
      }
      onChange([...images, ...uploaded]);
      notificationService.success(
        uploaded.length === 1 ? 'Image uploaded' : `${uploaded.length} images uploaded`
      );
    } catch {
      if (uploaded.length > 0) {
        onChange([...images, ...uploaded]);
      }
      notificationService.error('Failed to upload one or more images');
    } finally {
      onUploadingChange(false);
    }
  };

  const removeAt = (index: number) => {
    onChange(images.filter((_, i) => i !== index));
  };

  const move = (index: number, direction: -1 | 1) => {
    const nextIndex = index + direction;
    if (nextIndex < 0 || nextIndex >= images.length) return;
    const next = [...images];
    [next[index], next[nextIndex]] = [next[nextIndex], next[index]];
    onChange(next);
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-semibold text-white mb-2">
          Product gallery <span className="text-gold-400">*</span>
        </label>
        <p className="text-xs text-foreground/60 mb-3">
          Upload multiple photos for the storefront slideshow. The first image is the main thumbnail.
        </p>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFiles}
          disabled={uploading || images.length >= maxImages}
          className="w-full px-4 py-3 border border-foreground/20 rounded-xl bg-primary/60 text-foreground file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-button file:text-button-text hover:file:bg-button-200 disabled:opacity-50"
        />
        {uploading && (
          <div className="flex items-center gap-2 text-button mt-2">
            <LoadingSpinner />
            <span>Uploading...</span>
          </div>
        )}
        <p className="text-xs text-foreground/50 mt-2">
          {images.length}/{maxImages} images
        </p>
      </div>

      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {images.map((url, index) => (
            <div
              key={`${url}-${index}`}
              className="relative group rounded-xl border border-foreground/20 bg-primary/40 overflow-hidden"
            >
              <img src={url} alt={`Gallery ${index + 1}`} className="w-full aspect-square object-cover" />
              {index === 0 && (
                <span className="absolute top-2 left-2 rounded-full bg-button px-2 py-0.5 text-[10px] font-semibold text-button-text">
                  Main
                </span>
              )}
              <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-1 bg-black/70 p-2 sm:p-1.5 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => move(index, -1)}
                    disabled={index === 0}
                    aria-label="Move earlier"
                    className="rounded bg-white/10 px-3 py-2 sm:px-2 sm:py-1 text-xs text-white disabled:opacity-30 touch-manipulation min-h-[2.25rem]"
                  >
                    ←
                  </button>
                  <button
                    type="button"
                    onClick={() => move(index, 1)}
                    disabled={index === images.length - 1}
                    aria-label="Move later"
                    className="rounded bg-white/10 px-3 py-2 sm:px-2 sm:py-1 text-xs text-white disabled:opacity-30 touch-manipulation min-h-[2.25rem]"
                  >
                    →
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => removeAt(index)}
                  aria-label="Remove image"
                  className="rounded bg-red-600/80 px-3 py-2 sm:px-2 sm:py-1 text-xs text-white hover:bg-red-600 touch-manipulation min-h-[2.25rem]"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
