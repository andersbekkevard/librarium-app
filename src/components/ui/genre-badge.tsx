import { Badge } from "@/components/ui/badge";
import * as React from "react";

interface GenreBadgeProps {
  genre: string;
  className?: string;
}

export const GenreBadge: React.FC<GenreBadgeProps> = ({ genre, className }) => {
  return (
    <Badge
      variant="outline"
      className={`text-xs px-2 py-0.5 bg-muted/40 text-muted-foreground border ${
        className || ""
      } border-black/20	`}
    >
      {genre}
    </Badge>
  );
};

export default GenreBadge;
