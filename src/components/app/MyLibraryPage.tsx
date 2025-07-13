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
  sortBy: string;
  sortDirection: SortDirection;
  viewMode: ViewMode;
}

export const MyLibraryPage: React.FC<MyLibraryPageProps> = ({
  searchQuery = "",
  onBookClick,
  filterStatus,
  filterOwnership,
  sortBy,
  sortDirection,
  viewMode,
}) => {
  const { books, loading, error, refreshBooks, filterAndSortBooks } =
    useBooksContext();

  const activeFiltersCount = [
    filterStatus !== "all",
    filterOwnership !== "all",
  ].filter(Boolean).length;

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


  return (
    <div className="p-6 space-y-6">
      <LibraryControls
        searchQuery={searchQuery}
        viewMode={viewMode}
        filterStatus={filterStatus as FilterStatus}
        filterOwnership={filterOwnership}
        sortBy={sortBy as SortOption}
        sortDirection={sortDirection}
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
        onClearFilters={() => { /* Handled by URL routing */ }}
        activeFiltersCount={activeFiltersCount}
      />
    </div>
  );
};

export default MyLibraryPage;
