/**
 * App Providers Wrapper
 *
 * Combines all context providers in the correct order for the application.
 * This simplifies provider setup in the app layout.
 */

import React from "react";
import { AuthProvider } from "./AuthProvider";
import { UserProvider } from "./UserProvider";
import { BooksProvider } from "./BooksProvider";

interface AppProvidersProps {
  children: React.ReactNode;
}

/**
 * Combined app providers wrapper
 * 
 * Provides all necessary context providers in the correct order:
 * 1. AuthProvider - Authentication state
 * 2. UserProvider - User profile state (depends on auth)
 * 3. BooksProvider - Book collection state (depends on auth and user)
 */
const AppProviders: React.FC<AppProvidersProps> = ({ children }) => {
  return (
    <AuthProvider>
      <UserProvider>
        <BooksProvider>
          {children}
        </BooksProvider>
      </UserProvider>
    </AuthProvider>
  );
};

export default AppProviders;