"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { STATUS_COLORS } from "@/lib/design/colors";
import { Book, BookReview } from "@/lib/models/models";
import { Edit3, FileText, Loader2 } from "lucide-react";
import { useState } from "react";
import { ReviewDialog } from "./ReviewDialog";

interface ReviewSectionProps {
  book: Book;
  review: BookReview | null;
  onAddReview: (bookId: string, reviewText: string) => Promise<void>;
  onUpdateReview: (bookId: string, reviewText: string) => Promise<void>;
  onReviewUpdated: () => void;
  isLoading?: boolean;
  error?: string | null;
  className?: string;
}

/**
 * ReviewSection displays the user's review for a book and provides edit functionality
 *
 * Features:
 * - Only renders when a review exists
 * - Displays review text with creation/update timestamps
 * - Shows "Edit Review" button
 * - Handles review loading states and errors
 * - Positioned above CommentsSection in BookDetailPage
 */
export const ReviewSection: React.FC<ReviewSectionProps> = ({
  book,
  review,
  onAddReview,
  onUpdateReview,
  onReviewUpdated,
  isLoading = false,
  error = null,
  className = "",
}) => {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Don't render if no review exists
  if (!review && !isLoading) {
    return null;
  }

  const formatDate = (timestamp: { toDate?: () => Date } | Date | string) => {
    if (!timestamp) return "";

    let date: Date;
    if (
      typeof timestamp === "object" &&
      "toDate" in timestamp &&
      timestamp.toDate
    ) {
      date = timestamp.toDate();
    } else if (timestamp instanceof Date) {
      date = timestamp;
    } else if (typeof timestamp === "string") {
      date = new Date(timestamp);
    } else {
      // fallback for any other cases
      date = new Date();
    }

    return date.toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (timestamp: { toDate?: () => Date } | Date | string) => {
    if (!timestamp) return "";

    let date: Date;
    if (
      typeof timestamp === "object" &&
      "toDate" in timestamp &&
      timestamp.toDate
    ) {
      date = timestamp.toDate();
    } else if (timestamp instanceof Date) {
      date = timestamp;
    } else if (typeof timestamp === "string") {
      date = new Date(timestamp);
    } else {
      // fallback for any other cases
      date = new Date();
    }

    return date.toLocaleTimeString(undefined, {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleEditClick = () => {
    setIsEditDialogOpen(true);
  };

  const handleReviewSaved = () => {
    setIsEditDialogOpen(false);
    onReviewUpdated();
  };

  const handleUpdateReview = async (bookId: string, reviewText: string) => {
    setIsSubmitting(true);
    try {
      await onUpdateReview(bookId, reviewText);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isUpdated =
    review &&
    review.updatedAt &&
    review.updatedAt.toMillis() > review.createdAt.toMillis();

  return (
    <>
      <Card className={`${className}`}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              <CardTitle className="text-lg">Your Review</CardTitle>
            </div>

            {review && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleEditClick}
                disabled={isLoading || isSubmitting}
                className="flex items-center gap-2"
              >
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Edit3 className="w-4 h-4" />
                )}
                Edit Review
              </Button>
            )}
          </div>
        </CardHeader>

        <CardContent>
          {/* Loading state */}
          {isLoading && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              <span className="ml-2 text-muted-foreground">
                Loading review...
              </span>
            </div>
          )}

          {/* Error state */}
          {error && (
            <div
              className={`p-3 rounded-md ${STATUS_COLORS.error.bgLight} ${STATUS_COLORS.error.borderLight} border`}
            >
              <p className={`text-sm ${STATUS_COLORS.error.text}`}>{error}</p>
            </div>
          )}

          {/* Review content */}
          {review && !isLoading && (
            <div className="space-y-4">
              {/* Review text */}
              <div className="prose prose-sm max-w-none">
                <p className="text-foreground whitespace-pre-wrap leading-relaxed">
                  {review.text}
                </p>
              </div>

              {/* Timestamps */}
              <div className="flex flex-col gap-1 text-xs text-muted-foreground border-t pt-3">
                <div>
                  <span className="font-medium">Written:</span>{" "}
                  {formatDate(review.createdAt)} at{" "}
                  {formatTime(review.createdAt)}
                </div>
                {isUpdated && (
                  <div>
                    <span className="font-medium">Last updated:</span>{" "}
                    {formatDate(review.updatedAt)} at{" "}
                    {formatTime(review.updatedAt)}
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Review Dialog */}
      {review && (
        <ReviewDialog
          book={book}
          existingReview={review}
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          onReviewSaved={handleReviewSaved}
          onAddReview={onAddReview}
          onUpdateReview={handleUpdateReview}
          isSubmitting={isSubmitting}
        />
      )}
    </>
  );
};

export default ReviewSection;
