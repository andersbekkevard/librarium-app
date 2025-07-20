"use client";

import { BookOpen, User } from "lucide-react";
import Image from "next/image";
import * as React from "react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { GenreBadge } from "@/components/ui/genre-badge";
import { ReadingStateBadge } from "@/components/ui/reading-state-badge";
import { StarRating } from "@/components/ui/star-rating";
import { calculateBookProgress } from "@/lib/books/book-utils";
import { Book } from "@/lib/models/models";
import { cn } from "@/lib/utils/utils";

// Progress Bar Component (same height as BookCard)
const ProgressBar = ({
  value,
  className,
}: {
  value: number;
  className?: string;
}) => {
  return (
    <div className={cn("w-full bg-muted rounded-full h-1.5", className)}>
      <div
        className="bg-brand-primary h-1.5 rounded-full transition-all duration-300"
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  );
};

interface BookListItemProps {
  book: Book;
  onBookClick?: (bookId: string) => void;
}

export const BookListItem: React.FC<BookListItemProps> = ({
  book,
  onBookClick,
}) => {
  const handleCardClick = () => {
    if (onBookClick) {
      onBookClick(book.id);
    }
  };

  return (
    <Card
      className="w-full cursor-pointer transition-all duration-200 hover:shadow-md hover:border-brand-primary/20"
      onClick={handleCardClick}
    >
      <CardContent className="p-0">
        {/* Mobile Layout - Vertical stacking */}
        <div className="flex flex-col lg:hidden">
          <div className="flex gap-4 items-start p-4">
            {/* Cover Image */}
            <div className="flex-shrink-0">
              <div className="w-16 h-22 bg-muted rounded flex items-center justify-center border border-border/20 shadow-sm relative overflow-hidden">
                {book.coverImage ? (
                  <Image
                    src={book.coverImage}
                    alt={`${book.title} cover`}
                    fill
                    className="object-cover"
                    sizes="64px"
                  />
                ) : (
                  <BookOpen className="h-6 w-6 text-muted-foreground" />
                )}
              </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-foreground text-sm line-clamp-2 mb-1">
                {book.title}
              </h3>
              <p className="text-xs text-muted-foreground mb-2">
                by {book.author}
              </p>

              {/* Badges */}
              <div className="flex flex-wrap gap-1.5 mb-2">
                <ReadingStateBadge state={book.state} />
                {book.genre && <GenreBadge genre={book.genre} />}
              </div>

              {/* Progress bar for in_progress books */}
              {book.state === "in_progress" && (
                <div className="space-y-1 mb-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-muted-foreground">
                      {book.progress.currentPage} / {book.progress.totalPages}{" "}
                      pages
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {calculateBookProgress(book)}%
                    </span>
                  </div>
                  <ProgressBar value={calculateBookProgress(book)} />
                </div>
              )}

              {/* Rating for finished books */}
              {book.state === "finished" && book.rating && (
                <StarRating
                  rating={book.rating}
                  size="sm"
                  showText={false}
                  className="gap-0.5"
                />
              )}
            </div>
          </div>
        </div>

        {/* Desktop Layout - Original grid layout */}
        <div className="hidden lg:flex gap-4 items-center">
          {/* Cover Image */}
          <div className="flex-shrink-0 pl-3">
            <div className="w-18 h-24 bg-muted rounded flex items-center justify-center border border-border/20 shadow-sm relative overflow-hidden">
              {book.coverImage ? (
                <Image
                  src={book.coverImage}
                  alt={`${book.title} cover`}
                  fill
                  className="object-cover"
                  sizes="72px"
                />
              ) : (
                <BookOpen className="h-8 w-8 text-muted-foreground" />
              )}
            </div>
          </div>

          {/* Book Details */}
          <div className="flex-1 grid grid-cols-1 md:grid-cols-6 gap-4 items-center">
            <div className="md:col-span-2">
              <h3 className="font-semibold text-foreground truncate">
                {book.title}
              </h3>
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <User className="h-3 w-3" />
                {book.author}
              </p>
              {/* Progress bar for in_progress books, 10% shorter than title width */}
              {book.state === "in_progress" && (
                <div className="space-y-1 mt-4 w-[90%]">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-muted-foreground">
                      {book.progress.currentPage} / {book.progress.totalPages}{" "}
                      pages
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {calculateBookProgress(book)}%
                    </span>
                  </div>
                  <ProgressBar value={calculateBookProgress(book)} />
                </div>
              )}
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

            <div>{book.genre && <GenreBadge genre={book.genre} />}</div>

            <div className="flex items-center justify-center">
              <ReadingStateBadge state={book.state} />
            </div>

            <div className="flex items-center justify-between">
              {/* Rating or other states */}
              <div className="flex items-center gap-1 w-full">
                {book.state === "finished" && book.rating ? (
                  <StarRating
                    rating={book.rating}
                    size="sm"
                    showText={false}
                    className="gap-0.5"
                  />
                ) : book.state === "not_started" ? (
                  <div className="text-xs text-muted-foreground">
                    Not started
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default BookListItem;
