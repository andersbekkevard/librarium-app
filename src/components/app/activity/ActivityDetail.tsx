import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Book, BookEvent } from "@/lib/models/models";
import { format, formatDistanceToNow } from "date-fns";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Clock,
  MessageSquare,
  Star,
} from "lucide-react";
import React from "react";

interface ActivityDetailProps {
  event: BookEvent;
  bookTitle: string;
  book?: Book;
}

export const ActivityDetail: React.FC<ActivityDetailProps> = ({
  event,
  bookTitle,
  book,
}) => {
  const getEventIcon = (type: BookEvent["type"]) => {
    switch (type) {
      case "state_change":
        return <CheckCircle2 className="h-4 w-4" />;
      case "progress_update":
        return <BookOpen className="h-4 w-4" />;
      case "rating_added":
        return <Star className="h-4 w-4" />;
      case "note_added":
        return <MessageSquare className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getEventColor = (type: BookEvent["type"]) => {
    switch (type) {
      case "state_change":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "progress_update":
        return "bg-green-50 text-green-700 border-green-200";
      case "rating_added":
        return "bg-yellow-50 text-yellow-700 border-yellow-200";
      case "note_added":
        return "bg-purple-50 text-purple-700 border-purple-200";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
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
        } else {
          return `Status Changed: ${previousState} → ${newState}`;
        }
      case "progress_update":
        const { previousPage, newPage } = event.data;
        const pagesRead = newPage ? newPage - (previousPage || 0) : 0;
        return `${
          pagesRead > 0 ? `Read ${pagesRead} pages` : "Updated progress"
        }`;
      case "rating_added":
        return `Rated ${event.data.rating || 0} stars`;
      case "note_added":
        return "Added a note";
      default:
        return "Activity updated";
    }
  };

  const getEventDetails = (event: BookEvent) => {
    const details = [];

    switch (event.type) {
      case "state_change":
        if (event.data.previousState && event.data.newState) {
          details.push({
            label: "Status",
            value: `${event.data.previousState} → ${event.data.newState}`,
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
          details.push({
            label: "Pages Read",
            value: `${pagesRead} pages`,
          });
        }
        break;
      case "rating_added":
        details.push({
          label: "Rating",
          value: `${event.data.rating || 0} out of 5 stars`,
        });
        break;
      case "note_added":
        if (event.data.note) {
          details.push({
            label: "Note",
            value: event.data.note,
          });
        }
        break;
    }

    return details;
  };

  const eventDetails = getEventDetails(event);

  return (
    <Card className="border-l-4 border-l-brand-primary hover:shadow-md transition-shadow">
      <div className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div
              className={`p-2 rounded-lg border ${getEventColor(event.type)}`}
            >
              {getEventIcon(event.type)}
            </div>
            <div>
              <h3 className="font-semibold text-foreground">
                {getEventTitle(event)}
              </h3>
              <p className="text-sm text-muted-foreground">{bookTitle}</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-muted-foreground">
              {formatDistanceToNow(event.timestamp.toDate(), {
                addSuffix: true,
              })}
            </div>
            <div className="text-xs text-muted-foreground">
              {format(event.timestamp.toDate(), "MMM d, yyyy 'at' h:mm a")}
            </div>
          </div>
        </div>

        {eventDetails.length > 0 && (
          <div className="mt-3 space-y-2">
            {eventDetails.map((detail, index) => (
              <div key={index} className="flex items-center gap-2 text-sm">
                <ArrowRight className="h-3 w-3 text-muted-foreground" />
                <span className="text-muted-foreground min-w-16">
                  {detail.label}:
                </span>
                <span className="text-foreground font-medium">
                  {detail.value}
                </span>
              </div>
            ))}
          </div>
        )}

        <div className="mt-3 flex items-center gap-2">
          <Badge variant="outline" className="text-xs">
            {event.type.replace("_", " ")}
          </Badge>
          {book?.state && (
            <Badge variant="secondary" className="text-xs">
              {book.state.replace("_", " ")}
            </Badge>
          )}
        </div>
      </div>
    </Card>
  );
};
