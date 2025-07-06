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
 * Book operations
 */
export const bookOperations = {
  /**
   * Add a new book to user's library
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
   */
  async deleteBook(userId: string, bookId: string): Promise<void> {
    const bookRef = doc(db, `users/${userId}/books/${bookId}`);
    await deleteDoc(bookRef);
  },

  /**
   * Get a single book by ID
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
 * BookEvent operations
 */
export const eventOperations = {
  /**
   * Log a book event
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
 * User statistics operations
 */
export const statsOperations = {
  /**
   * Calculate and update user statistics
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
 * Batch operations
 */
export const batchOperations = {
  /**
   * Import multiple books at once
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
