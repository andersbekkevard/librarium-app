"use client";

import {
  Grid,
  List,
  SortAsc,
  SortDesc,
  X,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
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
  filterStatus: FilterStatus;
  filterOwnership: string;
  filterGenre: string;
  sortBy: SortOption;
  sortDirection: SortDirection;
  
  // Available genres
  availableGenres: string[];
  
  // Results count
  filteredCount: number;
  totalCount: number;
}

export const LibraryControls: React.FC<LibraryControlsProps> = ({
  searchQuery = "",
  viewMode,
  filterStatus,
  filterOwnership,
  filterGenre,
  sortBy,
  sortDirection,
  availableGenres,
  filteredCount,
  totalCount,
}) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const activeFiltersCount = [
    filterStatus !== "all",
    filterOwnership !== "all",
    filterGenre !== "all",
  ].filter(Boolean).length;

  const updateURLParams = (updates: Record<string, string>) => {
    const params = new URLSearchParams(searchParams.toString());
    
    Object.entries(updates).forEach(([key, value]) => {
      if (value === "all" || value === "title" || value === "asc" || value === "grid") {
        // Remove default values to keep URLs clean
        params.delete(key);
      } else {
        params.set(key, value);
      }
    });

    const newUrl = `${window.location.pathname}${params.toString() ? `?${params.toString()}` : ''}`;
    router.push(newUrl);
  };

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
            onClick={() => updateURLParams({ view: "grid" })}
          >
            <Grid className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === "list" ? "default" : "outline"}
            size="sm"
            onClick={() => updateURLParams({ view: "list" })}
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
                  updateURLParams({ filter: e.target.value })
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
                onChange={(e) => updateURLParams({ ownership: e.target.value })}
                className="bg-background border border-input rounded-md px-3 py-1 text-sm"
              >
                <option value="all">All Books</option>
                <option value="owned">Owned</option>
                <option value="wishlist">Wishlist</option>
              </select>
            </div>

            {/* Genre Filter - COMMENTED OUT FOR NOW
                Features implemented but disabled:
                - Filters books by genre from user's collection only
                - Syncs with URL routing (?genre=Fiction)
                - Auto-extracts unique genres from book collection
                - Truncates long genre names for compact display
                - Integrates with existing filter system
                
                To re-enable: uncomment this block and ensure filterGenre 
                and availableGenres props are passed to LibraryControls
            */}
            {/* {availableGenres.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Genre:</span>
                <select
                  value={filterGenre}
                  onChange={(e) => updateURLParams({ genre: e.target.value })}
                  className="bg-background border border-input rounded-md px-3 py-1 text-sm w-24 max-w-24"
                >
                  <option value="all">All</option>
                  {availableGenres.map((genre) => (
                    <option key={genre} value={genre}>
                      {genre.length > 8 ? `${genre.slice(0, 8)}...` : genre}
                    </option>
                  ))}
                </select>
              </div>
            )} */}

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
                    onClick={() => {
                      const newDirection = sortBy === key && sortDirection === "asc" ? "desc" : "asc";
                      updateURLParams({ sort: key, direction: newDirection });
                    }}
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
                onClick={() => updateURLParams({ filter: "all", ownership: "all", genre: "all", sort: "title", direction: "asc", view: "grid" })}
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