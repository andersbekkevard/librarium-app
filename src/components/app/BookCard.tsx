"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ReadingStateBadge } from "@/components/ui/reading-state-badge";
import { StarRating } from "@/components/ui/star-rating";
import { TIMING_CONFIG, UI_CONFIG } from "@/lib/constants/constants";
import { Book } from "@/lib/models/models";
import { useBooksContext } from "@/lib/providers/BooksProvider";
import { cn } from "@/lib/utils/utils";
import { BookOpen } from "lucide-react";
import { useRouter } from "next/navigation";
import * as React from "react";

interface BookCardProps {
  book: Book;
  onBookClick?: (bookId: string) => void;
}
// Helper functions

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

export const BookCard: React.FC<BookCardProps> = ({ book, onBookClick }) => {
  const router = useRouter();
  const { calculateBookProgress } = useBooksContext();
  const progress = calculateBookProgress(book);

  const handleCardClick = () => {
    if (onBookClick) {
      onBookClick(book.id);
    } else {
      router.push(`/books/${book.id}`);
    }
  };

  const genre = book.genre || "Unknown";

  return (
    <Card
      className={cn(
        UI_CONFIG.CARD.WIDTH,
        UI_CONFIG.CARD.HEIGHT,
        "overflow-hidden cursor-pointer transition-all hover:shadow-md hover:border-border/80 bg-card/50 hover:bg-card border-border/40"
      )}
      style={{ transitionDuration: `${TIMING_CONFIG.ANIMATION.STANDARD}ms` }}
      onClick={handleCardClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleCardClick();
        }
      }}
      aria-label={`View details for ${book.title} by ${book.author}`}
    >
      <CardContent className="p-3 h-full flex gap-3">
        {/* Book Cover - Takes up more space and full height */}
        <div className="flex-shrink-0 w-24 h-full">
          <div className="w-full h-full rounded-md overflow-hidden bg-muted border border-border/20 shadow-sm">
            {book.coverImage ? (
              <img
                src={book.coverImage}
                alt={`${book.title} cover`}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <BookOpen className="h-8 w-8 text-muted-foreground" />
              </div>
            )}
          </div>
        </div>

        {/* Book Information */}
        <div className="flex-1 flex flex-col justify-between min-w-0">
          {/* Title and Author */}
          <div className="space-y-1">
            <h3 className="font-semibold text-foreground text-sm leading-tight line-clamp-2 group-hover:text-brand-primary transition-colors">
              {book.title}
            </h3>
            <p className="text-xs text-muted-foreground line-clamp-1">
              by {book.author}
            </p>
          </div>

          {/* Genre and Status Badges */}
          <div className="flex flex-wrap gap-1.5">
            <Badge
              variant="outline"
              className="text-xs px-2 py-0.5 bg-muted/50 text-muted-foreground border-border/40"
            >
              {genre}
            </Badge>
            <ReadingStateBadge state={book.state} />
          </div>

          {/* Progress/Rating Section */}
          <div className="mt-2">
            {book.state === "in_progress" &&
              book.progress.currentPage &&
              book.progress.totalPages && (
                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-muted-foreground">
                      {book.progress.currentPage} / {book.progress.totalPages}{" "}
                      pages
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {progress}%
                    </span>
                  </div>
                  <ProgressBar value={progress} />
                </div>
              )}

            {book.state === "finished" && book.rating && (
              <StarRating rating={book.rating} size="sm" />
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default BookCard;
