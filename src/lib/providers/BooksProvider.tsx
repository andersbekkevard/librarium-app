"use client";

/**
 * Refactored Books Context Provider
 *
 * Simplified to only manage book collection state using BookService.
 * All business logic has been moved to BookService.
 * Now uses standardized error handling with ProviderResult pattern.
 */

import React, { createContext, useContext, useEffect, useState } from "react";
import {
  ErrorHandlerUtils,
  ProviderErrorType,
  ProviderResult,
  StandardError,
  createProviderError,
  createProviderSuccess,
} from "../error-handling";
import { LoggerUtils } from "../error-logging";
import { Book } from "../models";
import { bookService } from "../services/BookService";
import { useAuthContext } from "./AuthProvider";
import { useUserContext } from "./UserProvider";

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
  const { updateUserStats } = useUserContext();
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
      const standardError = ErrorHandlerUtils.handleProviderError(
        ProviderErrorType.OPERATION_FAILED,
        "User not authenticated",
        {
          component: "BooksProvider",
          action: "addBook",
        }
      );
      setError(standardError);
      return createProviderError(standardError);
    }

    try {
      setError(null);

      // Log user action
      LoggerUtils.logUserAction("book_add_attempt", {
        userId: user.uid,
        bookTitle: book.title,
        bookAuthor: book.author,
      });

      const result = await bookService.addBook(user.uid, book);

      if (result.success && result.data) {
        // Real-time listener will automatically update the books array
        // Update user statistics
        await updateUserStats();

        // Log successful addition
        LoggerUtils.logUserAction("book_add_success", {
          userId: user.uid,
          bookId: result.data,
          bookTitle: book.title,
        });

        return createProviderSuccess(result.data);
      } else {
        const standardError = ErrorHandlerUtils.handleProviderError(
          ProviderErrorType.OPERATION_FAILED,
          result.error || "Failed to add book",
          {
            component: "BooksProvider",
            action: "addBook",
            userId: user.uid,
            metadata: { bookTitle: book.title },
          }
        );
        setError(standardError);
        return createProviderError(standardError);
      }
    } catch (error) {
      const standardError = ErrorHandlerUtils.handleProviderError(
        ProviderErrorType.OPERATION_FAILED,
        "An unexpected error occurred while adding book",
        {
          component: "BooksProvider",
          action: "addBook",
          userId: user.uid,
          metadata: { bookTitle: book.title },
        },
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
      const standardError = ErrorHandlerUtils.handleProviderError(
        ProviderErrorType.OPERATION_FAILED,
        "User not authenticated",
        {
          component: "BooksProvider",
          action: "updateBook",
          bookId,
        }
      );
      setError(standardError);
      return createProviderError(standardError);
    }

    try {
      setError(null);

      // Log user action
      LoggerUtils.logUserAction("book_update_attempt", {
        userId: user.uid,
        bookId,
        updates: Object.keys(updates),
      });

      const result = await bookService.updateBook(user.uid, bookId, updates);

      if (result.success) {
        // Real-time listener will automatically update the books array
        // Update user statistics if state changed
        if (updates.state) {
          await updateUserStats();
        }

        // Log successful update
        LoggerUtils.logUserAction("book_update_success", {
          userId: user.uid,
          bookId,
          updates: Object.keys(updates),
        });

        return createProviderSuccess(undefined);
      } else {
        const standardError = ErrorHandlerUtils.handleProviderError(
          ProviderErrorType.OPERATION_FAILED,
          result.error || "Failed to update book",
          {
            component: "BooksProvider",
            action: "updateBook",
            userId: user.uid,
            bookId,
          }
        );
        setError(standardError);
        return createProviderError(standardError);
      }
    } catch (error) {
      const standardError = ErrorHandlerUtils.handleProviderError(
        ProviderErrorType.OPERATION_FAILED,
        "An unexpected error occurred while updating book",
        {
          component: "BooksProvider",
          action: "updateBook",
          userId: user.uid,
          bookId,
        },
        error as Error
      );
      setError(standardError);
      return createProviderError(standardError);
    }
  };

  /**
   * Manually update book (bypasses state machine validation) with standardized error handling
   */
  const updateBookManual = async (
    bookId: string,
    updates: Partial<Book>
  ): Promise<ProviderResult<void>> => {
    if (!user) {
      const standardError = ErrorHandlerUtils.handleProviderError(
        ProviderErrorType.OPERATION_FAILED,
        "User not authenticated",
        {
          component: "BooksProvider",
          action: "updateBookManual",
          bookId,
        }
      );
      setError(standardError);
      return createProviderError(standardError);
    }

    try {
      setError(null);

      // Log user action
      LoggerUtils.logUserAction("book_manual_update_attempt", {
        userId: user.uid,
        bookId,
        updates: Object.keys(updates),
      });

      const result = await bookService.updateBookManual(
        user.uid,
        bookId,
        updates
      );

      if (result.success) {
        // Real-time listener will automatically update the books array
        // Update user statistics if state changed
        if (updates.state) {
          await updateUserStats();
        }

        // Log successful update
        LoggerUtils.logUserAction("book_manual_update_success", {
          userId: user.uid,
          bookId,
          updates: Object.keys(updates),
        });

        return createProviderSuccess(undefined);
      } else {
        const standardError = ErrorHandlerUtils.handleProviderError(
          ProviderErrorType.OPERATION_FAILED,
          result.error || "Failed to update book",
          {
            component: "BooksProvider",
            action: "updateBookManual",
            userId: user.uid,
            bookId,
          }
        );
        setError(standardError);
        return createProviderError(standardError);
      }
    } catch (error) {
      const standardError = ErrorHandlerUtils.handleProviderError(
        ProviderErrorType.OPERATION_FAILED,
        "An unexpected error occurred while updating book",
        {
          component: "BooksProvider",
          action: "updateBookManual",
          userId: user.uid,
          bookId,
        },
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
      const standardError = ErrorHandlerUtils.handleProviderError(
        ProviderErrorType.OPERATION_FAILED,
        "User not authenticated",
        {
          component: "BooksProvider",
          action: "updateBookProgress",
          bookId,
        }
      );
      setError(standardError);
      return createProviderError(standardError);
    }

    try {
      setError(null);

      // Log user action
      LoggerUtils.logUserAction("book_progress_update_attempt", {
        userId: user.uid,
        bookId,
        currentPage,
      });

      const result = await bookService.updateBookProgress(
        user.uid,
        bookId,
        currentPage
      );

      if (result.success) {
        // Real-time listener will automatically update the books array
        // Update user statistics in case state changed
        await updateUserStats();

        // Log successful update
        LoggerUtils.logUserAction("book_progress_update_success", {
          userId: user.uid,
          bookId,
          currentPage,
        });

        return createProviderSuccess(undefined);
      } else {
        const standardError = ErrorHandlerUtils.handleProviderError(
          ProviderErrorType.OPERATION_FAILED,
          result.error || "Failed to update book progress",
          {
            component: "BooksProvider",
            action: "updateBookProgress",
            userId: user.uid,
            bookId,
          }
        );
        setError(standardError);
        return createProviderError(standardError);
      }
    } catch (error) {
      const standardError = ErrorHandlerUtils.handleProviderError(
        ProviderErrorType.OPERATION_FAILED,
        "An unexpected error occurred while updating book progress",
        {
          component: "BooksProvider",
          action: "updateBookProgress",
          userId: user.uid,
          bookId,
        },
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
      const standardError = ErrorHandlerUtils.handleProviderError(
        ProviderErrorType.OPERATION_FAILED,
        "User not authenticated",
        {
          component: "BooksProvider",
          action: "updateBookState",
          bookId,
        }
      );
      setError(standardError);
      return createProviderError(standardError);
    }

    try {
      setError(null);

      // Log user action
      LoggerUtils.logUserAction("book_state_update_attempt", {
        userId: user.uid,
        bookId,
        newState,
        currentState,
      });

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

        // Log successful update
        LoggerUtils.logUserAction("book_state_update_success", {
          userId: user.uid,
          bookId,
          newState,
          currentState,
        });

        return createProviderSuccess(undefined);
      } else {
        const standardError = ErrorHandlerUtils.handleProviderError(
          ProviderErrorType.OPERATION_FAILED,
          result.error || "Failed to update book state",
          {
            component: "BooksProvider",
            action: "updateBookState",
            userId: user.uid,
            bookId,
          }
        );
        setError(standardError);
        return createProviderError(standardError);
      }
    } catch (error) {
      const standardError = ErrorHandlerUtils.handleProviderError(
        ProviderErrorType.OPERATION_FAILED,
        "An unexpected error occurred while updating book state",
        {
          component: "BooksProvider",
          action: "updateBookState",
          userId: user.uid,
          bookId,
        },
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
      const standardError = ErrorHandlerUtils.handleProviderError(
        ProviderErrorType.OPERATION_FAILED,
        "User not authenticated",
        {
          component: "BooksProvider",
          action: "updateBookRating",
          bookId,
        }
      );
      setError(standardError);
      return createProviderError(standardError);
    }

    try {
      setError(null);

      // Log user action
      LoggerUtils.logUserAction("book_rating_update_attempt", {
        userId: user.uid,
        bookId,
        rating,
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
          rating,
        });

        return createProviderSuccess(undefined);
      } else {
        const standardError = ErrorHandlerUtils.handleProviderError(
          ProviderErrorType.OPERATION_FAILED,
          result.error || "Failed to update book rating",
          {
            component: "BooksProvider",
            action: "updateBookRating",
            userId: user.uid,
            bookId,
          }
        );
        setError(standardError);
        return createProviderError(standardError);
      }
    } catch (error) {
      const standardError = ErrorHandlerUtils.handleProviderError(
        ProviderErrorType.OPERATION_FAILED,
        "An unexpected error occurred while updating book rating",
        {
          component: "BooksProvider",
          action: "updateBookRating",
          userId: user.uid,
          bookId,
        },
        error as Error
      );
      setError(standardError);
      return createProviderError(standardError);
    }
  };

  /**
   * Delete a book from the collection with standardized error handling
   */
  const deleteBook = async (bookId: string): Promise<ProviderResult<void>> => {
    if (!user) {
      const standardError = ErrorHandlerUtils.handleProviderError(
        ProviderErrorType.OPERATION_FAILED,
        "User not authenticated",
        {
          component: "BooksProvider",
          action: "deleteBook",
          bookId,
        }
      );
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
        // Update user statistics
        await updateUserStats();

        // Log successful deletion
        LoggerUtils.logUserAction("book_delete_success", {
          userId: user.uid,
          bookId,
        });

        return createProviderSuccess(undefined);
      } else {
        const standardError = ErrorHandlerUtils.handleProviderError(
          ProviderErrorType.OPERATION_FAILED,
          result.error || "Failed to delete book",
          {
            component: "BooksProvider",
            action: "deleteBook",
            userId: user.uid,
            bookId,
          }
        );
        setError(standardError);
        return createProviderError(standardError);
      }
    } catch (error) {
      const standardError = ErrorHandlerUtils.handleProviderError(
        ProviderErrorType.OPERATION_FAILED,
        "An unexpected error occurred while deleting book",
        {
          component: "BooksProvider",
          action: "deleteBook",
          userId: user.uid,
          bookId,
        },
        error as Error
      );
      setError(standardError);
      return createProviderError(standardError);
    }
  };

  /**
   * Manually refresh books (for error recovery) with standardized error handling
   */
  const refreshBooks = async (): Promise<ProviderResult<void>> => {
    if (!user) {
      const standardError = ErrorHandlerUtils.handleProviderError(
        ProviderErrorType.OPERATION_FAILED,
        "User not authenticated",
        {
          component: "BooksProvider",
          action: "refreshBooks",
        }
      );
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
          booksCount: result.data?.length || 0,
        });

        return createProviderSuccess(undefined);
      } else {
        const standardError = ErrorHandlerUtils.handleProviderError(
          ProviderErrorType.OPERATION_FAILED,
          result.error || "Failed to refresh books",
          {
            component: "BooksProvider",
            action: "refreshBooks",
            userId: user.uid,
          }
        );
        setError(standardError);
        return createProviderError(standardError);
      }
    } catch (error) {
      const standardError = ErrorHandlerUtils.handleProviderError(
        ProviderErrorType.OPERATION_FAILED,
        "An unexpected error occurred while refreshing books",
        {
          component: "BooksProvider",
          action: "refreshBooks",
          userId: user.uid,
        },
        error as Error
      );
      setError(standardError);
      return createProviderError(standardError);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Get a single book by ID with standardized error handling
   */
  const getBook = async (
    bookId: string
  ): Promise<ProviderResult<Book | null>> => {
    if (!user) {
      const standardError = ErrorHandlerUtils.handleProviderError(
        ProviderErrorType.OPERATION_FAILED,
        "User not authenticated",
        {
          component: "BooksProvider",
          action: "getBook",
          bookId,
        }
      );
      setError(standardError);
      return createProviderError(standardError);
    }

    try {
      setError(null);

      // Log user action
      LoggerUtils.logUserAction("book_get_attempt", {
        userId: user.uid,
        bookId,
      });

      const result = await bookService.getBook(user.uid, bookId);

      if (result.success) {
        // Log successful get
        LoggerUtils.logUserAction("book_get_success", {
          userId: user.uid,
          bookId,
          found: !!result.data,
        });

        return createProviderSuccess(result.data || null);
      } else {
        const standardError = ErrorHandlerUtils.handleProviderError(
          ProviderErrorType.OPERATION_FAILED,
          result.error || "Failed to get book",
          {
            component: "BooksProvider",
            action: "getBook",
            userId: user.uid,
            bookId,
          }
        );
        setError(standardError);
        return createProviderError(standardError);
      }
    } catch (error) {
      const standardError = ErrorHandlerUtils.handleProviderError(
        ProviderErrorType.OPERATION_FAILED,
        "An unexpected error occurred while getting book",
        {
          component: "BooksProvider",
          action: "getBook",
          userId: user.uid,
          bookId,
        },
        error as Error
      );
      setError(standardError);
      return createProviderError(standardError);
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

    try {
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
    } catch (error) {
      const standardError = ErrorHandlerUtils.handleProviderError(
        ProviderErrorType.SUBSCRIPTION_FAILED,
        "Failed to initialize books subscription",
        {
          component: "BooksProvider",
          action: "subscribeToUserBooks",
          userId: user.uid,
        },
        error as Error
      );
      setError(standardError);
      setLoading(false);
    }
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
