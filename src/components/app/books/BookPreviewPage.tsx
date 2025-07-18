"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  GoogleBooksVolume,
  formatAuthors,
  getBestThumbnail,
} from "@/lib/api/google-books-api";
import {
  ArrowLeft,
  BookOpen,
  Building,
  Calendar,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Hash,
  Plus,
  Star,
  Tag,
} from "lucide-react";
import * as React from "react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";

interface BookPreviewPageProps {
  book: GoogleBooksVolume;
  onBack: () => void;
  onAddBook?: (book: GoogleBooksVolume) => void;
  isAdding?: boolean;
  isAdded?: boolean;
}

export const BookPreviewPage: React.FC<BookPreviewPageProps> = ({
  book,
  onBack,
  onAddBook,
  isAdding = false,
  isAdded = false,
}) => {
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);

  const toggleDescription = () => {
    setIsDescriptionExpanded(!isDescriptionExpanded);
  };

  const handleAddBook = React.useCallback(() => {
    if (onAddBook && book) {
      onAddBook(book);
    }
  }, [onAddBook, book]);

  const coverImage = getBestThumbnail(book);
  const authors = formatAuthors(book.volumeInfo.authors);
  const publishedYear = book.volumeInfo.publishedDate
    ? new Date(book.volumeInfo.publishedDate).getFullYear()
    : null;

  return (
    <div className="fixed inset-0 bg-background z-50 overflow-y-auto">
      <div className="p-4 sm:p-6 pt-20">
        <div className="max-w-6xl mx-auto">
          {/* Header with back button */}
          <div className="flex items-center gap-4 mb-6">
            <Button
              variant="ghost"
              size="sm"
              onClick={onBack}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
          </div>

          {/* Main content grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Book cover and basic info */}
            <div className="lg:col-span-1">
              <Card>
                <CardContent className="p-4 sm:p-6">
                  <div className="space-y-4">
                    {/* Cover Image */}
                    <div className="aspect-[2/3] w-full mb-4 rounded-lg overflow-hidden bg-muted">
                      {coverImage ? (
                        <img
                          src={coverImage}
                          alt={book.volumeInfo.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center">
                          <BookOpen className="h-16 w-16 text-muted-foreground mb-4" />
                          <p className="text-sm font-medium text-foreground mb-2">
                            {book.volumeInfo.title}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            by {formatAuthors(book.volumeInfo.authors)}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Rating */}
                    {book.volumeInfo.averageRating && (
                      <div className="flex items-center justify-center gap-1">
                        <Star className="h-4 w-4 fill-status-warning text-status-warning" />
                        <span className="text-sm font-medium">
                          {book.volumeInfo.averageRating}
                        </span>
                        {book.volumeInfo.ratingsCount && (
                          <span className="text-xs text-muted-foreground">
                            ({book.volumeInfo.ratingsCount} reviews)
                          </span>
                        )}
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="space-y-2">
                      {onAddBook && (
                        <Button
                          onClick={handleAddBook}
                          disabled={isAdding || isAdded}
                          className="w-full"
                        >
                          {isAdded ? (
                            <>
                              <BookOpen className="h-4 w-4 mr-2" />
                              Added to Library
                            </>
                          ) : isAdding ? (
                            <>
                              <Plus className="h-4 w-4 mr-2 animate-spin" />
                              Adding...
                            </>
                          ) : (
                            <>
                              <Plus className="h-4 w-4 mr-2" />
                              Add to Library
                            </>
                          )}
                        </Button>
                      )}

                      {/* External Links */}
                      <div className="space-y-2">
                        {book.volumeInfo.previewLink && (
                          <Button
                            variant="outline"
                            className="w-full"
                            onClick={() =>
                              window.open(book.volumeInfo.previewLink, "_blank")
                            }
                          >
                            <ExternalLink className="h-4 w-4 mr-2" />
                            Preview on Google
                          </Button>
                        )}
                        {book.volumeInfo.infoLink && (
                          <Button
                            variant="outline"
                            className="w-full"
                            onClick={() =>
                              window.open(book.volumeInfo.infoLink, "_blank")
                            }
                          >
                            <ExternalLink className="h-4 w-4 mr-2" />
                            More Info
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Book details */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl sm:text-2xl">
                    {book.volumeInfo.title}
                  </CardTitle>
                  {book.volumeInfo.subtitle && (
                    <p className="text-base sm:text-lg text-muted-foreground">
                      {book.volumeInfo.subtitle}
                    </p>
                  )}
                  <p className="text-base sm:text-lg text-muted-foreground">
                    by {authors}
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Book Metadata */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {publishedYear && (
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">Published:</span>
                        <span className="text-muted-foreground">
                          {publishedYear}
                        </span>
                      </div>
                    )}
                    {book.volumeInfo.publisher && (
                      <div className="flex items-center gap-2 text-sm">
                        <Building className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">Publisher:</span>
                        <span className="text-muted-foreground">
                          {book.volumeInfo.publisher}
                        </span>
                      </div>
                    )}
                    {book.volumeInfo.pageCount && (
                      <div className="flex items-center gap-2 text-sm">
                        <BookOpen className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">Pages:</span>
                        <span className="text-muted-foreground">
                          {book.volumeInfo.pageCount}
                        </span>
                      </div>
                    )}
                    {book.volumeInfo.industryIdentifiers && (
                      <div className="flex items-center gap-2 text-sm">
                        <Hash className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">ISBN:</span>
                        <span className="text-muted-foreground">
                          {book.volumeInfo.industryIdentifiers[0]?.identifier}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Categories */}
                  {book.volumeInfo.categories && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <Tag className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">Categories:</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {book.volumeInfo.categories.map((category) => (
                          <Badge key={category} variant="secondary">
                            {category}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Description */}
                  {book.volumeInfo.description && (
                    <>
                      <Separator />
                      <div className="space-y-3">
                        <h3 className="text-lg font-semibold">Description</h3>
                        <div className="space-y-2">
                          <div
                            className={`text-muted-foreground text-sm leading-relaxed ${
                              isDescriptionExpanded ? "" : "line-clamp-6"
                            }`}
                            dangerouslySetInnerHTML={{
                              __html: book.volumeInfo.description,
                            }}
                          />
                          {book.volumeInfo.description.length > 300 && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={toggleDescription}
                              className="text-brand-primary hover:text-brand-primary/80 p-0 h-auto font-medium"
                            >
                              {isDescriptionExpanded ? (
                                <>
                                  <ChevronUp className="h-4 w-4 mr-1" />
                                  Read less
                                </>
                              ) : (
                                <>
                                  <ChevronDown className="h-4 w-4 mr-1" />
                                  Read more
                                </>
                              )}
                            </Button>
                          )}
                        </div>
                      </div>
                    </>
                  )}

                  {/* Additional Reading Information */}
                  {book.volumeInfo.readingModes && (
                    <>
                      <Separator />
                      <div className="space-y-2">
                        <h3 className="text-lg font-semibold">Reading Options</h3>
                        <div className="flex gap-4 text-sm">
                          {book.volumeInfo.readingModes.text && (
                            <span className="flex items-center gap-1">
                              <BookOpen className="h-3 w-3" />
                              Text available
                            </span>
                          )}
                          {book.volumeInfo.readingModes.image && (
                            <span className="flex items-center gap-1">
                              <BookOpen className="h-3 w-3" />
                              Image available
                            </span>
                          )}
                        </div>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookPreviewPage;