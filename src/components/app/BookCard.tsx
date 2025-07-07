"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Star } from "lucide-react";
import { Book } from "@/lib/models";
import { READING_STATE_COLORS } from "@/lib/colors";
import { cn } from "@/lib/utils";

interface BookCardProps {
  book: Book;
  onEdit?: (book: Book) => void;
  onUpdateProgress?: (book: Book) => void;
  onBookClick?: (bookId: string) => void;
}
// Helper functions

const getReadingStateBadge = (state: Book["state"]) => {
  switch (state) {
    case "not_started":
      return {
        label: "Not Started",
        className: "bg-slate-50 text-slate-500 border-slate-200",
      };
    case "in_progress":
      return {
        label: "Reading",
        className:
          "bg-brand-primary/10 text-brand-primary border-brand-primary/20",
      };
    case "finished":
      return {
        label: "Finished",
        className: "bg-slate-800/10 text-slate-800 border-slate-800/20",
      };
    default:
      return {
        label: "Unknown",
        className: "bg-muted text-muted-foreground border-border",
      };
  }
};

const calculateProgress = (currentPage: number, totalPages: number): number => {
  return Math.round((currentPage / totalPages) * 100);
};

const StarRating = ({ rating }: { rating: number }) => {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          className={cn(
            "h-3 w-3",
            i < rating
              ? "fill-yellow-400 text-yellow-400"
              : "fill-muted text-muted-foreground"
          )}
        />
      ))}
      <span className="ml-1 text-xs text-muted-foreground">{rating}/5</span>
    </div>
  );
};

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

export const BookCard: React.FC<BookCardProps> = ({
  book,
  onEdit: _onEdit,
  onUpdateProgress: _onUpdateProgress,
  onBookClick,
}) => {
  const router = useRouter();
  const badgeInfo = getReadingStateBadge(book.state);
  const progress =
    book.state === "in_progress" &&
    book.progress.currentPage &&
    book.progress.totalPages
      ? calculateProgress(book.progress.currentPage, book.progress.totalPages)
      : 0;

  const handleCardClick = () => {
    if (onBookClick) {
      onBookClick(book.id);
    } else {
      router.push(`/book/${book.id}`);
    }
  };

  const genre = book.genre || "Unknown";

  return (
    <Card
      className="w-full max-w-sm h-48 overflow-hidden cursor-pointer transition-all duration-200 hover:shadow-md hover:border-border/80 bg-card/50 hover:bg-card border-border/40"
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
            <Badge
              variant="outline"
              className={cn("text-xs px-2 py-0.5 border", badgeInfo.className)}
            >
              {badgeInfo.label}
            </Badge>
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
                      {Math.round(progress)}%
                    </span>
                  </div>
                  <ProgressBar value={progress} />
                </div>
              )}

            {book.state === "finished" && book.rating && (
              <StarRating rating={book.rating} />
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default BookCard;
