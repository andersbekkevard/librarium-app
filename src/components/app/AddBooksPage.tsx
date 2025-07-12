"use client";

import {
  AlertCircle,
  BookOpen,
  Building,
  Calendar,
  Camera,
  Check,
  ExternalLink,
  FileText,
  Loader2,
  Plus,
  Search,
  Star,
  User,
  X,
} from "lucide-react";
import * as React from "react";
import { useState } from "react";

import { UI_CONFIG, TIMING_CONFIG } from "@/lib/constants";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  convertGoogleBookToBook,
  convertManualEntryToBook,
} from "@/lib/book-utils";
import { Book } from "@/lib/models";
import { useAuthContext } from "@/lib/providers/AuthProvider";
import { useBooksContext } from "@/lib/providers/BooksProvider";

// Google Books API integration
import {
  GoogleBooksVolume,
  formatAuthors,
  getBestThumbnail,
} from "@/lib/google-books-api";
import { useBookSearch } from "@/lib/hooks/useBookSearch";

const SearchResults = ({
  books,
  onAddBook,
  addedBooks,
  isAdding,
}: {
  books: GoogleBooksVolume[];
  onAddBook: (book: GoogleBooksVolume) => void;
  addedBooks: Set<string>;
  isAdding: boolean;
}) => {
  if (books.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p>Search for books to add to your library</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {books.map((book) => (
        <Card key={book.id} className="overflow-hidden">
          <CardContent className="p-4">
            <div className="flex gap-4">
              {/* Book Cover */}
              <div className="flex-shrink-0">
                <div className="w-16 h-24 bg-muted rounded flex items-center justify-center">
                  {getBestThumbnail(book) ? (
                    <img
                      src={getBestThumbnail(book)}
                      alt={book.volumeInfo.title}
                      className="w-full h-full object-cover rounded"
                    />
                  ) : (
                    <BookOpen className="h-6 w-6 text-muted-foreground" />
                  )}
                </div>
              </div>

              {/* Book Details */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-lg truncate text-foreground">
                      {book.volumeInfo.title}
                    </h3>

                    <p className="text-muted-foreground flex items-center gap-1 mt-1">
                      <User className="h-3 w-3" />
                      {formatAuthors(book.volumeInfo.authors)}
                    </p>

                    <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                      {book.volumeInfo.publishedDate && (
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(
                            book.volumeInfo.publishedDate
                          ).getFullYear()}
                        </span>
                      )}

                      {book.volumeInfo.pageCount && (
                        <span>{book.volumeInfo.pageCount} pages</span>
                      )}

                      {book.volumeInfo.publisher && (
                        <span className="flex items-center gap-1">
                          <Building className="h-3 w-3" />
                          {book.volumeInfo.publisher}
                        </span>
                      )}
                    </div>

                    {book.volumeInfo.averageRating && (
                      <div className="flex items-center gap-1 mt-2">
                        <Star className="h-4 w-4 fill-status-warning text-status-warning" />
                        <span className="text-sm">
                          {book.volumeInfo.averageRating}
                          {book.volumeInfo.ratingsCount && (
                            <span className="text-muted-foreground ml-1">
                              ({book.volumeInfo.ratingsCount.toLocaleString()}{" "}
                              reviews)
                            </span>
                          )}
                        </span>
                      </div>
                    )}

                    {book.volumeInfo.categories && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {book.volumeInfo.categories
                          .slice(0, 3)
                          .map((category: string) => (
                            <Badge
                              key={category}
                              variant="secondary"
                              className="text-xs"
                            >
                              {category}
                            </Badge>
                          ))}
                      </div>
                    )}

                    {book.volumeInfo.description && (
                      <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                        {book.volumeInfo.description}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-col gap-2">
                    <Button
                      size="sm"
                      onClick={() => onAddBook(book)}
                      disabled={addedBooks.has(book.id) || isAdding}
                      className="whitespace-nowrap"
                    >
                      {addedBooks.has(book.id) ? (
                        <>
                          <Check className="h-4 w-4 mr-1" />
                          Added
                        </>
                      ) : isAdding ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                          Adding...
                        </>
                      ) : (
                        <>
                          <Plus className="h-4 w-4 mr-1" />
                          Add Book
                        </>
                      )}
                    </Button>

                    <Button variant="outline" size="sm">
                      <ExternalLink className="h-4 w-4 mr-1" />
                      Preview
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

const ManualEntryForm = ({
  onAddBook,
  isAdding,
}: {
  onAddBook: (book: Book) => void;
  isAdding: boolean;
}) => {
  const [formData, setFormData] = useState({
    title: "",
    author: "",
    genre: "",
    pages: "",
    publishedYear: "",
    ownership: "wishlist",
    description: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const book = convertManualEntryToBook(formData);
    await onAddBook(book);

    // Reset form
    setFormData({
      title: "",
      author: "",
      genre: "",
      pages: "",
      publishedYear: "",
      ownership: "wishlist",
      description: "",
    });
  };

  const updateField = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Add Book Manually
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => updateField("title", e.target.value)}
                placeholder="Enter book title"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="author">Author *</Label>
              <Input
                id="author"
                value={formData.author}
                onChange={(e) => updateField("author", e.target.value)}
                placeholder="Enter author name"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="genre">Genre (optional)</Label>
              <Input
                id="genre"
                value={formData.genre}
                onChange={(e) => updateField("genre", e.target.value)}
                placeholder="Enter genre (optional)"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="pages">Pages</Label>
              <Input
                id="pages"
                type="number"
                value={formData.pages}
                onChange={(e) => updateField("pages", e.target.value)}
                placeholder="Number of pages"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="publishedYear">Published Year</Label>
              <Input
                id="publishedYear"
                type="number"
                value={formData.publishedYear}
                onChange={(e) => updateField("publishedYear", e.target.value)}
                placeholder="Year published"
                min="1000"
                max={new Date().getFullYear()}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="ownership">Ownership Status</Label>
              <select
                id="ownership"
                value={formData.ownership || "wishlist"}
                onChange={(e) => updateField("ownership", e.target.value)}
                className="bg-background border border-input rounded-md px-3 py-2 text-sm w-full"
              >
                <option value="wishlist">Wishlist</option>
                <option value="owned">Owned</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => updateField("description", e.target.value)}
              placeholder="Book description (optional)"
              rows={3}
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="submit" disabled={isAdding}>
              {isAdding ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Add to Library
                </>
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={isAdding}
              onClick={() =>
                setFormData({
                  title: "",
                  author: "",
                  genre: "",
                  pages: "",
                  publishedYear: "",
                  ownership: "wishlist",
                  description: "",
                })
              }
            >
              <X className="h-4 w-4 mr-2" />
              Clear Form
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

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

      const bookId = await addBook(bookData);

      setAddedBooks((prev) => new Set([...prev, googleBook.id]));
      setRecentlyAdded((prev) => [
        {
          id: bookId,
          title: book.title,
          author: book.author,
        },
        ...prev.slice(0, UI_CONFIG.RECENTLY_ADDED_BOOKS_LIMIT),
      ]);
    } catch {
      // Error is handled by the BooksProvider
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
      const bookId = await addBook(bookData);

      setRecentlyAdded((prev) => [
        {
          id: bookId,
          title: book.title,
          author: book.author,
        },
        ...prev.slice(0, UI_CONFIG.RECENTLY_ADDED_BOOKS_LIMIT),
      ]);
    } catch {
      // Error is handled by the BooksProvider
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
