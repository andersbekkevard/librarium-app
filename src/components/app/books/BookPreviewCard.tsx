"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils/utils";
import {
  GoogleBooksVolume,
  formatAuthors,
  getBestThumbnail,
} from "@/lib/api/google-books-api";
import {
  BookOpen,
  Building,
  Calendar,
  ExternalLink,
  Hash,
  Plus,
  Star,
} from "lucide-react";
import Image from "next/image";
import * as React from "react";

interface BookPreviewCardProps {
  book: GoogleBooksVolume;
  onAddBook: (book: GoogleBooksVolume) => void;
  isAdding?: boolean;
  isAdded?: boolean;
  className?: string;
  showActions?: boolean;
}

/**
 * BookPreviewCard Component
 * 
 * Compact card component for displaying book previews in the barcode scanning flow.
 * Shows essential book information with an "Add to Library" action button.
 * 
 * Designed to be inline and responsive, unlike the full BookPreviewDialog.
 * Follows the requirements for displaying book metadata and providing
 * a seamless addition workflow.
 */
export const BookPreviewCard: React.FC<BookPreviewCardProps> = ({
  book,
  onAddBook,
  isAdding = false,
  isAdded = false,
  className = "",
  showActions = true,
}) => {
  const handleAddBook = React.useCallback(() => {
    if (!isAdding && !isAdded) {
      onAddBook(book);
    }
  }, [onAddBook, book, isAdding, isAdded]);

  const coverImage = getBestThumbnail(book);
  const authors = formatAuthors(book.volumeInfo.authors);
  const publishedYear = book.volumeInfo.publishedDate
    ? new Date(book.volumeInfo.publishedDate).getFullYear()
    : null;

  return (
    <Card className={cn("w-full max-w-2xl mx-auto", className)}>
      <CardContent className="p-4">
        <div className="flex gap-4">
          {/* Book Cover */}
          <div className="flex-shrink-0">
            <div className="w-20 h-28 bg-muted rounded-md flex items-center justify-center relative overflow-hidden">
              {coverImage ? (
                <Image
                  src={coverImage}
                  alt={book.volumeInfo.title}
                  fill
                  className="object-cover"
                  sizes="80px"
                />
              ) : (
                <BookOpen className="h-8 w-8 text-muted-foreground" />
              )}
            </div>
          </div>

          {/* Book Information */}
          <div className="flex-1 min-w-0 space-y-2">
            {/* Title and Author */}
            <div className="space-y-1">
              <h3 className="font-semibold text-lg leading-tight line-clamp-2">
                {book.volumeInfo.title}
              </h3>
              {book.volumeInfo.subtitle && (
                <p className="text-sm text-muted-foreground line-clamp-1">
                  {book.volumeInfo.subtitle}
                </p>
              )}
              <p className="text-sm text-muted-foreground">
                by {authors}
              </p>
            </div>

            {/* Metadata Row */}
            <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
              {publishedYear && (
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  <span>{publishedYear}</span>
                </div>
              )}
              {book.volumeInfo.publisher && (
                <div className="flex items-center gap-1">
                  <Building className="h-3 w-3" />
                  <span className="truncate max-w-[120px]">{book.volumeInfo.publisher}</span>
                </div>
              )}
              {book.volumeInfo.pageCount && (
                <div className="flex items-center gap-1">
                  <BookOpen className="h-3 w-3" />
                  <span>{book.volumeInfo.pageCount} pages</span>
                </div>
              )}
            </div>

            {/* Rating */}
            {book.volumeInfo.averageRating && (
              <div className="flex items-center gap-1">
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

            {/* Categories */}
            {book.volumeInfo.categories && book.volumeInfo.categories.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {book.volumeInfo.categories.slice(0, 2).map((category) => (
                  <Badge key={category} variant="secondary" className="text-xs">
                    {category}
                  </Badge>
                ))}
                {book.volumeInfo.categories.length > 2 && (
                  <Badge variant="secondary" className="text-xs">
                    +{book.volumeInfo.categories.length - 2} more
                  </Badge>
                )}
              </div>
            )}

            {/* ISBN */}
            {book.volumeInfo.industryIdentifiers && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Hash className="h-3 w-3" />
                <span>ISBN: {book.volumeInfo.industryIdentifiers[0]?.identifier}</span>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        {showActions && (
          <div className="mt-4 pt-3 border-t">
            <div className="flex gap-2">
              <Button
                onClick={handleAddBook}
                disabled={isAdding || isAdded}
                className="flex-1"
                variant={isAdded ? "secondary" : "default"}
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

              {/* External Links */}
              <div className="flex gap-1">
                {book.volumeInfo.previewLink && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      window.open(book.volumeInfo.previewLink, "_blank")
                    }
                    title="Preview on Google Books"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                )}
                {book.volumeInfo.infoLink && book.volumeInfo.infoLink !== book.volumeInfo.previewLink && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      window.open(book.volumeInfo.infoLink, "_blank")
                    }
                    title="More Info"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default BookPreviewCard;