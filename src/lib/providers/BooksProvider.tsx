"use client";

/**
 * Refactored Books Context Provider
 *
 * Simplified to only manage book collection state using BookService.
 * All business logic has been moved to BookService.
 */

import React, { createContext, useContext, useEffect, useState } from "react";
import { Book } from "../models";
import { bookService } from "../services/BookService";
import { useAuthContext } from "./AuthProvider";
import { useUserContext } from "./UserProvider";

/**
 * Books context type definition
 *
 * Simplified to focus on book collection state management
 */
interface BooksContextType {
  /** Array of user's books */
  books: Book[];
  /** Whether books are still loading */
  loading: boolean;
  /** Error message if any operation fails */
  error: string | null;
  /** Function to add a new book to the collection */
  addBook: (
    book: Omit<Book, "id" | "addedAt" | "updatedAt">
  ) => Promise<string>;
  /** Function to update an existing book */
  updateBook: (bookId: string, updates: Partial<Book>) => Promise<void>;
  /** Function to manually update book (bypasses state machine validation) */
  updateBookManual: (bookId: string, updates: Partial<Book>) => Promise<void>;
  /** Function to update book progress */
  updateBookProgress: (bookId: string, currentPage: number) => Promise<void>;
  /** Function to update book state */
  updateBookState: (
    bookId: string,
    newState: Book["state"],
    currentState?: Book["state"]
  ) => Promise<void>;
  /** Function to update book rating */
  updateBookRating: (bookId: string, rating: number) => Promise<void>;
  /** Function to delete a book from the collection */
  deleteBook: (bookId: string) => Promise<void>;
  /** Function to manually refresh books (for error recovery) */
  refreshBooks: () => Promise<void>;
  /** Function to get a single book by ID */
  getBook: (bookId: string) => Promise<Book | null>;
  /** Function to filter and sort books */
  filterAndSortBooks: (
    searchQuery: string,
    filterStatus: string,
    filterOwnership: string,
    sortBy: string,
    sortDirection: "asc" | "desc"
  ) => Book[];
  /** Function to calculate book progress */
  calculateBookProgress: (book: Book) => number;
  /** Computed statistics */
  totalBooks: number;
  booksInProgress: number;
  booksFinished: number;
  booksNotStarted: number;
}

const BooksContext = createContext<BooksContextType | undefined>(undefined);

interface BooksProviderProps {
  children: React.ReactNode;
}

export const BooksProvider: React.FC<BooksProviderProps> = ({ children }) => {
  const { user, isAuthenticated } = useAuthContext();
  const { updateUserStats } = useUserContext();
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Add a new book to the collection
   */
  const addBook = async (
    book: Omit<Book, "id" | "addedAt" | "updatedAt">
  ): Promise<string> => {
    if (!user) {
      throw new Error("User not authenticated");
    }

    try {
      setError(null);
      const result = await bookService.addBook(user.uid, book);

      if (result.success) {
        // Real-time listener will automatically update the books array
        // Update user statistics
        await updateUserStats();
        return result.data!;
      } else {
        setError(result.error || "Failed to add book");
        throw new Error(result.error || "Failed to add book");
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to add book";
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  /**
   * Update an existing book
   */
  const updateBook = async (
    bookId: string,
    updates: Partial<Book>
  ): Promise<void> => {
    if (!user) {
      throw new Error("User not authenticated");
    }

    try {
      setError(null);
      const result = await bookService.updateBook(user.uid, bookId, updates);

      if (result.success) {
        // Real-time listener will automatically update the books array
        // Update user statistics if state changed
        if (updates.state) {
          await updateUserStats();
        }
      } else {
        setError(result.error || "Failed to update book");
        throw new Error(result.error || "Failed to update book");
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to update book";
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  /**
   * Manually update book (bypasses state machine validation)
   */
  const updateBookManual = async (
    bookId: string,
    updates: Partial<Book>
  ): Promise<void> => {
    if (!user) {
      throw new Error("User not authenticated");
    }

    try {
      setError(null);
      const result = await bookService.updateBookManual(user.uid, bookId, updates);

      if (result.success) {
        // Real-time listener will automatically update the books array
        // Update user statistics if state changed
        if (updates.state) {
          await updateUserStats();
        }
      } else {
        setError(result.error || "Failed to update book");
        throw new Error(result.error || "Failed to update book");
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to update book";
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  /**
   * Update book progress
   */
  const updateBookProgress = async (
    bookId: string,
    currentPage: number
  ): Promise<void> => {
    if (!user) {
      throw new Error("User not authenticated");
    }

    try {
      setError(null);
      const result = await bookService.updateBookProgress(
        user.uid,
        bookId,
        currentPage
      );

      if (result.success) {
        // Real-time listener will automatically update the books array
        // Update user statistics in case state changed
        await updateUserStats();
      } else {
        setError(result.error || "Failed to update book progress");
        throw new Error(result.error || "Failed to update book progress");
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to update book progress";
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  /**
   * Update book state
   */
  const updateBookState = async (
    bookId: string,
    newState: Book["state"],
    currentState?: Book["state"]
  ): Promise<void> => {
    if (!user) {
      throw new Error("User not authenticated");
    }

    try {
      setError(null);
      const result = await bookService.updateBookState(
        user.uid,
        bookId,
        newState,
        currentState
      );

      if (result.success) {
        // Real-time listener will automatically update the books array
        // Update user statistics
        await updateUserStats();
      } else {
        setError(result.error || "Failed to update book state");
        throw new Error(result.error || "Failed to update book state");
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to update book state";
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  /**
   * Update book rating
   */
  const updateBookRating = async (
    bookId: string,
    rating: number
  ): Promise<void> => {
    if (!user) {
      throw new Error("User not authenticated");
    }

    try {
      setError(null);
      const result = await bookService.updateBookRating(
        user.uid,
        bookId,
        rating
      );

      if (result.success) {
        // Real-time listener will automatically update the books array
      } else {
        setError(result.error || "Failed to update book rating");
        throw new Error(result.error || "Failed to update book rating");
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to update book rating";
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  /**
   * Delete a book from the collection
   */
  const deleteBook = async (bookId: string): Promise<void> => {
    if (!user) {
      throw new Error("User not authenticated");
    }

    try {
      setError(null);
      const result = await bookService.deleteBook(user.uid, bookId);

      if (result.success) {
        // Real-time listener will automatically update the books array
        // Update user statistics
        await updateUserStats();
      } else {
        setError(result.error || "Failed to delete book");
        throw new Error(result.error || "Failed to delete book");
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to delete book";
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  /**
   * Manually refresh books (for error recovery)
   */
  const refreshBooks = async (): Promise<void> => {
    if (!user) return;

    try {
      setError(null);
      setLoading(true);
      const result = await bookService.getUserBooks(user.uid);

      if (result.success) {
        setBooks(result.data!);
      } else {
        setError(result.error || "Failed to refresh books");
      }
    } catch (error) {
      setError("An unexpected error occurred while refreshing books");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Get a single book by ID (fallback for when book not found in books array)
   */
  const getBook = async (bookId: string): Promise<Book | null> => {
    if (!user) return null;

    try {
      setError(null);
      const result = await bookService.getBook(user.uid, bookId);

      if (result.success) {
        return result.data || null;
      } else {
        setError(result.error || "Failed to get book");
        return null;
      }
    } catch (error) {
      setError("An unexpected error occurred while getting book");
      return null;
    }
  };

  /**
   * Filter and sort books using service
   */
  const filterAndSortBooks = (
    searchQuery: string,
    filterStatus: string,
    filterOwnership: string,
    sortBy: string,
    sortDirection: "asc" | "desc"
  ): Book[] => {
    return bookService.filterAndSortBooks(
      books,
      searchQuery,
      filterStatus,
      filterOwnership,
      sortBy,
      sortDirection
    );
  };

  /**
   * Calculate book progress using service
   */
  const calculateBookProgress = (book: Book): number => {
    return bookService.calculateProgress(book);
  };

  // Computed statistics
  const totalBooks = books.length;
  const booksInProgress = books.filter(
    (book) => book.state === "in_progress"
  ).length;
  const booksFinished = books.filter(
    (book) => book.state === "finished"
  ).length;
  const booksNotStarted = books.filter(
    (book) => book.state === "not_started"
  ).length;

  // Set up real-time listener for books
  useEffect(() => {
    if (!isAuthenticated || !user) {
      setBooks([]);
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    // Set up real-time books listener
    const unsubscribe = bookService.subscribeToUserBooks(
      user.uid,
      (userBooks) => {
        setBooks(userBooks);
        setLoading(false);
        setError(null);
      }
    );

    return unsubscribe;
  }, [isAuthenticated, user]);

  const value: BooksContextType = {
    books,
    loading,
    error,
    addBook,
    updateBook,
    updateBookManual,
    updateBookProgress,
    updateBookState,
    updateBookRating,
    deleteBook,
    refreshBooks,
    getBook,
    filterAndSortBooks,
    calculateBookProgress,
    totalBooks,
    booksInProgress,
    booksFinished,
    booksNotStarted,
  };

  return (
    <BooksContext.Provider value={value}>{children}</BooksContext.Provider>
  );
};

/**
 * Hook to access books context
 *
 * Provides access to the current books collection and operations.
 * Must be used within a BooksProvider component tree.
 *
 * @returns BooksContextType - Current books context
 * @throws Error - If used outside of BooksProvider
 */
export const useBooksContext = (): BooksContextType => {
  const context = useContext(BooksContext);
  if (context === undefined) {
    throw new Error("useBooksContext must be used within a BooksProvider");
  }
  return context;
};

export default BooksProvider;
