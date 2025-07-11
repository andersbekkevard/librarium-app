"use client";

import * as React from "react";
import { useState } from "react";
import { useAuthContext } from "@/lib/providers/AuthProvider";
import { useBooksContext } from "@/lib/providers/BooksProvider";
import { Book } from "@/lib/models";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Star,
  BookOpen,
  Edit,
  ArrowLeft,
  Calendar,
  Hash,
  CheckCircle,
  Play,
  Clock,
  TrendingUp,
} from "lucide-react";

interface BookDetailPageProps {
  book: Book;
  onBack: () => void;
}

export const BookDetailPage: React.FC<BookDetailPageProps> = ({
  book,
  onBack,
}) => {
  const { user } = useAuthContext();
  const { updateBookProgress, updateBookRating, updateBookState, calculateBookProgress, error } = useBooksContext();
  const [isUpdating, setIsUpdating] = useState(false);
  const [currentPageInput, setCurrentPageInput] = useState(
    book.progress.currentPage?.toString() || ""
  );
  const [rating, setRating] = useState(book.rating || 0);
  const [hoverRating, setHoverRating] = useState(0);

  /**
   * Maps reading state to badge configuration
   *
   * Returns badge properties (label, variant, icon) for each reading state.
   * Used throughout the component for consistent state display.
   *
   * @param state - Book's current reading state
   * @returns object - Badge configuration with label, variant, and icon
   */
  const getReadingStateBadge = (state: Book["state"]) => {
    switch (state) {
      case "not_started":
        return {
          label: "Not Started",
          variant: "secondary" as const,
          icon: Clock,
        };
      case "in_progress":
        return {
          label: "Currently Reading",
          variant: "default" as const,
          icon: Play,
        };
      case "finished":
        return {
          label: "Finished",
          variant: "outline" as const,
          icon: CheckCircle,
        };
      default:
        return { label: "Unknown", variant: "secondary" as const, icon: Clock };
    }
  };

  /**
   * Handles progress update workflow
   *
   * Updates book progress using the service layer, which automatically handles 
   * state transitions and event logging.
   * Used by the progress update form in the UI.
   */
  const handleUpdateProgress = async () => {
    if (!user) return;

    setIsUpdating(true);
    try {
      const newPage = parseInt(currentPageInput) || 0;
      await updateBookProgress(book.id, newPage);
      
      // Firebase real-time listener will automatically update the UI
    } catch {
      // Error is handled by the BooksProvider
    } finally {
      setIsUpdating(false);
    }
  };

  /**
   * Handles user rating changes
   *
   * Updates the book's rating using the service layer, which automatically 
   * handles validation and event logging.
   * Only available for finished books. Used by the star rating component.
   *
   * @param newRating - New rating value (1-5)
   */
  const handleRatingChange = async (newRating: number) => {
    if (!user || book.state !== "finished") return;

    setRating(newRating);
    try {
      await updateBookRating(book.id, newRating);
    } catch {
      // Error is handled by the BooksProvider
    }
  };

  /**
   * Marks book as finished
   *
   * Transitions book state to 'finished' using the service layer, which automatically 
   * handles progress updates, event logging, and timestamp management.
   * Used by the "Mark as Finished" button.
   */
  const handleMarkAsFinished = async () => {
    if (!user) return;

    setIsUpdating(true);
    try {
      await updateBookState(book.id, "finished", book.state);
      // Firebase real-time listener will automatically update the UI
    } catch {
      // Error is handled by the BooksProvider
    } finally {
      setIsUpdating(false);
    }
  };

  const badgeInfo = getReadingStateBadge(book.state);
  const BadgeIcon = badgeInfo.icon;
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
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {/* Main content grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Book cover and basic info */}
          <div className="lg:col-span-1">
            <Card className="overflow-hidden">
              <CardContent className="p-6">
                {/* Cover image */}
                <div className="aspect-[2/3] w-full mb-4 rounded-lg overflow-hidden bg-muted">
                  {book.coverImage ? (
                    <img
                      src={book.coverImage}
                      alt={`${book.title} cover`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center">
                      <BookOpen className="h-16 w-16 text-muted-foreground mb-4" />
                      <p className="text-sm font-medium text-foreground mb-2">
                        {book.title}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        by {book.author}
                      </p>
                    </div>
                  )}
                </div>

                {/* Reading status badge */}
                <div className="flex items-center gap-2 mb-4">
                  <Badge
                    variant={badgeInfo.variant}
                    className="flex items-center gap-1"
                  >
                    <BadgeIcon className="h-3 w-3" />
                    {badgeInfo.label}
                  </Badge>
                  {book.isOwned && (
                    <Badge variant="outline" className="text-xs">
                      Owned
                    </Badge>
                  )}
                </div>

                {/* Progress bar for in-progress books */}
                {book.state === "in_progress" && (
                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">
                        {progress}% complete
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {book.progress.currentPage || 0} /{" "}
                        {book.progress.totalPages || "?"} pages
                      </span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className="bg-brand-primary h-2 rounded-full transition-all duration-300"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Star rating for finished books */}
                {book.state === "finished" && (
                  <div className="mb-4">
                    <Label className="text-sm font-medium mb-2 block">
                      Your Rating
                    </Label>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: 5 }, (_, i) => (
                        <Star
                          key={i}
                          className={`h-5 w-5 cursor-pointer transition-colors ${
                            i < (hoverRating || rating)
                              ? "fill-status-warning text-status-warning"
                              : "fill-muted text-muted hover:text-status-warning"
                          }`}
                          onMouseEnter={() => setHoverRating(i + 1)}
                          onMouseLeave={() => setHoverRating(0)}
                          onClick={() => handleRatingChange(i + 1)}
                        />
                      ))}
                      <span className="text-sm text-muted-foreground ml-2">
                        ({rating}/5)
                      </span>
                    </div>
                  </div>
                )}

                {/* Action buttons */}
                <div className="space-y-2">
                  {book.state === "not_started" && (
                    <Button
                      onClick={async () => {
                        if (!user) return;
                        setIsUpdating(true);
                        try {
                          // Use service layer for state transition and progress update
                          await updateBookState(book.id, "in_progress", book.state);
                          await updateBookProgress(book.id, 1);
                          setCurrentPageInput("1");

                          // Firebase real-time listener will automatically update the UI
                        } catch {
                          // Error is handled by the BooksProvider
                        } finally {
                          setIsUpdating(false);
                        }
                      }}
                      disabled={isUpdating}
                      className="w-full"
                    >
                      <Play className="h-4 w-4 mr-2" />
                      Start Reading
                    </Button>
                  )}

                  {book.state === "in_progress" && (
                    <Button
                      onClick={handleMarkAsFinished}
                      disabled={isUpdating}
                      className="w-full"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Mark as Finished
                    </Button>
                  )}

                  <Button variant="outline" className="w-full">
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Book
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Book details and progress */}
          <div className="lg:col-span-2 space-y-6">
            {/* Book information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">{book.title}</CardTitle>
                <p className="text-lg text-muted-foreground">
                  by {book.author}
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Book metadata */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {book.publishedDate && (
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">Published:</span>
                      <span className="text-muted-foreground">
                        {book.publishedDate}
                      </span>
                    </div>
                  )}
                  {book.isbn && (
                    <div className="flex items-center gap-2 text-sm">
                      <Hash className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">ISBN:</span>
                      <span className="text-muted-foreground">{book.isbn}</span>
                    </div>
                  )}
                  {book.progress.totalPages && (
                    <div className="flex items-center gap-2 text-sm">
                      <BookOpen className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">Pages:</span>
                      <span className="text-muted-foreground">
                        {book.progress.totalPages}
                      </span>
                    </div>
                  )}
                </div>

                {/* Description */}
                {book.description && (
                  <>
                    <Separator />
                    <div>
                      <h3 className="font-semibold mb-2">Description</h3>
                      <p className="text-muted-foreground text-sm leading-relaxed">
                        {book.description}
                      </p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Progress tracking */}
            {book.state === "in_progress" && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Update Progress
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-end gap-4">
                    <div className="flex-1">
                      <Label htmlFor="current-page">Current Page</Label>
                      <Input
                        id="current-page"
                        type="number"
                        value={currentPageInput}
                        onChange={(e) => setCurrentPageInput(e.target.value)}
                        min="0"
                        max={book.progress.totalPages || undefined}
                        className="mt-1"
                      />
                    </div>
                    <div className="flex-1">
                      <Label>Total Pages</Label>
                      <Input
                        value={book.progress.totalPages || ""}
                        disabled
                        className="mt-1"
                      />
                    </div>
                    <Button
                      onClick={handleUpdateProgress}
                      disabled={isUpdating}
                      className="px-6"
                    >
                      Update
                    </Button>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progress</span>
                      <span>{progress}%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className="bg-brand-primary h-2 rounded-full transition-all duration-300"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Reading timeline */}
            <Card>
              <CardHeader>
                <CardTitle>Reading Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="h-2 w-2 bg-brand-primary rounded-full mt-2"></div>
                    <div>
                      <p className="text-sm font-medium">Added to library</p>
                      <p className="text-xs text-muted-foreground">
                        {book.addedAt?.toDate?.()?.toLocaleDateString() ||
                          "Unknown"}
                      </p>
                    </div>
                  </div>

                  {book.startedAt && (
                    <div className="flex items-start gap-3">
                      <div className="h-2 w-2 bg-status-info rounded-full mt-2"></div>
                      <div>
                        <p className="text-sm font-medium">Started reading</p>
                        <p className="text-xs text-muted-foreground">
                          {book.startedAt?.toDate?.()?.toLocaleDateString() ||
                            "Unknown"}
                        </p>
                      </div>
                    </div>
                  )}

                  {book.finishedAt && (
                    <div className="flex items-start gap-3">
                      <div className="h-2 w-2 bg-status-success rounded-full mt-2"></div>
                      <div>
                        <p className="text-sm font-medium">Finished reading</p>
                        <p className="text-xs text-muted-foreground">
                          {book.finishedAt?.toDate?.()?.toLocaleDateString() ||
                            "Unknown"}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookDetailPage;
