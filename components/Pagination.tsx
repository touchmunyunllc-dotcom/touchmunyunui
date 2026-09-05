import React from 'react';
import { adminSelectClassName, adminSelectOptionProps, adminGridWrapperClassName } from '@/lib/adminFormStyles';

export const DEFAULT_PAGE_SIZE_OPTIONS = [10, 25, 50, 100] as const;

interface PaginationProps {
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  pageSizeOptions?: readonly number[];
  itemLabel?: string;
}

export const Pagination: React.FC<PaginationProps> = ({
  page,
  pageSize,
  totalCount,
  totalPages,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = DEFAULT_PAGE_SIZE_OPTIONS,
  itemLabel = 'items',
}) => {
  const showPageSize = Boolean(onPageSizeChange);
  const resolvedTotalPages =
    totalPages > 0 ? totalPages : Math.max(1, Math.ceil(totalCount / Math.max(pageSize, 1)));
  // Always show pager when there is data so all admin grids share the same footer UI.
  const showPager = totalCount > 0;

  if (totalCount === 0 && !showPageSize) {
    return null;
  }

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;

    if (resolvedTotalPages <= maxVisible) {
      for (let i = 1; i <= resolvedTotalPages; i++) {
        pages.push(i);
      }
    } else if (page <= 3) {
      pages.push(1);
      for (let i = 2; i <= 5; i++) {
        pages.push(i);
      }
      pages.push('...');
      pages.push(resolvedTotalPages);
    } else if (page >= resolvedTotalPages - 2) {
      pages.push('...');
      for (let i = resolvedTotalPages - 4; i <= resolvedTotalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push('...');
      for (let i = page - 1; i <= page + 1; i++) {
        pages.push(i);
      }
      pages.push('...');
      pages.push(resolvedTotalPages);
    }

    return pages;
  };

  const rangeStart = totalCount === 0 ? 0 : (page - 1) * pageSize + 1;
  const rangeEnd = Math.min(page * pageSize, totalCount);

  return (
    <div className={`mt-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between p-3 sm:p-4 lg:p-6 ${adminGridWrapperClassName}`}>
      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 min-w-0">
        <div className="text-xs sm:text-sm text-foreground/80 font-medium">
          {totalCount === 0
            ? `No ${itemLabel}`
            : `Showing ${rangeStart} to ${rangeEnd} of ${totalCount} ${itemLabel}`}
        </div>
        {showPageSize && (
          <label className="flex items-center gap-2 text-xs sm:text-sm text-foreground/80 min-w-0">
            <span className="font-medium whitespace-nowrap">Rows per page</span>
            <select
              value={pageSize}
              onChange={(e) => onPageSizeChange?.(Number(e.target.value))}
              className={`${adminSelectClassName} !w-auto min-w-0 max-w-full sm:min-w-[5rem]`}
            >
              {pageSizeOptions.map((size) => (
                <option key={size} value={size} {...adminSelectOptionProps}>
                  {size}
                </option>
              ))}
            </select>
          </label>
        )}
      </div>

      {showPager && (
        <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
          <button
            onClick={() => onPageChange(page - 1)}
            disabled={page === 1}
            className="px-3 sm:px-4 py-2 border border-gray-700 rounded-xl text-xs sm:text-sm text-foreground hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium"
          >
            <span className="hidden sm:inline">Previous</span>
            <span className="sm:hidden">Prev</span>
          </button>
          <div className="flex items-center gap-0.5 sm:gap-1 flex-wrap">
            {getPageNumbers().map((pageNum, index) => {
              if (pageNum === '...') {
                return (
                  <span key={`ellipsis-${index}`} className="px-2 text-foreground/50">
                    ...
                  </span>
                );
              }
              return (
                <button
                  key={pageNum}
                  onClick={() => onPageChange(pageNum as number)}
                  className={`px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                    page === pageNum
                      ? 'bg-button text-button-text shadow-lg'
                      : 'text-foreground hover:bg-gray-800 border border-gray-700'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
          </div>
          <button
            onClick={() => onPageChange(page + 1)}
            disabled={page >= resolvedTotalPages}
            className="px-3 sm:px-4 py-2 border border-gray-700 rounded-xl text-xs sm:text-sm text-foreground hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};
