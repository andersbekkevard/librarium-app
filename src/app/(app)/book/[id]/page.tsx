"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuthContext } from "@/components/auth/AuthProvider";
import { BookDetailPage } from "@/components/app/BookDetailPage";
import { Book } from "@/lib/models";
import { bookOperations } from "@/lib/firebase-utils";
import { Loader2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function BookPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user, loading: authLoading } = useAuthContext();
  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/");
      return;
    }

    if (user && id) {
      const loadBook = async () => {
        try {
          setLoading(true);
          const bookData = await bookOperations.getBook(user.uid, id as string);
          if (bookData) {
            setBook(bookData);
          } else {
            setError("Book not found");
          }
        } catch (err) {
          console.error("Error loading book:", err);
          setError("Failed to load book");
        } finally {
          setLoading(false);
        }
      };

      loadBook();
    }
  }, [user, id, authLoading, router]);

  const handleBack = () => {
    router.back();
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-brand-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading book...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-2">Error</h1>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={handleBack} variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-2">Book Not Found</h1>
          <p className="text-muted-foreground mb-4">The book you're looking for doesn't exist.</p>
          <Button onClick={handleBack} variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return <BookDetailPage book={book} onBack={handleBack} />;
}