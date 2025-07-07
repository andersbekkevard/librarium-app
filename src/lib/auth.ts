"use client";

/**
 * Authentication utilities for Firebase Auth
 * 
 * Provides wrapper functions for Firebase Authentication operations with
 * comprehensive error handling and consistent return types.
 * Used throughout the app for Google OAuth authentication.
 */

import {
  signInWithPopup,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
} from "firebase/auth";
import { auth } from "@/lib/firebase";

/**
 * Authentication error object
 * 
 * Standardized error format for authentication operations.
 */
export interface AuthError {
  /** Firebase error code or 'unknown' */
  code: string;
  /** Human-readable error message */
  message: string;
}

/**
 * Authentication result object
 * 
 * Standardized response format for all authentication operations.
 * Provides consistent success/error handling across the app.
 */
export interface AuthResult {
  /** Whether the operation was successful */
  success: boolean;
  /** Firebase user object if successful */
  user?: any;
  /** Error details if unsuccessful */
  error?: AuthError;
}

/**
 * Sign in with Google using popup
 * 
 * Handles Google OAuth authentication with popup flow. Automatically
 * requests email and profile scopes. Used by GoogleAuth component
 * and other authentication entry points.
 * 
 * @returns Promise<AuthResult> - Authentication result with user data or error
 * @returns Promise<AuthResult>.success - Whether sign-in was successful
 * @returns Promise<AuthResult>.user - Firebase user object if successful
 * @returns Promise<AuthResult>.error - Error details if unsuccessful
 * 
 * @example
 * const result = await signInWithGoogle();
 * if (result.success) {
 *   console.log('User signed in:', result.user?.displayName);
 * } else {
 *   console.error('Sign-in failed:', result.error?.message);
 * }
 */
export const signInWithGoogle = async (): Promise<AuthResult> => {
  try {
    const provider = new GoogleAuthProvider();
    // Add scopes for user profile information
    provider.addScope("email");
    provider.addScope("profile");

    const result = await signInWithPopup(auth, provider);

    return {
      success: true,
      user: result.user,
    };
  } catch (error: any) {
    console.error("Google sign-in error:", error);

    // Handle specific error cases
    let message = "Failed to sign in with Google";

    if (error.code === "auth/popup-blocked") {
      message =
        "Popup was blocked by your browser. Please allow popups and try again.";
    } else if (error.code === "auth/popup-closed-by-user") {
      message = "Sign-in was cancelled. Please try again.";
    } else if (error.code === "auth/network-request-failed") {
      message = "Network error. Please check your connection and try again.";
    } else if (error.message) {
      message = error.message;
    }

    return {
      success: false,
      error: {
        code: error.code || "unknown",
        message,
      },
    };
  }
};

/**
 * Sign out current user
 * 
 * Signs out the currently authenticated user from Firebase.
 * Used by UserProfileDropdown and other components that need logout functionality.
 * 
 * @returns Promise<AuthResult> - Sign-out result
 * @returns Promise<AuthResult>.success - Whether sign-out was successful
 * @returns Promise<AuthResult>.error - Error details if unsuccessful
 * 
 * @example
 * const result = await signOut();
 * if (result.success) {
 *   console.log('User signed out successfully');
 * } else {
 *   console.error('Sign-out failed:', result.error?.message);
 * }
 */
export const signOut = async (): Promise<AuthResult> => {
  try {
    await firebaseSignOut(auth);
    return {
      success: true,
    };
  } catch (error: any) {
    console.error("Sign-out error:", error);
    return {
      success: false,
      error: {
        code: error.code || "unknown",
        message: error.message || "Failed to sign out",
      },
    };
  }
};

/**
 * Check if user is currently authenticated
 * 
 * Synchronous check for current authentication state.
 * Used by components and pages to determine if user is logged in.
 * Note: This only checks the current state, not real-time changes.
 * 
 * @returns boolean - True if user is authenticated, false otherwise
 * 
 * @example
 * if (isAuthenticated()) {
 *   // User is logged in, show protected content
 * } else {
 *   // User is not logged in, show login form
 * }
 */
export const isAuthenticated = (): boolean => {
  return !!auth.currentUser;
};

/**
 * Get current user
 * 
 * Returns the current Firebase user object or null if not authenticated.
 * Used by components that need access to user data (UID, email, display name).
 * 
 * @returns User | null - Current Firebase user object or null
 * 
 * @example
 * const user = getCurrentUser();
 * if (user) {
 *   console.log('Current user:', user.displayName);
 *   console.log('User ID:', user.uid);
 * }
 */
export const getCurrentUser = () => {
  return auth.currentUser;
};
