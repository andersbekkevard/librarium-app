import * as React from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { STAR_RATING_COLORS } from "@/lib/colors";

interface StarRatingProps {
  rating: number;
  maxRating?: number;
  size?: "sm" | "md" | "lg";
  showText?: boolean;
  className?: string;
}

const sizeClasses = {
  sm: "h-3 w-3",
  md: "h-4 w-4", 
  lg: "h-5 w-5",
};

const textSizeClasses = {
  sm: "text-xs",
  md: "text-sm",
  lg: "text-base",
};

/**
 * StarRating Component
 * 
 * Displays a visual star rating with optional text display.
 * Consolidates all star rating implementations across the app.
 * 
 * @param rating - Rating value (0-maxRating)
 * @param maxRating - Maximum rating value (default: 5)
 * @param size - Size variant for stars (default: sm)
 * @param showText - Whether to show rating text (default: true)
 * @param className - Additional CSS classes
 */
export const StarRating: React.FC<StarRatingProps> = ({
  rating,
  maxRating = 5,
  size = "sm",
  showText = true,
  className,
}) => {
  const stars = Array.from({ length: maxRating }, (_, i) => (
    <Star
      key={i}
      data-testid="star-icon"
      className={cn(
        sizeClasses[size],
        i < rating
          ? `${STAR_RATING_COLORS.filled.bg} ${STAR_RATING_COLORS.filled.text}`
          : `${STAR_RATING_COLORS.empty.bg} ${STAR_RATING_COLORS.empty.text}`
      )}
    />
  ));

  return (
    <div className={cn("flex items-center gap-1", className)} data-testid="star-rating-container">
      {stars}
      {showText && (
        <span className={cn("ml-1 text-muted-foreground", textSizeClasses[size])}>
          ({rating}/{maxRating})
        </span>
      )}
    </div>
  );
};

export default StarRating;