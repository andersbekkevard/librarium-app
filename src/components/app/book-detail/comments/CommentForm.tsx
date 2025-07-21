"use client";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Book, validateComment } from "@/lib/models/models";
import { MessageSquarePlus, X } from "lucide-react";
import * as React from "react";
import { useState } from "react";

interface CommentFormProps {
  book: Book;
  onSubmit: (comment: string) => Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
}

/**
 * Comment input form component
 *
 * Features:
 * - Textarea for comment input with character limit
 * - Auto-detection of current reading state and page
 * - Submit/Cancel buttons with loading states
 * - Real-time validation and character count
 */
export const CommentForm: React.FC<CommentFormProps> = ({
  book,
  onSubmit,
  onCancel,
  isSubmitting = false,
}) => {
  const [comment, setComment] = useState("");
  const [error, setError] = useState<string | null>(null);

  const maxLength = 2000;
  const characterCount = comment.length;
  const isValid = validateComment(comment);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isValid) {
      setError("Comment must be between 1 and 2000 characters");
      return;
    }

    setError(null);

    try {
      await onSubmit(comment.trim());
      setComment("");
    } catch {
      setError("Failed to add comment. Please try again.");
    }
  };

  const getStateDisplay = () => {
    switch (book.state) {
      case "not_started":
        return { label: "Not Started", page: "Page 0" };
      case "in_progress":
        return {
          label: "Currently Reading",
          page: `Page ${book.progress.currentPage}`,
        };
      case "finished":
        return { label: "Finished", page: `Page ${book.progress.totalPages}` };
      default:
        return { label: "Unknown", page: "Page 0" };
    }
  };

  const stateDisplay = getStateDisplay();

  return (
    <div className="bg-background border border-border rounded-lg p-4 shadow-sm">
      <form onSubmit={handleSubmit}>
        {/* Header */}
        <div className="flex items-center gap-2 mb-3">
          <MessageSquarePlus className="w-4 h-4 text-foreground" />
          <Label
            htmlFor="comment-input"
            className="text-sm font-medium text-foreground"
          >
            Add Comment
          </Label>
        </div>

        {/* Textarea */}
        <div className="mb-3">
          <textarea
            id="comment-input"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="What are your thoughts?"
            className="w-full min-h-[100px] p-3 border border-border rounded-md text-sm placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent resize-none bg-background text-foreground"
            maxLength={maxLength}
            disabled={isSubmitting}
          />

          {/* Character count */}
          <div className="flex justify-between items-center mt-1">
            <span
              className={`text-xs ${
                characterCount > maxLength * 0.9
                  ? "text-status-warning"
                  : "text-muted-foreground"
              }`}
            >
              {characterCount}/{maxLength} characters
            </span>
          </div>
        </div>

        {/* Reading context */}
        <div className="flex items-center gap-2 mb-4 px-3 py-2 bg-muted rounded-md">
          <span className="text-xs text-muted-foreground">{stateDisplay.page}</span>
          <span className="text-xs text-muted-foreground/60">•</span>
          <span className="text-xs text-muted-foreground">{stateDisplay.label}</span>
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-3 p-2 bg-status-error/10 border border-status-error/20 rounded-md">
            <p className="text-xs text-status-error">{error}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onCancel}
            disabled={isSubmitting}
            className="flex items-center gap-1"
          >
            <X className="w-3 h-3" />
            Cancel
          </Button>

          <Button
            type="submit"
            size="sm"
            disabled={!isValid || isSubmitting}
            className="flex items-center gap-1 bg-foreground hover:bg-foreground/90 text-background"
          >
            <MessageSquarePlus className="w-3 h-3" />
            {isSubmitting ? "Adding..." : "Add Comment"}
          </Button>
        </div>
      </form>
    </div>
  );
};
