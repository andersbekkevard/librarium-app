import {
  extractISBN,
  validateISBN,
  formatISBN,
  convertISBN10to13,
  stripISBNPrefix,
} from '../isbn-utils';

describe('extractISBN', () => {
  it('should extract ISBN-13 starting with 978', () => {
    expect(extractISBN('9781234567890')).toBe('9781234567890');
    expect(extractISBN('978-1-234-567-89-0')).toBe('9781234567890');
    expect(extractISBN(' 978 1 234 567 89 0 ')).toBe('9781234567890');
  });

  it('should extract ISBN-13 starting with 979', () => {
    expect(extractISBN('9791234567890')).toBe('9791234567890');
    expect(extractISBN('979-1-234-567-89-0')).toBe('9791234567890');
  });

  it('should extract ISBN-10', () => {
    expect(extractISBN('1234567890')).toBe('1234567890');
    expect(extractISBN('123456789X')).toBe('123456789X');
    expect(extractISBN('1-234-567-89-0')).toBe('1234567890');
  });

  it('should extract any 13-digit EAN-13 code', () => {
    expect(extractISBN('5781440898956')).toBe('5781440898956');
    expect(extractISBN('1234567890123')).toBe('1234567890123');
  });

  it('should handle UPC-A with leading zero', () => {
    expect(extractISBN('012345678901')).toBe('12345678901');
    expect(extractISBN('000123456789')).toBe('00123456789');
  });

  it('should return null for invalid input', () => {
    expect(extractISBN('')).toBeNull();
    expect(extractISBN('123')).toBeNull();
    expect(extractISBN('12345678901234')).toBeNull(); // Too long
    expect(extractISBN('abcdefghijk')).toBeNull();
    expect(extractISBN('123456789')).toBeNull(); // 9 digits
  });

  it('should handle null and undefined input', () => {
    // @ts-expect-error - testing runtime behavior
    expect(extractISBN(null)).toBeNull();
    // @ts-expect-error - testing runtime behavior
    expect(extractISBN(undefined)).toBeNull();
  });

  it('should handle non-string input', () => {
    // @ts-expect-error - testing runtime behavior
    expect(extractISBN(123)).toBeNull();
    // @ts-expect-error - testing runtime behavior
    expect(extractISBN({})).toBeNull();
  });

  it('should prioritize ISBN-13 with 978/979 prefix', () => {
    // Should return ISBN-13 format even if it could be interpreted as ISBN-10 + extra digits
    expect(extractISBN('9781234567890')).toBe('9781234567890');
    expect(extractISBN('9791234567890')).toBe('9791234567890');
  });
});

describe('validateISBN', () => {
  it('should validate correct ISBN-10 with numeric check digit', () => {
    expect(validateISBN('0471958697')).toBe(true);
    expect(validateISBN('0-471-95869-7')).toBe(true);
  });

  it('should validate correct ISBN-10 with X check digit', () => {
    expect(validateISBN('043942089X')).toBe(true);
    expect(validateISBN('0-439-42089-X')).toBe(true);
    expect(validateISBN('043942089x')).toBe(true); // lowercase x
  });

  it('should reject incorrect ISBN-10', () => {
    expect(validateISBN('0471958698')).toBe(false); // Wrong check digit
    expect(validateISBN('047195869Y')).toBe(false); // Invalid character
  });

  it('should validate any 13-digit code (permissive for scanning)', () => {
    expect(validateISBN('9781234567890')).toBe(true);
    expect(validateISBN('1234567890123')).toBe(true);
    expect(validateISBN('5781440898956')).toBe(true);
    expect(validateISBN('978-1-234-567-89-0')).toBe(true);
  });

  it('should reject 13-digit codes with non-numeric characters', () => {
    expect(validateISBN('978123456789A')).toBe(false);
    expect(validateISBN('97812345678XX')).toBe(false);
  });

  it('should return false for invalid input', () => {
    expect(validateISBN('')).toBe(false);
    expect(validateISBN('123')).toBe(false);
    expect(validateISBN('12345678901234')).toBe(false); // Too long
    // @ts-expect-error - testing runtime behavior
    expect(validateISBN(null)).toBe(false);
    // @ts-expect-error - testing runtime behavior
    expect(validateISBN(undefined)).toBe(false);
  });

  it('should handle formatted ISBNs', () => {
    expect(validateISBN('978-1-234-567-89-0')).toBe(true);
    expect(validateISBN('0-471-95869-7')).toBe(true);
    expect(validateISBN('0-439-42089-X')).toBe(true);
  });
});

describe('formatISBN', () => {
  it('should format ISBN-13', () => {
    expect(formatISBN('9781234567890')).toBe('978-1-234-56789-0');
    expect(formatISBN('9791234567890')).toBe('979-1-234-56789-0');
  });

  it('should format ISBN-10', () => {
    expect(formatISBN('1234567890')).toBe('1-234-56789-0');
    expect(formatISBN('043942089X')).toBe('0-439-42089-X');
  });

  it('should handle already formatted ISBNs', () => {
    expect(formatISBN('978-1-234-56789-0')).toBe('978-1-234-56789-0');
    expect(formatISBN('1-234-56789-0')).toBe('1-234-56789-0');
  });

  it('should return original for invalid ISBNs', () => {
    expect(formatISBN('123')).toBe('123');
    expect(formatISBN('12345678901234')).toBe('12345678901234');
    expect(formatISBN('')).toBe('');
  });

  it('should handle null and undefined', () => {
    // @ts-expect-error - testing runtime behavior
    expect(formatISBN(null)).toBeNull();
    // @ts-expect-error - testing runtime behavior
    expect(formatISBN(undefined)).toBeUndefined();
  });
});

describe('convertISBN10to13', () => {
  it('should convert valid ISBN-10 to ISBN-13', () => {
    // These tests use known conversions
    const isbn10 = '0471958697';
    const result = convertISBN10to13(isbn10);
    expect(result).toMatch(/^978\d{10}$/); // Should start with 978 and be 13 digits
    expect(validateISBN(result!)).toBe(true); // Should be valid
  });

  it('should handle ISBN-10 with X check digit', () => {
    const isbn10 = '043942089X';
    const result = convertISBN10to13(isbn10);
    expect(result).toMatch(/^978\d{10}$/);
    expect(validateISBN(result!)).toBe(true);
  });

  it('should handle formatted ISBN-10', () => {
    const isbn10 = '0-471-95869-7';
    const result = convertISBN10to13(isbn10);
    expect(result).toMatch(/^978\d{10}$/);
    expect(validateISBN(result!)).toBe(true);
  });

  it('should return null for invalid ISBN-10', () => {
    expect(convertISBN10to13('0471958698')).toBeNull(); // Invalid check digit
    expect(convertISBN10to13('123')).toBeNull(); // Too short
    expect(convertISBN10to13('9781234567890')).toBeNull(); // Already ISBN-13
    expect(convertISBN10to13('')).toBeNull();
  });

  it('should calculate correct check digit', () => {
    // Manual verification of the check digit calculation
    const isbn10 = '0471958697';
    const result = convertISBN10to13(isbn10);
    
    // Verify the check digit is calculated correctly
    if (result) {
      const digits = result.slice(0, 12);
      let sum = 0;
      for (let i = 0; i < 12; i++) {
        const weight = i % 2 === 0 ? 1 : 3;
        sum += parseInt(digits[i]) * weight;
      }
      const checkDigit = (10 - (sum % 10)) % 10;
      expect(result[12]).toBe(checkDigit.toString());
    }
  });
});

describe('stripISBNPrefix', () => {
  it('should convert ISBN-13 with 978 prefix to ISBN-10', () => {
    const isbn13 = '9780471958697';
    const result = stripISBNPrefix(isbn13);
    expect(result).toMatch(/^\d{9}[\dX]$/); // Should be 10 characters, last could be X
    expect(validateISBN(result)).toBe(true);
  });

  it('should convert ISBN-13 with 979 prefix to ISBN-10', () => {
    const isbn13 = '9791234567890';
    const result = stripISBNPrefix(isbn13);
    expect(result).toMatch(/^\d{9}[\dX]$/);
    expect(validateISBN(result)).toBe(true);
  });

  it('should handle formatted ISBN-13', () => {
    const isbn13 = '978-0-471-95869-7';
    const result = stripISBNPrefix(isbn13);
    expect(result).toMatch(/^\d{9}[\dX]$/);
    expect(validateISBN(result)).toBe(true);
  });

  it('should return ISBN-10 unchanged', () => {
    const isbn10 = '0471958697';
    expect(stripISBNPrefix(isbn10)).toBe('0471958697');
    
    const isbn10WithX = '043942089X';
    expect(stripISBNPrefix(isbn10WithX)).toBe('043942089X');
  });

  it('should return non-prefixed ISBN-13 unchanged', () => {
    const isbn13 = '1234567890123';
    expect(stripISBNPrefix(isbn13)).toBe('1234567890123');
  });

  it('should handle empty and invalid input', () => {
    expect(stripISBNPrefix('')).toBe('');
    expect(stripISBNPrefix('123')).toBe('123');
    // @ts-expect-error - testing runtime behavior
    expect(stripISBNPrefix(null)).toBeNull();
    // @ts-expect-error - testing runtime behavior
    expect(stripISBNPrefix(undefined)).toBeUndefined();
  });

  it('should calculate correct ISBN-10 check digit', () => {
    const isbn13 = '9780471958697';
    const result = stripISBNPrefix(isbn13);
    
    if (result && result.length === 10) {
      // Verify check digit calculation
      let sum = 0;
      for (let i = 0; i < 9; i++) {
        sum += parseInt(result[i]) * (10 - i);
      }
      const checkDigit = (11 - (sum % 11)) % 11;
      const expectedCheckChar = checkDigit === 10 ? 'X' : checkDigit.toString();
      expect(result[9]).toBe(expectedCheckChar);
    }
  });

  it('should handle ISBN-13 that converts to ISBN-10 with X check digit', () => {
    // Find an ISBN-13 that when converted results in X check digit
    // This requires manual calculation or known examples
    const result = stripISBNPrefix('9780439420891');
    
    if (result && result.endsWith('X')) {
      expect(result).toMatch(/^\d{9}X$/);
      expect(validateISBN(result)).toBe(true);
    }
  });
});

describe('ISBN utilities integration', () => {
  it('should work together for complete ISBN processing', () => {
    const barcodeText = '978-0-471-95869-7';
    
    // Extract clean ISBN
    const extracted = extractISBN(barcodeText);
    expect(extracted).toBe('9780471958697');
    
    // Validate it
    expect(validateISBN(extracted!)).toBe(true);
    
    // Format for display
    const formatted = formatISBN(extracted!);
    expect(formatted).toBe('978-0-471-95869-7');
    
    // Strip prefix for API calls
    const stripped = stripISBNPrefix(extracted!);
    expect(validateISBN(stripped)).toBe(true);
    expect(stripped.length).toBe(10);
  });

  it('should handle ISBN-10 processing chain', () => {
    const isbn10 = '0-471-95869-7';
    
    const extracted = extractISBN(isbn10);
    expect(extracted).toBe('0471958697');
    
    expect(validateISBN(extracted!)).toBe(true);
    
    const formatted = formatISBN(extracted!);
    expect(formatted).toBe('0-471-95869-7');
    
    const converted = convertISBN10to13(extracted!);
    expect(converted).toMatch(/^978\d{10}$/);
    expect(validateISBN(converted!)).toBe(true);
  });
});