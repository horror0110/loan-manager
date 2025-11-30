// components/GanaaDataTable.tsx
"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Search,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Filter as FilterIcon,
  X,
} from "lucide-react";
import { GanaaDataTableProps } from "../../types/table.types";
import { ColumnVisibilityControl } from "./ColumnVisibilityControl";
import { TableFilters } from "./TableFilters";
import { TableMobileCard } from "./TableMobileCard";
import { TablePagination } from "./TablePagination";
import { TableBulkActions } from "./TableBulkActions";
import { TableLoadingSpinner } from "./TableLoadingSpinner";
import GanaaHeader from "../common/GanaaHeader";

const GanaaDataTable: React.FC<GanaaDataTableProps> = ({
  data = [],
  loading = false,
  columns = [],
  title,
  subtitle,
  headerIcon: HeaderIcon = null,
  headerError = false,
  headerStatistics = [],
  headerActions = [],
  headerMobileActions = [],
  headerRightContent = null,
  headerClassName = "",
  onBack = null,
  actions = [],
  primaryAction = null,
  bulkActions = [],
  searchPlaceholder = "Хайх...",
  onSearch = null,
  searchValue = "",
  filters = [],
  onFilterChange = null,
  onClearFilters = null,
  currentPage = 1,
  totalPages = 1,
  pageSize = 10,
  totalCount = 0,
  onPageChange = null,
  onPageSizeChange = null,
  selectable = false,
  selectedRows = [],
  onSelectionChange = null,
  headerButtons = [],
  className = "",
  onRefresh = null,
  responsiveBreakpoint = 768,
  enableColumnVisibility = true,
  enableMobileCards = true,
  compactMode = false,
}) => {
  const [isMobile, setIsMobile] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: "asc" | "desc";
  } | null>(null);
  const [visibleColumns, setVisibleColumns] = useState<string[]>(
    columns.map((col) => col.key)
  );
  const [internalSearchValue, setInternalSearchValue] = useState(searchValue);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < responsiveBreakpoint);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, [responsiveBreakpoint]);

  useEffect(() => {
    setVisibleColumns(columns.map((col) => col.key));
  }, [columns]);

  useEffect(() => {
    setInternalSearchValue(searchValue);
  }, [searchValue]);

  const handleSort = (key: string) => {
    if (!columns.find((col) => col.key === key)?.sortable) return;

    setSortConfig((current) => {
      if (!current || current.key !== key) {
        return { key, direction: "asc" };
      }
      if (current.direction === "asc") {
        return { key, direction: "desc" };
      }
      return null;
    });
  };

  const sortedData = useMemo(() => {
    if (!sortConfig) return data;

    return [...data].sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];

      if (aValue === bValue) return 0;
      if (aValue === null || aValue === undefined) return 1;
      if (bValue === null || bValue === undefined) return -1;

      const comparison = aValue < bValue ? -1 : 1;
      return sortConfig.direction === "asc" ? comparison : -comparison;
    });
  }, [data, sortConfig]);

  const handleSelectAll = () => {
    if (selectedRows.length === data.length) {
      onSelectionChange?.([]);
    } else {
      onSelectionChange?.(data.map((item) => item.id || item.uuid));
    }
  };

  const handleSelectRow = (id: string | number) => {
    const newSelected = selectedRows.includes(id)
      ? selectedRows.filter((rowId) => rowId !== id)
      : [...selectedRows, id];
    onSelectionChange?.(newSelected);
  };

  const handleColumnToggle = (columnKey: string) => {
    setVisibleColumns((prev) =>
      prev.includes(columnKey)
        ? prev.filter((key) => key !== columnKey)
        : [...prev, columnKey]
    );
  };

  const handleSelectAllColumns = () => {
    setVisibleColumns(columns.map((col) => col.key));
  };

  const handleSelectNoneColumns = () => {
    setVisibleColumns([]);
  };

  const visibleColumnsData = columns.filter((col) =>
    visibleColumns.includes(col.key)
  );

  const hasActiveFilters = filters.some(
    (filter) => filter.value && filter.value !== "all"
  );

  const renderCellContent = (column: any, value: any, item: any) => {
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
          className={`px-2 py-1 text-xs font-medium rounded-full whitespace-nowrap ${badgeClass}`}
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

  // Convert headerStatistics to GanaaHeader statistics format
  const ganaaHeaderStatistics = headerStatistics.map((stat) => ({
    label: stat.label,
    value: stat.value,
    icon: stat.icon,
    color: stat.color,
  }));

  // Convert headerActions to GanaaHeader actions format
  const ganaaHeaderActions = [
    ...(primaryAction
      ? [
          {
            label: primaryAction.label,
            icon: primaryAction.icon,
            onClick: primaryAction.onClick,
            variant: primaryAction.variant || ("default" as const),
            size: primaryAction.size || ("sm" as const),
            disabled: primaryAction.disabled,
            loading: primaryAction.loading,
            className: primaryAction.className,
          },
        ]
      : []),
    ...headerActions.map((action) => ({
      label: action.label,
      icon: action.icon,
      onClick: action.onClick,
      variant: action.variant || ("outline" as const),
      size: action.size || ("sm" as const),
      disabled: action.disabled,
      loading: action.loading,
      className: action.className,
    })),
    ...headerButtons.map((button) => ({
      label: button.label,
      icon: button.icon,
      onClick: button.onClick,
      variant: button.variant || ("outline" as const),
      size: button.size || ("sm" as const),
      disabled: button.disabled,
    })),
  ];

  const ganaaHeaderMobileActions =
    headerMobileActions.length > 0
      ? headerMobileActions.map((action) => ({
          label: action.label,
          icon: action.icon,
          onClick: action.onClick,
          variant: action.variant || ("outline" as const),
          size: action.size || ("sm" as const),
          disabled: action.disabled,
          loading: action.loading,
          className: action.className,
        }))
      : ganaaHeaderActions;

  return (
    <div
      className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden flex flex-col ${className}`}
    >
      {/* GanaaHeader */}
      {title && (
        <GanaaHeader
          title={title}
          subtitle={subtitle}
          icon={HeaderIcon}
          error={headerError}
          statistics={ganaaHeaderStatistics}
          actions={ganaaHeaderActions}
          mobileActions={ganaaHeaderMobileActions}
          isMobileMenuOpen={isMobileMenuOpen}
          setIsMobileMenuOpen={setIsMobileMenuOpen}
          rightContent={headerRightContent}
          onBack={onBack}
          className={headerClassName}
        />
      )}

      {/* Search and Controls */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        {(onSearch || filters.length > 0 || enableColumnVisibility) && (
          <div className="px-4 sm:px-6 py-4">
            <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
              {onSearch && (
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={internalSearchValue}
                    onChange={(e) => {
                      setInternalSearchValue(e.target.value);
                      onSearch(e.target.value);
                    }}
                    placeholder={searchPlaceholder || "Хайх..."}
                    className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
              )}

              <div className="flex items-center gap-2 flex-wrap">
                {filters.length > 0 && (
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                      showFilters || hasActiveFilters
                        ? "bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 border-2 border-indigo-200 dark:border-indigo-700"
                        : "bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600"
                    }`}
                  >
                    <FilterIcon className="w-4 h-4" />
                    Шүүлтүүр
                    {hasActiveFilters && (
                      <span className="w-2 h-2 bg-indigo-600 rounded-full" />
                    )}
                  </button>
                )}

                {hasActiveFilters && onClearFilters && (
                  <button
                    onClick={onClearFilters}
                    className="flex items-center gap-1 px-2 py-2 text-xs text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                  >
                    <X className="w-3 h-3" />
                    Цэвэрлэх
                  </button>
                )}

                {enableColumnVisibility && columns.length > 0 && (
                  <ColumnVisibilityControl
                    columns={columns}
                    visibleColumns={visibleColumns}
                    onColumnToggle={handleColumnToggle}
                    onSelectAll={handleSelectAllColumns}
                    onSelectNone={handleSelectNoneColumns}
                    isMobile={isMobile}
                  />
                )}

                {onRefresh && (
                  <button
                    onClick={onRefresh}
                    className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    aria-label="Сэргээх"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {showFilters && filters.length > 0 && (
              <TableFilters filters={filters} onFilterChange={onFilterChange} />
            )}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden flex flex-col">
        {loading ? (
          <TableLoadingSpinner />
        ) : data.length === 0 ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-lg font-medium text-gray-900 dark:text-white">
                Мэдээлэл олдсонгүй
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Өөр шүүлтүүр ашиглан дахин оролдоно уу
              </p>
            </div>
          </div>
        ) : isMobile && enableMobileCards ? (
          <div className="overflow-y-auto p-4 space-y-3">
            {sortedData.map((item, index) => (
              <TableMobileCard
                key={item.id || item.uuid || index}
                item={item}
                columns={visibleColumnsData}
                actions={actions}
                selectable={selectable}
                isSelected={selectedRows.includes(item.id || item.uuid)}
                onSelect={handleSelectRow}
              />
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto overflow-y-auto flex-1">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700/50 sticky top-0 z-10">
                <tr>
                  {selectable && (
                    <th className="w-12 px-4 py-3 text-left">
                      <input
                        type="checkbox"
                        checked={
                          selectedRows.length === data.length && data.length > 0
                        }
                        onChange={handleSelectAll}
                        className="w-4 h-4 text-indigo-600 bg-gray-100 dark:bg-gray-600 border-gray-300 dark:border-gray-500 rounded focus:ring-indigo-500"
                      />
                    </th>
                  )}
                  {visibleColumnsData.map((column) => (
                    <th
                      key={column.key}
                      className={`px-4 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider ${
                        column.sortable
                          ? "cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
                          : ""
                      } ${column.className || ""}`}
                      style={{ width: column.width }}
                      onClick={() => column.sortable && handleSort(column.key)}
                    >
                      <div className="flex items-center gap-2">
                        <span>{column.label}</span>
                        {column.sortable && (
                          <div className="flex flex-col">
                            <ChevronUp
                              className={`w-3 h-3 -mb-1 ${
                                sortConfig?.key === column.key &&
                                sortConfig?.direction === "asc"
                                  ? "text-indigo-600"
                                  : "text-gray-400"
                              }`}
                            />
                            <ChevronDown
                              className={`w-3 h-3 ${
                                sortConfig?.key === column.key &&
                                sortConfig?.direction === "desc"
                                  ? "text-indigo-600"
                                  : "text-gray-400"
                              }`}
                            />
                          </div>
                        )}
                      </div>
                    </th>
                  ))}
                  {actions.length > 0 && (
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      Үйлдэл
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {sortedData.map((item, index) => (
                  <tr
                    key={item.id || item.uuid || index}
                    className={`hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${
                      compactMode ? "text-sm" : ""
                    }`}
                  >
                    {selectable && (
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={selectedRows.includes(item.id || item.uuid)}
                          onChange={() => handleSelectRow(item.id || item.uuid)}
                          className="w-4 h-4 text-indigo-600 bg-gray-100 dark:bg-gray-600 border-gray-300 dark:border-gray-500 rounded focus:ring-indigo-500"
                        />
                      </td>
                    )}
                    {visibleColumnsData.map((column) => (
                      <td
                        key={column.key}
                        className={`px-4 ${
                          compactMode ? "py-2" : "py-3"
                        } text-sm text-gray-900 dark:text-white ${
                          column.cellClassName || ""
                        }`}
                      >
                        {renderCellContent(column, item[column.key], item)}
                      </td>
                    ))}
                    {actions.length > 0 && (
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {actions.map((action, actionIndex) => (
                            <button
                              key={actionIndex}
                              onClick={() => action.onClick(item)}
                              className={`p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 ${
                                action.className || ""
                              }`}
                              title={action.title}
                              disabled={action.disabled?.(item) || false}
                            >
                              {action.icon && (
                                <action.icon className="w-4 h-4" />
                              )}
                            </button>
                          ))}
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <TablePagination
          currentPage={currentPage}
          totalPages={totalPages}
          pageSize={pageSize}
          totalCount={totalCount}
          isMobile={isMobile}
          onPageChange={onPageChange}
          onPageSizeChange={onPageSizeChange}
        />
      )}

      {/* Bulk Actions */}
      {selectable && (
        <TableBulkActions
          selectedCount={selectedRows.length}
          selectedRows={selectedRows}
          bulkActions={bulkActions}
          isMobile={isMobile}
        />
      )}
    </div>
  );
};

export default GanaaDataTable;
