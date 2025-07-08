"use client";

/**
 * User Context Provider
 *
 * Manages user profile state and provides user-related operations.
 * Separated from AuthProvider to follow single responsibility principle.
 */

import React, { createContext, useContext, useEffect, useState } from "react";
import { UserProfile } from "../models";
import { userService } from "../services/UserService";
import { useAuthContext } from "./AuthProvider";
import { UserStats } from "../services/types";

/**
 * User context type definition
 */
interface UserContextType {
  /** Current user profile or null if not available */
  userProfile: UserProfile | null;
  /** User statistics */
  userStats: UserStats | null;
  /** Whether user profile is loading */
  loading: boolean;
  /** Error message if any operation fails */
  error: string | null;
  /** Function to update user profile */
  updateUserProfile: (updates: Partial<UserProfile>) => Promise<void>;
  /** Function to refresh user profile */
  refreshUserProfile: () => Promise<void>;
  /** Function to refresh user statistics */
  refreshUserStats: () => Promise<void>;
  /** Function to update user statistics */
  updateUserStats: () => Promise<void>;
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
  const [error, setError] = useState<string | null>(null);

  /**
   * Update user profile
   */
  const updateUserProfile = async (updates: Partial<UserProfile>): Promise<void> => {
    if (!user) {
      setError("User not authenticated");
      return;
    }

    try {
      setError(null);
      const result = await userService.updateProfile(user.uid, updates);
      
      if (result.success) {
        setUserProfile(result.data!);
      } else {
        setError(result.error || "Failed to update profile");
      }
    } catch (error) {
      setError("An unexpected error occurred while updating profile");
    }
  };

  /**
   * Refresh user profile from server
   */
  const refreshUserProfile = async (): Promise<void> => {
    if (!user) {
      setError("User not authenticated");
      return;
    }

    try {
      setError(null);
      setLoading(true);
      const result = await userService.getProfile(user.uid);
      
      if (result.success) {
        setUserProfile(result.data);
      } else {
        setError(result.error || "Failed to refresh profile");
      }
    } catch (error) {
      setError("An unexpected error occurred while refreshing profile");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Refresh user statistics
   */
  const refreshUserStats = async (): Promise<void> => {
    if (!user) {
      setError("User not authenticated");
      return;
    }

    try {
      setError(null);
      const result = await userService.getUserStats(user.uid);
      
      if (result.success) {
        setUserStats(result.data!);
      } else {
        setError(result.error || "Failed to refresh statistics");
      }
    } catch (error) {
      setError("An unexpected error occurred while refreshing statistics");
    }
  };

  /**
   * Update user statistics
   */
  const updateUserStats = async (): Promise<void> => {
    if (!user) {
      setError("User not authenticated");
      return;
    }

    try {
      setError(null);
      const result = await userService.updateUserStats(user.uid);
      
      if (result.success) {
        // Refresh stats after update
        await refreshUserStats();
      } else {
        setError(result.error || "Failed to update statistics");
      }
    } catch (error) {
      setError("An unexpected error occurred while updating statistics");
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
    const initializeUserProfile = async () => {
      try {
        const result = await userService.createProfileFromFirebaseUser(user);
        
        if (result.success) {
          setUserProfile(result.data!);
          // Also load statistics
          await refreshUserStats();
        } else {
          setError(result.error || "Failed to initialize user profile");
        }
      } catch (error) {
        setError("An unexpected error occurred while initializing user profile");
      } finally {
        setLoading(false);
      }
    };

    // Set up real-time profile listener
    const unsubscribe = userService.subscribeToProfile(user.uid, (profile) => {
      setUserProfile(profile);
      setLoading(false);
      setError(null);
    });

    initializeUserProfile();

    return unsubscribe;
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

export default UserProvider;