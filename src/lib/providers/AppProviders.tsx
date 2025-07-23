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
import { EventsProvider } from "./EventsProvider";
import { MessageProvider } from "./MessageProvider";

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
 * 4. EventsProvider - Events and activity data (depends on auth and user)
 * 5. MessageProvider - Personalized AI messages (depends on auth and user data)
 */
const AppProviders: React.FC<AppProvidersProps> = ({ children }) => {
  return (
    <AuthProvider>
      <UserProvider>
        <BooksProvider>
          <EventsProvider>
            <MessageProvider>
              {children}
            </MessageProvider>
          </EventsProvider>
        </BooksProvider>
      </UserProvider>
    </AuthProvider>
  );
};

export default AppProviders;