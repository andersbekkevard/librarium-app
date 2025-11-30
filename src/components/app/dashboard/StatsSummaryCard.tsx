import {
  BookOpenIcon,
  LightningIcon,
  StarIcon,
  TrendUpIcon,
} from "@phosphor-icons/react";

interface Stats {
  totalBooks: number;
  finishedBooks: number;
  totalPagesRead: number;
  currentlyReading: number;
  readingStreak: number;
}

interface StatsSummaryCardProps {
  stats: Stats;
}

export const StatsSummaryCard: React.FC<StatsSummaryCardProps> = ({
  stats,
}) => {
  return (
    <div className="bg-card border border-border rounded-lg p-4 h-full w-fit flex flex-col justify-center">
      <div className="grid grid-cols-2 gap-2">
        {/* Total Books */}
        <div className="text-center p-2 bg-brand-primary/5 rounded-lg w-24 h-24 flex flex-col justify-center">
          <div className="h-8 w-8 bg-brand-primary/10 rounded-full flex items-center justify-center mx-auto mb-1">
            <BookOpenIcon
              className="h-5 w-5 text-brand-primary"
              weight="light"
            />
          </div>
          <p className="text-xl font-bold text-foreground mb-1">
            {stats.totalBooks}
          </p>
          <p className="text-sm font-medium text-muted-foreground leading-tight">
            Total
          </p>
        </div>

        {/* Read This Year */}
        <div className="text-center p-2 bg-status-success/5 rounded-lg w-24 h-24 flex flex-col justify-center">
          <div className="h-8 w-8 bg-status-success/10 rounded-full flex items-center justify-center mx-auto mb-1">
            <StarIcon className="h-5 w-5 text-status-success" weight="fill" />
          </div>
          <p className="text-xl font-bold text-foreground mb-1">
            {stats.finishedBooks}
          </p>
          <p className="text-sm font-medium text-muted-foreground leading-tight">
            Read
          </p>
        </div>

        {/* Pages This Month */}
        <div className="text-center p-2 bg-brand-accent/5 rounded-lg w-24 h-24 flex flex-col justify-center">
          <div className="h-8 w-8 bg-brand-accent/10 rounded-full flex items-center justify-center mx-auto mb-1">
            <TrendUpIcon className="h-5 w-5 text-brand-accent" weight="light" />
          </div>
          <p className="text-xl font-bold text-foreground mb-1">
            {stats.totalPagesRead}
          </p>
          <p className="text-sm font-medium text-muted-foreground leading-tight">
            Pages
          </p>
        </div>

        {/* Reading Streak */}
        <div className="text-center p-2 bg-gradient-to-br from-brand-primary/10 to-brand-accent/10 rounded-lg w-24 h-24 flex flex-col justify-center">
          <div className="h-8 w-8 bg-gradient-to-br from-brand-primary to-brand-accent rounded-full flex items-center justify-center mx-auto mb-1">
            <LightningIcon className="h-5 w-5 text-white" weight="fill" />
          </div>
          <p className="text-xl font-bold text-foreground mb-1">
            {stats.readingStreak}
          </p>
          <p className="text-sm font-medium text-muted-foreground leading-tight">
            Streak
          </p>
        </div>
      </div>
    </div>
  );
};

export default StatsSummaryCard;
