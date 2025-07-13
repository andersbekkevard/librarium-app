import { Book } from "@/lib/models/models";
import { useEventsContext } from "@/lib/providers/EventsProvider";
import { useRouter } from "next/navigation";
import { createSystemError } from "@/lib/errors/error-handling";
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
  const router = useRouter();
  const { activities, activitiesLoading, error: activitiesError } = useEventsContext();

  const handleViewAllCurrently = () => {
    router.push("/library?filter=in_progress");
  };

  const handleViewAllRecent = () => {
    router.push("/library?filter=finished");
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
          error={activitiesError ? createSystemError(activitiesError) : null}
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
