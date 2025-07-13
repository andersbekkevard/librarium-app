"use client";

import { useRouter } from "next/navigation";
import { 
  BarChart3, 
  BookOpen, 
  Star, 
  TrendingUp, 
  Calendar,
  Target,
  Zap,
  Award
} from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, PieChart, Pie, Cell } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import Sidebar from "@/components/app/Sidebar";
import { useUserContext } from "@/lib/providers/UserProvider";
import { useBooksContext } from "@/lib/providers/BooksProvider";
import { useEventsContext } from "@/lib/providers/EventsProvider";
import { useMemo } from "react";
import { format, startOfMonth, eachMonthOfInterval, subMonths } from "date-fns";

export default function StatisticsPage() {
  const router = useRouter();
  const { userStats, loading: userLoading } = useUserContext();
  const { books, loading: booksLoading } = useBooksContext();
  const { events, loading: eventsLoading } = useEventsContext();

  const handleAddBookClick = () => {
    router.push('/add-books');
  };

  // Calculate historical pages read data
  const historicalData = useMemo(() => {
    if (!events.length) return [];

    const progressEvents = events.filter(event => event.type === 'progress_update');
    const last12Months = eachMonthOfInterval({
      start: subMonths(new Date(), 11),
      end: new Date()
    });

    return last12Months.map(month => {
      const monthStart = startOfMonth(month);
      const monthEnd = new Date(month.getFullYear(), month.getMonth() + 1, 0);
      
      const monthEvents = progressEvents.filter(event => {
        const eventDate = event.timestamp.toDate();
        return eventDate >= monthStart && eventDate <= monthEnd;
      });

      const totalPages = monthEvents.reduce((sum, event) => {
        const pagesRead = (event.data.newPage || 0) - (event.data.previousPage || 0);
        return sum + Math.max(0, pagesRead);
      }, 0);

      return {
        month: format(month, 'MMM yyyy'),
        pages: totalPages,
        books: new Set(monthEvents.map(e => e.bookId)).size
      };
    });
  }, [events]);

  // Calculate genre distribution for pie chart
  const genreData = useMemo(() => {
    if (!books.length) return [];

    // Brand-inspired color palette with better contrast - alternating between light and dark
    const genreColors = [
      "oklch(0.55 0.25 240)",    // Brand primary - vibrant blue (medium)
      "oklch(0.35 0.12 225)",    // Very dark blue-grey (dark)
      "oklch(0.75 0.18 250)",    // Light purple-blue (light)
      "oklch(0.45 0.15 230)",    // Deep blue (medium-dark)
      "oklch(0.8 0.15 245)",     // Very light blue (very light)
      "oklch(0.4 0.05 220)",     // Brand secondary - dark blue-grey (dark)
      "oklch(0.7 0.2 240)",      // Brand accent - light blue (light)
      "oklch(0.3 0.08 220)",     // Almost black blue-grey (very dark)
      "oklch(0.85 0.1 240)",     // Pale blue (very light)
      "oklch(0.5 0.18 235)",     // Darker medium blue (medium)
      "oklch(0.6 0.08 220)",     // Medium blue-grey (medium-dark)
      "oklch(0.65 0.22 240)"     // Medium blue (medium-light)
    ];

    const genreCounts = books.reduce((acc, book) => {
      const genre = book.genre || 'Unknown';
      acc[genre] = (acc[genre] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(genreCounts)
      .map(([name, value], index) => ({
        name,
        value,
        percentage: Math.round((value / books.length) * 100),
        fill: name === 'Unknown' ? "oklch(0.85 0.01 240)" : genreColors[index % genreColors.length] // Light grey for Unknown
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8); // Show top 8 genres for pie chart
  }, [books]);

  // Calculate reading velocity (pages per day)
  const readingVelocity = useMemo(() => {
    if (!events.length) return 0;

    const progressEvents = events.filter(event => event.type === 'progress_update');
    if (progressEvents.length < 2) return 0;

    const totalPages = progressEvents.reduce((sum, event) => {
      const pagesRead = (event.data.newPage || 0) - (event.data.previousPage || 0);
      return sum + Math.max(0, pagesRead);
    }, 0);

    const firstEvent = progressEvents[progressEvents.length - 1];
    const lastEvent = progressEvents[0];
    const daysDiff = Math.max(1, (lastEvent.timestamp.toDate().getTime() - firstEvent.timestamp.toDate().getTime()) / (1000 * 60 * 60 * 24));

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
      <div className="min-h-screen bg-background">
        <Sidebar onAddBookClick={handleAddBookClick} />
        <div className="ml-64 p-6">
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
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Sidebar onAddBookClick={handleAddBookClick} />
      <div className="ml-64 p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Reading Analytics
          </h1>
          <p className="text-muted-foreground">
            Deep insights into your reading journey and habits.
          </p>
        </div>

        {/* Main Stats Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Books Read */}
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total Books Read
                </p>
                <p className="text-2xl font-bold text-foreground">
                  {userStats?.totalBooksRead || 0}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {userStats?.booksReadThisYear || 0} this year
                </p>
              </div>
              <div className="h-8 w-8 bg-brand-primary/10 rounded-full flex items-center justify-center">
                <BookOpen className="h-4 w-4 text-brand-primary" />
              </div>
            </div>
          </div>

          {/* Average Rating */}
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Average Rating
                </p>
                <p className="text-2xl font-bold text-foreground">
                  {userStats?.averageRating ? userStats.averageRating.toFixed(1) : '0.0'}
                </p>
                <div className="flex items-center mt-1">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      className={`h-3 w-3 ${
                        i < Math.floor(userStats?.averageRating || 0) 
                          ? 'text-status-warning fill-current' 
                          : 'text-muted-foreground'
                      }`} 
                    />
                  ))}
                </div>
              </div>
              <div className="h-8 w-8 bg-status-warning/10 rounded-full flex items-center justify-center">
                <Star className="h-4 w-4 text-status-warning" />
              </div>
            </div>
          </div>

          {/* Reading Velocity */}
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Reading Velocity
                </p>
                <p className="text-2xl font-bold text-foreground">
                  {readingVelocity}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  pages per day
                </p>
              </div>
              <div className="h-8 w-8 bg-brand-accent/10 rounded-full flex items-center justify-center">
                <Zap className="h-4 w-4 text-brand-accent" />
              </div>
            </div>
          </div>

          {/* Total Pages */}
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total Pages Read
                </p>
                <p className="text-2xl font-bold text-foreground">
                  {userStats?.totalPagesRead?.toLocaleString() || '0'}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  lifetime achievement
                </p>
              </div>
              <div className="h-8 w-8 bg-status-success/10 rounded-full flex items-center justify-center">
                <Award className="h-4 w-4 text-status-success" />
              </div>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">
          {/* Historical Pages Read Chart */}
          <div className="xl:col-span-2 bg-card border border-border rounded-lg p-6">
            <div className="flex items-center mb-4">
              <TrendingUp className="h-5 w-5 text-brand-primary mr-2" />
              <h2 className="text-lg font-semibold text-foreground">
                Reading Activity Over Time
              </h2>
            </div>
            {historicalData.length > 0 ? (
              <ChartContainer config={chartConfig} className="h-[300px] w-full">
                <AreaChart data={historicalData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="month" 
                    tick={{ fontSize: 12 }}
                    tickLine={false}
                  />
                  <YAxis tick={{ fontSize: 12 }} tickLine={false} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Area
                    type="monotone"
                    dataKey="pages"
                    stroke="var(--color-pages)"
                    fill="var(--color-pages)"
                    fillOpacity={0.2}
                    strokeWidth={2}
                  />
                </AreaChart>
              </ChartContainer>
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
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-center mb-4">
              <BarChart3 className="h-5 w-5 text-brand-primary mr-2" />
              <h2 className="text-lg font-semibold text-foreground">
                Books by Genre
              </h2>
            </div>
            {genreData.length > 0 ? (
              <div className="space-y-4">
                {/* Pie Chart */}
                <div className="h-[200px] w-full">
                  <ChartContainer config={{}} className="h-full w-full">
                    <PieChart>
                      <Pie
                        data={genreData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
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
                              <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
                                <p className="font-medium text-foreground">{data.name}</p>
                                <p className="text-sm text-muted-foreground">
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
                <div className="space-y-2">
                  {genreData.slice(0, 6).map((item) => (
                    <div key={item.name} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div
                          className="w-3 h-3 rounded-full mr-2"
                          style={{ backgroundColor: item.fill }}
                        ></div>
                        <span className="text-sm text-muted-foreground truncate max-w-[100px]">
                          {item.name}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium text-foreground">
                          {item.value}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          ({item.percentage}%)
                        </span>
                      </div>
                    </div>
                  ))}
                  {genreData.length > 6 && (
                    <div className="text-xs text-muted-foreground text-center pt-2">
                      +{genreData.length - 6} more genres
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Reading Goal Progress */}
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-center mb-4">
              <Target className="h-5 w-5 text-brand-primary mr-2" />
              <h2 className="text-lg font-semibold text-foreground">
                Reading Goal Progress
              </h2>
            </div>
            {userStats?.readingGoalProgress ? (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Annual Goal</span>
                  <span className="font-medium">
                    {userStats.readingGoalProgress.current} / {userStats.readingGoalProgress.goal} books
                  </span>
                </div>
                <div className="w-full bg-muted rounded-full h-3">
                  <div
                    className="bg-brand-primary h-3 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, userStats.readingGoalProgress.percentage)}%` }}
                  ></div>
                </div>
                <p className="text-sm text-muted-foreground">
                  {userStats.readingGoalProgress.percentage.toFixed(1)}% complete
                </p>
              </div>
            ) : (
              <div className="text-center py-8">
                <Target className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <p className="text-muted-foreground">
                  Set a reading goal to track your progress
                </p>
              </div>
            )}
          </div>

          {/* Quick Insights */}
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-center mb-4">
              <Zap className="h-5 w-5 text-brand-primary mr-2" />
              <h2 className="text-lg font-semibold text-foreground">
                Reading Insights
              </h2>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Currently Reading</span>
                <span className="font-medium">{userStats?.currentlyReading || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Books in Library</span>
                <span className="font-medium">{userStats?.booksInLibrary || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Reading Streak</span>
                <span className="font-medium">{userStats?.readingStreak || 0} days</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">This Month</span>
                <span className="font-medium">{userStats?.booksReadThisMonth || 0} books</span>
              </div>
              {userStats?.favoriteGenres && userStats.favoriteGenres.length > 0 && (
                <div className="pt-2 border-t">
                  <span className="text-sm text-muted-foreground">Favorite Genre</span>
                  <p className="font-medium text-brand-primary">{userStats.favoriteGenres[0]}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}