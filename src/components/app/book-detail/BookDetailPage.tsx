"use client";

import { Button } from "@/components/ui/button";
import { STATUS_COLORS } from "@/lib/design/colors";
import { Book } from "@/lib/models/models";
import { useAuthContext } from "@/lib/providers/AuthProvider";
import { useBooksContext } from "@/lib/providers/BooksProvider";
import { useEventsContext } from "@/lib/providers/EventsProvider";
import { ArrowLeftIcon } from "@phosphor-icons/react";
import * as React from "react";
import { useState } from "react";
import { EditBookSheet } from "../books/EditBookSheet";

// Extracted components
import { BookCover } from "./BookCover";
import { BookInfo } from "./BookInfo";
import { ProgressTracker } from "./ProgressTracker";
import { ReadingTimeline } from "./ReadingTimeline";
import { CommentsSection } from "./comments/CommentsSection";
import { ReviewDialog } from "./reviews/ReviewDialog";
import { ReviewSection } from "./reviews/ReviewSection";

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
  const { addReview, updateReview, getBookReview, reviewsLoading } =
    useEventsContext();
  const [isUpdating, setIsUpdating] = useState(false);
  const [isEditSheetOpen, setIsEditSheetOpen] = useState(false);
  const [isAddReviewDialogOpen, setIsAddReviewDialogOpen] = useState(false);
  const [reviewRefreshKey, setReviewRefreshKey] = useState(0);

  // Get current review for the book
  const currentReview = getBookReview(book.id);

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

  const handleAddReview = async (bookId: string, reviewText: string) => {
    await addReview(bookId, reviewText);
    setReviewRefreshKey((prev) => prev + 1);
  };

  const handleUpdateReview = async (bookId: string, reviewText: string) => {
    await updateReview(bookId, reviewText);
    setReviewRefreshKey((prev) => prev + 1);
  };

  const handleAddReviewClick = () => {
    setIsAddReviewDialogOpen(true);
  };

  const handleReviewDialogClose = () => {
    setIsAddReviewDialogOpen(false);
  };

  const handleReviewSaved = () => {
    setIsAddReviewDialogOpen(false);
    setReviewRefreshKey((prev) => prev + 1);
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
            className="flex items-center gap-2 text-sm"
          >
            <ArrowLeftIcon className="h-4 w-4" weight="light" />
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
          {/* Left column: Book cover and reading timeline */}
          <div className="lg:col-span-1 space-y-6">
            <BookCover
              book={book}
              progress={progress}
              onStartReading={handleStartReading}
              onMarkAsFinished={handleMarkAsFinished}
              onEditBook={() => setIsEditSheetOpen(true)}
              onRatingChange={handleRatingChange}
              onAddReview={handleAddReviewClick}
              hasExistingReview={!!currentReview}
              isUpdating={isUpdating}
            />

            <ReadingTimeline book={book} />
          </div>

          {/* Right column: Book details, progress, review, and comments */}
          <div className="lg:col-span-2 space-y-6">
            <BookInfo book={book} />

            <ProgressTracker
              book={book}
              progress={progress}
              onUpdateProgress={handleUpdateProgress}
              isUpdating={isUpdating}
            />

            {/* Review Section - only shows when review exists */}
            <ReviewSection
              key={reviewRefreshKey}
              book={book}
              review={currentReview}
              onAddReview={handleAddReview}
              onUpdateReview={handleUpdateReview}
              onReviewUpdated={() => setReviewRefreshKey((prev) => prev + 1)}
              isLoading={reviewsLoading}
              error={error?.userMessage || null}
            />

            <CommentsSection book={book} />
          </div>
        </div>
      </div>

      {/* Edit Book Sheet */}
      <EditBookSheet
        book={book}
        open={isEditSheetOpen}
        onOpenChange={setIsEditSheetOpen}
        onBookDeleted={onBack}
      />

      {/* Add Review Dialog */}
      <ReviewDialog
        book={book}
        open={isAddReviewDialogOpen}
        onOpenChange={handleReviewDialogClose}
        onReviewSaved={handleReviewSaved}
        onAddReview={handleAddReview}
        onUpdateReview={handleUpdateReview}
        isSubmitting={reviewsLoading}
      />
    </div>
  );
};

export default BookDetailPage;
