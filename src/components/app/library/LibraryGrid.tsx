"use client";

import { BookOpenIcon, CircleNotchIcon } from "@phosphor-icons/react";
import * as React from "react";

import BookCard from "@/components/app/books/BookCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Book } from "@/lib/models/models";
import { BookListItem } from "./BookListItem";

type ViewMode = "grid" | "list";

interface LibraryGridProps {
  books: Book[];
  viewMode: ViewMode;
  onBookClick?: (bookId: string) => void;
  loading?: boolean;
  error?: string | null;
  onRefresh?: () => void;
  onClearFilters?: () => void;
  activeFiltersCount?: number;
}

export const LibraryGrid: React.FC<LibraryGridProps> = ({
  books,
  viewMode,
  onBookClick,
  loading = false,
  error = null,
  onRefresh,
  onClearFilters,
  activeFiltersCount = 0,
}) => {
  // Loading State
  if (loading) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <CircleNotchIcon className="h-8 w-8 animate-spin mx-auto mb-4 text-muted-foreground" weight="bold" />
          <p className="text-muted-foreground">Loading your library...</p>
        </CardContent>
      </Card>
    );
  }

  // Error State
  if (error) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <div className="text-destructive mb-4">⚠️</div>
          <h3 className="text-lg font-medium text-foreground mb-2">
            Error loading books
          </h3>
          <p className="text-muted-foreground mb-4">{error}</p>
          {onRefresh && (
            <Button onClick={onRefresh} variant="outline">
              Try again
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  // Empty State
  if (books.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <BookOpenIcon className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
          <h3 className="text-lg font-medium text-foreground mb-2">
            No books found
          </h3>
          <p className="text-muted-foreground">
            {activeFiltersCount > 0
              ? "Try adjusting your filters or search terms"
              : "Your library is empty. Start by adding some books!"}
          </p>
          {activeFiltersCount > 0 && onClearFilters && (
            <Button variant="outline" onClick={onClearFilters} className="mt-4">
              Clear all filters
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  // Books Display
  if (viewMode === "grid") {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {books.map((book) => (
          <BookCard key={book.id} book={book} onBookClick={onBookClick} />
        ))}
      </div>
    );
  } else {
    return (
      <div className="space-y-1">
        {books.map((book) => (
          <BookListItem key={book.id} book={book} onBookClick={onBookClick} />
        ))}
      </div>
    );
  }
};

export default LibraryGrid;
