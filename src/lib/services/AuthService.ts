/**
 * Authentication Service
 *
 * Handles authentication operations using Firebase Auth.
 * Provides a clean interface for authentication functionality.
 */

import {
  AuthError,
  GoogleAuthProvider,
  User,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  signInWithPopup,
} from "firebase/auth";
import { auth } from "../firebase";
import { IAuthService, ServiceResult } from "./types";
import { ErrorHandlerUtils } from "../error-handling";

export class AuthService implements IAuthService {
  /**
   * Convert auth errors to standard errors
   */
  private handleAuthError(error: AuthError) {
    return ErrorHandlerUtils.handleFirebaseAuthError(error);
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
      const standardError = this.handleAuthError(error as AuthError);
      return { success: false, error: standardError };
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
      const standardError = this.handleAuthError(error as AuthError);
      return { success: false, error: standardError };
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
