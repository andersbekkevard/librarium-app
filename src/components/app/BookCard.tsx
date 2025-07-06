"use client";

import * as React from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, BookOpen, Edit, RotateCcw } from "lucide-react";
import { Book } from "@/lib/models";

interface BookCardProps {
  book: Book;
  onEdit?: (book: Book) => void;
  onUpdateProgress?: (book: Book) => void;
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

const renderStars = (rating: number) => {
  return Array.from({ length: 5 }, (_, i) => (
    <Star
      key={i}
      className={`h-3 w-3 ${
        i < rating
          ? "fill-status-warning text-status-warning"
          : "fill-muted text-muted"
      }`}
    />
  ));
};

export const BookCard: React.FC<BookCardProps> = ({
  book,
  onEdit,
  onUpdateProgress,
}) => {
  const badgeInfo = getReadingStateBadge(book.state);
  const progress =
    book.state === "in_progress" &&
    book.progress.currentPage &&
    book.progress.totalPages
      ? calculateProgress(book.progress.currentPage, book.progress.totalPages)
      : book.progress.percentage || 0;

  const handleEdit = () => {
    onEdit?.(book);
  };

  const handleUpdateProgress = () => {
    onUpdateProgress?.(book);
  };

  return (
    <Card className="w-full max-w-xs mx-auto">
      <CardHeader className="pb-2">
        {/* Cover Image or Fallback */}
        <div className="relative aspect-[2/3] w-full mb-2 rounded-md overflow-hidden bg-muted">
          {book.coverImage ? (
            <img
              src={book.coverImage}
              alt={`${book.title} cover`}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center p-3 text-center">
              <BookOpen className="h-10 w-10 text-muted-foreground mb-1" />
              <p className="text-xs font-medium text-foreground line-clamp-2">
                {book.title}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                by {book.author}
              </p>
            </div>
          )}
        </div>

        {/* Reading State Badge */}
        <div className="flex justify-between items-start gap-1">
          <Badge variant={badgeInfo.variant} className="text-xs">
            {badgeInfo.label}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="pb-2">
        {/* Book Title and Author */}
        <CardTitle className="text-base font-semibold mb-1 line-clamp-2">
          {book.title}
        </CardTitle>
        <CardDescription className="text-xs text-muted-foreground mb-2">
          by {book.author}
        </CardDescription>

        {/* Progress for In Progress Books */}
        {book.state === "in_progress" && book.progress.currentPage && (
          <div className="mb-2">
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs font-medium">{progress}% complete</span>
              <span className="text-xs text-muted-foreground">
                {book.progress.currentPage} / {book.progress.totalPages || "?"}{" "}
                pages
              </span>
            </div>
            <div className="w-full bg-muted rounded-full h-1.5">
              <div
                className="bg-brand-primary h-1.5 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Star Rating for Finished Books */}
        {book.state === "finished" && book.rating && (
          <div className="flex items-center gap-1 mb-2">
            {renderStars(book.rating)}
            <span className="text-xs text-muted-foreground ml-1">
              ({book.rating}/5)
            </span>
          </div>
        )}
      </CardContent>

      <CardFooter className="pt-2 flex gap-2">
        {/* Edit Button - Always Visible */}
        <Button
          variant="outline"
          size="sm"
          onClick={handleEdit}
          className="flex-1 text-xs px-2 py-1"
        >
          <Edit className="h-3 w-3 mr-1" />
          Edit
        </Button>

        {/* Update Button - Only for In Progress Books */}
        {book.state === "in_progress" && (
          <Button
            variant="default"
            size="sm"
            onClick={handleUpdateProgress}
            className="flex-1 text-xs px-2 py-1"
          >
            <RotateCcw className="h-3 w-3 mr-1" />
            Update
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default BookCard;
