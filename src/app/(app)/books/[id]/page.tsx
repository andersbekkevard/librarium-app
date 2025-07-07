"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Book } from "@/lib/models";
import { useAuthContext } from "@/lib/AuthProvider";
import { bookOperations } from "@/lib/firebase-utils";
import BookDetailPage from "@/components/app/BookDetailPage";

export default function BookDetailRoute() {
  const params = useParams();
  const router = useRouter();
  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user, isAuthenticated } = useAuthContext();

  const bookId = params.id as string;

  useEffect(() => {
    const fetchBook = async () => {
      if (!isAuthenticated || !user || !bookId) {
        setLoading(false);
        return;
      }

      try {
        const fetchedBook = await bookOperations.getBook(user.uid, bookId);
        if (fetchedBook) {
          setBook(fetchedBook);
        } else {
          setError("Book not found");
        }
      } catch (err) {
        console.error("Error fetching book:", err);
        setError("Failed to load book");
      } finally {
        setLoading(false);
      }
    };

    fetchBook();
  }, [isAuthenticated, user, bookId]);

  const handleBack = () => {
    router.back();
  };

  if (loading) {
    return (
      <div className="ml-64 p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-brand-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Loading book details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !book) {
    return (
      <div className="ml-64 p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-foreground mb-2">
              {error || "Book not found"}
            </h2>
            <p className="text-muted-foreground mb-4">
              The book you&apos;re looking for doesn&apos;t exist or you don&apos;t have access to it.
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
    );
  }

  return (
    <div className="ml-64">
      <BookDetailPage book={book} onBack={handleBack} />
    </div>
  );
}