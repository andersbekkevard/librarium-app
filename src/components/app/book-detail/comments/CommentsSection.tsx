"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Book } from "@/lib/models/models";
import { useEventsContext } from "@/lib/providers/EventsProvider";
import {
  CaretDownIcon,
  CaretUpIcon,
  ChatCircleIcon,
  PlusCircleIcon,
} from "@phosphor-icons/react";
import * as React from "react";
import { useState } from "react";
import { CommentForm } from "./CommentForm";
import { CommentItem } from "./CommentItem";

interface CommentsSectionProps {
  book: Book;
  className?: string;
}

/**
 * Main comments section with collapsible timeline
 *
 * Features:
 * - Collapsible timeline view (collapsed by default)
 * - Always-visible "Add Comment" button
 * - Timeline shows comments in chronological order (newest first)
 * - Empty state when no comments exist
 * - Smooth animations for expand/collapse
 */
export const CommentsSection: React.FC<CommentsSectionProps> = ({
  book,
  className = "",
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showCommentForm, setShowCommentForm] = useState(false);

  const { getBookComments, addComment, commentsLoading, error } =
    useEventsContext();

  const comments = getBookComments(book.id);
  const hasComments = comments.length > 0;

  const handleAddComment = async (commentText: string) => {
    await addComment(
      book.id,
      commentText,
      book.state,
      book.progress.currentPage
    );
    setShowCommentForm(false);
  };

  const handleToggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  const getAddButtonText = () => {
    if (showCommentForm) return "Cancel";
    if (hasComments) return "Add Comment";
    return "Add First Comment";
  };

  const handleAddButtonClick = () => {
    if (showCommentForm) {
      setShowCommentForm(false);
    } else {
      setShowCommentForm(true);
      if (!isExpanded && hasComments) {
        setIsExpanded(true);
      }
    }
  };

  return (
    <Card className={`p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <ChatCircleIcon className="w-5 h-5 text-muted-foreground" weight="light" />
          <h3 className="text-lg font-semibold text-foreground">Comments</h3>
          {hasComments && (
            <span className="inline-flex items-center justify-center px-2.5 py-0.5 text-xs font-medium text-muted-foreground bg-input rounded-full dark:bg-input/30">
              {comments.length}
            </span>
          )}
        </div>
      </div>

      {/* Error display */}
      {error && (
        <div className="mb-5 p-4 bg-status-error/10 border border-status-error/20 rounded-xl">
          <p className="text-sm text-status-error">{error}</p>
        </div>
      )}

      {/* Add Comment Button (always visible when not showing form) */}
      {!showCommentForm && (
        <div className="mb-6">
          <Button
            onClick={handleAddButtonClick}
            className="flex items-center gap-2"
            disabled={commentsLoading}
          >
            <PlusCircleIcon className="w-4 h-4" weight="light" />
            {getAddButtonText()}
          </Button>
        </div>
      )}

      {/* Comment Form */}
      {showCommentForm && (
        <div className="mb-6">
          <CommentForm
            book={book}
            onSubmit={handleAddComment}
            onCancel={() => setShowCommentForm(false)}
            isSubmitting={commentsLoading}
          />
        </div>
      )}

      {/* Comments Timeline */}
      {hasComments && (
        <div className="relative">
          <div className="space-y-0">
            {(isExpanded ? comments : comments.slice(0, 1)).map(
              (comment, index, array) => (
                <CommentItem
                  key={comment.id}
                  comment={comment}
                  isFirst={index === 0}
                  isLast={isExpanded ? index === array.length - 1 : false}
                />
              )
            )}
          </div>

          {/* Visual indicator for more comments when collapsed */}
          {!isExpanded && comments.length > 1 && (
            <div className="relative">
              {/* Continue timeline line from first comment */}
              <div className="absolute left-4 top-0 h-8 w-0.5 bg-border" />
              
              {/* Placeholder comments with fade effect */}
              <div className="relative pl-12 pt-2">
                <div className="space-y-3 opacity-30">
                  <div className="bg-input border border-border rounded-xl p-4 dark:bg-input/30">
                    <div className="h-3 bg-muted-foreground/20 rounded-lg w-3/4 mb-2"></div>
                    <div className="h-3 bg-muted-foreground/20 rounded-lg w-1/2"></div>
                  </div>
                  {comments.length > 2 && (
                    <div className="bg-input border border-border rounded-xl p-4 dark:bg-input/30">
                      <div className="h-3 bg-muted-foreground/20 rounded-lg w-2/3 mb-2"></div>
                      <div className="h-3 bg-muted-foreground/20 rounded-lg w-1/3"></div>
                    </div>
                  )}
                </div>
                
                {/* Gradient fade overlay */}
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/50 to-background pointer-events-none" />
              </div>

              {/* Show more button */}
              <div className="relative pt-4 pb-2 flex justify-center">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleToggleExpanded}
                  className="bg-input shadow-sm border-border text-foreground hover:bg-accent hover:border-ring/30 flex items-center gap-2 rounded-xl transition-all duration-200 dark:bg-input/30"
                >
                  <CaretDownIcon className="w-4 h-4" weight="bold" />
                  Show {comments.length - 1} more comment
                  {comments.length - 1 !== 1 ? "s" : ""}
                </Button>
              </div>
            </div>
          )}

          {/* Collapse button when expanded */}
          {isExpanded && comments.length > 1 && (
            <div className="pt-5 border-t border-border mt-5 flex justify-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleToggleExpanded}
                className="text-muted-foreground hover:text-foreground flex items-center gap-2 transition-colors duration-200"
              >
                <CaretUpIcon className="w-4 h-4" weight="bold" />
                Collapse Comments
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Empty State */}
      {!hasComments && !showCommentForm && (
        <div className="text-center py-10 text-muted-foreground">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-input mb-3 dark:bg-input/30">
            <ChatCircleIcon className="w-6 h-6 text-muted-foreground/60" weight="light" />
          </div>
          <p className="text-sm font-medium">No comments yet</p>
          <p className="text-xs text-muted-foreground/60 mt-1">
            Share your thoughts about this book
          </p>
        </div>
      )}
    </Card>
  );
};
