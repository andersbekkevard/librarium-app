import { UI_CONFIG } from "@/lib/constants/constants";
import { Book } from "@/lib/models/models";
import BookSection from "./BookSection";

interface CurrentlyReadingSectionProps {
  books: Book[];
  onBookClick: (bookId: string) => void;
  onViewAll?: () => void;
  maxBooks?: number;
}

export const CurrentlyReadingSection: React.FC<
  CurrentlyReadingSectionProps
> = ({
  books,
  onBookClick,
  onViewAll,
  maxBooks = UI_CONFIG.DASHBOARD.CURRENTLY_READING_LIMIT,
}) => {
  return (
    <BookSection
      books={books}
      title="Currently Reading"
      emptyStateMessage="No books currently reading"
      filterFunction={(book) => book.state === "in_progress"}
      onBookClick={onBookClick}
      onViewAll={onViewAll}
      maxBooks={maxBooks}
      className="lg:col-span-2"
    />
  );
};

export default CurrentlyReadingSection;
