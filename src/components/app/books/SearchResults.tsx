"use client";

import { MagnifyingGlassIcon } from "@phosphor-icons/react";
import * as React from "react";
import { useState } from "react";

import { GoogleBooksVolume } from "@/lib/api/google-books-api";
import { useIsMobile } from "@/lib/hooks/useIsMobile";
import { BookPreviewDialog } from "./BookPreviewDialog";
import { BookPreviewPage } from "./BookPreviewPage";
import { BookSearchCard } from "./BookSearchCard";

interface SearchResultsProps {
  books: GoogleBooksVolume[];
  onAddBook: (book: GoogleBooksVolume) => void;
  addedBooks: Set<string>;
  isAdding: boolean;
}

export const SearchResults: React.FC<SearchResultsProps> = ({
  books,
  onAddBook,
  addedBooks,
  isAdding,
}) => {
  const [previewBook, setPreviewBook] = useState<GoogleBooksVolume | null>(
    null
  );
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [showMobilePreview, setShowMobilePreview] = useState(false);
  const [clickPosition, setClickPosition] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const isMobile = useIsMobile();

  const handlePreview = (book: GoogleBooksVolume, event?: React.MouseEvent) => {
    setPreviewBook(book);

    // Capture click position for animation
    if (event && event.currentTarget) {
      const rect = event.currentTarget.getBoundingClientRect();
      setClickPosition({
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
      });
    }

    if (isMobile) {
      setShowMobilePreview(true);
    } else {
      setIsPreviewOpen(true);
    }
  };

  const handleBackFromPreview = () => {
    setShowMobilePreview(false);
    setPreviewBook(null);
  };

  // Show mobile preview page if on mobile and preview is open
  if (isMobile && showMobilePreview && previewBook) {
    return (
      <BookPreviewPage
        book={previewBook}
        onBack={handleBackFromPreview}
        onAddBook={onAddBook}
        isAdding={isAdding}
        isAdded={addedBooks.has(previewBook.id)}
      />
    );
  }

  if (!books || books.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <MagnifyingGlassIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p>Search for books to add to your library</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {books.map((book) => (
        <BookSearchCard
          key={book.id}
          book={book}
          onAddBook={onAddBook}
          onPreview={handlePreview}
          isAdded={addedBooks.has(book.id)}
          isAdding={isAdding}
          showDescription={true}
        />
      ))}

      {/* Preview Dialog - Desktop Only */}
      {!isMobile && (
        <BookPreviewDialog
          book={previewBook}
          open={isPreviewOpen}
          onOpenChange={setIsPreviewOpen}
          onAddBook={onAddBook}
          isAdding={isAdding}
          isAdded={previewBook ? addedBooks.has(previewBook.id) : false}
          clickPosition={clickPosition}
        />
      )}
    </div>
  );
};

export default SearchResults;
