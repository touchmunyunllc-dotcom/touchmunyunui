import { ChangeEvent } from 'react';
import { ColorMultiSelect } from '@/components/ColorMultiSelect';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import {
  CUSTOMIZATION_TYPE_WRISTBAND,
  IMAGE_OBJECT_POSITION_PRESETS,
  isWristbandCustomizationType,
} from '@/lib/productCustomization';

type ProductVariantConfigProps = {
  colors: string[];
  onColorsChange: (colors: string[]) => void;
  colorImages: Record<string, string>;
  onColorImageUpload: (color: string, file: File) => void;
  uploadingColor: string | null;
  customizationType: string;
  onCustomizationTypeChange: (type: string) => void;
  colorSurcharge: string;
  onColorSurchargeChange: (value: string) => void;
  noSurchargeColors: string[];
  onNoSurchargeColorToggle: (color: string, checked: boolean) => void;
  customizationPolicy: string;
  onCustomizationPolicyChange: (value: string) => void;
  imageObjectPosition: string;
  onImageObjectPositionChange: (value: string) => void;
  sizes: string[];
  sizeInput: string;
  onSizeInputChange: (value: string) => void;
  onAddSize: (value: string) => void;
  onRemoveSize: (size: string) => void;
  checkboxId?: string;
};

export function ProductVariantConfig({
  colors,
  onColorsChange,
  colorImages,
  onColorImageUpload,
  uploadingColor,
  customizationType,
  onCustomizationTypeChange,
  colorSurcharge,
  onColorSurchargeChange,
  noSurchargeColors,
  onNoSurchargeColorToggle,
  customizationPolicy,
  onCustomizationPolicyChange,
  imageObjectPosition,
  onImageObjectPositionChange,
  sizes,
  sizeInput,
  onSizeInputChange,
  onAddSize,
  onRemoveSize,
  checkboxId = 'wristbandCustomization',
}: ProductVariantConfigProps) {
  const isWristband = isWristbandCustomizationType(customizationType);

  const onColorFileChange = (color: string, e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onColorImageUpload(color, file);
  };

  return (
    <>
      <ColorMultiSelect selected={colors} onChange={onColorsChange} />

      {colors.length > 0 && (
        <div>
          <label className="block text-sm font-semibold text-white mb-2">
            Color images{' '}
            <span className="text-foreground/50 text-xs">(optional — shown when customer picks that color)</span>
          </label>
          <div className="space-y-3">
            {colors.map((color) => (
              <div
                key={color}
                className="flex flex-wrap items-center gap-4 p-3 border border-foreground/20 rounded-xl bg-primary/40"
              >
                <span className="text-sm font-medium text-white w-24">{color}</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => onColorFileChange(color, e)}
                  disabled={uploadingColor === color}
                  className="text-sm text-foreground file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-button file:text-button-text"
                />
                {uploadingColor === color && <LoadingSpinner />}
                {colorImages[color] && (
                  <img
                    src={colorImages[color]}
                    alt={color}
                    className="w-16 h-16 object-cover rounded-lg border border-foreground/20"
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div>
        <label className="block text-sm font-semibold text-white mb-2">
          Image framing{' '}
          <span className="text-foreground/50 text-xs">(optional — adjust product photo crop on storefront)</span>
        </label>
        <select
          value={imageObjectPosition}
          onChange={(e) => onImageObjectPositionChange(e.target.value)}
          className="w-full max-w-md px-4 py-3 border border-foreground/20 rounded-xl bg-primary/60 text-foreground"
        >
          {IMAGE_OBJECT_POSITION_PRESETS.map((preset) => (
            <option key={preset.value || 'default'} value={preset.value}>
              {preset.label}
            </option>
          ))}
        </select>
      </div>

      <div className="flex items-center gap-3 p-4 border border-foreground/20 rounded-xl bg-primary/40">
        <input
          type="checkbox"
          id={checkboxId}
          checked={isWristband}
          onChange={(e) => onCustomizationTypeChange(e.target.checked ? CUSTOMIZATION_TYPE_WRISTBAND : '')}
          className="h-4 w-4 rounded border-foreground/30 text-button focus:ring-button/50"
        />
        <label htmlFor={checkboxId} className="text-sm font-semibold text-white">
          Wristband customization (number + writing color on storefront)
        </label>
      </div>

      {isWristband && (
        <div className="space-y-4 p-4 border border-foreground/20 rounded-xl bg-primary/40">
          <div>
            <label className="block text-sm font-semibold text-white mb-2">Color band surcharge ($)</label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={colorSurcharge}
              onChange={(e) => onColorSurchargeChange(e.target.value)}
              className="w-full max-w-xs px-4 py-3 border border-foreground/20 rounded-xl bg-primary/60 text-foreground"
              placeholder="e.g. 5.00"
            />
            <p className="text-xs text-foreground/50 mt-1">
              Added when band color is not in the no-surcharge list below.
            </p>
          </div>
          {colors.length > 0 && (
            <div>
              <label className="block text-sm font-semibold text-white mb-2">No-surcharge band colors</label>
              <div className="flex flex-wrap gap-2">
                {colors.map((color) => (
                  <label
                    key={color}
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-foreground/20 text-sm text-white"
                  >
                    <input
                      type="checkbox"
                      checked={noSurchargeColors.includes(color)}
                      onChange={(e) => onNoSurchargeColorToggle(color, e.target.checked)}
                      className="h-4 w-4 rounded border-foreground/30 text-button"
                    />
                    {color}
                  </label>
                ))}
              </div>
            </div>
          )}
          <div>
            <label className="block text-sm font-semibold text-white mb-2">
              Customization policy (shown on storefront & checkout)
            </label>
            <textarea
              value={customizationPolicy}
              onChange={(e) => onCustomizationPolicyChange(e.target.value)}
              rows={4}
              className="w-full px-4 py-3 border border-foreground/20 rounded-xl bg-primary/60 text-foreground"
              placeholder="Pricing, lead times, shipping notes…"
            />
          </div>
        </div>
      )}

      <div>
        <label className="block text-sm font-semibold text-white mb-2">
          Available Sizes <span className="text-foreground/50 text-xs">(Optional)</span>
        </label>
        <div className="flex gap-2 mb-3">
          <input
            type="text"
            value={sizeInput}
            onChange={(e) => onSizeInputChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                onAddSize(sizeInput);
                onSizeInputChange('');
              }
            }}
            className="flex-1 px-4 py-3 border border-foreground/20 rounded-xl bg-primary/60 text-foreground"
            placeholder="Type a size (e.g. M) and press Enter"
          />
          <button
            type="button"
            onClick={() => {
              onAddSize(sizeInput);
              onSizeInputChange('');
            }}
            className="px-4 py-3 bg-button text-button-text rounded-xl font-semibold"
          >
            Add
          </button>
        </div>
        {sizes.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {sizes.map((size) => (
              <span
                key={size}
                className="inline-flex items-center gap-1 px-3 py-1.5 bg-button/20 text-button border border-button/30 rounded-lg text-sm"
              >
                {size}
                <button type="button" onClick={() => onRemoveSize(size)} className="ml-1">
                  &times;
                </button>
              </span>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
