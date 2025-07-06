"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Calendar } from "lucide-react";
import { Book } from "@/lib/models";

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
      return { label: "Not Started", variant: "secondary" as const };
    case "in_progress":
      return { label: "Reading", variant: "default" as const };
    case "finished":
      return { label: "Finished", variant: "outline" as const };
    default:
      return { label: "Unknown", variant: "secondary" as const };
  }
};

const calculateProgress = (currentPage: number, totalPages: number): number => {
  return Math.round((currentPage / totalPages) * 100);
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
      : book.progress.percentage || 0;

  const handleCardClick = () => {
    if (onBookClick) {
      onBookClick(book.id);
    } else {
      router.push(`/book/${book.id}`);
    }
  };

  return (
    <Card 
      className="group cursor-pointer transition-all duration-200 hover:shadow-sm hover:border-border/80 bg-card/50 hover:bg-card border-border/40"
      onClick={handleCardClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleCardClick();
        }
      }}
      aria-label={`View details for ${book.title} by ${book.author}`}
    >
      <CardContent className="p-3">
        <div className="flex gap-3">
          {/* Book Cover */}
          <div className="flex-shrink-0">
            <div className="w-12 h-16 rounded-md overflow-hidden bg-muted border border-border/20">
              {book.coverImage ? (
                <img
                  src={book.coverImage}
                  alt={`${book.title} cover`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <BookOpen className="h-5 w-5 text-muted-foreground" />
                </div>
              )}
            </div>
          </div>

          {/* Book Info */}
          <div className="flex-1 min-w-0 space-y-2">
            {/* Title & Author */}
            <div>
              <h3 className="font-medium text-sm text-foreground line-clamp-1 group-hover:text-brand-primary transition-colors">
                {book.title}
              </h3>
              <p className="text-xs text-muted-foreground line-clamp-1">
                {book.author}
              </p>
            </div>

            {/* Reading State and Progress */}
            <div className="space-y-1.5">
              {/* Reading State Badge */}
              <div className="flex items-center gap-2">
                <Badge 
                  variant={badgeInfo.variant} 
                  className="text-xs px-2 py-0.5 h-5"
                >
                  {badgeInfo.label}
                </Badge>
                {book.publishedDate && (
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    <span>{new Date(book.publishedDate).getFullYear()}</span>
                  </div>
                )}
              </div>

              {/* Progress Bar for In Progress Books */}
              {book.state === "in_progress" && (
                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-muted-foreground">
                      {book.progress.currentPage || 0} / {book.progress.totalPages || "?"} pages
                    </span>
                    <span className="text-xs font-medium text-foreground">
                      {progress}%
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-1">
                    <div
                      className="bg-brand-primary h-1 rounded-full transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Completion info for finished books */}
              {book.state === "finished" && book.finishedAt && (
                <div className="text-xs text-muted-foreground">
                  Finished {book.finishedAt?.toDate?.()?.toLocaleDateString()}
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default BookCard;
