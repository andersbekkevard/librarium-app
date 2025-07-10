import { useState, useEffect } from "react";
import { Book } from "@/lib/models";
import { ActivityItem, eventService } from "@/lib/services/EventService";
import DashboardHeader from "./DashboardHeader";
import StatsGrid from "./StatsGrid";
import CurrentlyReadingSection from "./CurrentlyReadingSection";
import RecentActivitySection from "./RecentActivitySection";
import RecentlyReadSection from "./RecentlyReadSection";

interface Stats {
  totalBooks: number;
  finishedBooks: number;
  totalPagesRead: number;
  currentlyReading: number;
}

interface DashboardContentProps {
  books: Book[];
  stats: Stats;
  userId: string;
  onEdit: (book: Book) => void;
  onUpdateProgress: (book: Book) => void;
  onBookClick: (bookId: string) => void;
  streakDays?: number;
}

export const DashboardContent: React.FC<DashboardContentProps> = ({
  books,
  stats,
  userId,
  onEdit,
  onUpdateProgress,
  onBookClick,
  streakDays = 12,
}) => {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [activitiesLoading, setActivitiesLoading] = useState(true);
  const [activitiesError, setActivitiesError] = useState<string | null>(null);

  // Fetch recent activities
  useEffect(() => {
    const fetchRecentActivity = async () => {
      if (!userId) return;
      
      setActivitiesLoading(true);
      setActivitiesError(null);
      
      try {
        const result = await eventService.getRecentActivityItems(userId, 5);
        
        if (result.success && result.data) {
          setActivities(result.data);
        } else {
          setActivitiesError(result.error || 'Failed to load recent activity');
        }
      } catch (error) {
        setActivitiesError('Failed to load recent activity');
        console.error('Error fetching recent activity:', error);
      } finally {
        setActivitiesLoading(false);
      }
    };

    fetchRecentActivity();
  }, [userId]);

  const handleViewAllCurrently = () => {
    // TODO: Navigate to library with "currently reading" filter
  };

  const handleViewAllRecent = () => {
    // TODO: Navigate to library with "finished" filter
  };

  return (
    <div className="p-6">
      <DashboardHeader />
      
      <StatsGrid stats={stats} streakDays={streakDays} />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <CurrentlyReadingSection
          books={books}
          onEdit={onEdit}
          onUpdateProgress={onUpdateProgress}
          onBookClick={onBookClick}
          onViewAll={handleViewAllCurrently}
        />
        
        <RecentActivitySection
          activities={activities}
          loading={activitiesLoading}
          error={activitiesError}
        />
      </div>
      
      <RecentlyReadSection
        books={books}
        onEdit={onEdit}
        onUpdateProgress={onUpdateProgress}
        onBookClick={onBookClick}
        onViewAll={handleViewAllRecent}
      />
    </div>
  );
};

export default DashboardContent;