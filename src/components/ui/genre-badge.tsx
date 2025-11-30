import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils/utils";
import * as React from "react";

interface GenreBadgeProps {
  genre: string;
  className?: string;
}

export const GenreBadge: React.FC<GenreBadgeProps> = ({ genre, className }) => {
  return (
    <Badge
      variant="outline"
      className={cn(
        "text-xs px-2.5 py-0.5 bg-muted/60 text-muted-foreground border-border/60",
        className
      )}
    >
      {genre}
    </Badge>
  );
};

export default GenreBadge;
