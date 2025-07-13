/**
 * Book validation utilities for edit functionality
 *
 * This module provides comprehensive validation functions for book data,
 * particularly for the manual edit functionality where users can override
 * normal state machine constraints to fix errors or make corrections.
 */

import { VALIDATION_CONFIG } from "../constants/constants";
import { Book, ReadingState, isValidReadingState } from "../models/models";

/**
 * Validation result interface for consistent error reporting
 */
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

/**
 * Validates a complete book object for manual editing
 *
 * This function performs comprehensive validation of all book fields
 * while allowing manual state overrides for error correction scenarios.
 * Unlike the normal state machine, this allows any state transition.
 *
 * @param book - The book object to validate
 * @returns ValidationResult with validity status and error messages
 */
export const validateEditedBook = (book: Partial<Book>): ValidationResult => {
  const errors: string[] = [];

  // Required fields validation
  if (
    !book.title ||
    typeof book.title !== "string" ||
    book.title.trim() === ""
  ) {
    errors.push("Title is required and cannot be empty");
  }

  if (
    !book.author ||
    typeof book.author !== "string" ||
    book.author.trim() === ""
  ) {
    errors.push("Author is required and cannot be empty");
  }

  // Reading state validation
  if (book.state && !isValidReadingState(book.state)) {
    errors.push("Invalid reading state");
  }

  // Progress validation
  if (book.progress) {
    const progressValidation = validateProgressData(book.progress);
    if (!progressValidation.isValid) {
      errors.push(...progressValidation.errors);
    }
  }

  // Rating validation
  if (book.rating !== undefined) {
    const ratingValidation = validateRating(book.rating);
    if (!ratingValidation.isValid) {
      errors.push(...ratingValidation.errors);
    }
  }

  // ISBN validation
  if (book.isbn && book.isbn.trim() !== "") {
    const isbnValidation = validateISBN(book.isbn);
    if (!isbnValidation.isValid) {
      errors.push(...isbnValidation.errors);
    }
  }

  // URL validation for cover image
  if (book.coverImage && book.coverImage.trim() !== "") {
    const urlValidation = validateURL(book.coverImage);
    if (!urlValidation.isValid) {
      errors.push(...urlValidation.errors);
    }
  }

  // Published date validation
  if (book.publishedDate && book.publishedDate.trim() !== "") {
    const dateValidation = validatePublishedDate(book.publishedDate);
    if (!dateValidation.isValid) {
      errors.push(...dateValidation.errors);
    }
  }

  // Ownership validation
  if (book.isOwned !== undefined && typeof book.isOwned !== "boolean") {
    errors.push("Ownership status must be true or false");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Validates book progress data
 *
 * Ensures that progress values are within valid bounds and logical.
 * Used by the edit form to validate page number inputs.
 *
 * @param progress - Progress object to validate
 * @returns ValidationResult with validity status and error messages
 */
export const validateProgressData = (
  progress: Book["progress"]
): ValidationResult => {
  const errors: string[] = [];

  if (typeof progress.totalPages !== "number" || isNaN(progress.totalPages)) {
    errors.push("Total pages must be a valid number");
  } else if (progress.totalPages < 0) {
    errors.push("Total pages cannot be negative");
  }

  if (typeof progress.currentPage !== "number" || isNaN(progress.currentPage)) {
    errors.push("Current page must be a valid number");
  } else if (progress.currentPage < 0) {
    errors.push("Current page cannot be negative");
  } else if (
    progress.totalPages &&
    progress.currentPage > progress.totalPages
  ) {
    errors.push("Current page cannot exceed total pages");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Validates book rating values
 *
 * Ensures that rating is within the valid range (1-5 stars).
 * Used by the edit form to validate rating inputs.
 *
 * @param rating - Rating value to validate
 * @returns ValidationResult with validity status and error messages
 */
export const validateRating = (rating: number): ValidationResult => {
  const errors: string[] = [];

  if (typeof rating !== "number" || isNaN(rating)) {
    errors.push("Rating must be a valid number");
  } else if (rating < 1 || rating > 5) {
    errors.push("Rating must be between 1 and 5 stars");
  } else if (rating % 1 !== 0) {
    errors.push("Rating must be a whole number");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Validates ISBN format
 *
 * Performs basic ISBN format validation for both ISBN-10 and ISBN-13.
 * Used by the edit form to validate ISBN inputs.
 *
 * @param isbn - ISBN string to validate
 * @returns ValidationResult with validity status and error messages
 */
export const validateISBN = (isbn: string): ValidationResult => {
  const errors: string[] = [];
  const cleanISBN = isbn.replace(/[-\s]/g, ""); // Remove hyphens and spaces

  if (cleanISBN.length === 10) {
    // ISBN-10 validation
    if (!/^[0-9]{9}[0-9X]$/.test(cleanISBN)) {
      errors.push("Invalid ISBN-10 format");
    }
  } else if (cleanISBN.length === 13) {
    // ISBN-13 validation
    if (!/^[0-9]{13}$/.test(cleanISBN)) {
      errors.push("Invalid ISBN-13 format");
    }
  } else {
    errors.push("ISBN must be 10 or 13 digits long");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Validates URL format
 *
 * Performs basic URL validation for cover image URLs.
 * Used by the edit form to validate cover image URL inputs.
 *
 * @param url - URL string to validate
 * @returns ValidationResult with validity status and error messages
 */
export const validateURL = (url: string): ValidationResult => {
  const errors: string[] = [];

  try {
    new URL(url);
    // Check if it's a reasonable image URL
    if (
      !url.match(/\.(jpg|jpeg|png|gif|webp)$/i) &&
      !url.includes("books.google.com")
    ) {
      errors.push(
        "URL should point to an image file or be from a trusted source"
      );
    }
  } catch {
    errors.push("Invalid URL format");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Validates published date format
 *
 * Accepts various date formats commonly used for book publication dates.
 * Used by the edit form to validate published date inputs.
 *
 * @param dateString - Date string to validate
 * @returns ValidationResult with validity status and error messages
 */
export const validatePublishedDate = (dateString: string): ValidationResult => {
  const errors: string[] = [];

  // Accept various formats: YYYY, YYYY-MM, YYYY-MM-DD
  const yearOnly = /^\d{4}$/;
  const yearMonth = /^\d{4}-\d{2}$/;
  const fullDate = /^\d{4}-\d{2}-\d{2}$/;

  if (
    !yearOnly.test(dateString) &&
    !yearMonth.test(dateString) &&
    !fullDate.test(dateString)
  ) {
    errors.push("Date must be in format YYYY, YYYY-MM, or YYYY-MM-DD");
  } else {
    const year = parseInt(dateString.substring(0, 4));
    const currentYear = new Date().getFullYear();

    if (year < 1000 || year > currentYear + 1) {
      errors.push(`Year must be between 1000 and ${currentYear + 1}`);
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Reading state options for the edit form
 */
export const READING_STATE_OPTIONS: { value: ReadingState; label: string }[] = [
  { value: "not_started", label: "Not Started" },
  { value: "in_progress", label: "Currently Reading" },
  { value: "finished", label: "Finished" },
];

/**
 * Validates a string field (title, author, etc.)
 *
 * General purpose string validation for required text fields.
 *
 * @param value - String value to validate
 * @param fieldName - Name of the field for error messages
 * @param required - Whether the field is required
 * @returns ValidationResult with validity status and error messages
 */
export const validateStringField = (
  value: string | undefined,
  fieldName: string,
  required: boolean = true
): ValidationResult => {
  const errors: string[] = [];

  if (required && (!value || value.trim() === "")) {
    errors.push(`${fieldName} is required`);
  } else if (
    value &&
    value.trim().length > VALIDATION_CONFIG.TEXT_LIMITS.DESCRIPTION_MAX_LENGTH
  ) {
    errors.push(
      `${fieldName} cannot exceed ${VALIDATION_CONFIG.TEXT_LIMITS.DESCRIPTION_MAX_LENGTH} characters`
    );
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Validates a numeric field
 *
 * General purpose numeric validation for page numbers, etc.
 *
 * @param value - Numeric value to validate
 * @param fieldName - Name of the field for error messages
 * @param min - Minimum allowed value
 * @param max - Maximum allowed value
 * @returns ValidationResult with validity status and error messages
 */
export const validateNumericField = (
  value: number | string | undefined,
  fieldName: string,
  min: number = VALIDATION_CONFIG.NUMERIC.MIN_PAGE,
  max?: number
): ValidationResult => {
  const errors: string[] = [];

  if (value === undefined || value === "") {
    return { isValid: true, errors: [] }; // Optional field
  }

  const numValue = typeof value === "string" ? parseFloat(value) : value;

  if (isNaN(numValue)) {
    errors.push(`${fieldName} must be a valid number`);
  } else if (numValue < min) {
    errors.push(`${fieldName} cannot be less than ${min}`);
  } else if (max !== undefined && numValue > max) {
    errors.push(`${fieldName} cannot exceed ${max}`);
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};
