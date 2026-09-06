type ProductCardSkeletonProps = {
  compact?: boolean;
};

export function ProductCardSkeleton({ compact = false }: ProductCardSkeletonProps) {
  return (
    <div
      className={`animate-pulse bg-primary/60 border border-foreground/10 overflow-hidden ${
        compact ? 'rounded-xl' : 'rounded-2xl'
      }`}
    >
      <div className={`bg-foreground/10 ${compact ? 'aspect-square' : 'aspect-[4/5]'}`} />
      <div className={`space-y-3 ${compact ? 'p-3.5' : 'p-5'}`}>
        <div className="h-3 w-16 rounded-full bg-foreground/10" />
        <div className="h-4 w-3/4 rounded bg-foreground/10" />
        {!compact && <div className="h-3 w-full rounded bg-foreground/10" />}
        <div className="h-6 w-20 rounded bg-foreground/10 mt-2" />
        <div className="flex gap-2 pt-1">
          <div className="h-8 flex-1 rounded-lg bg-foreground/10" />
          <div className="h-8 flex-1 rounded-lg bg-foreground/10" />
        </div>
      </div>
    </div>
  );
}

export function ProductGridSkeleton({ count = 8, compact = true }: { count?: number; compact?: boolean }) {
  return (
    <div className="grid grid-auto-fill-catalog gap-4 items-stretch [&>*]:min-w-0">
      {Array.from({ length: count }).map((_, index) => (
        <ProductCardSkeleton key={index} compact={compact} />
      ))}
    </div>
  );
}
