"use client";
import DashboardContent from "@/components/app/dashboard/DashboardContent";
import { Book } from "@/lib/models/models";
import { useAuthContext } from "@/lib/providers/AuthProvider";
import { useBooksContext } from "@/lib/providers/BooksProvider";
import { useUserContext } from "@/lib/providers/UserProvider";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo } from "react";

export default function Dashboard() {
  const { loading, isAuthenticated, user } = useAuthContext();
  const { books, loading: booksLoading } = useBooksContext();
  const {
    userStats,
    loading: userStatsLoading,
  } = useUserContext();
  const router = useRouter();

  // Transform userStats to the format expected by DashboardContent
  const stats = useMemo(() => {
    if (!userStats) {
      return {
        totalBooks: 0,
        finishedBooks: 0,
        totalPagesRead: 0,
        currentlyReading: 0,
        readingStreak: 0,
      };
    }

    return {
      totalBooks: userStats.booksInLibrary,
      finishedBooks: userStats.booksReadThisYear, // Use "Read This Year" for the second stat
      totalPagesRead: userStats.totalPagesRead,
      currentlyReading: userStats.currentlyReading,
      readingStreak: userStats.readingStreak,
    };
  }, [userStats]);

  // Stats now update automatically via UserProvider subscription - no manual refresh needed

  // Route protection - redirect to landing if not authenticated
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/");
    }
  }, [loading, isAuthenticated, router]);

  // Show loading while checking auth, loading books, or loading user stats
  if (loading || booksLoading || userStatsLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-brand-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render anything if not authenticated (redirect will happen)
  if (!isAuthenticated) {
    return null;
  }

  const handleEdit = async (book: Book) => {
    if (!user) return;
    console.log("Edit book:", book.title);
    // TODO: Implement edit functionality
  };

  const handleUpdateProgress = async (book: Book) => {
    if (!user) return;
    console.log("Update progress for:", book.title);
    // TODO: Implement update progress functionality
  };

  const handleBookClick = (bookId: string) => {
    router.push(`/books/${bookId}`);
  };

  return (
    <DashboardContent
      books={books}
      stats={stats}
      userId={user?.uid || ""}
      onEdit={handleEdit}
      onUpdateProgress={handleUpdateProgress}
      onBookClick={handleBookClick}
    />
  );
}
