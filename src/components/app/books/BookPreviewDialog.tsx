"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogOverlay,
  DialogPortal,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { cn } from "@/lib/utils/utils";
import { X } from "lucide-react";
import {
  GoogleBooksVolume,
  formatAuthors,
  getBestThumbnail,
} from "@/lib/api/google-books-api";
import {
  BookOpen,
  Building,
  Calendar,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Hash,
  Plus,
  Star,
  Tag,
} from "lucide-react";
import Image from "next/image";
import * as React from "react";
import { useEffect, useState } from "react";

interface BookPreviewDialogProps {
  book: GoogleBooksVolume | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddBook?: (book: GoogleBooksVolume) => void;
  isAdding?: boolean;
  isAdded?: boolean;
  clickPosition?: { x: number; y: number } | null;
}

export const BookPreviewDialog: React.FC<BookPreviewDialogProps> = ({
  book,
  open,
  onOpenChange,
  onAddBook,
  isAdding = false,
  isAdded = false,
  clickPosition,
}) => {
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);

  // Reset description expansion when book changes
  useEffect(() => {
    setIsDescriptionExpanded(false);
  }, [book]);

  // Calculate animation styles from click position
  const getAnimationStyles = () => {
    if (clickPosition && open) {
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      
      // Convert click position to CSS custom properties for animation
      const originX = (clickPosition.x / viewportWidth) * 100;
      const originY = (clickPosition.y / viewportHeight) * 100;
      
      return {
        '--origin-x': `${originX}%`,
        '--origin-y': `${originY}%`,
        transformOrigin: `${originX}% ${originY}%`,
      } as React.CSSProperties;
    }
    return {};
  };

  const handleAddBook = React.useCallback(() => {
    if (onAddBook && book) {
      onAddBook(book);
    }
  }, [onAddBook, book]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!open) return;

      switch (event.key) {
        case "Escape":
          onOpenChange(false);
          break;
        case "a":
        case "A":
          if (event.ctrlKey || event.metaKey) {
            event.preventDefault();
            if (onAddBook && book && !isAdded && !isAdding) {
              handleAddBook();
            }
          }
          break;
      }
    };

    if (open) {
      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
    }
  }, [open, onAddBook, book, isAdded, isAdding, onOpenChange, handleAddBook]);

  if (!book) return null;

  const toggleDescription = () => {
    setIsDescriptionExpanded(!isDescriptionExpanded);
  };

  const coverImage = getBestThumbnail(book);
  const authors = formatAuthors(book.volumeInfo.authors);
  const publishedYear = book.volumeInfo.publishedDate
    ? new Date(book.volumeInfo.publishedDate).getFullYear()
    : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogPortal>
        <DialogOverlay />
        <DialogPrimitive.Content
          className={cn(
            "fixed left-[50%] top-[15%] z-50 grid w-full max-w-4xl translate-x-[-50%] translate-y-0 gap-4 border bg-background p-6 shadow-lg duration-200",
            "data-[state=open]:animate-in data-[state=closed]:animate-out",
            "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
            "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
            "sm:rounded-lg overflow-hidden max-h-[85vh]"
          )}
          style={getAnimationStyles()}
        >
        <DialogHeader className="sr-only">
          <DialogTitle>Book Preview</DialogTitle>
        </DialogHeader>

        <div className="overflow-y-auto max-h-[80vh] p-0">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-4 pt-0">
            {/* Book Cover */}
            <div className="lg:col-span-1">
              <div className="sticky top-0">
                <Card>
                  <CardContent className="p-4 sm:p-6">
                    <div className="space-y-4">
                      {/* Cover Image */}
                      <div className="w-full aspect-[2/3] bg-muted rounded-lg flex items-center justify-center mx-auto max-w-[200px] lg:max-w-none relative overflow-hidden">
                        {coverImage ? (
                          <Image
                            src={coverImage}
                            alt={book.volumeInfo.title}
                            fill
                            className="object-cover"
                            sizes="(max-width: 1024px) 200px, 100vw"
                          />
                        ) : (
                          <BookOpen className="h-16 w-16 text-muted-foreground" />
                        )}
                      </div>

                      {/* Rating */}
                      {book.volumeInfo.averageRating && (
                        <div className="flex items-center justify-center gap-1">
                          <Star className="h-4 w-4 fill-status-warning text-status-warning" />
                          <span className="text-sm font-medium">
                            {book.volumeInfo.averageRating}
                          </span>
                          {book.volumeInfo.ratingsCount && (
                            <span className="text-xs text-muted-foreground">
                              ({book.volumeInfo.ratingsCount} reviews)
                            </span>
                          )}
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="space-y-2">
                        {onAddBook && (
                          <Button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAddBook();
                            }}
                            disabled={isAdding || isAdded}
                            className="w-full"
                            title="Add to Library (Ctrl+A)"
                          >
                            {isAdded ? (
                              <>
                                <BookOpen className="h-4 w-4 mr-2" />
                                Added to Library
                              </>
                            ) : isAdding ? (
                              <>
                                <Plus className="h-4 w-4 mr-2 animate-spin" />
                                Adding...
                              </>
                            ) : (
                              <>
                                <Plus className="h-4 w-4 mr-2" />
                                Add to Library
                              </>
                            )}
                          </Button>
                        )}

                        {/* External Links */}
                        <div className="space-y-2">
                          {book.volumeInfo.previewLink && (
                            <Button
                              variant="outline"
                              className="w-full"
                              onClick={() =>
                                window.open(
                                  book.volumeInfo.previewLink,
                                  "_blank"
                                )
                              }
                            >
                              <ExternalLink className="h-4 w-4 mr-2" />
                              Preview on Google
                            </Button>
                          )}
                          {book.volumeInfo.infoLink && (
                            <Button
                              variant="outline"
                              className="w-full"
                              onClick={() =>
                                window.open(book.volumeInfo.infoLink, "_blank")
                              }
                            >
                              <ExternalLink className="h-4 w-4 mr-2" />
                              More Info
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Book Details */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl sm:text-2xl">
                    {book.volumeInfo.title}
                  </CardTitle>
                  {book.volumeInfo.subtitle && (
                    <p className="text-base sm:text-lg text-muted-foreground">
                      {book.volumeInfo.subtitle}
                    </p>
                  )}
                  <p className="text-base sm:text-lg text-muted-foreground">
                    by {authors}
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Book Metadata */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {publishedYear && (
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">Published:</span>
                        <span className="text-muted-foreground">
                          {publishedYear}
                        </span>
                      </div>
                    )}
                    {book.volumeInfo.publisher && (
                      <div className="flex items-center gap-2 text-sm">
                        <Building className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">Publisher:</span>
                        <span className="text-muted-foreground">
                          {book.volumeInfo.publisher}
                        </span>
                      </div>
                    )}
                    {book.volumeInfo.pageCount && (
                      <div className="flex items-center gap-2 text-sm">
                        <BookOpen className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">Pages:</span>
                        <span className="text-muted-foreground">
                          {book.volumeInfo.pageCount}
                        </span>
                      </div>
                    )}
                    {book.volumeInfo.industryIdentifiers && (
                      <div className="flex items-center gap-2 text-sm">
                        <Hash className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">ISBN:</span>
                        <span className="text-muted-foreground">
                          {book.volumeInfo.industryIdentifiers[0]?.identifier}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Categories */}
                  {book.volumeInfo.categories && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <Tag className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">Categories:</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {book.volumeInfo.categories.map((category) => (
                          <Badge key={category} variant="secondary">
                            {category}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Description */}
                  {book.volumeInfo.description && (
                    <>
                      <Separator />
                      <div className="space-y-3">
                        <h3 className="text-lg font-semibold">Description</h3>
                        <div className="space-y-2">
                          <div
                            className={`text-muted-foreground text-sm leading-relaxed ${
                              isDescriptionExpanded ? "" : "line-clamp-6"
                            }`}
                            dangerouslySetInnerHTML={{
                              __html: book.volumeInfo.description,
                            }}
                          />
                          {book.volumeInfo.description.length > 300 && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={toggleDescription}
                              className="text-brand-primary hover:text-brand-primary/80 p-0 h-auto font-medium"
                            >
                              {isDescriptionExpanded ? (
                                <>
                                  <ChevronUp className="h-4 w-4 mr-1" />
                                  Read less
                                </>
                              ) : (
                                <>
                                  <ChevronDown className="h-4 w-4 mr-1" />
                                  Read more
                                </>
                              )}
                            </Button>
                          )}
                        </div>
                      </div>
                    </>
                  )}

                  {/* Additional Reading Information */}
                  {book.volumeInfo.readingModes && (
                    <>
                      <Separator />
                      <div className="space-y-2">
                        <h3 className="text-lg font-semibold">
                          Reading Options
                        </h3>
                        <div className="flex gap-4 text-sm">
                          {book.volumeInfo.readingModes.text && (
                            <span className="flex items-center gap-1">
                              <BookOpen className="h-3 w-3" />
                              Text available
                            </span>
                          )}
                          {book.volumeInfo.readingModes.image && (
                            <span className="flex items-center gap-1">
                              <BookOpen className="h-3 w-3" />
                              Image available
                            </span>
                          )}
                        </div>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
        <DialogPrimitive.Close className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </DialogPrimitive.Close>
        </DialogPrimitive.Content>
      </DialogPortal>
    </Dialog>
  );
};

export default BookPreviewDialog;
