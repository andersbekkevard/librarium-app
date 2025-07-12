import * as React from "react";
import { Clock, Play, CheckCircle, LucideIcon } from "lucide-react";
import { Badge } from "./badge";
import type { Book } from "@/lib/models";

interface ReadingStateBadgeProps {
  state: Book["state"];
  showIcon?: boolean;
  className?: string;
}

interface BadgeConfig {
  label: string;
  variant: "default" | "secondary" | "outline";
  icon: LucideIcon;
}

const READING_STATE_CONFIG: Record<Book["state"], BadgeConfig & { testId: string }> = {
  not_started: {
    label: "Not Started",
    variant: "secondary",
    icon: Clock,
    testId: "clock-icon",
  },
  in_progress: {
    label: "Reading",
    variant: "default", 
    icon: Play,
    testId: "play-icon",
  },
  finished: {
    label: "Finished",
    variant: "outline",
    icon: CheckCircle,
    testId: "check-circle-icon",
  },
};

/**
 * ReadingStateBadge Component
 * 
 * Displays a consistent reading state badge across the application.
 * Consolidates all reading state badge implementations.
 * 
 * @param state - The book's reading state
 * @param showIcon - Whether to show an icon in the badge (default: false)
 * @param className - Additional CSS classes
 */
export const ReadingStateBadge: React.FC<ReadingStateBadgeProps> = ({
  state,
  showIcon = false,
  className,
}) => {
  const config = READING_STATE_CONFIG[state];
  const IconComponent = config.icon;

  return (
    <Badge variant={config.variant} className={className}>
      {showIcon && <IconComponent className="h-3 w-3" data-testid={config.testId} />}
      {config.label}
    </Badge>
  );
};

export default ReadingStateBadge;