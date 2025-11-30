"use client";

import { UI_CONFIG } from "@/lib/constants/constants";
import { Book } from "@/lib/models/models";
import BookSection from "./BookSection";

interface RecentlyReadSectionProps {
  books: Book[];
  onBookClick: (bookId: string) => void;
  onViewAll?: () => void;
  maxBooks?: number;
}

export const RecentlyReadSection: React.FC<RecentlyReadSectionProps> = ({
  books,
  onBookClick,
  onViewAll,
  maxBooks = UI_CONFIG.DASHBOARD.RECENTLY_READ_LIMIT,
}) => {
  return (
    <BookSection
      books={books}
      title="Recently Read"
      emptyStateMessage="No books finished yet. Start reading to see your completed books here!"
      filterFunction={(book) => book.state === "finished"}
      onBookClick={onBookClick}
      onViewAll={onViewAll}
      maxBooks={maxBooks}
      gridClassName="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
    />
  );
};

export default RecentlyReadSection;
