"use client";

import { Button } from "@/components/ui/button";
import { Book } from "@/lib/models/models";
import { CaretDownIcon, FunnelIcon, XIcon } from "@phosphor-icons/react";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";

interface Filters {
  eventType: string;
  dateRange: {
    start: Date | null;
    end: Date | null;
  };
  bookId: string;
}

interface ActivityFiltersProps {
  filters: Filters;
  books: Book[];
  eventCount: number;
}

const EVENT_TYPES = [
  { value: "all", label: "All Events" },
  { value: "state_change", label: "Status Changes" },
  { value: "progress_update", label: "Progress Updates" },
  { value: "rating_added", label: "Ratings Added" },
  { value: "comment", label: "Comments" },
  { value: "review", label: "Reviews" },
  { value: "manual_update", label: "Manual Updates" },
  { value: "delete_book", label: "Deleted Books" },
];

interface DropdownProps {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
}

const Dropdown: React.FC<DropdownProps> = ({
  label,
  value,
  options,
  onChange,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedLabel =
    options.find((opt) => opt.value === value)?.label || options[0]?.label;

  return (
    <div className="space-y-2" ref={dropdownRef}>
      <label className="text-sm font-medium text-foreground">{label}</label>
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between px-3 py-2.5 text-sm bg-background border border-border/60 rounded-lg hover:border-brand-accent/40 hover:bg-muted/30 transition-all duration-200"
          aria-expanded={isOpen}
          aria-haspopup="listbox"
        >
          <span className="truncate text-foreground">{selectedLabel}</span>
          <CaretDownIcon
            className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${
              isOpen ? "rotate-180" : ""
            }`}
            weight="bold"
          />
        </button>

        {isOpen && (
          <div className="absolute z-20 w-full mt-1.5 bg-card border border-border/60 rounded-lg shadow-lg overflow-hidden">
            <div className="max-h-52 overflow-y-auto">
              {options.map((option) => (
                <button
                  key={option.value}
                  onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                  }}
                  className={`w-full px-3 py-2.5 text-left text-sm transition-colors ${
                    option.value === value
                      ? "bg-brand-primary/10 text-brand-primary font-medium"
                      : "text-foreground hover:bg-muted/50"
                  }`}
                  role="option"
                  aria-selected={option.value === value}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

interface DateInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
}

const DateInput: React.FC<DateInputProps> = ({ label, value, onChange }) => {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-foreground">{label}</label>
      <input
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2.5 text-sm bg-background border border-border/60 rounded-lg hover:border-brand-accent/40 focus:border-brand-primary focus:ring-1 focus:ring-brand-primary/20 transition-all duration-200 outline-none"
      />
    </div>
  );
};

export const ActivityFilters: React.FC<ActivityFiltersProps> = ({
  filters,
  books,
  eventCount,
}) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const updateURLParams = (updates: Record<string, string>) => {
    const params = new URLSearchParams(searchParams.toString());

    Object.entries(updates).forEach(([key, value]) => {
      if (value === "all" || value === "") {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    });

    const newUrl = `${window.location.pathname}${
      params.toString() ? `?${params.toString()}` : ""
    }`;
    router.push(newUrl);
  };

  const handleClearFilters = () => {
    updateURLParams({
      eventType: "all",
      startDate: "",
      endDate: "",
      bookId: "all",
    });
  };

  const hasActiveFilters =
    filters.eventType !== "all" ||
    filters.bookId !== "all" ||
    filters.dateRange.start ||
    filters.dateRange.end;

  const bookOptions = [
    { value: "all", label: "All Books" },
    ...books.map((book) => ({ value: book.id, label: book.title })),
  ];

  const formatDateValue = (date: Date | null) => {
    if (!date) return "";
    return date.toISOString().split("T")[0];
  };

  return (
    <div className="relative overflow-hidden rounded-xl border border-border/60 bg-gradient-to-br from-card via-card to-brand-accent/[0.02]">
      {/* Decorative corner glow */}
      <div className="absolute -top-16 -right-16 w-32 h-32 bg-brand-primary/[0.04] rounded-full blur-2xl pointer-events-none" />

      {/* Header */}
      <div className="relative p-5 pb-4 border-b border-border/40">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-brand-primary/10">
              <FunnelIcon
                className="h-4 w-4 text-brand-primary"
                weight="duotone"
              />
            </div>
            <h3 className="font-heading font-semibold text-foreground">
              Filters
            </h3>
          </div>
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearFilters}
              className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
            >
              Clear
              <XIcon className="h-3 w-3 ml-1" weight="bold" />
            </Button>
          )}
        </div>
      </div>

      {/* Filters content */}
      <div className="relative p-5 space-y-5">
        <Dropdown
          label="Event Type"
          value={filters.eventType}
          options={EVENT_TYPES}
          onChange={(value) => updateURLParams({ eventType: value })}
        />

        <Dropdown
          label="Book"
          value={filters.bookId}
          options={bookOptions}
          onChange={(value) => updateURLParams({ bookId: value })}
        />

        <DateInput
          label="Start Date"
          value={formatDateValue(filters.dateRange.start)}
          onChange={(value) => updateURLParams({ startDate: value })}
        />

        <DateInput
          label="End Date"
          value={formatDateValue(filters.dateRange.end)}
          onChange={(value) => updateURLParams({ endDate: value })}
        />
      </div>

      {/* Footer */}
      <div className="relative px-5 py-4 border-t border-border/40 bg-muted/20">
        <p className="text-sm text-muted-foreground">
          Showing{" "}
          <span className="font-medium text-foreground">{eventCount}</span>{" "}
          event{eventCount !== 1 ? "s" : ""}
        </p>
      </div>
    </div>
  );
};
