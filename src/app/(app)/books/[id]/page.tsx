"use client";

import BookDetailPage from "@/components/app/BookDetailPage";
import Sidebar from "@/components/app/Sidebar";
import { Button } from "@/components/ui/button";
import { Book } from "@/lib/models";
import { useAuthContext } from "@/lib/providers/AuthProvider";
import { useBooksContext } from "@/lib/providers/BooksProvider";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function BookDetailRoute() {
  const params = useParams();
  const router = useRouter();
  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user, isAuthenticated } = useAuthContext();
  const { books, loading: booksLoading, getBook } = useBooksContext();

  const bookId = params.id as string;

  useEffect(() => {
    if (!isAuthenticated || !user || !bookId) {
      setLoading(false);
      return;
    }

    // Wait for BooksProvider to finish loading before determining if book exists
    if (booksLoading) {
      setLoading(true);
      return;
    }

    // Find book from the books context
    const foundBook = books.find((b) => b.id === bookId);
    if (foundBook) {
      setBook(foundBook);
      setError(null);
      setLoading(false);
    } else {
      // Fallback: try to fetch the book directly if not found in the books array
      // This handles cases where the book exists but isn't in the cached books array yet
      const fetchBook = async () => {
        setLoading(true);
        try {
          const fetchedBook = await getBook(bookId);
          if (fetchedBook) {
            setBook(fetchedBook);
            setError(null);
          } else {
            setError("Book not found");
            setBook(null);
          }
        } catch {
          setError("Failed to load book");
          setBook(null);
        } finally {
          setLoading(false);
        }
      };
      
      fetchBook();
    }
  }, [isAuthenticated, user, bookId, books, booksLoading, getBook]);

  const handleBack = () => {
    router.back();
  };

  const handleAddBookClick = () => {
    router.push("/add-books");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Sidebar onAddBookClick={handleAddBookClick} />
        <div className="ml-64 p-6">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin text-brand-primary mx-auto mb-4" />
              <p className="text-muted-foreground">Loading book details...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !book) {
    return (
      <div className="min-h-screen bg-background">
        <Sidebar onAddBookClick={handleAddBookClick} />
        <div className="ml-64 p-6">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <h2 className="text-xl font-semibold text-foreground mb-2">
                {error || "Book not found"}
              </h2>
              <p className="text-muted-foreground mb-4">
                The book you&apos;re looking for doesn&apos;t exist or you
                don&apos;t have access to it.
              </p>
              <Button
                onClick={handleBack}
                variant="outline"
                className="border-brand-primary text-brand-primary hover:bg-brand-primary/10"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Go Back
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Sidebar onAddBookClick={handleAddBookClick} />
      <div className="ml-64">
        <BookDetailPage book={book} onBack={handleBack} />
      </div>
    </div>
  );
}
