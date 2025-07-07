import { BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import BookCard from "@/components/app/BookCard";
import { Book } from "@/lib/models";

interface CurrentlyReadingSectionProps {
  books: Book[];
  onEdit: (book: Book) => void;
  onUpdateProgress: (book: Book) => void;
  onBookClick: (bookId: string) => void;
  onViewAll?: () => void;
  maxBooks?: number;
}

export const CurrentlyReadingSection: React.FC<CurrentlyReadingSectionProps> = ({
  books,
  onEdit,
  onUpdateProgress,
  onBookClick,
  onViewAll,
  maxBooks = 4,
}) => {
  const currentlyReadingBooks = books
    .filter((book) => book.state === "in_progress")
    .slice(0, maxBooks);

  return (
    <div className="lg:col-span-2">
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-foreground">
            Currently Reading
          </h2>
          {onViewAll && (
            <Button
              variant="ghost"
              size="sm"
              className="text-brand-primary hover:text-brand-primary-hover"
              onClick={onViewAll}
            >
              View All
            </Button>
          )}
        </div>
        
        {currentlyReadingBooks.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            {currentlyReadingBooks.map((book) => (
              <BookCard
                key={book.id}
                book={book}
                onEdit={onEdit}
                onUpdateProgress={onUpdateProgress}
                onBookClick={onBookClick}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <BookOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <p className="text-muted-foreground">
              No books currently reading
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CurrentlyReadingSection;