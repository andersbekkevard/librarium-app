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
    totalPages: number; // Total pages
  };

  // Ownership and rating
  isOwned: boolean; // true = owned, false = wishlist
  rating?: number; // User rating (1-5 stars)

  // Metadata (populated from Google Books API or user input)
  isbn?: string; // ISBN identifier
  coverImage?: string; // Cover image URL
  genre?: string; // Genre of the book
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

/**
 * Type guard to validate reading state values
 *
 * Ensures that a string value is a valid ReadingState.
 * Used throughout the app for type safety when processing user input
 * or data from external sources.
 *
 * @param state - String value to validate
 * @returns boolean - True if state is a valid ReadingState
 *
 * @example
 * const userInput = "in_progress";
 * if (isValidReadingState(userInput)) {
 *   // TypeScript now knows userInput is ReadingState
 *   updateBookState(bookId, userInput);
 * }
 */
export const isValidReadingState = (state: string): state is ReadingState => {
  return ["not_started", "in_progress", "finished"].includes(state);
};

/**
 * Type guard to validate event type values
 *
 * Ensures that a string value is a valid EventType.
 * Used when processing events from external sources or user input.
 *
 * @param type - String value to validate
 * @returns boolean - True if type is a valid EventType
 *
 * @example
 * const eventData = JSON.parse(eventJson);
 * if (isValidEventType(eventData.type)) {
 *   // TypeScript now knows eventData.type is EventType
 *   processEvent(eventData);
 * }
 */
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

/**
 * Validates book progress data
 *
 * Ensures that progress values are within valid bounds.
 * Used by BookDetailPage and other components when updating reading progress.
 *
 * @param progress - Progress object to validate
 * @param progress.currentPage - Current page number (must be >= 0 and <= totalPages)
 * @param progress.totalPages - Total pages in book (must be >= 0)
 * @returns boolean - True if progress data is valid
 *
 * @example
 * const progress = { currentPage: 150, totalPages: 200 };
 * if (validateProgress(progress)) {
 *   await updateBookProgress(bookId, progress);
 * } else {
 *   showError("Invalid progress data");
 * }
 */
export const validateProgress = (progress: Book["progress"]): boolean => {
  if (progress.totalPages < 0) return false;
  if (progress.currentPage < 0 || progress.currentPage > progress.totalPages)
    return false;
  return true;
};

/**
 * Validates book rating values
 *
 * Ensures that rating is within the valid range (1-5 stars).
 * Used by BookDetailPage and BookCard when processing user ratings.
 *
 * @param rating - Rating value to validate
 * @returns boolean - True if rating is between 1 and 5 (inclusive)
 *
 * @example
 * const userRating = 4;
 * if (validateRating(userRating)) {
 *   await updateBookRating(bookId, userRating);
 * } else {
 *   showError("Rating must be between 1 and 5 stars");
 * }
 */
export const validateRating = (rating: number): boolean => {
  if (typeof rating !== "number" || isNaN(rating)) {
    return false;
  }
  return rating >= 1 && rating <= 5;
};

/**
 * Constants for the reading state machine
 */

/**
 * Defines valid state transitions for books
 *
 * Enforces the reading state machine: not_started → in_progress → finished
 * Used by canTransitionTo() to validate state changes.
 */
export const READING_STATE_TRANSITIONS: Record<ReadingState, ReadingState[]> = {
  not_started: ["in_progress"],
  in_progress: ["finished"],
  finished: [],
};

/**
 * Validates if a state transition is allowed
 *
 * Enforces the reading state machine to prevent invalid state changes.
 * Used by BookDetailPage and other components before updating book state.
 *
 * @param currentState - Current reading state
 * @param newState - Desired new reading state
 * @returns boolean - True if transition is valid
 *
 * @example
 * const currentState = "not_started";
 * const newState = "in_progress";
 * if (canTransitionTo(currentState, newState)) {
 *   await updateBookState(bookId, newState, currentState);
 * } else {
 *   showError("Invalid state transition");
 * }
 */
export const canTransitionTo = (
  currentState: ReadingState,
  newState: ReadingState
): boolean => {
  if (!READING_STATE_TRANSITIONS[currentState]) {
    return false;
  }
  return READING_STATE_TRANSITIONS[currentState].includes(newState);
};
