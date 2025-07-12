/**
 * User Service
 *
 * Handles user profile management and statistics operations.
 * Coordinates between authentication and data repositories.
 */

import { User } from "firebase/auth";
import { Timestamp } from "firebase/firestore";
import { Book, UserProfile } from "../models";
import { firebaseBookRepository } from "../repositories/FirebaseBookRepository";
import { firebaseUserRepository } from "../repositories/FirebaseUserRepository";
import { IUserRepository } from "../repositories/types";
import { IUserService, ServiceResult, UserStats } from "./types";
import { ErrorHandlerUtils, ErrorBuilder, ErrorCategory, ErrorSeverity, StandardError } from "../error-handling";
import { EVENT_CONFIG } from "../constants";

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
        .withUserMessage("You don't have permission to access this user profile")
        .withContext({ originalError: error })
        .withSeverity(ErrorSeverity.HIGH)
        .build();
    }

    if (error.includes("Network error")) {
      return new ErrorBuilder("Network error during repository operation")
        .withCategory(ErrorCategory.NETWORK)
        .withUserMessage("Network error. Please check your connection and try again.")
        .withContext({ originalError: error })
        .withSeverity(ErrorSeverity.MEDIUM)
        .retryable()
        .build();
    }

    if (error.includes("not found")) {
      return new ErrorBuilder("User profile not found in repository")
        .withCategory(ErrorCategory.VALIDATION)
        .withUserMessage("User profile not found")
        .withContext({ originalError: error })
        .withSeverity(ErrorSeverity.LOW)
        .build();
    }

    return new ErrorBuilder(`Database error: ${error}`)
      .withCategory(ErrorCategory.SYSTEM)
      .withUserMessage("A database error occurred. Please try again.")
      .withContext({ originalError: error })
      .withSeverity(ErrorSeverity.MEDIUM)
      .retryable()
      .build();
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
      return ErrorHandlerUtils.createValidationError(
        "displayName",
        "Display name cannot be empty"
      );
    }

    if (profile.email !== undefined && profile.email.trim().length === 0) {
      return ErrorHandlerUtils.createValidationError(
        "email",
        "Email cannot be empty"
      );
    }

    if (profile.totalBooksRead !== undefined && profile.totalBooksRead < 0) {
      return ErrorHandlerUtils.createValidationError(
        "totalBooksRead",
        "Total books read cannot be negative"
      );
    }

    if (
      profile.currentlyReading !== undefined &&
      profile.currentlyReading < 0
    ) {
      return ErrorHandlerUtils.createValidationError(
        "currentlyReading",
        "Currently reading count cannot be negative"
      );
    }

    if (profile.booksInLibrary !== undefined && profile.booksInLibrary < 0) {
      return ErrorHandlerUtils.createValidationError(
        "booksInLibrary",
        "Books in library count cannot be negative"
      );
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
      const standardError = new ErrorBuilder("Failed to get user profile")
        .withCategory(ErrorCategory.SYSTEM)
        .withUserMessage("An unexpected error occurred while getting profile")
        .withOriginalError(error as Error)
        .withSeverity(ErrorSeverity.MEDIUM)
        .build();
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
      if (error instanceof Error && 'category' in error) {
        return { success: false, error: error as StandardError };
      }
      const standardError = new ErrorBuilder("Failed to create user profile")
        .withCategory(ErrorCategory.SYSTEM)
        .withUserMessage("An unexpected error occurred while creating profile")
        .withOriginalError(error as Error)
        .withSeverity(ErrorSeverity.MEDIUM)
        .build();
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
      const standardError = new ErrorBuilder("Failed to update user profile")
        .withCategory(ErrorCategory.SYSTEM)
        .withUserMessage("An unexpected error occurred while updating profile")
        .withOriginalError(error as Error)
        .withSeverity(ErrorSeverity.MEDIUM)
        .build();
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
      const standardError = new ErrorBuilder("Failed to delete user profile")
        .withCategory(ErrorCategory.SYSTEM)
        .withUserMessage("An unexpected error occurred while deleting profile")
        .withOriginalError(error as Error)
        .withSeverity(ErrorSeverity.MEDIUM)
        .build();
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
        return {
          success: false,
          error: new ErrorBuilder("Failed to get user books for statistics")
            .withCategory(ErrorCategory.SYSTEM)
            .withUserMessage("Unable to calculate statistics at this time")
            .withSeverity(ErrorSeverity.MEDIUM)
            .retryable()
            .build(),
        };
      }

      const books = booksResult.data!;
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
      const standardError = new ErrorBuilder("Failed to update user statistics")
        .withCategory(ErrorCategory.SYSTEM)
        .withUserMessage("An unexpected error occurred while updating statistics")
        .withOriginalError(error as Error)
        .withSeverity(ErrorSeverity.MEDIUM)
        .build();
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
        return {
          success: false,
          error: new ErrorBuilder("Failed to get user books for statistics")
            .withCategory(ErrorCategory.SYSTEM)
            .withUserMessage("Unable to calculate statistics at this time")
            .withSeverity(ErrorSeverity.MEDIUM)
            .retryable()
            .build(),
        };
      }

      const books = booksResult.data!;
      const finishedBooks = books.filter((book) => book.state === "finished");
      const currentlyReadingBooks = books.filter(
        (book) => book.state === "in_progress"
      );

      // Calculate total pages read
      const totalPagesRead = finishedBooks.reduce(
        (total, book) => total + (book.progress.totalPages || 0),
        0
      );

      // Calculate average rating
      const booksWithRatings = finishedBooks.filter((book) => book.rating);
      const averageRating =
        booksWithRatings.length > 0
          ? booksWithRatings.reduce(
              (sum, book) => sum + (book.rating || 0),
              0
            ) / booksWithRatings.length
          : 0;

      // Calculate reading streak (simplified - books finished in consecutive days)
      const readingStreak = this.calculateReadingStreak(finishedBooks);

      // Get favorite genres
      const favoriteGenres = this.getFavoriteGenres(books);

      // Calculate monthly/yearly stats
      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();

      const booksReadThisMonth = finishedBooks.filter((book) => {
        if (!book.finishedAt) return false;
        const finishedDate = book.finishedAt.toDate();
        return (
          finishedDate.getMonth() === currentMonth &&
          finishedDate.getFullYear() === currentYear
        );
      }).length;

      const booksReadThisYear = finishedBooks.filter((book) => {
        if (!book.finishedAt) return false;
        const finishedDate = book.finishedAt.toDate();
        return finishedDate.getFullYear() === currentYear;
      }).length;

      const stats: UserStats = {
        totalBooksRead: finishedBooks.length,
        currentlyReading: currentlyReadingBooks.length,
        booksInLibrary: books.length,
        totalPagesRead: Math.round(totalPagesRead),
        averageRating: Math.round(averageRating * 10) / 10,
        readingStreak,
        booksReadThisMonth,
        booksReadThisYear,
        favoriteGenres,
      };

      return { success: true, data: stats };
    } catch (error) {
      const standardError = new ErrorBuilder("Failed to calculate user statistics")
        .withCategory(ErrorCategory.SYSTEM)
        .withUserMessage("An unexpected error occurred while calculating statistics")
        .withOriginalError(error as Error)
        .withSeverity(ErrorSeverity.MEDIUM)
        .build();
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
   * Calculate reading streak (simplified implementation)
   */
  private calculateReadingStreak(finishedBooks: Book[]): number {
    if (finishedBooks.length === 0) return 0;

    // Sort books by finish date
    const sortedBooks = finishedBooks
      .filter((book) => book.finishedAt)
      .sort(
        (a, b) =>
          b.finishedAt!.toDate().getTime() - a.finishedAt!.toDate().getTime()
      );

    if (sortedBooks.length === 0) return 0;

    // Simple implementation: return number of books finished in last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    return sortedBooks.filter(
      (book) => book.finishedAt!.toDate() >= thirtyDaysAgo
    ).length;
  }

  /**
   * Get favorite genres based on book collection
   */
  private getFavoriteGenres(books: Book[]): string[] {
    const genreCounts: Record<string, number> = {};

    books.forEach((book) => {
      if (book.genre) {
        genreCounts[book.genre] = (genreCounts[book.genre] || 0) + 1;
      }
    });

    return Object.entries(genreCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, EVENT_CONFIG.FAVORITE_GENRES_LIMIT)
      .map(([genre]) => genre);
  }
}

// Export singleton instance
export const userService = new UserService();
