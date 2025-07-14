"use client";

/**
 * Refactored Books Context Provider
 *
 * Simplified to only manage book collection state using BookService.
 * All business logic has been moved to BookService.
 * Now uses standardized error handling with ProviderResult pattern.
 */

import { calculateBookProgress } from "@/lib/books/book-utils";
import {
  ProviderResult,
  StandardError,
  createAuthError,
  createProviderError,
  createProviderSuccess,
  createSystemError,
} from "@/lib/errors/error-handling";
import { LoggerUtils } from "@/lib/errors/error-logging";
import { Book } from "@/lib/models/models";
import React, { createContext, useContext, useEffect, useState } from "react";
import { bookService } from "../services/BookService";
import { useAuthContext } from "./AuthProvider";

/**
 * Books context type definition
 *
 * Simplified to focus on book collection state management with standardized error handling
 */
interface BooksContextType {
  /** Array of user's books */
  books: Book[];
  /** Whether books are still loading */
  loading: boolean;
  /** Error message if any operation fails */
  error: StandardError | null;
  /** Function to add a new book to the collection */
  addBook: (
    book: Omit<Book, "id" | "addedAt" | "updatedAt">
  ) => Promise<ProviderResult<string>>;
  /** Function to update an existing book */
  updateBook: (
    bookId: string,
    updates: Partial<Book>
  ) => Promise<ProviderResult<void>>;
  /** Function to manually update book (bypasses state machine validation) */
  updateBookManual: (
    bookId: string,
    updates: Partial<Book>
  ) => Promise<ProviderResult<void>>;
  /** Function to update book progress */
  updateBookProgress: (
    bookId: string,
    currentPage: number
  ) => Promise<ProviderResult<void>>;
  /** Function to update book state */
  updateBookState: (
    bookId: string,
    newState: Book["state"],
    currentState?: Book["state"]
  ) => Promise<ProviderResult<void>>;
  /** Function to update book rating */
  updateBookRating: (
    bookId: string,
    rating: number
  ) => Promise<ProviderResult<void>>;
  /** Function to delete a book from the collection */
  deleteBook: (bookId: string) => Promise<ProviderResult<void>>;
  /** Function to manually refresh books (for error recovery) */
  refreshBooks: () => Promise<ProviderResult<void>>;
  /** Function to get a single book by ID */
  getBook: (bookId: string) => Promise<ProviderResult<Book | null>>;
  /** Function to search books in user's library */
  searchBooks: (
    searchQuery: string,
    maxResults?: number
  ) => Promise<ProviderResult<Book[]>>;
  /** Function to filter and sort books */
  filterAndSortBooks: (
    searchQuery: string,
    filterStatus: string,
    filterOwnership: string,
    filterGenre: string,
    sortBy: string,
    sortDirection: "asc" | "desc"
  ) => Book[];
  /** Function to calculate book progress */
  calculateBookProgress: (book: Book) => number;
  /** Function to get unique genres from book collection */
  getAvailableGenres: () => string[];
  /** Function to clear the current error */
  clearError: () => void;
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
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<StandardError | null>(null);

  /**
   * Clears the current error state
   */
  const clearError = (): void => {
    setError(null);
  };

  /**
   * Add a new book to the collection with standardized error handling
   */
  const addBook = async (
    book: Omit<Book, "id" | "addedAt" | "updatedAt">
  ): Promise<ProviderResult<string>> => {
    if (!user) {
      const standardError = createAuthError("User not authenticated");
      setError(standardError);
      return createProviderError(standardError);
    }

    try {
      setError(null);

      // Log user action
      LoggerUtils.logUserAction("book_add_attempt", {
        userId: user.uid,
        metadata: {
          bookTitle: book.title,
          bookAuthor: book.author,
        },
      });

      const result = await bookService.addBook(user.uid, book);

      if (result.success && result.data) {
        // Real-time listener will automatically update the books array
        // Stats will be updated automatically via UserProvider subscription

        // Log successful addition
        LoggerUtils.logUserAction("book_add_success", {
          userId: user.uid,
          metadata: {
            bookId: result.data,
            bookTitle: book.title,
          },
        });

        return createProviderSuccess(result.data);
      } else {
        const standardError = createSystemError(
          result.error?.message || "Failed to add book"
        );
        setError(standardError);
        return createProviderError(standardError);
      }
    } catch (error) {
      const standardError = createSystemError(
        "An unexpected error occurred while adding book",
        error as Error
      );
      setError(standardError);
      return createProviderError(standardError);
    }
  };

  /**
   * Update an existing book with standardized error handling
   */
  const updateBook = async (
    bookId: string,
    updates: Partial<Book>
  ): Promise<ProviderResult<void>> => {
    if (!user) {
      const standardError = createAuthError("User not authenticated");
      setError(standardError);
      return createProviderError(standardError);
    }

    try {
      setError(null);

      // Log user action
      LoggerUtils.logUserAction("book_update_attempt", {
        userId: user.uid,
        bookId,
        metadata: {
          updates: Object.keys(updates),
        },
      });

      const result = await bookService.updateBook(user.uid, bookId, updates);

      if (result.success) {
        // Real-time listener will automatically update the books array
        // Stats will be updated automatically via UserProvider subscription

        // Log successful update
        LoggerUtils.logUserAction("book_update_success", {
          userId: user.uid,
          bookId,
          metadata: {
            updates: Object.keys(updates),
          },
        });

        return createProviderSuccess(undefined);
      } else {
        const standardError = createSystemError(
          result.error?.message || "Failed to update book"
        );
        setError(standardError);
        return createProviderError(standardError);
      }
    } catch (error) {
      const standardError = createSystemError(
        "An unexpected error occurred while updating book",
        error as Error
      );
      setError(standardError);
      return createProviderError(standardError);
    }
  };

  /**
   * Manual update book with standardized error handling
   */
  const updateBookManual = async (
    bookId: string,
    updates: Partial<Book>
  ): Promise<ProviderResult<void>> => {
    if (!user) {
      const standardError = createAuthError("User not authenticated");
      setError(standardError);
      return createProviderError(standardError);
    }

    try {
      setError(null);

      // Log user action
      LoggerUtils.logUserAction("book_manual_update_attempt", {
        userId: user.uid,
        bookId,
        metadata: {
          updates: Object.keys(updates),
        },
      });

      const result = await bookService.updateBookManual(
        user.uid,
        bookId,
        updates
      );

      if (result.success) {
        // Real-time listener will automatically update the books array
        // Stats will be updated automatically via UserProvider subscription

        // Log successful update
        LoggerUtils.logUserAction("book_manual_update_success", {
          userId: user.uid,
          bookId,
          metadata: {
            updates: Object.keys(updates),
          },
        });

        return createProviderSuccess(undefined);
      } else {
        const standardError = createSystemError(
          result.error?.message || "Failed to update book manually"
        );
        setError(standardError);
        return createProviderError(standardError);
      }
    } catch (error) {
      const standardError = createSystemError(
        "An unexpected error occurred while updating book manually",
        error as Error
      );
      setError(standardError);
      return createProviderError(standardError);
    }
  };

  /**
   * Update book progress with standardized error handling
   */
  const updateBookProgress = async (
    bookId: string,
    currentPage: number
  ): Promise<ProviderResult<void>> => {
    if (!user) {
      const standardError = createAuthError("User not authenticated");
      setError(standardError);
      return createProviderError(standardError);
    }

    try {
      setError(null);

      // Log user action
      LoggerUtils.logUserAction("book_progress_update_attempt", {
        userId: user.uid,
        bookId,
        metadata: {
          currentPage,
        },
      });

      const result = await bookService.updateBookProgress(
        user.uid,
        bookId,
        currentPage
      );

      if (result.success) {
        // Real-time listener will automatically update the books array
        // Stats will be updated automatically via UserProvider subscription

        // Log successful update
        LoggerUtils.logUserAction("book_progress_update_success", {
          userId: user.uid,
          bookId,
          metadata: {
            currentPage,
          },
        });

        return createProviderSuccess(undefined);
      } else {
        const standardError = createSystemError(
          result.error?.message || "Failed to update book progress"
        );
        setError(standardError);
        return createProviderError(standardError);
      }
    } catch (error) {
      const standardError = createSystemError(
        "An unexpected error occurred while updating book progress",
        error as Error
      );
      setError(standardError);
      return createProviderError(standardError);
    }
  };

  /**
   * Update book state with standardized error handling
   */
  const updateBookState = async (
    bookId: string,
    newState: Book["state"],
    currentState?: Book["state"]
  ): Promise<ProviderResult<void>> => {
    if (!user) {
      const standardError = createAuthError("User not authenticated");
      setError(standardError);
      return createProviderError(standardError);
    }

    try {
      setError(null);

      // Log user action
      LoggerUtils.logUserAction("book_state_update_attempt", {
        userId: user.uid,
        bookId,
        metadata: {
          newState,
          currentState,
        },
      });

      const result = await bookService.updateBookState(
        user.uid,
        bookId,
        newState,
        currentState
      );

      if (result.success) {
        // Real-time listener will automatically update the books array
        // Stats will be updated automatically via UserProvider subscription

        // Log successful update
        LoggerUtils.logUserAction("book_state_update_success", {
          userId: user.uid,
          bookId,
          metadata: {
            newState,
            currentState,
          },
        });

        return createProviderSuccess(undefined);
      } else {
        const standardError = createSystemError(
          result.error?.message || "Failed to update book state"
        );
        setError(standardError);
        return createProviderError(standardError);
      }
    } catch (error) {
      const standardError = createSystemError(
        "An unexpected error occurred while updating book state",
        error as Error
      );
      setError(standardError);
      return createProviderError(standardError);
    }
  };

  /**
   * Update book rating with standardized error handling
   */
  const updateBookRating = async (
    bookId: string,
    rating: number
  ): Promise<ProviderResult<void>> => {
    if (!user) {
      const standardError = createAuthError("User not authenticated");
      setError(standardError);
      return createProviderError(standardError);
    }

    try {
      setError(null);

      // Log user action
      LoggerUtils.logUserAction("book_rating_update_attempt", {
        userId: user.uid,
        bookId,
        metadata: {
          rating,
        },
      });

      const result = await bookService.updateBookRating(
        user.uid,
        bookId,
        rating
      );

      if (result.success) {
        // Real-time listener will automatically update the books array

        // Log successful update
        LoggerUtils.logUserAction("book_rating_update_success", {
          userId: user.uid,
          bookId,
          metadata: {
            rating,
          },
        });

        return createProviderSuccess(undefined);
      } else {
        const standardError = createSystemError(
          result.error?.message || "Failed to update book rating"
        );
        setError(standardError);
        return createProviderError(standardError);
      }
    } catch (error) {
      const standardError = createSystemError(
        "An unexpected error occurred while updating book rating",
        error as Error
      );
      setError(standardError);
      return createProviderError(standardError);
    }
  };

  /**
   * Delete a book with standardized error handling
   */
  const deleteBook = async (bookId: string): Promise<ProviderResult<void>> => {
    if (!user) {
      const standardError = createAuthError("User not authenticated");
      setError(standardError);
      return createProviderError(standardError);
    }

    try {
      setError(null);

      // Log user action
      LoggerUtils.logUserAction("book_delete_attempt", {
        userId: user.uid,
        bookId,
      });

      const result = await bookService.deleteBook(user.uid, bookId);

      if (result.success) {
        // Real-time listener will automatically update the books array
        // Stats will be updated automatically via UserProvider subscription

        // Log successful deletion
        LoggerUtils.logUserAction("book_delete_success", {
          userId: user.uid,
          bookId,
        });

        return createProviderSuccess(undefined);
      } else {
        const standardError = createSystemError(
          result.error?.message || "Failed to delete book"
        );
        setError(standardError);
        return createProviderError(standardError);
      }
    } catch (error) {
      const standardError = createSystemError(
        "An unexpected error occurred while deleting book",
        error as Error
      );
      setError(standardError);
      return createProviderError(standardError);
    }
  };

  /**
   * Manually refresh books with standardized error handling
   */
  const refreshBooks = async (): Promise<ProviderResult<void>> => {
    if (!user) {
      const standardError = createAuthError("User not authenticated");
      setError(standardError);
      return createProviderError(standardError);
    }

    try {
      setError(null);
      setLoading(true);

      // Log user action
      LoggerUtils.logUserAction("books_refresh_attempt", {
        userId: user.uid,
      });

      const result = await bookService.getUserBooks(user.uid);

      if (result.success) {
        setBooks(result.data || []);

        // Log successful refresh
        LoggerUtils.logUserAction("books_refresh_success", {
          userId: user.uid,
          metadata: {
            bookCount: result.data?.length || 0,
          },
        });

        return createProviderSuccess(undefined);
      } else {
        const standardError = createSystemError(
          result.error?.message || "Failed to refresh books"
        );
        setError(standardError);
        return createProviderError(standardError);
      }
    } catch (error) {
      const standardError = createSystemError(
        "An unexpected error occurred while refreshing books",
        error as Error
      );
      setError(standardError);
      return createProviderError(standardError);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Get a single book with standardized error handling
   */
  const getBook = async (
    bookId: string
  ): Promise<ProviderResult<Book | null>> => {
    if (!user) {
      const standardError = createAuthError("User not authenticated");
      setError(standardError);
      return createProviderError(standardError);
    }

    try {
      setError(null);

      const result = await bookService.getBook(user.uid, bookId);

      if (result.success) {
        return createProviderSuccess(result.data || null);
      } else {
        const standardError = createSystemError(
          result.error?.message || "Failed to get book"
        );
        setError(standardError);
        return createProviderError(standardError);
      }
    } catch (error) {
      const standardError = createSystemError(
        "An unexpected error occurred while getting book",
        error as Error
      );
      setError(standardError);
      return createProviderError(standardError);
    }
  };

  /**
   * Search books in user's library
   */
  const searchBooks = async (
    searchQuery: string,
    maxResults?: number
  ): Promise<ProviderResult<Book[]>> => {
    if (!user) {
      const standardError = createAuthError("User not authenticated");
      setError(standardError);
      return createProviderError(standardError);
    }

    try {
      setError(null);

      const result = await bookService.searchBooks(
        user.uid,
        searchQuery,
        maxResults
      );

      if (result.success) {
        return createProviderSuccess(result.data || []);
      } else {
        const standardError = createSystemError(
          result.error?.message || "Failed to search books"
        );
        setError(standardError);
        return createProviderError(standardError);
      }
    } catch (error) {
      const standardError = createSystemError(
        "An unexpected error occurred while searching books",
        error as Error
      );
      setError(standardError);
      return createProviderError(standardError);
    }
  };

  /**
   * Filter and sort books
   */
  const filterAndSortBooks = (
    searchQuery: string,
    filterStatus: string,
    filterOwnership: string,
    filterGenre: string,
    sortBy: string,
    sortDirection: "asc" | "desc"
  ): Book[] => {
    try {
      return bookService.filterAndSortBooks(
        books,
        searchQuery,
        filterStatus,
        filterOwnership,
        filterGenre,
        sortBy,
        sortDirection
      );
    } catch (error) {
      const standardError = createSystemError(
        "An unexpected error occurred while filtering books",
        error as Error
      );
      setError(standardError);
      return books; // Return original books on error
    }
  };

  /**
   * Calculate book progress
   */
  const calculateBookProgressWrapper = (book: Book): number => {
    try {
      return calculateBookProgress(book);
    } catch (error) {
      const standardError = createSystemError(
        "An unexpected error occurred while calculating book progress",
        error as Error
      );
      setError(standardError);
      return 0; // Return 0 on error
    }
  };

  /**
   * Get unique genres from the user's book collection
   */
  const getAvailableGenres = (): string[] => {
    try {
      const genres = books
        .map(book => book.genre)
        .filter((genre): genre is string => genre !== undefined && genre !== null && genre.trim() !== "")
        .map(genre => genre.trim())
        .filter((genre, index, array) => array.indexOf(genre) === index) // Remove duplicates
        .sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' })); // Case-insensitive sort
      
      return genres;
    } catch (error) {
      const standardError = createSystemError(
        "An unexpected error occurred while getting available genres",
        error as Error
      );
      setError(standardError);
      return []; // Return empty array on error
    }
  };

  // Set up real-time subscription to user's books
  useEffect(() => {
    if (!user) {
      setBooks([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const unsubscribe = bookService.subscribeToUserBooks(
        user.uid,
        (updatedBooks) => {
          setBooks(updatedBooks);
          setLoading(false);
          setError(null);
        }
      );

      return unsubscribe;
    } catch (error) {
      const standardError = createSystemError(
        "Failed to subscribe to book updates",
        error as Error
      );
      setError(standardError);
      setLoading(false);
    }
  }, [user]);

  // Calculate computed statistics
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
    searchBooks,
    filterAndSortBooks,
    calculateBookProgress: calculateBookProgressWrapper,
    getAvailableGenres,
    clearError,
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
 */
export const useBooksContext = (): BooksContextType => {
  const context = useContext(BooksContext);
  if (context === undefined) {
    throw new Error("useBooksContext must be used within a BooksProvider");
  }
  return context;
};
