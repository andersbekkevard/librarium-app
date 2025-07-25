"use client";

import { ChartContainer, ChartTooltip } from "@/components/ui/chart";
import { useBooksContext } from "@/lib/providers/BooksProvider";
import { useEventsContext } from "@/lib/providers/EventsProvider";
import { useUserContext } from "@/lib/providers/UserProvider";
import { createGenreColorMapping } from "@/lib/utils/genre-colors";
import { eachMonthOfInterval, format, startOfMonth, subMonths } from "date-fns";
import {
  Award,
  BarChart3,
  BookOpen,
  Calendar,
  Star,
  Target,
  TrendingUp,
  Zap,
} from "lucide-react";
import { useMemo } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
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

      // Ensure all genres have a value (0 if no data for that month)
      const monthData: Record<string, number | string> = {
        month: format(month, "MMM yyyy"),
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
    books: {
      label: "Books Started",
      color: "hsl(var(--brand-accent))",
    },
  };

  const loading = userLoading || booksLoading || eventsLoading;

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-1/4 mb-2"></div>
          <div className="h-4 bg-muted rounded w-1/2 mb-6"></div>
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-muted rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Reading Analytics
        </h1>
        <p className="text-muted-foreground">
          Deep insights into your reading journey and habits.
        </p>
      </div>

      {/* Main Stats Card */}
      {/* Mobile Layout - Clean 2x2 grid in single card */}
      <div className="bg-card border border-border rounded-lg p-4 mb-6 lg:hidden">
        {/* Mobile Layout - Clean 2x2 grid */}
        <div className="grid grid-cols-2 gap-4">
          {/* Total Books Read */}
          <div className="text-center p-3 bg-brand-primary/5 rounded-lg">
            <div className="h-10 w-10 bg-brand-primary/10 rounded-full flex items-center justify-center mx-auto mb-2">
              <BookOpen className="h-5 w-5 text-brand-primary" />
            </div>
            <p className="text-2xl font-bold text-foreground mb-1">
              {userStats?.totalBooksRead || 0}
            </p>
            <p className="text-xs font-medium text-muted-foreground mb-1">
              Total Books Read
            </p>
            <p className="text-xs text-muted-foreground">
              {userStats?.booksReadThisYear || 0} this year
            </p>
          </div>

          {/* Average Rating */}
          <div className="text-center p-3 bg-status-warning/5 rounded-lg">
            <div className="h-10 w-10 bg-status-warning/10 rounded-full flex items-center justify-center mx-auto mb-2">
              <Star className="h-5 w-5 text-status-warning" />
            </div>
            <p className="text-2xl font-bold text-foreground mb-1">
              {userStats?.averageRating
                ? userStats.averageRating.toFixed(1)
                : "0.0"}
            </p>
            <p className="text-xs font-medium text-muted-foreground mb-1">
              Avg Rating
            </p>
            <div className="flex items-center justify-center">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-3 w-3 ${
                    i < Math.floor(userStats?.averageRating || 0)
                      ? "text-status-warning fill-current"
                      : "text-muted-foreground"
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Reading Velocity */}
          <div className="text-center p-3 bg-brand-accent/5 rounded-lg">
            <div className="h-10 w-10 bg-brand-accent/10 rounded-full flex items-center justify-center mx-auto mb-2">
              <Zap className="h-5 w-5 text-brand-accent" />
            </div>
            <p className="text-2xl font-bold text-foreground mb-1">
              {readingVelocity}
            </p>
            <p className="text-xs font-medium text-muted-foreground mb-1">
              Reading Velocity
            </p>
            <p className="text-xs text-muted-foreground">pages per day</p>
          </div>

          {/* Total Pages */}
          <div className="text-center p-3 bg-status-success/5 rounded-lg">
            <div className="h-10 w-10 bg-status-success/10 rounded-full flex items-center justify-center mx-auto mb-2">
              <Award className="h-5 w-5 text-status-success" />
            </div>
            <p className="text-2xl font-bold text-foreground mb-1">
              {userStats?.totalPagesRead?.toLocaleString() || "0"}
            </p>
            <p className="text-xs font-medium text-muted-foreground mb-1">
              Total Pages
            </p>
            <p className="text-xs text-muted-foreground">
              lifetime achievement
            </p>
          </div>
        </div>
      </div>

      {/* Desktop Layout - 4 separate cards */}
      <div className="hidden lg:grid lg:grid-cols-4 gap-6 mb-8">
        {/* Total Books Read */}
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-muted-foreground">
              Total Books Read
            </p>
            <div className="h-8 w-8 bg-brand-primary/10 rounded-full flex items-center justify-center">
              <BookOpen className="h-4 w-4 text-brand-primary" />
            </div>
          </div>
          <p className="text-2xl font-bold text-foreground mb-1">
            {userStats?.totalBooksRead || 0}
          </p>
          <p className="text-xs text-muted-foreground">
            {userStats?.booksReadThisYear || 0} this year
          </p>
        </div>

        {/* Average Rating */}
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-muted-foreground">
              Avg Rating
            </p>
            <div className="h-8 w-8 bg-status-warning/10 rounded-full flex items-center justify-center">
              <Star className="h-4 w-4 text-status-warning" />
            </div>
          </div>
          <p className="text-2xl font-bold text-foreground mb-1">
            {userStats?.averageRating
              ? userStats.averageRating.toFixed(1)
              : "0.0"}
          </p>
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`h-3 w-3 ${
                  i < Math.floor(userStats?.averageRating || 0)
                    ? "text-status-warning fill-current"
                    : "text-muted-foreground"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Reading Velocity */}
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-muted-foreground">
              Reading Velocity
            </p>
            <div className="h-8 w-8 bg-brand-accent/10 rounded-full flex items-center justify-center">
              <Zap className="h-4 w-4 text-brand-accent" />
            </div>
          </div>
          <p className="text-2xl font-bold text-foreground mb-1">
            {readingVelocity}
          </p>
          <p className="text-xs text-muted-foreground">pages per day</p>
        </div>

        {/* Total Pages */}
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-muted-foreground">
              Total Pages
            </p>
            <div className="h-8 w-8 bg-status-success/10 rounded-full flex items-center justify-center">
              <Award className="h-4 w-4 text-status-success" />
            </div>
          </div>
          <p className="text-2xl font-bold text-foreground mb-1">
            {userStats?.totalPagesRead?.toLocaleString() || "0"}
          </p>
          <p className="text-xs text-muted-foreground">lifetime achievement</p>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6 mb-6 lg:mb-8">
        {/* Historical Pages Read Chart */}
        <div className="lg:col-span-2 bg-card border border-border rounded-lg p-4 lg:p-6">
          <div className="flex items-center mb-4">
            <TrendingUp className="h-5 w-5 text-brand-primary mr-2" />
            <h2 className="text-lg font-semibold text-foreground">
              Reading Activity Over Time
            </h2>
          </div>
          {historicalDataByGenre.length > 0 ? (
            (() => {
              // Extract all unique genres from the data (excluding 'month' key)
              const allGenres = new Set<string>();
              historicalDataByGenre.forEach((monthData) => {
                Object.keys(monthData).forEach((key) => {
                  if (key !== "month") {
                    allGenres.add(key);
                  }
                });
              });
              const availableGenres = Array.from(allGenres).sort(); // Sort for consistent ordering
              const genreColorMap = createGenreColorMapping(availableGenres);

              return (
                <ChartContainer
                  config={chartConfig}
                  className="h-[250px] lg:h-[300px] w-full"
                >
                  <AreaChart data={historicalDataByGenre}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="month"
                      tick={{ fontSize: 10 }}
                      tickLine={false}
                      angle={-45}
                      textAnchor="end"
                      height={50}
                    />
                    <YAxis tick={{ fontSize: 10 }} tickLine={false} />
                    <ChartTooltip
                      content={({ active, payload, label }) => {
                        if (active && payload && payload.length) {
                          const totalPages = payload.reduce(
                            (sum, entry) => sum + (Number(entry.value) || 0),
                            0
                          );
                          return (
                            <div className="bg-background border border-border rounded-lg p-2 lg:p-3 shadow-lg">
                              <p className="font-medium text-foreground mb-1 lg:mb-2 text-sm lg:text-base">
                                {label}
                              </p>
                              <p className="text-xs lg:text-sm text-muted-foreground mb-1 lg:mb-2">
                                Total: {totalPages} pages
                              </p>
                              <div className="space-y-1">
                                {payload
                                  .filter((entry) => Number(entry.value) > 0) // Only show genres with pages read
                                  .map((entry, index) => (
                                    <div
                                      key={index}
                                      className="flex items-center justify-between"
                                    >
                                      <div className="flex items-center">
                                        <div
                                          className="w-2 h-2 lg:w-3 lg:h-3 rounded-full mr-1 lg:mr-2"
                                          style={{
                                            backgroundColor: entry.color,
                                          }}
                                        />
                                        <span className="text-xs lg:text-sm text-foreground">
                                          {entry.dataKey}
                                        </span>
                                      </div>
                                      <span className="text-xs lg:text-sm font-medium text-foreground">
                                        {entry.value} pages
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
                        fill={genreColorMap[genre]}
                        fillOpacity={0.2}
                        strokeWidth={2}
                      />
                    ))}
                  </AreaChart>
                </ChartContainer>
              );
            })()
          ) : (
            <div className="h-[300px] flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Start reading to see your progress over time</p>
              </div>
            </div>
          )}
        </div>

        {/* Genre Distribution Pie Chart */}
        <div className="bg-card border border-border rounded-lg p-4 lg:p-6">
          <div className="flex items-center mb-4">
            <BarChart3 className="h-5 w-5 text-brand-primary mr-2" />
            <h2 className="text-lg font-semibold text-foreground">
              Books by Genre
            </h2>
          </div>
          {genreData.length > 0 ? (
            <div className="space-y-3 lg:space-y-4">
              {/* Pie Chart */}
              <div className="h-[180px] lg:h-[200px] w-full">
                <ChartContainer config={{}} className="h-full w-full">
                  <PieChart>
                    <Pie
                      data={genreData}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={65}
                      paddingAngle={2}
                      dataKey="value"
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
                            <div className="bg-background border border-border rounded-lg p-2 lg:p-3 shadow-lg">
                              <p className="font-medium text-foreground text-sm">
                                {data.name}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {data.value} books ({data.percentage}%)
                              </p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                  </PieChart>
                </ChartContainer>
              </div>

              {/* Legend */}
              <div className="space-y-1.5 lg:space-y-2">
                {genreData.slice(0, 5).map((item) => (
                  <div
                    key={item.name}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center">
                      <div
                        className="w-2.5 h-2.5 lg:w-3 lg:h-3 rounded-full mr-2"
                        style={{ backgroundColor: item.fill }}
                      ></div>
                      <span className="text-xs lg:text-sm text-muted-foreground truncate max-w-[80px] lg:max-w-[100px]">
                        {item.name}
                      </span>
                    </div>
                    <div className="flex items-center space-x-1 lg:space-x-2">
                      <span className="text-xs lg:text-sm font-medium text-foreground">
                        {item.value}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        ({item.percentage}%)
                      </span>
                    </div>
                  </div>
                ))}
                {genreData.length > 5 && (
                  <div className="text-xs text-muted-foreground text-center pt-1 lg:pt-2">
                    +{genreData.length - 5} more
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="h-[200px] flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Add books to see genre breakdown</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Reading Goals & Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
        {/* Reading Goal Progress */}
        <div className="bg-card border border-border rounded-lg p-4 lg:p-6">
          <div className="flex items-center mb-3 lg:mb-4">
            <Target className="h-4 w-4 lg:h-5 lg:w-5 text-brand-primary mr-2" />
            <h2 className="text-base lg:text-lg font-semibold text-foreground">
              Reading Goal
            </h2>
          </div>
          {userStats?.readingGoalProgress ? (
            <div className="space-y-3 lg:space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-xs lg:text-sm text-muted-foreground">
                  Annual Goal
                </span>
                <span className="text-sm lg:text-base font-medium">
                  {userStats.readingGoalProgress.current} /
                  {userStats.readingGoalProgress.goal}
                </span>
              </div>
              <div className="w-full bg-muted rounded-full h-2.5 lg:h-3">
                <div
                  className="bg-brand-primary h-2.5 lg:h-3 rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.min(
                      100,
                      userStats.readingGoalProgress.percentage
                    )}%`,
                  }}
                ></div>
              </div>
              <p className="text-xs lg:text-sm text-muted-foreground">
                {userStats.readingGoalProgress.percentage.toFixed(1)}% complete
              </p>
            </div>
          ) : (
            <div className="text-center py-6 lg:py-8">
              <Target className="h-10 w-10 lg:h-12 lg:w-12 mx-auto mb-3 lg:mb-4 text-muted-foreground opacity-50" />
              <p className="text-sm lg:text-base text-muted-foreground">
                Goals coming soon!
              </p>
            </div>
          )}
        </div>

        {/* Quick Insights */}
        <div className="bg-card border border-border rounded-lg p-4 lg:p-6">
          <div className="flex items-center mb-3 lg:mb-4">
            <Zap className="h-4 w-4 lg:h-5 lg:w-5 text-brand-primary mr-2" />
            <h2 className="text-base lg:text-lg font-semibold text-foreground">
              Quick Insights
            </h2>
          </div>
          <div className="space-y-3 lg:space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-xs lg:text-sm text-muted-foreground">
                Reading
              </span>
              <span className="text-sm lg:text-base font-medium">
                {userStats?.currentlyReading || 0}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs lg:text-sm text-muted-foreground">
                Library
              </span>
              <span className="text-sm lg:text-base font-medium">
                {userStats?.booksInLibrary || 0}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs lg:text-sm text-muted-foreground">
                Streak
              </span>
              <span className="text-sm lg:text-base font-medium">
                {userStats?.readingStreak || 0}d
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs lg:text-sm text-muted-foreground">
                This Month
              </span>
              <span className="text-sm lg:text-base font-medium">
                {userStats?.booksReadThisMonth || 0}
              </span>
            </div>
            {userStats?.favoriteGenres &&
              userStats.favoriteGenres.length > 0 && (
                <div className="pt-2 border-t">
                  <span className="text-xs lg:text-sm text-muted-foreground">
                    Favorite
                  </span>
                  <p className="text-sm lg:text-base font-medium text-brand-primary">
                    {userStats.favoriteGenres[0]}
                  </p>
                </div>
              )}
          </div>
        </div>
      </div>
    </div>
  );
}
