"use client";

import * as React from "react";
import { useMemo } from "react";

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
  filterStatus: string;
  filterOwnership: string;
  filterGenre: string;
  sortBy: string;
  sortDirection: SortDirection;
  viewMode: ViewMode;
}

export const MyLibraryPage: React.FC<MyLibraryPageProps> = ({
  searchQuery = "",
  onBookClick,
  filterStatus,
  filterOwnership,
  filterGenre,
  sortBy,
  sortDirection,
  viewMode,
}) => {
  const { books, loading, error, refreshBooks, filterAndSortBooks, getAvailableGenres } =
    useBooksContext();

  const activeFiltersCount = [
    filterStatus !== "all",
    filterOwnership !== "all",
    filterGenre !== "all",
  ].filter(Boolean).length;

  // Filter and sort books using the provider function
  const filteredAndSortedBooks = useMemo(() => {
    return filterAndSortBooks(
      searchQuery,
      filterStatus,
      filterOwnership,
      filterGenre,
      sortBy,
      sortDirection
    );
  }, [
    searchQuery,
    filterStatus,
    filterOwnership,
    filterGenre,
    sortBy,
    sortDirection,
    filterAndSortBooks,
  ]);

  return (
    <div className="p-6 space-y-6 overflow-x-hidden">
      <LibraryControls
        searchQuery={searchQuery}
        viewMode={viewMode}
        filterStatus={filterStatus as FilterStatus}
        filterOwnership={filterOwnership}
        filterGenre={filterGenre}
        sortBy={sortBy as SortOption}
        sortDirection={sortDirection}
        availableGenres={getAvailableGenres()}
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
        onClearFilters={() => {
          /* Handled by URL routing */
        }}
        activeFiltersCount={activeFiltersCount}
      />
    </div>
  );
};

export default MyLibraryPage;
