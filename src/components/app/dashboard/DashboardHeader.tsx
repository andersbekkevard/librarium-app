"use client";

import { UserStats } from "@/lib/services/types";
import {
  BookOpenIcon,
  BooksIcon,
  FlameIcon,
  TrendUpIcon,
} from "@phosphor-icons/react";

interface DashboardHeaderProps {
  userName?: string;
  stats?: UserStats | null;
}

const StatItem: React.FC<{
  icon: React.ReactNode;
  value: number | string;
  label: string;
}> = ({ icon, value, label }) => (
  <div className="flex items-center gap-2.5">
    <div className="p-1.5 rounded-lg transition-colors bg-brand-primary/7 text-brand-primary">
      {icon}
    </div>
    <div className="flex flex-col">
      <span className="text-base font-semibold text-foreground leading-none tracking-tight">
        {value}
      </span>
      <span className="text-[11px] text-muted-foreground/80 mt-0.5">
        {label}
      </span>
    </div>
  </div>
);

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  userName,
  stats,
}) => {
  const getGreeting = (): string => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  const getFormattedDate = (): string => {
    return new Date().toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
    });
  };

  const displayName = userName?.split(" ")[0] || "Reader";

  return (
    <div className="mb-8">
      {/* Greeting and Date */}
      <div className="mb-6">
        <p className="text-[13px] text-muted-foreground/80 mb-1.5 font-medium">
          {getFormattedDate()}
        </p>
        <h1 className="text-3xl text-foreground tracking-tight">
          {getGreeting()}, {displayName}
        </h1>
      </div>

      {/* Stats Ribbon */}
      {stats && (
        <div className="relative overflow-hidden flex flex-wrap gap-5 md:gap-7 py-4 px-5 bg-card border border-border/60 rounded-xl">
          {/* Subtle accent line */}
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />

          <StatItem
            icon={<BooksIcon className="h-4 w-4" weight="light" />}
            value={stats.booksInLibrary}
            label="In Library"
          />

          <div className="hidden sm:block h-8 w-px bg-border/50 self-center" />

          <StatItem
            icon={<BookOpenIcon className="h-4 w-4" weight="light" />}
            value={stats.currentlyReading}
            label="Reading"
          />

          <div className="hidden sm:block h-8 w-px bg-border/50 self-center" />

          <StatItem
            icon={<TrendUpIcon className="h-4 w-4" weight="light" />}
            value={stats.booksReadThisYear}
            label="This Year"
          />

          <div className="hidden sm:block h-8 w-px bg-border/50 self-center" />

          <StatItem
            icon={
              <FlameIcon
                className="h-4 w-4"
                weight={stats.readingStreak > 0 ? "fill" : "light"}
              />
            }
            value={stats.readingStreak}
            label="Day Streak"
          />

          <div className="hidden lg:flex items-center gap-2.5 ml-auto">
            <div className="h-8 w-px bg-border/50" />
            <div className="flex flex-col">
              <span className="text-base font-semibold text-foreground leading-none tracking-tight">
                {stats.totalPagesRead.toLocaleString()}
              </span>
              <span className="text-[11px] text-muted-foreground/80 mt-0.5">
                Pages Read
              </span>
            </div>
          </div>

          {stats.averageRating > 0 && (
            <div className="hidden xl:flex items-center gap-2.5">
              <div className="h-8 w-px bg-border/50" />
              <div className="flex flex-col">
                <span className="text-base font-semibold text-foreground leading-none tracking-tight">
                  {stats.averageRating.toFixed(1)}
                </span>
                <span className="text-[11px] text-muted-foreground/80 mt-0.5">
                  Avg Rating
                </span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DashboardHeader;
