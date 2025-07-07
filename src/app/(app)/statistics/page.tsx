"use client";

import { useRouter } from "next/navigation";
import { BarChart3, BookOpen, Clock, Star, TrendingUp } from "lucide-react";
import Sidebar from "@/components/app/Sidebar";

export default function StatisticsPage() {
  const router = useRouter();

  const handleAddBookClick = () => {
    router.push('/add-books');
  };

  return (
    <div className="min-h-screen bg-background">
      <Sidebar onAddBookClick={handleAddBookClick} />
      <div className="ml-64 p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Statistics
        </h1>
        <p className="text-muted-foreground">
          Detailed insights into your reading habits.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
        {/* Total Books Read */}
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Total Books Read
              </p>
              <p className="text-2xl font-bold text-foreground">47</p>
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
              <p className="text-2xl font-bold text-foreground">4.2</p>
            </div>
            <div className="h-8 w-8 bg-status-warning/10 rounded-full flex items-center justify-center">
              <Star className="h-4 w-4 text-status-warning" />
            </div>
          </div>
        </div>

        {/* Reading Time */}
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Hours Read
              </p>
              <p className="text-2xl font-bold text-foreground">324</p>
            </div>
            <div className="h-8 w-8 bg-brand-accent/10 rounded-full flex items-center justify-center">
              <Clock className="h-4 w-4 text-brand-accent" />
            </div>
          </div>
        </div>

        {/* Books This Year */}
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Books This Year
              </p>
              <p className="text-2xl font-bold text-foreground">12</p>
            </div>
            <div className="h-8 w-8 bg-status-success/10 rounded-full flex items-center justify-center">
              <TrendingUp className="h-4 w-4 text-status-success" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Reading by Genre */}
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center mb-4">
            <BarChart3 className="h-5 w-5 text-brand-primary mr-2" />
            <h2 className="text-lg font-semibold text-foreground">
              Reading by Genre
            </h2>
          </div>
          <div className="space-y-4">
            {[
              { genre: "Fiction", count: 18, percentage: 38 },
              { genre: "Non-Fiction", count: 12, percentage: 26 },
              { genre: "Science Fiction", count: 8, percentage: 17 },
              { genre: "Biography", count: 5, percentage: 11 },
              { genre: "History", count: 4, percentage: 8 },
            ].map((item) => (
              <div key={item.genre} className="flex items-center">
                <div className="w-20 text-sm text-muted-foreground">
                  {item.genre}
                </div>
                <div className="flex-1 mx-4">
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="bg-brand-primary h-2 rounded-full"
                      style={{ width: `${item.percentage}%` }}
                    ></div>
                  </div>
                </div>
                <div className="text-sm font-medium text-foreground w-8">
                  {item.count}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Reading Timeline */}
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center mb-4">
            <TrendingUp className="h-5 w-5 text-brand-primary mr-2" />
            <h2 className="text-lg font-semibold text-foreground">
              Reading Timeline
            </h2>
          </div>
          <div className="text-center py-8">
            <BookOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <p className="text-muted-foreground">
              Reading timeline chart coming soon
            </p>
          </div>
        </div>
      </div>
    </div>
    </div>
  );
}