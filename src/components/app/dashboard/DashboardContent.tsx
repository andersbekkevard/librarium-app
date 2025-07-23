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
import StatsSummaryCard from "./StatsSummaryCard";

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

      {/* Top Row: AI Companion + Stats */}
      <div className="flex gap-6 mb-6">
        {/* AI Message Section */}
        {userProfile && (
          <div className="flex-1">
            <PersonalizedMessageSection
              userProfile={userProfile}
              books={books}
              stats={stats}
              recentActivity={activities || []}
            />
          </div>
        )}

        {/* Stats Summary Card - Hidden on mobile */}
        <div className="flex-shrink-0 hidden md:block">
          <StatsSummaryCard stats={stats} />
        </div>
      </div>

      {/* Middle Row: Currently Reading + Recent Activity */}
      <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr] gap-6 mb-8">
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

      {/* Bottom Row: Recently Read (Full Width) */}
      <RecentlyReadSection
        books={books}
        onBookClick={onBookClick}
        onViewAll={handleViewAllRecent}
      />
    </div>
  );
};

export default DashboardContent;
