/**
 * Pagination component
 * 
 * Provides navigation controls for paginated data with page numbers,
 * previous/next buttons, and ellipsis for large page counts
 */

import * as React from "react";
import { Button } from "@/components/ui/button";
import { CaretLeftIcon, CaretRightIcon, DotsThreeIcon } from "@phosphor-icons/react";
import { cn } from "@/lib/utils/utils";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  visiblePages: number[];
  onPageChange: (page: number) => void;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  showFirstLast?: boolean;
  className?: string;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  visiblePages,
  onPageChange,
  hasNextPage,
  hasPreviousPage,
  showFirstLast = false,
  className,
}) => {
  if (totalPages <= 1) {
    return null;
  }

  const handleKeyDown = (event: React.KeyboardEvent, page: number) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onPageChange(page);
    }
  };

  return (
    <nav
      role="navigation"
      aria-label="Pagination Navigation"
      className={cn("flex items-center justify-center space-x-1", className)}
    >
      {/* First page button (optional) */}
      {showFirstLast && currentPage > 1 && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(1)}
          className="hidden sm:inline-flex"
          aria-label="Go to first page"
        >
          First
        </Button>
      )}

      {/* Previous page button */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={!hasPreviousPage}
        aria-label="Go to previous page"
        className="flex items-center gap-1"
      >
        <CaretLeftIcon className="h-4 w-4" />
        <span className="hidden sm:inline">Previous</span>
      </Button>

      {/* Page number buttons */}
      <div className="flex items-center space-x-1">
        {visiblePages.map((page, index) => {
          if (page === -1) {
            // Ellipsis
            return (
              <div
                key={`ellipsis-${index}`}
                className="flex h-8 w-8 items-center justify-center"
                aria-hidden="true"
              >
                <DotsThreeIcon className="h-4 w-4 text-muted-foreground" />
              </div>
            );
          }

          const isCurrentPage = page === currentPage;
          
          return (
            <Button
              key={page}
              variant={isCurrentPage ? "default" : "outline"}
              size="sm"
              onClick={() => onPageChange(page)}
              onKeyDown={(e) => handleKeyDown(e, page)}
              aria-label={`Go to page ${page}`}
              aria-current={isCurrentPage ? "page" : undefined}
              className={cn(
                "h-8 w-8",
                isCurrentPage && "pointer-events-none"
              )}
            >
              {page}
            </Button>
          );
        })}
      </div>

      {/* Next page button */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={!hasNextPage}
        aria-label="Go to next page"
        className="flex items-center gap-1"
      >
        <span className="hidden sm:inline">Next</span>
        <CaretRightIcon className="h-4 w-4" />
      </Button>

      {/* Last page button (optional) */}
      {showFirstLast && currentPage < totalPages && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(totalPages)}
          className="hidden sm:inline-flex"
          aria-label="Go to last page"
        >
          Last
        </Button>
      )}
    </nav>
  );
};

/**
 * Simplified pagination for mobile/compact layouts
 */
interface SimplePaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  className?: string;
}

export const SimplePagination: React.FC<SimplePaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  hasNextPage,
  hasPreviousPage,
  className,
}) => {
  if (totalPages <= 1) {
    return null;
  }

  return (
    <nav
      role="navigation"
      aria-label="Pagination Navigation"
      className={cn("flex items-center justify-between", className)}
    >
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={!hasPreviousPage}
        aria-label="Go to previous page"
        className="flex items-center gap-1"
      >
        <CaretLeftIcon className="h-4 w-4" />
        Previous
      </Button>

      <span className="text-sm text-muted-foreground">
        Page {currentPage} of {totalPages}
      </span>

      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={!hasNextPage}
        aria-label="Go to next page"
        className="flex items-center gap-1"
      >
        Next
        <CaretRightIcon className="h-4 w-4" />
      </Button>
    </nav>
  );
};