"use client";

import {
  BookOpen,
  Building,
  Calendar,
  Check,
  Loader2,
  Plus,
  Star,
} from "lucide-react";
import Image from "next/image";
import * as React from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  GoogleBooksVolume,
  formatAuthors,
  getBestThumbnail,
} from "@/lib/api/google-books-api";
import { cn } from "@/lib/utils/utils";

interface BookSearchCardProps {
  book: GoogleBooksVolume;
  onAddBook: (book: GoogleBooksVolume) => void;
  onPreview?: (book: GoogleBooksVolume, event?: React.MouseEvent) => void;
  isAdded: boolean;
  isAdding: boolean;
  showDescription?: boolean;
  className?: string;
}

export const BookSearchCard: React.FC<BookSearchCardProps> = ({
  book,
  onAddBook,
  onPreview,
  isAdded,
  isAdding,
  showDescription = true,
  className,
}) => {
  const handleCardClick = (e: React.MouseEvent) => {
    if (onPreview) {
      onPreview(book, e);
    }
  };

  return (
    <Card
      className={cn(
        "overflow-hidden transition-shadow",
        onPreview && "cursor-pointer hover:shadow-sm",
        className
      )}
      onClick={onPreview ? handleCardClick : undefined}
    >
      <CardContent className="px-4 pt-4 pb-0">
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          {/* Book Cover */}
          <div className="flex-shrink-0 self-center sm:self-start">
            <div className="w-20 h-28 sm:w-24 sm:h-36 md:w-32 md:h-48 bg-muted rounded flex items-center justify-center relative overflow-hidden">
              {getBestThumbnail(book) ? (
                <Image
                  src={getBestThumbnail(book)!}
                  alt={book.volumeInfo.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 80px, (max-width: 768px) 96px, 128px"
                />
              ) : (
                <BookOpen className="h-8 w-8 sm:h-6 sm:w-6 text-muted-foreground" />
              )}
            </div>
          </div>

          {/* Book Details */}
          <div className="flex-1 min-w-0">
            <div className="space-y-2 sm:space-y-3">
              <div className="text-center sm:text-left">
                <h3 className="font-semibold text-lg sm:text-base text-foreground line-clamp-2">
                  {book.volumeInfo.title}
                </h3>

                <p className="text-muted-foreground text-sm mt-1">
                  {formatAuthors(book.volumeInfo.authors)}
                </p>
              </div>

              <div className="flex flex-wrap justify-center sm:justify-start items-center gap-2 sm:gap-3 text-xs sm:text-sm text-muted-foreground">
                {book.volumeInfo.publishedDate && (
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {new Date(book.volumeInfo.publishedDate).getFullYear()}
                  </span>
                )}

                {book.volumeInfo.pageCount && (
                  <span className="flex items-center gap-1">
                    <BookOpen className="h-3 w-3" />
                    {book.volumeInfo.pageCount}p
                  </span>
                )}

                {book.volumeInfo.publisher && (
                  <span className="flex items-center gap-1">
                    <Building className="h-3 w-3" />
                    <span className="truncate max-w-20">
                      {book.volumeInfo.publisher}
                    </span>
                  </span>
                )}
              </div>

              {book.volumeInfo.averageRating && (
                <div className="flex items-center justify-center sm:justify-start gap-1">
                  <Star className="h-4 w-4 fill-status-warning text-status-warning" />
                  <span className="text-sm">
                    {book.volumeInfo.averageRating}
                  </span>
                </div>
              )}

              {book.volumeInfo.categories && (
                <div className="flex flex-wrap justify-center sm:justify-start gap-1">
                  {book.volumeInfo.categories
                    .slice(0, 2)
                    .map((category: string) => (
                      <Badge
                        key={category}
                        variant="secondary"
                        className="text-xs px-2 py-1"
                      >
                        {category}
                      </Badge>
                    ))}
                </div>
              )}
            </div>
            <div className="flex justify-center sm:justify-start pt-1 sm:pt-2">
              <Button
                size="default"
                className="w-full sm:w-24 lg:w-60 h-10 sm:h-9"
                onClick={(e) => {
                  e.stopPropagation();
                  onAddBook(book);
                }}
                disabled={isAdded || isAdding}
              >
                {isAdded ? (
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
                    Add to Library
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Description - Hidden on mobile, shown on larger screens */}
        {showDescription && book.volumeInfo.description && (
          <div className="hidden sm:block mt-3 pt-3 border-t border-border">
            <p className="text-sm text-muted-foreground line-clamp-3">
              {book.volumeInfo.description}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default BookSearchCard;