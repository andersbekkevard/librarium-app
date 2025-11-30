"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Book, BookReview, validateReview } from "@/lib/models/models";
import { BRAND_COLORS, STATUS_COLORS } from "@/lib/design/colors";
import { CircleNotchIcon } from "@phosphor-icons/react";

interface ReviewDialogProps {
  book: Book;
  existingReview?: BookReview | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onReviewSaved: () => void;
  onAddReview: (bookId: string, reviewText: string) => Promise<void>;
  onUpdateReview: (bookId: string, reviewText: string) => Promise<void>;
  isSubmitting?: boolean;
}

export const ReviewDialog: React.FC<ReviewDialogProps> = ({
  book,
  existingReview,
  open,
  onOpenChange,
  onReviewSaved,
  onAddReview,
  onUpdateReview,
  isSubmitting = false,
}) => {
  const [reviewText, setReviewText] = useState(existingReview?.text || "");
  const [localError, setLocalError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const isEditing = !!existingReview;
  const characterCount = reviewText.trim().length;
  const isValidLength = validateReview(reviewText);

  const handleSubmit = async () => {
    setLocalError(null);
    setSuccessMessage(null);
    
    if (!isValidLength) {
      setLocalError("Review must be between 10 and 5000 characters");
      return;
    }

    setIsLoading(true);
    try {
      if (isEditing) {
        await onUpdateReview(book.id, reviewText);
        setSuccessMessage("Review updated successfully!");
      } else {
        await onAddReview(book.id, reviewText);
        setSuccessMessage("Review added successfully!");
      }
      
      // Wait a bit to show success message, then close
      setTimeout(() => {
        onReviewSaved();
      }, 1000);
    } catch {
      setLocalError("Failed to save review. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setReviewText(existingReview?.text || "");
    setLocalError(null);
    setSuccessMessage(null);
    onOpenChange(false);
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      handleCancel();
    } else {
      onOpenChange(newOpen);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit Review" : "Add Review"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Book info */}
          <div className="text-sm text-muted-foreground">
            <span className="font-medium">{book.title}</span> by {book.author}
          </div>

          {/* Review input */}
          <div className="space-y-2">
            <Label htmlFor="review-text">Your Review</Label>
            <Textarea
              id="review-text"
              placeholder="Share your thoughts about this book..."
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              rows={6}
              className="resize-none"
              disabled={isLoading || isSubmitting}
            />
            
            {/* Character count */}
            <div className="flex justify-between items-center text-xs">
              <span 
                className={`${
                  isValidLength 
                    ? "text-muted-foreground" 
                    : characterCount < 10 
                      ? STATUS_COLORS.warning.text 
                      : STATUS_COLORS.error.text
                }`}
              >
                {characterCount}/5000 characters
                {characterCount < 10 && (
                  <span className="ml-1">
                    ({10 - characterCount} more needed)
                  </span>
                )}
              </span>
            </div>
          </div>

          {/* Error display */}
          {localError && (
            <div className={`p-3 rounded-md ${STATUS_COLORS.error.bgLight} ${STATUS_COLORS.error.borderLight} border`}>
              <p className={`text-sm ${STATUS_COLORS.error.text}`}>
                {localError}
              </p>
            </div>
          )}

          {/* Success display */}
          {successMessage && (
            <div className={`p-3 rounded-md ${STATUS_COLORS.success.bgLight} ${STATUS_COLORS.success.borderLight} border`}>
              <p className={`text-sm ${STATUS_COLORS.success.text}`}>
                {successMessage}
              </p>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex gap-3 justify-end">
            <Button
              variant="outline"
              onClick={handleCancel}
              disabled={isLoading || isSubmitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!isValidLength || isLoading || isSubmitting}
              className={`${BRAND_COLORS.primary.bg} ${BRAND_COLORS.primary.bgHover}`}
            >
              {(isLoading || isSubmitting) && (
                <CircleNotchIcon className="mr-2 h-4 w-4 animate-spin" weight="bold" />
              )}
              {isEditing ? "Update Review" : "Save Review"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ReviewDialog;
