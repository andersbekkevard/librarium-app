"use client";

import { Card, CardContent } from "@/components/ui/card";
import { GenreBadge } from "@/components/ui/genre-badge";
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
        "overflow-hidden cursor-pointer transition-all hover:shadow-md hover:border-border/80 bg-card/50 hover:bg-card border-border/40",
        /* — mobile / tablet: dynamic height with minimums — */
        "min-h-44 md:min-h-48 w-full max-w-sm md:max-w-md",
        /* — desktop (lg+): use fixed height with design tokens — */
        `lg:${UI_CONFIG.CARD.WIDTH}`,
        `lg:${UI_CONFIG.CARD.HEIGHT}`
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
      <CardContent className="p-4 h-full flex gap-4">
        {/* Book Cover - Responsive width, improved height handling */}
        <div className="flex-shrink-0 w-20 md:w-24 lg:w-24">
          <div className="w-full h-32 md:h-36 lg:h-40 rounded-md overflow-hidden bg-muted border border-border/20 shadow-sm">
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

        {/* Book Information - Improved layout with dynamic spacing */}
        <div className="flex-1 flex flex-col min-w-0 min-h-0">
          {/* Title and Author */}
          <div className="space-y-1.5 flex-shrink-0">
            <h3 className="font-semibold text-foreground text-sm md:text-base leading-tight line-clamp-2 group-hover:text-brand-primary transition-colors">
              {book.title}
            </h3>
            <p className="text-xs md:text-sm text-muted-foreground line-clamp-1">
              by {book.author}
            </p>
          </div>

          {/* Genre and Status Badges - Allow wrapping */}
          <div className="flex flex-wrap gap-1.5 my-2 flex-shrink-0">
            <GenreBadge genre={genre} />
            <ReadingStateBadge state={book.state} />
          </div>

          {/* Spacer to push progress/rating to bottom */}
          <div className="flex-1 min-h-2"></div>

          {/* Progress/Rating Section - Always visible at bottom */}
          <div className="flex-shrink-0">
            {book.state === "in_progress" &&
              book.progress.currentPage &&
              book.progress.totalPages && (
                <div className="space-y-1.5">
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
