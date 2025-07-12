"use client";

/**
 * User Context Provider
 *
 * Manages user profile state and provides user-related operations.
 * Separated from AuthProvider to follow single responsibility principle.
 * Now uses standardized error handling with ProviderResult pattern.
 */

import React, { createContext, useContext, useEffect, useState } from "react";
import {
  ErrorHandlerUtils,
  ProviderErrorType,
  ProviderResult,
  StandardError,
  createProviderError,
  createProviderSuccess,
} from "../error-handling";
import { LoggerUtils } from "../error-logging";
import { UserProfile } from "../models";
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
  const clearError = (): void => {
    setError(null);
  };

  /**
   * Update user profile with standardized error handling
   */
  const updateUserProfile = async (
    updates: Partial<UserProfile>
  ): Promise<ProviderResult<UserProfile>> => {
    if (!user) {
      const standardError = ErrorHandlerUtils.handleProviderError(
        ProviderErrorType.OPERATION_FAILED,
        "User not authenticated",
        {
          component: "UserProvider",
          action: "updateUserProfile",
        }
      );
      setError(standardError);
      return createProviderError(standardError);
    }

    try {
      setError(null);

      // Log user action
      LoggerUtils.logUserAction("user_profile_update_attempt", {
        userId: user.uid,
        updates: Object.keys(updates),
      });

      const result = await userService.updateProfile(user.uid, updates);

      if (result.success && result.data) {
        setUserProfile(result.data);

        // Log successful update
        LoggerUtils.logUserAction("user_profile_update_success", {
          userId: user.uid,
          updates: Object.keys(updates),
        });

        return createProviderSuccess(result.data);
      } else {
        // Handle service error
        const standardError = ErrorHandlerUtils.handleProviderError(
          ProviderErrorType.OPERATION_FAILED,
          result.error || "Failed to update profile",
          {
            component: "UserProvider",
            action: "updateUserProfile",
            userId: user.uid,
          }
        );

        setError(standardError);
        return createProviderError(standardError);
      }
    } catch (error) {
      // Handle unexpected errors
      const standardError = ErrorHandlerUtils.handleProviderError(
        ProviderErrorType.OPERATION_FAILED,
        "An unexpected error occurred while updating profile",
        {
          component: "UserProvider",
          action: "updateUserProfile",
          userId: user.uid,
        },
        error as Error
      );

      setError(standardError);
      return createProviderError(standardError);
    }
  };

  /**
   * Refresh user profile from server with standardized error handling
   */
  const refreshUserProfile = async (): Promise<ProviderResult<void>> => {
    if (!user) {
      const standardError = ErrorHandlerUtils.handleProviderError(
        ProviderErrorType.OPERATION_FAILED,
        "User not authenticated",
        {
          component: "UserProvider",
          action: "refreshUserProfile",
        }
      );
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
        const standardError = ErrorHandlerUtils.handleProviderError(
          ProviderErrorType.OPERATION_FAILED,
          result.error || "Failed to refresh profile",
          {
            component: "UserProvider",
            action: "refreshUserProfile",
            userId: user.uid,
          }
        );

        setError(standardError);
        return createProviderError(standardError);
      }
    } catch (error) {
      // Handle unexpected errors
      const standardError = ErrorHandlerUtils.handleProviderError(
        ProviderErrorType.OPERATION_FAILED,
        "An unexpected error occurred while refreshing profile",
        {
          component: "UserProvider",
          action: "refreshUserProfile",
          userId: user.uid,
        },
        error as Error
      );

      setError(standardError);
      return createProviderError(standardError);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Refresh user statistics with standardized error handling
   */
  const refreshUserStats = async (): Promise<ProviderResult<void>> => {
    if (!user) {
      const standardError = ErrorHandlerUtils.handleProviderError(
        ProviderErrorType.OPERATION_FAILED,
        "User not authenticated",
        {
          component: "UserProvider",
          action: "refreshUserStats",
        }
      );
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
        const standardError = ErrorHandlerUtils.handleProviderError(
          ProviderErrorType.OPERATION_FAILED,
          result.error || "Failed to refresh statistics",
          {
            component: "UserProvider",
            action: "refreshUserStats",
            userId: user.uid,
          }
        );

        setError(standardError);
        return createProviderError(standardError);
      }
    } catch (error) {
      // Handle unexpected errors
      const standardError = ErrorHandlerUtils.handleProviderError(
        ProviderErrorType.OPERATION_FAILED,
        "An unexpected error occurred while refreshing statistics",
        {
          component: "UserProvider",
          action: "refreshUserStats",
          userId: user.uid,
        },
        error as Error
      );

      setError(standardError);
      return createProviderError(standardError);
    }
  };

  /**
   * Update user statistics with standardized error handling
   */
  const updateUserStats = async (): Promise<ProviderResult<void>> => {
    if (!user) {
      const standardError = ErrorHandlerUtils.handleProviderError(
        ProviderErrorType.OPERATION_FAILED,
        "User not authenticated",
        {
          component: "UserProvider",
          action: "updateUserStats",
        }
      );
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
        const standardError = ErrorHandlerUtils.handleProviderError(
          ProviderErrorType.OPERATION_FAILED,
          result.error || "Failed to update statistics",
          {
            component: "UserProvider",
            action: "updateUserStats",
            userId: user.uid,
          }
        );

        setError(standardError);
        return createProviderError(standardError);
      }
    } catch (error) {
      // Handle unexpected errors
      const standardError = ErrorHandlerUtils.handleProviderError(
        ProviderErrorType.OPERATION_FAILED,
        "An unexpected error occurred while updating statistics",
        {
          component: "UserProvider",
          action: "updateUserStats",
          userId: user.uid,
        },
        error as Error
      );

      setError(standardError);
      return createProviderError(standardError);
    }
  };

  // Set up user profile management
  useEffect(() => {
    if (!isAuthenticated || !user) {
      setUserProfile(null);
      setUserStats(null);
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    // Create or get user profile
    const initializeUserProfile = async (): Promise<void> => {
      try {
        const result = await userService.createProfileFromFirebaseUser(user);

        if (result.success && result.data) {
          setUserProfile(result.data);
          // Also load statistics
          await refreshUserStats();
        } else {
          const standardError = ErrorHandlerUtils.handleProviderError(
            ProviderErrorType.INITIALIZATION_FAILED,
            result.error || "Failed to initialize user profile",
            {
              component: "UserProvider",
              action: "initializeUserProfile",
              userId: user.uid,
            }
          );
          setError(standardError);
        }
      } catch (error) {
        const standardError = ErrorHandlerUtils.handleProviderError(
          ProviderErrorType.INITIALIZATION_FAILED,
          "An unexpected error occurred while initializing user profile",
          {
            component: "UserProvider",
            action: "initializeUserProfile",
            userId: user.uid,
          },
          error as Error
        );
        setError(standardError);
      } finally {
        setLoading(false);
      }
    };

    // Set up real-time profile listener
    try {
      const unsubscribe = userService.subscribeToProfile(
        user.uid,
        (profile) => {
          setUserProfile(profile);
          setLoading(false);
          setError(null);
        }
      );

      initializeUserProfile();

      return unsubscribe;
    } catch (error) {
      const standardError = ErrorHandlerUtils.handleProviderError(
        ProviderErrorType.SUBSCRIPTION_FAILED,
        "Failed to initialize user profile subscription",
        {
          component: "UserProvider",
          action: "subscribeToProfile",
          userId: user.uid,
        },
        error as Error
      );
      setError(standardError);
      setLoading(false);
    }
  }, [isAuthenticated, user]);

  // Load user statistics when profile is available
  useEffect(() => {
    if (userProfile && user) {
      refreshUserStats();
    }
  }, [userProfile, user]);

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
 *
 * Provides access to the current user profile and user-related operations.
 * Must be used within a UserProvider component tree.
 *
 * @returns UserContextType - Current user context
 * @throws Error - If used outside of UserProvider
 */
export const useUserContext = (): UserContextType => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUserContext must be used within a UserProvider");
  }
  return context;
};
