"use client";

import React, { useState, useMemo } from "react";
import { useEventsContext } from "@/lib/providers/EventsProvider";
import { useBooksContext } from "@/lib/providers/BooksProvider";
import { ActivityFilters } from "@/components/app/activity/ActivityFilters";
import { ActivityDetail } from "@/components/app/activity/ActivityDetail";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Activity } from "lucide-react";

interface Filters {
  eventType: string;
  dateRange: {
    start: Date | null;
    end: Date | null;
  };
  bookId: string;
}

export default function ActivityHistoryPage() {
  const { events, loading, error } = useEventsContext();
  const { books } = useBooksContext();
  const [filters, setFilters] = useState<Filters>({
    eventType: "all",
    dateRange: {
      start: null,
      end: null,
    },
    bookId: "all",
  });

  const filteredEvents = useMemo(() => {
    let filtered = [...events];

    // Filter by event type
    if (filters.eventType !== "all") {
      filtered = filtered.filter((event) => event.type === filters.eventType);
    }

    // Filter by date range
    if (filters.dateRange.start && filters.dateRange.end) {
      filtered = filtered.filter((event) => {
        const eventDate = event.timestamp.toDate();
        return (
          eventDate >= filters.dateRange.start! &&
          eventDate <= filters.dateRange.end!
        );
      });
    }

    // Filter by book
    if (filters.bookId !== "all") {
      filtered = filtered.filter((event) => event.bookId === filters.bookId);
    }

    // Sort by timestamp (newest first)
    return filtered.sort(
      (a, b) => b.timestamp.toMillis() - a.timestamp.toMillis()
    );
  }, [events, filters]);

  const booksList = useMemo(() => {
    return Object.values(books || {});
  }, [books]);

  const getBookTitle = (bookId: string) => {
    return booksList.find(book => book.id === bookId)?.title || "Unknown Book";
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4 max-w-6xl">
        <div className="mb-8 animate-pulse">
          <div className="h-10 w-64 bg-muted rounded mb-2" />
          <div className="h-6 w-96 bg-muted rounded" />
        </div>
        <div className="grid gap-6">
          {[...Array(5)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <div className="h-6 w-48 bg-muted rounded" />
              </CardHeader>
              <CardContent>
                <div className="h-4 w-full bg-muted rounded mb-2" />
                <div className="h-4 w-32 bg-muted rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-8 px-4 max-w-6xl">
        <Card className="border-status-error/20">
          <CardHeader>
            <CardTitle className="text-status-error">Error Loading Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Activity History
        </h1>
        <p className="text-muted-foreground">
          Track your reading journey with detailed activity logs
        </p>
      </div>

      <div className="grid gap-6">
        <div className="grid gap-6 lg:grid-cols-4">
          <div className="lg:col-span-1">
            <ActivityFilters
              filters={filters}
              onFiltersChange={setFilters}
              books={booksList}
              eventCount={filteredEvents.length}
            />
          </div>

          <div className="lg:col-span-3">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Activity Log
                    <Badge variant="secondary" className="ml-2">
                      {filteredEvents.length} events
                    </Badge>
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                {filteredEvents.length === 0 ? (
                  <div className="text-center py-12">
                    <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <div className="text-lg font-medium text-foreground mb-2">
                      No activity found
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {events.length === 0
                        ? "No reading activity recorded yet. Start reading to see your history!"
                        : "Try adjusting your filters to see more results."}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredEvents.map((event) => (
                      <ActivityDetail
                        key={event.id}
                        event={event}
                        bookTitle={getBookTitle(event.bookId)}
                        book={booksList.find(book => book.id === event.bookId)}
                      />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}