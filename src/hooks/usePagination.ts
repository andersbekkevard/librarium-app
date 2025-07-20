/**
 * usePagination hook
 * 
 * Custom hook for managing pagination state and logic
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  calculatePagination,
  calculateItemRange,
  getSafePage,
  getStoredPageSize,
  storePageSize,
  validatePageSize,
  DEFAULT_PAGINATION_CONFIG,
  type PaginationConfig,
  type PaginationResult,
} from '@/lib/utils/pagination-utils';

interface UsePaginationProps {
  totalItems: number;
  initialPageSize?: number;
  initialPage?: number;
  storageKey?: string;
  maxVisiblePages?: number;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
}

interface UsePaginationReturn extends PaginationResult {
  currentPage: number;
  pageSize: number;
  itemRange: { start: number; end: number; total: number };
  goToPage: (page: number) => void;
  goToNextPage: () => void;
  goToPreviousPage: () => void;
  goToFirstPage: () => void;
  goToLastPage: () => void;
  setPageSize: (size: number) => void;
  reset: () => void;
}

export const usePagination = ({
  totalItems,
  initialPageSize = DEFAULT_PAGINATION_CONFIG.pageSize,
  initialPage = 1,
  storageKey = DEFAULT_PAGINATION_CONFIG.storageKey,
  maxVisiblePages = DEFAULT_PAGINATION_CONFIG.maxVisiblePages,
  onPageChange,
  onPageSizeChange,
}: UsePaginationProps): UsePaginationReturn => {
  // Initialize page size from localStorage or default
  const [pageSize, setPageSizeState] = useState(() => {
    return getStoredPageSize(storageKey, initialPageSize);
  });

  const [currentPage, setCurrentPageState] = useState(initialPage);

  // Calculate pagination data
  const paginationData = useMemo(() => {
    const config: PaginationConfig = {
      currentPage,
      totalItems,
      pageSize,
      maxVisiblePages,
    };
    
    return calculatePagination(config);
  }, [currentPage, totalItems, pageSize, maxVisiblePages]);

  // Calculate item range for display
  const itemRange = useMemo(() => {
    return calculateItemRange(currentPage, pageSize, totalItems);
  }, [currentPage, pageSize, totalItems]);

  // Reset to first page when total items change significantly
  useEffect(() => {
    const safePage = getSafePage(currentPage, paginationData.totalPages);
    if (safePage !== currentPage) {
      setCurrentPageState(safePage);
    }
  }, [totalItems, paginationData.totalPages, currentPage]);

  // Navigation functions
  const goToPage = useCallback((page: number) => {
    const safePage = getSafePage(page, paginationData.totalPages);
    setCurrentPageState(safePage);
    onPageChange?.(safePage);
  }, [paginationData.totalPages, onPageChange]);

  const goToNextPage = useCallback(() => {
    if (paginationData.hasNextPage) {
      goToPage(currentPage + 1);
    }
  }, [currentPage, paginationData.hasNextPage, goToPage]);

  const goToPreviousPage = useCallback(() => {
    if (paginationData.hasPreviousPage) {
      goToPage(currentPage - 1);
    }
  }, [currentPage, paginationData.hasPreviousPage, goToPage]);

  const goToFirstPage = useCallback(() => {
    goToPage(1);
  }, [goToPage]);

  const goToLastPage = useCallback(() => {
    goToPage(paginationData.totalPages);
  }, [paginationData.totalPages, goToPage]);

  const setPageSize = useCallback((size: number) => {
    const validatedSize = validatePageSize(size);
    setPageSizeState(validatedSize);
    storePageSize(storageKey, validatedSize);
    
    // Reset to first page when page size changes
    setCurrentPageState(1);
    
    onPageSizeChange?.(validatedSize);
  }, [storageKey, onPageSizeChange]);

  const reset = useCallback(() => {
    setCurrentPageState(1);
    setPageSizeState(initialPageSize);
    storePageSize(storageKey, initialPageSize);
  }, [initialPageSize, storageKey]);

  return {
    currentPage,
    pageSize,
    itemRange,
    goToPage,
    goToNextPage,
    goToPreviousPage,
    goToFirstPage,
    goToLastPage,
    setPageSize,
    reset,
    ...paginationData,
  };
};