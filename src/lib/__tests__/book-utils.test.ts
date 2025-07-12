import { Timestamp } from "firebase/firestore";
import {
  calculateBookProgress,
  convertGoogleBookToBook,
  convertManualEntryToBook,
  filterAndSortBooks,
} from "../book-utils";
import { Book } from "../models";
import { GoogleBooksVolume } from "../google-books-api";

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
      id: "google-book-id",
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
        id: "minimal-book-id",
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
        id: "book-id",
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
        id: "book-id",
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

  describe("filterAndSortBooks", () => {
    const mockBooks: Book[] = [
      {
        id: "1",
        title: "JavaScript: The Good Parts",
        author: "Douglas Crockford",
        state: "finished",
        progress: { currentPage: 200, totalPages: 200 },
        isOwned: true,
        rating: 4,
        description: "A book about JavaScript programming",
        addedAt: mockTimestamp,
        updatedAt: mockTimestamp,
      },
      {
        id: "2",
        title: "Python Crash Course",
        author: "Eric Matthes",
        state: "in_progress",
        progress: { currentPage: 150, totalPages: 300 },
        isOwned: false,
        rating: 5,
        description: "A comprehensive Python tutorial",
        addedAt: mockTimestamp,
        updatedAt: mockTimestamp,
      },
      {
        id: "3",
        title: "Clean Code",
        author: "Robert C. Martin",
        state: "not_started",
        progress: { currentPage: 0, totalPages: 400 },
        isOwned: true,
        description: "A handbook of agile software craftsmanship",
        addedAt: mockTimestamp,
        updatedAt: mockTimestamp,
      },
    ];

    it("should filter books by title query", () => {
      const result = filterAndSortBooks(mockBooks, "javascript", "all", "all", "title", "asc");

      expect(result).toHaveLength(1);
      expect(result[0].title).toBe("JavaScript: The Good Parts");
    });

    it("should filter books by author query", () => {
      const result = filterAndSortBooks(mockBooks, "martin", "all", "all", "title", "asc");

      expect(result).toHaveLength(1);
      expect(result[0].author).toBe("Robert C. Martin");
    });

    it("should filter books by description query", () => {
      const result = filterAndSortBooks(mockBooks, "python", "all", "all", "title", "asc");

      expect(result).toHaveLength(1);
      expect(result[0].title).toBe("Python Crash Course");
    });

    it("should filter books by state", () => {
      const result = filterAndSortBooks(mockBooks, "", "finished", "all", "title", "asc");

      expect(result).toHaveLength(1);
      expect(result[0].state).toBe("finished");
    });

    it("should filter books by ownership", () => {
      const ownedResult = filterAndSortBooks(mockBooks, "", "all", "owned", "title", "asc");
      const wishlistResult = filterAndSortBooks(mockBooks, "", "all", "wishlist", "title", "asc");

      expect(ownedResult).toHaveLength(2);
      expect(ownedResult.every(book => book.isOwned)).toBe(true);

      expect(wishlistResult).toHaveLength(1);
      expect(wishlistResult.every(book => !book.isOwned)).toBe(true);
    });

    it("should sort books by title ascending", () => {
      const result = filterAndSortBooks(mockBooks, "", "all", "all", "title", "asc");

      expect(result[0].title).toBe("Clean Code");
      expect(result[1].title).toBe("JavaScript: The Good Parts");
      expect(result[2].title).toBe("Python Crash Course");
    });

    it("should sort books by title descending", () => {
      const result = filterAndSortBooks(mockBooks, "", "all", "all", "title", "desc");

      expect(result[0].title).toBe("Python Crash Course");
      expect(result[1].title).toBe("JavaScript: The Good Parts");
      expect(result[2].title).toBe("Clean Code");
    });

    it("should sort books by author", () => {
      const result = filterAndSortBooks(mockBooks, "", "all", "all", "author", "asc");

      expect(result[0].author).toBe("Douglas Crockford");
      expect(result[1].author).toBe("Eric Matthes");
      expect(result[2].author).toBe("Robert C. Martin");
    });

    it("should sort books by pages", () => {
      const result = filterAndSortBooks(mockBooks, "", "all", "all", "pages", "asc");

      expect(result[0].progress.totalPages).toBe(200);
      expect(result[1].progress.totalPages).toBe(300);
      expect(result[2].progress.totalPages).toBe(400);
    });

    it("should sort books by rating", () => {
      const result = filterAndSortBooks(mockBooks, "", "all", "all", "rating", "desc");

      expect(result[0].rating).toBe(5);
      expect(result[1].rating).toBe(4);
      expect(result[2].rating).toBe(undefined);
    });

    it("should sort books by progress", () => {
      const result = filterAndSortBooks(mockBooks, "", "all", "all", "progress", "desc");

      expect(result[0].state).toBe("finished"); // 100% progress
      expect(result[1].state).toBe("in_progress"); // 50% progress
      expect(result[2].state).toBe("not_started"); // 0% progress
    });

    it("should combine filters and sorting", () => {
      const result = filterAndSortBooks(mockBooks, "", "all", "owned", "title", "asc");

      expect(result).toHaveLength(2);
      expect(result[0].title).toBe("Clean Code");
      expect(result[1].title).toBe("JavaScript: The Good Parts");
      expect(result.every(book => book.isOwned)).toBe(true);
    });

    it("should handle empty query", () => {
      const result = filterAndSortBooks(mockBooks, "", "all", "all", "title", "asc");

      expect(result).toHaveLength(3);
    });

    it("should handle case insensitive search", () => {
      const result = filterAndSortBooks(mockBooks, "JAVASCRIPT", "all", "all", "title", "asc");

      expect(result).toHaveLength(1);
      expect(result[0].title).toBe("JavaScript: The Good Parts");
    });

    it("should default to title sort for unknown sort field", () => {
      const result = filterAndSortBooks(mockBooks, "", "all", "all", "unknown", "asc");

      expect(result[0].title).toBe("Clean Code");
      expect(result[1].title).toBe("JavaScript: The Good Parts");
      expect(result[2].title).toBe("Python Crash Course");
    });

    it("should handle books with missing rating when sorting by rating", () => {
      const result = filterAndSortBooks(mockBooks, "", "all", "all", "rating", "asc");

      expect(result[0].rating).toBe(undefined);
      expect(result[1].rating).toBe(4);
      expect(result[2].rating).toBe(5);
    });

    it("should return empty array when no books match filters", () => {
      const result = filterAndSortBooks(mockBooks, "nonexistent", "all", "all", "title", "asc");

      expect(result).toHaveLength(0);
    });
  });
});