"use client";

import {
  ActivityItem,
  BookComment,
  BookEvent,
  ReadingState,
} from "@/lib/models/models";
import { eventService } from "@/lib/services/EventService";
import React, {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import { useAuthContext } from "./AuthProvider";

interface EventsContextType {
  events: BookEvent[];
  activities: ActivityItem[];
  loading: boolean;
  activitiesLoading: boolean;
  commentsLoading: boolean;
  error: string | null;
  refreshEvents: () => Promise<void>;
  refreshActivities: () => Promise<void>;
  getEventsByType: (type: BookEvent["type"]) => BookEvent[];
  getEventsByDateRange: (startDate: Date, endDate: Date) => BookEvent[];
  getEventsByBookId: (bookId: string) => BookEvent[];

  // Comment-specific methods
  addComment: (
    bookId: string,
    comment: string,
    readingState: ReadingState,
    currentPage: number
  ) => Promise<void>;
  getBookComments: (bookId: string) => BookComment[];
}

const EventsContext = createContext<EventsContextType | undefined>(undefined);

interface EventsProviderProps {
  children: ReactNode;
}

export const EventsProvider: React.FC<EventsProviderProps> = ({ children }) => {
  const [events, setEvents] = useState<BookEvent[]>([]);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activitiesLoading, setActivitiesLoading] = useState(true);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuthContext();

  const refreshEvents = async () => {
    if (!user?.uid) {
      setEvents([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await eventService.getRecentEvents(user.uid, 1000); // Get all events
      if (result.success && result.data) {
        setEvents(result.data);
      } else {
        setError(
          typeof result.error === "string"
            ? result.error
            : "Failed to load events"
        );
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const refreshActivities = async () => {
    if (!user?.uid) {
      setActivities([]);
      setActivitiesLoading(false);
      return;
    }

    setActivitiesLoading(true);
    setError(null);

    try {
      const result = await eventService.getRecentActivityItems(user.uid, 6); // Get recent activities for dashboard
      if (result.success && result.data) {
        setActivities(result.data);
      } else {
        setError(
          typeof result.error === "string"
            ? result.error
            : "Failed to load activities"
        );
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setActivitiesLoading(false);
    }
  };

  const getEventsByType = (type: BookEvent["type"]) => {
    return events.filter((event) => event.type === type);
  };

  const getEventsByDateRange = (startDate: Date, endDate: Date) => {
    return events.filter((event) => {
      const eventDate = event.timestamp.toDate();
      return eventDate >= startDate && eventDate <= endDate;
    });
  };

  const getEventsByBookId = (bookId: string) => {
    return events.filter((event) => event.bookId === bookId);
  };

  const addComment = async (
    bookId: string,
    comment: string,
    readingState: ReadingState,
    currentPage: number
  ) => {
    if (!user?.uid) {
      throw new Error("User not authenticated");
    }

    setCommentsLoading(true);
    setError(null);

    try {
      const result = await eventService.addComment(
        user.uid,
        bookId,
        comment,
        readingState,
        currentPage
      );

      if (!result.success) {
        setError(
          typeof result.error === "string"
            ? result.error
            : "Failed to add comment"
        );
        return;
      }

      // Refresh events and activities to include the new comment
      await Promise.all([refreshEvents(), refreshActivities()]);
    } catch (err) {
      setError("An unexpected error occurred while adding comment");
    } finally {
      setCommentsLoading(false);
    }
  };

  const getBookComments = (bookId: string): BookComment[] => {
    const commentEvents = events.filter(
      (event) => event.type === "comment" && event.bookId === bookId
    );

    const comments: BookComment[] = commentEvents
      .map((event) => {
        if (!event.data.comment) return null;

        return {
          id: event.id,
          bookId: event.bookId,
          userId: event.userId,
          text: event.data.comment,
          readingState: event.data.commentState || "not_started",
          currentPage: event.data.commentPage || 0,
          timestamp: event.timestamp,
        };
      })
      .filter((comment): comment is BookComment => comment !== null)
      .sort((a, b) => b.timestamp.toMillis() - a.timestamp.toMillis()); // Sort newest first

    return comments;
  };

  useEffect(() => {
    if (user?.uid) {
      refreshEvents();
      refreshActivities();
    } else {
      setEvents([]);
      setActivities([]);
      setLoading(false);
      setActivitiesLoading(false);
    }
  }, [user?.uid]);

  const value: EventsContextType = {
    events,
    activities,
    loading,
    activitiesLoading,
    commentsLoading,
    error,
    refreshEvents,
    refreshActivities,
    getEventsByType,
    getEventsByDateRange,
    getEventsByBookId,
    addComment,
    getBookComments,
  };

  return (
    <EventsContext.Provider value={value}>{children}</EventsContext.Provider>
  );
};

export const useEventsContext = () => {
  const context = useContext(EventsContext);
  if (context === undefined) {
    throw new Error("useEventsContext must be used within an EventsProvider");
  }
  return context;
};
