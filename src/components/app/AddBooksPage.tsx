"use client";

import * as React from "react";
import { useState } from "react";
import {
  Search,
  Plus,
  BookOpen,
  ExternalLink,
  Camera,
  FileText,
  Check,
  X,
  Star,
  Calendar,
  User,
  Building,
  Loader2,
  AlertCircle,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Book } from "@/lib/models";
import { bookOperations } from "@/lib/firebase-utils";
import { useAuthContext } from "@/components/auth/AuthProvider";
import { Timestamp } from "firebase/firestore";

// Google Books API integration
import {
  googleBooksApi,
  GoogleBooksVolume,
  getBestThumbnail,
  getBestISBN,
  formatAuthors,
} from "@/lib/google-books-api";

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

// Convert GoogleBooksVolume to our Book model
const convertGoogleBookToBook = (googleBook: GoogleBooksVolume): Book => {
  const isbn = getBestISBN(googleBook);

  const book: Book = {
    id: googleBook.id,
    title: googleBook.volumeInfo.title,
    author: formatAuthors(googleBook.volumeInfo.authors),
    state: "not_started",
    progress: {
      currentPage: 0,
      totalPages: googleBook.volumeInfo.pageCount || 0,
      percentage: 0,
    },
    isOwned: false, // Default to wishlist
    addedAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  };

  // Only add optional fields if they have values
  if (isbn) book.isbn = isbn;
  if (getBestThumbnail(googleBook))
    book.coverImage = getBestThumbnail(googleBook);
  if (googleBook.volumeInfo.publishedDate)
    book.publishedDate = googleBook.volumeInfo.publishedDate;
  if (googleBook.volumeInfo.description)
    book.description = googleBook.volumeInfo.description;

  return book;
};

// Convert manual entry to our Book model
const convertManualEntryToBook = (formData: {
  title: string;
  author: string;
  isbn: string;
  pages: string;
  publishedYear: string;
  ownership: string;
  description: string;
}): Book => {
  const book: Book = {
    id: `manual-${Date.now()}`,
    title: formData.title.trim(),
    author: formData.author.trim(),
    state: "not_started",
    progress: {
      currentPage: 0,
      totalPages: formData.pages ? parseInt(formData.pages) : 0,
      percentage: 0,
    },
    isOwned: formData.ownership === "owned",
    addedAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  };

  // Only add optional fields if they have values
  if (formData.isbn && formData.isbn.trim()) book.isbn = formData.isbn.trim();
  if (formData.publishedYear && formData.publishedYear.trim()) {
    book.publishedDate = `${formData.publishedYear.trim()}-01-01`;
  }
  if (formData.description && formData.description.trim()) {
    book.description = formData.description.trim();
  }

  return book;
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
    isbn: "",
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
      isbn: "",
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
              <Label htmlFor="isbn">ISBN (optional)</Label>
              <Input
                id="isbn"
                value={formData.isbn}
                onChange={(e) => updateField("isbn", e.target.value)}
                placeholder="Enter ISBN (optional)"
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
                  isbn: "",
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
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<GoogleBooksVolume[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [addedBooks, setAddedBooks] = useState<Set<string>>(new Set());
  const [recentlyAdded, setRecentlyAdded] = useState<
    Array<{ id: string; title: string; author: string }>
  >([]);
  const [isAdding, setIsAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    setError(null);

    try {
      const results = await googleBooksApi.search(query, 20);
      setSearchResults(results);
    } catch (err) {
      console.error("Error searching books:", err);
      setError(
        "Failed to search books. Please check your internet connection and try again."
      );
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleAddGoogleBook = async (googleBook: GoogleBooksVolume) => {
    if (!user) {
      setError("You must be logged in to add books");
      return;
    }

    setIsAdding(true);
    setError(null);

    try {
      const book = convertGoogleBookToBook(googleBook);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { id, ...bookData } = book;

      const bookId = await bookOperations.addBook(user.uid, bookData);

      setAddedBooks((prev) => new Set([...prev, googleBook.id]));
      setRecentlyAdded((prev) => [
        {
          id: bookId,
          title: book.title,
          author: book.author,
        },
        ...prev.slice(0, 4),
      ]);
    } catch (err) {
      console.error("Error adding book:", err);
      setError("Failed to add book. Please try again.");
    } finally {
      setIsAdding(false);
    }
  };

  const handleAddManualBook = async (book: Book) => {
    if (!user) {
      setError("You must be logged in to add books");
      return;
    }

    setIsAdding(true);
    setError(null);

    try {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { id, ...bookData } = book;
      const bookId = await bookOperations.addBook(user.uid, bookData);

      setRecentlyAdded((prev) => [
        {
          id: bookId,
          title: book.title,
          author: book.author,
        },
        ...prev.slice(0, 4),
      ]);
    } catch (err) {
      console.error("Error adding book:", err);
      setError("Failed to add book. Please try again.");
    } finally {
      setIsAdding(false);
    }
  };

  // Debounced search effect
  React.useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (searchQuery.trim()) {
        handleSearch(searchQuery);
      } else {
        setSearchResults([]);
      }
    }, 500); // Increased debounce time for API calls

    return () => clearTimeout(debounceTimer);
  }, [searchQuery]);

  // Clear error when user starts typing
  React.useEffect(() => {
    if (searchQuery.trim() && error) {
      setError(null);
    }
  }, [searchQuery, error]);

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
