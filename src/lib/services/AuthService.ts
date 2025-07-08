/**
 * Authentication Service
 *
 * Handles authentication operations using Firebase Auth.
 * Provides a clean interface for authentication functionality.
 */

import { 
  User, 
  onAuthStateChanged, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut as firebaseSignOut 
} from "firebase/auth";
import { auth } from "../firebase";
import { IAuthService, ServiceResult, ServiceError, ServiceErrorType } from "./types";

export class AuthService implements IAuthService {
  /**
   * Convert auth errors to service errors
   */
  private handleAuthError(error: any): ServiceError {
    if (error.code === "auth/popup-blocked") {
      return new ServiceError(
        ServiceErrorType.EXTERNAL_API_ERROR,
        "Popup was blocked by your browser. Please allow popups and try again.",
        error
      );
    }

    if (error.code === "auth/popup-closed-by-user") {
      return new ServiceError(
        ServiceErrorType.EXTERNAL_API_ERROR,
        "Sign-in was cancelled. Please try again.",
        error
      );
    }

    if (error.code === "auth/network-request-failed") {
      return new ServiceError(
        ServiceErrorType.EXTERNAL_API_ERROR,
        "Network error. Please check your connection and try again.",
        error
      );
    }

    return new ServiceError(
      ServiceErrorType.UNKNOWN_ERROR,
      `Authentication error: ${error.message}`,
      error
    );
  }

  /**
   * Sign in with Google
   */
  async signInWithGoogle(): Promise<ServiceResult<User>> {
    try {
      const provider = new GoogleAuthProvider();
      // Add scopes for user profile information
      provider.addScope("email");
      provider.addScope("profile");

      const result = await signInWithPopup(auth, provider);
      return { success: true, data: result.user };
    } catch (error) {
      const serviceError = this.handleAuthError(error);
      return { success: false, error: serviceError.message };
    }
  }

  /**
   * Sign out current user
   */
  async signOut(): Promise<ServiceResult<void>> {
    try {
      await firebaseSignOut(auth);
      return { success: true };
    } catch (error) {
      const serviceError = this.handleAuthError(error);
      return { success: false, error: serviceError.message };
    }
  }

  /**
   * Get current authenticated user
   */
  getCurrentUser(): User | null {
    return auth.currentUser;
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!auth.currentUser;
  }

  /**
   * Listen to authentication state changes
   */
  onAuthStateChanged(callback: (user: User | null) => void): () => void {
    return onAuthStateChanged(auth, callback);
  }

  /**
   * Get user's display name
   */
  getUserDisplayName(): string {
    const user = this.getCurrentUser();
    return user?.displayName || "Anonymous User";
  }

  /**
   * Get user's email
   */
  getUserEmail(): string {
    const user = this.getCurrentUser();
    return user?.email || "";
  }

  /**
   * Get user's photo URL
   */
  getUserPhotoURL(): string | null {
    const user = this.getCurrentUser();
    return user?.photoURL || null;
  }

  /**
   * Get user's ID
   */
  getUserId(): string | null {
    const user = this.getCurrentUser();
    return user?.uid || null;
  }

  /**
   * Check if user's email is verified
   */
  isEmailVerified(): boolean {
    const user = this.getCurrentUser();
    return user?.emailVerified || false;
  }
}

// Export singleton instance
export const authService = new AuthService();