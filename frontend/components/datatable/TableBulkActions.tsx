// components/TableBulkActions.tsx
"use client";

import { Menu } from "lucide-react";
import { BulkAction } from "../../types/table.types";

interface TableBulkActionsProps {
  selectedCount: number;
  selectedRows: (string | number)[];
  bulkActions: BulkAction[];
  isMobile: boolean;
}

export const TableBulkActions: React.FC<TableBulkActionsProps> = ({
  selectedCount,
  selectedRows,
  bulkActions,
  isMobile,
}) => {
  if (selectedCount === 0 || bulkActions.length === 0) return null;

  return (
    <div className="fixed bottom-4 sm:bottom-6 left-1/2 transform -translate-x-1/2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg px-3 sm:px-4 py-2 sm:py-3 z-50 max-w-[calc(100vw-2rem)]">
      <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4">
        <span className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">
          {selectedCount} мөр сонгогдсон
        </span>
        <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto">
          {bulkActions
            .slice(0, isMobile ? 2 : bulkActions.length)
            .map((action, index) => (
              <button
                key={index}
                onClick={() => action.onClick(selectedRows)}
                className={
                  action.className ||
                  "flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors whitespace-nowrap"
                }
                disabled={action.disabled}
              >
                {action.icon && <action.icon className="w-4 h-4" />}
                <span className={isMobile ? "sr-only sm:not-sr-only" : ""}>
                  {action.label}
                </span>
              </button>
            ))}
          {isMobile && bulkActions.length > 2 && (
            <div className="relative group">
              <button className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors">
                <Menu className="w-4 h-4" />
              </button>
              <div className="absolute right-0 bottom-full mb-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10 min-w-[150px]">
                {bulkActions.slice(2).map((action, index) => (
                  <button
                    key={index}
                    onClick={() => action.onClick(selectedRows)}
                    className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 whitespace-nowrap w-full text-left first:rounded-t-lg last:rounded-b-lg"
                    disabled={action.disabled}
                  >
                    {action.icon && <action.icon className="w-4 h-4" />}
                    {action.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
