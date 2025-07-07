"use client";

import { useRouter } from "next/navigation";
import { BookOpen, TrendingUp, Calendar, Target } from "lucide-react";
import Sidebar from "@/components/app/Sidebar";

export default function ProgressPage() {
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
          Reading Progress
        </h1>
        <p className="text-muted-foreground">
          Track your reading journey and goals.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Reading Goals */}
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center mb-4">
            <Target className="h-5 w-5 text-brand-primary mr-2" />
            <h2 className="text-lg font-semibold text-foreground">
              Reading Goals
            </h2>
          </div>
          <div className="space-y-4">
            <div className="p-4 bg-muted/30 rounded-lg">
              <p className="text-sm text-muted-foreground">Books this year</p>
              <div className="flex items-center justify-between mt-2">
                <span className="text-2xl font-bold text-foreground">12 / 24</span>
                <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-brand-primary rounded-full" style={{ width: '50%' }}></div>
                </div>
              </div>
            </div>
            <div className="p-4 bg-muted/30 rounded-lg">
              <p className="text-sm text-muted-foreground">Pages this month</p>
              <div className="flex items-center justify-between mt-2">
                <span className="text-2xl font-bold text-foreground">456 / 800</span>
                <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-status-success rounded-full" style={{ width: '57%' }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Reading Streak */}
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center mb-4">
            <TrendingUp className="h-5 w-5 text-brand-primary mr-2" />
            <h2 className="text-lg font-semibold text-foreground">
              Reading Streak
            </h2>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-foreground mb-2">12</div>
            <p className="text-muted-foreground">days in a row</p>
            <div className="mt-4 flex justify-center">
              <div className="flex space-x-1">
                {[...Array(7)].map((_, i) => (
                  <div
                    key={i}
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      i < 5 ? 'bg-brand-primary text-white' : 'bg-muted'
                    }`}
                  >
                    <BookOpen className="h-4 w-4" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Monthly Progress */}
        <div className="lg:col-span-2 bg-card border border-border rounded-lg p-6">
          <div className="flex items-center mb-4">
            <Calendar className="h-5 w-5 text-brand-primary mr-2" />
            <h2 className="text-lg font-semibold text-foreground">
              Monthly Progress
            </h2>
          </div>
          <div className="text-center py-8">
            <BookOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <p className="text-muted-foreground">
              Monthly progress tracking coming soon
            </p>
          </div>
        </div>
      </div>
    </div>
    </div>
  );
}