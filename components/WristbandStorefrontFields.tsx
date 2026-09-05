import { Product } from '@/services/productService';
import { WRISTBAND_NUMBER_MAX_LENGTH } from '@/lib/productCustomization';

const selectClassName =
  'w-full max-w-md px-4 py-3 border border-white/20 rounded-xl bg-black/40 text-white appearance-none cursor-pointer focus:ring-2 focus:ring-red-500/40 focus:border-red-500/40';

const selectStyle = {
  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23ffffff99' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
  backgroundRepeat: 'no-repeat' as const,
  backgroundPosition: 'right 12px center',
};

type WristbandStorefrontFieldsProps = {
  product: Product;
  selectedColor?: string;
  onSelectedColorChange: (color: string) => void;
  customNumber: string;
  onCustomNumberChange: (value: string) => void;
  writingColor: string;
  onWritingColorChange: (value: string) => void;
  colorSurchargeAmount: number;
  showPricingNote?: boolean;
};

export function WristbandStorefrontFields({
  product,
  selectedColor,
  onSelectedColorChange,
  customNumber,
  onCustomNumberChange,
  writingColor,
  onWritingColorChange,
  colorSurchargeAmount,
  showPricingNote = true,
}: WristbandStorefrontFieldsProps) {
  const colors = product.colors ?? [];
  const hasSurchargeConfig = (product.colorSurcharge ?? 0) > 0;

  return (
    <div className="space-y-4 p-4 border border-white/10 rounded-xl bg-white/5">
      {product.customizationPolicy && (
        <p className="text-sm text-white/60 leading-relaxed whitespace-pre-line">
          {product.customizationPolicy}
        </p>
      )}

      {colors.length > 0 && (
        <div>
          <label htmlFor="wristband-band-color" className="block text-lg font-semibold text-white mb-2">
            Band color <span className="text-red-400 text-sm font-normal">*</span>
          </label>
          <select
            id="wristband-band-color"
            value={selectedColor ?? ''}
            onChange={(e) => onSelectedColorChange(e.target.value)}
            className={selectClassName}
            style={selectStyle}
            required
          >
            <option value="" disabled>
              Select band color
            </option>
            {colors.map((color) => (
              <option key={color} value={color} className="bg-gray-900 text-white">
                {color}
              </option>
            ))}
          </select>
        </div>
      )}

      <div>
        <label htmlFor="wristband-number" className="block text-lg font-semibold text-white mb-2">
          Number <span className="text-red-400 text-sm font-normal">*</span>
        </label>
        <input
          id="wristband-number"
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
          className="w-full max-w-md px-4 py-3 border border-white/20 rounded-xl bg-black/40 text-white placeholder-white/30 focus:ring-2 focus:ring-red-500/40 focus:border-red-500/40"
          required
        />
        <p className="text-xs text-white/45 mt-1">
          Digits only, max {WRISTBAND_NUMBER_MAX_LENGTH} characters
        </p>
      </div>

      {colors.length > 0 && (
        <div>
          <label htmlFor="wristband-writing-color" className="block text-lg font-semibold text-white mb-2">
            Writing color <span className="text-red-400 text-sm font-normal">*</span>
          </label>
          <select
            id="wristband-writing-color"
            value={writingColor}
            onChange={(e) => onWritingColorChange(e.target.value)}
            className={selectClassName}
            style={selectStyle}
            required
          >
            {colors.map((color) => (
              <option key={color} value={color} className="bg-gray-900 text-white">
                {color}
              </option>
            ))}
          </select>
          <p className="text-xs text-white/45 mt-1">Same color options as the band</p>
        </div>
      )}

      {showPricingNote && hasSurchargeConfig && (
        <p className="text-sm text-white/70 leading-relaxed border-t border-white/10 pt-3">
          {product.noSurchargeColors?.length
            ? `Band colors ${product.noSurchargeColors.join(' and ')} are included in the base price. `
            : ''}
          Other band colors add ${product.colorSurcharge!.toFixed(2)} to the unit price
          {colorSurchargeAmount > 0
            ? ` (${colorSurchargeAmount.toFixed(2)} included in the price shown above).`
            : '.'}{' '}
          Shipping is calculated at checkout.
        </p>
      )}
    </div>
  );
}
