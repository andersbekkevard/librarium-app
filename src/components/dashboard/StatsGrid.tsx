import { BookOpen, Star, Zap, TrendingUp } from "lucide-react";
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
    <>
      {/* Mobile Layout - Single compact card */}
      <div className="block lg:hidden mb-8">
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="grid grid-cols-2 gap-4">
            {/* Total Books */}
            <div className="flex items-center space-x-3">
              <div className="h-8 w-8 bg-brand-primary/10 rounded-full flex items-center justify-center">
                <BookOpen className="h-4 w-4 text-brand-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Books</p>
                <p className="text-lg font-bold text-foreground">{stats.totalBooks}</p>
              </div>
            </div>

            {/* Read This Year */}
            <div className="flex items-center space-x-3">
              <div className="h-8 w-8 bg-status-success/10 rounded-full flex items-center justify-center">
                <Star className="h-4 w-4 text-status-success fill-current" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Read This Year</p>
                <p className="text-lg font-bold text-foreground">{stats.finishedBooks}</p>
              </div>
            </div>

            {/* Pages This Month */}
            <div className="flex items-center space-x-3">
              <div className="h-8 w-8 bg-brand-accent/10 rounded-full flex items-center justify-center">
                <TrendingUp className="h-4 w-4 text-brand-accent" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pages This Month</p>
                <p className="text-lg font-bold text-foreground">{stats.totalPagesRead}</p>
              </div>
            </div>

            {/* Reading Streak */}
            <div className="flex items-center space-x-3">
              <div className="h-8 w-8 bg-gradient-to-br from-brand-primary to-brand-accent rounded-full flex items-center justify-center">
                <Zap className="h-4 w-4 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Reading Streak</p>
                <p className="text-lg font-bold text-foreground">{stats.readingStreak} days</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop Layout - Original layout */}
      <div className="hidden lg:grid lg:grid-cols-4 gap-6 mb-8">
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
    </>
  );
};

export default StatsGrid;