"use client";

/**
 * Authentication Context Provider
 *
 * Manages user authentication state and user profile data throughout the app.
 * Provides real-time auth state monitoring and automatic user profile management.
 * Used as the root authentication provider in the app layout.
 */

import { auth, db } from "@/lib/firebase";
import { UserProfile } from "@/lib/models";
import { User, onAuthStateChanged } from "firebase/auth";
import { Timestamp, doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import React, { createContext, useContext, useEffect, useState } from "react";

/**
 * Authentication context type definition
 *
 * Defines the shape of the authentication context available to components.
 */
interface AuthContextType {
  /** Current Firebase user or null if not authenticated */
  user: User | null;
  /** User profile from Firestore or null if not available */
  userProfile: UserProfile | null;
  /** Whether auth state is still loading */
  loading: boolean;
  /** Convenience boolean for authentication status */
  isAuthenticated: boolean;
  /** Function to update user profile in Firestore */
  updateUserProfile: (updates: Partial<UserProfile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  /**
   * Creates or updates user profile in Firestore
   *
   * Automatically called when user signs in. If profile exists, updates it
   * with latest Firebase Auth data. If not, creates a new profile with
   * default values.
   *
   * @param firebaseUser - Firebase user object from auth state change
   * @returns Promise<UserProfile> - The created or updated user profile
   *
   * @example
   * // Called automatically by auth state listener
   * const profile = await createOrUpdateUserProfile(firebaseUser);
   */
  const createOrUpdateUserProfile = async (
    firebaseUser: User
  ): Promise<UserProfile> => {
    const profileRef = doc(db, `users/${firebaseUser.uid}/profile/main`);

    try {
      const profileDoc = await getDoc(profileRef);

      if (profileDoc.exists()) {
        // Update existing profile with latest auth data
        const existingProfile = profileDoc.data() as UserProfile;
        const updatedProfile: UserProfile = {
          ...existingProfile,
          displayName: firebaseUser.displayName || existingProfile.displayName,
          email: firebaseUser.email || existingProfile.email,
          photoURL: firebaseUser.photoURL || existingProfile.photoURL,
          emailVerified: firebaseUser.emailVerified,
          lastSignInTime: firebaseUser.metadata.lastSignInTime || "",
          updatedAt: Timestamp.now(),
        };

        await updateDoc(profileRef, updatedProfile as any);
        return updatedProfile;
      } else {
        // Create new profile
        const newProfile: UserProfile = {
          id: firebaseUser.uid,
          displayName: firebaseUser.displayName || "Anonymous User",
          email: firebaseUser.email || "",
          photoURL: firebaseUser.photoURL || undefined,
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now(),
          emailVerified: firebaseUser.emailVerified,
          lastSignInTime: firebaseUser.metadata.lastSignInTime || "",
          totalBooksRead: 0,
          currentlyReading: 0,
          booksInLibrary: 0,
        };

        await setDoc(profileRef, newProfile);
        return newProfile;
      }
    } catch (error) {
      console.error("Error managing user profile:", error);
      throw error;
    }
  };

  /**
   * Updates user profile in Firestore
   *
   * Updates the user's profile document with provided changes and
   * automatically adds an updatedAt timestamp. Also updates local state.
   * Used by components that need to modify user profile data.
   *
   * @param updates - Partial user profile data to update
   * @returns Promise<void>
   *
   * @example
   * // Update reading statistics
   * await updateUserProfile({
   *   totalBooksRead: 15,
   *   currentlyReading: 3
   * });
   */
  const updateUserProfile = async (
    updates: Partial<UserProfile>
  ): Promise<void> => {
    if (!user || !userProfile) return;

    const profileRef = doc(db, `users/${user.uid}/profile/main`);
    const updatedProfile = {
      ...updates,
      updatedAt: Timestamp.now(),
    };

    try {
      await updateDoc(profileRef, updatedProfile as any);
      setUserProfile((prev) => (prev ? { ...prev, ...updatedProfile } : null));
    } catch (error) {
      console.error("Error updating user profile:", error);
      throw error;
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);

      if (firebaseUser) {
        try {
          const profile = await createOrUpdateUserProfile(firebaseUser);
          setUserProfile(profile);
        } catch (error) {
          console.error("Failed to load user profile:", error);
          setUserProfile(null);
        }
      } else {
        setUserProfile(null);
      }

      setLoading(false);
    });

    return unsubscribe;
  }, [router]);

  const value: AuthContextType = {
    user,
    userProfile,
    loading,
    isAuthenticated: !!user,
    updateUserProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

/**
 * Hook to access authentication context
 *
 * Provides access to the current authentication state and user profile.
 * Must be used within an AuthProvider component tree.
 *
 * @returns AuthContextType - Current authentication context
 * @throws Error - If used outside of AuthProvider
 *
 * @example
 * const { user, userProfile, loading, isAuthenticated, updateUserProfile } = useAuthContext();
 *
 * if (loading) return <div>Loading...</div>;
 * if (!isAuthenticated) return <LoginForm />;
 *
 * return <div>Welcome, {userProfile?.displayName}</div>;
 */
export const useAuthContext = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuthContext must be used within an AuthProvider");
  }
  return context;
};

export default AuthProvider;
