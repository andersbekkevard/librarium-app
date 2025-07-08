import { Book } from "@/lib/models";
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
  onEdit: (book: Book) => void;
  onUpdateProgress: (book: Book) => void;
  onBookClick: (bookId: string) => void;
  streakDays?: number;
}

export const DashboardContent: React.FC<DashboardContentProps> = ({
  books,
  stats,
  onEdit,
  onUpdateProgress,
  onBookClick,
  streakDays = 12,
}) => {
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
        
        <RecentActivitySection />
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