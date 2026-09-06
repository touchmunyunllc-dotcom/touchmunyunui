import { notificationService } from '@/services/notificationService';

const MAX_QUANTITY = 10;

type CartQuantityControlsProps = {
  quantity: number;
  onDecrement: () => void;
  onIncrement: () => void;
  disabled?: boolean;
  compact?: boolean;
};

export function CartQuantityControls({
  quantity,
  onDecrement,
  onIncrement,
  disabled = false,
  compact = false,
}: CartQuantityControlsProps) {
  const handleIncrement = () => {
    if (quantity >= MAX_QUANTITY) {
      notificationService.error(`Maximum quantity allowed per product is ${MAX_QUANTITY}`);
      return;
    }
    onIncrement();
  };

  const btnClass = compact
    ? 'px-2 py-0.5 hover:bg-foreground/10 transition-colors touch-manipulation'
    : 'px-3 py-1 hover:bg-primary transition-colors touch-manipulation';

  return (
    <div
      className={`inline-flex items-center border border-foreground/20 rounded-lg shrink-0 bg-primary/40 ${
        compact ? 'text-xs' : 'text-sm'
      }`}
    >
      <button
        type="button"
        onClick={onDecrement}
        disabled={disabled || quantity <= 1}
        className={`${btnClass} rounded-l-lg disabled:opacity-40 disabled:cursor-not-allowed text-foreground`}
        aria-label="Decrease quantity"
      >
        −
      </button>
      <span
        className={`border-x border-foreground/20 text-center font-semibold text-foreground tabular-nums ${
          compact ? 'px-2 py-0.5 min-w-[1.75rem]' : 'px-4 py-1 min-w-[3rem]'
        }`}
      >
        {quantity}
      </span>
      <button
        type="button"
        onClick={handleIncrement}
        disabled={disabled || quantity >= MAX_QUANTITY}
        className={`${btnClass} rounded-r-lg disabled:opacity-40 disabled:cursor-not-allowed text-foreground`}
        aria-label="Increase quantity"
      >
        +
      </button>
    </div>
  );
}
