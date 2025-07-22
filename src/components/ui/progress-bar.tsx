"use client";

import { cn } from "@/lib/utils/utils";

interface ProgressBarProps {
  value: number;
  className?: string;
}

export const ProgressBar = ({ value, className }: ProgressBarProps) => {
  return (
    <div className={cn("w-full bg-muted rounded-full h-1.5", className)}>
      <div
        className="bg-brand-primary h-1.5 rounded-full transition-all duration-300"
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  );
};

export default ProgressBar;