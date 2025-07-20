/**
 * Pagination utility functions
 * 
 * Provides helper functions for pagination calculations and logic
 */

export interface PaginationConfig {
  currentPage: number;
  totalItems: number;
  pageSize: number;
  maxVisiblePages?: number;
}

export interface PaginationResult {
  totalPages: number;
  startIndex: number;
  endIndex: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  visiblePages: number[];
}

/**
 * Calculate pagination data
 */
export const calculatePagination = (config: PaginationConfig): PaginationResult => {
  const { currentPage, totalItems, pageSize, maxVisiblePages = 7 } = config;
  
  const totalPages = Math.ceil(totalItems / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalItems);
  
  const hasNextPage = currentPage < totalPages;
  const hasPreviousPage = currentPage > 1;
  
  const visiblePages = generateVisiblePages(currentPage, totalPages, maxVisiblePages);
  
  return {
    totalPages,
    startIndex,
    endIndex,
    hasNextPage,
    hasPreviousPage,
    visiblePages,
  };
};

/**
 * Generate array of visible page numbers with ellipsis logic
 */
export const generateVisiblePages = (
  currentPage: number,
  totalPages: number,
  maxVisiblePages: number
): number[] => {
  if (totalPages <= maxVisiblePages) {
    // Show all pages if total is less than max
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }
  
  const pages: number[] = [];
  const halfVisible = Math.floor(maxVisiblePages / 2);
  
  // Always show first page
  pages.push(1);
  
  let startPage = Math.max(2, currentPage - halfVisible);
  let endPage = Math.min(totalPages - 1, currentPage + halfVisible);
  
  // Adjust if we're near the beginning
  if (currentPage <= halfVisible + 1) {
    endPage = Math.min(totalPages - 1, maxVisiblePages - 1);
  }
  
  // Adjust if we're near the end
  if (currentPage >= totalPages - halfVisible) {
    startPage = Math.max(2, totalPages - maxVisiblePages + 2);
  }
  
  // Add ellipsis after first page if needed
  if (startPage > 2) {
    pages.push(-1); // -1 represents ellipsis
  }
  
  // Add middle pages
  for (let i = startPage; i <= endPage; i++) {
    if (i > 1 && i < totalPages) {
      pages.push(i);
    }
  }
  
  // Add ellipsis before last page if needed
  if (endPage < totalPages - 1) {
    pages.push(-1); // -1 represents ellipsis
  }
  
  // Always show last page (if more than 1 page)
  if (totalPages > 1) {
    pages.push(totalPages);
  }
  
  return pages;
};

/**
 * Validate page size input
 */
export const validatePageSize = (pageSize: number, min = 5, max = 500): number => {
  if (isNaN(pageSize) || pageSize < min) {
    return min;
  }
  if (pageSize > max) {
    return max;
  }
  return Math.floor(pageSize);
};

/**
 * Get page size from localStorage with fallback
 */
export const getStoredPageSize = (key: string, defaultSize = 25): number => {
  if (typeof window === 'undefined') return defaultSize;
  
  try {
    const stored = localStorage.getItem(key);
    if (stored) {
      const parsed = parseInt(stored, 10);
      return validatePageSize(parsed);
    }
  } catch (error) {
    console.warn('Failed to read page size from localStorage:', error);
  }
  
  return defaultSize;
};

/**
 * Store page size in localStorage
 */
export const storePageSize = (key: string, pageSize: number): void => {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(key, pageSize.toString());
  } catch (error) {
    console.warn('Failed to store page size in localStorage:', error);
  }
};

/**
 * Calculate item range for display (e.g., "1-25 of 100")
 */
export const calculateItemRange = (
  currentPage: number,
  pageSize: number,
  totalItems: number
): { start: number; end: number; total: number } => {
  if (totalItems === 0) {
    return { start: 0, end: 0, total: 0 };
  }
  
  const start = (currentPage - 1) * pageSize + 1;
  const end = Math.min(currentPage * pageSize, totalItems);
  
  return { start, end, total: totalItems };
};

/**
 * Get safe page number (ensures it's within valid range)
 */
export const getSafePage = (page: number, totalPages: number): number => {
  if (page < 1) return 1;
  if (page > totalPages) return Math.max(1, totalPages);
  return page;
};

/**
 * Default page size options
 */
export const DEFAULT_PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

/**
 * Default pagination config
 */
export const DEFAULT_PAGINATION_CONFIG = {
  pageSize: 25,
  maxVisiblePages: 7,
  storageKey: 'pagination-page-size',
  minPageSize: 5,
  maxPageSize: 500,
};