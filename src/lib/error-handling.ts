/**
 * Centralized Error Handling System
 *
 * Provides standardized error types, utilities, and patterns for consistent
 * error management across all application layers.
 */

import { AuthError } from "firebase/auth";
import { FirestoreError } from "firebase/firestore";

/**
 * Standard error severity levels
 */
export enum ErrorSeverity {
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high",
  CRITICAL = "critical",
}

/**
 * Standard error categories for consistent classification
 */
export enum ErrorCategory {
  AUTHENTICATION = "authentication",
  AUTHORIZATION = "authorization",
  VALIDATION = "validation",
  NETWORK = "network",
  BUSINESS_LOGIC = "business_logic",
  EXTERNAL_API = "external_api",
  SYSTEM = "system",
  USER_INPUT = "user_input",
  UNKNOWN = "unknown",
}

/**
 * Provider-specific error types
 */
export enum ProviderErrorType {
  INITIALIZATION_FAILED = "initialization_failed",
  SUBSCRIPTION_FAILED = "subscription_failed",
  STATE_UPDATE_FAILED = "state_update_failed",
  OPERATION_FAILED = "operation_failed",
  TIMEOUT = "timeout",
  UNKNOWN = "unknown",
}

/**
 * Standard error interface for consistent error objects
 */
export interface StandardError {
  id: string;
  type: string;
  category: ErrorCategory;
  severity: ErrorSeverity;
  message: string;
  userMessage: string;
  timestamp: Date;
  context?: Record<string, any>;
  originalError?: Error;
  stack?: string;
  recoverable: boolean;
  retryable: boolean;
}

/**
 * Provider result type for consistent provider operations
 */
export interface ProviderResult<T> {
  success: boolean;
  data?: T;
  error?: StandardError;
}

/**
 * Error context for additional debugging information
 */
export interface ErrorContext {
  userId?: string;
  action?: string;
  component?: string;
  bookId?: string;
  timestamp?: Date;
  userAgent?: string;
  url?: string;
  metadata?: Record<string, any>;
}

/**
 * Error recovery action definition
 */
export interface ErrorRecoveryAction {
  label: string;
  action: () => void | Promise<void>;
  primary?: boolean;
}

/**
 * Complete error info including recovery actions
 */
export interface ErrorInfo {
  error: StandardError;
  recoveryActions?: ErrorRecoveryAction[];
  dismissible?: boolean;
  autoHide?: boolean;
  autoHideDelay?: number;
}

/**
 * Error builder class for creating standardized errors
 */
export class ErrorBuilder {
  private error: Partial<StandardError> = {};

  constructor(message: string) {
    this.error = {
      id: this.generateErrorId(),
      message,
      userMessage: message,
      timestamp: new Date(),
      recoverable: true,
      retryable: false,
    };
  }

  private generateErrorId(): string {
    return `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  withType(type: string): ErrorBuilder {
    this.error.type = type;
    return this;
  }

  withCategory(category: ErrorCategory): ErrorBuilder {
    this.error.category = category;
    return this;
  }

  withSeverity(severity: ErrorSeverity): ErrorBuilder {
    this.error.severity = severity;
    return this;
  }

  withUserMessage(userMessage: string): ErrorBuilder {
    this.error.userMessage = userMessage;
    return this;
  }

  withContext(context: Record<string, any>): ErrorBuilder {
    this.error.context = { ...this.error.context, ...context };
    return this;
  }

  withOriginalError(originalError: Error): ErrorBuilder {
    this.error.originalError = originalError;
    this.error.stack = originalError.stack;
    return this;
  }

  notRecoverable(): ErrorBuilder {
    this.error.recoverable = false;
    return this;
  }

  retryable(): ErrorBuilder {
    this.error.retryable = true;
    return this;
  }

  build(): StandardError {
    // Set defaults if not provided
    if (!this.error.type) {
      this.error.type = ErrorCategory.UNKNOWN;
    }
    if (!this.error.category) {
      this.error.category = ErrorCategory.UNKNOWN;
    }
    if (!this.error.severity) {
      this.error.severity = ErrorSeverity.MEDIUM;
    }

    return this.error as StandardError;
  }
}

/**
 * Error handler utilities
 */
export class ErrorHandlerUtils {
  /**
   * Creates a standardized error from a Firebase Auth error
   */
  static handleFirebaseAuthError(error: AuthError): StandardError {
    const builder = new ErrorBuilder(error.message)
      .withType(error.code)
      .withCategory(ErrorCategory.AUTHENTICATION)
      .withOriginalError(error);

    // Map specific error codes to user-friendly messages
    switch (error.code) {
      case "auth/popup-blocked":
        return builder
          .withUserMessage(
            "Popup was blocked by your browser. Please allow popups and try again."
          )
          .withSeverity(ErrorSeverity.MEDIUM)
          .retryable()
          .build();

      case "auth/popup-closed-by-user":
        return builder
          .withUserMessage("Sign-in was cancelled. Please try again.")
          .withSeverity(ErrorSeverity.LOW)
          .retryable()
          .build();

      case "auth/network-request-failed":
        return builder
          .withUserMessage(
            "Network error. Please check your connection and try again."
          )
          .withSeverity(ErrorSeverity.MEDIUM)
          .retryable()
          .build();

      case "auth/too-many-requests":
        return builder
          .withUserMessage("Too many failed attempts. Please try again later.")
          .withSeverity(ErrorSeverity.HIGH)
          .build();

      default:
        return builder
          .withUserMessage("Authentication failed. Please try again.")
          .withSeverity(ErrorSeverity.MEDIUM)
          .retryable()
          .build();
    }
  }

  /**
   * Creates a standardized error from a Firestore error
   */
  static handleFirestoreError(error: FirestoreError): StandardError {
    const builder = new ErrorBuilder(error.message)
      .withType(error.code)
      .withCategory(ErrorCategory.SYSTEM)
      .withOriginalError(error);

    // Map specific error codes to user-friendly messages
    switch (error.code) {
      case "permission-denied":
        return builder
          .withUserMessage("You don't have permission to access this data.")
          .withSeverity(ErrorSeverity.HIGH)
          .withCategory(ErrorCategory.AUTHORIZATION)
          .notRecoverable()
          .build();

      case "unavailable":
      case "deadline-exceeded":
        return builder
          .withUserMessage("Service temporarily unavailable. Please try again.")
          .withSeverity(ErrorSeverity.MEDIUM)
          .withCategory(ErrorCategory.NETWORK)
          .retryable()
          .build();

      case "not-found":
        return builder
          .withUserMessage("The requested data could not be found.")
          .withSeverity(ErrorSeverity.LOW)
          .build();

      case "already-exists":
        return builder
          .withUserMessage("This item already exists.")
          .withSeverity(ErrorSeverity.LOW)
          .withCategory(ErrorCategory.VALIDATION)
          .build();

      default:
        return builder
          .withUserMessage("A database error occurred. Please try again.")
          .withSeverity(ErrorSeverity.MEDIUM)
          .retryable()
          .build();
    }
  }

  /**
   * Creates a standardized error from a provider operation
   */
  static handleProviderError(
    type: ProviderErrorType,
    message: string,
    context?: ErrorContext,
    originalError?: Error
  ): StandardError {
    const builder = new ErrorBuilder(message)
      .withType(type)
      .withCategory(ErrorCategory.SYSTEM)
      .withContext(context || {});

    if (originalError) {
      builder.withOriginalError(originalError);
    }

    // Set severity and recovery options based on type
    switch (type) {
      case ProviderErrorType.INITIALIZATION_FAILED:
        return builder
          .withUserMessage("Failed to initialize. Please refresh the page.")
          .withSeverity(ErrorSeverity.HIGH)
          .retryable()
          .build();

      case ProviderErrorType.SUBSCRIPTION_FAILED:
        return builder
          .withUserMessage("Connection lost. Data may not be up to date.")
          .withSeverity(ErrorSeverity.MEDIUM)
          .retryable()
          .build();

      case ProviderErrorType.STATE_UPDATE_FAILED:
        return builder
          .withUserMessage("Update failed. Please try again.")
          .withSeverity(ErrorSeverity.MEDIUM)
          .retryable()
          .build();

      case ProviderErrorType.OPERATION_FAILED:
        return builder
          .withUserMessage("Operation failed. Please try again.")
          .withSeverity(ErrorSeverity.MEDIUM)
          .retryable()
          .build();

      case ProviderErrorType.TIMEOUT:
        return builder
          .withUserMessage("Request timed out. Please try again.")
          .withSeverity(ErrorSeverity.MEDIUM)
          .retryable()
          .build();

      default:
        return builder
          .withUserMessage("An unexpected error occurred.")
          .withSeverity(ErrorSeverity.MEDIUM)
          .build();
    }
  }

  /**
   * Creates a standardized error from a generic error
   */
  static handleGenericError(
    error: Error | string,
    context?: ErrorContext,
    category: ErrorCategory = ErrorCategory.UNKNOWN
  ): StandardError {
    const message = typeof error === "string" ? error : error.message;
    const builder = new ErrorBuilder(message)
      .withCategory(category)
      .withContext(context || {});

    if (typeof error !== "string") {
      builder.withOriginalError(error);
    }

    return builder
      .withUserMessage("An unexpected error occurred. Please try again.")
      .withSeverity(ErrorSeverity.MEDIUM)
      .retryable()
      .build();
  }

  /**
   * Creates a validation error
   */
  static createValidationError(
    fieldName: string,
    validationMessage: string,
    context?: ErrorContext
  ): StandardError {
    return new ErrorBuilder(validationMessage)
      .withType("validation_error")
      .withCategory(ErrorCategory.VALIDATION)
      .withSeverity(ErrorSeverity.LOW)
      .withUserMessage(`${fieldName}: ${validationMessage}`)
      .withContext({ fieldName, ...context })
      .build();
  }

  /**
   * Creates a network error
   */
  static createNetworkError(
    message: string = "Network error occurred",
    context?: ErrorContext
  ): StandardError {
    return new ErrorBuilder(message)
      .withType("network_error")
      .withCategory(ErrorCategory.NETWORK)
      .withSeverity(ErrorSeverity.MEDIUM)
      .withUserMessage(
        "Network error. Please check your connection and try again."
      )
      .withContext(context || {})
      .retryable()
      .build();
  }

  /**
   * Creates a business logic error
   */
  static createBusinessLogicError(
    message: string,
    userMessage: string,
    context?: ErrorContext
  ): StandardError {
    return new ErrorBuilder(message)
      .withType("business_logic_error")
      .withCategory(ErrorCategory.BUSINESS_LOGIC)
      .withSeverity(ErrorSeverity.MEDIUM)
      .withUserMessage(userMessage)
      .withContext(context || {})
      .build();
  }
}

/**
 * Error logging service interface
 */
export interface ErrorLogger {
  logError(error: StandardError, context?: ErrorContext): void;
  logWarning(message: string, context?: ErrorContext): void;
  logInfo(message: string, context?: ErrorContext): void;
}

/**
 * Console-based error logger implementation
 */
export class ConsoleErrorLogger implements ErrorLogger {
  logError(error: StandardError, context?: ErrorContext): void {
    console.group(`🚨 Error: ${error.type}`);
    console.error("Message:", error.message);
    console.error("User Message:", error.userMessage);
    console.error("Category:", error.category);
    console.error("Severity:", error.severity);
    console.error("Timestamp:", error.timestamp);

    if (context) {
      console.error("Context:", context);
    }

    if (error.context) {
      console.error("Error Context:", error.context);
    }

    if (error.originalError) {
      console.error("Original Error:", error.originalError);
    }

    console.groupEnd();
  }

  logWarning(message: string, context?: ErrorContext): void {
    console.warn("⚠️ Warning:", message, context);
  }

  logInfo(message: string, context?: ErrorContext): void {
    console.info("ℹ️ Info:", message, context);
  }
}

/**
 * Global error logger instance
 */
export const errorLogger: ErrorLogger = new ConsoleErrorLogger();

// Re-export enhanced logger for advanced use cases
export { enhancedErrorLogger } from "./error-logging";

/**
 * Helper function to create ProviderResult success response
 */
export function createProviderSuccess<T>(data: T): ProviderResult<T> {
  return {
    success: true,
    data,
  };
}

/**
 * Helper function to create ProviderResult error response
 */
export function createProviderError<T>(
  error: StandardError
): ProviderResult<T> {
  errorLogger.logError(error);
  return {
    success: false,
    error,
  };
}

/**
 * Helper function to safely execute async operations with error handling
 */
export async function safeAsyncOperation<T>(
  operation: () => Promise<T>,
  context?: ErrorContext,
  errorCategory: ErrorCategory = ErrorCategory.UNKNOWN
): Promise<ProviderResult<T>> {
  try {
    const result = await operation();
    return createProviderSuccess(result);
  } catch (error) {
    const standardError = ErrorHandlerUtils.handleGenericError(
      error as Error,
      context,
      errorCategory
    );
    return createProviderError(standardError);
  }
}

/**
 * Helper function to safely execute sync operations with error handling
 */
export function safeSyncOperation<T>(
  operation: () => T,
  context?: ErrorContext,
  errorCategory: ErrorCategory = ErrorCategory.UNKNOWN
): ProviderResult<T> {
  try {
    const result = operation();
    return createProviderSuccess(result);
  } catch (error) {
    const standardError = ErrorHandlerUtils.handleGenericError(
      error as Error,
      context,
      errorCategory
    );
    return createProviderError(standardError);
  }
}
