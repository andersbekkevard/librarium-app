"use client";

import BookCard from "@/components/app/books/BookCard";
import { Button } from "@/components/ui/button";
import { Book } from "@/lib/models/models";
import { ArrowRightIcon, BookOpenIcon } from "@phosphor-icons/react";

interface BookSectionProps {
  books: Book[];
  title: string;
  emptyStateMessage: string;
  filterFunction: (book: Book) => boolean;
  onBookClick: (bookId: string) => void;
  onViewAll?: () => void;
  maxBooks?: number;
  className?: string;
  gridClassName?: string;
}

export const BookSection: React.FC<BookSectionProps> = ({
  books,
  title,
  emptyStateMessage,
  filterFunction,
  onBookClick,
  onViewAll,
  maxBooks,
  className = "",
  gridClassName = "grid grid-cols-1 md:grid-cols-2 gap-4",
}) => {
  const filteredBooks = books.filter(filterFunction).slice(0, maxBooks);

  return (
    <div className={className}>
      <div className="bg-card border border-border rounded-lg p-5 h-full">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-foreground">{title}</h3>
          {onViewAll && filteredBooks.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-foreground flex items-center gap-1.5"
              onClick={onViewAll}
            >
              View All
              <ArrowRightIcon className="h-3.5 w-3.5" weight="light" />
            </Button>
          )}
        </div>

        {/* Content */}
        {filteredBooks.length > 0 ? (
          <div className={gridClassName}>
            {filteredBooks.map((book) => (
              <BookCard key={book.id} book={book} onBookClick={onBookClick} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-3">
              <BookOpenIcon
                className="h-6 w-6 text-muted-foreground"
                weight="light"
              />
            </div>
            <p className="text-sm text-muted-foreground">{emptyStateMessage}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookSection;
