export function ProductDetailSkeleton() {
  return (
    <div className="animate-pulse page-shell py-8">
      <div className="h-4 w-32 rounded bg-white/10 mb-6" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
        <div className="aspect-square max-h-[520px] rounded-2xl bg-white/10 border border-white/10" />
        <div className="space-y-5">
          <div className="h-4 w-24 rounded bg-white/10" />
          <div className="h-10 w-4/5 rounded bg-white/10" />
          <div className="h-8 w-28 rounded bg-white/10" />
          <div className="space-y-2">
            <div className="h-3 w-full rounded bg-white/10" />
            <div className="h-3 w-full rounded bg-white/10" />
            <div className="h-3 w-2/3 rounded bg-white/10" />
          </div>
          <div className="h-24 rounded-xl bg-white/10" />
          <div className="h-12 rounded-xl bg-white/10" />
          <div className="flex gap-3">
            <div className="h-12 flex-1 rounded-xl bg-white/10" />
            <div className="h-12 flex-1 rounded-xl bg-white/10" />
          </div>
        </div>
      </div>
    </div>
  );
}
