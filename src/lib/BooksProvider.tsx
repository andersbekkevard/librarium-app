"use client";

/**
 * Books Context Provider
 *
 * Manages book collection state and provides real-time synchronization with Firestore.
 * Eliminates duplicate subscriptions by centralizing book data management.
 * Used as a wrapper around components that need access to the user's book collection.
 */

import { bookOperations } from "@/lib/firebase-utils";
import { Book } from "@/lib/models";
import { useAuthContext } from "@/lib/AuthProvider";
import { Unsubscribe } from "firebase/firestore";
import React, { createContext, useContext, useEffect, useState } from "react";

/**
 * Books context type definition
 *
 * Defines the shape of the books context available to components.
 */
interface BooksContextType {
  /** Array of user's books */
  books: Book[];
  /** Whether books are still loading */
  loading: boolean;
  /** Error message if any operation fails */
  error: string | null;
  /** Function to add a new book to the collection */
  addBook: (book: Omit<Book, "id" | "addedAt" | "updatedAt">) => Promise<string>;
  /** Function to update an existing book */
  updateBook: (bookId: string, updates: Partial<Book>) => Promise<void>;
  /** Function to delete a book from the collection */
  deleteBook: (bookId: string) => Promise<void>;
  /** Function to manually refresh books (for error recovery) */
  refreshBooks: () => Promise<void>;
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
  const [error, setError] = useState<string | null>(null);

  /**
   * Adds a new book to the user's collection
   *
   * @param book - Book data without system-generated fields
   * @returns Promise<string> - The generated book ID
   */
  const addBook = async (
    book: Omit<Book, "id" | "addedAt" | "updatedAt">
  ): Promise<string> => {
    if (!user) throw new Error("User not authenticated");

    try {
      setError(null);
      const bookId = await bookOperations.addBook(user.uid, book);
      // The real-time listener will automatically update the books array
      return bookId;
    } catch (err) {
      const errorMessage = "Failed to add book. Please try again.";
      console.error("Error adding book:", err);
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  /**
   * Updates an existing book in the user's collection
   *
   * @param bookId - The book's document ID
   * @param updates - Partial book data to update
   * @returns Promise<void>
   */
  const updateBook = async (
    bookId: string,
    updates: Partial<Book>
  ): Promise<void> => {
    if (!user) throw new Error("User not authenticated");

    try {
      setError(null);
      await bookOperations.updateBook(user.uid, bookId, updates);
      // The real-time listener will automatically update the books array
    } catch (err) {
      const errorMessage = "Failed to update book. Please try again.";
      console.error("Error updating book:", err);
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  /**
   * Deletes a book from the user's collection
   *
   * @param bookId - The book's document ID
   * @returns Promise<void>
   */
  const deleteBook = async (bookId: string): Promise<void> => {
    if (!user) throw new Error("User not authenticated");

    try {
      setError(null);
      await bookOperations.deleteBook(user.uid, bookId);
      // The real-time listener will automatically update the books array
    } catch (err) {
      const errorMessage = "Failed to delete book. Please try again.";
      console.error("Error deleting book:", err);
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  /**
   * Manually refreshes the books collection
   *
   * Used for error recovery when the real-time listener fails
   * @returns Promise<void>
   */
  const refreshBooks = async (): Promise<void> => {
    if (!user) return;

    try {
      setError(null);
      setLoading(true);
      const userBooks = await bookOperations.getUserBooks(user.uid);
      setBooks(userBooks);
    } catch (err) {
      const errorMessage = "Failed to refresh books. Please check your connection and try again.";
      console.error("Error refreshing books:", err);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Computed statistics
  const totalBooks = books.length;
  const booksInProgress = books.filter(book => book.state === "in_progress").length;
  const booksFinished = books.filter(book => book.state === "finished").length;
  const booksNotStarted = books.filter(book => book.state === "not_started").length;

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

    let unsubscribe: Unsubscribe | undefined;

    try {
      unsubscribe = bookOperations.subscribeToUserBooks(user.uid, (userBooks) => {
        setBooks(userBooks);
        setLoading(false);
        setError(null);
      });
    } catch (err) {
      const errorMessage = "Failed to load books. Please refresh the page.";
      console.error("Error setting up books listener:", err);
      setError(errorMessage);
      setLoading(false);
    }

    // Cleanup function
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [isAuthenticated, user]);

  const value: BooksContextType = {
    books,
    loading,
    error,
    addBook,
    updateBook,
    deleteBook,
    refreshBooks,
    totalBooks,
    booksInProgress,
    booksFinished,
    booksNotStarted,
  };

  return <BooksContext.Provider value={value}>{children}</BooksContext.Provider>;
};

/**
 * Hook to access books context
 *
 * Provides access to the current books collection and operations.
 * Must be used within a BooksProvider component tree.
 *
 * @returns BooksContextType - Current books context
 * @throws Error - If used outside of BooksProvider
 *
 * @example
 * const { books, loading, error, addBook, updateBook, deleteBook } = useBooksContext();
 *
 * if (loading) return <div>Loading books...</div>;
 * if (error) return <div>Error: {error}</div>;
 *
 * return <div>You have {books.length} books</div>;
 */
export const useBooksContext = (): BooksContextType => {
  const context = useContext(BooksContext);
  if (context === undefined) {
    throw new Error("useBooksContext must be used within a BooksProvider");
  }
  return context;
};

export default BooksProvider;