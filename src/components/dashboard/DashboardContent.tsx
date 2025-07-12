import {
  ErrorCategory,
  ErrorHandlerUtils,
  StandardError,
} from "@/lib/error-handling";
import { Book } from "@/lib/models";
import { ActivityItem, eventService } from "@/lib/services/EventService";
import { useEffect, useState } from "react";
import CurrentlyReadingSection from "./CurrentlyReadingSection";
import DashboardHeader from "./DashboardHeader";
import RecentActivitySection from "./RecentActivitySection";
import RecentlyReadSection from "./RecentlyReadSection";
import StatsGrid from "./StatsGrid";

interface Stats {
  totalBooks: number;
  finishedBooks: number;
  totalPagesRead: number;
  currentlyReading: number;
  readingStreak: number;
}

interface DashboardContentProps {
  books: Book[];
  stats: Stats;
  userId: string;
  onEdit: (book: Book) => void;
  onUpdateProgress: (book: Book) => void;
  onBookClick: (bookId: string) => void;
}

export const DashboardContent: React.FC<DashboardContentProps> = ({
  books,
  stats,
  userId,
  onEdit,
  onUpdateProgress,
  onBookClick,
}) => {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [activitiesLoading, setActivitiesLoading] = useState(true);
  const [activitiesError, setActivitiesError] = useState<StandardError | null>(
    null
  );

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
          const standardError = ErrorHandlerUtils.handleGenericError(
            result.error || "Failed to load recent activity",
            {
              component: "DashboardContent",
              action: "fetchRecentActivity",
              userId,
            },
            ErrorCategory.SYSTEM
          );
          setActivitiesError(standardError);
        }
      } catch (error) {
        const standardError = ErrorHandlerUtils.handleGenericError(
          error as Error,
          {
            component: "DashboardContent",
            action: "fetchRecentActivity",
            userId,
          },
          ErrorCategory.SYSTEM
        );
        setActivitiesError(standardError);
        console.error("Error fetching recent activity:", error);
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

      <StatsGrid stats={stats} />

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
