/**
 * Event Service
 *
 * Handles business logic for event operations, including recent activity
 * transformation and event-related functionality.
 */

import { EVENT_CONFIG } from "../constants/constants";
import { BRAND_COLORS, STATUS_COLORS } from "../design/colors";
import {
  createSystemError,
  createValidationError,
} from "../errors/error-handling";
import { Book, BookEvent } from "../models/models";
import { firebaseBookRepository } from "../repositories/FirebaseBookRepository";
import { firebaseEventRepository } from "../repositories/FirebaseEventRepository";
import { ServiceResult } from "./types";

/**
 * Activity item for dashboard display
 */
export interface ActivityItem {
  id: string;
  type: "finished" | "started" | "rated" | "added" | "progress";
  bookTitle: string;
  bookId: string;
  details?: string;
  timestamp: Date;
  colorClass: string;
}

/**
 * Event service interface
 */
export interface IEventService {
  /**
   * Get recent events for a user
   */
  getRecentEvents(
    userId: string,
    limit?: number
  ): Promise<ServiceResult<BookEvent[]>>;

  /**
   * Get recent activity items for dashboard
   */
  getRecentActivityItems(
    userId: string,
    limit?: number
  ): Promise<ServiceResult<ActivityItem[]>>;

  /**
   * Log a new event
   */
  logEvent(
    userId: string,
    event: Omit<BookEvent, "id" | "userId" | "timestamp">
  ): Promise<ServiceResult<string>>;

  /**
   * Get events for a specific book
   */
  getBookEvents(
    userId: string,
    bookId: string
  ): Promise<ServiceResult<BookEvent[]>>;
}

/**
 * Event service implementation
 */
export class EventService implements IEventService {
  constructor(
    private eventRepository = firebaseEventRepository,
    private bookRepository = firebaseBookRepository
  ) {}

  /**
   * Get recent events for a user
   */
  async getRecentEvents(
    userId: string,
    limit: number = EVENT_CONFIG.RECENT_EVENTS_LIMIT
  ): Promise<ServiceResult<BookEvent[]>> {
    try {
      if (!userId) {
        return {
          success: false,
          error: createValidationError("User ID is required"),
        };
      }

      const result = await this.eventRepository.getRecentEvents(userId, limit);

      if (!result.success) {
        return {
          success: false,
          error: createSystemError(
            result.error || "Failed to fetch recent events"
          ),
        };
      }

      return {
        success: true,
        data: result.data || [],
      };
    } catch (error) {
      return {
        success: false,
        error: createSystemError("Failed to get recent events", error as Error),
      };
    }
  }

  /**
   * Get recent activity items for dashboard
   */
  async getRecentActivityItems(
    userId: string,
    limit: number = EVENT_CONFIG.USER_ACTIVITY_LIMIT
  ): Promise<ServiceResult<ActivityItem[]>> {
    try {
      if (!userId) {
        return {
          success: false,
          error: createValidationError("User ID is required"),
        };
      }

      // Get recent events
      const eventsResult = await this.getRecentEvents(userId, limit);
      if (!eventsResult.success || !eventsResult.data) {
        return {
          success: false,
          error:
            eventsResult.error || createSystemError("Failed to fetch events"),
        };
      }

      // Get book titles for events
      const bookIds = [
        ...new Set(eventsResult.data.map((event) => event.bookId)),
      ];
      const books = new Map<string, Book>();

      for (const bookId of bookIds) {
        const bookResult = await this.bookRepository.getBook(userId, bookId);
        if (bookResult.success && bookResult.data) {
          books.set(bookId, bookResult.data);
        }
      }

      // Transform events to activity items
      const activityItems: ActivityItem[] = eventsResult.data
        .map((event) =>
          this.transformEventToActivityItem(event, books.get(event.bookId))
        )
        .filter((item): item is ActivityItem => item !== null);

      return {
        success: true,
        data: activityItems,
      };
    } catch (error) {
      return {
        success: false,
        error: createSystemError(
          "Failed to get recent activity items",
          error as Error
        ),
      };
    }
  }

  /**
   * Log a new event
   */
  async logEvent(
    userId: string,
    event: Omit<BookEvent, "id" | "userId" | "timestamp">
  ): Promise<ServiceResult<string>> {
    try {
      if (!userId) {
        return {
          success: false,
          error: createValidationError("User ID is required"),
        };
      }

      if (!event.bookId) {
        return {
          success: false,
          error: createValidationError("Book ID is required"),
        };
      }

      const result = await this.eventRepository.logEvent(userId, event);

      if (!result.success) {
        return {
          success: false,
          error: createSystemError(result.error || "Failed to log event"),
        };
      }

      return {
        success: true,
        data: result.data || "",
      };
    } catch (error) {
      return {
        success: false,
        error: createSystemError("Failed to log event", error as Error),
      };
    }
  }

  /**
   * Get events for a specific book
   */
  async getBookEvents(
    userId: string,
    bookId: string
  ): Promise<ServiceResult<BookEvent[]>> {
    try {
      if (!userId) {
        return {
          success: false,
          error: createValidationError("User ID is required"),
        };
      }

      if (!bookId) {
        return {
          success: false,
          error: createValidationError("Book ID is required"),
        };
      }

      const result = await this.eventRepository.getBookEvents(userId, bookId);

      if (!result.success) {
        return {
          success: false,
          error: createSystemError(
            result.error || "Failed to fetch book events"
          ),
        };
      }

      return {
        success: true,
        data: result.data || [],
      };
    } catch (error) {
      return {
        success: false,
        error: createSystemError("Failed to get book events", error as Error),
      };
    }
  }

  /**
   * Transform event to activity item
   */
  private transformEventToActivityItem(
    event: BookEvent,
    book?: Book
  ): ActivityItem | null {
    if (!book) {
      return null;
    }

    const baseItem = {
      id: event.id,
      bookTitle: book.title,
      bookId: event.bookId,
      timestamp: event.timestamp.toDate(),
    };

    switch (event.type) {
      case "state_change":
        return this.transformStateChangeEvent(event, baseItem);
      case "progress_update":
        return this.transformProgressUpdateEvent(event, baseItem);
      case "rating_added":
        return this.transformRatingAddedEvent(event, baseItem);
      default:
        return null;
    }
  }

  /**
   * Transform state change event
   */
  private transformStateChangeEvent(
    event: BookEvent,
    baseItem: Omit<ActivityItem, "type" | "colorClass" | "details">
  ): ActivityItem {
    const { newState, previousState } = event.data;

    if (newState === "finished") {
      return {
        ...baseItem,
        type: "finished",
        colorClass: STATUS_COLORS.success.bg,
        details: undefined,
      };
    } else if (newState === "in_progress" && previousState === "not_started") {
      return {
        ...baseItem,
        type: "started",
        colorClass: BRAND_COLORS.primary.bg,
        details: undefined,
      };
    } else if (newState === "not_started" && !previousState) {
      return {
        ...baseItem,
        type: "added",
        colorClass: BRAND_COLORS.accent.bg,
        details: undefined,
      };
    } else {
      return {
        ...baseItem,
        type: "started",
        colorClass: BRAND_COLORS.primary.bg,
        details: undefined,
      };
    }
  }

  /**
   * Transform progress update event
   */
  private transformProgressUpdateEvent(
    event: BookEvent,
    baseItem: Omit<ActivityItem, "type" | "colorClass" | "details">
  ): ActivityItem {
    const { newPage } = event.data;
    const pagesRead = newPage ? newPage - (event.data.previousPage || 0) : 0;

    return {
      ...baseItem,
      type: "progress",
      colorClass: STATUS_COLORS.info.bg,
      details: pagesRead ? `${pagesRead} pages` : undefined,
    };
  }

  /**
   * Transform rating added event
   */
  private transformRatingAddedEvent(
    event: BookEvent,
    baseItem: Omit<ActivityItem, "type" | "colorClass" | "details">
  ): ActivityItem {
    const { rating } = event.data;

    return {
      ...baseItem,
      type: "rated",
      colorClass: STATUS_COLORS.warning.bg,
      details: rating ? `${rating} stars` : undefined,
    };
  }
}

// Export singleton instance
export const eventService = new EventService();
