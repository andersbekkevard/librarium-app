"use client";

import {
  BookOpen,
  Building,
  Calendar,
  Check,
  ExternalLink,
  Loader2,
  Plus,
  Search,
  Star,
  User,
} from "lucide-react";
import * as React from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  GoogleBooksVolume,
  formatAuthors,
  getBestThumbnail,
} from "@/lib/google-books-api";

interface SearchResultsProps {
  books: GoogleBooksVolume[];
  onAddBook: (book: GoogleBooksVolume) => void;
  addedBooks: Set<string>;
  isAdding: boolean;
}

export const SearchResults: React.FC<SearchResultsProps> = ({
  books,
  onAddBook,
  addedBooks,
  isAdding,
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

export default SearchResults;