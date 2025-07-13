/**
 * Tailwind CSS class names for brand colors
 * Use these for consistent styling across components
 */
export const BRAND_COLORS = {
  primary: {
    bg: "bg-brand-primary",
    bgHover: "hover:bg-brand-primary-hover",
    bgLight: "bg-brand-primary/10",
    bgBlur: "bg-brand-primary/50",
    text: "text-brand-primary",
    border: "border-brand-primary",
    borderLight: "border-brand-primary/20",
    borderTop: "border-t-brand-primary/30",
    gradientFrom: "from-brand-primary",
    gradientTo: "to-brand-primary",
  },
  secondary: {
    bg: "bg-brand-secondary",
    bgHover: "hover:bg-brand-secondary-hover",
    bgLight: "bg-brand-secondary/10",
    bgBlur: "bg-brand-secondary/50",
    text: "text-brand-secondary",
    border: "border-brand-secondary",
    borderLight: "border-brand-secondary/20",
    borderTop: "border-t-brand-secondary/30",
    gradientFrom: "from-brand-secondary",
    gradientTo: "to-brand-secondary",
  },
  accent: {
    bg: "bg-brand-accent",
    bgHover: "hover:bg-brand-accent-hover",
    bgLight: "bg-brand-accent/10",
    bgBlur: "bg-brand-accent/50",
    text: "text-brand-accent",
    border: "border-brand-accent",
    borderLight: "border-brand-accent/20",
    borderTop: "border-t-brand-accent/30",
    gradientFrom: "from-brand-accent",
    gradientTo: "to-brand-accent",
  },
} as const;

/**
 * Tailwind CSS class names for status colors
 */
export const STATUS_COLORS = {
  success: {
    bg: "bg-status-success",
    bgLight: "bg-status-success/10",
    text: "text-status-success",
    border: "border-status-success",
    borderLight: "border-status-success/20",
    borderLeft: "border-l-status-success",
  },
  warning: {
    bg: "bg-status-warning",
    bgLight: "bg-status-warning/10",
    text: "text-status-warning",
    border: "border-status-warning",
    borderLight: "border-status-warning/20",
    borderLeft: "border-l-status-warning",
  },
  error: {
    bg: "bg-status-error",
    bgLight: "bg-status-error/10",
    text: "text-status-error",
    border: "border-status-error",
    borderLight: "border-status-error/20",
    borderLeft: "border-l-status-error",
  },
  info: {
    bg: "bg-status-info",
    bgLight: "bg-status-info/10",
    text: "text-status-info",
    border: "border-status-info",
    borderLight: "border-status-info/20",
    borderLeft: "border-l-status-info",
  },
} as const;

/**
 * Star rating color mappings
 */
export const STAR_RATING_COLORS = {
  filled: {
    bg: "fill-status-warning",
    text: "text-status-warning",
  },
  empty: {
    bg: "fill-muted",
    text: "text-muted-foreground",
  },
} as const;

/**
 * Reading state color mappings
 */
export const READING_STATE_COLORS = {
  not_started: {
    bg: "bg-[var(--secondary)]",
    text: "text-[var(--secondary-foreground)]",
    border: "border-[var(--secondary)]",
  },
  in_progress: {
    bg: "bg-[var(--reading-in-progress-bg)]",
    text: "text-[var(--reading-in-progress-text)]",
    border: "border-[var(--reading-in-progress-border)]",
  },
  finished: {
    bg: "bg-[var(--reading-finished-bg)]",
    text: "text-[var(--reading-finished-text)]",
    border: "border-[var(--reading-finished-border)]",
  },
} as const;

/**
 * Utility function to get CSS variable value
 *
 * Constructs a CSS variable reference string for use in JavaScript.
 * Used when you need to access CSS custom properties programmatically.
 *
 * @param variableName - The CSS variable name (without -- prefix)
 * @returns string - CSS variable reference (e.g., "var(--color-primary)")
 *
 * @example
 * const primaryColor = getCSSVariable("color-primary");
 * element.style.backgroundColor = primaryColor;
 */
export const getCSSVariable = (variableName: string): string => {
  return `var(--${variableName})`;
};

const colors = {
  BRAND_COLORS,
  STATUS_COLORS,
  STAR_RATING_COLORS,
  READING_STATE_COLORS,
  getCSSVariable,
};

export default colors;
