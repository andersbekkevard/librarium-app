/**
 * Centralized color constants for the Librarium application
 * These colors correspond to the CSS variables defined in globals.css
 */

export const BRAND_COLORS = {
  primary: 'rgb(55, 48, 242)',        // Vibrant blue
  secondary: 'rgb(75, 85, 99)',       // Dark blue-grey
  accent: 'rgb(129, 140, 248)',       // Light vibrant blue
} as const

export const STATUS_COLORS = {
  success: 'rgb(34, 197, 94)',        // Green
  warning: 'rgb(251, 191, 36)',       // Yellow
  error: 'rgb(239, 68, 68)',          // Red
  info: 'rgb(59, 130, 246)',          // Blue
} as const

/**
 * Tailwind CSS class names for brand colors
 * Use these for consistent styling across components
 */
export const BRAND_CLASSES = {
  primary: {
    bg: 'bg-brand-primary',
    bgHover: 'hover:bg-brand-primary-hover',
    text: 'text-brand-primary',
    border: 'border-brand-primary',
  },
  secondary: {
    bg: 'bg-brand-secondary',
    bgHover: 'hover:bg-brand-secondary-hover',
    text: 'text-brand-secondary',
    border: 'border-brand-secondary',
  },
  accent: {
    bg: 'bg-brand-accent',
    bgHover: 'hover:bg-brand-accent-hover',
    text: 'text-brand-accent',
    border: 'border-brand-accent',
  },
} as const

/**
 * Tailwind CSS class names for status colors
 */
export const STATUS_CLASSES = {
  success: {
    bg: 'bg-status-success',
    text: 'text-status-success',
    border: 'border-status-success',
  },
  warning: {
    bg: 'bg-status-warning',
    text: 'text-status-warning',
    border: 'border-status-warning',
  },
  error: {
    bg: 'bg-status-error',
    text: 'text-status-error',
    border: 'border-status-error',
  },
  info: {
    bg: 'bg-status-info',
    text: 'text-status-info',
    border: 'border-status-info',
  },
} as const

/**
 * Reading state color mappings
 */
export const READING_STATE_COLORS = {
  not_started: STATUS_CLASSES.info,
  in_progress: BRAND_CLASSES.primary,
  finished: STATUS_CLASSES.success,
} as const

/**
 * Utility function to get CSS variable value
 * @param variableName - The CSS variable name (without --)
 * @returns The CSS variable value
 */
export const getCSSVariable = (variableName: string): string => {
  return `var(--${variableName})`
}

/**
 * Utility function to get brand color as CSS variable
 * @param colorName - The brand color name (primary, secondary, accent)
 * @returns The CSS variable for the brand color
 */
export const getBrandColor = (colorName: keyof typeof BRAND_COLORS): string => {
  return getCSSVariable(`brand-${colorName}`)
}

/**
 * Utility function to get status color as CSS variable
 * @param colorName - The status color name (success, warning, error, info)
 * @returns The CSS variable for the status color
 */
export const getStatusColor = (colorName: keyof typeof STATUS_COLORS): string => {
  return getCSSVariable(`status-${colorName}`)
}

export default {
  BRAND_COLORS,
  STATUS_COLORS,
  BRAND_CLASSES,
  STATUS_CLASSES,
  READING_STATE_COLORS,
  getCSSVariable,
  getBrandColor,
  getStatusColor,
} 