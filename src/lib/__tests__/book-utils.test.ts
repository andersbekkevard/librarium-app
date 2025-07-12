import { Timestamp } from "firebase/firestore";
import { GoogleBooksVolume } from "../api/google-books-api";
import {
  calculateBookProgress,
  convertGoogleBookToBook,
  convertManualEntryToBook,
} from "../books/book-utils";
import { Book } from "../models/models";

// Mock Firebase Timestamp
const mockTimestamp = {
  seconds: 1234567890,
  nanoseconds: 0,
} as Timestamp;

jest.mock("firebase/firestore", () => ({
  Timestamp: {
    now: jest.fn(() => mockTimestamp),
  },
}));

describe("book-utils", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("calculateBookProgress", () => {
    it("should return 100 for finished books", () => {
      const book: Book = {
        id: "test-id",
        title: "Test Book",
        author: "Test Author",
        state: "finished",
        progress: { currentPage: 50, totalPages: 100 },
        isOwned: true,
        addedAt: mockTimestamp,
        updatedAt: mockTimestamp,
      };

      expect(calculateBookProgress(book)).toBe(100);
    });

    it("should return 0 for not_started books", () => {
      const book: Book = {
        id: "test-id",
        title: "Test Book",
        author: "Test Author",
        state: "not_started",
        progress: { currentPage: 0, totalPages: 100 },
        isOwned: true,
        addedAt: mockTimestamp,
        updatedAt: mockTimestamp,
      };

      expect(calculateBookProgress(book)).toBe(0);
    });

    it("should calculate correct percentage for in_progress books", () => {
      const book: Book = {
        id: "test-id",
        title: "Test Book",
        author: "Test Author",
        state: "in_progress",
        progress: { currentPage: 25, totalPages: 100 },
        isOwned: true,
        addedAt: mockTimestamp,
        updatedAt: mockTimestamp,
      };

      expect(calculateBookProgress(book)).toBe(25);
    });

    it("should return 0 when totalPages is 0", () => {
      const book: Book = {
        id: "test-id",
        title: "Test Book",
        author: "Test Author",
        state: "in_progress",
        progress: { currentPage: 0, totalPages: 0 },
        isOwned: true,
        addedAt: mockTimestamp,
        updatedAt: mockTimestamp,
      };

      expect(calculateBookProgress(book)).toBe(0);
    });

    it("should return 0 when currentPage is 0", () => {
      const book: Book = {
        id: "test-id",
        title: "Test Book",
        author: "Test Author",
        state: "in_progress",
        progress: { currentPage: 0, totalPages: 100 },
        isOwned: true,
        addedAt: mockTimestamp,
        updatedAt: mockTimestamp,
      };

      expect(calculateBookProgress(book)).toBe(0);
    });

    it("should round progress to nearest integer", () => {
      const book: Book = {
        id: "test-id",
        title: "Test Book",
        author: "Test Author",
        state: "in_progress",
        progress: { currentPage: 33, totalPages: 100 },
        isOwned: true,
        addedAt: mockTimestamp,
        updatedAt: mockTimestamp,
      };

      expect(calculateBookProgress(book)).toBe(33);
    });

    it("should handle edge case where currentPage equals totalPages", () => {
      const book: Book = {
        id: "test-id",
        title: "Test Book",
        author: "Test Author",
        state: "in_progress",
        progress: { currentPage: 100, totalPages: 100 },
        isOwned: true,
        addedAt: mockTimestamp,
        updatedAt: mockTimestamp,
      };

      expect(calculateBookProgress(book)).toBe(100);
    });
  });

  describe("convertGoogleBookToBook", () => {
    const mockGoogleBook: GoogleBooksVolume = {
      kind: "books#volume",
      id: "google-book-id",
      etag: "test-etag",
      selfLink: "https://example.com/books/google-book-id",
      volumeInfo: {
        title: "The Great Gatsby",
        authors: ["F. Scott Fitzgerald"],
        description: "A classic American novel",
        pageCount: 180,
        publishedDate: "1925-04-10",
        categories: ["Fiction", "Classic Literature"],
        industryIdentifiers: [
          { type: "ISBN_10", identifier: "0123456789" },
          { type: "ISBN_13", identifier: "9780123456789" },
        ],
        imageLinks: {
          thumbnail: "https://example.com/thumbnail.jpg",
          small: "https://example.com/small.jpg",
          medium: "https://example.com/medium.jpg",
          large: "https://example.com/large.jpg",
        },
      },
    };

    it("should convert Google Books volume to Book with all fields", () => {
      const result = convertGoogleBookToBook(mockGoogleBook);

      expect(result.id).toBe("google-book-id");
      expect(result.title).toBe("The Great Gatsby");
      expect(result.author).toBe("F. Scott Fitzgerald");
      expect(result.state).toBe("not_started");
      expect(result.progress.currentPage).toBe(0);
      expect(result.progress.totalPages).toBe(180);
      expect(result.genre).toBe("Fiction");
      expect(result.isOwned).toBe(false);
      expect(result.isbn).toBe("9780123456789");
      expect(result.coverImage).toBe("https://example.com/medium.jpg");
      expect(result.publishedDate).toBe("1925-04-10");
      expect(result.description).toBe("A classic American novel");
      expect(result.addedAt).toBe(mockTimestamp);
      expect(result.updatedAt).toBe(mockTimestamp);
    });

    it("should handle missing optional fields", () => {
      const minimalGoogleBook: GoogleBooksVolume = {
        kind: "books#volume",
        id: "minimal-book-id",
        etag: "test-etag",
        selfLink: "https://example.com/books/minimal-book-id",
        volumeInfo: {
          title: "Minimal Book",
          authors: ["Unknown Author"],
        },
      };

      const result = convertGoogleBookToBook(minimalGoogleBook);

      expect(result.id).toBe("minimal-book-id");
      expect(result.title).toBe("Minimal Book");
      expect(result.author).toBe("Unknown Author");
      expect(result.state).toBe("not_started");
      expect(result.progress.currentPage).toBe(0);
      expect(result.progress.totalPages).toBe(0);
      expect(result.genre).toBe("");
      expect(result.isOwned).toBe(false);
      expect(result.isbn).toBeUndefined();
      expect(result.coverImage).toBeUndefined();
      expect(result.publishedDate).toBeUndefined();
      expect(result.description).toBeUndefined();
    });

    it("should handle empty categories array", () => {
      const bookWithEmptyCategories: GoogleBooksVolume = {
        kind: "books#volume",
        id: "book-id",
        etag: "test-etag",
        selfLink: "https://example.com/books/book-id",
        volumeInfo: {
          title: "Book Title",
          authors: ["Author"],
          categories: [],
        },
      };

      const result = convertGoogleBookToBook(bookWithEmptyCategories);
      expect(result.genre).toBe("");
    });

    it("should handle undefined pageCount", () => {
      const bookWithoutPageCount: GoogleBooksVolume = {
        kind: "books#volume",
        id: "book-id",
        etag: "test-etag",
        selfLink: "https://example.com/books/book-id",
        volumeInfo: {
          title: "Book Title",
          authors: ["Author"],
          pageCount: undefined,
        },
      };

      const result = convertGoogleBookToBook(bookWithoutPageCount);
      expect(result.progress.totalPages).toBe(0);
    });
  });

  describe("convertManualEntryToBook", () => {
    const mockFormData = {
      title: "  Manual Book  ",
      author: "  Manual Author  ",
      genre: "  Fantasy  ",
      pages: "200",
      publishedYear: "2023",
      ownership: "owned",
      description: "  A manually entered book  ",
    };

    it("should convert form data to Book with all fields", () => {
      const result = convertManualEntryToBook(mockFormData);

      expect(result.title).toBe("Manual Book");
      expect(result.author).toBe("Manual Author");
      expect(result.genre).toBe("Fantasy");
      expect(result.progress.totalPages).toBe(200);
      expect(result.publishedDate).toBe("2023-01-01");
      expect(result.isOwned).toBe(true);
      expect(result.description).toBe("A manually entered book");
      expect(result.state).toBe("not_started");
      expect(result.progress.currentPage).toBe(0);
      expect(result.addedAt).toBe(mockTimestamp);
      expect(result.updatedAt).toBe(mockTimestamp);
    });

    it("should handle ownership set to wishlist", () => {
      const formData = { ...mockFormData, ownership: "wishlist" };
      const result = convertManualEntryToBook(formData);

      expect(result.isOwned).toBe(false);
    });

    it("should handle invalid pages input", () => {
      const formData = { ...mockFormData, pages: "invalid" };
      const result = convertManualEntryToBook(formData);

      expect(result.progress.totalPages).toBe(0);
    });

    it("should handle empty pages input", () => {
      const formData = { ...mockFormData, pages: "" };
      const result = convertManualEntryToBook(formData);

      expect(result.progress.totalPages).toBe(0);
    });

    it("should handle empty optional fields", () => {
      const formData = {
        title: "Book Title",
        author: "Author",
        genre: "",
        pages: "",
        publishedYear: "",
        ownership: "owned",
        description: "",
      };

      const result = convertManualEntryToBook(formData);

      expect(result.title).toBe("Book Title");
      expect(result.author).toBe("Author");
      expect(result.genre).toBeUndefined();
      expect(result.progress.totalPages).toBe(0);
      expect(result.publishedDate).toBeUndefined();
      expect(result.description).toBeUndefined();
    });

    it("should generate unique IDs for different calls", () => {
      const result1 = convertManualEntryToBook(mockFormData);
      const result2 = convertManualEntryToBook(mockFormData);

      expect(result1.id).not.toBe(result2.id);
      expect(result1.id).toMatch(/^manual-\d+-\d+(\.\d+)?$/);
      expect(result2.id).toMatch(/^manual-\d+-\d+(\.\d+)?$/);
    });
  });
});
