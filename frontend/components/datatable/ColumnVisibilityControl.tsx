// components/datatable/ColumnVisibilityControl.tsx
"use client";

import { Columns, ChevronDown, X, Eye, EyeOff } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Column } from "../../types/table.types";

interface ColumnVisibilityControlProps {
  columns: Column[];
  visibleColumns: string[];
  onColumnToggle: (columnKey: string) => void;
  onSelectAll: () => void;
  onSelectNone: () => void;
  isMobile?: boolean;
}

export const ColumnVisibilityControl: React.FC<
  ColumnVisibilityControlProps
> = ({
  columns,
  visibleColumns,
  onColumnToggle,
  onSelectAll,
  onSelectNone,
  isMobile = false,
}) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const allVisible = visibleColumns.length === columns.length;
  const noneVisible = visibleColumns.length === 0;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };

    if (showDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("touchstart", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [showDropdown]);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && showDropdown) {
        setShowDropdown(false);
      }
    };

    if (showDropdown) {
      document.addEventListener("keydown", handleEscape);
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [showDropdown]);

  const handleToggleDropdown = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDropdown(!showDropdown);
  };

  const handleSelectAllClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelectAll();
    setShowDropdown(false);
  };

  const handleSelectNoneClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelectNone();
    setShowDropdown(false);
  };

  const handleColumnToggleClick = (
    columnKey: string,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    e.stopPropagation();
    onColumnToggle(columnKey);
  };

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        onClick={handleToggleDropdown}
        className={`flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 ${
          isMobile ? "min-w-0" : ""
        } ${showDropdown ? "ring-2 ring-indigo-500" : ""}`}
        aria-expanded={showDropdown}
        aria-haspopup="true"
      >
        <Columns className="w-4 h-4 flex-shrink-0" />
        <span className={isMobile ? "hidden sm:inline" : ""}>
          Багана ({visibleColumns.length}/{columns.length})
        </span>
        {isMobile && (
          <span className="sm:hidden">
            {visibleColumns.length}/{columns.length}
          </span>
        )}
        <ChevronDown
          className={`w-3 h-3 transition-transform ${
            showDropdown ? "rotate-180" : ""
          }`}
        />
      </button>

      {showDropdown && (
        <div className="fixed inset-0 z-50" aria-hidden="true">
          <div
            className="absolute inset-0 bg-black bg-opacity-25 sm:bg-transparent"
            onClick={() => setShowDropdown(false)}
          />

          <div
            ref={dropdownRef}
            className={`absolute bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl z-10 ${
              isMobile
                ? "inset-x-4 top-1/2 transform -translate-y-1/2 max-h-[80vh]"
                : "w-80 max-w-[calc(100vw-2rem)]"
            }`}
            style={
              !isMobile
                ? {
                    position: "absolute",
                    top: buttonRef.current
                      ? buttonRef.current.offsetHeight + 8
                      : "100%",
                    right: 0,
                    zIndex: 60,
                  }
                : {}
            }
          >
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                  Багана сонгох
                </h4>
                <button
                  onClick={() => setShowDropdown(false)}
                  className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  aria-label="Хаах"
                >
                  <X className="w-4 h-4 text-gray-400" />
                </button>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleSelectAllClick}
                  disabled={allVisible}
                  className="px-3 py-1.5 text-xs font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Бүгдийг сонгох
                </button>
                <button
                  onClick={handleSelectNoneClick}
                  disabled={noneVisible}
                  className="px-3 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                  Цэвэрлэх
                </button>
              </div>
            </div>

            <div className="p-4 max-h-80 overflow-y-auto">
              <div className="space-y-2">
                {columns.map((column, index) => {
                  const isVisible = visibleColumns.includes(column.key);
                  return (
                    <label
                      key={`${column.key}-${index}`}
                      className="flex items-center gap-3 p-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors group"
                    >
                      <input
                        type="checkbox"
                        checked={isVisible}
                        onChange={(e) => handleColumnToggleClick(column.key, e)}
                        className="w-4 h-4 text-indigo-600 bg-gray-100 dark:bg-gray-600 border-gray-300 dark:border-gray-500 rounded focus:ring-indigo-500 flex-shrink-0 transition-colors"
                      />
                      <span className="text-gray-700 dark:text-gray-300 flex-1 min-w-0 break-words group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
                        {column.label}
                      </span>
                      <div className="flex-shrink-0">
                        {isVisible ? (
                          <Eye className="w-4 h-4 text-green-500" />
                        ) : (
                          <EyeOff className="w-4 h-4 text-gray-400" />
                        )}
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>

            <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
              <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                {visibleColumns.length} / {columns.length} багана сонгогдсон
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
