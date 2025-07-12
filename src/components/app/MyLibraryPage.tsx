"use client";

import * as React from "react";
import { useMemo, useState } from "react";

import { useBooksContext } from "@/lib/providers/BooksProvider";

// Extracted components
import { LibraryControls } from "./library/LibraryControls";
import { LibraryGrid } from "./library/LibraryGrid";

type ViewMode = "grid" | "list";
type SortOption = "title" | "author" | "pages" | "rating" | "progress";
type SortDirection = "asc" | "desc";
type FilterStatus = "all" | "not_started" | "in_progress" | "finished";

interface MyLibraryPageProps {
  searchQuery?: string;
  onBookClick?: (bookId: string) => void;
}

export const MyLibraryPage: React.FC<MyLibraryPageProps> = ({
  searchQuery = "",
  onBookClick,
}) => {
  const { books, loading, error, refreshBooks, filterAndSortBooks } =
    useBooksContext();
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [sortBy, setSortBy] = useState<SortOption>("title");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("all");
  const [filterOwnership, setFilterOwnership] = useState<string>("all");

  const clearFilters = () => {
    setFilterStatus("all");
    setFilterOwnership("all");
    setSortBy("title");
    setSortDirection("asc");
  };

  // Filter and sort books using the service function
  const filteredAndSortedBooks = useMemo(() => {
    return filterAndSortBooks(
      searchQuery,
      filterStatus,
      filterOwnership,
      sortBy,
      sortDirection
    );
  }, [
    searchQuery,
    filterStatus,
    filterOwnership,
    sortBy,
    sortDirection,
    filterAndSortBooks,
  ]);

  const activeFiltersCount = [
    filterStatus !== "all",
    filterOwnership !== "all",
  ].filter(Boolean).length;

  /**
   * Toggles sort direction or changes sort field
   *
   * If clicking the same sort option, toggles between asc/desc.
   * If clicking a different option, switches to that field with asc direction.
   * Used by sort buttons in the UI.
   *
   * @param option - Sort field to toggle/switch to
   */
  const toggleSort = (option: SortOption) => {
    if (sortBy === option) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortBy(option);
      setSortDirection("asc");
    }
  };

  return (
    <div className="p-6 space-y-6">
      <LibraryControls
        searchQuery={searchQuery}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        filterStatus={filterStatus}
        onFilterStatusChange={setFilterStatus}
        filterOwnership={filterOwnership}
        onFilterOwnershipChange={setFilterOwnership}
        sortBy={sortBy}
        sortDirection={sortDirection}
        onSortChange={toggleSort}
        onClearFilters={clearFilters}
        filteredCount={filteredAndSortedBooks.length}
        totalCount={books.length}
      />

      <LibraryGrid
        books={filteredAndSortedBooks}
        viewMode={viewMode}
        onBookClick={onBookClick}
        loading={loading}
        error={error?.message ?? null}
        onRefresh={refreshBooks}
        onClearFilters={clearFilters}
        activeFiltersCount={activeFiltersCount}
      />
    </div>
  );
};

export default MyLibraryPage;
