"use client";

import * as React from "react";
import { useState, useMemo, useEffect } from "react";
import {
  Grid,
  List,
  SortAsc,
  SortDesc,
  X,
  BookOpen,
  Star,
  User,
  Loader2,
} from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import BookCard from "@/components/app/BookCard";
import { Book } from "@/lib/models";
import { bookOperations } from "@/lib/firebase-utils";
import { useAuth } from "@/lib/useAuth";

type ViewMode = "grid" | "list";
type SortOption = "title" | "author" | "pages" | "rating" | "progress";
type SortDirection = "asc" | "desc";
type FilterStatus = "all" | "not_started" | "in_progress" | "finished";

interface BookListItemProps {
  book: Book;
  onEdit: (book: Book) => void;
  onUpdateProgress: (book: Book) => void;
  onBookClick?: (bookId: string) => void;
}

export const BookListItem: React.FC<BookListItemProps> = ({
  book,
  onEdit,
  onUpdateProgress,
  onBookClick,
}) => {
  const getProgressPercentage = () => {
    if (book.state === "finished") return 100;
    if (book.state === "in_progress") {
      return book.progress.percentage || 0;
    }
    return 0;
  };

  const getStatusBadge = () => {
    switch (book.state) {
      case "not_started":
        return <Badge variant="secondary">Not Started</Badge>;
      case "in_progress":
        return <Badge variant="default">Reading</Badge>;
      case "finished":
        return <Badge variant="outline">Finished</Badge>;
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-3 w-3 ${
          i < rating
            ? "fill-status-warning text-status-warning"
            : "fill-muted text-muted"
        }`}
      />
    ));
  };

  const handleCardClick = () => {
    if (onBookClick) {
      onBookClick(book.id);
    }
  };

  const handleButtonClick = (e: React.MouseEvent, action: () => void) => {
    e.stopPropagation();
    action();
  };

  return (
    <Card 
      className="w-full cursor-pointer transition-all duration-200 hover:shadow-md hover:border-brand-primary/20"
      onClick={handleCardClick}
    >
      <CardContent className="p-2">
        <div className="flex gap-2 items-center">
          {/* Cover Image */}
          <div className="flex-shrink-0">
            <div className="w-8 h-11 bg-muted rounded flex items-center justify-center">
              {book.coverImage ? (
                <img
                  src={book.coverImage}
                  alt={`${book.title} cover`}
                  className="w-full h-full object-cover rounded"
                />
              ) : (
                <BookOpen className="h-3 w-3 text-muted-foreground" />
              )}
            </div>
          </div>

          {/* Book Details */}
          <div className="flex-1 grid grid-cols-1 md:grid-cols-6 gap-2 items-center">
            <div className="md:col-span-2">
              <h3 className="font-semibold text-foreground truncate">
                {book.title}
              </h3>
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <User className="h-3 w-3" />
                {book.author}
              </p>
            </div>

            <div className="text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <BookOpen className="h-3 w-3" />
                {book.progress.totalPages || "?"} pages
              </span>
            </div>

            <div>
              {book.isOwned ? (
                <Badge variant="outline" className="text-xs">
                  Owned
                </Badge>
              ) : (
                <Badge variant="secondary" className="text-xs">
                  Wishlist
                </Badge>
              )}
            </div>

            <div className="flex items-center justify-center">
              {getStatusBadge()}
            </div>

            <div className="flex items-center justify-between">
              {/* Rating or Progress */}
              <div className="flex items-center gap-1">
                {book.state === "finished" && book.rating ? (
                  <div className="flex items-center gap-1">
                    {renderStars(book.rating)}
                    <span className="text-xs text-muted-foreground ml-1">
                      ({book.rating}/5)
                    </span>
                  </div>
                ) : book.state === "in_progress" ? (
                  <div className="text-xs text-muted-foreground">
                    {getProgressPercentage()}% complete
                  </div>
                ) : (
                  <div className="text-xs text-muted-foreground">
                    Not started
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => handleButtonClick(e, () => onEdit(book))}
                  className="h-8 w-8 p-0"
                >
                  <span className="sr-only">Edit</span>
                  ✏️
                </Button>
                {book.state === "in_progress" && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => handleButtonClick(e, () => onUpdateProgress(book))}
                    className="h-8 w-8 p-0"
                  >
                    <span className="sr-only">Update Progress</span>
                    📖
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

interface MyLibraryPageProps {
  searchQuery?: string;
  onBookClick?: (bookId: string) => void;
}

export const MyLibraryPage: React.FC<MyLibraryPageProps> = ({
  searchQuery = "",
  onBookClick,
}) => {
  const { user, loading: authLoading } = useAuth();
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [sortBy, setSortBy] = useState<SortOption>("title");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("all");
  const [filterOwnership, setFilterOwnership] = useState<string>("all");

  // Load user's books from Firestore
  useEffect(() => {
    if (authLoading || !user) {
      setLoading(authLoading);
      return;
    }

    setLoading(true);
    setError(null);

    // Subscribe to real-time updates of user's books
    const unsubscribe = bookOperations.subscribeToUserBooks(
      user.uid,
      (userBooks) => {
        setBooks(userBooks);
        setLoading(false);
      },
    );

    return unsubscribe;
  }, [user, authLoading]);

  // Filter and sort books
  const filteredAndSortedBooks = useMemo(() => {
    let filtered = books;

    // Apply search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(
        (book) =>
          book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          book.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
          book.description?.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    }

    // Apply status filter
    if (filterStatus !== "all") {
      filtered = filtered.filter((book) => book.state === filterStatus);
    }

    // Apply ownership filter
    if (filterOwnership !== "all") {
      filtered = filtered.filter((book) =>
        filterOwnership === "owned" ? book.isOwned : !book.isOwned,
      );
    }

    // Apply sorting
    const sorted = [...filtered].sort((a, b) => {
      let aValue: string | number;
      let bValue: string | number;

      switch (sortBy) {
        case "title":
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
          break;
        case "author":
          aValue = a.author.toLowerCase();
          bValue = b.author.toLowerCase();
          break;
        case "pages":
          aValue = a.progress.totalPages || 0;
          bValue = b.progress.totalPages || 0;
          break;
        case "rating":
          aValue = a.rating || 0;
          bValue = b.rating || 0;
          break;
        case "progress":
          const aProgress =
            a.state === "finished" ? 100 : a.progress.percentage || 0;
          const bProgress =
            b.state === "finished" ? 100 : b.progress.percentage || 0;
          aValue = aProgress;
          bValue = bProgress;
          break;
        default:
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
      }

      if (typeof aValue === "string" && typeof bValue === "string") {
        return sortDirection === "asc"
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      } else {
        return sortDirection === "asc"
          ? (aValue as number) - (bValue as number)
          : (bValue as number) - (aValue as number);
      }
    });

    return sorted;
  }, [
    books,
    searchQuery,
    filterStatus,
    filterOwnership,
    sortBy,
    sortDirection,
  ]);

  const handleEdit = async (book: Book) => {
    if (!user) return;
    // TODO: Implement edit dialog/modal
    console.log("Edit book:", book.title);
  };

  const handleUpdateProgress = async (book: Book) => {
    if (!user) return;
    // TODO: Implement progress update dialog/modal
    console.log("Update progress for:", book.title);
  };

  const toggleSort = (option: SortOption) => {
    if (sortBy === option) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortBy(option);
      setSortDirection("asc");
    }
  };

  const clearFilters = () => {
    setFilterStatus("all");
    setFilterOwnership("all");
    setSortBy("title");
    setSortDirection("asc");
  };

  const activeFiltersCount = [
    filterStatus !== "all",
    filterOwnership !== "all",
  ].filter(Boolean).length;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
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
            onClick={() => setViewMode("grid")}
          >
            <Grid className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === "list" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("list")}
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
                  setFilterStatus(e.target.value as FilterStatus)
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
                onChange={(e) => setFilterOwnership(e.target.value)}
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
                    onClick={() => toggleSort(key)}
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
                onClick={clearFilters}
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
          Showing {filteredAndSortedBooks.length} of {books.length} books
        </p>
      </div>

      {/* Loading State */}
      {loading && (
        <Card>
          <CardContent className="p-12 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">Loading your library...</p>
          </CardContent>
        </Card>
      )}

      {/* Error State */}
      {error && (
        <Card>
          <CardContent className="p-12 text-center">
            <div className="text-destructive mb-4">⚠️</div>
            <h3 className="text-lg font-medium text-foreground mb-2">
              Error loading books
            </h3>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={() => window.location.reload()} variant="outline">
              Try again
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Books Display */}
      {!loading && !error && (
        <>
          {viewMode === "grid" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
              {filteredAndSortedBooks.map((book) => (
                <BookCard
                  key={book.id}
                  book={book}
                  onEdit={handleEdit}
                  onUpdateProgress={handleUpdateProgress}
                  onBookClick={onBookClick}
                />
              ))}
            </div>
          ) : (
            <div className="space-y-1">
              {filteredAndSortedBooks.map((book) => (
                <BookListItem
                  key={book.id}
                  book={book}
                  onEdit={handleEdit}
                  onUpdateProgress={handleUpdateProgress}
                  onBookClick={onBookClick}
                />
              ))}
            </div>
          )}
        </>
      )}

      {/* Empty State */}
      {!loading && !error && filteredAndSortedBooks.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <BookOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-lg font-medium text-foreground mb-2">
              No books found
            </h3>
            <p className="text-muted-foreground">
              {activeFiltersCount > 0
                ? "Try adjusting your filters or search terms"
                : "Your library is empty. Start by adding some books!"}
            </p>
            {activeFiltersCount > 0 && (
              <Button variant="outline" onClick={clearFilters} className="mt-4">
                Clear all filters
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default MyLibraryPage;
