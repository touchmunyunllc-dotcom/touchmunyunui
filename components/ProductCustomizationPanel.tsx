import { Product } from '@/services/productService';
import { isWristbandProduct } from '@/services/productCustomizationService';
import { WRISTBAND_NUMBER_MAX_LENGTH } from '@/lib/productCustomization';

const selectClassName =
  'w-full max-w-xs px-4 py-3 border border-foreground/20 rounded-xl bg-primary/60 backdrop-blur-sm text-foreground focus:ring-2 focus:ring-button/50 focus:border-button/50 transition-all appearance-none cursor-pointer';

const selectStyle = {
  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23999' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
  backgroundRepeat: 'no-repeat' as const,
  backgroundPosition: 'right 12px center',
};

type ProductCustomizationPanelProps = {
  product: Product;
  selectedColor?: string;
  onSelectedColorChange: (color?: string) => void;
  selectedSize?: string;
  onSelectedSizeChange: (size?: string) => void;
  customNumber: string;
  onCustomNumberChange: (value: string) => void;
  writingColor: string;
  onWritingColorChange: (value: string) => void;
};

export function ProductCustomizationPanel({
  product,
  selectedColor,
  onSelectedColorChange,
  selectedSize,
  onSelectedSizeChange,
  customNumber,
  onCustomNumberChange,
  writingColor,
  onWritingColorChange,
}: ProductCustomizationPanelProps) {
  const isWristband = isWristbandProduct(product);
  const writingColorOptions = product.colors?.length ? product.colors : [];

  return (
    <>
      {!isWristband && product.colors && product.colors.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-foreground mb-3">Color</h2>
          <select
            value={selectedColor ?? ''}
            onChange={(e) => onSelectedColorChange(e.target.value || undefined)}
            className={selectClassName}
            style={selectStyle}
          >
            <option value="" disabled>
              Select a color
            </option>
            {product.colors.map((color) => (
              <option key={color} value={color}>
                {color}
              </option>
            ))}
          </select>
        </div>
      )}

      {isWristband && (
        <div className="space-y-4 p-4 border border-foreground/20 rounded-xl bg-primary/40">
          {product.customizationPolicy && (
            <p className="text-sm text-foreground/70 leading-relaxed whitespace-pre-line">
              {product.customizationPolicy}
            </p>
          )}
          <div>
            <h2 className="text-lg font-semibold text-foreground mb-2">Band color</h2>
            <select
              value={selectedColor ?? ''}
              onChange={(e) => onSelectedColorChange(e.target.value || undefined)}
              className={selectClassName}
              style={selectStyle}
            >
              <option value="" disabled>
                Select band color
              </option>
              {product.colors.map((color) => (
                <option key={color} value={color}>
                  {color}
                </option>
              ))}
            </select>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground mb-2">Number</h2>
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={WRISTBAND_NUMBER_MAX_LENGTH}
              value={customNumber}
              onChange={(e) =>
                onCustomNumberChange(
                  e.target.value.replace(/\D/g, '').slice(0, WRISTBAND_NUMBER_MAX_LENGTH)
                )
              }
              placeholder="e.g. 23"
              className="w-full max-w-xs px-4 py-3 border border-foreground/20 rounded-xl bg-primary/60 text-foreground placeholder-foreground/40 focus:ring-2 focus:ring-button/50"
            />
            <p className="text-xs text-foreground/50 mt-1">
              Digits only, max {WRISTBAND_NUMBER_MAX_LENGTH}
            </p>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground mb-2">Writing color</h2>
            <select
              value={writingColor}
              onChange={(e) => onWritingColorChange(e.target.value)}
              className={selectClassName}
              style={selectStyle}
            >
              {writingColorOptions.map((wc) => (
                <option key={wc} value={wc}>
                  {wc}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {product.sizes && product.sizes.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-foreground mb-3">Size</h2>
          <select
            value={selectedSize ?? ''}
            onChange={(e) => onSelectedSizeChange(e.target.value || undefined)}
            className={selectClassName}
            style={selectStyle}
          >
            <option value="" disabled>
              Select a size
            </option>
            {product.sizes.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </div>
      )}
    </>
  );
}
