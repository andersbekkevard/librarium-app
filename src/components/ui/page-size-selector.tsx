/**
 * PageSizeSelector component
 * 
 * Allows users to select how many items to display per page
 * with both dropdown options and custom input capability
 */

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronDown, Check } from "lucide-react";
import { cn } from "@/lib/utils/utils";
import { DEFAULT_PAGE_SIZE_OPTIONS, validatePageSize } from "@/lib/utils/pagination-utils";

interface PageSizeSelectorProps {
  pageSize: number;
  onPageSizeChange: (size: number) => void;
  totalItems: number;
  options?: number[];
  allowCustom?: boolean;
  className?: string;
}

export const PageSizeSelector: React.FC<PageSizeSelectorProps> = ({
  pageSize,
  onPageSizeChange,
  totalItems,
  options = DEFAULT_PAGE_SIZE_OPTIONS,
  allowCustom = true,
  className,
}) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [customValue, setCustomValue] = React.useState("");
  const [showCustomInput, setShowCustomInput] = React.useState(false);
  
  const dropdownRef = React.useRef<HTMLDivElement>(null);
  const customInputRef = React.useRef<HTMLInputElement>(null);

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setShowCustomInput(false);
        setCustomValue("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Focus custom input when shown
  React.useEffect(() => {
    if (showCustomInput && customInputRef.current) {
      customInputRef.current.focus();
    }
  }, [showCustomInput]);

  const handleOptionClick = (size: number) => {
    onPageSizeChange(size);
    setIsOpen(false);
    setShowCustomInput(false);
    setCustomValue("");
  };

  const handleCustomSubmit = () => {
    const parsed = parseInt(customValue, 10);
    if (!isNaN(parsed)) {
      const validated = validatePageSize(parsed);
      onPageSizeChange(validated);
    }
    setIsOpen(false);
    setShowCustomInput(false);
    setCustomValue("");
  };

  const handleCustomKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleCustomSubmit();
    } else if (e.key === "Escape") {
      setShowCustomInput(false);
      setCustomValue("");
      setIsOpen(false);
    }
  };

  const isCustomSize = !options.includes(pageSize);

  return (
    <div className={cn("relative inline-block text-left", className)} ref={dropdownRef}>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 text-sm"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label="Items per page"
      >
        <span>{pageSize} per page</span>
        <ChevronDown className={cn("h-3 w-3 transition-transform", isOpen && "rotate-180")} />
      </Button>

      {isOpen && (
        <div className="absolute bottom-full left-0 z-50 mb-1 w-48 rounded-md border bg-background shadow-lg">
          <div className="py-1" role="listbox">
            {options.map((size) => (
              <button
                key={size}
                onClick={() => handleOptionClick(size)}
                className={cn(
                  "flex w-full items-center justify-between px-3 py-2 text-left text-sm hover:bg-muted transition-colors",
                  size === pageSize && "bg-muted"
                )}
                role="option"
                aria-selected={size === pageSize}
              >
                <span>{size} per page</span>
                {size === pageSize && <Check className="h-3 w-3 text-foreground" />}
              </button>
            ))}
            
            {/* Custom size option */}
            {allowCustom && (
              <>
                <div className="border-t border-border my-1" />
                {!showCustomInput ? (
                  <button
                    onClick={() => {
                      setShowCustomInput(true);
                      setCustomValue(pageSize.toString());
                    }}
                    className={cn(
                      "flex w-full items-center justify-between px-3 py-2 text-left text-sm hover:bg-muted transition-colors",
                      isCustomSize && "bg-muted"
                    )}
                  >
                    <span>
                      {isCustomSize ? `${pageSize} per page` : "Custom..."}
                    </span>
                    {isCustomSize && <Check className="h-3 w-3 text-foreground" />}
                  </button>
                ) : (
                  <div className="px-3 py-2">
                    <Input
                      ref={customInputRef}
                      type="number"
                      value={customValue}
                      onChange={(e) => setCustomValue(e.target.value)}
                      onKeyDown={handleCustomKeyDown}
                      onBlur={handleCustomSubmit}
                      placeholder="Enter number"
                      className="h-8 text-sm"
                      min="5"
                      max="500"
                    />
                    <div className="mt-1 text-xs text-muted-foreground">
                      Press Enter to apply
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * Simple page size selector for compact layouts
 */
interface SimplePageSizeSelectorProps {
  pageSize: number;
  onPageSizeChange: (size: number) => void;
  options?: number[];
  className?: string;
}

export const SimplePageSizeSelector: React.FC<SimplePageSizeSelectorProps> = ({
  pageSize,
  onPageSizeChange,
  options = DEFAULT_PAGE_SIZE_OPTIONS,
  className,
}) => {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <span className="text-sm text-muted-foreground">Show:</span>
      <select
        value={pageSize}
        onChange={(e) => onPageSizeChange(parseInt(e.target.value, 10))}
        className="text-sm border rounded px-2 py-1 bg-background"
        aria-label="Items per page"
      >
        {options.map((size) => (
          <option key={size} value={size}>
            {size}
          </option>
        ))}
      </select>
      <span className="text-sm text-muted-foreground">per page</span>
    </div>
  );
};