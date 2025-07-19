import { ErrorAlert } from "@/components/ui/error-display";
import { TIMING_CONFIG } from "@/lib/constants/constants";
import { StandardError } from "@/lib/errors/error-handling";
import { ActivityItem } from "@/lib/models/models";

interface RecentActivitySectionProps {
  activities?: ActivityItem[];
  loading?: boolean;
  error?: StandardError | null;
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
          Read {details} in <span className="font-semibold">{bookTitle}</span>
        </>
      );
    case "commented":
      return (
        <>
          Commented on <span className="font-semibold">{bookTitle}</span>
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
}) => {
  return (
    <div className="lg:col-span-1">
      <div className="bg-card border border-border rounded-lg p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">
          Recent Activity
        </h2>

        {loading && (
          <div className="flex items-center justify-center py-8">
            <div className="text-sm text-muted-foreground">
              Loading recent activity...
            </div>
          </div>
        )}

        {error && (
          <div className="py-4">
            <ErrorAlert error={error} />
          </div>
        )}

        {!loading && !error && activities.length === 0 && (
          <div className="flex items-center justify-center py-8">
            <div className="text-sm text-muted-foreground">
              No recent activity to display
            </div>
          </div>
        )}

        {!loading && !error && activities.length > 0 && (
          <div className="space-y-4">
            {activities.map((activity) => (
              <div key={activity.id} className="flex items-start space-x-3">
                <div
                  className={`h-2 w-2 ${activity.colorClass} rounded-full mt-2`}
                ></div>
                <div className="flex-1">
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
        )}
      </div>
    </div>
  );
};

export default RecentActivitySection;
