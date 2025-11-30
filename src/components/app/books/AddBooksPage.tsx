"use client";

import { CameraIcon, CheckIcon, FileTextIcon, CircleNotchIcon, MagnifyingGlassIcon } from "@phosphor-icons/react";
import { useRouter, useSearchParams } from "next/navigation";
import * as React from "react";
import { useEffect, useState } from "react";

import { TIMING_CONFIG, UI_CONFIG } from "@/lib/constants/constants";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { convertGoogleBookToBook } from "@/lib/books/book-utils";
import { Book } from "@/lib/models/models";
import { useAuthContext } from "@/lib/providers/AuthProvider";
import { useBooksContext } from "@/lib/providers/BooksProvider";
import { eventService } from "@/lib/services/EventService";

// Google Books API integration
import { GoogleBooksVolume } from "@/lib/api/google-books-api";
import { useBookSearch } from "@/lib/hooks/useBookSearch";

// Extracted components
import { ManualEntryForm } from "./ManualEntryForm";
import { SearchResults } from "./SearchResults";
import { BarcodeScanner } from "./scanning/BarcodeScanner";

// Error handling components
import { ErrorAlert } from "@/components/ui/error-display";

interface AddBooksPageContentProps {
  searchQuery: string;
  searchType: "title" | "author";
  activeTab: "search" | "manual" | "scan";
}

const AddBooksPageContent: React.FC<AddBooksPageContentProps> = ({
  searchQuery,
  searchType,
  activeTab,
}) => {
  const { user } = useAuthContext();
  const { addBook } = useBooksContext();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { searchResults, isSearching, error, search, clearError } =
    useBookSearch();
  const [addedBooks, setAddedBooks] = useState<Set<string>>(new Set());
  const [recentlyAdded, setRecentlyAdded] = useState<
    Array<{ id: string; title: string; author: string }>
  >([]);
  const [isAdding, setIsAdding] = useState(false);
  const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery);
  const debounceTimerRef = React.useRef<NodeJS.Timeout | null>(null);

  const updateURLParams = (updates: Record<string, string>) => {
    const params = new URLSearchParams(searchParams.toString());

    Object.entries(updates).forEach(([key, value]) => {
      if (value === "search" || value === "title" || value === "") {
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

  // Sync local search query with URL parameter
  useEffect(() => {
    setLocalSearchQuery(searchQuery);
  }, [searchQuery]);

  // Initialize search if query parameter is provided
  useEffect(() => {
    if (searchQuery.trim()) {
      search(searchQuery, undefined, searchType);
    }
  }, [searchQuery, search, searchType]);

  /**
   * Adds a book from Google Books API to user's library
   *
   * Converts the Google Books volume to internal Book model and saves
   * it to Firestore. Updates UI state to show success/failure.
   * Used by SearchResults component when user clicks "Add Book".
   *
   * @param googleBook - Google Books API volume to add
   * @param scanningMetadata - Optional metadata if book was found via barcode scanning
   *
   * @example
   * await handleAddGoogleBook(searchResults[0]);
   */
  const handleAddGoogleBook = async (
    googleBook: GoogleBooksVolume,
    scanningMetadata?: {
      scanMethod: "camera" | "upload";
      isbn: string;
      scanStartTime: number;
    }
  ) => {
    if (!user) {
      // Authentication error - user should be redirected to login
      return;
    }

    setIsAdding(true);
    clearError();

    try {
      const book = convertGoogleBookToBook(googleBook);
      const { id: _id, ...bookData } = book;

      const result = await addBook(bookData);

      if (result.success && result.data) {
        const bookId = result.data;
        setAddedBooks((prev) => new Set([...prev, googleBook.id]));
        setRecentlyAdded((prev) => [
          {
            id: bookId,
            title: book.title,
            author: book.author,
          },
          ...prev.slice(0, UI_CONFIG.RECENTLY_ADDED_BOOKS_LIMIT),
        ]);

        // Log scanning event if book was added via barcode scanning
        if (scanningMetadata) {
          try {
            const scanDuration = Date.now() - scanningMetadata.scanStartTime;
            await eventService.logEvent(user.uid, {
              type: "manual_update",
              bookId: bookId,
              data: {
                comment: `Book added via barcode scanning (${
                  scanningMetadata.scanMethod === "camera"
                    ? "camera"
                    : "image upload"
                }, ISBN: ${scanningMetadata.isbn}, scan duration: ${Math.round(
                  scanDuration / 1000
                )}s)`,
                commentState: book.state,
                commentPage: book.progress.currentPage,
              },
            });
          } catch (error) {
            // Don't break the flow if event logging fails
            console.warn("Failed to log scanning event:", error);
          }
        }
      }
    } catch (error) {
      // Error is handled by the BooksProvider, but log locally for debugging
      console.error("Error adding Google Book:", error);
    } finally {
      setIsAdding(false);
    }
  };

  /**
   * Adds a manually entered book to user's library
   *
   * Saves a Book object (created from form data) to Firestore.
   * Updates UI state to show success/failure.
   * Used by ManualEntryForm component when user submits the form.
   *
   * @param book - Book object created from manual form entry
   *
   * @example
   * const book = convertManualEntryToBook(formData);
   * await handleAddManualBook(book);
   */
  const handleAddManualBook = async (book: Book) => {
    if (!user) {
      // Authentication error - user should be redirected to login
      return;
    }

    setIsAdding(true);

    try {
      const { id: _id, ...bookData } = book;
      const result = await addBook(bookData);

      if (result.success && result.data) {
        const bookId = result.data;
        setRecentlyAdded((prev) => [
          {
            id: bookId,
            title: book.title,
            author: book.author,
          },
          ...prev.slice(0, UI_CONFIG.RECENTLY_ADDED_BOOKS_LIMIT),
        ]);
      }
    } catch (error) {
      // Error is handled by the BooksProvider, but log locally for debugging
      console.error("Error adding manual book:", error);
    } finally {
      setIsAdding(false);
    }
  };

  // Clear error when user starts typing
  React.useEffect(() => {
    if (searchQuery.trim() && error) {
      clearError();
    }
  }, [searchQuery, error, clearError]);

  // Cleanup debounce timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl tracking-tight text-foreground mb-2">
            Add Books
          </h1>
          <p className="text-muted-foreground">
            Search for books online or add them manually to your library.
          </p>
        </div>
      </div>

      {/* Error Message */}
      {error && <ErrorAlert error={error} onDismiss={clearError} />}

      {/* Recently Added */}
      {recentlyAdded.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recently Added</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {recentlyAdded.map((book) => (
                <Badge key={book.id} variant="secondary" className="px-3 py-1">
                  <CheckIcon className="h-3 w-3 mr-1" />
                  {book.title} by {book.author}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Content */}
      <Tabs value={activeTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger
            value="search"
            onClick={() => updateURLParams({ tab: "search" })}
          >
            <MagnifyingGlassIcon className="h-4 w-4 mr-1 sm:mr-2" />
            <span className="inline sm:hidden">Search</span>
            <span className="hidden sm:inline">Search Online</span>
          </TabsTrigger>
          <TabsTrigger
            value="manual"
            onClick={() => updateURLParams({ tab: "manual" })}
          >
            <FileTextIcon className="h-4 w-4 mr-1 sm:mr-2" />
            <span className="inline sm:hidden">Manual</span>
            <span className="hidden sm:inline">Manual Entry</span>
          </TabsTrigger>
          <TabsTrigger
            value="scan"
            onClick={() => updateURLParams({ tab: "scan" })}
          >
            <CameraIcon className="h-4 w-4 mr-1 sm:mr-2" />
            <span className="inline sm:hidden">Scan</span>
            <span className="hidden sm:inline">Scan Barcode</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="search" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Search Books</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                {/* Search Type Toggle */}
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant={searchType === "title" ? "default" : "outline"}
                    size="sm"
                    onClick={() => updateURLParams({ type: "title" })}
                    className="flex-1"
                  >
                    Search by Title
                  </Button>
                  <Button
                    type="button"
                    variant={searchType === "author" ? "default" : "outline"}
                    size="sm"
                    onClick={() => updateURLParams({ type: "author" })}
                    className="flex-1"
                  >
                    Search by Author
                  </Button>
                </div>

                {/* Search Input */}
                <div className="relative">
                  <MagnifyingGlassIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder={`Search by ${searchType}...`}
                    value={localSearchQuery}
                    onChange={(e) => {
                      const value = e.target.value;
                      setLocalSearchQuery(value);

                      // Clear existing timer
                      if (debounceTimerRef.current) {
                        clearTimeout(debounceTimerRef.current);
                      }

                      // Set new timer for debounced URL update
                      debounceTimerRef.current = setTimeout(() => {
                        updateURLParams({ q: value });
                      }, TIMING_CONFIG.SEARCH_DEBOUNCE_MS);
                    }}
                    className="pl-10"
                  />
                </div>
              </div>

              {isSearching ? (
                <div className="flex items-center justify-center py-8">
                  <CircleNotchIcon className="h-6 w-6 animate-spin text-muted-foreground" weight="bold" />
                  <span className="ml-2 text-muted-foreground">
                    Searching...
                  </span>
                </div>
              ) : (
                <SearchResults
                  books={searchResults}
                  addedBooks={addedBooks}
                  onAddBook={handleAddGoogleBook}
                  isAdding={isAdding}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="manual" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Add Book Manually</CardTitle>
            </CardHeader>
            <CardContent>
              <ManualEntryForm
                onAddBook={handleAddManualBook}
                isAdding={isAdding}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="scan" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Scan Barcode</CardTitle>
            </CardHeader>
            <CardContent>
              <BarcodeScanner
                onAddBook={handleAddGoogleBook}
                isAdding={isAdding}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

interface AddBooksPageProps {
  searchQuery: string;
  searchType: "title" | "author";
  activeTab: "search" | "manual" | "scan";
}

// Main component - no longer needs Suspense since it's handled in the page route
export const AddBooksPage: React.FC<AddBooksPageProps> = (props) => {
  return <AddBooksPageContent {...props} />;
};

export default AddBooksPage;
