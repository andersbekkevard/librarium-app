"use client";

import {
  signInWithPopup,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
} from "firebase/auth";
import { auth } from "@/lib/firebase";

export interface AuthError {
  code: string;
  message: string;
}

export interface AuthResult {
  success: boolean;
  user?: any;
  error?: AuthError;
}

/**
 * Sign in with Google using popup
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
 */
export const isAuthenticated = (): boolean => {
  return !!auth.currentUser;
};

/**
 * Get current user
 */
export const getCurrentUser = () => {
  return auth.currentUser;
};
