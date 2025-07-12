/**
 * Firebase User Repository
 *
 * Handles all user profile data operations with Firebase Firestore.
 * Abstracts Firebase implementation details from the service layer.
 */

import {
  FirestoreError,
  Timestamp,
  Unsubscribe,
  deleteDoc,
  doc,
  getDoc,
  onSnapshot,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { db } from "../firebase";
import { UserProfile } from "../models";
import {
  IUserRepository,
  RepositoryError,
  RepositoryErrorType,
  RepositoryResult,
} from "./types";

export class FirebaseUserRepository implements IUserRepository {
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
   * Get user profile document reference
   */
  private getUserProfileRef(userId: string) {
    return doc(db, `users/${userId}/profile/main`);
  }

  /**
   * Convert Firebase errors to repository errors
   */
  private handleFirebaseError(error: FirestoreError): RepositoryError {
    if (error.code === "permission-denied") {
      return new RepositoryError(
        RepositoryErrorType.PERMISSION_DENIED,
        "Access denied to user profile",
        error
      );
    }

    if (error.code === "unavailable" || error.code === "deadline-exceeded") {
      return new RepositoryError(
        RepositoryErrorType.NETWORK_ERROR,
        "Network error accessing user profile",
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
   * Get user profile by ID
   */
  async getProfile(
    userId: string
  ): Promise<RepositoryResult<UserProfile | null>> {
    try {
      const profileRef = this.getUserProfileRef(userId);
      const profileDoc = await getDoc(profileRef);

      if (!profileDoc.exists()) {
        return { success: true, data: null };
      }

      const profile = {
        id: profileDoc.id,
        ...profileDoc.data(),
      } as UserProfile;

      return { success: true, data: profile };
    } catch (error) {
      const repoError = this.handleFirebaseError(error as FirestoreError);
      return { success: false, error: repoError.message };
    }
  }

  /**
   * Create a new user profile
   */
  async createProfile(
    userId: string,
    profile: Omit<UserProfile, "id" | "createdAt" | "updatedAt">
  ): Promise<RepositoryResult<UserProfile>> {
    try {
      const profileRef = this.getUserProfileRef(userId);

      const profileData = {
        ...profile,
        id: userId,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };

      // Filter out undefined values before sending to Firebase
      const filteredProfileData = this.filterUndefinedValues(profileData);

      await setDoc(profileRef, filteredProfileData);

      const createdProfile: UserProfile = {
        ...profileData,
      };

      return { success: true, data: createdProfile };
    } catch (error) {
      const repoError = this.handleFirebaseError(error as FirestoreError);
      return { success: false, error: repoError.message };
    }
  }

  /**
   * Update existing user profile
   */
  async updateProfile(
    userId: string,
    updates: Partial<UserProfile>
  ): Promise<RepositoryResult<UserProfile>> {
    try {
      const profileRef = this.getUserProfileRef(userId);

      // Get current profile first
      const currentProfile = await this.getProfile(userId);
      if (!currentProfile.success || !currentProfile.data) {
        return { success: false, error: "User profile not found" };
      }

      const updateData = {
        ...updates,
        updatedAt: Timestamp.now(),
      };

      // Filter out undefined values before sending to Firebase
      const filteredUpdateData = this.filterUndefinedValues(updateData);

      await updateDoc(profileRef, filteredUpdateData);

      const updatedProfile: UserProfile = {
        ...currentProfile.data,
        ...updateData,
      };

      return { success: true, data: updatedProfile };
    } catch (error) {
      const repoError = this.handleFirebaseError(error as FirestoreError);
      return { success: false, error: repoError.message };
    }
  }

  /**
   * Delete user profile
   */
  async deleteProfile(userId: string): Promise<RepositoryResult<void>> {
    try {
      const profileRef = this.getUserProfileRef(userId);
      await deleteDoc(profileRef);
      return { success: true };
    } catch (error) {
      const repoError = this.handleFirebaseError(error as FirestoreError);
      return { success: false, error: repoError.message };
    }
  }

  /**
   * Subscribe to user profile changes
   */
  subscribeToProfile(
    userId: string,
    callback: (profile: UserProfile | null) => void
  ): Unsubscribe {
    const profileRef = this.getUserProfileRef(userId);

    return onSnapshot(
      profileRef,
      (doc) => {
        if (doc.exists()) {
          const profile: UserProfile = {
            id: doc.id,
            ...doc.data(),
          } as UserProfile;
          callback(profile);
        } else {
          callback(null);
        }
      },
      (error) => {
        console.error("Error in profile subscription:", error);
        callback(null);
      }
    );
  }
}

// Export singleton instance
export const firebaseUserRepository = new FirebaseUserRepository();
