/**
 * Central data models for Librarium
 *
 * This file contains all the core data structures used throughout the application,
 * providing a single source of truth for type definitions and ensuring consistency
 * across the entire codebase.
 */

import { Timestamp } from "firebase/firestore";

/**
 * UserProfile represents basic user information and preferences stored in Firestore.
 * Since the app uses Google OAuth exclusively, user data is populated from Google account information.
 *
 * Firestore Path: users/{userId}/profile/main
 */
export interface UserProfile {
  id: string; // Firebase Auth UID
  displayName: string; // User's display name from Google
  email: string; // User's email address from Google
  photoURL?: string; // Profile picture URL from Google
  createdAt: Timestamp; // Account creation timestamp
  updatedAt: Timestamp; // Last profile update timestamp

  // Google Auth metadata
  emailVerified: boolean; // Email verification status from Google
  lastSignInTime: string; // Last sign-in timestamp from Firebase Auth

  // MVP-specific fields
  totalBooksRead: number; // Count of finished books
  currentlyReading: number; // Count of books in progress
  booksInLibrary: number; // Total books in collection
}

/**
 * Book represents a book in the user's personal library with reading state tracking.
 *
 * Firestore Path: users/{userId}/books/{bookId}
 */
export interface Book {
  id: string; // Unique book identifier
  title: string; // Book title
  author: string; // Primary author

  // Reading state management
  state: "not_started" | "in_progress" | "finished";
  progress: {
    currentPage: number; // Current reading position
    totalPages?: number; // Total pages (if known)
    percentage?: number; // Reading percentage (0-100)
  };

  // Ownership and rating
  isOwned: boolean; // true = owned, false = wishlist
  rating?: number; // User rating (1-5 stars)

  // Metadata (populated from Google Books API or user input)
  isbn?: string; // ISBN identifier
  coverImage?: string; // Cover image URL
  publishedDate?: string; // Publication date
  description?: string; // Book description

  // Timestamps
  addedAt: Timestamp; // When book was added to library
  updatedAt: Timestamp; // Last update timestamp
  startedAt?: Timestamp; // When user started reading
  finishedAt?: Timestamp; // When user finished reading
}

/**
 * BookEvent logs reading activities and state changes for future timeline features.
 *
 * Firestore Path: users/{userId}/events/{eventId}
 */
export interface BookEvent {
  id: string; // Unique event identifier
  bookId: string; // Reference to the book
  userId: string; // Reference to the user

  // Event details
  type: "state_change" | "progress_update" | "rating_added" | "note_added";
  timestamp: Timestamp; // When the event occurred

  // Event-specific data
  data: {
    // For state_change events
    previousState?: Book["state"];
    newState?: Book["state"];

    // For progress_update events
    previousPage?: number;
    newPage?: number;

    // For rating_added events
    rating?: number;

    // For note_added events (future expansion)
    note?: string;
  };
}

/**
 * Type aliases for commonly used types
 */
export type ReadingState = Book["state"];
export type EventType = BookEvent["type"];

/**
 * Utility type guards for type safety
 */
export const isValidReadingState = (state: string): state is ReadingState => {
  return ["not_started", "in_progress", "finished"].includes(state);
};

export const isValidEventType = (type: string): type is EventType => {
  return [
    "state_change",
    "progress_update",
    "rating_added",
    "note_added",
  ].includes(type);
};

/**
 * Helper functions for data validation
 */
export const validateProgress = (progress: Book["progress"]): boolean => {
  if (progress.currentPage < 0) return false;
  if (progress.totalPages && progress.totalPages < 0) return false;
  if (
    progress.percentage &&
    (progress.percentage < 0 || progress.percentage > 100)
  )
    return false;
  return true;
};

export const validateRating = (rating: number): boolean => {
  return rating >= 1 && rating <= 5;
};

/**
 * Constants for the reading state machine
 */
export const READING_STATE_TRANSITIONS = {
  not_started: ["in_progress"],
  in_progress: ["finished"],
  finished: [],
} as const;

export const canTransitionTo = (
  currentState: ReadingState,
  newState: ReadingState
): boolean => {
  return READING_STATE_TRANSITIONS[currentState].includes(
    newState as ReadingState
  );
};
