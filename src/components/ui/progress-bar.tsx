"use client";

import { cn } from "@/lib/utils/utils";

interface ProgressBarProps {
  value: number;
  className?: string;
  variant?: "sm" | "md" | "lg";
}

export const ProgressBar = ({
  value,
  className,
  variant = "sm",
}: ProgressBarProps) => {
  const heightClasses = {
    sm: "h-1.5", // 6px - original size used in BookCard and BookListItem
    md: "h-2", // 8px - size used in BookDetailPage and BookCover
    lg: "h-3", // 12px - larger variant for future use
  };

  const height = heightClasses[variant];

  return (
    <div className={cn("w-full bg-muted rounded-full", height, className)}>
      <div
        className={cn(
          "bg-brand-primary rounded-full transition-all duration-300",
          height
        )}
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  );
};

export default ProgressBar;
