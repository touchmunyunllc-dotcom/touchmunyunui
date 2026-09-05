interface ProductStorefrontFlagsProps {
  isNewArrival: boolean;
  isBestSeller: boolean;
  isFeatured: boolean;
  onChange: (field: 'isNewArrival' | 'isBestSeller' | 'isFeatured', value: boolean) => void;
}

export function ProductStorefrontFlags({
  isNewArrival,
  isBestSeller,
  isFeatured,
  onChange,
}: ProductStorefrontFlagsProps) {
  const flags = [
    {
      id: 'isNewArrival',
      field: 'isNewArrival' as const,
      label: 'New Arrival',
      hint: 'Prioritize on the New Arrivals page',
      checked: isNewArrival,
    },
    {
      id: 'isBestSeller',
      field: 'isBestSeller' as const,
      label: 'Best Seller',
      hint: 'Prioritize on the Best Sellers page',
      checked: isBestSeller,
    },
    {
      id: 'isFeatured',
      field: 'isFeatured' as const,
      label: 'Featured',
      hint: 'Prioritize on the homepage featured section',
      checked: isFeatured,
    },
  ];

  return (
    <div className="rounded-2xl border border-foreground/20 bg-primary/40 p-5 space-y-3">
      <div>
        <h3 className="text-sm font-semibold text-white">Storefront placement</h3>
        <p className="text-xs text-foreground/60 mt-1">
          Optional flags to highlight this product. Unchecked products still appear using automatic rules
          (newest, sales, category).
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {flags.map((flag) => (
          <label
            key={flag.id}
            htmlFor={flag.id}
            className="flex items-start gap-3 rounded-xl border border-foreground/15 bg-primary/60 p-3 cursor-pointer hover:border-button/40 transition-colors"
          >
            <input
              id={flag.id}
              type="checkbox"
              checked={flag.checked}
              onChange={(e) => onChange(flag.field, e.target.checked)}
              className="mt-0.5 rounded border-foreground/30 text-button focus:ring-button/50 w-4 h-4"
            />
            <span>
              <span className="block text-sm font-semibold text-foreground">{flag.label}</span>
              <span className="block text-xs text-foreground/60 mt-0.5">{flag.hint}</span>
            </span>
          </label>
        ))}
      </div>
    </div>
  );
}
