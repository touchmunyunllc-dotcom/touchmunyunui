import { CustomizableLine } from '@/services/productCustomizationService';

type CartLineCustomizationTagsProps = {
  line: CustomizableLine;
};

export function CartLineCustomizationTags({ line }: CartLineCustomizationTagsProps) {
  if (!line.selectedColor && !line.selectedSize && !line.customNumber && !line.writingColor) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-2 mb-1">
      {line.selectedColor && (
        <span className="text-xs px-2 py-0.5 bg-button/10 text-button border border-button/20 rounded-md">
          Color: {line.selectedColor}
        </span>
      )}
      {line.selectedSize && (
        <span className="text-xs px-2 py-0.5 bg-button/10 text-button border border-button/20 rounded-md">
          Size: {line.selectedSize}
        </span>
      )}
      {line.customNumber && (
        <span className="text-xs px-2 py-0.5 bg-button/10 text-button border border-button/20 rounded-md">
          Number: {line.customNumber}
        </span>
      )}
      {line.writingColor && (
        <span className="text-xs px-2 py-0.5 bg-button/10 text-button border border-button/20 rounded-md">
          Writing: {line.writingColor}
        </span>
      )}
    </div>
  );
}
