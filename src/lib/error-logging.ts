/**
 * Centralized Error Logging System
 *
 * Provides comprehensive error logging capabilities with support for
 * multiple logging destinations and structured error reporting.
 */

import { ErrorContext, ErrorLogger, StandardError } from "./error-handling";

/**
 * Log levels for controlling logging verbosity
 */
export enum LogLevel {
  DEBUG = "debug",
  INFO = "info",
  WARNING = "warning",
  ERROR = "error",
  CRITICAL = "critical",
}

/**
 * Log entry structure
 */
export interface LogEntry {
  id: string;
  timestamp: Date;
  level: LogLevel;
  message: string;
  context?: ErrorContext;
  error?: StandardError;
  metadata?: Record<string, any>;
  source: string;
  userAgent?: string;
  url?: string;
  userId?: string;
  sessionId?: string;
}

/**
 * Logging configuration
 */
export interface LoggingConfig {
  level: LogLevel;
  enableConsole: boolean;
  enableLocalStorage: boolean;
  enableRemote: boolean;
  remoteEndpoint?: string;
  maxStorageEntries: number;
  enableStackTrace: boolean;
  enableBreadcrumbs: boolean;
  enablePerformanceMetrics: boolean;
  enableUserContext: boolean;
}

/**
 * Default logging configuration
 */
export const DEFAULT_LOGGING_CONFIG: LoggingConfig = {
  level: LogLevel.INFO,
  enableConsole: true,
  enableLocalStorage: true,
  enableRemote: false,
  maxStorageEntries: 100,
  enableStackTrace: true,
  enableBreadcrumbs: true,
  enablePerformanceMetrics: false,
  enableUserContext: true,
};

/**
 * Breadcrumb for tracking user actions
 */
export interface Breadcrumb {
  id: string;
  timestamp: Date;
  category: string;
  message: string;
  level: LogLevel;
  data?: Record<string, any>;
}

/**
 * Performance metrics
 */
export interface PerformanceMetrics {
  navigationStart: number;
  loadEventEnd: number;
  domContentLoaded: number;
  firstPaint?: number;
  firstContentfulPaint?: number;
  largestContentfulPaint?: number;
  memoryUsage?: {
    used: number;
    total: number;
  };
}

/**
 * Enhanced error logger with multiple destinations
 */
export class EnhancedErrorLogger implements ErrorLogger {
  private config: LoggingConfig;
  private breadcrumbs: Breadcrumb[] = [];
  private sessionId: string;
  private userId?: string;
  private userAgent: string;
  private readonly maxBreadcrumbs = 50;

  constructor(config: LoggingConfig = DEFAULT_LOGGING_CONFIG) {
    this.config = { ...DEFAULT_LOGGING_CONFIG, ...config };
    this.sessionId = this.generateSessionId();
    this.userAgent = navigator.userAgent;

    // Initialize performance monitoring if enabled
    if (this.config.enablePerformanceMetrics) {
      this.initializePerformanceMonitoring();
    }
  }

  /**
   * Updates logging configuration
   */
  updateConfig(config: Partial<LoggingConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Sets the current user ID for enhanced context
   */
  setUserId(userId: string): void {
    this.userId = userId;
  }

  /**
   * Adds a breadcrumb for tracking user actions
   */
  addBreadcrumb(breadcrumb: Omit<Breadcrumb, "id" | "timestamp">): void {
    if (!this.config.enableBreadcrumbs) return;

    const newBreadcrumb: Breadcrumb = {
      id: this.generateId(),
      timestamp: new Date(),
      ...breadcrumb,
    };

    this.breadcrumbs.push(newBreadcrumb);

    // Keep only the most recent breadcrumbs
    if (this.breadcrumbs.length > this.maxBreadcrumbs) {
      this.breadcrumbs = this.breadcrumbs.slice(-this.maxBreadcrumbs);
    }
  }

  /**
   * Logs an error with full context
   */
  logError(error: StandardError, context?: ErrorContext): void {
    this.log(LogLevel.ERROR, error.userMessage, context, error);
  }

  /**
   * Logs a warning message
   */
  logWarning(message: string, context?: ErrorContext): void {
    this.log(LogLevel.WARNING, message, context);
  }

  /**
   * Logs an info message
   */
  logInfo(message: string, context?: ErrorContext): void {
    this.log(LogLevel.INFO, message, context);
  }

  /**
   * Logs a debug message
   */
  logDebug(message: string, context?: ErrorContext): void {
    this.log(LogLevel.DEBUG, message, context);
  }

  /**
   * Logs a critical error
   */
  logCritical(error: StandardError, context?: ErrorContext): void {
    this.log(LogLevel.CRITICAL, error.userMessage, context, error);
  }

  /**
   * Main logging method
   */
  private log(
    level: LogLevel,
    message: string,
    context?: ErrorContext,
    error?: StandardError
  ): void {
    // Check if we should log this level
    if (!this.shouldLog(level)) {
      return;
    }

    const logEntry: LogEntry = {
      id: this.generateId(),
      timestamp: new Date(),
      level,
      message,
      context: this.enhanceContext(context),
      error,
      metadata: this.gatherMetadata(),
      source: this.getSource(),
      userAgent: this.userAgent,
      url: window.location.href,
      userId: this.userId,
      sessionId: this.sessionId,
    };

    // Log to console
    if (this.config.enableConsole) {
      this.logToConsole(logEntry);
    }

    // Log to local storage
    if (this.config.enableLocalStorage) {
      this.logToLocalStorage(logEntry);
    }

    // Log to remote service
    if (this.config.enableRemote && this.config.remoteEndpoint) {
      this.logToRemote(logEntry);
    }

    // Add breadcrumb for significant events
    if (level === LogLevel.ERROR || level === LogLevel.CRITICAL) {
      this.addBreadcrumb({
        category: "error",
        message: `${level}: ${message}`,
        level,
        data: { errorId: error?.id, context },
      });
    }
  }

  /**
   * Determines if we should log at this level
   */
  private shouldLog(level: LogLevel): boolean {
    const levels = [
      LogLevel.DEBUG,
      LogLevel.INFO,
      LogLevel.WARNING,
      LogLevel.ERROR,
      LogLevel.CRITICAL,
    ];
    const currentLevelIndex = levels.indexOf(this.config.level);
    const messageLevelIndex = levels.indexOf(level);

    return messageLevelIndex >= currentLevelIndex;
  }

  /**
   * Enhances context with additional information
   */
  private enhanceContext(context?: ErrorContext): ErrorContext {
    const enhancedContext: ErrorContext = {
      ...context,
      timestamp: new Date(),
      userAgent: this.userAgent,
      url: window.location.href,
    };

    // Add user context if enabled
    if (this.config.enableUserContext && this.userId) {
      enhancedContext.userId = this.userId;
    }

    return enhancedContext;
  }

  /**
   * Gathers metadata about the current state
   */
  private gatherMetadata(): Record<string, any> {
    const metadata: Record<string, any> = {
      sessionId: this.sessionId,
      timestamp: new Date().toISOString(),
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight,
      },
      screen: {
        width: window.screen.width,
        height: window.screen.height,
      },
    };

    // Add breadcrumbs if enabled
    if (this.config.enableBreadcrumbs) {
      metadata.breadcrumbs = this.breadcrumbs.slice(-10); // Last 10 breadcrumbs
    }

    // Add performance metrics if enabled
    if (this.config.enablePerformanceMetrics) {
      metadata.performance = this.getPerformanceMetrics();
    }

    // Add memory usage if available
    if ((performance as any).memory) {
      metadata.memory = {
        used: (performance as any).memory.usedJSHeapSize,
        total: (performance as any).memory.totalJSHeapSize,
        limit: (performance as any).memory.jsHeapSizeLimit,
      };
    }

    return metadata;
  }

  /**
   * Gets the source of the log entry
   */
  private getSource(): string {
    if (this.config.enableStackTrace) {
      const stack = new Error().stack;
      if (stack) {
        const lines = stack.split("\n");
        // Find the first line that's not from the logger
        for (let i = 3; i < lines.length; i++) {
          const line = lines[i];
          if (
            line &&
            !line.includes("error-logging") &&
            !line.includes("error-handling")
          ) {
            return line.trim();
          }
        }
      }
    }
    return "unknown";
  }

  /**
   * Logs to console with appropriate styling
   */
  private logToConsole(entry: LogEntry): void {
    const prefix = `[${entry.level.toUpperCase()}] ${entry.timestamp.toISOString()}`;

    switch (entry.level) {
      case LogLevel.DEBUG:
        console.debug(prefix, entry.message, entry);
        break;
      case LogLevel.INFO:
        console.info(prefix, entry.message, entry);
        break;
      case LogLevel.WARNING:
        console.warn(prefix, entry.message, entry);
        break;
      case LogLevel.ERROR:
        console.error(prefix, entry.message, entry);
        break;
      case LogLevel.CRITICAL:
        console.error(`🚨 ${prefix}`, entry.message, entry);
        break;
    }
  }

  /**
   * Logs to local storage
   */
  private logToLocalStorage(entry: LogEntry): void {
    try {
      const key = "librarium_error_logs";
      const existingLogs = localStorage.getItem(key);
      let logs: LogEntry[] = existingLogs ? JSON.parse(existingLogs) : [];

      // Add new log entry
      logs.push(entry);

      // Keep only the most recent entries
      if (logs.length > this.config.maxStorageEntries) {
        logs = logs.slice(-this.config.maxStorageEntries);
      }

      localStorage.setItem(key, JSON.stringify(logs));
    } catch (error) {
      console.error("Failed to log to localStorage:", error);
    }
  }

  /**
   * Logs to remote service
   */
  private async logToRemote(entry: LogEntry): Promise<void> {
    if (!this.config.remoteEndpoint) return;

    try {
      await fetch(this.config.remoteEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(entry),
      });
    } catch (error) {
      console.error("Failed to log to remote service:", error);
    }
  }

  /**
   * Gets performance metrics
   */
  private getPerformanceMetrics(): PerformanceMetrics | null {
    if (!performance || !performance.timing) return null;

    const timing = performance.timing;
    const metrics: PerformanceMetrics = {
      navigationStart: timing.navigationStart,
      loadEventEnd: timing.loadEventEnd,
      domContentLoaded: timing.domContentLoadedEventEnd,
    };

    // Add paint timings if available
    if (performance.getEntriesByType) {
      const paintEntries = performance.getEntriesByType("paint");
      paintEntries.forEach((entry) => {
        if (entry.name === "first-paint") {
          metrics.firstPaint = entry.startTime;
        } else if (entry.name === "first-contentful-paint") {
          metrics.firstContentfulPaint = entry.startTime;
        }
      });

      // Add LCP if available
      const lcpEntries = performance.getEntriesByType(
        "largest-contentful-paint"
      );
      if (lcpEntries.length > 0) {
        metrics.largestContentfulPaint =
          lcpEntries[lcpEntries.length - 1].startTime;
      }
    }

    return metrics;
  }

  /**
   * Initializes performance monitoring
   */
  private initializePerformanceMonitoring(): void {
    // Monitor LCP
    if ("PerformanceObserver" in window) {
      try {
        const observer = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry) => {
            if (entry.entryType === "largest-contentful-paint") {
              this.addBreadcrumb({
                category: "performance",
                message: `LCP: ${entry.startTime}ms`,
                level: LogLevel.INFO,
                data: { lcp: entry.startTime },
              });
            }
          });
        });
        observer.observe({ entryTypes: ["largest-contentful-paint"] });
      } catch (error) {
        console.error("Failed to initialize performance monitoring:", error);
      }
    }
  }

  /**
   * Generates a unique session ID
   */
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Generates a unique ID
   */
  private generateId(): string {
    return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Gets stored logs from localStorage
   */
  getStoredLogs(): LogEntry[] {
    try {
      const logs = localStorage.getItem("librarium_error_logs");
      return logs ? JSON.parse(logs) : [];
    } catch (error) {
      console.error("Failed to retrieve stored logs:", error);
      return [];
    }
  }

  /**
   * Clears stored logs
   */
  clearStoredLogs(): void {
    try {
      localStorage.removeItem("librarium_error_logs");
    } catch (error) {
      console.error("Failed to clear stored logs:", error);
    }
  }

  /**
   * Exports logs for debugging
   */
  exportLogs(): string {
    const logs = this.getStoredLogs();
    return JSON.stringify(logs, null, 2);
  }
}

/**
 * Global enhanced error logger instance
 */
export const enhancedErrorLogger = new EnhancedErrorLogger();

/**
 * Utility functions for common logging scenarios
 */
export const LoggerUtils = {
  /**
   * Logs a user action
   */
  logUserAction(action: string, context?: Record<string, any>): void {
    enhancedErrorLogger.addBreadcrumb({
      category: "user_action",
      message: action,
      level: LogLevel.INFO,
      data: context,
    });
  },

  /**
   * Logs a navigation event
   */
  logNavigation(from: string, to: string): void {
    enhancedErrorLogger.addBreadcrumb({
      category: "navigation",
      message: `Navigation: ${from} → ${to}`,
      level: LogLevel.INFO,
      data: { from, to },
    });
  },

  /**
   * Logs an API call
   */
  logApiCall(
    method: string,
    url: string,
    status?: number,
    duration?: number
  ): void {
    enhancedErrorLogger.addBreadcrumb({
      category: "api",
      message: `${method} ${url}`,
      level: status && status >= 400 ? LogLevel.WARNING : LogLevel.INFO,
      data: { method, url, status, duration },
    });
  },

  /**
   * Logs a form submission
   */
  logFormSubmission(
    formName: string,
    success: boolean,
    errors?: string[]
  ): void {
    enhancedErrorLogger.addBreadcrumb({
      category: "form",
      message: `Form submission: ${formName}`,
      level: success ? LogLevel.INFO : LogLevel.WARNING,
      data: { formName, success, errors },
    });
  },
};
