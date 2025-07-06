"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { User, onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, setDoc, updateDoc, Timestamp } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { UserProfile } from "@/lib/models";
import { useRouter } from "next/navigation";

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  isAuthenticated: boolean;
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

  const createOrUpdateUserProfile = async (
    firebaseUser: User,
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

        await updateDoc(profileRef, updatedProfile);
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

  const updateUserProfile = async (
    updates: Partial<UserProfile>,
  ): Promise<void> => {
    if (!user || !userProfile) return;

    const profileRef = doc(db, `users/${user.uid}/profile/main`);
    const updatedProfile = {
      ...updates,
      updatedAt: Timestamp.now(),
    };

    try {
      await updateDoc(profileRef, updatedProfile);
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

export const useAuthContext = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuthContext must be used within an AuthProvider");
  }
  return context;
};

export default AuthProvider;
