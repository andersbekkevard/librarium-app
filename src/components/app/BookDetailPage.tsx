"use client";

import { Button } from "@/components/ui/button";
import { STATUS_COLORS } from "@/lib/design/colors";
import { Book } from "@/lib/models/models";
import { useAuthContext } from "@/lib/providers/AuthProvider";
import { useBooksContext } from "@/lib/providers/BooksProvider";
import { ArrowLeft } from "lucide-react";
import * as React from "react";
import { useState } from "react";
import { EditBookSheet } from "./EditBookSheet";

// Extracted components
import { BookCover } from "./book-detail/BookCover";
import { BookInfo } from "./book-detail/BookInfo";
import { ProgressTracker } from "./book-detail/ProgressTracker";
import { ReadingTimeline } from "./book-detail/ReadingTimeline";

interface BookDetailPageProps {
  book: Book;
  onBack: () => void;
}

export const BookDetailPage: React.FC<BookDetailPageProps> = ({
  book,
  onBack,
}) => {
  const { user } = useAuthContext();
  const {
    updateBookProgress,
    updateBookRating,
    updateBookState,
    calculateBookProgress,
    error,
  } = useBooksContext();
  const [isUpdating, setIsUpdating] = useState(false);
  const [isEditSheetOpen, setIsEditSheetOpen] = useState(false);

  const handleUpdateProgress = async (currentPage: number) => {
    if (!user) return;
    setIsUpdating(true);
    try {
      await updateBookProgress(book.id, currentPage);
    } catch (error) {
      // Error is handled by the BooksProvider, but log locally for debugging
      console.error("Error updating book progress:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRatingChange = async (newRating: number) => {
    if (!user || book.state !== "finished") return;
    try {
      await updateBookRating(book.id, newRating);
    } catch (error) {
      // Error is handled by the BooksProvider, but log locally for debugging
      console.error("Error updating book rating:", error);
    }
  };

  const handleMarkAsFinished = async () => {
    if (!user) return;
    setIsUpdating(true);
    try {
      await updateBookState(book.id, "finished", book.state);
    } catch (error) {
      // Error is handled by the BooksProvider, but log locally for debugging
      console.error("Error marking book as finished:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleStartReading = async () => {
    if (!user) return;
    setIsUpdating(true);
    try {
      await updateBookState(book.id, "in_progress", book.state);
      await updateBookProgress(book.id, 1);
    } catch (error) {
      // Error is handled by the BooksProvider, but log locally for debugging
      console.error("Error starting to read book:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  const progress = calculateBookProgress(book);

  return (
    <div className="p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header with back button */}
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Library
          </Button>
        </div>

        {/* Error display */}
        {error && (
          <div
            className={`mb-6 p-4 ${STATUS_COLORS.error.bgLight} ${STATUS_COLORS.error.borderLight} rounded-lg`}
          >
            <p className={`${STATUS_COLORS.error.text} text-sm`}>
              {error.userMessage}
            </p>
          </div>
        )}

        {/* Main content grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Book cover and basic info */}
          <div className="lg:col-span-1">
            <BookCover
              book={book}
              progress={progress}
              onStartReading={handleStartReading}
              onMarkAsFinished={handleMarkAsFinished}
              onEditBook={() => setIsEditSheetOpen(true)}
              onRatingChange={handleRatingChange}
              isUpdating={isUpdating}
            />
          </div>

          {/* Book details and progress */}
          <div className="lg:col-span-2 space-y-6">
            <BookInfo book={book} />

            <ProgressTracker
              book={book}
              progress={progress}
              onUpdateProgress={handleUpdateProgress}
              isUpdating={isUpdating}
            />

            <ReadingTimeline book={book} />
          </div>
        </div>
      </div>

      {/* Edit Book Sheet */}
      <EditBookSheet
        book={book}
        open={isEditSheetOpen}
        onOpenChange={setIsEditSheetOpen}
      />
    </div>
  );
};

export default BookDetailPage;
