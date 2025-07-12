"use client";

import {
  AlertCircle,
  Camera,
  Check,
  FileText,
  Loader2,
  Search,
} from "lucide-react";
import * as React from "react";
import { useState } from "react";

import { TIMING_CONFIG, UI_CONFIG } from "@/lib/constants";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { convertGoogleBookToBook } from "@/lib/book-utils";
import { Book } from "@/lib/models";
import { useAuthContext } from "@/lib/providers/AuthProvider";
import { useBooksContext } from "@/lib/providers/BooksProvider";

// Google Books API integration
import { GoogleBooksVolume } from "@/lib/google-books-api";
import { useBookSearch } from "@/lib/hooks/useBookSearch";

// Extracted components
import { ManualEntryForm } from "./books/ManualEntryForm";
import { SearchResults } from "./books/SearchResults";

export const AddBooksPage = () => {
  const { user } = useAuthContext();
  const { addBook } = useBooksContext();
  const [searchQuery, setSearchQuery] = useState("");
  const { searchResults, isSearching, error, search, clearError } =
    useBookSearch();
  const [addedBooks, setAddedBooks] = useState<Set<string>>(new Set());
  const [recentlyAdded, setRecentlyAdded] = useState<
    Array<{ id: string; title: string; author: string }>
  >([]);
  const [isAdding, setIsAdding] = useState(false);

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
      {error && (
        <Card className="border-destructive">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-4 w-4" />
              <p className="text-sm font-medium">{error}</p>
            </div>
          </CardContent>
        </Card>
      )}

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
      <Tabs defaultValue="search" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="search" className="flex items-center gap-2">
            <Search className="h-4 w-4" />
            Search Books
          </TabsTrigger>
          <TabsTrigger value="manual" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Manual Entry
          </TabsTrigger>
          <TabsTrigger value="scan" className="flex items-center gap-2">
            <Camera className="h-4 w-4" />
            Scan ISBN
          </TabsTrigger>
        </TabsList>

        <TabsContent value="search" className="space-y-6">
          {/* Search Input */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Search Google Books</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by title, author, or ISBN..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Advanced Search Options */}
              <div className="flex flex-wrap gap-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setSearchQuery((prev) =>
                      prev.includes("intitle:") ? prev : `intitle:"${prev}"`
                    )
                  }
                  disabled={isSearching}
                >
                  Search Titles Only
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setSearchQuery((prev) =>
                      prev.includes("inauthor:") ? prev : `inauthor:"${prev}"`
                    )
                  }
                  disabled={isSearching}
                >
                  Search Authors Only
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setSearchQuery((prev) =>
                      prev.includes("isbn:")
                        ? prev
                        : `isbn:${prev.replace(/[-\s]/g, "")}`
                    )
                  }
                  disabled={isSearching}
                >
                  Search by ISBN
                </Button>
              </div>

              {isSearching && (
                <p className="text-sm text-muted-foreground flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Searching Google Books...
                </p>
              )}
            </CardContent>
          </Card>

          {/* Search Results */}
          <SearchResults
            books={searchResults}
            onAddBook={handleAddGoogleBook}
            addedBooks={addedBooks}
            isAdding={isAdding}
          />
        </TabsContent>

        <TabsContent value="manual">
          <ManualEntryForm
            onAddBook={handleAddManualBook}
            isAdding={isAdding}
          />
        </TabsContent>

        <TabsContent value="scan">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Camera className="h-5 w-5" />
                Scan ISBN Barcode
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 space-y-4">
                <Camera className="h-16 w-16 mx-auto text-muted-foreground" />
                <div>
                  <h3 className="text-lg font-medium text-foreground">
                    ISBN Scanner Coming Soon
                  </h3>
                  <p className="text-muted-foreground">
                    Use your device&apos;s camera to scan book barcodes and
                    automatically add them to your library.
                  </p>
                </div>
                <Button disabled>
                  <Camera className="h-4 w-4 mr-2" />
                  Enable Camera
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AddBooksPage;
