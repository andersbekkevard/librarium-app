/**
 * Comprehensive tests for BookService
 *
 * Full test suite covering all BookService methods, business logic,
 * state transitions, validation, and error handling.
 */

import { Timestamp } from "firebase/firestore";
import { Book } from "../../models/models";
import { IBookRepository, IEventRepository } from "../../repositories/types";
import { BookService } from "../BookService";

// Mock Firebase
jest.mock("../../api/firebase", () => ({
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

const mockEventRepository: jest.Mocked<IEventRepository> = {
  logEvent: jest.fn(),
  getRecentEvents: jest.fn(),
  getBookEvents: jest.fn(),
  deleteBookEvents: jest.fn(),
  getEventsByType: jest.fn(),
};

describe("BookService", () => {
  let bookService: BookService;
  const testUserId = "test-user-id";
  const testBookId = "test-book-id";

  const mockBook: Book = {
    id: testBookId,
    title: "Test Book",
    author: "Test Author",
    state: "not_started",
    progress: { currentPage: 0, totalPages: 200 },
    isOwned: true,
    addedAt: mockTimestamp,
    updatedAt: mockTimestamp,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    bookService = new BookService(mockBookRepository, mockEventRepository);
  });

  describe("getBook", () => {
    it("should retrieve a book successfully", async () => {
      mockBookRepository.getBook.mockResolvedValue({
        success: true,
        data: mockBook,
      });

      const result = await bookService.getBook(testUserId, testBookId);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockBook);
      expect(mockBookRepository.getBook).toHaveBeenCalledWith(testUserId, testBookId);
    });

    it("should handle book not found", async () => {
      mockBookRepository.getBook.mockResolvedValue({
        success: true,
        data: null,
      });

      const result = await bookService.getBook(testUserId, testBookId);

      expect(result.success).toBe(true);
      expect(result.data).toBeNull();
    });

    it("should handle repository errors", async () => {
      mockBookRepository.getBook.mockResolvedValue({
        success: false,
        error: "Database error",
      });

      const result = await bookService.getBook(testUserId, testBookId);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.error?.message).toContain("Database error");
    });

    it("should handle access denied errors", async () => {
      mockBookRepository.getBook.mockResolvedValue({
        success: false,
        error: "Access denied",
      });

      const result = await bookService.getBook(testUserId, testBookId);

      expect(result.success).toBe(false);
      expect(result.error?.message).toContain("don't have permission");
    });
  });

  describe("getUserBooks", () => {
    it("should retrieve all user books", async () => {
      const mockBooks = [
        mockBook,
        { ...mockBook, id: "book-2", title: "Another Book" },
      ];

      mockBookRepository.getUserBooks.mockResolvedValue({
        success: true,
        data: mockBooks,
      });

      const result = await bookService.getUserBooks(testUserId);

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(2);
      expect(mockBookRepository.getUserBooks).toHaveBeenCalledWith(testUserId);
    });

    it("should handle empty book collection", async () => {
      mockBookRepository.getUserBooks.mockResolvedValue({
        success: true,
        data: [],
      });

      const result = await bookService.getUserBooks(testUserId);

      expect(result.success).toBe(true);
      expect(result.data).toEqual([]);
    });

    it("should handle repository errors", async () => {
      mockBookRepository.getUserBooks.mockResolvedValue({
        success: false,
        error: "Network error",
      });

      const result = await bookService.getUserBooks(testUserId);

      expect(result.success).toBe(false);
      expect(result.error?.message).toContain("Network error");
    });
  });

  describe("getBooksByState", () => {
    it("should retrieve books by state", async () => {
      const mockBooks = [
        { ...mockBook, state: "in_progress" },
        { ...mockBook, id: "book-2", state: "in_progress" },
      ];

      mockBookRepository.getBooksByState.mockResolvedValue({
        success: true,
        data: mockBooks,
      });

      const result = await bookService.getBooksByState(testUserId, "in_progress");

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(2);
      expect(mockBookRepository.getBooksByState).toHaveBeenCalledWith(
        testUserId,
        "in_progress"
      );
    });

    it("should handle empty state collection", async () => {
      mockBookRepository.getBooksByState.mockResolvedValue({
        success: true,
        data: [],
      });

      const result = await bookService.getBooksByState(testUserId, "finished");

      expect(result.success).toBe(true);
      expect(result.data).toEqual([]);
    });
  });

  describe("addBook", () => {
    const newBookData = {
      title: "New Book",
      author: "New Author",
      state: "not_started" as const,
      isOwned: true,
      totalPages: 300,
    };

    it("should add a new book successfully", async () => {
      const expectedBook: Book = {
        id: "new-book-id",
        ...newBookData,
        progress: { currentPage: 0, totalPages: 300 },
        addedAt: mockTimestamp,
        updatedAt: mockTimestamp,
      };

      mockBookRepository.addBook.mockResolvedValue({
        success: true,
        data: "new-book-id",
      });

      mockBookRepository.getBook.mockResolvedValue({
        success: true,
        data: expectedBook,
      });

      mockEventRepository.logEvent.mockResolvedValue({
        success: true,
        data: "event-id",
      });

      const result = await bookService.addBook(testUserId, newBookData);

      expect(result.success).toBe(true);
      expect(result.data).toBe("new-book-id");
      expect(mockBookRepository.addBook).toHaveBeenCalledWith(testUserId, expect.any(Object));
      expect(mockEventRepository.logEvent).toHaveBeenCalledWith(
        testUserId,
        expect.objectContaining({
          type: "state_change",
          bookId: "new-book-id",
        })
      );
    });

    it("should validate book data before adding", async () => {
      const invalidBookData = {
        title: "", // Empty title
        author: "Author",
        state: "not_started" as const,
        isOwned: true,
      };

      const result = await bookService.addBook(testUserId, invalidBookData);

      expect(result.success).toBe(false);
      expect(result.error?.message).toContain("title cannot be empty");
      expect(mockBookRepository.addBook).not.toHaveBeenCalled();
    });

    it("should handle repository errors", async () => {
      mockBookRepository.addBook.mockResolvedValue({
        success: false,
        error: "Database error",
      });

      const result = await bookService.addBook(testUserId, newBookData);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe("updateBook", () => {
    it("should update book successfully", async () => {
      const updates = { title: "Updated Title", author: "Updated Author" };
      const updatedBook = { ...mockBook, ...updates };

      mockBookRepository.getBook.mockResolvedValue({
        success: true,
        data: mockBook,
      });

      mockBookRepository.updateBook.mockResolvedValue({
        success: true,
      });

      mockEventRepository.logEvent.mockResolvedValue({
        success: true,
        data: "event-id",
      });

      const result = await bookService.updateBook(testUserId, testBookId, updates);

      expect(result.success).toBe(true);
      expect(mockBookRepository.updateBook).toHaveBeenCalledWith(testUserId, testBookId, {
        ...updates,
        updatedAt: mockTimestamp,
      });
    });

    it("should validate updates before applying", async () => {
      const invalidUpdates = { title: "", rating: 6 };

      mockBookRepository.getBook.mockResolvedValue({
        success: true,
        data: mockBook,
      });

      const result = await bookService.updateBook(testUserId, testBookId, invalidUpdates);

      expect(result.success).toBe(false);
      expect(result.error?.message).toContain("title cannot be empty");
    });

    it("should handle book not found", async () => {
      mockBookRepository.getBook.mockResolvedValue({
        success: true,
        data: null,
      });

      const result = await bookService.updateBook(testUserId, testBookId, { title: "New Title" });

      expect(result.success).toBe(false);
      expect(result.error?.message).toContain("Book not found");
    });

    it("should handle repository errors", async () => {
      mockBookRepository.getBook.mockResolvedValue({
        success: true,
        data: mockBook,
      });

      mockBookRepository.updateBook.mockResolvedValue({
        success: false,
        error: "Update failed",
      });

      const result = await bookService.updateBook(testUserId, testBookId, { title: "New Title" });

      expect(result.success).toBe(false);
      expect(result.error?.message).toContain("Update failed");
    });
  });

  describe("updateBookProgress", () => {
    it("should update progress successfully", async () => {
      const updatedBook = { ...mockBook, progress: { currentPage: 100, totalPages: 200 } };

      mockBookRepository.getBook.mockResolvedValue({
        success: true,
        data: mockBook,
      });

      mockBookRepository.updateBook.mockResolvedValue({
        success: true,
      });

      mockEventRepository.logEvent.mockResolvedValue({
        success: true,
        data: "event-id",
      });

      const result = await bookService.updateBookProgress(testUserId, testBookId, 100);

      expect(result.success).toBe(true);
      expect(mockBookRepository.updateBook).toHaveBeenCalledWith(
        testUserId,
        testBookId,
        expect.objectContaining({
          progress: { currentPage: 100, totalPages: 200 },
          updatedAt: mockTimestamp,
        })
      );
    });

    it("should handle invalid progress data", async () => {
      mockBookRepository.getBook.mockResolvedValue({
        success: true,
        data: mockBook,
      });

      const result = await bookService.updateBookProgress(testUserId, testBookId, -1);

      expect(result.success).toBe(false);
      expect(result.error?.message).toContain("Invalid progress data");
    });

    it("should transition state from not_started to in_progress", async () => {
      const book = { ...mockBook, state: "not_started" as const };
      const updatedBook = { ...book, state: "in_progress" as const, progress: { currentPage: 50, totalPages: 200 } };

      mockBookRepository.getBook.mockResolvedValue({
        success: true,
        data: book,
      });

      mockBookRepository.updateBook.mockResolvedValue({
        success: true,
      });

      mockEventRepository.logEvent.mockResolvedValue({
        success: true,
        data: "event-id",
      });

      const result = await bookService.updateBookProgress(testUserId, testBookId, 50);

      expect(result.success).toBe(true);
      expect(mockBookRepository.updateBook).toHaveBeenCalledWith(
        testUserId,
        testBookId,
        expect.objectContaining({
          state: "in_progress",
          startedAt: mockTimestamp,
        })
      );
    });

    it("should transition state to finished when complete", async () => {
      const book = { ...mockBook, state: "in_progress" as const };

      mockBookRepository.getBook.mockResolvedValue({
        success: true,
        data: book,
      });

      mockBookRepository.updateBook.mockResolvedValue({
        success: true,
      });

      const result = await bookService.updateBookProgress(testUserId, testBookId, 200);

      expect(result.success).toBe(true);
      expect(mockBookRepository.updateBook).toHaveBeenCalledWith(
        testUserId,
        testBookId,
        expect.objectContaining({
          state: "finished",
          finishedAt: mockTimestamp,
        })
      );
    });
  });

  describe("updateBookState", () => {
    it("should update state successfully", async () => {
      mockBookRepository.updateBook.mockResolvedValue({
        success: true,
      });

      mockEventRepository.logEvent.mockResolvedValue({
        success: true,
        data: "event-id",
      });

      const result = await bookService.updateBookState(
        testUserId,
        testBookId,
        "in_progress",
        "not_started"
      );

      expect(result.success).toBe(true);
      expect(mockBookRepository.updateBook).toHaveBeenCalledWith(
        testUserId,
        testBookId,
        expect.objectContaining({
          state: "in_progress",
          updatedAt: mockTimestamp,
        })
      );
    });

    it("should use provided current state", async () => {
      mockBookRepository.updateBook.mockResolvedValue({
        success: true,
      });
      mockEventRepository.logEvent.mockResolvedValue({
        success: true,
        data: "event-id",
      });

      const result = await bookService.updateBookState(
        testUserId,
        testBookId,
        "in_progress",
        "not_started"
      );

      expect(result.success).toBe(true);
      expect(mockBookRepository.getBook).not.toHaveBeenCalled();
    });

    it("should fetch current state when not provided", async () => {
      const book = { ...mockBook, state: "not_started" as const };

      mockBookRepository.getBook.mockResolvedValue({
        success: true,
        data: book,
      });

      mockBookRepository.updateBook.mockResolvedValue({
        success: true,
      });

      mockEventRepository.logEvent.mockResolvedValue({
        success: true,
        data: "event-id",
      });

      const result = await bookService.updateBookState(testUserId, testBookId, "in_progress");

      expect(result.success).toBe(true);
      expect(mockBookRepository.getBook).toHaveBeenCalledWith(testUserId, testBookId);
    });

    it("should handle invalid state transitions", async () => {
      mockBookRepository.updateBook.mockResolvedValue({
        success: true,
      });

      const result = await bookService.updateBookState(
        testUserId,
        testBookId,
        "finished",
        "not_started"
      );

      expect(result.success).toBe(true); // Manual updates allow any transition
    });
  });

  describe("updateBookRating", () => {
    it("should update rating successfully", async () => {
      mockBookRepository.getBook.mockResolvedValue({
        success: true,
        data: mockBook,
      });

      mockBookRepository.updateBook.mockResolvedValue({
        success: true,
      });

      mockEventRepository.logEvent.mockResolvedValue({
        success: true,
        data: "event-id",
      });

      const result = await bookService.updateBookRating(testUserId, testBookId, 4);

      expect(result.success).toBe(true);
      expect(mockBookRepository.updateBook).toHaveBeenCalledWith(
        testUserId,
        testBookId,
        expect.objectContaining({
          rating: 4,
          updatedAt: mockTimestamp,
        })
      );
    });

    it("should validate rating value", async () => {
      mockBookRepository.getBook.mockResolvedValue({
        success: true,
        data: mockBook,
      });

      const result = await bookService.updateBookRating(testUserId, testBookId, 6);

      expect(result.success).toBe(false);
      expect(result.error?.message).toContain("Rating must be between 1 and 5");
    });

    it("should handle book not found", async () => {
      mockBookRepository.getBook.mockResolvedValue({
        success: true,
        data: null,
      });

      const result = await bookService.updateBookRating(testUserId, testBookId, 4);

      expect(result.success).toBe(false);
      expect(result.error?.message).toContain("Book not found");
    });
  });

  describe("deleteBook", () => {
    it("should delete book successfully", async () => {
      mockBookRepository.deleteBook.mockResolvedValue({
        success: true,
      });

      mockEventRepository.deleteBookEvents.mockResolvedValue({
        success: true,
      });

      const result = await bookService.deleteBook(testUserId, testBookId);

      expect(result.success).toBe(true);
      expect(mockBookRepository.deleteBook).toHaveBeenCalledWith(testUserId, testBookId);
      expect(mockEventRepository.deleteBookEvents).toHaveBeenCalledWith(testUserId, testBookId);
    });

    it("should handle delete errors", async () => {
      mockBookRepository.deleteBook.mockResolvedValue({
        success: false,
        error: "Delete failed",
      });

      const result = await bookService.deleteBook(testUserId, testBookId);

      expect(result.success).toBe(false);
      expect(result.error?.message).toContain("Delete failed");
    });
  });

  describe("updateBookManual", () => {
    it("should allow manual updates bypassing state machine", async () => {
      const updates = {
        title: "Manual Update",
        state: "finished" as const,
        rating: 5,
      };

      mockBookRepository.getBook.mockResolvedValue({
        success: true,
        data: mockBook,
      });

      mockBookRepository.updateBook.mockResolvedValue({
        success: true,
      });

      mockEventRepository.logEvent.mockResolvedValue({
        success: true,
        data: "event-id",
      });

      const result = await bookService.updateBookManual(testUserId, testBookId, updates);

      expect(result.success).toBe(true);
      expect(mockBookRepository.updateBook).toHaveBeenCalledWith(
        testUserId,
        testBookId,
        expect.objectContaining(updates)
      );
    });

    it("should validate manual updates", async () => {
      const invalidUpdates = { title: "", rating: 6 };

      mockBookRepository.getBook.mockResolvedValue({
        success: true,
        data: mockBook,
      });

      const result = await bookService.updateBookManual(testUserId, testBookId, invalidUpdates);

      expect(result.success).toBe(false);
      expect(result.error?.message).toContain("title cannot be empty");
    });
  });

  describe("validateBookData", () => {
    it("should validate empty title", () => {
      const validationError = bookService["validateBookData"]({ title: "" });
      expect(validationError?.message).toContain("title cannot be empty");
    });

    it("should validate empty author", () => {
      const validationError = bookService["validateBookData"]({ author: "" });
      expect(validationError?.message).toContain("author cannot be empty");
    });

    it("should validate invalid progress", () => {
      const validationError = bookService["validateBookData"]({
        progress: { currentPage: -1, totalPages: 100 },
      });
      expect(validationError?.message).toContain("Invalid progress data");
    });

    it("should validate invalid rating", () => {
      const validationError = bookService["validateBookData"]({ rating: 6 });
      expect(validationError?.message).toContain("Rating must be between 1 and 5");
    });

    it("should return null for valid data", () => {
      const validationError = bookService["validateBookData"]({
        title: "Valid Title",
        author: "Valid Author",
        rating: 3,
      });
      expect(validationError).toBeNull();
    });
  });

  describe("handleRepositoryError", () => {
    it("should handle access denied errors", () => {
      const error = bookService["handleRepositoryError"]("Access denied");
      expect(error.message).toContain("don't have permission");
      expect(error.category).toBe("authorization");
    });

    it("should handle network errors", () => {
      const error = bookService["handleRepositoryError"]("Network error");
      expect(error.message).toContain("Network error");
    });

    it("should handle not found errors", () => {
      const error = bookService["handleRepositoryError"]("Book not found");
      expect(error.message).toContain("Book not found");
    });

    it("should handle generic errors", () => {
      const error = bookService["handleRepositoryError"]("Generic database error");
      expect(error.message).toContain("Database error");
    });
  });
});