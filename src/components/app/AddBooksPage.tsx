"use client";

import { Camera, Check, FileText, Loader2, Search } from "lucide-react";
import { useSearchParams } from "next/navigation";
import * as React from "react";
import { useEffect, useState } from "react";

import { TIMING_CONFIG, UI_CONFIG } from "@/lib/constants/constants";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { convertGoogleBookToBook } from "@/lib/books/book-utils";
import { Book } from "@/lib/models/models";
import { useAuthContext } from "@/lib/providers/AuthProvider";
import { useBooksContext } from "@/lib/providers/BooksProvider";

// Google Books API integration
import { GoogleBooksVolume } from "@/lib/api/google-books-api";
import { useBookSearch } from "@/lib/hooks/useBookSearch";

// Extracted components
import { ManualEntryForm } from "./books/ManualEntryForm";
import { SearchResults } from "./books/SearchResults";

// Error handling components
import { ErrorAlert } from "@/components/ui/error-display";

export const AddBooksPage = () => {
  const { user } = useAuthContext();
  const { addBook } = useBooksContext();
  const searchParams = useSearchParams();
  const initialSearchQuery = searchParams.get("q") || "";
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery);
  const { searchResults, isSearching, error, search, clearError } =
    useBookSearch();
  const [addedBooks, setAddedBooks] = useState<Set<string>>(new Set());
  const [recentlyAdded, setRecentlyAdded] = useState<
    Array<{ id: string; title: string; author: string }>
  >([]);
  const [isAdding, setIsAdding] = useState(false);

  // Initialize search if query parameter is provided
  useEffect(() => {
    if (initialSearchQuery.trim()) {
      search(initialSearchQuery);
    }
  }, [initialSearchQuery, search]);

  /**
   * Adds a book from Google Books API to user's library
   *
   * Converts the Google Books volume to internal Book model and saves
   * it to Firestore. Updates UI state to show success/failure.
   * Used by SearchResults component when user clicks "Add Book".
   *
   * @param googleBook - Google Books API volume to add
   *
   * @example
   * await handleAddGoogleBook(searchResults[0]);
   */
  const handleAddGoogleBook = async (googleBook: GoogleBooksVolume) => {
    if (!user) {
      // Authentication error - user should be redirected to login
      return;
    }

    setIsAdding(true);
    clearError();

    try {
      const book = convertGoogleBookToBook(googleBook);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { id, ...bookData } = book;

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
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { id, ...bookData } = book;
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

  // Debounced search effect
  React.useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (searchQuery.trim()) {
        search(searchQuery);
      }
      // Note: clearResults is handled by the hook when search is called with empty query
    }, TIMING_CONFIG.SEARCH_DEBOUNCE_MS); // Debounce time for API calls

    return () => clearTimeout(debounceTimer);
  }, [searchQuery, search]);

  // Clear error when user starts typing
  React.useEffect(() => {
    if (searchQuery.trim() && error) {
      clearError();
    }
  }, [searchQuery, error, clearError]);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground mb-2">
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
                  <Check className="h-3 w-3 mr-1" />
                  {book.title} by {book.author}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Content */}
      <Tabs defaultValue="search" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="search">
            <Search className="h-4 w-4 mr-2" />
            Search Online
          </TabsTrigger>
          <TabsTrigger value="manual">
            <FileText className="h-4 w-4 mr-2" />
            Manual Entry
          </TabsTrigger>
          <TabsTrigger value="scan">
            <Camera className="h-4 w-4 mr-2" />
            Scan Barcode
          </TabsTrigger>
        </TabsList>

        <TabsContent value="search" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Search Books</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by title, author, or ISBN..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {isSearching && (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  <span className="ml-2 text-muted-foreground">
                    Searching...
                  </span>
                </div>
              )}

              <SearchResults
                books={searchResults}
                addedBooks={addedBooks}
                onAddBook={handleAddGoogleBook}
                isAdding={isAdding}
              />
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
              <div className="text-center py-8">
                <Camera className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground mb-4">
                  Barcode scanning feature coming soon!
                </p>
                <p className="text-sm text-muted-foreground">
                  Use manual entry or search for now.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AddBooksPage;
