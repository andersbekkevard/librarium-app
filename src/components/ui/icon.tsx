import * as PhosphorIcons from "@phosphor-icons/react";
import { BookOpenIcon } from "@phosphor-icons/react";

// Phosphor icon name type
type PhosphorIconName = keyof typeof PhosphorIcons;

export const Icon = ({
  name,
  color,
  size,
  className,
  weight = "light",
}: {
  name: PhosphorIconName;
  color?: string;
  size?: number;
  className?: string;
  weight?: "thin" | "light" | "regular" | "bold" | "fill" | "duotone";
}) => {
  const PhosphorIcon =
    (PhosphorIcons[name] as React.ComponentType<{
      color?: string;
      size?: number;
      className?: string;
      weight?: "thin" | "light" | "regular" | "bold" | "fill" | "duotone";
    }>) || BookOpenIcon;

  return (
    <PhosphorIcon
      color={color}
      size={size}
      className={className}
      weight={weight}
    />
  );
};
