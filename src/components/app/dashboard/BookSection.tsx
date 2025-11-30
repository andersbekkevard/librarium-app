import BookCard from "@/components/app/books/BookCard";
import { Button } from "@/components/ui/button";
import { BRAND_COLORS } from "@/lib/design/colors";
import { Book } from "@/lib/models/models";
import { BookOpen } from "lucide-react";

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
  gridClassName = "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-3",
}) => {
  const filteredBooks = books.filter(filterFunction).slice(0, maxBooks);

  return (
    <div className={className}>
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg text-foreground">{title}</h2>
          {onViewAll && (
            <Button
              variant="ghost"
              size="sm"
              className={`${BRAND_COLORS.primary.text} hover:${BRAND_COLORS.primary.text}`}
              onClick={onViewAll}
            >
              View All
            </Button>
          )}
        </div>

        {filteredBooks.length > 0 ? (
          <div className={gridClassName}>
            {filteredBooks.map((book) => (
              <BookCard key={book.id} book={book} onBookClick={onBookClick} />
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <BookOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <p className="text-muted-foreground">{emptyStateMessage}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookSection;
