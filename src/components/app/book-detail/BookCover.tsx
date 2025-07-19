"use client";

import { BookOpen, CheckCircle, Edit, Play, Star, FileText } from "lucide-react";
import * as React from "react";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { ReadingStateBadge } from "@/components/ui/reading-state-badge";
import { Book } from "@/lib/models/models";

interface BookCoverProps {
  book: Book;
  progress: number;
  onStartReading: () => void;
  onMarkAsFinished: () => void;
  onEditBook: () => void;
  onRatingChange: (rating: number) => void;
  onAddReview?: () => void;
  hasExistingReview?: boolean;
  isUpdating: boolean;
}

export const BookCover: React.FC<BookCoverProps> = ({
  book,
  progress,
  onStartReading,
  onMarkAsFinished,
  onEditBook,
  onRatingChange,
  onAddReview,
  hasExistingReview = false,
  isUpdating,
}) => {
  const [rating, setRating] = useState(book.rating || 0);
  const [hoverRating, setHoverRating] = useState(0);

  const handleRatingClick = (newRating: number) => {
    setRating(newRating);
    onRatingChange(newRating);
  };

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-6">
        {/* Cover image */}
        <div className="aspect-[2/3] w-full mb-4 rounded-lg overflow-hidden bg-muted">
          {book.coverImage ? (
            <img
              src={book.coverImage}
              alt={`${book.title} cover`}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center">
              <BookOpen className="h-16 w-16 text-muted-foreground mb-4" />
              <p className="text-sm font-medium text-foreground mb-2">
                {book.title}
              </p>
              <p className="text-xs text-muted-foreground">by {book.author}</p>
            </div>
          )}
        </div>

        {/* Reading status badge */}
        <div className="flex items-center gap-2 mb-4">
          <ReadingStateBadge state={book.state} showIcon={true} />
          {book.isOwned && (
            <Badge variant="outline" className="text-xs">
              Owned
            </Badge>
          )}
        </div>

        {/* Progress bar for in-progress books */}
        {book.state === "in_progress" && (
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">{progress}% complete</span>
              <span className="text-xs text-muted-foreground">
                {book.progress.currentPage || 0} /{" "}
                {book.progress.totalPages || "?"} pages
              </span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div
                className="bg-brand-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Star rating for finished books */}
        {book.state === "finished" && (
          <div className="mb-4">
            <Label className="text-sm font-medium mb-2 block">
              Your Rating
            </Label>
            <div className="flex items-center gap-1">
              {Array.from({ length: 5 }, (_, i) => (
                <Star
                  key={i}
                  className={`h-5 w-5 cursor-pointer transition-colors ${
                    i < (hoverRating || rating)
                      ? "fill-status-warning text-status-warning"
                      : "fill-muted text-muted hover:text-status-warning"
                  }`}
                  onMouseEnter={() => setHoverRating(i + 1)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => handleRatingClick(i + 1)}
                />
              ))}
              <span className="text-sm text-muted-foreground ml-2">
                ({rating}/5)
              </span>
            </div>
          </div>
        )}

        {/* Action buttons */}
        <div className="space-y-2">
          {book.state === "not_started" && (
            <Button
              onClick={onStartReading}
              disabled={isUpdating}
              className="w-full"
            >
              <Play className="h-4 w-4 mr-2" />
              Start Reading
            </Button>
          )}

          {book.state === "in_progress" && (
            <Button
              onClick={onMarkAsFinished}
              disabled={isUpdating}
              className="w-full"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Mark as Finished
            </Button>
          )}

          {book.state === "finished" && !hasExistingReview && onAddReview && (
            <Button
              onClick={onAddReview}
              disabled={isUpdating}
              className="w-full bg-brand-secondary hover:bg-brand-secondary-hover"
            >
              <FileText className="h-4 w-4 mr-2" />
              Add Review
            </Button>
          )}

          <Button variant="outline" className="w-full" onClick={onEditBook}>
            <Edit className="h-4 w-4 mr-2" />
            Edit Book
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default BookCover;
