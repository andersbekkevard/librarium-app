import { Timestamp } from "firebase/firestore";
import { Book, BookEvent } from "../../models";
import { IBookRepository, IEventRepository } from "../../repositories/types";
import { EventService } from "../EventService";

// Mock Firebase
jest.mock("../../firebase", () => ({
  db: {},
  auth: {},
  storage: {},
}));

// Mock Firebase Timestamp
const mockTimestamp = {
  seconds: 1234567890,
  nanoseconds: 0,
  toDate: () => new Date(1234567890000),
} as Timestamp;

jest.mock("firebase/firestore", () => ({
  Timestamp: {
    now: jest.fn(() => mockTimestamp),
  },
}));

// Mock repositories
const mockEventRepository: jest.Mocked<IEventRepository> = {
  logEvent: jest.fn(),
  getRecentEvents: jest.fn(),
  getBookEvents: jest.fn(),
  getEventsByType: jest.fn(),
  deleteBookEvents: jest.fn(),
};

const mockBookRepository: jest.Mocked<IBookRepository> = {
  getBook: jest.fn(),
  getUserBooks: jest.fn(),
  getBooksByState: jest.fn(),
  addBook: jest.fn(),
  updateBook: jest.fn(),
  deleteBook: jest.fn(),
  subscribeToUserBooks: jest.fn(),
  batchUpdateBooks: jest.fn(),
  importBooks: jest.fn(),
};

describe("EventService", () => {
  let eventService: EventService;
  const testUserId = "test-user-id";
  const testBookId = "test-book-id";

  const mockBook: Book = {
    id: testBookId,
    title: "Test Book",
    author: "Test Author",
    state: "in_progress",
    progress: { currentPage: 150, totalPages: 300 },
    isOwned: true,
    addedAt: mockTimestamp,
    updatedAt: mockTimestamp,
    startedAt: mockTimestamp,
  };

  const mockEvents: BookEvent[] = [
    {
      id: "event-1",
      bookId: testBookId,
      userId: testUserId,
      type: "state_change",
      timestamp: mockTimestamp,
      data: {
        previousState: "not_started",
        newState: "in_progress",
      },
    },
    {
      id: "event-2",
      bookId: testBookId,
      userId: testUserId,
      type: "progress_update",
      timestamp: mockTimestamp,
      data: {
        previousPage: 100,
        newPage: 150,
      },
    },
    {
      id: "event-3",
      bookId: testBookId,
      userId: testUserId,
      type: "rating_added",
      timestamp: mockTimestamp,
      data: {
        rating: 4,
      },
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    eventService = new EventService(
      mockEventRepository as any,
      mockBookRepository as any
    );
  });

  describe("getRecentEvents", () => {
    it("should return recent events successfully", async () => {
      mockEventRepository.getRecentEvents.mockResolvedValue({
        success: true,
        data: mockEvents,
      });

      const result = await eventService.getRecentEvents(testUserId, 10);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockEvents);
      expect(mockEventRepository.getRecentEvents).toHaveBeenCalledWith(
        testUserId,
        10
      );
    });

    it("should use default limit when not provided", async () => {
      mockEventRepository.getRecentEvents.mockResolvedValue({
        success: true,
        data: mockEvents,
      });

      const result = await eventService.getRecentEvents(testUserId);

      expect(result.success).toBe(true);
      expect(mockEventRepository.getRecentEvents).toHaveBeenCalledWith(
        testUserId,
        10
      );
    });

    it("should return empty array when no events", async () => {
      mockEventRepository.getRecentEvents.mockResolvedValue({
        success: true,
        data: [],
      });

      const result = await eventService.getRecentEvents(testUserId);

      expect(result.success).toBe(true);
      expect(result.data).toEqual([]);
    });

    it("should handle null data from repository", async () => {
      mockEventRepository.getRecentEvents.mockResolvedValue({
        success: true,
        data: undefined,
      });

      const result = await eventService.getRecentEvents(testUserId);

      expect(result.success).toBe(true);
      expect(result.data).toEqual([]);
    });

    it("should validate user ID", async () => {
      const result = await eventService.getRecentEvents("");

      expect(result.success).toBe(false);
      expect(result.error).toEqual(
        expect.objectContaining({
          message: "User ID is required",
          category: "validation",
          userMessage: "User ID is required",
        })
      );
      expect(mockEventRepository.getRecentEvents).not.toHaveBeenCalled();
    });

    it("should handle repository errors", async () => {
      mockEventRepository.getRecentEvents.mockResolvedValue({
        success: false,
        error: "Database error",
      });

      const result = await eventService.getRecentEvents(testUserId);

      expect(result.success).toBe(false);
      expect(result.error).toEqual(
        expect.objectContaining({
          message: "Database error",
          category: "system",
          userMessage: "An unexpected error occurred",
        })
      );
    });

    it("should handle unexpected errors", async () => {
      mockEventRepository.getRecentEvents.mockRejectedValue(
        new Error("Network error")
      );

      const result = await eventService.getRecentEvents(testUserId);

      expect(result.success).toBe(false);
      expect(result.error).toEqual(
        expect.objectContaining({
          message: "Failed to get recent events",
          category: "system",
          userMessage: "An unexpected error occurred",
        })
      );
    });

    it("should handle unknown errors", async () => {
      mockEventRepository.getRecentEvents.mockRejectedValue("Unknown error");

      const result = await eventService.getRecentEvents(testUserId);

      expect(result.success).toBe(false);
      expect(result.error).toEqual(
        expect.objectContaining({
          message: "Failed to get recent events",
          category: "system",
          userMessage: "An unexpected error occurred",
        })
      );
    });
  });

  describe("getRecentActivityItems", () => {
    it("should return activity items successfully", async () => {
      mockEventRepository.getRecentEvents.mockResolvedValue({
        success: true,
        data: mockEvents,
      });
      mockBookRepository.getBook.mockResolvedValue({
        success: true,
        data: mockBook,
      });

      const result = await eventService.getRecentActivityItems(testUserId, 5);

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(3);
      expect(result.data![0]).toMatchObject({
        id: "event-1",
        type: "started",
        bookTitle: "Test Book",
        bookId: testBookId,
        colorClass: "bg-brand-primary",
      });
    });

    it("should use default limit when not provided", async () => {
      mockEventRepository.getRecentEvents.mockResolvedValue({
        success: true,
        data: mockEvents,
      });
      mockBookRepository.getBook.mockResolvedValue({
        success: true,
        data: mockBook,
      });

      const result = await eventService.getRecentActivityItems(testUserId);

      expect(result.success).toBe(true);
      expect(mockEventRepository.getRecentEvents).toHaveBeenCalledWith(
        testUserId,
        5
      );
    });

    it("should validate user ID", async () => {
      const result = await eventService.getRecentActivityItems("");

      expect(result.success).toBe(false);
      expect(result.error).toEqual(
        expect.objectContaining({
          message: "User ID is required",
          category: "validation",
          userMessage: "User ID is required",
        })
      );
    });

    it("should handle events fetch error", async () => {
      mockEventRepository.getRecentEvents.mockResolvedValue({
        success: false,
        error: "Database error",
      });

      const result = await eventService.getRecentActivityItems(testUserId);

      expect(result.success).toBe(false);
      expect(result.error).toEqual(
        expect.objectContaining({
          message: "Database error",
          category: "system",
          userMessage: "An unexpected error occurred",
        })
      );
    });

    it("should handle missing book data", async () => {
      mockEventRepository.getRecentEvents.mockResolvedValue({
        success: true,
        data: mockEvents,
      });
      mockBookRepository.getBook.mockResolvedValue({
        success: false,
        error: "Book not found",
      });

      const result = await eventService.getRecentActivityItems(testUserId);

      expect(result.success).toBe(true);
      expect(result.data).toEqual([]); // No activity items when books not found
    });

    it("should handle multiple books", async () => {
      const eventsWithMultipleBooks = [
        mockEvents[0],
        {
          ...mockEvents[1],
          bookId: "book-2",
        },
      ];

      const book2: Book = {
        ...mockBook,
        id: "book-2",
        title: "Second Book",
      };

      mockEventRepository.getRecentEvents.mockResolvedValue({
        success: true,
        data: eventsWithMultipleBooks,
      });
      mockBookRepository.getBook.mockImplementation((userId, bookId) => {
        if (bookId === testBookId) {
          return Promise.resolve({ success: true, data: mockBook });
        }
        if (bookId === "book-2") {
          return Promise.resolve({ success: true, data: book2 });
        }
        return Promise.resolve({ success: false, error: "Book not found" });
      });

      const result = await eventService.getRecentActivityItems(testUserId);

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(2);
      expect(result.data![0].bookTitle).toBe("Test Book");
      expect(result.data![1].bookTitle).toBe("Second Book");
    });

    it("should handle unexpected errors", async () => {
      mockEventRepository.getRecentEvents.mockRejectedValue(
        new Error("Network error")
      );

      const result = await eventService.getRecentActivityItems(testUserId);

      expect(result.success).toBe(false);
      expect(result.error).toEqual(
        expect.objectContaining({
          message: "Failed to get recent events",
          category: "system",
          userMessage: "An unexpected error occurred",
        })
      );
    });
  });

  describe("logEvent", () => {
    const testEvent: Omit<BookEvent, "id" | "userId" | "timestamp"> = {
      bookId: testBookId,
      type: "state_change",
      data: {
        previousState: "not_started",
        newState: "in_progress",
      },
    };

    it("should log event successfully", async () => {
      mockEventRepository.logEvent.mockResolvedValue({
        success: true,
        data: "event-id",
      });

      const result = await eventService.logEvent(testUserId, testEvent);

      expect(result.success).toBe(true);
      expect(result.data).toBe("event-id");
      expect(mockEventRepository.logEvent).toHaveBeenCalledWith(
        testUserId,
        testEvent
      );
    });

    it("should validate user ID", async () => {
      const result = await eventService.logEvent("", testEvent);

      expect(result.success).toBe(false);
      expect(result.error).toEqual(
        expect.objectContaining({
          message: "User ID is required",
          category: "validation",
          userMessage: "User ID is required",
        })
      );
      expect(mockEventRepository.logEvent).not.toHaveBeenCalled();
    });

    it("should validate book ID", async () => {
      const eventWithoutBookId = {
        ...testEvent,
        bookId: "",
      };

      const result = await eventService.logEvent(
        testUserId,
        eventWithoutBookId
      );

      expect(result.success).toBe(false);
      expect(result.error).toEqual(
        expect.objectContaining({
          message: "Book ID is required",
          category: "validation",
          userMessage: "Book ID is required",
        })
      );
      expect(mockEventRepository.logEvent).not.toHaveBeenCalled();
    });

    it("should handle repository errors", async () => {
      mockEventRepository.logEvent.mockResolvedValue({
        success: false,
        error: "Database error",
      });

      const result = await eventService.logEvent(testUserId, testEvent);

      expect(result.success).toBe(false);
      expect(result.error).toEqual(
        expect.objectContaining({
          message: "Database error",
          category: "system",
          userMessage: "An unexpected error occurred",
        })
      );
    });

    it("should handle null data from repository", async () => {
      mockEventRepository.logEvent.mockResolvedValue({
        success: true,
        data: undefined,
      });

      const result = await eventService.logEvent(testUserId, testEvent);

      expect(result.success).toBe(true);
      expect(result.data).toBe("");
    });

    it("should handle unexpected errors", async () => {
      mockEventRepository.logEvent.mockRejectedValue(
        new Error("Network error")
      );

      const result = await eventService.logEvent(testUserId, testEvent);

      expect(result.success).toBe(false);
      expect(result.error).toEqual(
        expect.objectContaining({
          message: "Failed to log event",
          category: "system",
          userMessage: "An unexpected error occurred",
        })
      );
    });
  });

  describe("getBookEvents", () => {
    it("should return book events successfully", async () => {
      mockEventRepository.getBookEvents.mockResolvedValue({
        success: true,
        data: mockEvents,
      });

      const result = await eventService.getBookEvents(testUserId, testBookId);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockEvents);
      expect(mockEventRepository.getBookEvents).toHaveBeenCalledWith(
        testUserId,
        testBookId
      );
    });

    it("should validate user ID", async () => {
      const result = await eventService.getBookEvents("", testBookId);

      expect(result.success).toBe(false);
      expect(result.error).toEqual(
        expect.objectContaining({
          message: "User ID is required",
          category: "validation",
          userMessage: "User ID is required",
        })
      );
      expect(mockEventRepository.getBookEvents).not.toHaveBeenCalled();
    });

    it("should validate book ID", async () => {
      const result = await eventService.getBookEvents(testUserId, "");

      expect(result.success).toBe(false);
      expect(result.error).toEqual(
        expect.objectContaining({
          message: "Book ID is required",
          category: "validation",
          userMessage: "Book ID is required",
        })
      );
      expect(mockEventRepository.getBookEvents).not.toHaveBeenCalled();
    });

    it("should handle repository errors", async () => {
      mockEventRepository.getBookEvents.mockResolvedValue({
        success: false,
        error: "Database error",
      });

      const result = await eventService.getBookEvents(testUserId, testBookId);

      expect(result.success).toBe(false);
      expect(result.error).toEqual(
        expect.objectContaining({
          message: "Database error",
          category: "system",
          userMessage: "An unexpected error occurred",
        })
      );
    });

    it("should handle null data from repository", async () => {
      mockEventRepository.getBookEvents.mockResolvedValue({
        success: true,
        data: undefined,
      });

      const result = await eventService.getBookEvents(testUserId, testBookId);

      expect(result.success).toBe(true);
      expect(result.data).toEqual([]);
    });

    it("should handle unexpected errors", async () => {
      mockEventRepository.getBookEvents.mockRejectedValue(
        new Error("Network error")
      );

      const result = await eventService.getBookEvents(testUserId, testBookId);

      expect(result.success).toBe(false);
      expect(result.error).toEqual(
        expect.objectContaining({
          message: "Failed to get book events",
          category: "system",
          userMessage: "An unexpected error occurred",
        })
      );
    });
  });

  describe("event transformation", () => {
    beforeEach(() => {
      mockEventRepository.getRecentEvents.mockResolvedValue({
        success: true,
        data: mockEvents,
      });
      mockBookRepository.getBook.mockResolvedValue({
        success: true,
        data: mockBook,
      });
    });

    it("should transform state_change to started activity", async () => {
      const stateChangeEvent: BookEvent = {
        ...mockEvents[0],
        data: {
          previousState: "not_started",
          newState: "in_progress",
        },
      };

      mockEventRepository.getRecentEvents.mockResolvedValue({
        success: true,
        data: [stateChangeEvent],
      });

      const result = await eventService.getRecentActivityItems(testUserId);

      expect(result.success).toBe(true);
      expect(result.data![0]).toMatchObject({
        type: "started",
        colorClass: "bg-brand-primary",
      });
    });

    it("should transform state_change to finished activity", async () => {
      const stateChangeEvent: BookEvent = {
        ...mockEvents[0],
        data: {
          previousState: "in_progress",
          newState: "finished",
        },
      };

      mockEventRepository.getRecentEvents.mockResolvedValue({
        success: true,
        data: [stateChangeEvent],
      });

      const result = await eventService.getRecentActivityItems(testUserId);

      expect(result.success).toBe(true);
      expect(result.data![0]).toMatchObject({
        type: "finished",
        colorClass: "bg-status-success",
      });
    });

    it("should transform state_change to added activity for other states", async () => {
      const stateChangeEvent: BookEvent = {
        ...mockEvents[0],
        data: {
          newState: "not_started",
        },
      };

      mockEventRepository.getRecentEvents.mockResolvedValue({
        success: true,
        data: [stateChangeEvent],
      });

      const result = await eventService.getRecentActivityItems(testUserId);

      expect(result.success).toBe(true);
      expect(result.data![0]).toMatchObject({
        type: "added",
        colorClass: "bg-brand-accent",
      });
    });

    it("should transform progress_update activity", async () => {
      const progressEvent: BookEvent = {
        ...mockEvents[1],
        data: {
          previousPage: 100,
          newPage: 150,
        },
      };

      mockEventRepository.getRecentEvents.mockResolvedValue({
        success: true,
        data: [progressEvent],
      });

      const result = await eventService.getRecentActivityItems(testUserId);

      expect(result.success).toBe(true);
      expect(result.data![0]).toMatchObject({
        type: "progress",
        colorClass: "bg-status-info",
        details: "page 150",
      });
    });

    it("should transform progress_update without newPage", async () => {
      const progressEvent: BookEvent = {
        ...mockEvents[1],
        data: {
          previousPage: 100,
        },
      };

      mockEventRepository.getRecentEvents.mockResolvedValue({
        success: true,
        data: [progressEvent],
      });

      const result = await eventService.getRecentActivityItems(testUserId);

      expect(result.success).toBe(true);
      expect(result.data![0]).toMatchObject({
        type: "progress",
        colorClass: "bg-status-info",
        details: undefined,
      });
    });

    it("should transform rating_added activity", async () => {
      const ratingEvent: BookEvent = {
        ...mockEvents[2],
        data: {
          rating: 4,
        },
      };

      mockEventRepository.getRecentEvents.mockResolvedValue({
        success: true,
        data: [ratingEvent],
      });

      const result = await eventService.getRecentActivityItems(testUserId);

      expect(result.success).toBe(true);
      expect(result.data![0]).toMatchObject({
        type: "rated",
        colorClass: "bg-status-warning",
        details: "4 stars",
      });
    });

    it("should transform rating_added without rating", async () => {
      const ratingEvent: BookEvent = {
        ...mockEvents[2],
        data: {},
      };

      mockEventRepository.getRecentEvents.mockResolvedValue({
        success: true,
        data: [ratingEvent],
      });

      const result = await eventService.getRecentActivityItems(testUserId);

      expect(result.success).toBe(true);
      expect(result.data![0]).toMatchObject({
        type: "rated",
        colorClass: "bg-status-warning",
        details: undefined,
      });
    });

    it("should ignore unknown event types", async () => {
      const unknownEvent: BookEvent = {
        ...mockEvents[0],
        type: "note_added" as any,
      };

      mockEventRepository.getRecentEvents.mockResolvedValue({
        success: true,
        data: [unknownEvent],
      });

      const result = await eventService.getRecentActivityItems(testUserId);

      expect(result.success).toBe(true);
      expect(result.data).toEqual([]);
    });

    it("should include timestamp from event", async () => {
      const result = await eventService.getRecentActivityItems(testUserId);

      expect(result.success).toBe(true);
      expect(result.data![0].timestamp).toEqual(mockTimestamp.toDate());
    });
  });

  describe("edge cases", () => {
    it("should handle empty events array", async () => {
      mockEventRepository.getRecentEvents.mockResolvedValue({
        success: true,
        data: [],
      });

      const result = await eventService.getRecentActivityItems(testUserId);

      expect(result.success).toBe(true);
      expect(result.data).toEqual([]);
    });

    it("should handle events with missing book data", async () => {
      mockEventRepository.getRecentEvents.mockResolvedValue({
        success: true,
        data: mockEvents,
      });
      mockBookRepository.getBook.mockResolvedValue({
        success: true,
        data: null,
      });

      const result = await eventService.getRecentActivityItems(testUserId);

      expect(result.success).toBe(true);
      expect(result.data).toEqual([]);
    });

    it("should handle mixed success/failure book fetches", async () => {
      const multipleEvents = [
        mockEvents[0],
        {
          ...mockEvents[1],
          bookId: "missing-book",
        },
      ];

      mockEventRepository.getRecentEvents.mockResolvedValue({
        success: true,
        data: multipleEvents,
      });

      mockBookRepository.getBook.mockImplementation((userId, bookId) => {
        if (bookId === testBookId) {
          return Promise.resolve({ success: true, data: mockBook });
        }
        return Promise.resolve({ success: false, error: "Book not found" });
      });

      const result = await eventService.getRecentActivityItems(testUserId);

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(1);
      expect(result.data![0].bookTitle).toBe("Test Book");
    });
  });
});
