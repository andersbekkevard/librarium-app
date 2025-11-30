"use client";

import { Button } from "@/components/ui/button";
import { ErrorAlert } from "@/components/ui/error-display";
import { TIMING_CONFIG } from "@/lib/constants/constants";
import { StandardError } from "@/lib/errors/error-handling";
import { ActivityItem, Book } from "@/lib/models/models";
import { ArrowRightIcon } from "@phosphor-icons/react";
import Link from "next/link";

interface RecentActivitySectionProps {
  activities?: ActivityItem[];
  loading?: boolean;
  error?: StandardError | null;
  books?: Book[];
}

const formatTimeAgo = (timestamp: Date): string => {
  const now = new Date();
  const diff = now.getTime() - timestamp.getTime();
  const minutes = Math.floor(diff / TIMING_CONFIG.TIME.MINUTE_MS);
  const hours = Math.floor(diff / TIMING_CONFIG.TIME.HOUR_MS);
  const days = Math.floor(diff / TIMING_CONFIG.TIME.DAY_MS);
  const weeks = Math.floor(diff / TIMING_CONFIG.TIME.WEEK_MS);

  if (minutes < 60) {
    return minutes <= 1 ? "just now" : `${minutes}m ago`;
  } else if (hours < 24) {
    return `${hours}h ago`;
  } else if (days < 7) {
    return `${days}d ago`;
  } else {
    return `${weeks}w ago`;
  }
};

const getActivityText = (activity: ActivityItem): React.ReactNode => {
  const bookTitle = activity.bookTitle;
  const details = activity.details;

  switch (activity.type) {
    case "finished":
      return (
        <>
          Finished <span className="font-medium">{bookTitle}</span>
        </>
      );
    case "started":
      return (
        <>
          Started <span className="font-medium">{bookTitle}</span>
        </>
      );
    case "rated":
      return (
        <>
          Rated <span className="font-medium">{bookTitle}</span>
          {details ? ` ${details}` : ""}
        </>
      );
    case "added":
      return (
        <>
          Added <span className="font-medium">{bookTitle}</span>
        </>
      );
    case "progress":
      return (
        <>
          {details &&
            (() => {
              const pagesMatch = details.match(/(-?\d+)\s*pages?/);
              const pages = pagesMatch ? parseInt(pagesMatch[1], 10) : 0;
              return pages > 0
                ? `Read ${pages} pages in `
                : `Unread ${Math.abs(pages)} pages in `;
            })()}
          <span className="font-medium">{bookTitle}</span>
        </>
      );
    case "commented":
      return (
        <>
          Commented on <span className="font-medium">{bookTitle}</span>
        </>
      );
    case "deleted":
      return (
        <>
          Removed <span className="font-medium">{bookTitle}</span>
        </>
      );
    default:
      return <span className="font-medium">{bookTitle}</span>;
  }
};

export const RecentActivitySection: React.FC<RecentActivitySectionProps> = ({
  activities = [],
  loading = false,
  error = null,
  books = [],
}) => {
  // Calculate how many currently reading books there are
  const currentlyReadingCount = books.filter(
    (book) => book.state === "in_progress"
  ).length;

  // Determine activity limit based on currently reading layout
  const isShortLayout = currentlyReadingCount <= 2;
  const maxActivities = isShortLayout ? 5 : 7;

  // Filter out internal activities and limit
  const filteredActivities = activities
    .filter(
      (activity) =>
        activity.type !== "manually_updated" && activity.type !== "deleted"
    )
    .slice(0, maxActivities);

  return (
    <div className="bg-card border border-border rounded-lg h-full flex flex-col">
      {/* Header */}
      <div className="p-5 pb-0">
        <h3 className="text-lg font-semibold text-foreground">
          Recent Activity
        </h3>
      </div>

      {/* Content */}
      <div className="flex-1 p-5 pt-4 overflow-hidden">
        {loading && (
          <div className="h-full flex items-center justify-center">
            <p className="text-sm text-muted-foreground">Loading...</p>
          </div>
        )}

        {error && (
          <div className="h-full flex items-center justify-center">
            <ErrorAlert error={error} />
          </div>
        )}

        {!loading && !error && filteredActivities.length === 0 && (
          <div className="h-full flex items-center justify-center">
            <p className="text-sm text-muted-foreground">No recent activity</p>
          </div>
        )}

        {!loading && !error && filteredActivities.length > 0 && (
          <div className="space-y-3">
            {filteredActivities.map((activity) => (
              <div key={activity.id} className="flex items-start gap-3 group">
                <div
                  className={`h-2 w-2 ${activity.colorClass} rounded-full mt-1.5 shrink-0`}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground leading-snug">
                    {getActivityText(activity)}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {formatTimeAgo(activity.timestamp)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      {!loading && !error && filteredActivities.length > 0 && (
        <div className="p-5 pt-0">
          <Link href="/activity-history">
            <Button
              variant="ghost"
              size="sm"
              className="w-full text-muted-foreground hover:text-foreground flex items-center justify-center gap-1.5 transition-colors"
            >
              View all activity
              <ArrowRightIcon className="h-3.5 w-3.5" weight="light" />
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
};

export default RecentActivitySection;
