// components/TablePagination.tsx
"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

interface TablePaginationProps {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalCount: number;
  isMobile: boolean;
  onPageChange?: ((page: number) => void) | null;
  onPageSizeChange?: ((size: number) => void) | null;
}

export const TablePagination: React.FC<TablePaginationProps> = ({
  currentPage,
  totalPages,
  pageSize,
  totalCount,
  isMobile,
  onPageChange,
  onPageSizeChange,
}) => {
  const maxVisiblePages = isMobile ? 3 : 5;

  return (
    <div className="bg-gray-50 dark:bg-gray-700/30 border-t border-gray-200 dark:border-gray-600 px-3 sm:px-4 py-3 flex-shrink-0">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
          <span className="text-xs sm:text-sm text-gray-700 dark:text-gray-300">
            {(currentPage - 1) * pageSize + 1}-
            {Math.min(currentPage * pageSize, totalCount)} /{" "}
            {totalCount.toLocaleString()}
          </span>
          {onPageSizeChange && (
            <select
              value={pageSize}
              onChange={(e) => onPageSizeChange(parseInt(e.target.value))}
              className="px-2 py-1 text-xs sm:text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          )}
        </div>

        <div className="flex items-center gap-1 sm:gap-2">
          <button
            onClick={() => onPageChange?.(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="p-1 sm:p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter((page) => {
                const delta = Math.floor(maxVisiblePages / 2);
                return (
                  page === 1 ||
                  page === totalPages ||
                  (page >= currentPage - delta && page <= currentPage + delta)
                );
              })
              .map((page, index, array) => {
                if (index > 0 && array[index - 1] !== page - 1) {
                  return [
                    <span
                      key={`ellipsis-${page}`}
                      className="px-1 sm:px-2 text-gray-400 text-xs sm:text-sm"
                    >
                      ...
                    </span>,
                    <button
                      key={page}
                      onClick={() => onPageChange?.(page)}
                      className={`px-2 sm:px-3 py-1 text-xs sm:text-sm rounded transition-colors min-w-[32px] ${
                        currentPage === page
                          ? "bg-indigo-600 text-white"
                          : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600"
                      }`}
                    >
                      {page}
                    </button>,
                  ];
                }
                return (
                  <button
                    key={page}
                    onClick={() => onPageChange?.(page)}
                    className={`px-2 sm:px-3 py-1 text-xs sm:text-sm rounded transition-colors min-w-[32px] ${
                      currentPage === page
                        ? "bg-indigo-600 text-white"
                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600"
                    }`}
                  >
                    {page}
                  </button>
                );
              })}
          </div>

          <button
            onClick={() =>
              onPageChange?.(Math.min(totalPages, currentPage + 1))
            }
            disabled={currentPage === totalPages}
            className="p-1 sm:p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
