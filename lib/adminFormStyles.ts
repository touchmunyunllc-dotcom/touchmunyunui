/** Shared dark-theme form controls for admin pages. */
export const adminSelectClassName =
  'w-full px-4 py-3 border border-foreground/20 rounded-xl focus:ring-2 focus:ring-button/50 focus:border-button/50 bg-primary/60 backdrop-blur-sm text-foreground transition-all appearance-none cursor-pointer';

export const adminSelectOptionProps = {
  className: 'bg-primary text-foreground',
} as const;

/** Shared table/grid theme (matches Top Selling Products on admin dashboard). */
export const adminGridWrapperClassName =
  'w-full bg-gray-900 rounded-2xl shadow-lg overflow-hidden border border-gray-800';

export const adminGridScrollClassName = 'table-scroll-x';

export const adminGridTableClassName =
  'w-full min-w-[36rem] lg:min-w-0 table-fixed divide-y divide-gray-800';

export const adminGridHeadClassName = 'bg-gray-800';

export const adminGridHeadCellClassName =
  'px-3 py-3 sm:px-6 sm:py-4 text-left text-xs font-semibold text-foreground/70 uppercase tracking-wider';

export const adminGridHeadCellCompactClassName =
  'px-3 py-2.5 sm:px-4 sm:py-3 text-left text-xs font-semibold text-foreground/70 uppercase tracking-wide';

export const adminGridBodyClassName = 'bg-gray-900 divide-y divide-gray-800';

export const adminGridRowClassName = 'hover:bg-gray-800 transition-colors';

export const adminGridRowSelectedClassName =
  'bg-button/10 hover:bg-gray-800 transition-colors';

export const adminGridCellClassName = 'px-3 py-3 sm:px-6 sm:py-4 text-sm text-foreground';

export const adminGridCellCompactClassName = 'px-3 py-2 sm:px-4 sm:py-2 text-sm text-foreground';

export const adminGridCellMutedClassName = 'px-3 py-3 sm:px-6 sm:py-4 text-sm text-gray-300';

export const adminGridEmptyClassName =
  'text-center py-12 text-foreground/50 rounded-xl border-2 border-dashed border-gray-700 bg-gray-900/50';
