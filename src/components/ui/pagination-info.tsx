/**
 * PaginationInfo component
 * 
 * Displays information about the current pagination state,
 * including item ranges and total counts
 */

import * as React from "react";
import { cn } from "@/lib/utils/utils";

interface PaginationInfoProps {
  start: number;
  end: number;
  total: number;
  itemName?: string;
  className?: string;
}

export const PaginationInfo: React.FC<PaginationInfoProps> = ({
  start,
  end,
  total,
  itemName = "item",
  className,
}) => {
  if (total === 0) {
    return (
      <div className={cn("text-sm text-muted-foreground", className)}>
        No {itemName}s found
      </div>
    );
  }

  const pluralItemName = total === 1 ? itemName : `${itemName}s`;

  return (
    <div className={cn("text-sm text-muted-foreground", className)}>
      Showing{" "}
      <span className="font-medium text-foreground">
        {start}-{end}
      </span>{" "}
      of{" "}
      <span className="font-medium text-foreground">
        {total.toLocaleString()}
      </span>{" "}
      {pluralItemName}
    </div>
  );
};

/**
 * Compact pagination info for smaller displays
 */
interface CompactPaginationInfoProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemName?: string;
  className?: string;
}

export const CompactPaginationInfo: React.FC<CompactPaginationInfoProps> = ({
  currentPage,
  totalPages,
  totalItems,
  itemName = "item",
  className,
}) => {
  if (totalItems === 0) {
    return (
      <div className={cn("text-sm text-muted-foreground", className)}>
        No {itemName}s found
      </div>
    );
  }

  const pluralItemName = totalItems === 1 ? itemName : `${itemName}s`;

  return (
    <div className={cn("text-sm text-muted-foreground text-center", className)}>
      <div>
        Page {currentPage} of {totalPages}
      </div>
      <div>
        {totalItems.toLocaleString()} {pluralItemName} total
      </div>
    </div>
  );
};

/**
 * Combined pagination info with both range and page information
 */
interface DetailedPaginationInfoProps {
  start: number;
  end: number;
  total: number;
  currentPage: number;
  totalPages: number;
  itemName?: string;
  showPageInfo?: boolean;
  className?: string;
}

export const DetailedPaginationInfo: React.FC<DetailedPaginationInfoProps> = ({
  start,
  end,
  total,
  currentPage,
  totalPages,
  itemName = "item",
  showPageInfo = true,
  className,
}) => {
  if (total === 0) {
    return (
      <div className={cn("text-sm text-muted-foreground", className)}>
        No {itemName}s found
      </div>
    );
  }

  const pluralItemName = total === 1 ? itemName : `${itemName}s`;

  return (
    <div className={cn("text-sm text-muted-foreground", className)}>
      <div>
        Showing{" "}
        <span className="font-medium text-foreground">
          {start}-{end}
        </span>{" "}
        of{" "}
        <span className="font-medium text-foreground">
          {total.toLocaleString()}
        </span>{" "}
        {pluralItemName}
      </div>
      {showPageInfo && totalPages > 1 && (
        <div className="mt-1">
          Page {currentPage} of {totalPages}
        </div>
      )}
    </div>
  );
};