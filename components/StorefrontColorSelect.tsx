const selectClassName =
  'w-full max-w-md px-4 py-3 border border-white/20 rounded-xl bg-black/40 text-white appearance-none cursor-pointer focus:ring-2 focus:ring-red-500/40 focus:border-red-500/40';

const selectStyle = {
  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23ffffff99' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
  backgroundRepeat: 'no-repeat' as const,
  backgroundPosition: 'right 12px center',
};

type StorefrontColorSelectProps = {
  id?: string;
  label?: string;
  colors: string[];
  value?: string;
  onChange: (color: string) => void;
  required?: boolean;
  hint?: string;
};

export function StorefrontColorSelect({
  id = 'product-color',
  label = 'Color',
  colors,
  value,
  onChange,
  required = false,
  hint = 'Product photo updates when you pick a color.',
}: StorefrontColorSelectProps) {
  if (colors.length === 0) return null;

  return (
    <div>
      <label htmlFor={id} className="block text-lg font-semibold text-white mb-2">
        {label}
        {required && <span className="text-red-400 text-sm font-normal"> *</span>}
      </label>
      <select
        id={id}
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value)}
        className={selectClassName}
        style={selectStyle}
        required={required}
      >
        <option value="" disabled>
          Select a color
        </option>
        {colors.map((color) => (
          <option key={color} value={color} className="bg-gray-900 text-white">
            {color}
          </option>
        ))}
      </select>
      {hint && <p className="text-xs text-white/45 mt-1">{hint}</p>}
    </div>
  );
}
