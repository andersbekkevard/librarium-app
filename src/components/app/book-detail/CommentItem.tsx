"use client";

import { BookComment } from "@/lib/models/models";
import { formatDistanceToNow } from "date-fns";
import * as React from "react";

interface CommentItemProps {
  comment: BookComment;
  isFirst?: boolean;
  isLast?: boolean;
}

/**
 * Individual comment display component with timeline blob design
 *
 * Features:
 * - Timeline blob design with connecting lines
 * - Displays comment text, timestamp, page number
 * - Reading state indicator
 * - Responsive design for mobile/desktop
 */
export const CommentItem: React.FC<CommentItemProps> = ({
  comment,
  isLast = false,
}) => {
  const formatPageDisplay = (page: number, state: string) => {
    if (state === "not_started") return "Before starting";
    if (state === "finished") return "After finishing";
    return `Page ${page}`;
  };

  const getStateColor = (state: string) => {
    switch (state) {
      case "not_started":
        return "bg-gray-100 text-gray-700 border-gray-300";
      case "in_progress":
        return "bg-blue-100 text-blue-700 border-blue-300";
      case "finished":
        return "bg-green-100 text-green-700 border-green-300";
      default:
        return "bg-gray-100 text-gray-700 border-gray-300";
    }
  };

  return (
    <div className="relative flex gap-4">
      {/* Timeline line */}
      {!isLast && (
        <div className="absolute left-4 top-8 bottom-0 w-0.5 bg-gray-200" />
      )}

      {/* Timeline blob */}
      <div className="relative z-10 flex-shrink-0">
        <div className="w-8 h-8 bg-white border-2 border-gray-300 rounded-full flex items-center justify-center shadow-sm">
          <div className="w-3 h-3 bg-brand-primary rounded-full" />
        </div>
      </div>

      {/* Comment content */}
      <div className="flex-1 min-w-0 pb-6">
        {/* Comment text */}
        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
          <p className="text-gray-800 text-sm leading-relaxed whitespace-pre-wrap">
            {comment.text}
          </p>
        </div>

        {/* Comment metadata */}
        <div className="flex items-center gap-3 mt-2">
          <span className="text-xs text-gray-500">
            {formatDistanceToNow(comment.timestamp.toDate(), {
              addSuffix: true,
            })}
          </span>

          <span className="text-xs text-gray-400">•</span>

          <span className="text-xs text-gray-600">
            {formatPageDisplay(comment.currentPage, comment.readingState)}
          </span>

          <span
            className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${getStateColor(
              comment.readingState
            )}`}
          >
            {comment.readingState === "not_started" && "Not Started"}
            {comment.readingState === "in_progress" && "Reading"}
            {comment.readingState === "finished" && "Finished"}
          </span>
        </div>
      </div>
    </div>
  );
};
