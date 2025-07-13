/**
 * User Service
 *
 * Handles user profile management and statistics operations.
 * Coordinates between authentication and data repositories.
 */

import { User } from "firebase/auth";
import { Timestamp } from "firebase/firestore";
import {
  ErrorBuilder,
  ErrorCategory,
  ErrorSeverity,
  StandardError,
  createNetworkError,
  createSystemError,
  createValidationError,
} from "../errors/error-handling";
import { Book, UserProfile } from "../models/models";
import { firebaseBookRepository } from "../repositories/FirebaseBookRepository";
import { firebaseUserRepository } from "../repositories/FirebaseUserRepository";
import { IUserRepository } from "../repositories/types";
import { IUserService, ServiceResult, UserStats } from "./types";

export class UserService implements IUserService {
  constructor(
    private userRepository: IUserRepository = firebaseUserRepository,
    private bookRepository = firebaseBookRepository
  ) {}

  /**
   * Convert repository errors to standard errors
   */
  private handleRepositoryError(error: string): StandardError {
    if (error.includes("Access denied")) {
      return new ErrorBuilder("Repository access denied")
        .withCategory(ErrorCategory.AUTHORIZATION)
        .withUserMessage(
          "You don't have permission to access this user profile"
        )
        .withContext({ originalError: error })
        .withSeverity(ErrorSeverity.HIGH)
        .build();
    }

    if (error.includes("Network error")) {
      return createNetworkError("Network error during repository operation");
    }

    if (error.includes("not found")) {
      return createValidationError(
        "User profile not found in repository",
        "User profile not found"
      );
    }

    return createSystemError(`Database error: ${error}`);
  }

  /**
   * Validate user profile data
   */
  private validateUserProfileData(
    profile: Partial<UserProfile>
  ): StandardError | null {
    if (
      profile.displayName !== undefined &&
      profile.displayName.trim().length === 0
    ) {
      return createValidationError("Display name cannot be empty");
    }

    if (profile.email !== undefined && profile.email.trim().length === 0) {
      return createValidationError("Email cannot be empty");
    }

    if (profile.totalBooksRead !== undefined && profile.totalBooksRead < 0) {
      return createValidationError("Total books read cannot be negative");
    }

    if (
      profile.currentlyReading !== undefined &&
      profile.currentlyReading < 0
    ) {
      return createValidationError(
        "Currently reading count cannot be negative"
      );
    }

    if (profile.booksInLibrary !== undefined && profile.booksInLibrary < 0) {
      return createValidationError("Books in library count cannot be negative");
    }

    return null;
  }

  /**
   * Get user profile
   */
  async getProfile(userId: string): Promise<ServiceResult<UserProfile | null>> {
    try {
      const result = await this.userRepository.getProfile(userId);

      if (!result.success) {
        const standardError = this.handleRepositoryError(result.error!);
        return { success: false, error: standardError };
      }

      return { success: true, data: result.data };
    } catch (error) {
      const standardError = createSystemError(
        "Failed to get user profile",
        error as Error
      );
      return { success: false, error: standardError };
    }
  }

  /**
   * Create user profile from Firebase user
   */
  async createProfileFromFirebaseUser(
    firebaseUser: User
  ): Promise<ServiceResult<UserProfile>> {
    try {
      // First check if profile already exists
      const existingProfile = await this.getProfile(firebaseUser.uid);
      if (existingProfile.success && existingProfile.data) {
        // Update existing profile with latest auth data
        const updates: Partial<UserProfile> = {
          displayName:
            firebaseUser.displayName || existingProfile.data.displayName,
          email: firebaseUser.email || existingProfile.data.email,
          photoURL: firebaseUser.photoURL || existingProfile.data.photoURL,
          emailVerified: firebaseUser.emailVerified,
          lastSignInTime: firebaseUser.metadata.lastSignInTime || "",
        };

        return await this.updateProfile(firebaseUser.uid, updates);
      }

      // Create new profile
      const newProfile: Omit<UserProfile, "id"> = {
        displayName: firebaseUser.displayName || "Anonymous User",
        email: firebaseUser.email || "",
        photoURL: firebaseUser.photoURL || undefined,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        emailVerified: firebaseUser.emailVerified,
        lastSignInTime: firebaseUser.metadata.lastSignInTime || "",
        totalBooksRead: 0,
        currentlyReading: 0,
        booksInLibrary: 0,
      };

      const validationError = this.validateUserProfileData(newProfile);
      if (validationError) {
        throw validationError;
      }

      const result = await this.userRepository.createProfile(
        firebaseUser.uid,
        newProfile
      );

      if (!result.success) {
        const standardError = this.handleRepositoryError(result.error!);
        throw standardError;
      }

      return { success: true, data: result.data };
    } catch (error) {
      const standardError = createSystemError(
        "Failed to create user profile",
        error as Error
      );
      return { success: false, error: standardError };
    }
  }

  /**
   * Update user profile
   */
  async updateProfile(
    userId: string,
    updates: Partial<UserProfile>
  ): Promise<ServiceResult<UserProfile>> {
    try {
      const validationError = this.validateUserProfileData(updates);
      if (validationError) {
        return { success: false, error: validationError };
      }

      const result = await this.userRepository.updateProfile(userId, updates);

      if (!result.success) {
        const standardError = this.handleRepositoryError(result.error!);
        return { success: false, error: standardError };
      }

      return { success: true, data: result.data };
    } catch (error) {
      const standardError = createSystemError(
        "Failed to update user profile",
        error as Error
      );
      return { success: false, error: standardError };
    }
  }

  /**
   * Delete user profile
   */
  async deleteProfile(userId: string): Promise<ServiceResult<void>> {
    try {
      const result = await this.userRepository.deleteProfile(userId);

      if (!result.success) {
        const standardError = this.handleRepositoryError(result.error!);
        return { success: false, error: standardError };
      }

      return { success: true };
    } catch (error) {
      const standardError = createSystemError(
        "Failed to delete user profile",
        error as Error
      );
      return { success: false, error: standardError };
    }
  }

  /**
   * Calculate and update user statistics
   */
  async updateUserStats(userId: string): Promise<ServiceResult<void>> {
    try {
      const booksResult = await this.bookRepository.getUserBooks(userId);
      if (!booksResult.success) {
        const standardError = this.handleRepositoryError(booksResult.error!);
        return { success: false, error: standardError };
      }

      const books = booksResult.data || [];
      const stats = {
        totalBooksRead: books.filter((book) => book.state === "finished")
          .length,
        currentlyReading: books.filter((book) => book.state === "in_progress")
          .length,
        booksInLibrary: books.length,
      };

      const result = await this.userRepository.updateProfile(userId, stats);
      if (!result.success) {
        const standardError = this.handleRepositoryError(result.error!);
        return { success: false, error: standardError };
      }

      return { success: true };
    } catch (error) {
      const standardError = createSystemError(
        "Failed to update user stats",
        error as Error
      );
      return { success: false, error: standardError };
    }
  }

  /**
   * Get comprehensive user statistics
   */
  async getUserStats(userId: string): Promise<ServiceResult<UserStats>> {
    try {
      const booksResult = await this.bookRepository.getUserBooks(userId);
      if (!booksResult.success) {
        const standardError = this.handleRepositoryError(booksResult.error!);
        return { success: false, error: standardError };
      }

      const books = booksResult.data || [];
      const finishedBooks = books.filter((book) => book.state === "finished");
      const inProgressBooks = books.filter(
        (book) => book.state === "in_progress"
      );

      // Calculate statistics
      const totalPagesRead = finishedBooks.reduce(
        (sum, book) => sum + (book.progress.totalPages || 0),
        0
      );

      const ratingsSum = finishedBooks.reduce((sum, book) => {
        return sum + (book.rating || 0);
      }, 0);
      const averageRating =
        finishedBooks.length > 0 ? ratingsSum / finishedBooks.length : 0;

      const readingStreak = this.calculateReadingStreak(finishedBooks);

      // Calculate books read this month and year
      const now = new Date();
      const thisMonth = now.getMonth();
      const thisYear = now.getFullYear();

      const booksReadThisMonth = finishedBooks.filter((book) => {
        if (!book.finishedAt) return false;
        const finishedDate = book.finishedAt.toDate();
        return (
          finishedDate.getMonth() === thisMonth &&
          finishedDate.getFullYear() === thisYear
        );
      }).length;

      const booksReadThisYear = finishedBooks.filter((book) => {
        if (!book.finishedAt) return false;
        const finishedDate = book.finishedAt.toDate();
        return finishedDate.getFullYear() === thisYear;
      }).length;

      const favoriteGenres = this.getFavoriteGenres(books);

      const stats: UserStats = {
        totalBooksRead: finishedBooks.length,
        currentlyReading: inProgressBooks.length,
        booksInLibrary: books.length,
        totalPagesRead,
        averageRating,
        readingStreak,
        booksReadThisMonth,
        booksReadThisYear,
        favoriteGenres,
      };

      return { success: true, data: stats };
    } catch (error) {
      const standardError = createSystemError(
        "Failed to get user stats",
        error as Error
      );
      return { success: false, error: standardError };
    }
  }

  /**
   * Subscribe to user profile changes
   */
  subscribeToProfile(
    userId: string,
    callback: (profile: UserProfile | null) => void
  ): () => void {
    return this.userRepository.subscribeToProfile(userId, callback);
  }

  /**
   * Calculate reading streak (consecutive days with reading activity)
   */
  private calculateReadingStreak(finishedBooks: Book[]): number {
    if (finishedBooks.length === 0) return 0;

    // Sort books by finish date (most recent first)
    const sortedBooks = finishedBooks
      .filter((book) => book.finishedAt)
      .sort((a, b) => b.finishedAt!.seconds - a.finishedAt!.seconds);

    if (sortedBooks.length === 0) return 0;

    let streak = 0;
    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    for (const book of sortedBooks) {
      const finishedDate = book.finishedAt!.toDate();
      finishedDate.setHours(0, 0, 0, 0);

      const daysDifference = Math.floor(
        (currentDate.getTime() - finishedDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (daysDifference <= 1) {
        streak++;
        currentDate = finishedDate;
      } else {
        break;
      }
    }

    return streak;
  }

  /**
   * Get favorite genres based on reading history
   */
  private getFavoriteGenres(books: Book[]): string[] {
    const genreCounts = new Map<string, number>();

    books.forEach((book) => {
      if (book.genre) {
        genreCounts.set(book.genre, (genreCounts.get(book.genre) || 0) + 1);
      }
    });

    // Sort by count and return top 3
    return Array.from(genreCounts.entries())
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([genre]) => genre);
  }
}

// Export singleton instance
export const userService = new UserService();
