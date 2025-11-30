"use client";

import { ActivityDetail } from "@/components/app/activity/ActivityDetail";
import { ActivityFilters } from "@/components/app/activity/ActivityFilters";
import { PageSizeSelector } from "@/components/ui/page-size-selector";
import { Pagination } from "@/components/ui/pagination";
import { PaginationInfo } from "@/components/ui/pagination-info";
import { usePagination } from "@/lib/hooks/usePagination";
import { useBooksContext } from "@/lib/providers/BooksProvider";
import { useEventsContext } from "@/lib/providers/EventsProvider";
import {
  CalendarBlankIcon,
  LightningIcon,
  SparkleIcon,
} from "@phosphor-icons/react";
import { useSearchParams } from "next/navigation";
import React, { Suspense, useMemo } from "react";

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

  const filters: Filters = useMemo(
    () => ({
      eventType,
      dateRange: {
        start: startDate ? new Date(startDate) : null,
        end: endDate ? new Date(endDate) : null,
      },
      bookId,
    }),
    [eventType, bookId, startDate, endDate]
  );

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
      window.scrollTo({ top: 0, behavior: "smooth" });
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
    return (
      booksList.find((book) => book.id === bookId)?.title || "Unknown Book"
    );
  };

  // Loading state
  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4 max-w-6xl">
        {/* Header skeleton */}
        <div className="mb-8">
          <div className="h-10 w-64 bg-muted/60 rounded-lg mb-3 animate-pulse" />
          <div className="h-5 w-96 bg-muted/40 rounded-lg animate-pulse" />
        </div>

        <div className="grid gap-6 lg:grid-cols-4">
          {/* Filters skeleton */}
          <div className="lg:col-span-1">
            <div className="rounded-xl border border-border/40 bg-card p-5 space-y-5">
              <div className="h-6 w-24 bg-muted/60 rounded animate-pulse" />
              {[...Array(4)].map((_, i) => (
                <div key={i} className="space-y-2">
                  <div className="h-4 w-20 bg-muted/40 rounded animate-pulse" />
                  <div className="h-10 w-full bg-muted/30 rounded-lg animate-pulse" />
                </div>
              ))}
            </div>
          </div>

          {/* Activity list skeleton */}
          <div className="lg:col-span-3">
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="rounded-lg border border-border/40 bg-card p-4"
                >
                  <div className="flex items-start gap-3">
                    <div className="h-9 w-9 bg-muted/60 rounded-lg animate-pulse" />
                    <div className="flex-1 space-y-2">
                      <div className="h-5 w-48 bg-muted/60 rounded animate-pulse" />
                      <div className="h-4 w-32 bg-muted/40 rounded animate-pulse" />
                    </div>
                    <div className="h-4 w-24 bg-muted/40 rounded animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="container mx-auto py-8 px-4 max-w-6xl">
        <div className="relative overflow-hidden rounded-xl border border-status-error/20 bg-gradient-to-br from-status-error/[0.03] via-card to-card p-8">
          <div className="absolute -top-16 -right-16 w-32 h-32 bg-status-error/[0.06] rounded-full blur-2xl pointer-events-none" />
          <div className="relative flex items-start gap-4">
            <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-status-error/10">
              <SparkleIcon
                className="h-5 w-5 text-status-error"
                weight="fill"
              />
            </div>
            <div>
              <h3 className="font-heading font-semibold text-status-error text-lg">
                Error Loading Activity
              </h3>
              <p className="text-muted-foreground mt-1">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-3xl font-heading font-medium text-foreground mb-2">
          Activity History
        </h1>
        <p className="text-muted-foreground">
          Track your reading journey with detailed activity logs
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-4">
        {/* Filters sidebar */}
        <div className="lg:col-span-1">
          <div className="lg:sticky lg:top-6">
            <ActivityFilters
              filters={filters}
              books={booksList}
              eventCount={filteredEvents.length}
            />
          </div>
        </div>

        {/* Activity log */}
        <div className="lg:col-span-3">
          <div className="relative overflow-hidden rounded-xl border border-border/60 bg-card">
            {/* Decorative corner glow */}
            <div className="absolute -top-20 -right-20 w-40 h-40 bg-brand-accent/[0.04] rounded-full blur-3xl pointer-events-none" />

            {/* Header */}
            <div className="relative p-5 border-b border-border/40">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center h-9 w-9 rounded-lg bg-gradient-to-br from-brand-primary/15 to-brand-accent/10 border border-brand-primary/20">
                    <LightningIcon
                      className="h-4 w-4 text-brand-primary"
                      weight="duotone"
                    />
                  </div>
                  <div>
                    <h2 className="font-heading font-semibold text-foreground text-lg">
                      Activity Log
                    </h2>
                    <p className="text-xs text-muted-foreground">
                      {filteredEvents.length} event
                      {filteredEvents.length !== 1 ? "s" : ""} recorded
                    </p>
                  </div>
                </div>

                {pagination.totalPages > 1 && (
                  <div className="flex items-center gap-3">
                    <PaginationInfo
                      start={pagination.itemRange.start}
                      end={pagination.itemRange.end}
                      total={pagination.itemRange.total}
                      itemName="event"
                      className="hidden sm:block text-sm text-muted-foreground"
                    />
                    <PageSizeSelector
                      pageSize={pagination.pageSize}
                      onPageSizeChange={pagination.setPageSize}
                      totalItems={filteredEvents.length}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Content */}
            <div className="relative">
              {filteredEvents.length === 0 ? (
                <div className="text-center py-16 px-6">
                  <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-muted/50 mb-4">
                    <CalendarBlankIcon
                      className="h-7 w-7 text-muted-foreground"
                      weight="duotone"
                    />
                  </div>
                  <h3 className="font-heading font-semibold text-foreground text-lg mb-2">
                    No activity found
                  </h3>
                  <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                    {events.length === 0
                      ? "No reading activity recorded yet. Start reading to see your history!"
                      : "Try adjusting your filters to see more results."}
                  </p>
                </div>
              ) : (
                <>
                  {/* Timeline */}
                  <div className="p-5 space-y-2">
                    {paginatedEvents.map((event) => (
                      <ActivityDetail
                        key={event.id}
                        event={event}
                        bookTitle={getBookTitle(event.bookId)}
                        book={booksList.find(
                          (book) => book.id === event.bookId
                        )}
                      />
                    ))}
                  </div>

                  {/* Pagination footer */}
                  {pagination.totalPages > 1 && (
                    <div className="px-5 py-4 border-t border-border/40 bg-muted/10">
                      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                        <PaginationInfo
                          start={pagination.itemRange.start}
                          end={pagination.itemRange.end}
                          total={pagination.itemRange.total}
                          itemName="event"
                          className="order-2 sm:order-1 text-sm text-muted-foreground"
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
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ActivityHistoryPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <div className="inline-flex items-center justify-center h-12 w-12 rounded-xl bg-brand-primary/10 mb-3 animate-pulse">
              <LightningIcon
                className="h-6 w-6 text-brand-primary"
                weight="duotone"
              />
            </div>
            <p className="text-sm text-muted-foreground">Loading activity...</p>
          </div>
        </div>
      }
    >
      <ActivityHistoryContent />
    </Suspense>
  );
}
