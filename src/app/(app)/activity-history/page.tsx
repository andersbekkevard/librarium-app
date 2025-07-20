"use client";

import React, { useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useEventsContext } from "@/lib/providers/EventsProvider";
import { useBooksContext } from "@/lib/providers/BooksProvider";
import { ActivityFilters } from "@/components/app/activity/ActivityFilters";
import { ActivityDetail } from "@/components/app/activity/ActivityDetail";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Pagination } from "@/components/ui/pagination";
import { PageSizeSelector } from "@/components/ui/page-size-selector";
import { PaginationInfo } from "@/components/ui/pagination-info";
import { usePagination } from "@/hooks/usePagination";
import { Calendar, Activity } from "lucide-react";

interface Filters {
  eventType: string;
  dateRange: {
    start: Date | null;
    end: Date | null;
  };
  bookId: string;
}

function ActivityHistoryContent() {
  const searchParams = useSearchParams();
  const { events, loading, error } = useEventsContext();
  const { books } = useBooksContext();
  
  // Read filters from URL params
  const eventType = searchParams.get("eventType") || "all";
  const bookId = searchParams.get("bookId") || "all";
  const startDate = searchParams.get("startDate");
  const endDate = searchParams.get("endDate");
  
  const filters: Filters = useMemo(() => ({
    eventType,
    dateRange: {
      start: startDate ? new Date(startDate) : null,
      end: endDate ? new Date(endDate) : null,
    },
    bookId,
  }), [eventType, bookId, startDate, endDate]);

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

  // Pagination
  const pagination = usePagination({
    totalItems: filteredEvents.length,
    initialPageSize: 25,
    storageKey: "activity-history-page-size",
    onPageChange: () => {
      // Scroll to top when page changes
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
  });

  // Get paginated events
  const paginatedEvents = useMemo(() => {
    return filteredEvents.slice(pagination.startIndex, pagination.endIndex);
  }, [filteredEvents, pagination.startIndex, pagination.endIndex]);

  // Reset to page 1 when filters change
  React.useEffect(() => {
    pagination.goToFirstPage();
  }, [eventType, bookId, startDate, endDate]); // eslint-disable-line react-hooks/exhaustive-deps

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
                  {pagination.totalPages > 1 && (
                    <div className="flex items-center gap-4">
                      <PaginationInfo
                        start={pagination.itemRange.start}
                        end={pagination.itemRange.end}
                        total={pagination.itemRange.total}
                        itemName="event"
                        className="hidden sm:block"
                      />
                      <PageSizeSelector
                        pageSize={pagination.pageSize}
                        onPageSizeChange={pagination.setPageSize}
                        totalItems={filteredEvents.length}
                      />
                    </div>
                  )}
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
                  <>
                    <div className="space-y-4">
                      {paginatedEvents.map((event) => (
                        <ActivityDetail
                          key={event.id}
                          event={event}
                          bookTitle={getBookTitle(event.bookId)}
                          book={booksList.find(book => book.id === event.bookId)}
                        />
                      ))}
                    </div>

                    {/* Pagination Controls */}
                    {pagination.totalPages > 1 && (
                      <div className="mt-8 pt-6 border-t border-border">
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                          <PaginationInfo
                            start={pagination.itemRange.start}
                            end={pagination.itemRange.end}
                            total={pagination.itemRange.total}
                            itemName="event"
                            className="order-2 sm:order-1"
                          />
                          
                          <Pagination
                            currentPage={pagination.currentPage}
                            totalPages={pagination.totalPages}
                            visiblePages={pagination.visiblePages}
                            onPageChange={pagination.goToPage}
                            hasNextPage={pagination.hasNextPage}
                            hasPreviousPage={pagination.hasPreviousPage}
                            className="order-1 sm:order-2"
                          />
                          
                          <PageSizeSelector
                            pageSize={pagination.pageSize}
                            onPageSizeChange={pagination.setPageSize}
                            totalItems={filteredEvents.length}
                            className="order-3"
                          />
                        </div>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ActivityHistoryPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background">Loading...</div>}>
      <ActivityHistoryContent />
    </Suspense>
  );
}