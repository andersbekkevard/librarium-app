/**
 * Firebase Event Repository
 *
 * Handles all event logging data operations with Firebase Firestore.
 * Abstracts Firebase implementation details from the service layer.
 */

import {
  FirestoreError,
  Timestamp,
  addDoc,
  collection,
  getDocs,
  limit,
  orderBy,
  query,
  where,
  writeBatch,
} from "firebase/firestore";
import { db } from "../firebase";
import { BookEvent } from "../models";
import {
  IEventRepository,
  RepositoryError,
  RepositoryErrorType,
  RepositoryResult,
} from "./types";

export class FirebaseEventRepository implements IEventRepository {
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
   * Get user's events collection reference
   */
  private getEventsCollectionRef(userId: string) {
    return collection(db, `users/${userId}/events`);
  }

  /**
   * Convert Firebase errors to repository errors
   */
  private handleFirebaseError(error: FirestoreError): RepositoryError {
    if (error.code === "permission-denied") {
      return new RepositoryError(
        RepositoryErrorType.PERMISSION_DENIED,
        "Access denied to event collection",
        error
      );
    }

    if (error.code === "unavailable" || error.code === "deadline-exceeded") {
      return new RepositoryError(
        RepositoryErrorType.NETWORK_ERROR,
        "Network error accessing event collection",
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
   * Log a new event
   */
  async logEvent(
    userId: string,
    event: Omit<BookEvent, "id" | "userId" | "timestamp">
  ): Promise<RepositoryResult<string>> {
    try {
      const eventsRef = this.getEventsCollectionRef(userId);
      const eventData = {
        ...event,
        userId,
        timestamp: Timestamp.now(),
      };

      // Filter out undefined values before sending to Firebase
      const filteredEventData = this.filterUndefinedValues(eventData);

      const docRef = await addDoc(eventsRef, filteredEventData);
      return { success: true, data: docRef.id };
    } catch (error) {
      const repoError = this.handleFirebaseError(error as FirestoreError);
      return { success: false, error: repoError.message };
    }
  }

  /**
   * Get events for a specific book
   */
  async getBookEvents(
    userId: string,
    bookId: string
  ): Promise<RepositoryResult<BookEvent[]>> {
    try {
      const eventsRef = this.getEventsCollectionRef(userId);
      const eventsQuery = query(
        eventsRef,
        where("bookId", "==", bookId),
        orderBy("timestamp", "desc")
      );
      const snapshot = await getDocs(eventsQuery);

      const events: BookEvent[] = snapshot.docs.map(
        (doc) =>
          ({
            id: doc.id,
            ...doc.data(),
          } as BookEvent)
      );

      return { success: true, data: events };
    } catch (error) {
      const repoError = this.handleFirebaseError(error as FirestoreError);
      return { success: false, error: repoError.message };
    }
  }

  /**
   * Get recent events for a user
   */
  async getRecentEvents(
    userId: string,
    eventLimit: number = 10
  ): Promise<RepositoryResult<BookEvent[]>> {
    try {
      const eventsRef = this.getEventsCollectionRef(userId);
      const eventsQuery = query(
        eventsRef,
        orderBy("timestamp", "desc"),
        limit(eventLimit)
      );
      const snapshot = await getDocs(eventsQuery);

      const events: BookEvent[] = snapshot.docs.map(
        (doc) =>
          ({
            id: doc.id,
            ...doc.data(),
          } as BookEvent)
      );

      return { success: true, data: events };
    } catch (error) {
      const repoError = this.handleFirebaseError(error as FirestoreError);
      return { success: false, error: repoError.message };
    }
  }

  /**
   * Get events by type
   */
  async getEventsByType(
    userId: string,
    type: BookEvent["type"]
  ): Promise<RepositoryResult<BookEvent[]>> {
    try {
      const eventsRef = this.getEventsCollectionRef(userId);
      const eventsQuery = query(
        eventsRef,
        where("type", "==", type),
        orderBy("timestamp", "desc")
      );
      const snapshot = await getDocs(eventsQuery);

      const events: BookEvent[] = snapshot.docs.map(
        (doc) =>
          ({
            id: doc.id,
            ...doc.data(),
          } as BookEvent)
      );

      return { success: true, data: events };
    } catch (error) {
      const repoError = this.handleFirebaseError(error as FirestoreError);
      return { success: false, error: repoError.message };
    }
  }

  /**
   * Delete events for a book (used when book is deleted)
   */
  async deleteBookEvents(
    userId: string,
    bookId: string
  ): Promise<RepositoryResult<void>> {
    try {
      const eventsRef = this.getEventsCollectionRef(userId);
      const eventsQuery = query(eventsRef, where("bookId", "==", bookId));
      const snapshot = await getDocs(eventsQuery);

      if (snapshot.empty) {
        return { success: true };
      }

      const batch = writeBatch(db);
      snapshot.docs.forEach((doc) => {
        batch.delete(doc.ref);
      });

      await batch.commit();
      return { success: true };
    } catch (error) {
      const repoError = this.handleFirebaseError(error as FirestoreError);
      return { success: false, error: repoError.message };
    }
  }

  /**
   * Delete all events for a user (used for cleanup)
   */
  async deleteAllUserEvents(userId: string): Promise<RepositoryResult<void>> {
    try {
      const eventsRef = this.getEventsCollectionRef(userId);
      const snapshot = await getDocs(eventsRef);

      if (snapshot.empty) {
        return { success: true };
      }

      const batch = writeBatch(db);
      snapshot.docs.forEach((doc) => {
        batch.delete(doc.ref);
      });

      await batch.commit();
      return { success: true };
    } catch (error) {
      const repoError = this.handleFirebaseError(error as FirestoreError);
      return { success: false, error: repoError.message };
    }
  }
}

// Export singleton instance
export const firebaseEventRepository = new FirebaseEventRepository();
