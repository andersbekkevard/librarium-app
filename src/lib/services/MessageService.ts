/**
 * Message Service
 *
 * Business logic for personalized message management, including cache checking,
 * AI message generation, and coordination with the repository layer.
 */

import { Timestamp } from "firebase/firestore";
import { getAI, getGenerativeModel, GoogleAIBackend } from "firebase/ai";
import { 
  PersonalizedMessage, 
  validatePersonalizedMessage,
  ActivityItem,
  Book,
  UserProfile
} from "../models/models";
import { IMessageRepository } from "../repositories/types";
import { messageRepository } from "../repositories/FirebaseMessageRepository";
import { ServiceResult } from "./types";
import { createSystemError } from "../errors/error-handling";
import app from "../api/firebase";

// Initialize Gemini AI using the singleton Firebase app
const ai = getAI(app, { backend: new GoogleAIBackend() });
const model = getGenerativeModel(ai, { model: "gemini-2.5-flash-lite" });

interface PersonalizedMessageData {
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

// Message refresh duration: 24 hours
const MESSAGE_REFRESH_DURATION_MS = 24 * 60 * 60 * 1000;

// Fallback messages for when AI is unavailable
const FALLBACK_MESSAGES = [
  "Keep up the great reading! Every page brings new discoveries.",
  "Your reading journey is inspiring. What story will you dive into next?",
  "Books are the gateway to endless worlds. Happy reading!",
  "Each book you read adds to your incredible literary adventure.",
  "Reading is not just a hobby, it's a superpower. Keep going!",
];

export class MessageService {
  constructor(private messageRepository: IMessageRepository) {}

  /**
   * Check if a message needs to be refreshed (older than 24 hours)
   */
  private shouldRefreshMessage(message: PersonalizedMessage): boolean {
    const messageAge = Date.now() - message.timestamp.toMillis();
    return messageAge > MESSAGE_REFRESH_DURATION_MS;
  }

  /**
   * Build AI prompt based on user data
   */
  private buildPrompt(data: PersonalizedMessageData): string {
    const { userProfile, books, stats, recentActivity } = data;

    const currentlyReadingBooks = books.filter(
      (book) => book.state === "in_progress"
    );
    const recentlyFinished = books
      .filter((book) => book.state === "finished")
      .sort(
        (a, b) =>
          (b.finishedAt?.toMillis() || 0) - (a.finishedAt?.toMillis() || 0)
      )
      .slice(0, 3);

    const genres = books
      .filter((book) => book.genre)
      .map((book) => book.genre)
      .filter((genre, index, arr) => arr.indexOf(genre) === index)
      .slice(0, 5);

    return `You are Librarium's AI reading companion. Generate a personalized, encouraging message for ${
      userProfile.displayName
    } based on their reading data.

Reading Statistics:
- Total books in library: ${stats.totalBooks}
- Books finished: ${stats.finishedBooks}
- Currently reading: ${stats.currentlyReading}
- Reading streak: ${stats.readingStreak} days
- Total pages read: ${stats.totalPagesRead}

Currently Reading:
${
  currentlyReadingBooks
    .map(
      (book) =>
        `- "${book.title}" by ${book.author} (${Math.round(
          (book.progress.currentPage / book.progress.totalPages) * 100
        )}% complete)`
    )
    .join("\n") || "No books currently being read"
}

Recently Finished:
${
  recentlyFinished
    .map(
      (book) =>
        `- "${book.title}" by ${book.author}${
          book.rating ? ` (rated ${book.rating}/5 stars)` : ""
        }`
    )
    .join("\n") || "No books finished recently"
}

Favorite Genres: ${genres.join(", ") || "Not yet determined"}

Recent Activity: ${
      recentActivity
        .slice(0, 3)
        .map((activity) => activity.type)
        .join(", ") || "No recent activity"
    }

Generate a warm, encouraging message (50-80 words) that:
1. Acknowledges their reading progress or achievements
2. Provides gentle motivation to continue reading
3. References specific aspects of their reading habits when relevant
4. Maintains an upbeat, supportive tone
5. Feels personal and tailored to their data

Keep it conversational and inspiring, avoiding generic advice. Focus on celebrating their reading journey.`;
  }

  /**
   * Generate AI message using Gemini
   */
  private async generateAIMessage(data: PersonalizedMessageData): Promise<string> {
    const prompt = this.buildPrompt(data);
    const result = await model.generateContent(prompt);
    return result.response.text().trim();
  }

  /**
   * Get fallback message based on user stats
   */
  private getFallbackMessage(stats: PersonalizedMessageData["stats"]): string {
    if (stats.readingStreak > 7) {
      return `Amazing ${stats.readingStreak}-day reading streak! Your dedication to reading is truly inspiring. Keep up this fantastic momentum!`;
    }

    if (stats.currentlyReading > 0) {
      return `You're currently reading ${stats.currentlyReading} book${
        stats.currentlyReading > 1 ? "s" : ""
      }! That's wonderful progress. Every page brings new discoveries.`;
    }

    if (stats.finishedBooks > 0) {
      return `Congratulations on finishing ${stats.finishedBooks} book${
        stats.finishedBooks > 1 ? "s" : ""
      }! Your reading journey is building something beautiful.`;
    }

    // Default fallback
    return FALLBACK_MESSAGES[
      Math.floor(Math.random() * FALLBACK_MESSAGES.length)
    ];
  }

  /**
   * Get personalized message for user (main service method)
   * Simple logic: if no message or message is older than 24 hours, generate new one
   */
  async getPersonalizedMessage(
    data: PersonalizedMessageData
  ): Promise<ServiceResult<string>> {
    try {
      const userId = data.userProfile.id;

      // Get latest message from repository
      const latestMessageResult = await this.messageRepository.getLatestMessage(userId);
      
      if (!latestMessageResult.success) {
        return {
          success: false,
          error: createSystemError(latestMessageResult.error || "Failed to retrieve latest message"),
        };
      }

      const latestMessage = latestMessageResult.data;

      // Simple check: if no message or message is older than 24 hours, generate new one
      if (!latestMessage || this.shouldRefreshMessage(latestMessage)) {
        // Generate new message
        let messageContent: string;
        try {
          messageContent = await this.generateAIMessage(data);
          
          // Validate generated message
          if (!validatePersonalizedMessage(messageContent)) {
            throw new Error("Generated message failed validation");
          }
        } catch (aiError) {
          console.error("AI message generation failed:", aiError);
          
          // If we have an existing message, use it even if old
          if (latestMessage && latestMessage.content) {
            return {
              success: true,
              data: latestMessage.content,
            };
          }
          
          messageContent = this.getFallbackMessage(data.stats);
        }

        // Save new message to repository
        const saveResult = await this.messageRepository.saveMessage(userId, {
          userId,
          content: messageContent,
          timestamp: Timestamp.now(),
        });

        if (!saveResult.success) {
          console.error("Failed to save message:", saveResult.error);
          // Still return the generated message even if save failed
        }

        return {
          success: true,
          data: messageContent,
        };
      }

      // Use existing message
      return {
        success: true,
        data: latestMessage.content,
      };
    } catch (error) {
      console.error("Message service error:", error);
      
      // Return fallback message on any error
      const fallbackMessage = this.getFallbackMessage(data.stats);
      return {
        success: true,
        data: fallbackMessage,
      };
    }
  }

  /**
   * Get message history for a user
   */
  async getMessageHistory(
    userId: string,
    limit?: number
  ): Promise<ServiceResult<PersonalizedMessage[]>> {
    const result = await this.messageRepository.getMessageHistory(userId, limit);
    
    if (!result.success) {
      return {
        success: false,
        error: createSystemError(result.error || "Failed to get message history"),
      };
    }

    return {
      success: true,
      data: result.data || [],
    };
  }

  /**
   * Clean up old messages (maintenance operation)
   */
  async cleanupOldMessages(
    userId: string,
    olderThanDays: number = 30
  ): Promise<ServiceResult<void>> {
    const result = await this.messageRepository.deleteOldMessages(userId, olderThanDays);
    
    if (!result.success) {
      return {
        success: false,
        error: createSystemError(result.error || "Failed to cleanup old messages"),
      };
    }

    return {
      success: true,
    };
  }
}

// Export service instance
export const messageService = new MessageService(messageRepository);