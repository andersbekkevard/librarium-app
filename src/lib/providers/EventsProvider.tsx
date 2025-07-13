"use client";

import { BookEvent } from "@/lib/models/models";
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
  loading: boolean;
  error: string | null;
  refreshEvents: () => Promise<void>;
  getEventsByType: (type: BookEvent["type"]) => BookEvent[];
  getEventsByDateRange: (startDate: Date, endDate: Date) => BookEvent[];
  getEventsByBookId: (bookId: string) => BookEvent[];
}

const EventsContext = createContext<EventsContextType | undefined>(undefined);

interface EventsProviderProps {
  children: ReactNode;
}

export const EventsProvider: React.FC<EventsProviderProps> = ({ children }) => {
  const [events, setEvents] = useState<BookEvent[]>([]);
  const [loading, setLoading] = useState(true);
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
        setError(typeof result.error === 'string' ? result.error : "Failed to load events");
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
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

  useEffect(() => {
    if (user?.uid) {
      refreshEvents();
    } else {
      setEvents([]);
      setLoading(false);
    }
  }, [user?.uid]);

  const value: EventsContextType = {
    events,
    loading,
    error,
    refreshEvents,
    getEventsByType,
    getEventsByDateRange,
    getEventsByBookId,
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
