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
import {
  IUserService,
  ServiceError,
  ServiceErrorType,
  ServiceResult,
  UserStats,
} from "./types";
import { EVENT_CONFIG } from "../constants";

export class UserService implements IUserService {
  constructor(
    private userRepository: IUserRepository = firebaseUserRepository,
    private bookRepository = firebaseBookRepository
  ) {}

  /**
   * Convert repository errors to service errors
   */
  private handleRepositoryError(error: string): ServiceError {
    if (error.includes("Access denied")) {
      return new ServiceError(
        ServiceErrorType.AUTHORIZATION_ERROR,
        "You don't have permission to access this user profile",
        error
      );
    }

    if (error.includes("Network error")) {
      return new ServiceError(
        ServiceErrorType.EXTERNAL_API_ERROR,
        "Network error. Please check your connection and try again.",
        error
      );
    }

    if (error.includes("not found")) {
      return new ServiceError(
        ServiceErrorType.NOT_FOUND,
        "User profile not found",
        error
      );
    }

    return new ServiceError(
      ServiceErrorType.REPOSITORY_ERROR,
      `Database error: ${error}`,
      error
    );
  }

  /**
   * Validate user profile data
   */
  private validateUserProfileData(
    profile: Partial<UserProfile>
  ): ServiceError | null {
    if (
      profile.displayName !== undefined &&
      profile.displayName.trim().length === 0
    ) {
      return new ServiceError(
        ServiceErrorType.VALIDATION_ERROR,
        "Display name cannot be empty"
      );
    }

    if (profile.email !== undefined && profile.email.trim().length === 0) {
      return new ServiceError(
        ServiceErrorType.VALIDATION_ERROR,
        "Email cannot be empty"
      );
    }

    if (profile.totalBooksRead !== undefined && profile.totalBooksRead < 0) {
      return new ServiceError(
        ServiceErrorType.VALIDATION_ERROR,
        "Total books read cannot be negative"
      );
    }

    if (
      profile.currentlyReading !== undefined &&
      profile.currentlyReading < 0
    ) {
      return new ServiceError(
        ServiceErrorType.VALIDATION_ERROR,
        "Currently reading count cannot be negative"
      );
    }

    if (profile.booksInLibrary !== undefined && profile.booksInLibrary < 0) {
      return new ServiceError(
        ServiceErrorType.VALIDATION_ERROR,
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
        const serviceError = this.handleRepositoryError(result.error!);
        return { success: false, error: serviceError.message };
      }

      return { success: true, data: result.data };
    } catch (error) {
      return { success: false, error: "Failed to get user profile" };
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
        const serviceError = this.handleRepositoryError(result.error!);
        throw serviceError;
      }

      return { success: true, data: result.data };
    } catch (error) {
      if (error instanceof ServiceError) {
        return { success: false, error: error.message };
      }
      return { success: false, error: "Failed to create user profile" };
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
        return { success: false, error: validationError.message };
      }

      const result = await this.userRepository.updateProfile(userId, updates);

      if (!result.success) {
        const serviceError = this.handleRepositoryError(result.error!);
        return { success: false, error: serviceError.message };
      }

      return { success: true, data: result.data };
    } catch (error) {
      return { success: false, error: "Failed to update user profile" };
    }
  }

  /**
   * Delete user profile
   */
  async deleteProfile(userId: string): Promise<ServiceResult<void>> {
    try {
      const result = await this.userRepository.deleteProfile(userId);

      if (!result.success) {
        const serviceError = this.handleRepositoryError(result.error!);
        return { success: false, error: serviceError.message };
      }

      return { success: true };
    } catch (error) {
      return { success: false, error: "Failed to delete user profile" };
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
          error: "Failed to get user books for statistics",
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
        const serviceError = this.handleRepositoryError(result.error!);
        return { success: false, error: serviceError.message };
      }

      return { success: true };
    } catch (error) {
      return { success: false, error: "Failed to update user statistics" };
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
          error: "Failed to get user books for statistics",
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
      return { success: false, error: "Failed to calculate user statistics" };
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
