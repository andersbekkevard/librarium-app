/**
 * Tailwind CSS class names for brand colors
 * Use these for consistent styling across components
 */
export const BRAND_CLASSES = {
  primary: {
    bg: "bg-brand-primary",
    bgHover: "hover:bg-brand-primary-hover",
    text: "text-brand-primary",
    border: "border-brand-primary",
  },
  secondary: {
    bg: "bg-brand-secondary",
    bgHover: "hover:bg-brand-secondary-hover",
    text: "text-brand-secondary",
    border: "border-brand-secondary",
  },
  accent: {
    bg: "bg-brand-accent",
    bgHover: "hover:bg-brand-accent-hover",
    text: "text-brand-accent",
    border: "border-brand-accent",
  },
} as const;

/**
 * Tailwind CSS class names for status colors
 */
export const STATUS_CLASSES = {
  success: {
    bg: "bg-status-success",
    text: "text-status-success",
    border: "border-status-success",
  },
  warning: {
    bg: "bg-status-warning",
    text: "text-status-warning",
    border: "border-status-warning",
  },
  error: {
    bg: "bg-status-error",
    text: "text-status-error",
    border: "border-status-error",
  },
  info: {
    bg: "bg-status-info",
    text: "text-status-info",
    border: "border-status-info",
  },
} as const;

/**
 * Reading state color mappings
 */
export const READING_STATE_COLORS = {
  not_started: STATUS_CLASSES.info,
  in_progress: BRAND_CLASSES.primary,
  finished: STATUS_CLASSES.success,
} as const;

/**
 * Utility function to get CSS variable value
 * @param variableName - The CSS variable name (without --)
 * @returns The CSS variable value
 */
export const getCSSVariable = (variableName: string): string => {
  return `var(--${variableName})`;
};

export default {
  BRAND_CLASSES,
  STATUS_CLASSES,
  READING_STATE_COLORS,
  getCSSVariable,
};
