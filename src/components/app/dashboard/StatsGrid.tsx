import {
  BookOpenIcon,
  LightningIcon,
  StarIcon,
  TrendUpIcon,
} from "@phosphor-icons/react";
import ReadingStreakCard from "./ReadingStreakCard";
import StatCard from "./StatCard";

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

export const StatsGrid: React.FC<StatsGridProps> = ({ stats }) => {
  return (
    <>
      {/* Mobile Layout - Single compact card */}
      <div className="block lg:hidden mb-8">
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="grid grid-cols-2 gap-4">
            {/* Total Books */}
            <div className="text-center p-3 bg-brand-primary/5 rounded-lg">
              <div className="h-10 w-10 bg-brand-primary/10 rounded-full flex items-center justify-center mx-auto mb-2">
                <BookOpenIcon
                  className="h-5 w-5 text-brand-primary"
                  weight="light"
                />
              </div>
              <p className="text-2xl font-bold text-foreground mb-1">
                {stats.totalBooks}
              </p>
              <p className="text-xs font-medium text-muted-foreground">
                Total Books
              </p>
            </div>

            {/* Read This Year */}
            <div className="text-center p-3 bg-status-success/5 rounded-lg">
              <div className="h-10 w-10 bg-status-success/10 rounded-full flex items-center justify-center mx-auto mb-2">
                <StarIcon
                  className="h-5 w-5 text-status-success"
                  weight="fill"
                />
              </div>
              <p className="text-2xl font-bold text-foreground mb-1">
                {stats.finishedBooks}
              </p>
              <p className="text-xs font-medium text-muted-foreground">
                Read This Year
              </p>
            </div>

            {/* Pages This Month */}
            <div className="text-center p-3 bg-brand-accent/5 rounded-lg">
              <div className="h-10 w-10 bg-brand-accent/10 rounded-full flex items-center justify-center mx-auto mb-2">
                <TrendUpIcon
                  className="h-5 w-5 text-brand-accent"
                  weight="light"
                />
              </div>
              <p className="text-2xl font-bold text-foreground mb-1">
                {stats.totalPagesRead}
              </p>
              <p className="text-xs font-medium text-muted-foreground">
                Pages This Month
              </p>
            </div>

            {/* Reading Streak */}
            <div className="text-center p-3 bg-gradient-to-br from-brand-primary/10 to-brand-accent/10 rounded-lg">
              <div className="h-10 w-10 bg-gradient-to-br from-brand-primary to-brand-accent rounded-full flex items-center justify-center mx-auto mb-2">
                <LightningIcon className="h-5 w-5 text-white" weight="fill" />
              </div>
              <p className="text-2xl font-bold text-foreground mb-1">
                {stats.readingStreak}
              </p>
              <p className="text-xs font-medium text-muted-foreground mb-1">
                Reading Streak
              </p>
              <p className="text-xs text-muted-foreground">days</p>
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
            icon={BookOpenIcon}
            iconColor="text-brand-primary"
            iconBgColor="bg-brand-primary/10"
          />

          <StatCard
            title="Read This Year"
            value={stats.finishedBooks}
            icon={StarIcon}
            iconColor="text-status-success"
            iconBgColor="bg-status-success/10"
          />

          <StatCard
            title="Pages This Month"
            value={stats.totalPagesRead}
            icon={BookOpenIcon}
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
