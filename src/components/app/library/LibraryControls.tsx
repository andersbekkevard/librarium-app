"use client";

import {
  Grid,
  List,
  SortAsc,
  SortDesc,
  X,
} from "lucide-react";
import * as React from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

type ViewMode = "grid" | "list";
type SortOption = "title" | "author" | "pages" | "rating" | "progress";
type SortDirection = "asc" | "desc";
type FilterStatus = "all" | "not_started" | "in_progress" | "finished";

interface LibraryControlsProps {
  // Search
  searchQuery?: string;
  
  // View mode
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  
  // Filters
  filterStatus: FilterStatus;
  onFilterStatusChange: (status: FilterStatus) => void;
  filterOwnership: string;
  onFilterOwnershipChange: (ownership: string) => void;
  
  // Sorting
  sortBy: SortOption;
  sortDirection: SortDirection;
  onSortChange: (option: SortOption) => void;
  
  // Clear filters
  onClearFilters: () => void;
  
  // Results count
  filteredCount: number;
  totalCount: number;
}

export const LibraryControls: React.FC<LibraryControlsProps> = ({
  searchQuery = "",
  viewMode,
  onViewModeChange,
  filterStatus,
  onFilterStatusChange,
  filterOwnership,
  onFilterOwnershipChange,
  sortBy,
  sortDirection,
  onSortChange,
  onClearFilters,
  filteredCount,
  totalCount,
}) => {
  const activeFiltersCount = [
    filterStatus !== "all",
    filterOwnership !== "all",
  ].filter(Boolean).length;

  return (
    <div className="space-y-4">
      {/* Header with view toggle */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground mb-2">
            My Library
          </h1>
          <p className="text-muted-foreground">
            Manage and organize your book collection
          </p>
        </div>

        {/* View Toggle */}
        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === "grid" ? "default" : "outline"}
            size="sm"
            onClick={() => onViewModeChange("grid")}
          >
            <Grid className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === "list" ? "default" : "outline"}
            size="sm"
            onClick={() => onViewModeChange("list")}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Controls */}
      <Card>
        <CardContent className="p-4 space-y-4">
          {/* Search info - controlled by header */}
          {searchQuery.trim() && (
            <div className="bg-muted/50 p-3 rounded-md">
              <p className="text-sm text-muted-foreground">
                Searching for:{" "}
                <span className="font-medium text-foreground">
                  &quot;{searchQuery}&quot;
                </span>
              </p>
            </div>
          )}

          {/* Filters and Sorting */}
          <div className="flex flex-wrap gap-4 items-center">
            {/* Status Filter */}
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Status:</span>
              <select
                value={filterStatus}
                onChange={(e) =>
                  onFilterStatusChange(e.target.value as FilterStatus)
                }
                className="bg-background border border-input rounded-md px-3 py-1 text-sm"
              >
                <option value="all">All</option>
                <option value="not_started">Not Started</option>
                <option value="in_progress">Reading</option>
                <option value="finished">Finished</option>
              </select>
            </div>

            {/* Ownership Filter */}
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Ownership:</span>
              <select
                value={filterOwnership}
                onChange={(e) => onFilterOwnershipChange(e.target.value)}
                className="bg-background border border-input rounded-md px-3 py-1 text-sm"
              >
                <option value="all">All Books</option>
                <option value="owned">Owned</option>
                <option value="wishlist">Wishlist</option>
              </select>
            </div>

            {/* Sort Options */}
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Sort by:</span>
              <div className="flex gap-1">
                {[
                  { key: "title" as const, label: "Title" },
                  { key: "author" as const, label: "Author" },
                  { key: "pages" as const, label: "Pages" },
                  { key: "rating" as const, label: "Rating" },
                  { key: "progress" as const, label: "Progress" },
                ].map(({ key, label }) => (
                  <Button
                    key={key}
                    variant={sortBy === key ? "default" : "outline"}
                    size="sm"
                    onClick={() => onSortChange(key)}
                    className="flex items-center gap-1"
                  >
                    {label}
                    {sortBy === key &&
                      (sortDirection === "asc" ? (
                        <SortAsc className="h-3 w-3" />
                      ) : (
                        <SortDesc className="h-3 w-3" />
                      ))}
                  </Button>
                ))}
              </div>
            </div>

            {/* Clear Filters */}
            {activeFiltersCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onClearFilters}
                className="flex items-center gap-1"
              >
                <X className="h-3 w-3" />
                Clear Filters ({activeFiltersCount})
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Results Summary */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing {filteredCount} of {totalCount} books
        </p>
      </div>
    </div>
  );
};

export default LibraryControls;