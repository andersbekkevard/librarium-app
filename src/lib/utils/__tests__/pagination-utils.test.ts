import {
  calculatePagination,
  generateVisiblePages,
  validatePageSize,
  getStoredPageSize,
  storePageSize,
  calculateItemRange,
  getSafePage,
  DEFAULT_PAGE_SIZE_OPTIONS,
  DEFAULT_PAGINATION_CONFIG,
} from '../pagination-utils';

// Mock localStorage
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};

// Save original window.localStorage if it exists
const originalLocalStorage = typeof window !== 'undefined' ? window.localStorage : undefined;

// Mock window.localStorage
beforeAll(() => {
  if (typeof window !== 'undefined') {
    Object.defineProperty(window, 'localStorage', {
      value: mockLocalStorage,
      configurable: true,
    });
  }
});

// Restore original localStorage after tests
afterAll(() => {
  if (typeof window !== 'undefined' && originalLocalStorage) {
    Object.defineProperty(window, 'localStorage', {
      value: originalLocalStorage,
      configurable: true,
    });
  }
});

// Mock console.warn to avoid noise in tests
const mockConsoleWarn = jest.fn();
global.console.warn = mockConsoleWarn;

describe('calculatePagination', () => {
  it('should calculate pagination for first page', () => {
    const result = calculatePagination({
      currentPage: 1,
      totalItems: 100,
      pageSize: 10,
    });

    expect(result).toEqual({
      totalPages: 10,
      startIndex: 0,
      endIndex: 10,
      hasNextPage: true,
      hasPreviousPage: false,
      visiblePages: [1, 2, 3, 4, 5, 6, 7],
    });
  });

  it('should calculate pagination for middle page', () => {
    const result = calculatePagination({
      currentPage: 5,
      totalItems: 100,
      pageSize: 10,
    });

    expect(result).toEqual({
      totalPages: 10,
      startIndex: 40,
      endIndex: 50,
      hasNextPage: true,
      hasPreviousPage: true,
      visiblePages: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    });
  });

  it('should calculate pagination for last page', () => {
    const result = calculatePagination({
      currentPage: 10,
      totalItems: 100,
      pageSize: 10,
    });

    expect(result).toEqual({
      totalPages: 10,
      startIndex: 90,
      endIndex: 100,
      hasNextPage: false,
      hasPreviousPage: true,
      visiblePages: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    });
  });

  it('should handle partial last page', () => {
    const result = calculatePagination({
      currentPage: 5,
      totalItems: 47,
      pageSize: 10,
    });

    expect(result).toEqual({
      totalPages: 5,
      startIndex: 40,
      endIndex: 47, // Less than start + pageSize
      hasNextPage: false,
      hasPreviousPage: true,
      visiblePages: [1, 2, 3, 4, 5],
    });
  });

  it('should handle single page', () => {
    const result = calculatePagination({
      currentPage: 1,
      totalItems: 5,
      pageSize: 10,
    });

    expect(result).toEqual({
      totalPages: 1,
      startIndex: 0,
      endIndex: 5,
      hasNextPage: false,
      hasPreviousPage: false,
      visiblePages: [1],
    });
  });

  it('should handle empty items', () => {
    const result = calculatePagination({
      currentPage: 1,
      totalItems: 0,
      pageSize: 10,
    });

    expect(result).toEqual({
      totalPages: 0,
      startIndex: 0,
      endIndex: 0,
      hasNextPage: false,
      hasPreviousPage: false,
      visiblePages: [],
    });
  });

  it('should use custom maxVisiblePages', () => {
    const result = calculatePagination({
      currentPage: 1,
      totalItems: 200,
      pageSize: 10,
      maxVisiblePages: 3,
    });

    expect(result.visiblePages).toHaveLength(3);
    expect(result.visiblePages).toEqual([1, 2, 3]);
  });
});

describe('generateVisiblePages', () => {
  it('should show all pages when total is less than max', () => {
    expect(generateVisiblePages(3, 5, 7)).toEqual([1, 2, 3, 4, 5]);
  });

  it('should show first page, ellipsis, middle pages, ellipsis, last page', () => {
    const result = generateVisiblePages(10, 20, 7);
    expect(result).toContain(1);
    expect(result).toContain(20);
    expect(result).toContain(-1); // ellipsis
    expect(result.length).toBeLessThanOrEqual(7);
  });

  it('should handle beginning pages without left ellipsis', () => {
    const result = generateVisiblePages(2, 20, 7);
    expect(result).toEqual([1, 2, 3, 4, 5, -1, 20]);
  });

  it('should handle end pages without right ellipsis', () => {
    const result = generateVisiblePages(19, 20, 7);
    expect(result).toEqual([1, -1, 16, 17, 18, 19, 20]);
  });

  it('should handle single page', () => {
    expect(generateVisiblePages(1, 1, 7)).toEqual([1]);
  });

  it('should handle two pages', () => {
    expect(generateVisiblePages(1, 2, 7)).toEqual([1, 2]);
    expect(generateVisiblePages(2, 2, 7)).toEqual([1, 2]);
  });

  it('should handle maxVisiblePages of 1', () => {
    expect(generateVisiblePages(5, 10, 1)).toEqual([1]);
  });

  it('should handle maxVisiblePages of 3', () => {
    const result = generateVisiblePages(10, 20, 3);
    expect(result.length).toBeLessThanOrEqual(3);
    expect(result).toContain(1);
    expect(result).toContain(20);
  });
});

describe('validatePageSize', () => {
  it('should return valid page size as-is', () => {
    expect(validatePageSize(25)).toBe(25);
    expect(validatePageSize(100)).toBe(100);
  });

  it('should return minimum for values below minimum', () => {
    expect(validatePageSize(2)).toBe(5); // Default min is 5
    expect(validatePageSize(0)).toBe(5);
    expect(validatePageSize(-10)).toBe(5);
  });

  it('should return maximum for values above maximum', () => {
    expect(validatePageSize(1000)).toBe(500); // Default max is 500
    expect(validatePageSize(999)).toBe(500);
  });

  it('should use custom min/max values', () => {
    expect(validatePageSize(5, 10, 50)).toBe(10); // Below custom min
    expect(validatePageSize(100, 10, 50)).toBe(50); // Above custom max
    expect(validatePageSize(25, 10, 50)).toBe(25); // Within range
  });

  it('should handle NaN values', () => {
    expect(validatePageSize(NaN)).toBe(5);
    expect(validatePageSize(NaN, 10, 100)).toBe(10);
  });

  it('should floor decimal values', () => {
    expect(validatePageSize(25.7)).toBe(25);
    expect(validatePageSize(25.1)).toBe(25);
    expect(validatePageSize(25.9)).toBe(25);
  });
});

describe('getStoredPageSize', () => {
  beforeEach(() => {
    mockLocalStorage.getItem.mockClear();
    mockConsoleWarn.mockClear();
  });

  it('should return stored page size when valid', () => {
    mockLocalStorage.getItem.mockReturnValue('50');
    
    const result = getStoredPageSize('test-key');
    
    expect(mockLocalStorage.getItem).toHaveBeenCalledWith('test-key');
    expect(result).toBe(50);
  });

  it('should return default when no stored value', () => {
    mockLocalStorage.getItem.mockReturnValue(null);
    
    const result = getStoredPageSize('test-key', 30);
    
    expect(result).toBe(30);
  });

  it('should validate stored page size', () => {
    mockLocalStorage.getItem.mockReturnValue('1000'); // Above max
    
    const result = getStoredPageSize('test-key');
    
    expect(result).toBe(500); // Should be clamped to max
  });

  it('should handle invalid stored values', () => {
    mockLocalStorage.getItem.mockReturnValue('invalid');
    
    const result = getStoredPageSize('test-key', 30);
    
    expect(result).toBe(5); // Should return min value for NaN
  });

  it('should handle localStorage errors', () => {
    mockLocalStorage.getItem.mockImplementation(() => {
      throw new Error('localStorage error');
    });
    
    const result = getStoredPageSize('test-key', 30);
    
    expect(result).toBe(30);
    expect(mockConsoleWarn).toHaveBeenCalledWith(
      'Failed to read page size from localStorage:',
      expect.any(Error)
    );
  });

  it('should return default when running server-side', () => {
    // Mock server-side environment by making window undefined
    const originalWindow = (global as any).window;
    (global as any).window = undefined;
    
    const result = getStoredPageSize('test-key', 30);
    
    expect(result).toBe(30);
    
    // Restore window
    (global as any).window = originalWindow;
  });
});

describe('storePageSize', () => {
  beforeEach(() => {
    mockLocalStorage.setItem.mockClear();
    mockConsoleWarn.mockClear();
  });

  it('should store page size in localStorage', () => {
    storePageSize('test-key', 50);
    
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith('test-key', '50');
  });

  it('should handle localStorage errors', () => {
    mockLocalStorage.setItem.mockImplementation(() => {
      throw new Error('localStorage error');
    });
    
    storePageSize('test-key', 50);
    
    expect(mockConsoleWarn).toHaveBeenCalledWith(
      'Failed to store page size in localStorage:',
      expect.any(Error)
    );
  });

  it('should handle server-side environment', () => {
    const originalWindow = (global as any).window;
    (global as any).window = undefined;
    
    // Should not throw
    expect(() => storePageSize('test-key', 50)).not.toThrow();
    
    (global as any).window = originalWindow;
  });
});

describe('calculateItemRange', () => {
  it('should calculate range for first page', () => {
    const result = calculateItemRange(1, 10, 100);
    
    expect(result).toEqual({
      start: 1,
      end: 10,
      total: 100,
    });
  });

  it('should calculate range for middle page', () => {
    const result = calculateItemRange(5, 10, 100);
    
    expect(result).toEqual({
      start: 41,
      end: 50,
      total: 100,
    });
  });

  it('should calculate range for partial last page', () => {
    const result = calculateItemRange(5, 10, 47);
    
    expect(result).toEqual({
      start: 41,
      end: 47,
      total: 47,
    });
  });

  it('should handle empty total', () => {
    const result = calculateItemRange(1, 10, 0);
    
    expect(result).toEqual({
      start: 0,
      end: 0,
      total: 0,
    });
  });

  it('should handle single item', () => {
    const result = calculateItemRange(1, 10, 1);
    
    expect(result).toEqual({
      start: 1,
      end: 1,
      total: 1,
    });
  });
});

describe('getSafePage', () => {
  it('should return valid page as-is', () => {
    expect(getSafePage(5, 10)).toBe(5);
    expect(getSafePage(1, 10)).toBe(1);
    expect(getSafePage(10, 10)).toBe(10);
  });

  it('should return 1 for pages below 1', () => {
    expect(getSafePage(0, 10)).toBe(1);
    expect(getSafePage(-5, 10)).toBe(1);
  });

  it('should return totalPages for pages above total', () => {
    expect(getSafePage(15, 10)).toBe(10);
    expect(getSafePage(999, 10)).toBe(10);
  });

  it('should handle totalPages of 0', () => {
    expect(getSafePage(1, 0)).toBe(1);
    expect(getSafePage(5, 0)).toBe(1);
  });

  it('should handle negative totalPages', () => {
    expect(getSafePage(1, -5)).toBe(1);
    expect(getSafePage(10, -1)).toBe(1);
  });
});

describe('constants', () => {
  it('should have default page size options', () => {
    expect(DEFAULT_PAGE_SIZE_OPTIONS).toEqual([10, 25, 50, 100]);
  });

  it('should have default pagination config', () => {
    expect(DEFAULT_PAGINATION_CONFIG).toEqual({
      pageSize: 25,
      maxVisiblePages: 7,
      storageKey: 'pagination-page-size',
      minPageSize: 5,
      maxPageSize: 500,
    });
  });
});

describe('pagination integration', () => {
  it('should work together for complete pagination flow', () => {
    const totalItems = 250;
    const pageSize = 25;
    const currentPage = 5;
    
    // Calculate pagination
    const pagination = calculatePagination({
      currentPage,
      totalItems,
      pageSize,
    });
    
    expect(pagination.totalPages).toBe(10);
    expect(pagination.hasNextPage).toBe(true);
    expect(pagination.hasPreviousPage).toBe(true);
    
    // Calculate item range
    const range = calculateItemRange(currentPage, pageSize, totalItems);
    expect(range).toEqual({
      start: 101,
      end: 125,
      total: 250,
    });
    
    // Validate page
    const safePage = getSafePage(currentPage, pagination.totalPages);
    expect(safePage).toBe(5);
  });

  it('should handle edge cases in integration', () => {
    const totalItems = 0;
    const pageSize = 25;
    const currentPage = 1;
    
    const pagination = calculatePagination({
      currentPage,
      totalItems,
      pageSize,
    });
    
    expect(pagination.totalPages).toBe(0);
    expect(pagination.visiblePages).toEqual([]);
    
    const range = calculateItemRange(currentPage, pageSize, totalItems);
    expect(range.start).toBe(0);
    expect(range.end).toBe(0);
  });
});