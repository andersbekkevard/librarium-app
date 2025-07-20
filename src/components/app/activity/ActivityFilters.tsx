import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Book } from "@/lib/models/models";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Filter, X, ChevronDown } from "lucide-react";
import { format } from "date-fns";

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
        // Remove default values to keep URLs clean
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

  const handleEventTypeChange = (value: string) => {
    updateURLParams({ eventType: value });
  };

  const handleBookChange = (value: string) => {
    updateURLParams({ bookId: value });
  };


  const hasActiveFilters =
    filters.eventType !== "all" ||
    filters.bookId !== "all" ||
    filters.dateRange.start ||
    filters.dateRange.end;

  const [showEventTypeMenu, setShowEventTypeMenu] = useState(false);
  const [showBookMenu, setShowBookMenu] = useState(false);

  const getEventTypeLabel = (value: string) => {
    return EVENT_TYPES.find(type => type.value === value)?.label || "All Events";
  };

  const getBookLabel = (value: string) => {
    if (value === "all") return "All Books";
    return books.find(book => book.id === value)?.title || "Unknown Book";
  };

  const handleDateInputChange = (field: 'start' | 'end', value: string) => {
    const paramKey = field === 'start' ? 'startDate' : 'endDate';
    updateURLParams({ [paramKey]: value });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Filter className="h-4 w-4" />
          Filters
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearFilters}
              className="ml-auto h-7 px-2 text-xs"
            >
              Clear all
              <X className="h-3 w-3 ml-1" />
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Event Type Filter */}
        <div>
          <label className="text-sm font-medium mb-2 block">Event Type</label>
          <div className="relative">
            <button
              onClick={() => setShowEventTypeMenu(!showEventTypeMenu)}
              className="w-full flex items-center justify-between px-3 py-2 text-sm border rounded-md hover:bg-muted/50 transition-colors"
            >
              <span>{getEventTypeLabel(filters.eventType)}</span>
              <ChevronDown className="h-4 w-4" />
            </button>
            {showEventTypeMenu && (
              <div className="absolute z-10 w-full mt-1 bg-background border rounded-md shadow-lg">
                {EVENT_TYPES.map((type) => (
                  <button
                    key={type.value}
                    onClick={() => {
                      handleEventTypeChange(type.value);
                      setShowEventTypeMenu(false);
                    }}
                    className="w-full px-3 py-2 text-left text-sm hover:bg-muted transition-colors"
                  >
                    {type.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Book Filter */}
        <div>
          <label className="text-sm font-medium mb-2 block">Book</label>
          <div className="relative">
            <button
              onClick={() => setShowBookMenu(!showBookMenu)}
              className="w-full flex items-center justify-between px-3 py-2 text-sm border rounded-md hover:bg-muted/50 transition-colors truncate"
            >
              <span className="truncate">{getBookLabel(filters.bookId)}</span>
              <ChevronDown className="h-4 w-4 flex-shrink-0" />
            </button>
            {showBookMenu && (
              <div className="absolute z-10 w-full mt-1 bg-background border rounded-md shadow-lg max-h-48 overflow-y-auto">
                <button
                  onClick={() => {
                    handleBookChange("all");
                    setShowBookMenu(false);
                  }}
                  className="w-full px-3 py-2 text-left text-sm hover:bg-muted transition-colors"
                >
                  All Books
                </button>
                {books.map((book) => (
                  <button
                    key={book.id}
                    onClick={() => {
                      handleBookChange(book.id);
                      setShowBookMenu(false);
                    }}
                    className="w-full px-3 py-2 text-left text-sm hover:bg-muted transition-colors truncate"
                  >
                    {book.title}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Date Range Filter */}
        <div>
          <label className="text-sm font-medium mb-2 block">Start Date</label>
          <Input
            type="date"
            value={filters.dateRange.start ? format(filters.dateRange.start, "yyyy-MM-dd") : ""}
            onChange={(e) => handleDateInputChange("start", e.target.value)}
            className="text-sm"
          />
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block">End Date</label>
          <Input
            type="date"
            value={filters.dateRange.end ? format(filters.dateRange.end, "yyyy-MM-dd") : ""}
            onChange={(e) => handleDateInputChange("end", e.target.value)}
            className="text-sm"
          />
        </div>

        {/* Results Summary */}
        <div className="pt-4 border-t">
          <div className="text-sm text-muted-foreground">
            Showing {eventCount} event{eventCount !== 1 ? 's' : ''}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};