"use client";

import { createSystemError } from "@/lib/errors/error-handling";
import { Book } from "@/lib/models/models";
import { useEventsContext } from "@/lib/providers/EventsProvider";
import { useUserContext } from "@/lib/providers/UserProvider";
import { UserStats } from "@/lib/services/types";
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
  onBookClick,
}) => {
  const router = useRouter();
  const { userProfile, userStats } = useUserContext();
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

  // Convert userStats to the format expected by header
  const headerStats: UserStats | null = userStats
    ? {
        booksInLibrary: userStats.booksInLibrary,
        currentlyReading: userStats.currentlyReading,
        totalBooksRead: userStats.totalBooksRead,
        totalPagesRead: userStats.totalPagesRead,
        averageRating: userStats.averageRating,
        readingStreak: userStats.readingStreak,
        booksReadThisMonth: userStats.booksReadThisMonth,
        booksReadThisYear: userStats.booksReadThisYear,
        favoriteGenres: userStats.favoriteGenres,
      }
    : null;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header with greeting and stats ribbon */}
      <DashboardHeader
        userName={userProfile?.displayName}
        stats={headerStats}
      />

      {/* AI Insight Card - Full width, elegant placement */}
      {userProfile && (
        <div className="mb-8">
          <PersonalizedMessageSection
            userProfile={userProfile}
            books={books}
            stats={stats}
            recentActivity={activities || []}
          />
        </div>
      )}

      {/* Main content: Currently Reading + Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Currently Reading - Takes 2/3 on desktop */}
        <div className="lg:col-span-2">
          <CurrentlyReadingSection
            books={books}
            onBookClick={onBookClick}
            onViewAll={handleViewAllCurrently}
          />
        </div>

        {/* Recent Activity - Takes 1/3 on desktop */}
        <div className="lg:col-span-1">
          <RecentActivitySection
            activities={activities}
            loading={activitiesLoading}
            error={activitiesError ? createSystemError(activitiesError) : null}
            books={books}
          />
        </div>
      </div>

      {/* Recently Read - Full width */}
      <RecentlyReadSection
        books={books}
        onBookClick={onBookClick}
        onViewAll={handleViewAllRecent}
      />
    </div>
  );
};

export default DashboardContent;
