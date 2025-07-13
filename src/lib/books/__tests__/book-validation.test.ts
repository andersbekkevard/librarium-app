/**
 * Tests for book validation utilities
 *
 * Comprehensive test suite for all book validation functions,
 * covering edge cases, error conditions, and validation logic.
 */

import {
  READING_STATE_OPTIONS,
  validateEditedBook,
  validateNumericField,
  validateProgressData,
  validatePublishedDate,
  validateRating,
  validateStringField,
  validateURL,
} from "../book-validation";

describe("book-validation", () => {
  describe("validateEditedBook", () => {
    it("should validate a complete valid book", () => {
      const validBook = {
        title: "Test Book",
        author: "Test Author",
        state: "in_progress" as const,
        progress: { currentPage: 50, totalPages: 200 },
        isOwned: true,
        rating: 4,
        isbn: "978-0-123456-47-2",
        coverImage: "https://example.com/cover.jpg",
        publishedDate: "2023-01-15",
      };

      const result = validateEditedBook(validBook);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("should reject book with missing title", () => {
      const book = {
        author: "Test Author",
        state: "not_started" as const,
        isOwned: true,
      };

      const result = validateEditedBook(book);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("Title is required and cannot be empty");
    });

    it("should reject book with empty title", () => {
      const book = {
        title: "   ",
        author: "Test Author",
        state: "not_started" as const,
        isOwned: true,
      };

      const result = validateEditedBook(book);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("Title is required and cannot be empty");
    });

    it("should reject book with missing author", () => {
      const book = {
        title: "Test Book",
        state: "not_started" as const,
        isOwned: true,
      };

      const result = validateEditedBook(book);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("Author is required and cannot be empty");
    });

    it("should validate book with minimal required fields", () => {
      const book = {
        title: "Test Book",
        author: "Test Author",
      };

      const result = validateEditedBook(book);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("should reject invalid reading state", () => {
      const book = {
        title: "Test Book",
        author: "Test Author",
        state: "invalid_state" as any,
      };

      const result = validateEditedBook(book);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("Invalid reading state");
    });

    it("should validate valid reading states", () => {
      const states = ["not_started", "in_progress", "finished"] as const;

      states.forEach((state) => {
        const book = { title: "Test", author: "Test", state };
        const result = validateEditedBook(book);
        expect(result.isValid).toBe(true);
      });
    });

    it("should validate ownership status", () => {
      const book = {
        title: "Test Book",
        author: "Test Author",
        isOwned: "invalid" as any,
      };

      const result = validateEditedBook(book);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("Ownership status must be true or false");
    });
  });

  describe("validateProgressData", () => {
    it("should validate valid progress data", () => {
      const progress = { currentPage: 50, totalPages: 200 };
      const result = validateProgressData(progress);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("should reject negative total pages", () => {
      const progress = { currentPage: 50, totalPages: -100 };
      const result = validateProgressData(progress);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("Total pages cannot be negative");
    });

    it("should reject negative current page", () => {
      const progress = { currentPage: -10, totalPages: 200 };
      const result = validateProgressData(progress);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("Current page cannot be negative");
    });

    it("should reject current page exceeding total pages", () => {
      const progress = { currentPage: 250, totalPages: 200 };
      const result = validateProgressData(progress);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("Current page cannot exceed total pages");
    });

    it("should handle NaN values in progress", () => {
      const progress = { currentPage: NaN, totalPages: 200 };
      const result = validateProgressData(progress);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("Current page must be a valid number");
    });

    it("should handle zero values correctly", () => {
      const progress = { currentPage: 0, totalPages: 0 };
      const result = validateProgressData(progress);
      expect(result.isValid).toBe(true);
    });
  });

  describe("validateRating", () => {
    it("should validate valid ratings", () => {
      [1, 2, 3, 4, 5].forEach((rating) => {
        const result = validateRating(rating);
        expect(result.isValid).toBe(true);
      });
    });

    it("should reject ratings below 1", () => {
      const result = validateRating(0);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("Rating must be between 1 and 5 stars");
    });

    it("should reject ratings above 5", () => {
      const result = validateRating(6);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("Rating must be between 1 and 5 stars");
    });

    it("should reject decimal ratings", () => {
      const result = validateRating(3.5);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("Rating must be a whole number");
    });

    it("should reject NaN ratings", () => {
      const result = validateRating(NaN);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("Rating must be a valid number");
    });
  });

  describe("validateURL", () => {
    it("should validate valid HTTPS URL", () => {
      const result = validateURL("https://example.com/cover.jpg");
      expect(result.isValid).toBe(true);
    });

    it("should validate valid HTTP URL", () => {
      const result = validateURL("http://example.com/cover.png");
      expect(result.isValid).toBe(true);
    });

    it("should validate Google Books URL", () => {
      const result = validateURL(
        "https://books.google.com/books/content?id=123"
      );
      expect(result.isValid).toBe(true);
    });

    it("should reject invalid URL format", () => {
      const result = validateURL("not-a-url");
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("Invalid URL format");
    });

    it("should warn about non-image URLs", () => {
      const result = validateURL("https://example.com/document.pdf");
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(
        "URL should point to an image file or be from a trusted source"
      );
    });

    it("should accept various image formats", () => {
      const formats = ["jpg", "jpeg", "png", "gif", "webp"];
      formats.forEach((format) => {
        const result = validateURL(`https://example.com/image.${format}`);
        expect(result.isValid).toBe(true);
      });
    });
  });

  describe("validatePublishedDate", () => {
    it("should validate year-only format", () => {
      const result = validatePublishedDate("2023");
      expect(result.isValid).toBe(true);
    });

    it("should validate year-month format", () => {
      const result = validatePublishedDate("2023-05");
      expect(result.isValid).toBe(true);
    });

    it("should validate full date format", () => {
      const result = validatePublishedDate("2023-05-15");
      expect(result.isValid).toBe(true);
    });

    it("should reject invalid date format", () => {
      const result = validatePublishedDate("2023/05/15");
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(
        "Date must be in format YYYY, YYYY-MM, or YYYY-MM-DD"
      );
    });

    it("should reject year too early", () => {
      const result = validatePublishedDate("0999");
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("Year must be between 1000 and");
    });

    it("should reject year too far in future", () => {
      const currentYear = new Date().getFullYear();
      const result = validatePublishedDate(`${currentYear + 5}`);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("Year must be between 1000 and");
    });

    it("should reject invalid month format", () => {
      const result = validatePublishedDate("2023-13");
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(
        "Date must be in format YYYY, YYYY-MM, or YYYY-MM-DD"
      );
    });
  });

  describe("validateStringField", () => {
    it("should validate required string field", () => {
      const result = validateStringField("Valid Title", "Title");
      expect(result.isValid).toBe(true);
    });

    it("should reject empty required string field", () => {
      const result = validateStringField("", "Title");
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("Title is required");
    });

    it("should reject whitespace-only string field", () => {
      const result = validateStringField("   ", "Title");
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("Title is required");
    });

    it("should validate optional string field", () => {
      const result = validateStringField("", "Description", false);
      expect(result.isValid).toBe(true);
    });

    it("should validate undefined optional string field", () => {
      const result = validateStringField(undefined, "Description", false);
      expect(result.isValid).toBe(true);
    });
  });

  describe("validateNumericField", () => {
    it("should validate valid numeric field", () => {
      const result = validateNumericField(100, "Page Count");
      expect(result.isValid).toBe(true);
    });

    it("should handle string numeric input", () => {
      const result = validateNumericField("150", "Page Count");
      expect(result.isValid).toBe(true);
    });

    it("should reject NaN values", () => {
      const result = validateNumericField("invalid", "Page Count");
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("Page Count must be a valid number");
    });

    it("should enforce minimum value constraint", () => {
      const result = validateNumericField(-1, "Page Count", 0);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("Page Count cannot be less than 0");
    });

    it("should enforce maximum value constraint", () => {
      const result = validateNumericField(1000, "Page Count", 0, 500);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("Page Count cannot exceed 500");
    });

    it("should handle undefined/empty optional values", () => {
      const result = validateNumericField(undefined, "Page Count");
      expect(result.isValid).toBe(true);
    });

    it("should handle empty string as optional", () => {
      const result = validateNumericField("", "Page Count");
      expect(result.isValid).toBe(true);
    });
  });

  describe("READING_STATE_OPTIONS", () => {
    it("should contain all valid reading states", () => {
      expect(READING_STATE_OPTIONS).toHaveLength(3);
      expect(READING_STATE_OPTIONS).toEqual([
        { value: "not_started", label: "Not Started" },
        { value: "in_progress", label: "Reading" },
        { value: "finished", label: "Finished" },
      ]);
    });
  });
});
