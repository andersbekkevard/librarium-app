import { READING_STATE_COLORS } from "@/lib/design/colors";
import type { Book } from "@/lib/models/models";
import { cn } from "@/lib/utils/utils";
import { CheckCircleIcon, ClockIcon, QuestionIcon, PlayIcon } from "@phosphor-icons/react";
import * as React from "react";
import { Badge } from "./badge";

interface ReadingStateBadgeProps {
  state: Book["state"];
  showIcon?: boolean;
  className?: string;
}

interface BadgeConfig {
  label: string;
  icon: React.ElementType;
  classes: string;
}

const READING_STATE_CONFIG: Record<
  Book["state"],
  BadgeConfig & { testId: string }
> = {
  not_started: {
    label: "Not Started",
    icon: ClockIcon,
    classes: cn(
      READING_STATE_COLORS.not_started.bg,
      READING_STATE_COLORS.not_started.text,
      "border-transparent"
    ),
    testId: "clock-icon",
  },
  in_progress: {
    label: "Reading",
    icon: PlayIcon,
    classes: cn(
      READING_STATE_COLORS.in_progress.bg,
      READING_STATE_COLORS.in_progress.text,
      "border-transparent"
    ),
    testId: "play-icon",
  },
  finished: {
    label: "Finished",
    icon: CheckCircleIcon,
    classes: cn(
      READING_STATE_COLORS.finished.bg,
      READING_STATE_COLORS.finished.text,
      "border-transparent"
    ),
    testId: "check-circle-icon",
  },
};

const UNKNOWN_STATE_CONFIG: BadgeConfig & { testId: string } = {
  label: "Unknown",
  icon: QuestionIcon,
  classes: cn(
    READING_STATE_COLORS.not_started.bg,
    READING_STATE_COLORS.not_started.text,
    "border-transparent"
  ),
  testId: "unknown-icon",
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
  const config = READING_STATE_CONFIG[state] || UNKNOWN_STATE_CONFIG;
  const IconComponent = config.icon;

  return (
    <Badge variant="outline" className={cn(config.classes, className)}>
      {showIcon && (
        <IconComponent className="h-3 w-3" data-testid={config.testId} />
      )}
      {config.label}
    </Badge>
  );
};

export default ReadingStateBadge;
