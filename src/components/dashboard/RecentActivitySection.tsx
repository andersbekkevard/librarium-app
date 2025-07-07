interface ActivityItem {
  id: string;
  type: 'finished' | 'started' | 'rated' | 'added' | 'progress';
  bookTitle: string;
  details?: string;
  timeAgo: string;
  colorClass: string;
}

interface RecentActivitySectionProps {
  activities?: ActivityItem[];
}

const defaultActivities: ActivityItem[] = [
  {
    id: '1',
    type: 'finished',
    bookTitle: 'The Great Gatsby',
    timeAgo: '2 hours ago',
    colorClass: 'bg-status-success',
  },
  {
    id: '2',
    type: 'started',
    bookTitle: 'The Catcher in the Rye',
    timeAgo: '1 day ago',
    colorClass: 'bg-brand-primary',
  },
  {
    id: '3',
    type: 'rated',
    bookTitle: 'Pride and Prejudice',
    details: '5 stars',
    timeAgo: '3 days ago',
    colorClass: 'bg-status-warning',
  },
  {
    id: '4',
    type: 'added',
    bookTitle: '1984',
    timeAgo: '5 days ago',
    colorClass: 'bg-brand-accent',
  },
  {
    id: '5',
    type: 'progress',
    bookTitle: 'To Kill a Mockingbird',
    timeAgo: '1 week ago',
    colorClass: 'bg-status-info',
  },
];

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
  activities = defaultActivities,
}) => {
  return (
    <div className="lg:col-span-1">
      <div className="bg-card border border-border rounded-lg p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">
          Recent Activity
        </h2>
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
                  {activity.timeAgo}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RecentActivitySection;