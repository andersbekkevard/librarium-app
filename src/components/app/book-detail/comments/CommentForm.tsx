"use client";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Book, validateComment } from "@/lib/models/models";
import { PlusCircle, XIcon } from "@phosphor-icons/react";
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
    <div className="bg-input border border-border rounded-xl p-5 dark:bg-input/30">
      <form onSubmit={handleSubmit}>
        {/* Header */}
        <div className="flex items-center gap-2 mb-4">
          <PlusCircle className="w-4 h-4 text-muted-foreground" weight="light" />
          <Label
            htmlFor="comment-input"
            className="text-sm font-medium text-muted-foreground"
          >
            Add Comment
          </Label>
        </div>

        {/* Textarea */}
        <div className="mb-4">
          <textarea
            id="comment-input"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="What are your thoughts?"
            className="w-full min-h-[120px] px-4 py-3 border border-border rounded-xl text-sm placeholder-muted-foreground outline-none transition-all duration-200 focus:border-ring focus:ring-ring/30 focus:ring-2 resize-none bg-background text-foreground"
            maxLength={maxLength}
            disabled={isSubmitting}
            aria-label="Comment text"
          />

          {/* Character count */}
          <div className="flex justify-between items-center mt-2">
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
        <div className="flex items-center gap-2 mb-5 px-4 py-2.5 bg-background border border-border rounded-xl">
          <span className="text-xs text-muted-foreground">{stateDisplay.page}</span>
          <span className="text-xs text-muted-foreground/40">•</span>
          <span className="text-xs text-muted-foreground">{stateDisplay.label}</span>
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-4 p-3 bg-status-error/10 border border-status-error/20 rounded-xl">
            <p className="text-xs text-status-error">{error}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onCancel}
            disabled={isSubmitting}
            className="flex items-center gap-1.5 transition-colors duration-200"
          >
            <XIcon className="w-3.5 h-3.5" weight="light" />
            Cancel
          </Button>

          <Button
            type="submit"
            size="sm"
            disabled={!isValid || isSubmitting}
            className="flex items-center gap-1.5"
          >
            <PlusCircle className="w-3.5 h-3.5" weight="light" />
            {isSubmitting ? "Adding..." : "Add Comment"}
          </Button>
        </div>
      </form>
    </div>
  );
};
