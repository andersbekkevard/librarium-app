/**
 * Event Service
 *
 * Handles business logic for event operations, including recent activity
 * transformation and event-related functionality.
 */

import { Timestamp } from "firebase/firestore";
import { EVENT_CONFIG } from "../constants/constants";
import { BRAND_COLORS, STATUS_COLORS } from "../design/colors";
import {
  createSystemError,
  createValidationError,
} from "../errors/error-handling";
import {
  ActivityItem,
  Book,
  BookComment,
  BookEvent,
  BookReview,
  ReadingState,
  validateComment,
  validateCommentPage,
  validateReview,
} from "../models/models";
import { firebaseBookRepository } from "../repositories/FirebaseBookRepository";
import { firebaseEventRepository } from "../repositories/FirebaseEventRepository";
import { ServiceResult } from "./types";

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

  /**
   * Add a comment to a book
   */
  addComment(
    userId: string,
    bookId: string,
    comment: string,
    readingState: ReadingState,
    currentPage: number
  ): Promise<ServiceResult<string>>;

  /**
   * Get comments for a specific book
   */
  getBookComments(
    userId: string,
    bookId: string
  ): Promise<ServiceResult<BookComment[]>>;

  /**
   * Add a review for a finished book
   */
  addReview(
    userId: string,
    bookId: string,
    reviewText: string
  ): Promise<ServiceResult<string>>;

  /**
   * Update an existing review
   */
  updateReview(
    userId: string,
    bookId: string,
    reviewText: string
  ): Promise<ServiceResult<void>>;

  /**
   * Get review for a specific book
   */
  getBookReview(
    userId: string,
    bookId: string
  ): Promise<ServiceResult<BookReview | null>>;
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
   * Add a comment to a book
   */
  async addComment(
    userId: string,
    bookId: string,
    comment: string,
    readingState: ReadingState,
    currentPage: number
  ): Promise<ServiceResult<string>> {
    try {
      // Validate inputs
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

      if (!validateComment(comment)) {
        return {
          success: false,
          error: createValidationError(
            "Comment must be between 1 and 2000 characters"
          ),
        };
      }

      // Get book to validate page number
      const bookResult = await this.bookRepository.getBook(userId, bookId);
      if (!bookResult.success || !bookResult.data) {
        return {
          success: false,
          error: createValidationError("Book not found"),
        };
      }

      const book = bookResult.data;
      if (!validateCommentPage(currentPage, book.progress.totalPages)) {
        return {
          success: false,
          error: createValidationError("Invalid page number"),
        };
      }

      // Create comment event
      const event: Omit<BookEvent, "id" | "userId" | "timestamp"> = {
        bookId,
        type: "comment",
        data: {
          comment: comment.trim(),
          commentState: readingState,
          commentPage: currentPage,
        },
      };

      const result = await this.logEvent(userId, event);

      if (!result.success) {
        return {
          success: false,
          error: createSystemError(
            typeof result.error === "string"
              ? result.error
              : "Failed to add comment"
          ),
        };
      }

      return {
        success: true,
        data: result.data || "",
      };
    } catch (error) {
      return {
        success: false,
        error: createSystemError("Failed to add comment", error as Error),
      };
    }
  }

  /**
   * Get comments for a specific book
   */
  async getBookComments(
    userId: string,
    bookId: string
  ): Promise<ServiceResult<BookComment[]>> {
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

      // Get all events for the book
      const eventsResult = await this.getBookEvents(userId, bookId);
      if (!eventsResult.success || !eventsResult.data) {
        return {
          success: false,
          error:
            eventsResult.error ||
            createSystemError("Failed to fetch book events"),
        };
      }

      // Filter comment events and transform to BookComment objects
      const commentEvents = eventsResult.data.filter(
        (event) => event.type === "comment"
      );
      const comments: BookComment[] = commentEvents
        .map((event) => this.transformEventToComment(event))
        .filter((comment): comment is BookComment => comment !== null)
        .sort((a, b) => b.timestamp.toMillis() - a.timestamp.toMillis()); // Sort newest first

      return {
        success: true,
        data: comments,
      };
    } catch (error) {
      return {
        success: false,
        error: createSystemError("Failed to get book comments", error as Error),
      };
    }
  }

  /**
   * Add a review for a finished book
   */
  async addReview(
    userId: string,
    bookId: string,
    reviewText: string
  ): Promise<ServiceResult<string>> {
    try {
      // Validate inputs
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

      if (!validateReview(reviewText)) {
        return {
          success: false,
          error: createValidationError(
            "Review must be between 10 and 5000 characters"
          ),
        };
      }

      // Get book to validate it's finished
      const bookResult = await this.bookRepository.getBook(userId, bookId);
      if (!bookResult.success || !bookResult.data) {
        return {
          success: false,
          error: createValidationError("Book not found"),
        };
      }

      const book = bookResult.data;
      if (book.state !== "finished") {
        return {
          success: false,
          error: createValidationError("Reviews can only be added to finished books"),
        };
      }

      // Check if review already exists
      const existingReviewResult = await this.getBookReview(userId, bookId);
      if (existingReviewResult.success && existingReviewResult.data) {
        return {
          success: false,
          error: createValidationError("A review already exists for this book. Use updateReview to modify it."),
        };
      }

      // Create review event
      const currentTime = Timestamp.now();
      const event: Omit<BookEvent, "id" | "userId" | "timestamp"> = {
        bookId,
        type: "review",
        data: {
          review: reviewText.trim(),
          reviewCreatedAt: currentTime,
          reviewUpdatedAt: currentTime,
        },
      };

      const result = await this.logEvent(userId, event);

      if (!result.success) {
        return {
          success: false,
          error: createSystemError(
            typeof result.error === "string"
              ? result.error
              : "Failed to add review"
          ),
        };
      }

      return {
        success: true,
        data: result.data || "",
      };
    } catch (error) {
      return {
        success: false,
        error: createSystemError("Failed to add review", error as Error),
      };
    }
  }

  /**
   * Update an existing review
   */
  async updateReview(
    userId: string,
    bookId: string,
    reviewText: string
  ): Promise<ServiceResult<void>> {
    try {
      // Validate inputs
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

      if (!validateReview(reviewText)) {
        return {
          success: false,
          error: createValidationError(
            "Review must be between 10 and 5000 characters"
          ),
        };
      }

      // Get existing review
      const existingReviewResult = await this.getBookReview(userId, bookId);
      if (!existingReviewResult.success || !existingReviewResult.data) {
        return {
          success: false,
          error: createValidationError("No existing review found to update"),
        };
      }

      const existingReview = existingReviewResult.data;

      // Create updated review event (we can't update events in place, so we create a new one)
      const currentTime = Timestamp.now();
      const updatedEvent: Omit<BookEvent, "id" | "userId" | "timestamp"> = {
        bookId,
        type: "review",
        data: {
          review: reviewText.trim(),
          reviewCreatedAt: existingReview.createdAt,
          reviewUpdatedAt: currentTime,
        },
      };

      const result = await this.logEvent(userId, updatedEvent);

      if (!result.success) {
        return {
          success: false,
          error: createSystemError(
            typeof result.error === "string"
              ? result.error
              : "Failed to update review"
          ),
        };
      }

      return {
        success: true,
      };
    } catch (error) {
      return {
        success: false,
        error: createSystemError("Failed to update review", error as Error),
      };
    }
  }

  /**
   * Get review for a specific book
   */
  async getBookReview(
    userId: string,
    bookId: string
  ): Promise<ServiceResult<BookReview | null>> {
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

      // Get all events for the book
      const eventsResult = await this.getBookEvents(userId, bookId);
      if (!eventsResult.success || !eventsResult.data) {
        return {
          success: false,
          error:
            eventsResult.error ||
            createSystemError("Failed to fetch book events"),
        };
      }

      // Filter review events and get the most recent one
      const reviewEvents = eventsResult.data.filter(
        (event) => event.type === "review"
      );

      if (reviewEvents.length === 0) {
        return {
          success: true,
          data: null,
        };
      }

      // Get the most recent review event
      const latestReviewEvent = reviewEvents.sort(
        (a, b) => b.timestamp.toMillis() - a.timestamp.toMillis()
      )[0];

      const review = this.transformEventToReview(latestReviewEvent);

      return {
        success: true,
        data: review,
      };
    } catch (error) {
      return {
        success: false,
        error: createSystemError("Failed to get book review", error as Error),
      };
    }
  }

  /**
   * Transform event to review
   */
  private transformEventToReview(event: BookEvent): BookReview | null {
    if (event.type !== "review" || !event.data.review) {
      return null;
    }

    return {
      id: event.id,
      bookId: event.bookId,
      userId: event.userId,
      text: event.data.review,
      createdAt: event.data.reviewCreatedAt || event.timestamp,
      updatedAt: event.data.reviewUpdatedAt || event.timestamp,
    };
  }

  /**
   * Transform event to comment
   */
  private transformEventToComment(event: BookEvent): BookComment | null {
    if (event.type !== "comment" || !event.data.comment) {
      return null;
    }

    return {
      id: event.id,
      bookId: event.bookId,
      userId: event.userId,
      text: event.data.comment,
      readingState: event.data.commentState || "not_started",
      currentPage: event.data.commentPage || 0,
      timestamp: event.timestamp,
    };
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
      case "comment":
        return this.transformCommentEvent(event, baseItem);
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

  /**
   * Transform comment event
   */
  private transformCommentEvent(
    event: BookEvent,
    baseItem: Omit<ActivityItem, "type" | "colorClass" | "details">
  ): ActivityItem {
    const { comment } = event.data;
    const truncateText = (text: string, maxLength: number): string => {
      if (text.length <= maxLength) return text;
      return text.substring(0, maxLength).trim() + "...";
    };

    return {
      ...baseItem,
      type: "commented",
      colorClass: BRAND_COLORS.secondary.bg,
      details: comment ? truncateText(comment, 50) : undefined,
    };
  }
}

// Export singleton instance
export const eventService = new EventService();
