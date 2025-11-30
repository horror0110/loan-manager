import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Check, X, Search } from "lucide-react";
import { cn } from "@/lib/utils";

// Select Component
export const Select = ({
  value,
  onChange,
  options = [],
  placeholder = "Сонгох",
  disabled = false,
  className,
  clearable = true,
  searchable = false,
  renderOption,
  renderValue,
  loading = false,
  error,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const containerRef = useRef(null);
  const searchInputRef = useRef(null);

  // Опцуудыг шүүх
  const filteredOptions = options.filter((option) => {
    if (!searchTerm) return true;
    const label = option.label || option.value || option;
    return label.toString().toLowerCase().includes(searchTerm.toLowerCase());
  });

  // Сонгогдсон утга харуулах
  const selectedOption = options.find((option) => option.value === value);
  const displayValue = () => {
    if (renderValue && selectedOption) {
      return renderValue(selectedOption);
    }
    return selectedOption
      ? selectedOption.label || selectedOption.value
      : placeholder;
  };

  // Опц сонгох
  const handleSelect = (option) => {
    const optionValue = option.value || option;
    onChange(optionValue);
    setIsOpen(false);
    setSearchTerm("");
  };

  // Цэвэрлэх
  const handleClear = (e) => {
    e.stopPropagation();
    onChange(null);
    setSearchTerm("");
  };

  // Гаднаас дарахад хаах
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target)
      ) {
        setIsOpen(false);
        setSearchTerm("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Нээхэд search input-д focus хийх
  useEffect(() => {
    if (isOpen && searchable && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen, searchable]);

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      {/* Select Button */}
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={cn(
          "flex items-center justify-between w-full px-3 py-2 border rounded-md text-left",
          "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
          disabled
            ? "bg-gray-100 cursor-not-allowed"
            : "bg-white hover:border-gray-400",
          error && "border-red-500",
          isOpen && "border-blue-500 ring-2 ring-blue-500"
        )}
      >
        <span
          className={cn(
            "text-sm truncate",
            value ? "text-gray-900" : "text-gray-500"
          )}
        >
          {displayValue()}
        </span>
        <div className="flex items-center space-x-1">
          {clearable && value && (
            <button
              onClick={handleClear}
              className="p-1 hover:bg-gray-100 rounded"
            >
              <X className="w-4 h-4 text-gray-400" />
            </button>
          )}
          <ChevronDown
            className={cn(
              "w-4 h-4 text-gray-400 transition-transform",
              isOpen && "rotate-180"
            )}
          />
        </div>
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border rounded-md shadow-lg z-50 max-h-60 overflow-hidden">
          {/* Search */}
          {searchable && (
            <div className="p-2 border-b">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Хайх..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          )}

          {/* Options */}
          <div className="max-h-48 overflow-y-auto">
            {loading ? (
              <div className="p-3 text-sm text-gray-500 text-center">
                Ачааллаж байна...
              </div>
            ) : filteredOptions.length === 0 ? (
              <div className="p-3 text-sm text-gray-500 text-center">
                {searchTerm ? "Хайлтын үр дүн олдсонгүй" : "Сонголт байхгүй"}
              </div>
            ) : (
              filteredOptions.map((option, index) => {
                const optionValue = option.value || option;
                const optionLabel = option.label || option.value || option;
                const isSelected = value === optionValue;

                return (
                  <button
                    key={index}
                    onClick={() => handleSelect(option)}
                    className={cn(
                      "w-full px-3 py-2 text-left text-sm hover:bg-gray-50 focus:outline-none focus:bg-gray-50",
                      "flex items-center justify-between",
                      isSelected && "bg-blue-50 text-blue-600"
                    )}
                  >
                    <span className="truncate">
                      {renderOption ? renderOption(option) : optionLabel}
                    </span>
                    {isSelected && <Check className="w-4 h-4" />}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
};

// MultiSelect Component
export const MultiSelect = ({
  value = [],
  onChange,
  options = [],
  placeholder = "Сонгох",
  disabled = false,
  className,
  clearable = true,
  searchable = true,
  renderOption,
  renderValue,
  loading = false,
  error,
  maxSelected,
  showCount = true,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const containerRef = useRef(null);
  const searchInputRef = useRef(null);

  // Опцуудыг шүүх
  const filteredOptions = options.filter((option) => {
    if (!searchTerm) return true;
    const label = option.label || option.value || option;
    return label.toString().toLowerCase().includes(searchTerm.toLowerCase());
  });

  // Сонгогдсон утгууд харуулах
  const selectedOptions = options.filter((option) =>
    value.includes(option.value || option)
  );

  const displayValue = () => {
    if (value.length === 0) return placeholder;
    if (showCount) {
      return `${value.length} сонгогдсон`;
    }
    return selectedOptions
      .map((option) => option.label || option.value || option)
      .join(", ");
  };

  // Опц сонгох/хасах
  const handleSelect = (option) => {
    const optionValue = option.value || option;
    const isSelected = value.includes(optionValue);

    if (isSelected) {
      onChange(value.filter((v) => v !== optionValue));
    } else {
      if (maxSelected && value.length >= maxSelected) {
        return;
      }
      onChange([...value, optionValue]);
    }
  };

  // Бүх цэвэрлэх
  const handleClearAll = (e) => {
    e.stopPropagation();
    onChange([]);
    setSearchTerm("");
  };

  // Нэг элементийг хасах
  const handleRemoveItem = (valueToRemove, e) => {
    e.stopPropagation();
    onChange(value.filter((v) => v !== valueToRemove));
  };

  // Гаднаас дарахад хаах
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target)
      ) {
        setIsOpen(false);
        setSearchTerm("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Нээхэд search input-д focus хийх
  useEffect(() => {
    if (isOpen && searchable && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen, searchable]);

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      {/* Select Button */}
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={cn(
          "flex items-center justify-between w-full px-3 py-2 border rounded-md text-left min-h-[40px]",
          "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
          disabled
            ? "bg-gray-100 cursor-not-allowed"
            : "bg-white hover:border-gray-400",
          error && "border-red-500",
          isOpen && "border-blue-500 ring-2 ring-blue-500"
        )}
      >
        <div className="flex-1 min-w-0">
          {value.length === 0 ? (
            <span className="text-sm text-gray-500">{placeholder}</span>
          ) : showCount ? (
            <span className="text-sm text-gray-900">{displayValue()}</span>
          ) : (
            <div className="flex flex-wrap gap-1">
              {selectedOptions.slice(0, 3).map((option, index) => {
                const optionValue = option.value || option;
                const optionLabel = option.label || option.value || option;

                return (
                  <span
                    key={index}
                    className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded"
                  >
                    {renderValue ? renderValue(option) : optionLabel}
                    <button
                      onClick={(e) => handleRemoveItem(optionValue, e)}
                      className="ml-1 hover:bg-blue-200 rounded"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                );
              })}
              {selectedOptions.length > 3 && (
                <span className="text-xs text-gray-500">
                  +{selectedOptions.length - 3} илүү
                </span>
              )}
            </div>
          )}
        </div>
        <div className="flex items-center space-x-1">
          {clearable && value.length > 0 && (
            <button
              onClick={handleClearAll}
              className="p-1 hover:bg-gray-100 rounded"
            >
              <X className="w-4 h-4 text-gray-400" />
            </button>
          )}
          <ChevronDown
            className={cn(
              "w-4 h-4 text-gray-400 transition-transform",
              isOpen && "rotate-180"
            )}
          />
        </div>
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border rounded-md shadow-lg z-50 max-h-60 overflow-hidden">
          {/* Search */}
          {searchable && (
            <div className="p-2 border-b">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Хайх..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          )}

          {/* Select All / Clear All */}
          <div className="p-2 border-b bg-gray-50">
            <div className="flex justify-between">
              <button
                onClick={() => {
                  const allValues = filteredOptions.map(
                    (option) => option.value || option
                  );
                  const newValues = [...new Set([...value, ...allValues])];
                  if (maxSelected) {
                    onChange(newValues.slice(0, maxSelected));
                  } else {
                    onChange(newValues);
                  }
                }}
                className="text-xs text-blue-600 hover:text-blue-800"
                disabled={maxSelected && value.length >= maxSelected}
              >
                Бүгдийг сонгох
              </button>
              <button
                onClick={() => onChange([])}
                className="text-xs text-red-600 hover:text-red-800"
              >
                Бүгдийг цэвэрлэх
              </button>
            </div>
          </div>

          {/* Options */}
          <div className="max-h-48 overflow-y-auto">
            {loading ? (
              <div className="p-3 text-sm text-gray-500 text-center">
                Ачааллаж байна...
              </div>
            ) : filteredOptions.length === 0 ? (
              <div className="p-3 text-sm text-gray-500 text-center">
                {searchTerm ? "Хайлтын үр дүн олдсонгүй" : "Сонголт байхгүй"}
              </div>
            ) : (
              filteredOptions.map((option, index) => {
                const optionValue = option.value || option;
                const optionLabel = option.label || option.value || option;
                const isSelected = value.includes(optionValue);
                const isDisabled =
                  maxSelected && !isSelected && value.length >= maxSelected;

                return (
                  <button
                    key={index}
                    onClick={() => !isDisabled && handleSelect(option)}
                    disabled={isDisabled}
                    className={cn(
                      "w-full px-3 py-2 text-left text-sm hover:bg-gray-50 focus:outline-none focus:bg-gray-50",
                      "flex items-center justify-between",
                      isSelected && "bg-blue-50 text-blue-600",
                      isDisabled && "opacity-50 cursor-not-allowed"
                    )}
                  >
                    <span className="truncate">
                      {renderOption ? renderOption(option) : optionLabel}
                    </span>
                    {isSelected && <Check className="w-4 h-4" />}
                  </button>
                );
              })
            )}
          </div>

          {/* Footer Info */}
          {maxSelected && (
            <div className="p-2 border-t bg-gray-50 text-xs text-gray-500 text-center">
              {value.length} / {maxSelected} сонгогдсон
            </div>
          )}
        </div>
      )}

      {/* Error Message */}
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
};
