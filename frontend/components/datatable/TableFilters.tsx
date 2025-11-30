// components/TableFilters.tsx
"use client";

import { Filter } from "../../types/table.types";

interface TableFiltersProps {
  filters: Filter[];
  onFilterChange?: ((key: string, value: any) => void) | null;
}

export const TableFilters: React.FC<TableFiltersProps> = ({
  filters,
  onFilterChange,
}) => {
  const renderFilterInput = (filter: Filter) => {
    const baseInputClasses =
      "px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent w-full";

    if (filter.type === "date") {
      return (
        <input
          type="date"
          value={filter.value || ""}
          onChange={(e) => onFilterChange?.(filter.key, e.target.value)}
          className={baseInputClasses}
          placeholder={filter.placeholder}
          disabled={filter.disabled}
        />
      );
    }

    if (filter.type === "dateRange") {
      return (
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="date"
            value={filter.value?.from || ""}
            onChange={(e) =>
              onFilterChange?.(filter.key, {
                ...filter.value,
                from: e.target.value,
              })
            }
            className={baseInputClasses}
            placeholder="Эхлэх огноо"
            disabled={filter.disabled}
          />
          <span className="text-gray-500 self-center hidden sm:inline">-</span>
          <input
            type="date"
            value={filter.value?.to || ""}
            onChange={(e) =>
              onFilterChange?.(filter.key, {
                ...filter.value,
                to: e.target.value,
              })
            }
            className={baseInputClasses}
            placeholder="Дуусах огноо"
            disabled={filter.disabled}
          />
        </div>
      );
    }

    if (filter.type === "text") {
      return (
        <input
          type="text"
          value={filter.value || ""}
          onChange={(e) => onFilterChange?.(filter.key, e.target.value)}
          className={baseInputClasses}
          placeholder={filter.placeholder}
          disabled={filter.disabled}
        />
      );
    }

    if (filter.type === "number") {
      return (
        <input
          type="number"
          value={filter.value || ""}
          onChange={(e) => onFilterChange?.(filter.key, e.target.value)}
          className={baseInputClasses}
          placeholder={filter.placeholder}
          disabled={filter.disabled}
          min={filter.min}
          max={filter.max}
        />
      );
    }

    return (
      <select
        value={filter.value || "all"}
        onChange={(e) => onFilterChange?.(filter.key, e.target.value)}
        disabled={filter.disabled}
        className={baseInputClasses}
      >
        {filter.options?.map((option, index) => (
          <option
            key={option.key || option.value || index}
            value={option.value}
          >
            {option.label}
          </option>
        ))}
      </select>
    );
  };

  return (
    <div className="mt-3 p-3 sm:p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
        {filters.map((filter, index) => (
          <div key={index}>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <div className="flex items-center gap-1">
                {(() => {
                  if (!filter.icon) return null;
                  const FilterIcon = filter.icon;
                  return <FilterIcon className="w-4 h-4 inline mr-1" />;
                })()}
                <span>{filter.label}</span>
                {filter.disabled && (
                  <span className="text-xs text-gray-400 ml-1">(Идэвхгүй)</span>
                )}
                {filter.loading && (
                  <span className="text-xs text-blue-500 ml-1">
                    (Ачааллаж байна)
                  </span>
                )}
              </div>
            </label>
            {renderFilterInput(filter)}
          </div>
        ))}
      </div>
    </div>
  );
};
