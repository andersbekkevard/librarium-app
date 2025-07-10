import { BookOpen, Star } from "lucide-react";
import StatCard from "./StatCard";
import ReadingStreakCard from "./ReadingStreakCard";

interface Stats {
  totalBooks: number;
  finishedBooks: number;
  totalPagesRead: number;
  currentlyReading: number;
  readingStreak: number;
}

interface StatsGridProps {
  stats: Stats;
}

export const StatsGrid: React.FC<StatsGridProps> = ({
  stats,
}) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
      {/* Quick Stats Row */}
      <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          title="Total Books"
          value={stats.totalBooks}
          icon={BookOpen}
          iconColor="text-brand-primary"
          iconBgColor="bg-brand-primary/10"
        />
        
        <StatCard
          title="Read This Year"
          value={stats.finishedBooks}
          icon={Star}
          iconColor="text-status-success fill-current"
          iconBgColor="bg-status-success/10"
        />
        
        <StatCard
          title="Pages This Month"
          value={stats.totalPagesRead}
          icon={BookOpen}
          iconColor="text-brand-accent"
          iconBgColor="bg-brand-accent/10"
        />
      </div>

      {/* Reading Streak */}
      <ReadingStreakCard 
        streakDays={stats.readingStreak}
        encouragementText="Keep it up!"
      />
    </div>
  );
};

export default StatsGrid;