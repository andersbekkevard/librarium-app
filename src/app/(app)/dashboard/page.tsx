"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import BookCard from "@/components/app/BookCard";
import { Book } from "@/lib/models";
import Sidebar from "@/components/app/Sidebar";
import AddBooksPage from "@/components/app/AddBooksPage";
import MyLibraryPage from "@/components/app/MyLibraryPage";
import BookDetailPage from "@/components/app/BookDetailPage";
import GoogleAuth from "@/components/app/GoogleAuth";
import { BookOpen, Star, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuthContext } from "@/components/auth/AuthProvider";
import { bookOperations } from "@/lib/firebase-utils";

export default function Dashboard() {
  const [activeSection, setActiveSection] = useState("dashboard");
  const [selectedBookId, setSelectedBookId] = useState<string | null>(null);
  const [books, setBooks] = useState<Book[]>([]);
  const [stats, setStats] = useState({
    totalBooks: 0,
    finishedBooks: 0,
    totalPagesRead: 0,
    currentlyReading: 0,
  });
  const [searchQuery] = useState("");
  const { loading, isAuthenticated, user } = useAuthContext();
  const router = useRouter();

  // Load user's books and stats
  useEffect(() => {
    if (!loading && isAuthenticated && user) {
      const unsubscribe = bookOperations.subscribeToUserBooks(
        user.uid,
        (userBooks) => {
          setBooks(userBooks);

          // Calculate stats
          const finishedBooks = userBooks.filter(
            (book) => book.state === "finished",
          );
          const totalPagesRead = finishedBooks.reduce(
            (total, book) => total + (book.progress.totalPages || 0),
            0,
          );
          const currentlyReading = userBooks.filter(
            (book) => book.state === "in_progress",
          );

          setStats({
            totalBooks: userBooks.length,
            finishedBooks: finishedBooks.length,
            totalPagesRead,
            currentlyReading: currentlyReading.length,
          });
        },
      );

      return unsubscribe;
    }
  }, [loading, isAuthenticated, user]);

  // Route protection - redirect to landing if not authenticated
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/");
    }
  }, [loading, isAuthenticated, router]);

  // Show loading while checking auth
  if (loading) {
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
    setSelectedBookId(bookId);
    setActiveSection("book-detail");
  };

  const handleBackFromBookDetail = () => {
    setSelectedBookId(null);
    setActiveSection("dashboard");
  };

  const handleSidebarItemClick = (itemId: string) => {
    setActiveSection(itemId);
    setSelectedBookId(null);
    console.log("Sidebar item clicked:", itemId);
  };

  const handleAddBookClick = () => {
    setActiveSection("add-books");
    setSelectedBookId(null);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar - Fixed Position under header */}
      <Sidebar
        activeItem={activeSection}
        onItemClick={handleSidebarItemClick}
        onAddBookClick={handleAddBookClick}
      />

      {/* Main Content - Adjusted for both fixed header and sidebar */}
      <main className="ml-64">
        {activeSection === "add-books" ? (
          <AddBooksPage />
        ) : activeSection === "library" ? (
          <MyLibraryPage searchQuery={searchQuery} onBookClick={handleBookClick} />
        ) : activeSection === "book-detail" && selectedBookId ? (
          (() => {
            const selectedBook = books.find(book => book.id === selectedBookId);
            return selectedBook ? (
              <BookDetailPage book={selectedBook} onBack={handleBackFromBookDetail} />
            ) : (
              <div className="p-6">
                <p>Book not found</p>
              </div>
            );
          })()
        ) : activeSection === "auth-demo" ? (
          <div className="p-6">
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-foreground mb-2">
                Firebase Authentication Demo
              </h1>
              <p className="text-muted-foreground">
                Test Google authentication with Firebase popup.
              </p>
            </div>
            <GoogleAuth />
          </div>
        ) : (
          <div className="p-6">
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-foreground mb-2">
                Dashboard
              </h1>
              <p className="text-muted-foreground">
                Welcome back! Here&apos;s your reading overview.
              </p>
            </div>

            {/* Bento Box Dashboard Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
              {/* Quick Stats Row */}
              <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Total Books */}
                <div className="bg-card border border-border rounded-lg p-6 hover:shadow-sm transition-shadow">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Total Books
                      </p>
                      <p className="text-2xl font-bold text-foreground">
                        {stats.totalBooks}
                      </p>
                    </div>
                    <div className="h-8 w-8 bg-brand-primary/10 rounded-full flex items-center justify-center">
                      <BookOpen className="h-4 w-4 text-brand-primary" />
                    </div>
                  </div>
                </div>

                {/* Books Read This Year */}
                <div className="bg-card border border-border rounded-lg p-6 hover:shadow-sm transition-shadow">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Read This Year
                      </p>
                      <p className="text-2xl font-bold text-foreground">
                        {stats.finishedBooks}
                      </p>
                    </div>
                    <div className="h-8 w-8 bg-status-success/10 rounded-full flex items-center justify-center">
                      <Star className="h-4 w-4 text-status-success fill-current" />
                    </div>
                  </div>
                </div>

                {/* Pages Read This Month */}
                <div className="bg-card border border-border rounded-lg p-6 hover:shadow-sm transition-shadow">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Pages This Month
                      </p>
                      <p className="text-2xl font-bold text-foreground">
                        {stats.totalPagesRead.toLocaleString()}
                      </p>
                    </div>
                    <div className="h-8 w-8 bg-brand-accent/10 rounded-full flex items-center justify-center">
                      <BookOpen className="h-4 w-4 text-brand-accent" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Reading Streak */}
              <div className="bg-gradient-to-br from-brand-primary to-brand-accent rounded-lg p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-white/80">
                      Reading Streak
                    </p>
                    <p className="text-2xl font-bold text-white">12 days</p>
                    <p className="text-sm text-white/60 mt-1">Keep it up!</p>
                  </div>
                  <div className="h-12 w-12 bg-white/10 rounded-full flex items-center justify-center">
                    <div className="h-6 w-6 bg-white/20 rounded-full flex items-center justify-center">
                      <div className="h-3 w-3 bg-white rounded-full"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Currently Reading Books - Takes up 2 columns */}
              <div className="lg:col-span-2">
                <div className="bg-card border border-border rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-foreground">
                      Currently Reading
                    </h2>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-brand-primary hover:text-brand-primary-hover"
                    >
                      View All
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {books
                      .filter((book) => book.state === "in_progress")
                      .slice(0, 6)
                      .map((book) => (
                        <BookCard
                          key={book.id}
                          book={book}
                          onEdit={handleEdit}
                          onUpdateProgress={handleUpdateProgress}
                          onBookClick={handleBookClick}
                        />
                      ))}
                  </div>
                  {books.filter((book) => book.state === "in_progress")
                    .length === 0 && (
                    <div className="text-center py-8">
                      <BookOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                      <p className="text-muted-foreground">
                        No books currently reading
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Recent Activity - Takes up 1 column */}
              <div className="lg:col-span-1">
                <div className="bg-card border border-border rounded-lg p-6">
                  <h2 className="text-lg font-semibold text-foreground mb-4">
                    Recent Activity
                  </h2>
                  <div className="space-y-4">
                    {/* Activity Items */}
                    <div className="flex items-start space-x-3">
                      <div className="h-2 w-2 bg-status-success rounded-full mt-2"></div>
                      <div className="flex-1">
                        <p className="text-sm text-foreground">
                          Finished reading{" "}
                          <span className="font-medium">The Great Gatsby</span>
                        </p>
                        <p className="text-xs text-muted-foreground">
                          2 hours ago
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3">
                      <div className="h-2 w-2 bg-brand-primary rounded-full mt-2"></div>
                      <div className="flex-1">
                        <p className="text-sm text-foreground">
                          Started reading{" "}
                          <span className="font-medium">
                            The Catcher in the Rye
                          </span>
                        </p>
                        <p className="text-xs text-muted-foreground">
                          1 day ago
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3">
                      <div className="h-2 w-2 bg-status-warning rounded-full mt-2"></div>
                      <div className="flex-1">
                        <p className="text-sm text-foreground">
                          Rated{" "}
                          <span className="font-medium">
                            Pride and Prejudice
                          </span>{" "}
                          5 stars
                        </p>
                        <p className="text-xs text-muted-foreground">
                          3 days ago
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3">
                      <div className="h-2 w-2 bg-brand-accent rounded-full mt-2"></div>
                      <div className="flex-1">
                        <p className="text-sm text-foreground">
                          Added <span className="font-medium">1984</span> to
                          library
                        </p>
                        <p className="text-xs text-muted-foreground">
                          5 days ago
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3">
                      <div className="h-2 w-2 bg-status-info rounded-full mt-2"></div>
                      <div className="flex-1">
                        <p className="text-sm text-foreground">
                          Updated progress on{" "}
                          <span className="font-medium">
                            To Kill a Mockingbird
                          </span>
                        </p>
                        <p className="text-xs text-muted-foreground">
                          1 week ago
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Recently Read Section */}
            <div className="mt-8">
              <div className="bg-card border border-border rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-foreground">
                    Recently Read
                  </h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-brand-primary hover:text-brand-primary-hover"
                  >
                    View All
                  </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {books
                    .filter((book) => book.state === "finished")
                    .slice(0, 8)
                    .map((book) => (
                      <BookCard
                        key={book.id}
                        book={book}
                        onEdit={handleEdit}
                        onUpdateProgress={handleUpdateProgress}
                        onBookClick={handleBookClick}
                      />
                    ))}
                </div>
                {books.filter((book) => book.state === "finished").length ===
                  0 && (
                  <div className="text-center py-8">
                    <BookOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                    <p className="text-muted-foreground">
                      No books finished yet
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
