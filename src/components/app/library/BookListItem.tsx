"use client";

import {
  BookOpen,
  User,
} from "lucide-react";
import * as React from "react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { StarRating } from "@/components/ui/star-rating";
import { ReadingStateBadge } from "@/components/ui/reading-state-badge";
import { Book } from "@/lib/models";
import { bookService } from "@/lib/services/BookService";

interface BookListItemProps {
  book: Book;
  onBookClick?: (bookId: string) => void;
}

export const BookListItem: React.FC<BookListItemProps> = ({
  book,
  onBookClick,
}) => {

  const handleCardClick = () => {
    if (onBookClick) {
      onBookClick(book.id);
    }
  };


  return (
    <Card
      className="w-full cursor-pointer transition-all duration-200 hover:shadow-md hover:border-brand-primary/20"
      onClick={handleCardClick}
    >
      <CardContent className="p-0">
        <div className="flex gap-4 items-center">
          {/* Cover Image */}
          <div className="flex-shrink-0 pl-3">
            <div className="w-20 h-28 bg-muted rounded flex items-center justify-center border border-border/20 shadow-sm">
              {book.coverImage ? (
                <img
                  src={book.coverImage}
                  alt={`${book.title} cover`}
                  className="w-full h-full object-cover rounded"
                />
              ) : (
                <BookOpen className="h-8 w-8 text-muted-foreground" />
              )}
            </div>
          </div>

          {/* Book Details */}
          <div className="flex-1 grid grid-cols-1 md:grid-cols-6 gap-4 items-center">
            <div className="md:col-span-2">
              <h3 className="font-semibold text-foreground truncate">
                {book.title}
              </h3>
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <User className="h-3 w-3" />
                {book.author}
              </p>
            </div>

            <div className="text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <BookOpen className="h-3 w-3" />
                {book.progress.totalPages || "?"} pages
              </span>
            </div>

            <div>
              {book.isOwned ? (
                <Badge variant="outline" className="text-xs">
                  Owned
                </Badge>
              ) : (
                <Badge variant="secondary" className="text-xs">
                  Wishlist
                </Badge>
              )}
            </div>

            <div className="flex items-center justify-center">
              <ReadingStateBadge state={book.state} />
            </div>

            <div className="flex items-center justify-between">
              {/* Rating or Progress */}
              <div className="flex items-center gap-1">
                {book.state === "finished" && book.rating ? (
                  <StarRating 
                    rating={book.rating} 
                    size="sm" 
                    showText={false}
                    className="gap-0.5"
                  />
                ) : book.state === "in_progress" ? (
                  <div className="text-xs text-muted-foreground">
                    {bookService.calculateProgress(book)}% complete
                  </div>
                ) : (
                  <div className="text-xs text-muted-foreground">
                    Not started
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default BookListItem;