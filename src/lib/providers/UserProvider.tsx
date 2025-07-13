"use client";

/**
 * User Context Provider
 *
 * Manages user profile state and provides user-related operations.
 * Separated from AuthProvider to follow single responsibility principle.
 * Now uses standardized error handling with ProviderResult pattern.
 */

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import {
  ProviderResult,
  StandardError,
  createAuthError,
  createProviderError,
  createProviderSuccess,
  createSystemError,
} from "../errors/error-handling";
import { LoggerUtils } from "../errors/error-logging";
import { UserProfile } from "../models/models";
import { userService } from "../services/UserService";
import { UserStats } from "../services/types";
import { useAuthContext } from "./AuthProvider";

/**
 * User context type definition with standardized error handling
 */
interface UserContextType {
  /** Current user profile or null if not available */
  userProfile: UserProfile | null;
  /** User statistics */
  userStats: UserStats | null;
  /** Whether user profile is loading */
  loading: boolean;
  /** Error message if any operation fails */
  error: StandardError | null;
  /** Function to update user profile */
  updateUserProfile: (
    updates: Partial<UserProfile>
  ) => Promise<ProviderResult<UserProfile>>;
  /** Function to refresh user profile */
  refreshUserProfile: () => Promise<ProviderResult<void>>;
  /** Function to refresh user statistics */
  refreshUserStats: () => Promise<ProviderResult<void>>;
  /** Function to update user statistics */
  updateUserStats: () => Promise<ProviderResult<void>>;
  /** Function to clear the current error */
  clearError: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

interface UserProviderProps {
  children: React.ReactNode;
}

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  const { user, isAuthenticated } = useAuthContext();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<StandardError | null>(null);

  /**
   * Clears the current error state
   */
  const clearError = useCallback((): void => {
    setError(null);
  }, []);

  /**
   * Update user profile with standardized error handling
   */
  const updateUserProfile = useCallback(
    async (
      updates: Partial<UserProfile>
    ): Promise<ProviderResult<UserProfile>> => {
      if (!user) {
        const standardError = createAuthError("User not authenticated");
        setError(standardError);
        return createProviderError(standardError);
      }

      try {
        setError(null);

        // Log user action
        LoggerUtils.logUserAction("user_profile_update_attempt", {
          userId: user.uid,
          metadata: {
            updates: Object.keys(updates),
          },
        });

        const result = await userService.updateProfile(user.uid, updates);

        if (result.success && result.data) {
          setUserProfile(result.data);

          // Log successful update
          LoggerUtils.logUserAction("user_profile_update_success", {
            userId: user.uid,
            metadata: {
              updates: Object.keys(updates),
            },
          });

          return createProviderSuccess(result.data);
        } else {
          // Handle service error
          const standardError = createSystemError(
            result.error?.message || "Failed to update profile"
          );

          setError(standardError);
          return createProviderError(standardError);
        }
      } catch (error) {
        // Handle unexpected errors
        const standardError = createSystemError(
          "An unexpected error occurred while updating profile",
          error as Error
        );

        setError(standardError);
        return createProviderError(standardError);
      }
    },
    [user]
  );

  /**
   * Refresh user profile from server with standardized error handling
   */
  const refreshUserProfile = useCallback(async (): Promise<
    ProviderResult<void>
  > => {
    if (!user) {
      const standardError = createAuthError("User not authenticated");
      setError(standardError);
      return createProviderError(standardError);
    }

    try {
      setError(null);
      setLoading(true);

      // Log user action
      LoggerUtils.logUserAction("user_profile_refresh_attempt", {
        userId: user.uid,
      });

      const result = await userService.getProfile(user.uid);

      if (result.success) {
        setUserProfile(result.data || null);

        // Log successful refresh
        LoggerUtils.logUserAction("user_profile_refresh_success", {
          userId: user.uid,
        });

        return createProviderSuccess(undefined);
      } else {
        // Handle service error
        const standardError = createSystemError(
          result.error?.message || "Failed to refresh profile"
        );

        setError(standardError);
        return createProviderError(standardError);
      }
    } catch (error) {
      // Handle unexpected errors
      const standardError = createSystemError(
        "An unexpected error occurred while refreshing profile",
        error as Error
      );

      setError(standardError);
      return createProviderError(standardError);
    } finally {
      setLoading(false);
    }
  }, [user]);

  /**
   * Refresh user statistics with standardized error handling
   */
  const refreshUserStats = useCallback(async (): Promise<
    ProviderResult<void>
  > => {
    if (!user) {
      const standardError = createAuthError("User not authenticated");
      setError(standardError);
      return createProviderError(standardError);
    }

    try {
      setError(null);

      // Log user action
      LoggerUtils.logUserAction("user_stats_refresh_attempt", {
        userId: user.uid,
      });

      const result = await userService.getUserStats(user.uid);

      if (result.success && result.data) {
        setUserStats(result.data);

        // Log successful refresh
        LoggerUtils.logUserAction("user_stats_refresh_success", {
          userId: user.uid,
        });

        return createProviderSuccess(undefined);
      } else {
        // Handle service error
        const standardError = createSystemError(
          result.error?.message || "Failed to refresh statistics"
        );

        setError(standardError);
        return createProviderError(standardError);
      }
    } catch (error) {
      // Handle unexpected errors
      const standardError = createSystemError(
        "An unexpected error occurred while refreshing statistics",
        error as Error
      );

      setError(standardError);
      return createProviderError(standardError);
    }
  }, [user]);

  /**
   * Update user statistics with standardized error handling
   */
  const updateUserStats = useCallback(async (): Promise<
    ProviderResult<void>
  > => {
    if (!user) {
      const standardError = createAuthError("User not authenticated");
      setError(standardError);
      return createProviderError(standardError);
    }

    try {
      setError(null);

      // Log user action
      LoggerUtils.logUserAction("user_stats_update_attempt", {
        userId: user.uid,
      });

      const result = await userService.updateUserStats(user.uid);

      if (result.success) {
        // Refresh stats after update
        await refreshUserStats();

        // Log successful update
        LoggerUtils.logUserAction("user_stats_update_success", {
          userId: user.uid,
        });

        return createProviderSuccess(undefined);
      } else {
        // Handle service error
        const standardError = createSystemError(
          result.error?.message || "Failed to update statistics"
        );

        setError(standardError);
        return createProviderError(standardError);
      }
    } catch (error) {
      // Handle unexpected errors
      const standardError = createSystemError(
        "An unexpected error occurred while updating statistics",
        error as Error
      );

      setError(standardError);
      return createProviderError(standardError);
    }
  }, [user, refreshUserStats]);

  // Initialize user profile when user changes
  useEffect(() => {
    const initializeUserProfile = async (): Promise<void> => {
      if (!user) {
        setUserProfile(null);
        setUserStats(null);
        setLoading(false);
        setError(null);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Try to get existing profile
        const profileResult = await userService.getProfile(user.uid);

        if (profileResult.success && profileResult.data) {
          // Profile exists, use it
          setUserProfile(profileResult.data);
        } else {
          // Profile doesn't exist, create one from Firebase user
          const createResult = await userService.createProfileFromFirebaseUser(
            user
          );
          if (createResult.success && createResult.data) {
            setUserProfile(createResult.data);
          } else {
            const standardError = createSystemError(
              createResult.error?.message || "Failed to create user profile"
            );
            setError(standardError);
          }
        }
      } catch (error) {
        const standardError = createSystemError(
          "An unexpected error occurred while initializing user profile",
          error as Error
        );
        setError(standardError);
      } finally {
        setLoading(false);
      }
    };

    initializeUserProfile();
  }, [user]);

  // Set up real-time statistics subscription
  useEffect(() => {
    if (!user) {
      setUserStats(null);
      return;
    }

    try {
      // Subscribe to real-time stats calculation
      const unsubscribeStats = userService.subscribeToUserStats(
        user.uid,
        (stats) => {
          setUserStats(stats);
          setError(null);
        }
      );

      return unsubscribeStats;
    } catch (error) {
      const standardError = createSystemError(
        "Failed to subscribe to user statistics",
        error as Error
      );
      setError(standardError);
    }
  }, [user]);

  const value: UserContextType = {
    userProfile,
    userStats,
    loading,
    error,
    updateUserProfile,
    refreshUserProfile,
    refreshUserStats,
    updateUserStats,
    clearError,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

/**
 * Hook to access user context
 */
export const useUserContext = (): UserContextType => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUserContext must be used within a UserProvider");
  }
  return context;
};
