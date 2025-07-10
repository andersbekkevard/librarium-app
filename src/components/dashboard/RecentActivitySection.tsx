import { ActivityItem } from "@/lib/services/EventService";

interface RecentActivitySectionProps {
  activities?: ActivityItem[];
  loading?: boolean;
  error?: string | null;
}

const formatTimeAgo = (timestamp: Date): string => {
  const now = new Date();
  const diff = now.getTime() - timestamp.getTime();
  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const weeks = Math.floor(diff / (1000 * 60 * 60 * 24 * 7));
  
  if (minutes < 60) {
    return minutes <= 1 ? 'just now' : `${minutes} minutes ago`;
  } else if (hours < 24) {
    return hours === 1 ? '1 hour ago' : `${hours} hours ago`;
  } else if (days < 7) {
    return days === 1 ? '1 day ago' : `${days} days ago`;
  } else {
    return weeks === 1 ? '1 week ago' : `${weeks} weeks ago`;
  }
};

const getActivityText = (activity: ActivityItem): string => {
  switch (activity.type) {
    case 'finished':
      return 'Finished reading';
    case 'started':
      return 'Started reading';
    case 'rated':
      return 'Rated';
    case 'added':
      return 'Added';
    case 'progress':
      return 'Updated progress on';
    default:
      return '';
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
            <div className="text-sm text-muted-foreground">Loading recent activity...</div>
          </div>
        )}
        
        {error && (
          <div className="flex items-center justify-center py-8">
            <div className="text-sm text-red-500">
              Failed to load recent activity: {error}
            </div>
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
                <div className={`h-2 w-2 ${activity.colorClass} rounded-full mt-2`}></div>
                <div className="flex-1">
                  <p className="text-sm text-foreground">
                    {getActivityText(activity)}{" "}
                    <span className="font-medium">{activity.bookTitle}</span>
                    {activity.details && ` ${activity.details}`}
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