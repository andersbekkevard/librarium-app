"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Book } from "@/lib/models";
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
  });
  const { loading, isAuthenticated, user } = useAuthContext();
  const { books, loading: booksLoading } = useBooksContext();
  const router = useRouter();

  // Calculate stats when books change
  useEffect(() => {
    if (books.length > 0) {
      const finishedBooks = books.filter(
        (book) => book.state === "finished"
      );
      const totalPagesRead = finishedBooks.reduce(
        (total, book) => total + (book.progress.totalPages || 0),
        0
      );
      const currentlyReading = books.filter(
        (book) => book.state === "in_progress"
      );

      setStats({
        totalBooks: books.length,
        finishedBooks: finishedBooks.length,
        totalPagesRead,
        currentlyReading: currentlyReading.length,
      });
    } else {
      // Reset stats when no books
      setStats({
        totalBooks: 0,
        finishedBooks: 0,
        totalPagesRead: 0,
        currentlyReading: 0,
      });
    }
  }, [books]);

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
          onEdit={handleEdit}
          onUpdateProgress={handleUpdateProgress}
          onBookClick={handleBookClick}
          streakDays={12}
        />
      </main>
    </div>
  );
}
