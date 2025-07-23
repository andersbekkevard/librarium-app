import { Button } from "@/components/ui/button";
import { ErrorAlert } from "@/components/ui/error-display";
import { TIMING_CONFIG } from "@/lib/constants/constants";
import { BRAND_COLORS } from "@/lib/design/colors";
import { StandardError } from "@/lib/errors/error-handling";
import { ActivityItem, Book } from "@/lib/models/models";
import { ChevronRight } from "lucide-react";
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
    return minutes <= 1 ? "just now" : `${minutes} minutes ago`;
  } else if (hours < 24) {
    return hours === 1 ? "1 hour ago" : `${hours} hours ago`;
  } else if (days < 7) {
    return days === 1 ? "1 day ago" : `${days} days ago`;
  } else {
    return weeks === 1 ? "1 week ago" : `${weeks} weeks ago`;
  }
};

const getActivityText = (activity: ActivityItem): React.ReactNode => {
  const bookTitle = activity.bookTitle;
  const details = activity.details;

  switch (activity.type) {
    case "finished":
      return (
        <>
          Finished reading <span className="font-semibold">{bookTitle}</span>
        </>
      );
    case "started":
      return (
        <>
          Started reading <span className="font-semibold">{bookTitle}</span>
        </>
      );
    case "rated":
      return (
        <>
          Rated <span className="font-semibold">{bookTitle}</span>
          {details ? ` ${details}` : ""}
        </>
      );
    case "added":
      return (
        <>
          Added <span className="font-semibold">{bookTitle}</span>
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
          <span className="font-semibold">{bookTitle}</span>
        </>
      );
    case "commented":
      return (
        <>
          Commented on <span className="font-semibold">{bookTitle}</span>
        </>
      );
    case "deleted":
      return (
        <>
          Deleted <span className="font-semibold">{bookTitle}</span> from
          library
        </>
      );
    default:
      return <span className="font-semibold">{bookTitle}</span>;
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

  // Determine activity limit based on currently reading layout:
  // - 1 row (≤2 books): show 3 activities
  // - 2 rows (>2 books): show 5 activities
  const maxActivities = currentlyReadingCount <= 2 ? 3 : 5;

  // Filter out internal activities and limit based on currently reading layout
  const filteredActivities = activities
    .filter(
      (activity) =>
        activity.type !== "manually_updated" && activity.type !== "deleted"
    )
    .slice(0, maxActivities);
  return (
    <div className="bg-card border border-border rounded-lg p-6 h-full flex flex-col">
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-foreground">
            Recent Activity
          </h2>
        </div>

        {loading && (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-sm text-muted-foreground">
              Loading recent activity...
            </div>
          </div>
        )}

        {error && (
          <div className="flex-1 flex items-center justify-center">
            <ErrorAlert error={error} />
          </div>
        )}

        {!loading && !error && filteredActivities.length === 0 && (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-sm text-muted-foreground">
              No recent activity to display
            </div>
          </div>
        )}

        {!loading && !error && (
          <>
            <div className="flex-1 space-y-3 overflow-hidden min-h-0">
              {filteredActivities.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-3">
                  <div
                    className={`h-2 w-2 ${activity.colorClass} rounded-full mt-2 shrink-0`}
                  ></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground">
                      {getActivityText(activity)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatTimeAgo(activity.timestamp)}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-4 border-t border-border flex-shrink-0">
              <Link href="/activity-history">
                <Button
                  variant="ghost"
                  size="sm"
                  className={`w-full ${BRAND_COLORS.primary.text} hover:${BRAND_COLORS.primary.text} flex items-center justify-center gap-1`}
                >
                  View all activity
                  <ChevronRight className="h-3 w-3" />
                </Button>
              </Link>
            </div>
          </>
        )}
    </div>
  );
};

export default RecentActivitySection;
