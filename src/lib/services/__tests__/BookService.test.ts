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

  describe("updateBookState", () => {
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
  });
});
