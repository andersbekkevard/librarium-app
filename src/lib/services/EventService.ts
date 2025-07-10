/**
 * Event Service
 *
 * Handles business logic for event operations, including recent activity
 * transformation and event-related functionality.
 */

import { BookEvent, Book } from "../models";
import { ServiceResult } from "./types";
import { firebaseEventRepository } from "../repositories/FirebaseEventRepository";
import { firebaseBookRepository } from "../repositories/FirebaseBookRepository";

/**
 * Activity item for dashboard display
 */
export interface ActivityItem {
  id: string;
  type: 'finished' | 'started' | 'rated' | 'added' | 'progress';
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
    limit: number = 10
  ): Promise<ServiceResult<BookEvent[]>> {
    try {
      if (!userId) {
        return {
          success: false,
          error: "User ID is required"
        };
      }

      const result = await this.eventRepository.getRecentEvents(userId, limit);
      
      if (!result.success) {
        return {
          success: false,
          error: result.error || "Failed to fetch recent events"
        };
      }

      return {
        success: true,
        data: result.data || []
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred"
      };
    }
  }

  /**
   * Get recent activity items for dashboard
   */
  async getRecentActivityItems(
    userId: string,
    limit: number = 5
  ): Promise<ServiceResult<ActivityItem[]>> {
    try {
      if (!userId) {
        return {
          success: false,
          error: "User ID is required"
        };
      }

      // Get recent events
      const eventsResult = await this.getRecentEvents(userId, limit);
      if (!eventsResult.success || !eventsResult.data) {
        return {
          success: false,
          error: eventsResult.error || "Failed to fetch events"
        };
      }

      // Get book titles for events
      const bookIds = [...new Set(eventsResult.data.map(event => event.bookId))];
      const books = new Map<string, Book>();
      
      for (const bookId of bookIds) {
        const bookResult = await this.bookRepository.getBook(userId, bookId);
        if (bookResult.success && bookResult.data) {
          books.set(bookId, bookResult.data);
        }
      }

      // Transform events to activity items
      const activityItems: ActivityItem[] = eventsResult.data
        .map(event => this.transformEventToActivityItem(event, books.get(event.bookId)))
        .filter((item): item is ActivityItem => item !== null);

      return {
        success: true,
        data: activityItems
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred"
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
          error: "User ID is required"
        };
      }

      if (!event.bookId) {
        return {
          success: false,
          error: "Book ID is required"
        };
      }

      const result = await this.eventRepository.logEvent(userId, event);
      
      if (!result.success) {
        return {
          success: false,
          error: result.error || "Failed to log event"
        };
      }

      return {
        success: true,
        data: result.data || ""
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred"
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
          error: "User ID is required"
        };
      }

      if (!bookId) {
        return {
          success: false,
          error: "Book ID is required"
        };
      }

      const result = await this.eventRepository.getBookEvents(userId, bookId);
      
      if (!result.success) {
        return {
          success: false,
          error: result.error || "Failed to fetch book events"
        };
      }

      return {
        success: true,
        data: result.data || []
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred"
      };
    }
  }

  /**
   * Transform a BookEvent to an ActivityItem
   */
  private transformEventToActivityItem(
    event: BookEvent,
    book?: Book
  ): ActivityItem | null {
    if (!book) {
      return null; // Cannot display activity without book title
    }

    const baseItem = {
      id: event.id,
      bookTitle: book.title,
      bookId: event.bookId,
      timestamp: event.timestamp.toDate(),
    };

    switch (event.type) {
      case 'state_change':
        return this.transformStateChangeEvent(event, baseItem);
      case 'progress_update':
        return this.transformProgressUpdateEvent(event, baseItem);
      case 'rating_added':
        return this.transformRatingAddedEvent(event, baseItem);
      default:
        return null;
    }
  }

  /**
   * Transform state change event to activity item
   */
  private transformStateChangeEvent(
    event: BookEvent,
    baseItem: Omit<ActivityItem, 'type' | 'colorClass' | 'details'>
  ): ActivityItem {
    const newState = event.data.newState;
    
    switch (newState) {
      case 'in_progress':
        return {
          ...baseItem,
          type: 'started',
          colorClass: 'bg-brand-primary',
        };
      case 'finished':
        return {
          ...baseItem,
          type: 'finished',
          colorClass: 'bg-status-success',
        };
      default:
        return {
          ...baseItem,
          type: 'added',
          colorClass: 'bg-brand-accent',
        };
    }
  }

  /**
   * Transform progress update event to activity item
   */
  private transformProgressUpdateEvent(
    event: BookEvent,
    baseItem: Omit<ActivityItem, 'type' | 'colorClass' | 'details'>
  ): ActivityItem {
    const newPage = event.data.newPage;
    const details = newPage ? `page ${newPage}` : undefined;
    
    return {
      ...baseItem,
      type: 'progress',
      colorClass: 'bg-status-info',
      details,
    };
  }

  /**
   * Transform rating added event to activity item
   */
  private transformRatingAddedEvent(
    event: BookEvent,
    baseItem: Omit<ActivityItem, 'type' | 'colorClass' | 'details'>
  ): ActivityItem {
    const rating = event.data.rating;
    const details = rating ? `${rating} stars` : undefined;
    
    return {
      ...baseItem,
      type: 'rated',
      colorClass: 'bg-status-warning',
      details,
    };
  }
}

// Export singleton instance
export const eventService = new EventService();