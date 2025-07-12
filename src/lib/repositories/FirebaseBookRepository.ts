/**
 * Firebase Book Repository
 *
 * Handles all book collection data operations with Firebase Firestore.
 * Abstracts Firebase implementation details from the service layer.
 */

import {
  Timestamp,
  Unsubscribe,
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
  where,
  writeBatch,
} from "firebase/firestore";
import { db } from "../firebase";
import { Book } from "../models";
import {
  IBookRepository,
  RepositoryError,
  RepositoryErrorType,
  RepositoryResult,
} from "./types";

export class FirebaseBookRepository implements IBookRepository {
  /**
   * Filters out undefined values from data for Firebase compatibility
   * Firebase Firestore doesn't allow undefined values in documents
   */
  private filterUndefinedValues<T extends Record<string, any>>(data: T): Partial<T> {
    const filtered: Partial<T> = {};
    
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined) {
        filtered[key as keyof T] = value;
      }
    });
    
    return filtered;
  }

  /**
   * Get user's books collection reference
   */
  private getBooksCollectionRef(userId: string) {
    return collection(db, `users/${userId}/books`);
  }

  /**
   * Get book document reference
   */
  private getBookDocRef(userId: string, bookId: string) {
    return doc(db, `users/${userId}/books/${bookId}`);
  }

  /**
   * Convert Firebase errors to repository errors
   */
  private handleFirebaseError(error: any): RepositoryError {
    if (error.code === "permission-denied") {
      return new RepositoryError(
        RepositoryErrorType.PERMISSION_DENIED,
        "Access denied to book collection",
        error
      );
    }

    if (error.code === "unavailable" || error.code === "deadline-exceeded") {
      return new RepositoryError(
        RepositoryErrorType.NETWORK_ERROR,
        "Network error accessing book collection",
        error
      );
    }

    return new RepositoryError(
      RepositoryErrorType.UNKNOWN_ERROR,
      `Database error: ${error.message}`,
      error
    );
  }

  /**
   * Get a single book by ID
   */
  async getBook(
    userId: string,
    bookId: string
  ): Promise<RepositoryResult<Book | null>> {
    try {
      const bookRef = this.getBookDocRef(userId, bookId);
      const bookDoc = await getDoc(bookRef);

      if (!bookDoc.exists()) {
        return { success: true, data: null };
      }

      const book: Book = {
        id: bookDoc.id,
        ...bookDoc.data(),
      } as Book;

      return { success: true, data: book };
    } catch (error) {
      const repoError = this.handleFirebaseError(error);
      return { success: false, error: repoError.message };
    }
  }

  /**
   * Get all books for a user
   */
  async getUserBooks(userId: string): Promise<RepositoryResult<Book[]>> {
    try {
      const booksRef = this.getBooksCollectionRef(userId);
      const booksQuery = query(booksRef, orderBy("addedAt", "desc"));
      const snapshot = await getDocs(booksQuery);

      const books: Book[] = snapshot.docs.map(
        (doc) =>
          ({
            id: doc.id,
            ...doc.data(),
          } as Book)
      );

      return { success: true, data: books };
    } catch (error) {
      const repoError = this.handleFirebaseError(error);
      return { success: false, error: repoError.message };
    }
  }

  /**
   * Get books by reading state
   */
  async getBooksByState(
    userId: string,
    state: Book["state"]
  ): Promise<RepositoryResult<Book[]>> {
    try {
      const booksRef = this.getBooksCollectionRef(userId);
      const booksQuery = query(
        booksRef,
        where("state", "==", state),
        orderBy("updatedAt", "desc")
      );
      const snapshot = await getDocs(booksQuery);

      const books: Book[] = snapshot.docs.map(
        (doc) =>
          ({
            id: doc.id,
            ...doc.data(),
          } as Book)
      );

      return { success: true, data: books };
    } catch (error) {
      const repoError = this.handleFirebaseError(error);
      return { success: false, error: repoError.message };
    }
  }

  /**
   * Add a new book to user's collection
   */
  async addBook(
    userId: string,
    book: Omit<Book, "id" | "addedAt" | "updatedAt">
  ): Promise<RepositoryResult<string>> {
    try {
      const booksRef = this.getBooksCollectionRef(userId);
      const bookData = {
        ...book,
        addedAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };

      // Filter out undefined values before sending to Firebase
      const filteredBookData = this.filterUndefinedValues(bookData);

      const docRef = await addDoc(booksRef, filteredBookData);
      return { success: true, data: docRef.id };
    } catch (error) {
      const repoError = this.handleFirebaseError(error);
      return { success: false, error: repoError.message };
    }
  }

  /**
   * Update an existing book
   */
  async updateBook(
    userId: string,
    bookId: string,
    updates: Partial<Book>
  ): Promise<RepositoryResult<void>> {
    try {
      const bookRef = this.getBookDocRef(userId, bookId);
      const updateData = {
        ...updates,
        updatedAt: Timestamp.now(),
      };

      // Filter out undefined values before sending to Firebase
      const filteredUpdateData = this.filterUndefinedValues(updateData);

      await updateDoc(bookRef, filteredUpdateData);
      return { success: true };
    } catch (error) {
      const repoError = this.handleFirebaseError(error);
      return { success: false, error: repoError.message };
    }
  }

  /**
   * Delete a book from user's collection
   */
  async deleteBook(
    userId: string,
    bookId: string
  ): Promise<RepositoryResult<void>> {
    try {
      const bookRef = this.getBookDocRef(userId, bookId);
      await deleteDoc(bookRef);
      return { success: true };
    } catch (error) {
      const repoError = this.handleFirebaseError(error);
      return { success: false, error: repoError.message };
    }
  }

  /**
   * Subscribe to user's book collection changes
   */
  subscribeToUserBooks(
    userId: string,
    callback: (books: Book[]) => void
  ): Unsubscribe {
    const booksRef = this.getBooksCollectionRef(userId);
    const booksQuery = query(booksRef, orderBy("addedAt", "desc"));

    return onSnapshot(
      booksQuery,
      (snapshot) => {
        const books: Book[] = snapshot.docs.map(
          (doc) =>
            ({
              id: doc.id,
              ...doc.data(),
            } as Book)
        );
        callback(books);
      },
      (error) => {
        console.error("Error in books subscription:", error);
        callback([]);
      }
    );
  }

  /**
   * Batch operations for multiple books
   */
  async batchUpdateBooks(
    userId: string,
    updates: Array<{ bookId: string; data: Partial<Book> }>
  ): Promise<RepositoryResult<void>> {
    try {
      const batch = writeBatch(db);

      updates.forEach(({ bookId, data }) => {
        const bookRef = this.getBookDocRef(userId, bookId);
        batch.update(bookRef, {
          ...data,
          updatedAt: Timestamp.now(),
        });
      });

      await batch.commit();
      return { success: true };
    } catch (error) {
      const repoError = this.handleFirebaseError(error);
      return { success: false, error: repoError.message };
    }
  }

  /**
   * Import multiple books at once
   */
  async importBooks(
    userId: string,
    books: Array<Omit<Book, "id" | "addedAt" | "updatedAt">>
  ): Promise<RepositoryResult<string[]>> {
    try {
      const batch = writeBatch(db);
      const bookIds: string[] = [];

      books.forEach((bookData) => {
        const booksRef = this.getBooksCollectionRef(userId);
        const bookRef = doc(booksRef);
        const book = {
          ...bookData,
          addedAt: Timestamp.now(),
          updatedAt: Timestamp.now(),
        };

        // Filter out undefined values before sending to Firebase
        const filteredBook = this.filterUndefinedValues(book);

        batch.set(bookRef, filteredBook);
        bookIds.push(bookRef.id);
      });

      await batch.commit();
      return { success: true, data: bookIds };
    } catch (error) {
      const repoError = this.handleFirebaseError(error);
      return { success: false, error: repoError.message };
    }
  }
}

// Export singleton instance
export const firebaseBookRepository = new FirebaseBookRepository();
