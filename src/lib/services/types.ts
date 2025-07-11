/**
 * Service layer types and interfaces
 *
 * Defines the contracts for business logic operations, providing
 * a clean interface for the presentation layer.
 */

import { User } from "firebase/auth";
import { Book, UserProfile } from "../models";

/**
 * Common service result type for operations that can fail
 */
export interface ServiceResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Authentication service interface
 *
 * Handles authentication operations only
 */
export interface IAuthService {
  /**
   * Sign in with Google
   */
  signInWithGoogle(): Promise<ServiceResult<User>>;

  /**
   * Sign out current user
   */
  signOut(): Promise<ServiceResult<void>>;

  /**
   * Get current authenticated user
   */
  getCurrentUser(): User | null;

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean;

  /**
   * Listen to authentication state changes
   */
  onAuthStateChanged(callback: (user: User | null) => void): () => void;
}

/**
 * User service interface
 *
 * Handles user profile and statistics operations
 */
export interface IUserService {
  /**
   * Get user profile
   */
  getProfile(userId: string): Promise<ServiceResult<UserProfile | null>>;

  /**
   * Create user profile from Firebase user
   */
  createProfileFromFirebaseUser(
    firebaseUser: User
  ): Promise<ServiceResult<UserProfile>>;

  /**
   * Update user profile
   */
  updateProfile(
    userId: string,
    updates: Partial<UserProfile>
  ): Promise<ServiceResult<UserProfile>>;

  /**
   * Delete user profile
   */
  deleteProfile(userId: string): Promise<ServiceResult<void>>;

  /**
   * Calculate and update user statistics
   */
  updateUserStats(userId: string): Promise<ServiceResult<void>>;

  /**
   * Get comprehensive user statistics
   */
  getUserStats(userId: string): Promise<ServiceResult<UserStats>>;

  /**
   * Subscribe to user profile changes
   */
  subscribeToProfile(
    userId: string,
    callback: (profile: UserProfile | null) => void
  ): () => void;
}

/**
 * Book service interface
 *
 * Handles book operations and business logic
 */
export interface IBookService {
  /**
   * Get a single book
   */
  getBook(userId: string, bookId: string): Promise<ServiceResult<Book | null>>;

  /**
   * Get all books for a user
   */
  getUserBooks(userId: string): Promise<ServiceResult<Book[]>>;

  /**
   * Get books by reading state
   */
  getBooksByState(
    userId: string,
    state: Book["state"]
  ): Promise<ServiceResult<Book[]>>;

  /**
   * Add a new book to user's collection
   */
  addBook(
    userId: string,
    book: Omit<Book, "id" | "addedAt" | "updatedAt">
  ): Promise<ServiceResult<string>>;

  /**
   * Update book (general updates)
   */
  updateBook(
    userId: string,
    bookId: string,
    updates: Partial<Book>
  ): Promise<ServiceResult<void>>;

  /**
   * Update book progress with business logic
   */
  updateBookProgress(
    userId: string,
    bookId: string,
    currentPage: number
  ): Promise<ServiceResult<void>>;

  /**
   * Update book reading state with proper event logging
   */
  updateBookState(
    userId: string,
    bookId: string,
    newState: Book["state"],
    currentState?: Book["state"]
  ): Promise<ServiceResult<void>>;

  /**
   * Update book rating
   */
  updateBookRating(
    userId: string,
    bookId: string,
    rating: number
  ): Promise<ServiceResult<void>>;

  /**
   * Delete a book
   */
  deleteBook(userId: string, bookId: string): Promise<ServiceResult<void>>;

  /**
   * Subscribe to user's book collection
   */
  subscribeToUserBooks(
    userId: string,
    callback: (books: Book[]) => void
  ): () => void;

  /**
   * Import multiple books
   */
  importBooks(
    userId: string,
    books: Array<Omit<Book, "id" | "addedAt" | "updatedAt">>
  ): Promise<ServiceResult<string[]>>;

  /**
   * Filter and sort books
   */
  filterAndSortBooks(
    books: Book[],
    searchQuery: string,
    filterStatus: string,
    filterOwnership: string,
    sortBy: string,
    sortDirection: "asc" | "desc"
  ): Book[];

  /**
   * Calculate reading progress percentage
   */
  calculateProgress(book: Book): number;
}

/**
 * Extended user statistics
 */
export interface UserStats {
  totalBooksRead: number;
  currentlyReading: number;
  booksInLibrary: number;
  totalPagesRead: number;
  averageRating: number;
  readingStreak: number;
  booksReadThisMonth: number;
  booksReadThisYear: number;
  favoriteGenres: string[];
  readingGoalProgress?: {
    goal: number;
    current: number;
    percentage: number;
  };
}

/**
 * Book progress update options
 */
export interface BookProgressUpdate {
  currentPage: number;
  totalPages?: number;
  notes?: string;
  sessionStart?: Date;
  sessionEnd?: Date;
}

/**
 * Book state transition options
 */
export interface BookStateTransition {
  fromState: Book["state"];
  toState: Book["state"];
  timestamp: Date;
  notes?: string;
}

/**
 * Service error types
 */
export enum ServiceErrorType {
  VALIDATION_ERROR = "VALIDATION_ERROR",
  AUTHORIZATION_ERROR = "AUTHORIZATION_ERROR",
  NOT_FOUND = "NOT_FOUND",
  BUSINESS_RULE_VIOLATION = "BUSINESS_RULE_VIOLATION",
  EXTERNAL_API_ERROR = "EXTERNAL_API_ERROR",
  REPOSITORY_ERROR = "REPOSITORY_ERROR",
  UNKNOWN_ERROR = "UNKNOWN_ERROR",
}

/**
 * Service error class
 */
export class ServiceError extends Error {
  constructor(
    public type: ServiceErrorType,
    message: string,
    public details?: unknown,
    public originalError?: Error
  ) {
    super(message);
    this.name = "ServiceError";
  }
}
