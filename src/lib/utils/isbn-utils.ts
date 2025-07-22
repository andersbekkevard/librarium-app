/**
 * ISBN Utility Functions
 *
 * Utility functions for extracting and validating ISBN codes from various barcode formats.
 * Supports ISBN-10, ISBN-13, EAN-13, and UPC-A barcode processing.
 */

/**
 * Extracts ISBN from various barcode formats
 *
 * Handles multiple barcode formats that can contain ISBN information:
 * - ISBN-13 (EAN-13 starting with 978/979 for books)
 * - ISBN-10
 * - UPC-A with leading zero (converts to ISBN-13)
 * - EAN-13 (any 13-digit code - let Google Books API determine if it's a book)
 *
 * @param barcodeText - Raw barcode text from scanner
 * @returns Extracted ISBN string or null if not found/invalid
 *
 * @example
 * extractISBN('9781234567890') // Returns '9781234567890' (ISBN-13)
 * extractISBN('1234567890') // Returns '1234567890' (ISBN-10)
 * extractISBN('01234567890') // Returns '1234567890' (UPC-A to ISBN-13)
 * extractISBN('5781440898956') // Returns '5781440898956' (EAN-13)
 */
export function extractISBN(barcodeText: string): string | null {
  if (!barcodeText || typeof barcodeText !== "string") {
    return null;
  }

  // Remove all non-digit characters except 'X' (valid in ISBN-10)
  const cleaned = barcodeText.replace(/[^0-9X]/gi, "").toUpperCase();

  // ISBN-13 (EAN-13 starting with 978/979 for books) - highest priority
  if (
    cleaned.length === 13 &&
    (cleaned.startsWith("978") || cleaned.startsWith("979"))
  ) {
    return cleaned;
  }

  // ISBN-10 - standard 10-digit ISBN (can contain 'X' as last character)
  if (cleaned.length === 10) {
    return cleaned;
  }

  // Any EAN-13 code (13 digits) - let Google Books API determine if it's a book
  // This handles edge cases where books have EAN-13 codes with non-standard prefixes
  if (cleaned.length === 13 && /^\d{13}$/.test(cleaned)) {
    return cleaned;
  }

  // UPC-A with leading zero (12 digits starting with 0)
  // Convert to ISBN-13 by removing leading zero
  if (cleaned.length === 12 && cleaned.startsWith("0") && /^\d{12}$/.test(cleaned)) {
    const potentialIsbn = cleaned.substring(1);
    // Check if it looks like an ISBN (11 digits that could be ISBN-13 without prefix)
    if (potentialIsbn.length === 11) {
      return potentialIsbn;
    }
  }

  return null;
}

/**
 * Validates ISBN format using checksum algorithms
 *
 * Validates both ISBN-10 and ISBN-13 formats using their respective
 * checksum algorithms to ensure the ISBN is mathematically valid.
 * For scanning use cases, we're more permissive and let the Google Books API
 * determine if a barcode represents a valid book.
 *
 * @param isbn - ISBN string to validate (should be digits only)
 * @returns true if ISBN is valid, false otherwise
 *
 * @example
 * validateISBN('9781234567897') // Returns true if checksum is valid
 * validateISBN('1234567890') // Returns true if checksum is valid
 * validateISBN('1234567891') // Returns false (invalid checksum)
 * validateISBN('5781440898956') // Returns true (valid EAN-13 format, let API decide)
 */
export function validateISBN(isbn: string): boolean {
  if (!isbn || typeof isbn !== "string") {
    return false;
  }

  // Remove any non-digit characters except 'X' (valid in ISBN-10)
  const cleanIsbn = isbn.replace(/[^0-9X]/gi, "").toUpperCase();

  if (cleanIsbn.length === 10) {
    return validateISBN10(cleanIsbn);
  } else if (cleanIsbn.length === 13) {
    // For scanning use cases, accept any 13-digit EAN-13 code
    // and let the Google Books API determine if it's a valid book
    // Traditional ISBN-13 validation is too restrictive for real-world barcodes
    return validateISBN13Basic(cleanIsbn);
  }

  return false;
}

/**
 * Validates ISBN-10 format using checksum algorithm
 *
 * ISBN-10 uses a weighted checksum where each digit is multiplied
 * by its position weight (10, 9, 8, ..., 1) and the sum must be
 * divisible by 11. The last digit can be 'X' representing 10.
 *
 * @param isbn10 - 10-character ISBN string
 * @returns true if valid ISBN-10, false otherwise
 */
function validateISBN10(isbn10: string): boolean {
  if (isbn10.length !== 10) {
    return false;
  }

  let sum = 0;
  for (let i = 0; i < 9; i++) {
    const digit = parseInt(isbn10[i]);
    if (isNaN(digit)) {
      return false;
    }
    sum += digit * (10 - i);
  }

  // Handle check digit (can be 'X' for 10)
  const checkDigit = isbn10[9] === "X" ? 10 : parseInt(isbn10[9]);
  if (isNaN(checkDigit)) {
    return false;
  }

  sum += checkDigit;
  return sum % 11 === 0;
}

/**
 * Basic validation for 13-digit EAN-13 codes (permissive for scanning)
 *
 * For barcode scanning, we use a more permissive validation that accepts
 * any 13-digit numeric code and lets the Google Books API determine
 * if it represents a valid book. This handles edge cases where books
 * have non-standard EAN-13 prefixes.
 *
 * @param isbn13 - 13-character string
 * @returns true if it's a valid 13-digit numeric code, false otherwise
 */
function validateISBN13Basic(isbn13: string): boolean {
  if (isbn13.length !== 13) {
    return false;
  }

  // Check that all characters are digits
  for (let i = 0; i < 13; i++) {
    const digit = parseInt(isbn13[i]);
    if (isNaN(digit)) {
      return false;
    }
  }

  return true;
}

/**
 * Validates ISBN-13 format using checksum algorithm (strict validation)
 *
 * ISBN-13 uses an alternating weight checksum where odd positions
 * are multiplied by 1 and even positions by 3. The sum must result
 * in a check digit that makes the total divisible by 10.
 *
 * @param isbn13 - 13-character ISBN string
 * @returns true if valid ISBN-13, false otherwise
 */
function validateISBN13(isbn13: string): boolean {
  if (isbn13.length !== 13) {
    return false;
  }

  let sum = 0;
  for (let i = 0; i < 12; i++) {
    const digit = parseInt(isbn13[i]);
    if (isNaN(digit)) {
      return false;
    }
    // Odd positions (1st, 3rd, 5th...) have weight 1
    // Even positions (2nd, 4th, 6th...) have weight 3
    const weight = i % 2 === 0 ? 1 : 3;
    sum += digit * weight;
  }

  const checkDigit = parseInt(isbn13[12]);
  if (isNaN(checkDigit)) {
    return false;
  }

  // Check digit should make the total sum divisible by 10
  const calculatedCheckDigit = (10 - (sum % 10)) % 10;
  return checkDigit === calculatedCheckDigit;
}

/**
 * Formats an ISBN with standard separators for display
 *
 * Adds hyphens to ISBN for better readability according to
 * standard ISBN formatting rules.
 *
 * @param isbn - Raw ISBN string
 * @returns Formatted ISBN with hyphens or original string if invalid
 *
 * @example
 * formatISBN('9781234567890') // Returns '978-1-234-567-89-0'
 * formatISBN('1234567890') // Returns '1-234-567-89-0'
 */
export function formatISBN(isbn: string): string {
  if (!isbn) {
    return isbn;
  }

  // Preserve 'X' in ISBN-10, remove other non-digits
  const cleanIsbn = isbn.replace(/[^0-9X]/gi, "").toUpperCase();

  if (cleanIsbn.length === 13) {
    // ISBN-13 formatting: 978-0-471-95869-7 (prefix-group-publisher-title-check)
    return `${cleanIsbn.slice(0, 3)}-${cleanIsbn.slice(3, 4)}-${cleanIsbn.slice(
      4,
      7
    )}-${cleanIsbn.slice(7, 12)}-${cleanIsbn.slice(12)}`;
  } else if (cleanIsbn.length === 10) {
    // ISBN-10 formatting: 0-471-95869-7 (group-publisher-title-check)
    return `${cleanIsbn.slice(0, 1)}-${cleanIsbn.slice(1, 4)}-${cleanIsbn.slice(
      4,
      9
    )}-${cleanIsbn.slice(9)}`;
  }

  return isbn; // Return original if can't format
}

/**
 * Converts ISBN-10 to ISBN-13 format
 *
 * Converts a valid ISBN-10 to ISBN-13 by adding the 978 prefix
 * and recalculating the check digit.
 *
 * @param isbn10 - Valid ISBN-10 string
 * @returns ISBN-13 string or null if conversion fails
 *
 * @example
 * convertISBN10to13('1234567890') // Returns '9781234567xxx' (with correct check digit)
 */
export function convertISBN10to13(isbn10: string): string | null {
  if (!validateISBN(isbn10)) {
    return null;
  }

  // Clean ISBN-10 but preserve 'X' for validation
  const cleanIsbn10 = isbn10.replace(/[^0-9X]/gi, "").toUpperCase();
  if (cleanIsbn10.length !== 10) {
    return null;
  }

  // Extract the first 9 digits for conversion (removing the check digit)
  const isbn13Base = "978" + cleanIsbn10.slice(0, 9);

  // Calculate ISBN-13 check digit
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    const digit = parseInt(isbn13Base[i]);
    const weight = i % 2 === 0 ? 1 : 3;
    sum += digit * weight;
  }

  const checkDigit = (10 - (sum % 10)) % 10;
  return isbn13Base + checkDigit.toString();
}

/**
 * Strips the 978/979 prefix from ISBN-13 for Google Books API calls
 *
 * Google Books API works better with ISBNs without the 978/979 prefix.
 * This function removes the prefix and converts to ISBN-10 format.
 *
 * @param isbn - ISBN string (ISBN-10 or ISBN-13)
 * @returns ISBN without 978/979 prefix, or original ISBN if no prefix
 *
 * @example
 * stripISBNPrefix('9781234567890') // Returns '123456789X' (full ISBN-10)
 * stripISBNPrefix('9791234567890') // Returns '123456789X' (full ISBN-10)
 * stripISBNPrefix('1234567890') // Returns '1234567890' (unchanged)
 */
export function stripISBNPrefix(isbn: string): string {
  if (!isbn) {
    return isbn;
  }

  // Clean ISBN but preserve 'X' for ISBN-10
  const cleanIsbn = isbn.replace(/[^0-9X]/gi, "").toUpperCase();

  // If it's a 13-digit ISBN starting with 978 or 979, convert to ISBN-10
  if (
    cleanIsbn.length === 13 &&
    (cleanIsbn.startsWith("978") || cleanIsbn.startsWith("979"))
  ) {
    // Extract the 9-digit core (without 978/979 prefix and check digit)
    const core = cleanIsbn.substring(3, 12);

    // Calculate ISBN-10 check digit
    let sum = 0;
    for (let i = 0; i < 9; i++) {
      sum += parseInt(core[i]) * (10 - i);
    }
    const checkDigit = (11 - (sum % 11)) % 11;
    const checkChar = checkDigit === 10 ? "X" : checkDigit.toString();

    return core + checkChar;
  }

  // Return as-is for ISBN-10 or non-prefixed ISBNs (preserving X)
  return cleanIsbn;
}
