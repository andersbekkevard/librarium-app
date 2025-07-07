/**
 * Firebase utility functions for Librarium
 *
 * This file contains utility functions for Firebase operations following
 * the user-centric document structure defined in MODELS.md
 */

import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  getDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  Timestamp,
  writeBatch,
  Unsubscribe,
} from "firebase/firestore";
import { db } from "./firebase";
import { Book, BookEvent } from "./models";

/**
 * Book operations - Core CRUD operations for managing books in a user's library
 */
export const bookOperations = {
  /**
   * Add a new book to user's library
   * 
   * Automatically adds timestamps (addedAt, updatedAt) and generates a unique ID.
   * Used by AddBooksPage when adding books from Google Books API or manual entry.
   * 
   * @param userId - The user's Firebase Auth UID
   * @param book - Book data without system-generated fields (id, addedAt, updatedAt)
   * @returns Promise<string> - The generated book ID
   * 
   * @example
   * const bookId = await bookOperations.addBook(user.uid, {
   *   title: "The Great Gatsby",
   *   author: "F. Scott Fitzgerald",
   *   state: "not_started",
   *   progress: { currentPage: 0, totalPages: 180 }
   * });
   */
  async addBook(
    userId: string,
    book: Omit<Book, "id" | "addedAt" | "updatedAt">
  ): Promise<string> {
    const booksRef = collection(db, `users/${userId}/books`);
    const bookData: Omit<Book, "id"> = {
      ...book,
      addedAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    const docRef = await addDoc(booksRef, bookData);
    return docRef.id;
  },

  /**
   * Update an existing book
   * 
   * Automatically updates the updatedAt timestamp. Used throughout the app
   * for updating book progress, ratings, and other metadata.
   * 
   * @param userId - The user's Firebase Auth UID
   * @param bookId - The book's document ID
   * @param updates - Partial book data to update
   * @returns Promise<void>
   * 
   * @example
   * await bookOperations.updateBook(user.uid, bookId, {
   *   rating: 4,
   *   progress: { currentPage: 150, totalPages: 180 }
   * });
   */
  async updateBook(
    userId: string,
    bookId: string,
    updates: Partial<Book>
  ): Promise<void> {
    const bookRef = doc(db, `users/${userId}/books/${bookId}`);
    const updateData = {
      ...updates,
      updatedAt: Timestamp.now(),
    };

    await updateDoc(bookRef, updateData);
  },

  /**
   * Delete a book from user's library
   * 
   * Permanently removes the book document. Note: This does not delete
   * related events - consider cleanup if needed.
   * 
   * @param userId - The user's Firebase Auth UID
   * @param bookId - The book's document ID
   * @returns Promise<void>
   * 
   * @example
   * await bookOperations.deleteBook(user.uid, bookId);
   */
  async deleteBook(userId: string, bookId: string): Promise<void> {
    const bookRef = doc(db, `users/${userId}/books/${bookId}`);
    await deleteDoc(bookRef);
  },

  /**
   * Get a single book by ID
   * 
   * Returns the complete book object with all metadata. Used by BookDetailPage
   * and other components that need full book data.
   * 
   * @param userId - The user's Firebase Auth UID
   * @param bookId - The book's document ID
   * @returns Promise<Book | null> - The book object or null if not found
   * 
   * @example
   * const book = await bookOperations.getBook(user.uid, bookId);
   * if (book) {
   *   console.log(`Found book: ${book.title}`);
   * }
   */
  async getBook(userId: string, bookId: string): Promise<Book | null> {
    const bookRef = doc(db, `users/${userId}/books/${bookId}`);
    const bookDoc = await getDoc(bookRef);

    if (bookDoc.exists()) {
      return { id: bookDoc.id, ...bookDoc.data() } as Book;
    }
    return null;
  },

  /**
   * Get all books for a user
   * 
   * Returns all books in the user's library, ordered by addedAt (newest first).
   * Used by MyLibraryPage and statistics calculations.
   * 
   * @param userId - The user's Firebase Auth UID
   * @returns Promise<Book[]> - Array of all user's books
   * 
   * @example
   * const books = await bookOperations.getUserBooks(user.uid);
   * console.log(`User has ${books.length} books`);
   */
  async getUserBooks(userId: string): Promise<Book[]> {
    const booksRef = collection(db, `users/${userId}/books`);
    const booksQuery = query(booksRef, orderBy("addedAt", "desc"));
    const snapshot = await getDocs(booksQuery);

    return snapshot.docs.map(
      (doc) =>
        ({
          id: doc.id,
          ...doc.data(),
        } as Book)
    );
  },

  /**
   * Get books by state
   * 
   * Returns books filtered by reading state, ordered by updatedAt (newest first).
   * Used for filtering in MyLibraryPage and dashboard statistics.
   * 
   * @param userId - The user's Firebase Auth UID
   * @param state - Reading state to filter by ('not_started', 'in_progress', 'finished')
   * @returns Promise<Book[]> - Array of books matching the state
   * 
   * @example
   * const currentBooks = await bookOperations.getBooksByState(user.uid, 'in_progress');
   * console.log(`Currently reading ${currentBooks.length} books`);
   */
  async getBooksByState(userId: string, state: Book["state"]): Promise<Book[]> {
    const booksRef = collection(db, `users/${userId}/books`);
    const booksQuery = query(
      booksRef,
      where("state", "==", state),
      orderBy("updatedAt", "desc")
    );
    const snapshot = await getDocs(booksQuery);

    return snapshot.docs.map(
      (doc) =>
        ({
          id: doc.id,
          ...doc.data(),
        } as Book)
    );
  },

  /**
   * Listen to real-time updates for user's books
   * 
   * Sets up a real-time listener that automatically updates when books are
   * added, modified, or deleted. Used by components that need live data.
   * 
   * @param userId - The user's Firebase Auth UID
   * @param callback - Function called with updated book array
   * @returns Unsubscribe - Function to stop listening
   * 
   * @example
   * const unsubscribe = bookOperations.subscribeToUserBooks(user.uid, (books) => {
   *   setBooks(books);
   * });
   * // Later: unsubscribe() to stop listening
   */
  subscribeToUserBooks(
    userId: string,
    callback: (books: Book[]) => void
  ): Unsubscribe {
    const booksRef = collection(db, `users/${userId}/books`);
    const booksQuery = query(booksRef, orderBy("addedAt", "desc"));

    return onSnapshot(booksQuery, (snapshot) => {
      const books = snapshot.docs.map(
        (doc) =>
          ({
            id: doc.id,
            ...doc.data(),
          } as Book)
      );
      callback(books);
    });
  },

  /**
   * Update book state and log the event
   * 
   * Updates the book's reading state and automatically logs the state change
   * event. Also manages state-specific timestamps (startedAt, finishedAt).
   * Used by BookDetailPage and other components for state transitions.
   * 
   * @param userId - The user's Firebase Auth UID
   * @param bookId - The book's document ID
   * @param newState - New reading state
   * @param currentState - Current state (optional, for event logging)
   * @returns Promise<void>
   * 
   * @example
   * await bookOperations.updateBookState(user.uid, bookId, 'in_progress', 'not_started');
   */
  async updateBookState(
    userId: string,
    bookId: string,
    newState: Book["state"],
    currentState?: Book["state"]
  ): Promise<void> {
    const batch = writeBatch(db);

    // Update book
    const bookRef = doc(db, `users/${userId}/books/${bookId}`);
    const bookUpdates: Partial<Book> = {
      state: newState,
      updatedAt: Timestamp.now(),
    };

    // Add state-specific timestamps
    if (newState === "in_progress" && currentState === "not_started") {
      bookUpdates.startedAt = Timestamp.now();
    } else if (newState === "finished") {
      bookUpdates.finishedAt = Timestamp.now();
    }

    batch.update(bookRef, bookUpdates);

    // Log event
    const eventsRef = collection(db, `users/${userId}/events`);
    const eventData: Omit<BookEvent, "id"> = {
      bookId,
      userId,
      type: "state_change",
      timestamp: Timestamp.now(),
      data: {
        previousState: currentState,
        newState,
      },
    };

    const eventRef = doc(eventsRef);
    batch.set(eventRef, eventData);

    await batch.commit();
  },
};

/**
 * BookEvent operations - Event logging for reading activities and state changes
 */
export const eventOperations = {
  /**
   * Log a book event
   * 
   * Records reading activities such as progress updates, ratings, and state changes.
   * Automatically adds userId and timestamp. Used throughout the app for activity tracking.
   * 
   * @param userId - The user's Firebase Auth UID
   * @param event - Event data without system-generated fields
   * @returns Promise<string> - The generated event ID
   * 
   * @example
   * await eventOperations.logEvent(user.uid, {
   *   bookId: 'book123',
   *   type: 'progress_update',
   *   data: { currentPage: 100, totalPages: 200 }
   * });
   */
  async logEvent(
    userId: string,
    event: Omit<BookEvent, "id" | "userId" | "timestamp">
  ): Promise<string> {
    const eventsRef = collection(db, `users/${userId}/events`);
    const eventData: Omit<BookEvent, "id"> = {
      ...event,
      userId,
      timestamp: Timestamp.now(),
    };

    const docRef = await addDoc(eventsRef, eventData);
    return docRef.id;
  },

  /**
   * Get events for a specific book
   * 
   * Returns all events for a specific book, ordered by timestamp (newest first).
   * Used for displaying reading history and activity timeline.
   * 
   * @param userId - The user's Firebase Auth UID
   * @param bookId - The book's document ID
   * @returns Promise<BookEvent[]> - Array of events for the book
   * 
   * @example
   * const events = await eventOperations.getBookEvents(user.uid, bookId);
   * console.log(`Book has ${events.length} events`);
   */
  async getBookEvents(userId: string, bookId: string): Promise<BookEvent[]> {
    const eventsRef = collection(db, `users/${userId}/events`);
    const eventsQuery = query(
      eventsRef,
      where("bookId", "==", bookId),
      orderBy("timestamp", "desc")
    );
    const snapshot = await getDocs(eventsQuery);

    return snapshot.docs.map(
      (doc) =>
        ({
          id: doc.id,
          ...doc.data(),
        } as BookEvent)
    );
  },

  /**
   * Get recent events for user
   * 
   * Returns the most recent events across all books for activity feeds
   * and dashboard displays.
   * 
   * @param userId - The user's Firebase Auth UID
   * @param limit - Maximum number of events to return (default: 10)
   * @returns Promise<BookEvent[]> - Array of recent events
   * 
   * @example
   * const recentActivity = await eventOperations.getRecentEvents(user.uid, 5);
   */
  async getRecentEvents(
    userId: string,
    limit: number = 10
  ): Promise<BookEvent[]> {
    const eventsRef = collection(db, `users/${userId}/events`);
    const eventsQuery = query(eventsRef, orderBy("timestamp", "desc"));
    const snapshot = await getDocs(eventsQuery);

    return snapshot.docs.slice(0, limit).map(
      (doc) =>
        ({
          id: doc.id,
          ...doc.data(),
        } as BookEvent)
    );
  },
};

/**
 * User statistics operations - Calculate and manage user reading statistics
 */
export const statsOperations = {
  /**
   * Calculate and update user statistics
   * 
   * Calculates basic statistics (books read, currently reading, library size)
   * and updates the user's profile document. Called after significant changes.
   * 
   * @param userId - The user's Firebase Auth UID
   * @returns Promise<void>
   * 
   * @example
   * await statsOperations.updateUserStats(user.uid);
   */
  async updateUserStats(userId: string): Promise<void> {
    const books = await bookOperations.getUserBooks(userId);

    const stats = {
      totalBooksRead: books.filter((book) => book.state === "finished").length,
      currentlyReading: books.filter((book) => book.state === "in_progress")
        .length,
      booksInLibrary: books.length,
    };

    const profileRef = doc(db, `users/${userId}/profile/main`);
    await updateDoc(profileRef, {
      ...stats,
      updatedAt: Timestamp.now(),
    });
  },

  /**
   * Get user reading statistics
   * 
   * Calculates comprehensive reading statistics including pages read and
   * average rating. Used by UserProfileDropdown and dashboard displays.
   * 
   * @param userId - The user's Firebase Auth UID
   * @returns Promise<object> - Comprehensive statistics object
   * @returns Promise<object>.totalBooksRead - Number of finished books
   * @returns Promise<object>.currentlyReading - Number of in-progress books
   * @returns Promise<object>.booksInLibrary - Total books in library
   * @returns Promise<object>.totalPagesRead - Sum of pages from finished books
   * @returns Promise<object>.averageRating - Average rating (rounded to 1 decimal)
   * 
   * @example
   * const stats = await statsOperations.getUserStats(user.uid);
   * console.log(`Read ${stats.totalBooksRead} books, ${stats.totalPagesRead} pages`);
   */
  async getUserStats(userId: string): Promise<{
    totalBooksRead: number;
    currentlyReading: number;
    booksInLibrary: number;
    totalPagesRead: number;
    averageRating: number;
  }> {
    const books = await bookOperations.getUserBooks(userId);

    const finishedBooks = books.filter((book) => book.state === "finished");
    const totalPagesRead = finishedBooks.reduce(
      (total, book) => total + (book.progress.totalPages || 0),
      0
    );
    const booksWithRatings = finishedBooks.filter((book) => book.rating);
    const averageRating =
      booksWithRatings.length > 0
        ? booksWithRatings.reduce((sum, book) => sum + (book.rating || 0), 0) /
          booksWithRatings.length
        : 0;

    return {
      totalBooksRead: finishedBooks.length,
      currentlyReading: books.filter((book) => book.state === "in_progress")
        .length,
      booksInLibrary: books.length,
      totalPagesRead,
      averageRating: Math.round(averageRating * 10) / 10,
    };
  },
};

/**
 * Batch operations - Efficient bulk operations for multiple books
 */
export const batchOperations = {
  /**
   * Import multiple books at once
   * 
   * Efficiently adds multiple books using Firestore batch writes.
   * Useful for bulk imports from external sources or CSV files.
   * 
   * @param userId - The user's Firebase Auth UID
   * @param books - Array of book data without system-generated fields
   * @returns Promise<string[]> - Array of generated book IDs
   * 
   * @example
   * const bookIds = await batchOperations.importBooks(user.uid, [
   *   { title: "Book 1", author: "Author 1", state: "not_started" },
   *   { title: "Book 2", author: "Author 2", state: "not_started" }
   * ]);
   */
  async importBooks(
    userId: string,
    books: Omit<Book, "id" | "addedAt" | "updatedAt">[]
  ): Promise<string[]> {
    const batch = writeBatch(db);
    const bookIds: string[] = [];

    books.forEach((bookData) => {
      const booksRef = collection(db, `users/${userId}/books`);
      const bookRef = doc(booksRef);
      const book: Omit<Book, "id"> = {
        ...bookData,
        addedAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };

      batch.set(bookRef, book);
      bookIds.push(bookRef.id);
    });

    await batch.commit();
    return bookIds;
  },

  /**
   * Update multiple books at once
   * 
   * Efficiently updates multiple books using Firestore batch writes.
   * Useful for bulk operations like marking multiple books as read.
   * 
   * @param userId - The user's Firebase Auth UID
   * @param updates - Array of book updates with bookId and data
   * @returns Promise<void>
   * 
   * @example
   * await batchOperations.updateMultipleBooks(user.uid, [
   *   { bookId: "book1", data: { state: "finished" } },
   *   { bookId: "book2", data: { rating: 4 } }
   * ]);
   */
  async updateMultipleBooks(
    userId: string,
    updates: { bookId: string; data: Partial<Book> }[]
  ): Promise<void> {
    const batch = writeBatch(db);

    updates.forEach(({ bookId, data }) => {
      const bookRef = doc(db, `users/${userId}/books/${bookId}`);
      batch.update(bookRef, {
        ...data,
        updatedAt: Timestamp.now(),
      });
    });

    await batch.commit();
  },
};
