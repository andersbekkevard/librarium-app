/**
 * Application-wide constants and configuration values
 *
 * This file centralizes all hardcoded values used throughout the application
 * to improve maintainability, consistency, and configurability.
 *
 * @fileoverview Centralized constants for Librarium app configuration
 */

// =============================================================================
// UI CONFIGURATION
// =============================================================================

/**
 * User interface configuration constants
 * Controls component behavior, dimensions, and limits
 */
export const UI_CONFIG = {
  /**
   * Default notification count shown in header
   * Used when no specific count is provided
   */
  DEFAULT_NOTIFICATION_COUNT: 3,

  /**
   * Maximum number of recently added books to display
   * Used in AddBooksPage for recent additions list
   */
  RECENTLY_ADDED_BOOKS_LIMIT: 4,

  /**
   * Card component dimensions and styling
   */
  CARD: {
    /**
     * Standard book card height in Tailwind classes
     * Provides consistent card sizing across the app
     */
    HEIGHT: "h-48",

    /**
     * Standard card width constraints
     */
    WIDTH: "w-full max-w-none",
  },

  /**
   * Dashboard section limits for book displays
   */
  DASHBOARD: {
    /**
     * Maximum books to show in "Currently Reading" section
     */
    CURRENTLY_READING_LIMIT: 4,

    /**
     * Maximum books to show in "Recently Read" section
     */
    RECENTLY_READ_LIMIT: 6,
  },

  /**
   * Rating component configuration
   */
  RATING: {
    /**
     * Maximum rating value (5-star system)
     */
    MAX_RATING: 5,
  },

  /**
   * Z-index layer system for consistent layering
   */
  Z_INDEX: {
    /**
     * Navigation elements and dropdown menus
     */
    NAVIGATION: 10,

    /**
     * Floating headers and sticky elements
     */
    HEADER: 40,

    /**
     * Modal overlays and important floating content
     */
    MODAL: 50,
  },
} as const;

// =============================================================================
// API CONFIGURATION
// =============================================================================

/**
 * External API configuration and limits
 * Controls behavior of third-party service integrations
 */
export const API_CONFIG = {
  /**
   * Google Books API configuration
   */
  GOOGLE_BOOKS: {
    /**
     * Default number of search results to fetch
     */
    DEFAULT_SEARCH_RESULTS: 10,

    /**
     * Maximum allowed search results per request
     * Google Books API has a limit of 40 results per request
     */
    MAX_SEARCH_RESULTS: 40,

    /**
     * Number of results for author search
     */
    AUTHOR_SEARCH_RESULTS: 5,

    /**
     * Number of results for genre search
     */
    GENRE_SEARCH_RESULTS: 10,

    /**
     * Number of results for recommendations
     */
    RECOMMENDATION_RESULTS: 10,
  },

  /**
   * General search configuration
   */
  SEARCH: {
    /**
     * Default limit for useBookSearch hook
     */
    DEFAULT_LIMIT: 20,
  },
} as const;

// =============================================================================
// EVENT AND ACTIVITY CONFIGURATION
// =============================================================================

/**
 * Event logging and activity tracking limits
 */
export const EVENT_CONFIG = {
  /**
   * Default limit for recent events queries
   */
  RECENT_EVENTS_LIMIT: 10,

  /**
   * Default limit for user activity queries
   */
  USER_ACTIVITY_LIMIT: 10,

  /**
   * Maximum number of favorite genres to track
   */
  FAVORITE_GENRES_LIMIT: 5,
} as const;

// =============================================================================
// TIMING CONFIGURATION
// =============================================================================

/**
 * Timing constants for debouncing, animations, and delays
 */
export const TIMING_CONFIG = {
  /**
   * Search input debounce delay in milliseconds
   * Prevents excessive API calls during typing
   */
  SEARCH_DEBOUNCE_MS: 500,

  /**
   * Standard animation durations in milliseconds
   */
  ANIMATION: {
    /**
     * Fast transitions (hover effects, simple state changes)
     */
    FAST: 150,

    /**
     * Standard transitions (component animations)
     */
    STANDARD: 200,

    /**
     * Slow transitions (complex animations, page transitions)
     */
    SLOW: 300,

    /**
     * Modal and overlay animations
     */
    MODAL: 500,
  },

  /**
   * Time calculation constants for date formatting
   */
  TIME: {
    /**
     * Milliseconds in one minute
     */
    MINUTE_MS: 1000 * 60,

    /**
     * Milliseconds in one hour
     */
    HOUR_MS: 1000 * 60 * 60,

    /**
     * Milliseconds in one day
     */
    DAY_MS: 1000 * 60 * 60 * 24,

    /**
     * Milliseconds in one week
     */
    WEEK_MS: 1000 * 60 * 60 * 24 * 7,
  },
} as const;

// =============================================================================
// VALIDATION CONFIGURATION
// =============================================================================

/**
 * Data validation constants and limits
 */
export const VALIDATION_CONFIG = {
  /**
   * Text field length limits
   */
  TEXT_LIMITS: {
    /**
     * Maximum characters for description fields
     */
    DESCRIPTION_MAX_LENGTH: 500,

    /**
     * Maximum characters for note fields
     */
    NOTE_MAX_LENGTH: 500,
  },

  /**
   * Numeric field constraints
   */
  NUMERIC: {
    /**
     * Minimum page number
     */
    MIN_PAGE: 0,

    /**
     * Minimum year for publication date
     */
    MIN_PUBLICATION_YEAR: 1000,

    /**
     * Maximum year for publication date (current year)
     */
    MAX_PUBLICATION_YEAR: new Date().getFullYear(),
  },
} as const;

// =============================================================================
// TEST CONFIGURATION
// =============================================================================

/**
 * Testing-related constants
 * Used in test files for consistent timeouts and limits
 */
export const TEST_CONFIG = {
  /**
   * Default timeout for async operations in tests
   */
  DEFAULT_TIMEOUT_MS: 5000,

  /**
   * Network delay simulation for loading states
   */
  NETWORK_DELAY_MS: 1000,

  /**
   * Polling interval for test assertions
   */
  POLLING_INTERVAL_MS: 100,
} as const;

// =============================================================================
// LAYOUT CONFIGURATION
// =============================================================================

/**
 * Layout and responsive design constants
 */
export const LAYOUT_CONFIG = {
  /**
   * Navigation bar configuration
   */
  NAVBAR: {
    /**
     * Width percentages for different screen sizes
     */
    WIDTH: {
      MOBILE: "90%",
      TABLET: "70%",
      DESKTOP: "75%",
    },

    /**
     * Maximum width constraint
     */
    MAX_WIDTH: "max-w-screen-xl",

    /**
     * Top offset from viewport
     */
    TOP_OFFSET: 5,
  },

  /**
   * Container and section spacing
   */
  CONTAINER: {
    /**
     * Vertical padding for hero sections
     */
    HERO_PADDING_Y: "py-20 md:py-32",

    /**
     * Standard gap between elements
     */
    STANDARD_GAP: 8,
  },
} as const;

// =============================================================================
// TYPE EXPORTS
// =============================================================================

/**
 * Type definitions for configuration objects
 * Enables type-safe access to nested configuration values
 */
export type UIConfig = typeof UI_CONFIG;
export type APIConfig = typeof API_CONFIG;
export type EventConfig = typeof EVENT_CONFIG;
export type TimingConfig = typeof TIMING_CONFIG;
export type ValidationConfig = typeof VALIDATION_CONFIG;
export type TestConfig = typeof TEST_CONFIG;
export type LayoutConfig = typeof LAYOUT_CONFIG;

/**
 * Combined configuration type for the entire app
 */
export type AppConfig = {
  ui: UIConfig;
  api: APIConfig;
  events: EventConfig;
  timing: TimingConfig;
  validation: ValidationConfig;
  test: TestConfig;
  layout: LayoutConfig;
};

/**
 * Complete application configuration object
 * Provides single access point to all configuration values
 */
export const APP_CONFIG: AppConfig = {
  ui: UI_CONFIG,
  api: API_CONFIG,
  events: EVENT_CONFIG,
  timing: TIMING_CONFIG,
  validation: VALIDATION_CONFIG,
  test: TEST_CONFIG,
  layout: LAYOUT_CONFIG,
} as const;
