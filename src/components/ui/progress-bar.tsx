"use client";

import { cn } from "@/lib/utils/utils";

interface ProgressBarProps {
  value: number;
  className?: string;
  size?: "sm" | "md" | "lg";
  color?: "primary" | "accent" | "success";
}

export const ProgressBar = ({
  value,
  className,
  size = "sm",
  color = "accent",
}: ProgressBarProps) => {
  const heightClasses = {
    sm: "h-1.5", // 6px - original size used in BookCard and BookListItem
    md: "h-2", // 8px - size used in BookDetailPage and BookCover
    lg: "h-3", // 12px - larger variant for future use
  };

  const colorClasses = {
    primary: "bg-brand-primary",
    accent: "bg-brand-accent",
    success: "bg-status-success",
  };

  const height = heightClasses[size];
  const barColor = colorClasses[color];

  return (
    <div
      className={cn(
        "w-full bg-muted rounded-full overflow-hidden",
        height,
        className
      )}
    >
      <div
        className={cn(
          "rounded-full transition-all duration-300 ease-out",
          barColor,
          height
        )}
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  );
};

export default ProgressBar;
