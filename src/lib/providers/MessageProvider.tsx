/**
 * Message Provider
 *
 * Provides React context for personalized message state management.
 * Follows the architectural pattern: Components → Providers → Services → Repositories.
 */

"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { Unsubscribe } from "firebase/firestore";
import { PersonalizedMessage, ActivityItem, Book, UserProfile } from "../models/models";
import { messageService } from "../services/MessageService";
import { messageRepository } from "../repositories/FirebaseMessageRepository";
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

const MessageContext = createContext<MessageContextValue | undefined>(undefined);

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
  const [messageHistory, setMessageHistory] = useState<PersonalizedMessage[]>([]);

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
  const generateMessage = useCallback(async (data: MessageContextData): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);

      const result = await messageService.getPersonalizedMessage(data);

      if (result.success && result.data) {
        setCurrentMessage(result.data);
        setLastUpdated(new Date());
      } else {
        const errorMessage = typeof result.error === 'string' ? result.error : "Failed to generate message";
        throw new Error(errorMessage);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error occurred";
      setError(errorMessage);
      console.error("Failed to generate personalized message:", err);
      
      // Set fallback message on error
      const fallbackMessage = getFallbackMessage(data.stats);
      setCurrentMessage(fallbackMessage);
      setLastUpdated(new Date());
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Force refresh message (bypass cache)
   */
  const refreshMessage = useCallback(async (data: MessageContextData): Promise<void> => {
    // Clear current message to force regeneration
    setCurrentMessage(null);
    setLastUpdated(null);
    await generateMessage(data);
  }, [generateMessage]);

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

  /**
   * Generate fallback message based on stats
   */
  const getFallbackMessage = (stats: MessageContextData["stats"]): string => {
    if (stats.readingStreak > 7) {
      return `Amazing ${stats.readingStreak}-day reading streak! Your dedication to reading is truly inspiring.`;
    }

    if (stats.currentlyReading > 0) {
      return `You're currently reading ${stats.currentlyReading} book${
        stats.currentlyReading > 1 ? "s" : ""
      }! That's wonderful progress.`;
    }

    if (stats.finishedBooks > 0) {
      return `Congratulations on finishing ${stats.finishedBooks} book${
        stats.finishedBooks > 1 ? "s" : ""
      }! Your reading journey is building something beautiful.`;
    }

    return "Your reading journey is unique and wonderful. Keep exploring new worlds through books!";
  };

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