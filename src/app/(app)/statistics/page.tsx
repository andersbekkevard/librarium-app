"use client";

import { ChartContainer, ChartTooltip } from "@/components/ui/chart";
import { useBooksContext } from "@/lib/providers/BooksProvider";
import { useEventsContext } from "@/lib/providers/EventsProvider";
import { useUserContext } from "@/lib/providers/UserProvider";
import { createGenreColorMapping } from "@/lib/utils/genre-colors";
import { eachMonthOfInterval, format, startOfMonth, subMonths } from "date-fns";
import { BookOpen, Flame, Library, Sparkles, TrendingUp } from "lucide-react";
import { useMemo } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";

export default function StatisticsPage() {
  const { userStats, loading: userLoading } = useUserContext();
  const { books, loading: booksLoading } = useBooksContext();
  const { events, loading: eventsLoading } = useEventsContext();

  // Calculate historical pages read data by genre for stacked area chart
  const historicalDataByGenre = useMemo(() => {
    if (!events.length || !books.length) return [];

    const progressEvents = events.filter(
      (event) => event.type === "progress_update"
    );
    const last12Months = eachMonthOfInterval({
      start: subMonths(new Date(), 11),
      end: new Date(),
    });

    // Helper function to resolve genre from bookId
    const resolveGenre = (bookId: string): string => {
      const book = books.find((b) => b.id === bookId);
      return book?.genre || "Unknown";
    };

    // First, collect all unique genres from all events
    const allGenres = new Set<string>();
    progressEvents.forEach((event) => {
      const genre = resolveGenre(event.bookId);
      allGenres.add(genre);
    });

    const monthlyData = last12Months.map((month) => {
      const monthStart = startOfMonth(month);
      const monthEnd = new Date(month.getFullYear(), month.getMonth() + 1, 0);

      const monthEvents = progressEvents.filter((event) => {
        const eventDate = event.timestamp.toDate();
        return eventDate >= monthStart && eventDate <= monthEnd;
      });

      // Group events by genre and sum pages read
      const genrePages = monthEvents.reduce((acc, event) => {
        const genre = resolveGenre(event.bookId);
        const pagesRead = Math.max(
          0,
          (event.data.newPage || 0) - (event.data.previousPage || 0)
        );
        acc[genre] = (acc[genre] || 0) + pagesRead;
        return acc;
      }, {} as Record<string, number>);

      // Calculate total pages for the month
      const totalPages = Object.values(genrePages).reduce(
        (sum, pages) => sum + pages,
        0
      );

      // Ensure all genres have a value (0 if no data for that month)
      const monthData: Record<string, number | string> = {
        month: format(month, "MMM"),
        fullMonth: format(month, "MMM yyyy"),
        total: totalPages,
      };

      allGenres.forEach((genre) => {
        monthData[genre] = genrePages[genre] || 0;
      });

      return monthData;
    });

    return monthlyData;
  }, [events, books]);

  // Calculate genre distribution for pie chart
  const genreData = useMemo(() => {
    if (!books.length) return [];

    const genreCounts = books.reduce((acc, book) => {
      const genre = book.genre || "Unknown";
      acc[genre] = (acc[genre] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Get all unique genres and create color mapping
    const allGenres = Object.keys(genreCounts);
    const genreColorMap = createGenreColorMapping(allGenres);

    return Object.entries(genreCounts)
      .map(([name, value]) => ({
        name,
        value,
        percentage: Math.round((value / books.length) * 100),
        fill: genreColorMap[name],
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8); // Show top 8 genres for pie chart
  }, [books]);

  // Calculate reading velocity (pages per day)
  const readingVelocity = useMemo(() => {
    if (!events.length) return 0;

    const progressEvents = events.filter(
      (event) => event.type === "progress_update"
    );
    if (progressEvents.length < 2) return 0;

    const totalPages = progressEvents.reduce((sum, event) => {
      const pagesRead =
        (event.data.newPage || 0) - (event.data.previousPage || 0);
      return sum + Math.max(0, pagesRead);
    }, 0);

    const firstEvent = progressEvents[progressEvents.length - 1];
    const lastEvent = progressEvents[0];
    const daysDiff = Math.max(
      1,
      (lastEvent.timestamp.toDate().getTime() -
        firstEvent.timestamp.toDate().getTime()) /
        (1000 * 60 * 60 * 24)
    );

    return Math.round(totalPages / daysDiff);
  }, [events]);

  // Chart configurations
  const chartConfig = {
    pages: {
      label: "Pages Read",
      color: "hsl(var(--brand-primary))",
    },
  };

  const loading = userLoading || booksLoading || eventsLoading;

  // Calculate current month pages
  const currentMonthPages = useMemo(() => {
    if (!historicalDataByGenre.length) return 0;
    const lastMonth = historicalDataByGenre[historicalDataByGenre.length - 1];
    return typeof lastMonth.total === "number" ? lastMonth.total : 0;
  }, [historicalDataByGenre]);

  // Calculate books finished this year
  const booksFinishedThisYear = userStats?.booksReadThisYear || 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-6xl mx-auto px-6 py-6">
          {/* Header skeleton */}
          <div className="animate-pulse mb-6">
            <div className="h-8 w-56 bg-muted rounded mb-2" />
            <div className="h-4 w-80 bg-muted rounded" />
          </div>

          {/* Stats skeleton */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-3 w-20 bg-muted rounded mb-2" />
                <div className="h-8 w-14 bg-muted rounded mb-1" />
                <div className="h-3 w-16 bg-muted rounded" />
              </div>
            ))}
          </div>

          {/* Chart skeleton */}
          <div className="h-72 bg-muted rounded-xl animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-6 py-6">
        {/* Header - matches DashboardHeader pattern */}
        <header className="mb-6">
          <h1 className="text-3xl text-foreground mb-2">Reading Analytics</h1>
          <p className="text-muted-foreground">
            Your reading habits, patterns, and achievements over time.
          </p>
        </header>

        {/* Key Metrics - Card-based with visual hierarchy */}
        <section className="mb-10">
          <div className="bg-card border border-border rounded-2xl p-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Books Read */}
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 bg-brand-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                  <BookOpen className="h-6 w-6 text-brand-primary" />
                </div>
                <div className="space-y-0.5 min-w-0">
                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Books Finished
                  </p>
                  <p className="text-3xl lg:text-4xl font-serif font-medium text-foreground">
                    {userStats?.totalBooksRead || 0}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {booksFinishedThisYear} this year
                  </p>
                </div>
              </div>

              {/* Pages This Month */}
              <div className="flex items-start gap-4 lg:border-l lg:border-border lg:pl-6">
                <div className="h-12 w-12 bg-brand-accent/10 rounded-xl flex items-center justify-center flex-shrink-0">
                  <TrendingUp className="h-6 w-6 text-brand-accent" />
                </div>
                <div className="space-y-0.5 min-w-0">
                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    This Month
                  </p>
                  <p className="text-3xl lg:text-4xl font-serif font-medium text-foreground">
                    {currentMonthPages.toLocaleString()}
                  </p>
                  <p className="text-sm text-muted-foreground">pages read</p>
                </div>
              </div>

              {/* Reading Streak */}
              <div className="flex items-start gap-4 lg:border-l lg:border-border lg:pl-6">
                <div className="h-12 w-12 bg-status-warning/10 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Flame className="h-6 w-6 text-status-warning" />
                </div>
                <div className="space-y-0.5 min-w-0">
                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Reading Streak
                  </p>
                  <p className="text-3xl lg:text-4xl font-serif font-medium text-foreground">
                    {userStats?.readingStreak || 0}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    consecutive days
                  </p>
                </div>
              </div>

              {/* Reading Velocity */}
              <div className="flex items-start gap-4 lg:border-l lg:border-border lg:pl-6">
                <div className="h-12 w-12 bg-status-info/10 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Sparkles className="h-6 w-6 text-status-info" />
                </div>
                <div className="space-y-0.5 min-w-0">
                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Daily Pace
                  </p>
                  <p className="text-3xl lg:text-4xl font-serif font-medium text-foreground">
                    {readingVelocity}
                  </p>
                  <p className="text-sm text-muted-foreground">pages per day</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Reading Activity Chart */}
        <section className="mb-10">
          <div className="flex items-baseline justify-between mb-4">
            <div>
              <h2 className="text-xl text-foreground mb-1">Reading Activity</h2>
              <p className="text-sm text-muted-foreground">
                Pages read over the past 12 months
              </p>
            </div>
          </div>

          {historicalDataByGenre.length > 0 ? (
            (() => {
              // Extract all unique genres from the data (excluding utility keys)
              const allGenres = new Set<string>();
              historicalDataByGenre.forEach((monthData) => {
                Object.keys(monthData).forEach((key) => {
                  if (
                    key !== "month" &&
                    key !== "fullMonth" &&
                    key !== "total"
                  ) {
                    allGenres.add(key);
                  }
                });
              });
              const availableGenres = Array.from(allGenres).sort();
              const genreColorMap = createGenreColorMapping(availableGenres);

              return (
                <div className="bg-card border border-border rounded-xl p-4 lg:p-6">
                  <ChartContainer
                    config={chartConfig}
                    className="h-[260px] lg:h-[320px] w-full"
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart
                        data={historicalDataByGenre}
                        margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                      >
                        <defs>
                          {availableGenres.map((genre) => (
                            <linearGradient
                              key={genre}
                              id={`gradient-${genre.replace(/\s+/g, "-")}`}
                              x1="0"
                              y1="0"
                              x2="0"
                              y2="1"
                            >
                              <stop
                                offset="0%"
                                stopColor={genreColorMap[genre]}
                                stopOpacity={0.4}
                              />
                              <stop
                                offset="100%"
                                stopColor={genreColorMap[genre]}
                                stopOpacity={0.05}
                              />
                            </linearGradient>
                          ))}
                        </defs>
                        <CartesianGrid
                          strokeDasharray="3 3"
                          stroke="var(--border)"
                          strokeOpacity={0.5}
                        />
                        <XAxis
                          dataKey="month"
                          tick={{
                            fontSize: 12,
                            fill: "var(--muted-foreground)",
                          }}
                          tickLine={false}
                          axisLine={false}
                        />
                        <YAxis
                          tick={{
                            fontSize: 12,
                            fill: "var(--muted-foreground)",
                          }}
                          tickLine={false}
                          axisLine={false}
                          width={45}
                        />
                        <ChartTooltip
                          content={({ active, payload, label }) => {
                            if (active && payload && payload.length) {
                              const monthData = historicalDataByGenre.find(
                                (d) => d.month === label
                              );
                              const totalPages = monthData?.total || 0;
                              return (
                                <div className="bg-popover border border-border rounded-xl p-4 shadow-xl">
                                  <p className="font-serif font-medium text-foreground text-lg mb-1">
                                    {monthData?.fullMonth}
                                  </p>
                                  <p className="text-sm text-muted-foreground mb-3">
                                    {totalPages.toLocaleString()} pages total
                                  </p>
                                  <div className="space-y-1.5">
                                    {payload
                                      .filter(
                                        (entry) => Number(entry.value) > 0
                                      )
                                      .sort(
                                        (a, b) =>
                                          Number(b.value) - Number(a.value)
                                      )
                                      .slice(0, 5)
                                      .map((entry, index) => (
                                        <div
                                          key={index}
                                          className="flex items-center justify-between gap-6"
                                        >
                                          <div className="flex items-center gap-2">
                                            <div
                                              className="w-2.5 h-2.5 rounded-full"
                                              style={{
                                                backgroundColor: entry.color,
                                              }}
                                            />
                                            <span className="text-sm text-foreground">
                                              {entry.dataKey}
                                            </span>
                                          </div>
                                          <span className="text-sm font-medium text-foreground tabular-nums">
                                            {Number(
                                              entry.value
                                            ).toLocaleString()}
                                          </span>
                                        </div>
                                      ))}
                                  </div>
                                </div>
                              );
                            }
                            return null;
                          }}
                        />
                        {availableGenres.map((genre) => (
                          <Area
                            key={genre}
                            type="monotone"
                            dataKey={genre}
                            stackId="genres"
                            stroke={genreColorMap[genre]}
                            fill={`url(#gradient-${genre.replace(
                              /\s+/g,
                              "-"
                            )})`}
                            strokeWidth={1.5}
                          />
                        ))}
                      </AreaChart>
                    </ResponsiveContainer>
                  </ChartContainer>

                  {/* Genre Legend - Horizontal, minimal */}
                  <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t border-border">
                    {availableGenres.slice(0, 6).map((genre) => (
                      <div key={genre} className="flex items-center gap-2">
                        <div
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: genreColorMap[genre] }}
                        />
                        <span className="text-xs text-muted-foreground">
                          {genre}
                        </span>
                      </div>
                    ))}
                    {availableGenres.length > 6 && (
                      <span className="text-xs text-muted-foreground">
                        +{availableGenres.length - 6} more
                      </span>
                    )}
                  </div>
                </div>
              );
            })()
          ) : (
            <div className="bg-card border border-border rounded-xl p-8 lg:p-12">
              <div className="text-center max-w-md mx-auto">
                <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="h-5 w-5 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-serif text-foreground mb-1">
                  Start Your Journey
                </h3>
                <p className="text-sm text-muted-foreground">
                  Begin reading and tracking your progress to see your activity
                  visualized here.
                </p>
              </div>
            </div>
          )}
        </section>

        {/* Two Column Layout - Genre Distribution + Reading Summary */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
          {/* Genre Distribution */}
          <div className="bg-card border border-border rounded-xl p-5 lg:p-6">
            <div className="flex items-center gap-2 mb-4">
              <Library className="h-5 w-5 text-muted-foreground" />
              <h2 className="text-xl text-foreground">Library Composition</h2>
            </div>

            {genreData.length > 0 ? (
              <div className="flex flex-col lg:flex-row items-center gap-6">
                {/* Pie Chart */}
                <div className="w-40 h-40 lg:w-44 lg:h-44 flex-shrink-0">
                  <ChartContainer config={{}} className="h-full w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={genreData}
                          cx="50%"
                          cy="50%"
                          innerRadius={45}
                          outerRadius={68}
                          paddingAngle={2}
                          dataKey="value"
                          strokeWidth={0}
                        >
                          {genreData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} />
                          ))}
                        </Pie>
                        <ChartTooltip
                          content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                              const data = payload[0].payload;
                              return (
                                <div className="bg-popover border border-border rounded-xl p-3 shadow-xl">
                                  <p className="font-medium text-foreground">
                                    {data.name}
                                  </p>
                                  <p className="text-sm text-muted-foreground">
                                    {data.value} books · {data.percentage}%
                                  </p>
                                </div>
                              );
                            }
                            return null;
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </div>

                {/* Legend - Vertical list */}
                <div className="flex-1 w-full">
                  <div className="space-y-2">
                    {genreData.slice(0, 6).map((item) => (
                      <div
                        key={item.name}
                        className="flex items-center justify-between group"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: item.fill }}
                          />
                          <span className="text-sm text-foreground">
                            {item.name}
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-medium text-foreground tabular-nums">
                            {item.value}
                          </span>
                          <span className="text-xs text-muted-foreground w-10 text-right">
                            {item.percentage}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                  {genreData.length > 6 && (
                    <p className="text-xs text-muted-foreground mt-3 pt-2 border-t border-border">
                      +{genreData.length - 6} more genres
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center mx-auto mb-3">
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                </div>
                <p className="text-sm text-muted-foreground">
                  Add books to see your genre distribution
                </p>
              </div>
            )}
          </div>

          {/* Quick Stats / Reading Summary */}
          <div className="bg-card border border-border rounded-xl p-5 lg:p-6">
            <h2 className="text-xl text-foreground mb-4">Reading Summary</h2>

            <div className="space-y-4">
              {/* Total Pages */}
              <div className="pb-4 border-b border-border">
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-1">
                  Lifetime Pages
                </p>
                <p className="text-2xl lg:text-3xl font-serif font-medium text-foreground">
                  {userStats?.totalPagesRead?.toLocaleString() || "0"}
                </p>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-1">
                    Currently Reading
                  </p>
                  <p className="text-xl font-serif font-medium text-foreground">
                    {userStats?.currentlyReading || 0}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-1">
                    In Library
                  </p>
                  <p className="text-xl font-serif font-medium text-foreground">
                    {userStats?.booksInLibrary || 0}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-1">
                    This Month
                  </p>
                  <p className="text-xl font-serif font-medium text-foreground">
                    {userStats?.booksReadThisMonth || 0}
                  </p>
                  <p className="text-xs text-muted-foreground">books</p>
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-1">
                    Avg Rating
                  </p>
                  <p className="text-xl font-serif font-medium text-foreground">
                    {userStats?.averageRating
                      ? userStats.averageRating.toFixed(1)
                      : "—"}
                  </p>
                  <p className="text-xs text-muted-foreground">of 5</p>
                </div>
              </div>

              {/* Favorite Genre */}
              {userStats?.favoriteGenres &&
                userStats.favoriteGenres.length > 0 && (
                  <div className="pt-4 border-t border-border">
                    <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-1">
                      Top Genre
                    </p>
                    <p className="text-base font-medium text-brand-primary">
                      {userStats.favoriteGenres[0]}
                    </p>
                  </div>
                )}
            </div>
          </div>
        </section>

        {/* Reading Goal Progress */}
        {userStats?.readingGoalProgress && (
          <section className="mb-6">
            <div className="bg-gradient-to-br from-brand-primary/5 via-background to-brand-accent/5 border border-border rounded-xl p-5 lg:p-6">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div>
                  <h2 className="text-xl text-foreground mb-1">
                    Annual Reading Goal
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {userStats.readingGoalProgress.percentage.toFixed(0)}% of
                    the way there
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-3xl lg:text-4xl font-serif font-medium text-foreground">
                    {userStats.readingGoalProgress.current}
                    <span className="text-xl text-muted-foreground font-normal">
                      /{userStats.readingGoalProgress.goal}
                    </span>
                  </p>
                  <p className="text-xs text-muted-foreground">books</p>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mt-5">
                <div className="w-full h-2.5 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-brand-primary to-brand-accent rounded-full transition-all duration-700 ease-out"
                    style={{
                      width: `${Math.min(
                        100,
                        userStats.readingGoalProgress.percentage
                      )}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
