"use client";

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
      emptyStateMessage="No books in progress. Add a book to start tracking your reading!"
      filterFunction={(book) => book.state === "in_progress"}
      onBookClick={onBookClick}
      onViewAll={onViewAll}
      maxBooks={maxBooks}
      gridClassName="grid grid-cols-1 md:grid-cols-2 gap-4"
    />
  );
};

export default CurrentlyReadingSection;
