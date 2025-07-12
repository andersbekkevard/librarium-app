"use client";

/**
 * Refactored Authentication Context Provider
 *
 * Simplified to only manage authentication state using AuthService.
 * User profile management has been moved to UserProvider.
 * Now uses standardized error handling with ProviderResult pattern.
 */

import { User } from "firebase/auth";
import React, { createContext, useContext, useEffect, useState } from "react";
import {
  ProviderResult,
  StandardError,
  createAuthError,
  createProviderError,
  createProviderSuccess,
  createSystemError,
} from "../error-handling";
import { LoggerUtils, simpleErrorLogger } from "../error-logging";
import { authService } from "../services/AuthService";

/**
 * Authentication context type definition
 *
 * Simplified to only handle authentication state with standardized error handling
 */
interface AuthContextType {
  /** Current Firebase user or null if not authenticated */
  user: User | null;
  /** Whether auth state is still loading */
  loading: boolean;
  /** Convenience boolean for authentication status */
  isAuthenticated: boolean;
  /** Function to sign in with Google */
  signInWithGoogle: () => Promise<ProviderResult<User>>;
  /** Function to sign out */
  signOut: () => Promise<ProviderResult<void>>;
  /** Auth error if any */
  error: StandardError | null;
  /** Function to clear the current error */
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({
  children,
}): React.ReactNode => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<StandardError | null>(null);

  /**
   * Clears the current error state
   */
  const clearError = (): void => {
    setError(null);
  };

  /**
   * Handle Google sign in with standardized error handling
   */
  const signInWithGoogle = async (): Promise<ProviderResult<User>> => {
    try {
      setError(null);
      setLoading(true);

      // Log user action
      LoggerUtils.logUserAction("auth_sign_in_google_attempt");

      const result = await authService.signInWithGoogle();

      if (result.success && result.data) {
        // Set user ID for logging context
        simpleErrorLogger.setUserId(result.data.uid);

        // Log successful sign-in
        LoggerUtils.logUserAction("auth_sign_in_google_success", {
          userId: result.data.uid,
          metadata: {
            email: result.data.email,
          },
        });

        return createProviderSuccess(result.data);
      } else {
        // Handle service error
        const standardError = createAuthError(
          result.error?.message || "Sign-in failed",
          result.error?.userMessage || "Failed to sign in with Google"
        );

        setError(standardError);
        return createProviderError(standardError);
      }
    } catch (error) {
      // Handle unexpected errors
      const standardError = createSystemError(
        "An unexpected error occurred during sign-in",
        error as Error
      );

      setError(standardError);
      return createProviderError(standardError);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle sign out with standardized error handling
   */
  const signOut = async (): Promise<ProviderResult<void>> => {
    try {
      setError(null);
      setLoading(true);

      // Log user action
      LoggerUtils.logUserAction("auth_sign_out_attempt", {
        userId: user?.uid,
      });

      const result = await authService.signOut();

      if (result.success) {
        // Log successful sign-out
        LoggerUtils.logUserAction("auth_sign_out_success", {
          userId: user?.uid,
        });

        return createProviderSuccess(undefined);
      } else {
        // Handle service error
        const standardError = createAuthError(
          result.error?.message || "Sign-out failed",
          result.error?.userMessage || "Failed to sign out"
        );

        setError(standardError);
        return createProviderError(standardError);
      }
    } catch (error) {
      // Handle unexpected errors
      const standardError = createSystemError(
        "An unexpected error occurred during sign-out",
        error as Error
      );

      setError(standardError);
      return createProviderError(standardError);
    } finally {
      setLoading(false);
    }
  };

  // Set up authentication state listener
  useEffect(() => {
    try {
      const unsubscribe = authService.onAuthStateChanged((firebaseUser) => {
        setUser(firebaseUser);
        setLoading(false);
        setError(null);

        // Update logger context
        if (firebaseUser) {
          simpleErrorLogger.setUserId(firebaseUser.uid);
          LoggerUtils.logUserAction("auth_state_changed", {
            userId: firebaseUser.uid,
            metadata: {
              email: firebaseUser.email,
              authenticated: true,
            },
          });
        } else {
          LoggerUtils.logUserAction("auth_state_changed", {
            metadata: {
              authenticated: false,
            },
          });
        }
      });

      return unsubscribe;
    } catch (error) {
      // Handle subscription errors
      const standardError = createSystemError(
        "Failed to initialize authentication state listener",
        error as Error
      );

      setError(standardError);
      setLoading(false);
    }
  }, []);

  const value: AuthContextType = {
    user,
    loading,
    isAuthenticated: !!user,
    signInWithGoogle,
    signOut,
    error,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

/**
 * Hook to access authentication context
 *
 * Provides access to the current authentication state only.
 * For user profile data, use useUserContext instead.
 *
 * @returns AuthContextType - Current authentication context
 * @throws Error - If used outside of AuthProvider
 */
export const useAuthContext = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuthContext must be used within an AuthProvider");
  }
  return context;
};

export default AuthProvider;
