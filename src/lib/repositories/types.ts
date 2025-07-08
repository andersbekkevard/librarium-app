/**
 * Repository layer types and interfaces
 *
 * Defines the contracts for data access operations, abstracting away
 * Firebase implementation details from the service layer.
 */

import { Unsubscribe } from "firebase/firestore";
import { Book, BookEvent, UserProfile } from "../models";

/**
 * Common repository result type for operations that can fail
 */
export interface RepositoryResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * User repository interface
 * 
 * Handles all user profile data operations
 */
export interface IUserRepository {
  /**
   * Get user profile by ID
   */
  getProfile(userId: string): Promise<RepositoryResult<UserProfile | null>>;

  /**
   * Create a new user profile
   */
  createProfile(profile: Omit<UserProfile, "id">): Promise<RepositoryResult<UserProfile>>;

  /**
   * Update existing user profile
   */
  updateProfile(userId: string, updates: Partial<UserProfile>): Promise<RepositoryResult<UserProfile>>;

  /**
   * Delete user profile
   */
  deleteProfile(userId: string): Promise<RepositoryResult<void>>;

  /**
   * Subscribe to user profile changes
   */
  subscribeToProfile(userId: string, callback: (profile: UserProfile | null) => void): Unsubscribe;
}

/**
 * Book repository interface
 * 
 * Handles all book collection data operations
 */
export interface IBookRepository {
  /**
   * Get a single book by ID
   */
  getBook(userId: string, bookId: string): Promise<RepositoryResult<Book | null>>;

  /**
   * Get all books for a user
   */
  getUserBooks(userId: string): Promise<RepositoryResult<Book[]>>;

  /**
   * Get books by reading state
   */
  getBooksByState(userId: string, state: Book["state"]): Promise<RepositoryResult<Book[]>>;

  /**
   * Add a new book to user's collection
   */
  addBook(userId: string, book: Omit<Book, "id" | "addedAt" | "updatedAt">): Promise<RepositoryResult<string>>;

  /**
   * Update an existing book
   */
  updateBook(userId: string, bookId: string, updates: Partial<Book>): Promise<RepositoryResult<void>>;

  /**
   * Delete a book from user's collection
   */
  deleteBook(userId: string, bookId: string): Promise<RepositoryResult<void>>;

  /**
   * Subscribe to user's book collection changes
   */
  subscribeToUserBooks(userId: string, callback: (books: Book[]) => void): Unsubscribe;

  /**
   * Batch operations for multiple books
   */
  batchUpdateBooks(userId: string, updates: Array<{ bookId: string; data: Partial<Book> }>): Promise<RepositoryResult<void>>;

  /**
   * Import multiple books at once
   */
  importBooks(userId: string, books: Array<Omit<Book, "id" | "addedAt" | "updatedAt">>): Promise<RepositoryResult<string[]>>;
}

/**
 * Event repository interface
 * 
 * Handles all event logging operations
 */
export interface IEventRepository {
  /**
   * Log a new event
   */
  logEvent(userId: string, event: Omit<BookEvent, "id" | "userId" | "timestamp">): Promise<RepositoryResult<string>>;

  /**
   * Get events for a specific book
   */
  getBookEvents(userId: string, bookId: string): Promise<RepositoryResult<BookEvent[]>>;

  /**
   * Get recent events for a user
   */
  getRecentEvents(userId: string, limit?: number): Promise<RepositoryResult<BookEvent[]>>;

  /**
   * Get events by type
   */
  getEventsByType(userId: string, type: BookEvent["type"]): Promise<RepositoryResult<BookEvent[]>>;

  /**
   * Delete events for a book (used when book is deleted)
   */
  deleteBookEvents(userId: string, bookId: string): Promise<RepositoryResult<void>>;
}

/**
 * Common error types for repositories
 */
export enum RepositoryErrorType {
  NOT_FOUND = "NOT_FOUND",
  PERMISSION_DENIED = "PERMISSION_DENIED",
  NETWORK_ERROR = "NETWORK_ERROR",
  VALIDATION_ERROR = "VALIDATION_ERROR",
  UNKNOWN_ERROR = "UNKNOWN_ERROR",
}

/**
 * Repository error class
 */
export class RepositoryError extends Error {
  constructor(
    public type: RepositoryErrorType,
    message: string,
    public originalError?: Error
  ) {
    super(message);
    this.name = "RepositoryError";
  }
}