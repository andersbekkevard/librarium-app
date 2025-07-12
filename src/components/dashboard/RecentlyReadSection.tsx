import { BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import BookCard from "@/components/app/BookCard";
import { Book } from "@/lib/models";
import { UI_CONFIG } from "@/lib/constants";

interface RecentlyReadSectionProps {
  books: Book[];
  onEdit: (book: Book) => void;
  onUpdateProgress: (book: Book) => void;
  onBookClick: (bookId: string) => void;
  onViewAll?: () => void;
  maxBooks?: number;
}

export const RecentlyReadSection: React.FC<RecentlyReadSectionProps> = ({
  books,
  onEdit,
  onUpdateProgress,
  onBookClick,
  onViewAll,
  maxBooks = UI_CONFIG.DASHBOARD.RECENTLY_READ_LIMIT,
}) => {
  const finishedBooks = books
    .filter((book) => book.state === "finished")
    .slice(0, maxBooks);

  return (
    <div className="mt-8">
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-foreground">
            Recently Read
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
        
        {finishedBooks.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-3">
            {finishedBooks.map((book) => (
              <BookCard
                key={book.id}
                book={book}
                onBookClick={onBookClick}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <BookOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <p className="text-muted-foreground">
              No books finished yet
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RecentlyReadSection;