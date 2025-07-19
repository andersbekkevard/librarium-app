"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Book } from "@/lib/models/models";
import { useEventsContext } from "@/lib/providers/EventsProvider";
import { ChevronDown, ChevronUp, MessageSquare, MessageSquarePlus } from "lucide-react";
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
  
  const { 
    getBookComments, 
    addComment, 
    commentsLoading, 
    error 
  } = useEventsContext();

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
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-brand-secondary" />
          <h3 className="text-lg font-semibold text-gray-900">
            Comments
          </h3>
          {hasComments && (
            <span className="inline-flex items-center justify-center w-6 h-6 text-xs font-medium text-gray-600 bg-gray-100 rounded-full">
              {comments.length}
            </span>
          )}
        </div>

        {hasComments && !showCommentForm && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleToggleExpanded}
            className="flex items-center gap-1 text-gray-600 hover:text-gray-900"
          >
            {isExpanded ? (
              <>
                <ChevronUp className="w-4 h-4" />
                Collapse
              </>
            ) : (
              <>
                <ChevronDown className="w-4 h-4" />
                Show All
              </>
            )}
          </Button>
        )}
      </div>

      {/* Error display */}
      {error && (
        <div className="mb-4 p-3 bg-status-error/10 border border-status-error/20 rounded-md">
          <p className="text-sm text-status-error">{error}</p>
        </div>
      )}

      {/* Add Comment Button (always visible when not showing form) */}
      {!showCommentForm && (
        <div className="mb-6">
          <Button
            onClick={handleAddButtonClick}
            className="flex items-center gap-2 bg-brand-secondary hover:bg-brand-secondary-hover"
            disabled={commentsLoading}
          >
            <MessageSquarePlus className="w-4 h-4" />
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
        <div 
          className={`transition-all duration-300 ease-in-out overflow-hidden ${
            isExpanded || comments.length <= 1 ? 'max-h-none' : 'max-h-32'
          }`}
        >
          <div className="space-y-0">
            {(isExpanded ? comments : comments.slice(0, 1)).map((comment, index, array) => (
              <CommentItem
                key={comment.id}
                comment={comment}
                isFirst={index === 0}
                isLast={index === array.length - 1}
              />
            ))}
          </div>

          {/* Show more indicator when collapsed */}
          {!isExpanded && comments.length > 1 && (
            <div className="pt-4 border-t border-gray-200 mt-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleToggleExpanded}
                className="w-full text-gray-600 hover:text-gray-900"
              >
                <ChevronDown className="w-4 h-4 mr-1" />
                Show {comments.length - 1} more comment{comments.length - 1 !== 1 ? 's' : ''}
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Empty State */}
      {!hasComments && !showCommentForm && (
        <div className="text-center py-8 text-gray-500">
          <MessageSquare className="w-8 h-8 mx-auto mb-2 text-gray-400" />
          <p className="text-sm">No comments yet</p>
          <p className="text-xs text-gray-400 mt-1">
            Share your thoughts about this book
          </p>
        </div>
      )}

      {/* Bottom Add Comment Button (when timeline is expanded) */}
      {hasComments && isExpanded && !showCommentForm && (
        <div className="pt-4 border-t border-gray-200 mt-6">
          <Button
            onClick={handleAddButtonClick}
            variant="outline"
            className="w-full flex items-center gap-2"
            disabled={commentsLoading}
          >
            <MessageSquarePlus className="w-4 h-4" />
            Add Comment
          </Button>
        </div>
      )}
    </Card>
  );
};