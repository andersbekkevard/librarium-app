"use client";

import { Card, CardContent } from "@/components/ui/card";
import { GenreBadge } from "@/components/ui/genre-badge";
import { ProgressBar } from "@/components/ui/progress-bar";
import { ReadingStateBadge } from "@/components/ui/reading-state-badge";
import { StarRating } from "@/components/ui/star-rating";
import { TIMING_CONFIG, UI_CONFIG } from "@/lib/constants/constants";
import { Book } from "@/lib/models/models";
import { useBooksContext } from "@/lib/providers/BooksProvider";
import { cn } from "@/lib/utils/utils";
import { BookOpenIcon } from "@phosphor-icons/react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import * as React from "react";

interface BookCardProps {
  book: Book;
  onBookClick?: (bookId: string) => void;
}

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
        "group relative overflow-hidden cursor-pointer transition-all duration-200",
        "bg-card border-border/40 hover:border-brand-accent/40",
        "hover:shadow-md hover:shadow-brand-accent/10 hover:-translate-y-0.5",
        // Mobile/tablet responsive dimensions
        "h-44 md:h-48 w-full max-w-sm md:max-w-md",
        // Desktop: restore original height but allow full width in grid
        `lg:${UI_CONFIG.CARD.HEIGHT} lg:w-full lg:max-w-none`
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
      <CardContent className="px-4 h-full flex gap-4">
        {/* Book Cover - Responsive width, desktop uses original w-24 */}
        <div className="flex-shrink-0 w-20 md:w-24 lg:w-24">
          <div className="w-full h-full rounded-lg overflow-hidden bg-muted border border-border/20 shadow-sm relative">
            {book.coverImage ? (
              <Image
                src={book.coverImage}
                alt={`${book.title} cover`}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 80px, 96px"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-brand-accent/10 to-brand-primary/5">
                <BookOpenIcon className="h-7 w-7 text-brand-accent/70" />
              </div>
            )}
          </div>
        </div>

        {/* Book Information */}
        <div className="flex-1 flex flex-col justify-between min-w-0 py-0.5">
          {/* Title and Author */}
          <div className="space-y-1">
            <h4 className="font-heading font-semibold text-foreground text-sm md:text-[15px] leading-snug line-clamp-2 group-hover:text-brand-primary transition-colors">
              {book.title}
            </h4>
            <p className="text-xs md:text-[13px] text-muted-foreground/80 line-clamp-1">
              by {book.author}
            </p>
          </div>

          {/* Genre and Status Badges */}
          <div className="flex flex-wrap gap-1.5 my-2">
            <GenreBadge genre={genre} />
            <ReadingStateBadge state={book.state} />
          </div>

          {/* Progress/Rating Section */}
          <div className="mt-auto">
            {book.state === "in_progress" &&
              book.progress.currentPage &&
              book.progress.totalPages && (
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <span className="text-[11px] text-muted-foreground/70">
                      {book.progress.currentPage} / {book.progress.totalPages}{" "}
                      pages
                    </span>
                    <span className="text-[11px] font-semibold text-brand-primary">
                      {progress}%
                    </span>
                  </div>
                  <ProgressBar value={progress} color="accent" />
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
