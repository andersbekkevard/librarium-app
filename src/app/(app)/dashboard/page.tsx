"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Book } from "@/lib/models";
import { userService } from "@/lib/services";
import Sidebar from "@/components/app/Sidebar";
import { Loader2 } from "lucide-react";
import { useAuthContext } from "@/lib/providers/AuthProvider";
import { useBooksContext } from "@/lib/providers/BooksProvider";
import DashboardContent from "@/components/dashboard/DashboardContent";

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalBooks: 0,
    finishedBooks: 0,
    totalPagesRead: 0,
    currentlyReading: 0,
    readingStreak: 0,
  });
  const { loading, isAuthenticated, user } = useAuthContext();
  const { books, loading: booksLoading } = useBooksContext();
  const router = useRouter();

  // Calculate stats using UserService when user and books change
  useEffect(() => {
    const fetchStats = async () => {
      if (!user) return;
      
      try {
        const result = await userService.getUserStats(user.uid);
        if (result.success && result.data) {
          setStats({
            totalBooks: result.data.booksInLibrary,
            finishedBooks: result.data.booksReadThisYear, // Use "Read This Year" for the second stat
            totalPagesRead: result.data.totalPagesRead,
            currentlyReading: result.data.currentlyReading,
            readingStreak: result.data.readingStreak,
          });
        } else {
          // Reset stats on error
          setStats({
            totalBooks: 0,
            finishedBooks: 0,
            totalPagesRead: 0,
            currentlyReading: 0,
            readingStreak: 0,
          });
        }
      } catch (error) {
        console.error('Error fetching user stats:', error);
        // Reset stats on error
        setStats({
          totalBooks: 0,
          finishedBooks: 0,
          totalPagesRead: 0,
          currentlyReading: 0,
          readingStreak: 0,
        });
      }
    };

    fetchStats();
  }, [user, books]); // Re-fetch when books change to get updated stats

  // Route protection - redirect to landing if not authenticated
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/");
    }
  }, [loading, isAuthenticated, router]);

  // Show loading while checking auth or loading books
  if (loading || booksLoading) {
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

  const handleAddBookClick = () => {
    router.push('/add-books');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar - Fixed Position under header */}
      <Sidebar onAddBookClick={handleAddBookClick} />

      {/* Main Content - Adjusted for both fixed header and sidebar */}
      <main className="ml-64">
        <DashboardContent
          books={books}
          stats={stats}
          userId={user?.uid || ''}
          onEdit={handleEdit}
          onUpdateProgress={handleUpdateProgress}
          onBookClick={handleBookClick}
        />
      </main>
    </div>
  );
}
