"use client";

/**
 * Refactored Authentication Context Provider
 *
 * Simplified to only manage authentication state using AuthService.
 * User profile management has been moved to UserProvider.
 */

import { User } from "firebase/auth";
import React, { createContext, useContext, useEffect, useState } from "react";
import { authService } from "../services/AuthService";

/**
 * Authentication context type definition
 *
 * Simplified to only handle authentication state
 */
interface AuthContextType {
  /** Current Firebase user or null if not authenticated */
  user: User | null;
  /** Whether auth state is still loading */
  loading: boolean;
  /** Convenience boolean for authentication status */
  isAuthenticated: boolean;
  /** Function to sign in with Google */
  signInWithGoogle: () => Promise<void>;
  /** Function to sign out */
  signOut: () => Promise<void>;
  /** Auth error if any */
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Handle Google sign in
   */
  const signInWithGoogle = async (): Promise<void> => {
    try {
      setError(null);
      setLoading(true);
      
      const result = await authService.signInWithGoogle();
      
      if (!result.success) {
        setError(result.error || "Sign-in failed");
      }
      // User state will be updated by the auth state listener
    } catch (error) {
      setError("An unexpected error occurred during sign-in");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle sign out
   */
  const signOut = async (): Promise<void> => {
    try {
      setError(null);
      setLoading(true);
      
      const result = await authService.signOut();
      
      if (!result.success) {
        setError(result.error || "Sign-out failed");
      }
      // User state will be updated by the auth state listener
    } catch (error) {
      setError("An unexpected error occurred during sign-out");
    } finally {
      setLoading(false);
    }
  };

  // Set up authentication state listener
  useEffect(() => {
    const unsubscribe = authService.onAuthStateChanged((firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
      setError(null);
    });

    return unsubscribe;
  }, []);

  const value: AuthContextType = {
    user,
    loading,
    isAuthenticated: !!user,
    signInWithGoogle,
    signOut,
    error,
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