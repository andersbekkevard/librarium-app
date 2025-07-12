/**
 * Simple Error Logging System
 *
 * Provides basic error logging capabilities with console and localStorage support.
 * Simplified from the previous complex system to focus on essential functionality.
 */

import { ErrorContext, ErrorLogger, StandardError } from "./error-handling";

/**
 * Simple logging configuration
 */
export interface LoggingConfig {
  enableConsole: boolean;
  enableLocalStorage: boolean;
  maxStorageEntries: number;
}

/**
 * Default logging configuration
 */
export const DEFAULT_LOGGING_CONFIG: LoggingConfig = {
  enableConsole: true,
  enableLocalStorage: true,
  maxStorageEntries: 100,
};

/**
 * Log entry structure
 */
export interface LogEntry {
  id: string;
  timestamp: Date;
  level: string;
  message: string;
  context?: ErrorContext;
  error?: StandardError;
  userId?: string;
  sessionId?: string;
}

/**
 * Simple error logger with console and localStorage support
 */
export class SimpleErrorLogger implements ErrorLogger {
  private config: LoggingConfig;
  private sessionId: string;
  private userId?: string;

  constructor(config: LoggingConfig = DEFAULT_LOGGING_CONFIG) {
    this.config = { ...DEFAULT_LOGGING_CONFIG, ...config };
    this.sessionId = this.generateSessionId();
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
   * Logs an error with full context
   */
  logError(error: StandardError, context?: ErrorContext): void {
    this.log("error", error.userMessage, context, error);
  }

  /**
   * Logs a warning message
   */
  logWarning(message: string, context?: ErrorContext): void {
    this.log("warning", message, context);
  }

  /**
   * Logs an info message
   */
  logInfo(message: string, context?: ErrorContext): void {
    this.log("info", message, context);
  }

  /**
   * Main logging method
   */
  private log(
    level: string,
    message: string,
    context?: ErrorContext,
    error?: StandardError
  ): void {
    const logEntry: LogEntry = {
      id: this.generateId(),
      timestamp: new Date(),
      level,
      message,
      context,
      error,
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
  }

  /**
   * Logs to console with appropriate styling
   */
  private logToConsole(entry: LogEntry): void {
    const timestamp = entry.timestamp.toLocaleTimeString();
    const prefix = `[${timestamp}] [${entry.level.toUpperCase()}]`;

    switch (entry.level) {
      case "error":
        console.error(prefix, entry.message);
        if (entry.error) {
          console.error("Error Details:", entry.error);
        }
        if (entry.context) {
          console.error("Context:", entry.context);
        }
        break;
      case "warning":
        console.warn(prefix, entry.message);
        if (entry.context) {
          console.warn("Context:", entry.context);
        }
        break;
      case "info":
        console.info(prefix, entry.message);
        if (entry.context) {
          console.info("Context:", entry.context);
        }
        break;
      default:
        console.log(prefix, entry.message);
    }
  }

  /**
   * Logs to local storage
   */
  private logToLocalStorage(entry: LogEntry): void {
    try {
      const storageKey = "librarium_error_logs";
      const existingLogs = this.getStoredLogs();

      // Add new log entry
      existingLogs.push(entry);

      // Keep only the most recent entries
      if (existingLogs.length > this.config.maxStorageEntries) {
        existingLogs.splice(
          0,
          existingLogs.length - this.config.maxStorageEntries
        );
      }

      localStorage.setItem(storageKey, JSON.stringify(existingLogs));
    } catch (error) {
      // Fail silently for localStorage errors
      console.warn("Failed to save log to localStorage:", error);
    }
  }

  /**
   * Retrieves stored logs from localStorage
   */
  getStoredLogs(): LogEntry[] {
    try {
      const storageKey = "librarium_error_logs";
      const stored = localStorage.getItem(storageKey);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.warn("Failed to retrieve logs from localStorage:", error);
      return [];
    }
  }

  /**
   * Clears stored logs from localStorage
   */
  clearStoredLogs(): void {
    try {
      const storageKey = "librarium_error_logs";
      localStorage.removeItem(storageKey);
    } catch (error) {
      console.warn("Failed to clear logs from localStorage:", error);
    }
  }

  /**
   * Exports logs as JSON string
   */
  exportLogs(): string {
    const logs = this.getStoredLogs();
    return JSON.stringify(logs, null, 2);
  }

  /**
   * Logs user actions for debugging
   */
  logUserAction(action: string, context?: Record<string, any>): void {
    this.logInfo(`User action: ${action}`, {
      action,
      ...context,
    });
  }

  /**
   * Generates a unique session ID
   */
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Generates a unique ID for log entries
   */
  private generateId(): string {
    return `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

/**
 * Global simple error logger instance
 */
export const simpleErrorLogger = new SimpleErrorLogger();

/**
 * Utility functions for common logging operations
 */
export class LoggerUtils {
  /**
   * Log user action
   */
  static logUserAction(action: string, context?: Record<string, any>): void {
    simpleErrorLogger.logUserAction(action, context);
  }

  /**
   * Log navigation events
   */
  static logNavigation(from: string, to: string): void {
    simpleErrorLogger.logInfo(`Navigation: ${from} → ${to}`, {
      metadata: {
        from,
        to,
        type: "navigation",
      },
    });
  }

  /**
   * Log API calls
   */
  static logApiCall(
    method: string,
    url: string,
    status?: number,
    duration?: number
  ): void {
    const message = `API ${method.toUpperCase()} ${url}`;
    simpleErrorLogger.logInfo(message, {
      url,
      metadata: {
        method,
        status,
        duration,
        type: "api_call",
      },
    });
  }
}

// Export the simple logger as the main logger for backwards compatibility
export { simpleErrorLogger as enhancedErrorLogger };
