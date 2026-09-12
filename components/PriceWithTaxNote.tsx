import { estimateTax, useSalesTaxRate } from '@/hooks/useSalesTaxRate';

type PriceWithTaxNoteProps = {
  unitPrice: number;
  className?: string;
  compact?: boolean;
};

/** Shows unit price plus estimated sales tax (same rate as cart/checkout). */
export function PriceWithTaxNote({ unitPrice, className = '', compact = false }: PriceWithTaxNoteProps) {
  const { rate, percent, loaded } = useSalesTaxRate();
  if (!loaded || rate <= 0) return null;

  const tax = estimateTax(unitPrice, rate);
  const total = Math.round((unitPrice + tax) * 100) / 100;

  return (
    <p className={`text-white/55 ${compact ? 'text-[11px] mt-0.5' : 'text-sm mt-1'} ${className}`.trim()}>
      Est. ${total.toFixed(2)} with {percent}% tax (${tax.toFixed(2)})
    </p>
  );
}
