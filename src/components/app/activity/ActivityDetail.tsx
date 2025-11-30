"use client";

import { Book, BookEvent } from "@/lib/models/models";
import { format, formatDistanceToNow } from "date-fns";
import {
  ArrowRightIcon,
  BookOpenIcon,
  CheckCircleIcon,
  ClockIcon,
  ChatCircleIcon,
  GearIcon,
  StarIcon,
  TrashIcon,
} from "@phosphor-icons/react";
import React from "react";

interface ActivityDetailProps {
  event: BookEvent;
  bookTitle: string;
  book?: Book;
}

type EventType = BookEvent["type"];

const EVENT_CONFIG: Record<
  EventType,
  {
    icon: React.ElementType;
    bgClass: string;
    iconClass: string;
    borderClass: string;
  }
> = {
  state_change: {
    icon: CheckCircleIcon,
    bgClass: "bg-status-info/10",
    iconClass: "text-status-info",
    borderClass: "border-l-status-info",
  },
  progress_update: {
    icon: BookOpenIcon,
    bgClass: "bg-brand-primary/10",
    iconClass: "text-brand-primary",
    borderClass: "border-l-brand-primary",
  },
  rating_added: {
    icon: StarIcon,
    bgClass: "bg-status-warning/10",
    iconClass: "text-status-warning",
    borderClass: "border-l-status-warning",
  },
  comment: {
    icon: ChatCircleIcon,
    bgClass: "bg-brand-accent/10",
    iconClass: "text-brand-accent",
    borderClass: "border-l-brand-accent",
  },
  manual_update: {
    icon: GearIcon,
    bgClass: "bg-muted",
    iconClass: "text-muted-foreground",
    borderClass: "border-l-muted-foreground",
  },
  delete_book: {
    icon: TrashIcon,
    bgClass: "bg-status-error/10",
    iconClass: "text-status-error",
    borderClass: "border-l-status-error",
  },
  review: {
    icon: ChatCircleIcon,
    bgClass: "bg-brand-secondary/10",
    iconClass: "text-brand-secondary",
    borderClass: "border-l-brand-secondary",
  },
};

const getEventConfig = (type: EventType) => {
  return (
    EVENT_CONFIG[type] || {
      icon: ClockIcon,
      bgClass: "bg-muted",
      iconClass: "text-muted-foreground",
      borderClass: "border-l-muted-foreground",
    }
  );
};

const getEventTitle = (event: BookEvent) => {
  switch (event.type) {
    case "state_change":
      const { previousState, newState } = event.data;
      if (newState === "finished") {
        return "Finished Reading";
      } else if (
        newState === "in_progress" &&
        previousState === "not_started"
      ) {
        return "Started Reading";
      } else if (newState === "not_started") {
        return "Added to Library";
      }
      return `Status Changed`;
    case "progress_update":
      const { previousPage, newPage } = event.data;
      const pagesRead = newPage ? newPage - (previousPage || 0) : 0;
      return pagesRead > 0 ? `Read ${pagesRead} pages` : "Updated progress";
    case "rating_added":
      return `Rated ${event.data.rating || 0} stars`;
    case "comment":
      return "Added a comment";
    case "review":
      return "Added a review";
    case "manual_update":
      return "Manual book update";
    case "delete_book":
      return "Deleted book from library";
    default:
      return "Activity updated";
  }
};

const getEventDetails = (event: BookEvent, book?: Book) => {
  const details: { label: string; value: string }[] = [];

  switch (event.type) {
    case "state_change":
      if (event.data.previousState && event.data.newState) {
        details.push({
          label: "Status",
          value: `${event.data.previousState.replace(
            "_",
            " "
          )} → ${event.data.newState.replace("_", " ")}`,
        });
      }
      break;
    case "progress_update":
      details.push({
        label: "Progress",
        value: `${event.data.newPage || 0} / ${
          book?.progress.totalPages || "?"
        } pages`,
      });
      if (event.data.previousPage && event.data.newPage) {
        const pagesRead = event.data.newPage - event.data.previousPage;
        if (pagesRead !== 0) {
          details.push({
            label: "Pages Read",
            value: `${pagesRead > 0 ? "+" : ""}${pagesRead} pages`,
          });
        }
      }
      break;
    case "rating_added":
      details.push({
        label: "Rating",
        value: `${event.data.rating || 0} out of 5 stars`,
      });
      break;
    case "comment":
      if (event.data.comment) {
        details.push({
          label: "Comment",
          value: event.data.comment,
        });
      }
      break;
    case "review":
      if (event.data.comment) {
        details.push({
          label: "Review",
          value: event.data.comment,
        });
      }
      break;
    case "manual_update":
      if (event.data.comment) {
        details.push({
          label: "Update Details",
          value: event.data.comment,
        });
      }
      break;
    case "delete_book":
      if (event.data.deletedBookTitle) {
        details.push({
          label: "Book Title",
          value: event.data.deletedBookTitle,
        });
      }
      if (event.data.deletedBookAuthor) {
        details.push({
          label: "Author",
          value: event.data.deletedBookAuthor,
        });
      }
      break;
  }

  return details;
};

const getStateBadge = (state: string) => {
  const stateConfig: Record<string, { bg: string; text: string }> = {
    finished: {
      bg: "bg-[var(--reading-finished-bg)]",
      text: "text-[var(--reading-finished-text)]",
    },
    in_progress: {
      bg: "bg-[var(--reading-in-progress-bg)]",
      text: "text-[var(--reading-in-progress-text)]",
    },
    not_started: {
      bg: "bg-secondary",
      text: "text-secondary-foreground",
    },
  };

  const config = stateConfig[state] || stateConfig.not_started;
  return `${config.bg} ${config.text}`;
};

export const ActivityDetail: React.FC<ActivityDetailProps> = ({
  event,
  bookTitle,
  book,
}) => {
  const config = getEventConfig(event.type);
  const Icon = config.icon;
  const eventDetails = getEventDetails(event, book);

  return (
    <div
      className={`relative pl-5 border-l-2 ${config.borderClass} hover:bg-muted/30 transition-colors rounded-r-lg`}
    >
      <div className="p-4">
        {/* Header row */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            {/* Icon */}
            <div
              className={`flex items-center justify-center h-9 w-9 rounded-lg ${config.bgClass}`}
            >
              <Icon className={`h-4 w-4 ${config.iconClass}`} />
            </div>

            {/* Title and book */}
            <div className="min-w-0">
              <h3 className="font-heading font-semibold text-foreground text-[15px] leading-snug">
                {getEventTitle(event)}
              </h3>
              <p className="text-sm text-muted-foreground truncate">
                {bookTitle}
              </p>
            </div>
          </div>

          {/* Timestamp */}
          <div className="text-right flex-shrink-0">
            <div className="text-sm text-muted-foreground">
              {formatDistanceToNow(event.timestamp.toDate(), {
                addSuffix: true,
              })}
            </div>
            <div className="text-xs text-muted-foreground/70">
              {format(event.timestamp.toDate(), "MMM d, yyyy 'at' h:mm a")}
            </div>
          </div>
        </div>

        {/* Event details */}
        {eventDetails.length > 0 && (
          <div className="mt-3 pl-12 space-y-1.5">
            {eventDetails.map((detail, index) => (
              <div key={index} className="flex items-start gap-2 text-sm">
                <ArrowRightIcon className="h-3 w-3 text-muted-foreground/60 mt-1 flex-shrink-0" />
                <span className="text-muted-foreground min-w-[4.5rem]">
                  {detail.label}:
                </span>
                <span className="text-foreground/90 font-medium">
                  {detail.value}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Badges */}
        <div className="mt-3 pl-12 flex items-center gap-2">
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-muted text-muted-foreground">
            {event.type.replace(/_/g, " ")}
          </span>
          {book?.state && (
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${getStateBadge(
                book.state
              )}`}
            >
              {book.state.replace(/_/g, " ")}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
