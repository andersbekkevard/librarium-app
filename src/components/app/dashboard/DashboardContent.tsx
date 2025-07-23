import { createSystemError } from "@/lib/errors/error-handling";
import { Book } from "@/lib/models/models";
import { useEventsContext } from "@/lib/providers/EventsProvider";
import { useUserContext } from "@/lib/providers/UserProvider";
import { useRouter } from "next/navigation";
import CurrentlyReadingSection from "./CurrentlyReadingSection";
import DashboardHeader from "./DashboardHeader";
import PersonalizedMessageSection from "./PersonalizedMessageSection";
import RecentActivitySection from "./RecentActivitySection";
import RecentlyReadSection from "./RecentlyReadSection";

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
  const router = useRouter();
  const { userProfile } = useUserContext();
  const {
    activities,
    activitiesLoading,
    error: activitiesError,
  } = useEventsContext();

  const handleViewAllCurrently = () => {
    router.push("/library?filter=in_progress");
  };

  const handleViewAllRecent = () => {
    router.push("/library?filter=finished");
  };

  return (
    <div className="p-6">
      <DashboardHeader />

      {userProfile && (
        <PersonalizedMessageSection
          userProfile={userProfile}
          books={books}
          stats={stats}
          recentActivity={activities || []}
        />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <CurrentlyReadingSection
          books={books}
          onBookClick={onBookClick}
          onViewAll={handleViewAllCurrently}
        />

        <RecentActivitySection
          activities={activities}
          loading={activitiesLoading}
          error={activitiesError ? createSystemError(activitiesError) : null}
          books={books}
        />
      </div>

      <RecentlyReadSection
        books={books}
        onBookClick={onBookClick}
        onViewAll={handleViewAllRecent}
      />
    </div>
  );
};

export default DashboardContent;
