/**
 * Message Provider
 *
 * Provides React context for personalized message state management.
 * Follows the architectural pattern: Components → Providers → Services → Repositories.
 */

"use client";

import { Unsubscribe } from "firebase/firestore";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import {
  ActivityItem,
  Book,
  PersonalizedMessage,
  UserProfile,
} from "../models/models";
import { messageRepository } from "../repositories/FirebaseMessageRepository";
import { messageService } from "../services/MessageService";
import { useAuthContext } from "./AuthProvider";

interface MessageContextData {
  userProfile: UserProfile;
  books: Book[];
  recentActivity: ActivityItem[];
  stats: {
    totalBooks: number;
    finishedBooks: number;
    currentlyReading: number;
    readingStreak: number;
    totalPagesRead: number;
  };
}

interface MessageContextValue {
  // Current message state
  currentMessage: string | null;
  isLoading: boolean;
  error: string | null;
  lastUpdated: Date | null;

  // Actions
  generateMessage: (data: MessageContextData) => Promise<void>;
  refreshMessage: (data: MessageContextData) => Promise<void>;
  clearError: () => void;

  // Message history (optional)
  messageHistory: PersonalizedMessage[];
  loadMessageHistory: () => Promise<void>;
}

const MessageContext = createContext<MessageContextValue | undefined>(
  undefined
);

interface MessageProviderProps {
  children: React.ReactNode;
}

export const MessageProvider: React.FC<MessageProviderProps> = ({
  children,
}) => {
  const { user } = useAuthContext();
  const [currentMessage, setCurrentMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [messageHistory, setMessageHistory] = useState<PersonalizedMessage[]>(
    []
  );

  // Real-time listener for message updates
  useEffect(() => {
    if (!user?.uid) return;

    let unsubscribe: Unsubscribe | undefined;

    const setupListener = () => {
      unsubscribe = messageRepository.subscribeToLatestMessage(
        user.uid,
        (message) => {
          if (message) {
            setCurrentMessage(message.content);
            setLastUpdated(message.timestamp.toDate());
          } else {
            setCurrentMessage(null);
            setLastUpdated(null);
          }
        }
      );
    };

    setupListener();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [user?.uid]);

  /**
   * Generate personalized message
   */
  const generateMessage = useCallback(
    async (data: MessageContextData): Promise<void> => {
      try {
        setIsLoading(true);
        setError(null);

        const result = await messageService.getPersonalizedMessage(data);

        if (result.success && result.data) {
          // Note: setCurrentMessage and setLastUpdated will be handled by the real-time listener
          // The service handles all fallback logic internally
        } else {
          const errorMessage =
            typeof result.error === "string"
              ? result.error
              : "Failed to generate message";
          setError(errorMessage);
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Unknown error occurred";
        setError(errorMessage);
        console.error("Failed to generate personalized message:", err);
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  /**
   * Force refresh message (bypass cache)
   */
  const refreshMessage = useCallback(
    async (data: MessageContextData): Promise<void> => {
      try {
        setIsLoading(true);
        setError(null);

        const result = await messageService.getPersonalizedMessage(data, true);

        if (!result.success) {
          const errorMessage =
            typeof result.error === "string"
              ? result.error
              : "Failed to refresh message";
          setError(errorMessage);
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Unknown error occurred";
        setError(errorMessage);
        console.error("Failed to refresh personalized message:", err);
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  /**
   * Clear error state
   */
  const clearError = useCallback((): void => {
    setError(null);
  }, []);

  /**
   * Load message history for debugging/analytics
   */
  const loadMessageHistory = useCallback(async (): Promise<void> => {
    if (!user?.uid) return;

    try {
      const result = await messageService.getMessageHistory(user.uid, 10);

      if (result.success && result.data) {
        setMessageHistory(result.data);
      } else {
        console.error("Failed to load message history:", result.error);
      }
    } catch (err) {
      console.error("Error loading message history:", err);
    }
  }, [user?.uid]);

  const contextValue: MessageContextValue = {
    // State
    currentMessage,
    isLoading,
    error,
    lastUpdated,
    messageHistory,

    // Actions
    generateMessage,
    refreshMessage,
    clearError,
    loadMessageHistory,
  };

  return (
    <MessageContext.Provider value={contextValue}>
      {children}
    </MessageContext.Provider>
  );
};

/**
 * Hook to use message context
 */
export const useMessageContext = (): MessageContextValue => {
  const context = useContext(MessageContext);

  if (context === undefined) {
    throw new Error("useMessageContext must be used within a MessageProvider");
  }

  return context;
};

export default MessageProvider;
