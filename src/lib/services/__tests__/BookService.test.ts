import { Timestamp } from "firebase/firestore";
import { BookService } from "../BookService";
import { Book } from "../../models";
import { IBookRepository, IEventRepository } from "../../repositories/types";
import { ServiceError, ServiceErrorType } from "../types";

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
    it("should return book when found", async () => {
      mockBookRepository.getBook.mockResolvedValue({
        success: true,
        data: mockBook,
      });

      const result = await bookService.getBook(testUserId, testBookId);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockBook);
      expect(mockBookRepository.getBook).toHaveBeenCalledWith(testUserId, testBookId);
    });

    it("should return null when book not found", async () => {
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
        error: "Access denied",
      });

      const result = await bookService.getBook(testUserId, testBookId);

      expect(result.success).toBe(false);
      expect(result.error).toBe("You don't have permission to access this book");
    });

    it("should handle unexpected errors", async () => {
      mockBookRepository.getBook.mockRejectedValue(new Error("Unexpected error"));

      const result = await bookService.getBook(testUserId, testBookId);

      expect(result.success).toBe(false);
      expect(result.error).toBe("Failed to get book");
    });
  });

  describe("getUserBooks", () => {
    it("should return user books", async () => {
      const mockBooks = [mockBook];
      mockBookRepository.getUserBooks.mockResolvedValue({
        success: true,
        data: mockBooks,
      });

      const result = await bookService.getUserBooks(testUserId);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockBooks);
      expect(mockBookRepository.getUserBooks).toHaveBeenCalledWith(testUserId);
    });

    it("should return empty array when no books", async () => {
      mockBookRepository.getUserBooks.mockResolvedValue({
        success: true,
        data: null,
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
      expect(result.error).toBe("Network error. Please check your connection and try again.");
    });
  });

  describe("getBooksByState", () => {
    it("should return books by state", async () => {
      const mockBooks = [mockBook];
      mockBookRepository.getBooksByState.mockResolvedValue({
        success: true,
        data: mockBooks,
      });

      const result = await bookService.getBooksByState(testUserId, "not_started");

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockBooks);
      expect(mockBookRepository.getBooksByState).toHaveBeenCalledWith(testUserId, "not_started");
    });
  });

  describe("addBook", () => {
    const newBook = {
      title: "New Book",
      author: "New Author",
      state: "not_started" as const,
      progress: { currentPage: 0, totalPages: 300 },
      isOwned: false,
    };

    it("should add book successfully", async () => {
      mockBookRepository.addBook.mockResolvedValue({
        success: true,
        data: "new-book-id",
      });
      mockEventRepository.logEvent.mockResolvedValue({
        success: true,
        data: "event-id",
      });

      const result = await bookService.addBook(testUserId, newBook);

      expect(result.success).toBe(true);
      expect(result.data).toBe("new-book-id");
      expect(mockBookRepository.addBook).toHaveBeenCalledWith(testUserId, newBook);
      expect(mockEventRepository.logEvent).toHaveBeenCalledWith(testUserId, {
        type: "state_change",
        bookId: "new-book-id",
        data: { newState: "not_started" },
      });
    });

    it("should validate book data", async () => {
      const invalidBook = {
        title: "",
        author: "Author",
        state: "not_started" as const,
        progress: { currentPage: 0, totalPages: 300 },
        isOwned: false,
      };

      const result = await bookService.addBook(testUserId, invalidBook);

      expect(result.success).toBe(false);
      expect(result.error).toBe("Book title cannot be empty");
      expect(mockBookRepository.addBook).not.toHaveBeenCalled();
    });

    it("should validate progress data", async () => {
      const invalidBook = {
        title: "Book",
        author: "Author",
        state: "not_started" as const,
        progress: { currentPage: -1, totalPages: 300 },
        isOwned: false,
      };

      const result = await bookService.addBook(testUserId, invalidBook);

      expect(result.success).toBe(false);
      expect(result.error).toBe("Invalid progress data");
    });

    it("should validate rating", async () => {
      const invalidBook = {
        title: "Book",
        author: "Author",
        state: "not_started" as const,
        progress: { currentPage: 0, totalPages: 300 },
        isOwned: false,
        rating: 6,
      };

      const result = await bookService.addBook(testUserId, invalidBook);

      expect(result.success).toBe(false);
      expect(result.error).toBe("Rating must be between 1 and 5");
    });

    it("should handle repository errors", async () => {
      mockBookRepository.addBook.mockResolvedValue({
        success: false,
        error: "Database error",
      });

      const result = await bookService.addBook(testUserId, newBook);

      expect(result.success).toBe(false);
      expect(result.error).toBe("Database error: Database error");
    });
  });

  describe("updateBook", () => {
    const updates = { title: "Updated Title" };

    it("should update book successfully", async () => {
      mockBookRepository.updateBook.mockResolvedValue({
        success: true,
      });

      const result = await bookService.updateBook(testUserId, testBookId, updates);

      expect(result.success).toBe(true);
      expect(mockBookRepository.updateBook).toHaveBeenCalledWith(
        testUserId,
        testBookId,
        updates
      );
    });

    it("should validate updates", async () => {
      const invalidUpdates = { title: "" };

      const result = await bookService.updateBook(testUserId, testBookId, invalidUpdates);

      expect(result.success).toBe(false);
      expect(result.error).toBe("Book title cannot be empty");
      expect(mockBookRepository.updateBook).not.toHaveBeenCalled();
    });

    it("should handle repository errors", async () => {
      mockBookRepository.updateBook.mockResolvedValue({
        success: false,
        error: "not found",
      });

      const result = await bookService.updateBook(testUserId, testBookId, updates);

      expect(result.success).toBe(false);
      expect(result.error).toBe("Book not found");
    });
  });

  describe("updateBookProgress", () => {
    it("should update progress successfully", async () => {
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

      const result = await bookService.updateBookProgress(testUserId, testBookId, 50);

      expect(result.success).toBe(true);
      expect(mockBookRepository.updateBook).toHaveBeenCalledWith(
        testUserId,
        testBookId,
        expect.objectContaining({
          progress: { currentPage: 50, totalPages: 200 },
        })
      );
      expect(mockEventRepository.logEvent).toHaveBeenCalledWith(testUserId, {
        type: "progress_update",
        bookId: testBookId,
        data: { previousPage: 0, newPage: 50 },
      });
    });

    it("should auto-transition to in_progress when starting", async () => {
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

      const result = await bookService.updateBookProgress(testUserId, testBookId, 1);

      expect(result.success).toBe(true);
      expect(mockBookRepository.updateBook).toHaveBeenCalledWith(
        testUserId,
        testBookId,
        expect.objectContaining({
          state: "in_progress",
          startedAt: mockTimestamp,
        })
      );
      expect(mockEventRepository.logEvent).toHaveBeenCalledTimes(2); // progress + state change
    });

    it("should auto-transition to finished when completed", async () => {
      const inProgressBook = {
        ...mockBook,
        state: "in_progress" as const,
        progress: { currentPage: 150, totalPages: 200 },
      };

      mockBookRepository.getBook.mockResolvedValue({
        success: true,
        data: inProgressBook,
      });
      mockBookRepository.updateBook.mockResolvedValue({
        success: true,
      });
      mockEventRepository.logEvent.mockResolvedValue({
        success: true,
        data: "event-id",
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

    it("should validate page number", async () => {
      mockBookRepository.getBook.mockResolvedValue({
        success: true,
        data: mockBook,
      });

      const result = await bookService.updateBookProgress(testUserId, testBookId, -1);

      expect(result.success).toBe(false);
      expect(result.error).toBe("Invalid page number");
      expect(mockBookRepository.updateBook).not.toHaveBeenCalled();
    });

    it("should validate page number against total pages", async () => {
      mockBookRepository.getBook.mockResolvedValue({
        success: true,
        data: mockBook,
      });

      const result = await bookService.updateBookProgress(testUserId, testBookId, 300);

      expect(result.success).toBe(false);
      expect(result.error).toBe("Invalid page number");
    });

    it("should handle book not found", async () => {
      mockBookRepository.getBook.mockResolvedValue({
        success: true,
        data: null,
      });

      const result = await bookService.updateBookProgress(testUserId, testBookId, 50);

      expect(result.success).toBe(false);
      expect(result.error).toBe("Book not found");
    });
  });

  describe("updateBookState", () => {
    it("should update state successfully", async () => {
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

      const result = await bookService.updateBookState(
        testUserId,
        testBookId,
        "in_progress"
      );

      expect(result.success).toBe(true);
      expect(mockBookRepository.updateBook).toHaveBeenCalledWith(
        testUserId,
        testBookId,
        expect.objectContaining({
          state: "in_progress",
          startedAt: mockTimestamp,
        })
      );
      expect(mockEventRepository.logEvent).toHaveBeenCalledWith(testUserId, {
        type: "state_change",
        bookId: testBookId,
        data: { previousState: "not_started", newState: "in_progress" },
      });
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
        "finished",
        "in_progress"
      );

      expect(result.success).toBe(true);
      expect(mockBookRepository.getBook).not.toHaveBeenCalled();
    });

    it("should validate state transition", async () => {
      const result = await bookService.updateBookState(
        testUserId,
        testBookId,
        "finished",
        "not_started"
      );

      expect(result.success).toBe(false);
      expect(result.error).toBe("Cannot transition from not_started to finished");
      expect(mockBookRepository.updateBook).not.toHaveBeenCalled();
    });

    it("should set progress to 100% when finishing", async () => {
      mockBookRepository.getBook.mockResolvedValue({
        success: true,
        data: {
          ...mockBook,
          state: "in_progress" as const,
          progress: { currentPage: 150, totalPages: 200 },
        },
      });
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
        "finished",
        "in_progress"
      );

      expect(result.success).toBe(true);
      expect(mockBookRepository.updateBook).toHaveBeenCalledWith(
        testUserId,
        testBookId,
        expect.objectContaining({
          state: "finished",
          finishedAt: mockTimestamp,
          progress: { currentPage: 200, totalPages: 200 },
        })
      );
    });
  });

  describe("updateBookRating", () => {
    it("should update rating successfully", async () => {
      const finishedBook = {
        ...mockBook,
        state: "finished" as const,
      };

      mockBookRepository.getBook.mockResolvedValue({
        success: true,
        data: finishedBook,
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
        { rating: 4 }
      );
      expect(mockEventRepository.logEvent).toHaveBeenCalledWith(testUserId, {
        type: "rating_added",
        bookId: testBookId,
        data: { rating: 4 },
      });
    });

    it("should validate rating value", async () => {
      const result = await bookService.updateBookRating(testUserId, testBookId, 6);

      expect(result.success).toBe(false);
      expect(result.error).toBe("Rating must be between 1 and 5");
      expect(mockBookRepository.getBook).not.toHaveBeenCalled();
    });

    it("should only allow rating finished books", async () => {
      mockBookRepository.getBook.mockResolvedValue({
        success: true,
        data: mockBook, // not_started state
      });

      const result = await bookService.updateBookRating(testUserId, testBookId, 4);

      expect(result.success).toBe(false);
      expect(result.error).toBe("Can only rate finished books");
      expect(mockBookRepository.updateBook).not.toHaveBeenCalled();
    });

    it("should handle book not found", async () => {
      mockBookRepository.getBook.mockResolvedValue({
        success: true,
        data: null,
      });

      const result = await bookService.updateBookRating(testUserId, testBookId, 4);

      expect(result.success).toBe(false);
      expect(result.error).toBe("Book not found");
    });
  });

  describe("deleteBook", () => {
    it("should delete book successfully", async () => {
      mockEventRepository.deleteBookEvents.mockResolvedValue({
        success: true,
      });
      mockBookRepository.deleteBook.mockResolvedValue({
        success: true,
      });

      const result = await bookService.deleteBook(testUserId, testBookId);

      expect(result.success).toBe(true);
      expect(mockEventRepository.deleteBookEvents).toHaveBeenCalledWith(
        testUserId,
        testBookId
      );
      expect(mockBookRepository.deleteBook).toHaveBeenCalledWith(testUserId, testBookId);
    });

    it("should handle repository errors", async () => {
      mockEventRepository.deleteBookEvents.mockResolvedValue({
        success: true,
      });
      mockBookRepository.deleteBook.mockResolvedValue({
        success: false,
        error: "Book not found",
      });

      const result = await bookService.deleteBook(testUserId, testBookId);

      expect(result.success).toBe(false);
      expect(result.error).toBe("Book not found");
    });
  });

  describe("subscribeToUserBooks", () => {
    it("should subscribe to user books", () => {
      const mockCallback = jest.fn();
      const mockUnsubscribe = jest.fn();
      
      mockBookRepository.subscribeToUserBooks.mockReturnValue(mockUnsubscribe);

      const unsubscribe = bookService.subscribeToUserBooks(testUserId, mockCallback);

      expect(mockBookRepository.subscribeToUserBooks).toHaveBeenCalledWith(
        testUserId,
        mockCallback
      );
      expect(unsubscribe).toBe(mockUnsubscribe);
    });
  });

  describe("importBooks", () => {
    const booksToImport = [
      {
        title: "Book 1",
        author: "Author 1",
        state: "not_started" as const,
        progress: { currentPage: 0, totalPages: 100 },
        isOwned: true,
      },
      {
        title: "Book 2",
        author: "Author 2",
        state: "finished" as const,
        progress: { currentPage: 200, totalPages: 200 },
        isOwned: false,
      },
    ];

    it("should import books successfully", async () => {
      mockBookRepository.importBooks.mockResolvedValue({
        success: true,
        data: ["book1", "book2"],
      });

      const result = await bookService.importBooks(testUserId, booksToImport);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(["book1", "book2"]);
      expect(mockBookRepository.importBooks).toHaveBeenCalledWith(
        testUserId,
        booksToImport
      );
    });

    it("should validate all books before import", async () => {
      const invalidBooks = [
        {
          title: "",
          author: "Author",
          state: "not_started" as const,
          progress: { currentPage: 0, totalPages: 100 },
          isOwned: true,
        },
      ];

      const result = await bookService.importBooks(testUserId, invalidBooks);

      expect(result.success).toBe(false);
      expect(result.error).toBe("Invalid book data: Book title cannot be empty");
      expect(mockBookRepository.importBooks).not.toHaveBeenCalled();
    });
  });

  describe("filterAndSortBooks", () => {
    const mockBooks = [
      { ...mockBook, title: "A Book", author: "Author A", rating: 5 },
      { ...mockBook, title: "B Book", author: "Author B", rating: 3 },
      { ...mockBook, title: "C Book", author: "Author C", rating: 4 },
    ];

    it("should filter and sort books", () => {
      const result = bookService.filterAndSortBooks(
        mockBooks,
        "Book",
        "all",
        "all",
        "title",
        "asc"
      );

      expect(result).toHaveLength(3);
      expect(result[0].title).toBe("A Book");
      expect(result[1].title).toBe("B Book");
      expect(result[2].title).toBe("C Book");
    });

    it("should sort by rating descending", () => {
      const result = bookService.filterAndSortBooks(
        mockBooks,
        "",
        "all",
        "all",
        "rating",
        "desc"
      );

      expect(result[0].rating).toBe(5);
      expect(result[1].rating).toBe(4);
      expect(result[2].rating).toBe(3);
    });
  });

  describe("calculateProgress", () => {
    it("should calculate progress correctly", () => {
      const inProgressBook = {
        ...mockBook,
        state: "in_progress" as const,
        progress: { currentPage: 50, totalPages: 100 },
      };

      const progress = bookService.calculateProgress(inProgressBook);

      expect(progress).toBe(50);
    });

    it("should return 100 for finished books", () => {
      const finishedBook = {
        ...mockBook,
        state: "finished" as const,
      };

      const progress = bookService.calculateProgress(finishedBook);

      expect(progress).toBe(100);
    });

    it("should return 0 for not_started books", () => {
      const progress = bookService.calculateProgress(mockBook);

      expect(progress).toBe(0);
    });
  });

  describe("error handling", () => {
    it("should handle different repository error types", async () => {
      // Test access denied
      mockBookRepository.getBook.mockResolvedValue({
        success: false,
        error: "Access denied to resource",
      });

      let result = await bookService.getBook(testUserId, testBookId);
      expect(result.error).toBe("You don't have permission to access this book");

      // Test network error
      mockBookRepository.getBook.mockResolvedValue({
        success: false,
        error: "Network error occurred",
      });

      result = await bookService.getBook(testUserId, testBookId);
      expect(result.error).toBe("Network error. Please check your connection and try again.");

      // Test not found
      mockBookRepository.getBook.mockResolvedValue({
        success: false,
        error: "Book not found in database",
      });

      result = await bookService.getBook(testUserId, testBookId);
      expect(result.error).toBe("Book not found");

      // Test generic error
      mockBookRepository.getBook.mockResolvedValue({
        success: false,
        error: "Some other error",
      });

      result = await bookService.getBook(testUserId, testBookId);
      expect(result.error).toBe("Database error: Some other error");
    });
  });
});