// components/TableMobileCard.tsx
"use client";

import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { Column, Action } from "../../types/table.types";

interface TableMobileCardProps {
  item: any;
  columns: Column[];
  actions: Action[];
  selectable: boolean;
  isSelected: boolean;
  onSelect: (id: string | number) => void;
}

export const TableMobileCard: React.FC<TableMobileCardProps> = ({
  item,
  columns,
  actions,
  selectable,
  isSelected,
  onSelect,
}) => {
  const [showDetails, setShowDetails] = useState(false);

  const primaryColumns = columns.slice(0, 3);
  const secondaryColumns = columns.slice(3);

  const renderCellContent = (column: Column, value: any) => {
    if (column.render) {
      return column.render(value, item);
    }

    if (column.type === "badge") {
      const badgeConfig = column.badgeConfig || {};
      const badgeClass =
        badgeConfig[value] ||
        "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300";
      const badgeLabel = badgeConfig.labels?.[value] || value || "Тодорхойгүй";

      return (
        <span
          className={`px-2 py-1 text-xs font-medium rounded-full ${badgeClass}`}
        >
          {badgeLabel}
        </span>
      );
    }

    if (column.type === "tag") {
      const tagClass =
        column.tagClass ||
        "bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg border border-blue-200 dark:border-blue-700";
      return (
        <span className={`text-xs font-medium ${tagClass}`}>
          {value || "Тодорхойгүй"}
        </span>
      );
    }

    if (column.type === "code") {
      return (
        <span className="bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded text-xs font-mono">
          {value || "Тодорхойгүй"}
        </span>
      );
    }

    return <span className="break-words">{value}</span>;
  };

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden hover:shadow-md transition-all duration-200">
      <div className="p-4 space-y-3">
        {selectable && (
          <div className="flex items-center gap-2 pb-2 border-b border-gray-100 dark:border-gray-700">
            <input
              type="checkbox"
              checked={isSelected}
              onChange={() => onSelect(item.id || item.uuid)}
              className="w-4 h-4 text-indigo-600 bg-gray-100 dark:bg-gray-600 border-gray-300 dark:border-gray-500 rounded focus:ring-indigo-500"
            />
            <span className="text-xs text-gray-500 dark:text-gray-400">
              Сонгох
            </span>
          </div>
        )}

        <div className="space-y-2">
          {primaryColumns.map((column, index) => {
            const value = item[column.key];
            if (!value && value !== 0) return null;

            return (
              <div
                key={index}
                className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1 sm:gap-3"
              >
                <span className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 min-w-0 flex-shrink-0">
                  {column.label}:
                </span>
                <div className="text-sm sm:text-sm text-gray-900 dark:text-white text-left sm:text-right min-w-0 flex-1">
                  {renderCellContent(column, value)}
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-700">
          {secondaryColumns.length > 0 && (
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="flex items-center gap-1 text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors"
            >
              <ChevronDown
                className={`w-3 h-3 transition-transform ${
                  showDetails ? "rotate-180" : ""
                }`}
              />
              {showDetails
                ? "Хураах"
                : `Дэлгэрэнгүй (${secondaryColumns.length})`}
            </button>
          )}

          {actions.length > 0 && (
            <div className="flex items-center gap-3">
              {actions.slice(0, 4).map((action, index) => (
                <button
                  key={index}
                  onClick={() => action.onClick(item)}
                  className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors rounded-md hover:bg-gray-50 dark:hover:bg-gray-700"
                  title={action.title}
                  disabled={action.disabled?.(item) || false}
                >
                  {action.icon && <action.icon className="w-4 h-4" />}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {showDetails && secondaryColumns.length > 0 && (
        <div className="border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/30 p-4 animate-slideDown">
          <div className="space-y-2">
            {secondaryColumns.map((column, index) => {
              const value = item[column.key];
              if (!value && value !== 0) return null;

              return (
                <div
                  key={index}
                  className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1 sm:gap-3"
                >
                  <span className="text-xs font-medium text-gray-500 dark:text-gray-400 min-w-0 flex-shrink-0">
                    {column.label}:
                  </span>
                  <div className="text-xs text-gray-700 dark:text-gray-300 text-left sm:text-right min-w-0 flex-1">
                    {renderCellContent(column, value)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
