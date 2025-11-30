// components/common/SearchableSelect.jsx
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Check, ChevronsUpDown, Loader2 } from "lucide-react";

const SearchableSelect = ({
  value,
  onValueChange,
  options = [],
  placeholder = "Select...",
  searchPlaceholder = "Search...",
  disabled = false,
  loading = false,
  error = false,
  renderOption = null,
  emptyMessage = "No results found",
}) => {
  const [open, setOpen] = useState(false);
  const listRef = useRef(null);

  const selectedOption = options.find(
    (option) => (option.uuid || option.id) === value
  );

  // Enable mouse wheel scrolling
  useEffect(() => {
    if (open && listRef.current) {
      const handleWheel = (e) => {
        e.stopPropagation();
        const list = listRef.current;
        if (list) {
          list.scrollTop += e.deltaY;
        }
      };

      const listElement = listRef.current;
      if (listElement) {
        listElement.addEventListener("wheel", handleWheel, { passive: false });
        return () => {
          listElement.removeEventListener("wheel", handleWheel);
        };
      }
    }
  }, [open]);

  // Mobile дээр scroll ажиллахгүй байгаа асуудлыг шийдэх
  useEffect(() => {
    const handleTouchMove = (e) => {
      // Зөвхөн popover доторх scroll-д нөлөөлөх
      const popoverContent = document.querySelector(
        "[data-radix-popper-content-wrapper]"
      );
      if (popoverContent && popoverContent.contains(e.target)) {
        e.stopPropagation();
      }
    };

    // Touch move event нэмэх
    document.addEventListener("touchmove", handleTouchMove, {
      passive: false,
      capture: true,
    });

    return () => {
      document.removeEventListener("touchmove", handleTouchMove, {
        capture: true,
      });
    };
  }, []);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "w-full justify-between h-10 px-3 py-2",
            error &&
              "border-destructive focus:border-destructive focus:ring-destructive/20",
            !selectedOption && "text-muted-foreground",
            disabled && "opacity-50 cursor-not-allowed"
          )}
          disabled={disabled || loading}
        >
          {loading ? (
            <div className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Loading...</span>
            </div>
          ) : selectedOption ? (
            <span className="truncate font-normal">
              {selectedOption.name || selectedOption.full_name}
            </span>
          ) : (
            <span>{placeholder}</span>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        avoidCollisions={false}
        forceMount
        className="w-[--radix-popover-trigger-width] p-0 z-[10001]"
        align="start"
        sideOffset={4}
        onWheel={(e) => e.stopPropagation()} // Prevent scroll bubbling
      >
        <Command>
          <CommandInput placeholder={searchPlaceholder} className="h-9" />
          <CommandList
            ref={listRef}
            className="max-h-[200px] overflow-y-auto scrollbar-gutter-stable"
            onWheel={(e) => {
              e.stopPropagation();
              // Let the browser handle the scroll naturally
            }}
            style={{
              overscrollBehavior: "contain",
              WebkitOverflowScrolling: "touch", // For better mobile scrolling
              touchAction: "pan-y", // Mobile дээр scroll зөвшөөрөх
            }}
          >
            <CommandEmpty>{emptyMessage}</CommandEmpty>
            {options.length > 0 && (
              <CommandGroup>
                {options.map((option) => {
                  const optionId = option.uuid || option.id;
                  const isSelected = value === optionId;

                  return (
                    <CommandItem
                      key={optionId}
                      value={`${option.name || option.full_name} ${
                        option.code || ""
                      }`}
                      onSelect={() => {
                        onValueChange(optionId);
                        setOpen(false);
                      }}
                      className="cursor-pointer"
                    >
                      <div className="flex items-center justify-between w-full">
                        <div className="flex flex-col flex-1 min-w-0">
                          <span className="font-normal truncate">
                            {option.name || option.full_name}
                          </span>
                          {option.code && (
                            <span className="text-xs text-muted-foreground truncate">
                              Код: {option.code}
                            </span>
                          )}
                          {renderOption && (
                            <div className="mt-1">{renderOption(option)}</div>
                          )}
                        </div>
                        <Check
                          className={cn(
                            "ml-2 h-4 w-4 shrink-0",
                            isSelected ? "opacity-100" : "opacity-0"
                          )}
                        />
                      </div>
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export default SearchableSelect;
